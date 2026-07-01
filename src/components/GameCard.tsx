import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"
import { PaymentButton } from "@/components/extensions/robokassa/PaymentButton"
import { isValidEmail } from "@/components/extensions/robokassa/useRobokassa"

interface Game {
  id: string
  title: string
  platform: string
  price: number
  image: string
  genre: string
  rating: number
}

interface GameCardProps {
  game: Game
  robokassaUrl: string
}

export function GameCard({ game, robokassaUrl }: GameCardProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", phone: "" })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Введите имя"
    if (!form.email.trim() || !isValidEmail(form.email)) e.email = "Введите корректный email"
    if (!form.phone.trim()) e.phone = "Введите телефон"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (
    <>
      <motion.div
        className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-sm w-full"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 1 }}
        whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
      >
        <div className="relative">
          <img src={game.image} alt={game.title} className="w-full h-48 object-cover" />
          <span className="absolute top-3 left-3 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {game.platform}
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900 leading-tight">{game.title}</h3>
            <div className="flex items-center gap-1 shrink-0 text-yellow-500">
              <Icon name="Star" size={14} />
              <span className="text-sm font-semibold text-gray-700">{game.rating}</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-4">{game.genre}</p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-extrabold text-indigo-600">{game.price} ₽</span>
            <Button
              onClick={() => setOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Купить ключ
            </Button>
          </div>
        </div>
      </motion.div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Оформление заказа</h2>
                <p className="text-sm text-gray-500">{game.title} — {game.price} ₽</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <Icon name="X" size={20} />
              </button>
            </div>

            <div className="space-y-4 mb-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input
                  type="text"
                  placeholder="Иван Иванов"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                <p className="text-xs text-gray-400 mt-1">На этот адрес придёт ключ после оплаты</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <input
                  type="tel"
                  placeholder="+7 999 000 00 00"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 border-gray-300"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 mb-5 flex items-center gap-2 text-sm text-gray-600">
              <Icon name="ShieldCheck" size={16} className="text-green-500 shrink-0" />
              Ключ придёт на почту сразу после оплаты
            </div>

            <PaymentButton
              apiUrl={robokassaUrl}
              amount={game.price}
              userName={form.name}
              userEmail={form.email}
              userPhone={form.phone}
              cartItems={[{ id: game.id, name: game.title, price: game.price, quantity: 1 }]}
              successUrl={window.location.origin + "?payment=success"}
              failUrl={window.location.origin + "?payment=fail"}
              onError={(err) => alert("Ошибка: " + err.message)}
              buttonText={`Оплатить ${game.price} ₽`}
              disabled={false}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors cursor-pointer"
            />
          </motion.div>
        </div>
      )}
    </>
  )
}
