import { Star } from "lucide-react"
import { motion } from "framer-motion"

import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface Hero7Props {
  heading?: string
  description?: string
  button?: {
    text: string
    url: string
  }
  reviews?: {
    count: number
    rating?: number
    avatars: {
      src: string
      alt: string
    }[]
  }
}

const Hero7 = ({
  heading = "Премиум шаблоны для продуктивности",
  description = "Стильные профессиональные шаблоны для повышения продуктивности и оптимизации рабочего процесса. Готовы к использованию, легко настраиваются.",
  button = {
    text: "Смотреть шаблоны",
    url: "#",
  },
  reviews = {
    count: 500,
    rating: 4.9,
    avatars: [
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
        alt: "Avatar 1",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
        alt: "Avatar 2",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
        alt: "Avatar 3",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-4.webp",
        alt: "Avatar 4",
      },
      {
        src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-5.webp",
        alt: "Avatar 5",
      },
    ],
  },
}: Hero7Props) => {
  return (
    <section className="py-32">
      <div className="container text-center">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <motion.h1
            className="text-3xl font-extrabold lg:text-6xl font-heading text-balance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 0.2,
            }}
          >
            {heading}
          </motion.h1>
          <motion.p
            className="text-muted-foreground text-balance lg:text-lg font-sans"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              delay: 0.4,
            }}
          >
            {description}
          </motion.p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.6,
          }}
        >
          <Button asChild size="lg" className="mt-10">
            <a href={button.url}>{button.text}</a>
          </Button>
        </motion.div>
        <motion.div
          className="mx-auto mt-10 flex w-fit flex-col items-center gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
            delay: 0.8,
          }}
        >
          <span className="mx-4 inline-flex items-center -space-x-4">
            {reviews.avatars.map((avatar, index) => (
              <Avatar key={index} className="size-14 border">
                <AvatarImage src={avatar.src || "/placeholder.svg"} alt={avatar.alt} />
              </Avatar>
            ))}
          </span>
          <div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                <Star key={index} className="size-5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="mr-1 font-semibold">{reviews.rating?.toFixed(1)}</span>
            </div>
            <p className="text-muted-foreground text-left font-medium">{reviews.count}+ отзывов</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export { Hero7 }
