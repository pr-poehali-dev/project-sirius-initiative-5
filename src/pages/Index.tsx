import { Navbar } from "@/components/Navbar"
import { Hero7 } from "@/components/Hero7"
import { GameCard } from "@/components/GameCard"

const func2url = (window as unknown as { func2url?: Record<string, string> }).func2url ?? {}
const ROBOKASSA_URL = func2url.robokassa ?? ""

const testGame = {
  id: "cyberpunk-2077",
  title: "Cyberpunk 2077",
  platform: "Steam",
  price: 999,
  image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
  genre: "RPG / Экшен / Открытый мир",
  rating: 4.8,
}

const Index = () => {
  return (
    <div className="min-h-screen w-full relative">
      {/* Radial Gradient Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <main className="lg:mx-12">
          <Hero7 />

          {/* Game Cards */}
          <section className="pb-24 flex justify-center px-4">
            <GameCard game={testGame} robokassaUrl={ROBOKASSA_URL} />
          </section>
        </main>
      </div>
    </div>
  )
}

export default Index