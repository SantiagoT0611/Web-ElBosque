"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

const INTERVALO_MS = 5000

export function HeroCarousel({ fotos, alt }: { fotos: string[]; alt: string }) {
  const [indice, setIndice] = useState(0)

  useEffect(() => {
    if (fotos.length <= 1) return
    const id = setInterval(() => setIndice((i) => (i + 1) % fotos.length), INTERVALO_MS)
    return () => clearInterval(id)
  }, [fotos.length])

  return (
    <>
      {fotos.map((foto, i) => (
        <Image
          key={foto}
          src={foto}
          alt={alt}
          fill
          priority={i === 0}
          className={`object-cover transition-opacity duration-1000 ${
            i === indice ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      {fotos.length > 1 ? (
        <div className="absolute top-4 right-4 z-10 flex gap-1.5">
          {fotos.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Ver foto ${i + 1}`}
              onClick={() => setIndice(i)}
              className={`size-1.5 rounded-full transition-colors ${
                i === indice ? "bg-primary" : "bg-primary/30 hover:bg-primary/60"
              }`}
            />
          ))}
        </div>
      ) : null}
    </>
  )
}
