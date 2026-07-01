import json
import os
import hashlib
import smtplib
import psycopg2
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from urllib.parse import parse_qs


def calculate_signature(*args) -> str:
    """Создание MD5 подписи по документации Robokassa"""
    joined = ':'.join(str(arg) for arg in args)
    return hashlib.md5(joined.encode()).hexdigest().upper()


def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not configured')
    return psycopg2.connect(dsn)


def send_key_email(to_email: str, order_number: str, items: list):
    """Отправляет письмо с игровыми ключами покупателю"""
    smtp_email = os.environ.get('SMTP_EMAIL')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    if not smtp_email or not smtp_password:
        print("SMTP not configured, skipping email")
        return

    items_html = ""
    for item in items:
        items_html += f"""
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-weight:600">{item['name']}</td>
          <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-align:center">
            <code style="background:#f3f4f6;padding:6px 12px;border-radius:6px;font-size:16px;letter-spacing:1px;font-weight:700;color:#4f46e5">{item['game_key'] or 'Ключ будет выдан в течение 24 часов'}</code>
          </td>
        </tr>"""

    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif">
      <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">
        <div style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:32px;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px">🎮 Ваш заказ оплачен!</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Заказ {order_number}</p>
        </div>
        <div style="padding:32px">
          <p style="color:#374151;margin:0 0 24px;font-size:15px">Спасибо за покупку! Вот ваши игровые ключи:</p>
          <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden">
            <thead>
              <tr style="background:#f9fafb">
                <th style="padding:10px 16px;text-align:left;color:#6b7280;font-size:13px;font-weight:600">Игра</th>
                <th style="padding:10px 16px;text-align:center;color:#6b7280;font-size:13px;font-weight:600">Ключ активации</th>
              </tr>
            </thead>
            <tbody>{items_html}</tbody>
          </table>
          <div style="margin-top:24px;padding:16px;background:#f0fdf4;border-radius:10px;border:1px solid #bbf7d0">
            <p style="margin:0;color:#15803d;font-size:14px">✅ Активируйте ключ в соответствующем клиенте (Steam, Xbox, PlayStation и т.д.)</p>
          </div>
          <p style="color:#9ca3af;font-size:13px;margin:24px 0 0;text-align:center">Возникли вопросы? Ответьте на это письмо — поможем!</p>
        </div>
      </div>
    </body>
    </html>"""

    msg = MIMEMultipart('alternative')
    msg['Subject'] = f'🎮 Ваши игровые ключи — заказ {order_number}'
    msg['From'] = smtp_email
    msg['To'] = to_email
    msg.attach(MIMEText(html, 'html', 'utf-8'))

    with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
        server.login(smtp_email, smtp_password)
        server.sendmail(smtp_email, to_email, msg.as_bytes())

    print(f"Email sent to {to_email} for order {order_number}")


HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'text/plain'
}


def handler(event: dict, context) -> dict:
    '''
    Result URL вебхук от Robokassa: подтверждает оплату и отправляет ключи на email.
    Robokassa отправляет: OutSum, InvId, SignatureValue
    Returns: OK{InvId} если подпись верна и заказ обновлён
    '''
    method = event.get('httpMethod', 'GET').upper()

    if method == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': '', 'isBase64Encoded': False}

    password_2 = os.environ.get('ROBOKASSA_PASSWORD_2')
    if not password_2:
        return {'statusCode': 500, 'headers': HEADERS, 'body': 'Configuration error', 'isBase64Encoded': False}

    params = {}
    body = event.get('body', '')

    if method == 'POST' and body:
        if event.get('isBase64Encoded', False):
            import base64
            body = base64.b64decode(body).decode('utf-8')
        parsed = parse_qs(body)
        params = {k: v[0] for k, v in parsed.items()}

    if not params:
        params = event.get('queryStringParameters') or {}

    out_sum = params.get('OutSum', params.get('out_summ', ''))
    inv_id = params.get('InvId', params.get('inv_id', ''))
    signature_value = params.get('SignatureValue', params.get('crc', '')).upper()

    if not out_sum or not inv_id or not signature_value:
        return {'statusCode': 400, 'headers': HEADERS, 'body': 'Missing required parameters', 'isBase64Encoded': False}

    expected_signature = calculate_signature(out_sum, inv_id, password_2)
    if signature_value != expected_signature:
        return {'statusCode': 400, 'headers': HEADERS, 'body': 'Invalid signature', 'isBase64Encoded': False}

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        UPDATE orders
        SET status = 'paid', paid_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE robokassa_inv_id = %s AND status = 'pending'
        RETURNING id, order_number, user_email
    """, (int(inv_id),))

    result = cur.fetchone()

    if not result:
        cur.execute("SELECT status FROM orders WHERE robokassa_inv_id = %s", (int(inv_id),))
        existing = cur.fetchone()
        conn.close()
        if existing and existing[0] == 'paid':
            return {'statusCode': 200, 'headers': HEADERS, 'body': f'OK{inv_id}', 'isBase64Encoded': False}
        return {'statusCode': 404, 'headers': HEADERS, 'body': 'Order not found', 'isBase64Encoded': False}

    order_id, order_number, user_email = result

    cur.execute("""
        SELECT product_name, game_key FROM order_items WHERE order_id = %s
    """, (order_id,))
    items = [{'name': row[0], 'game_key': row[1]} for row in cur.fetchall()]

    conn.commit()
    cur.close()
    conn.close()

    try:
        send_key_email(user_email, order_number, items)
    except Exception as e:
        print(f"Email send error: {e}")

    return {'statusCode': 200, 'headers': HEADERS, 'body': f'OK{inv_id}', 'isBase64Encoded': False}
