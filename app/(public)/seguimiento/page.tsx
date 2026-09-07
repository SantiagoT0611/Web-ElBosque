"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function SeguimientoPage() {
  const router = useRouter()
  const [codigo, setCodigo] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const limpio = codigo.trim().toUpperCase()
    if (limpio) router.push(`/seguimiento/${encodeURIComponent(limpio)}`)
  }

  return (
    <div className="mx-auto max-w-[520px] px-5 py-20 sm:px-7">
      <span className="eyebrow">Seguimiento</span>
      <h1 className="mt-2.5 mb-6 font-serif text-[clamp(28px,4vw,42px)] leading-none">
        ¿Cuál es tu pedido?
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="EB-7K9XPQ2R"
          className="h-12 w-full border border-input bg-muted px-3.5 font-mono text-[15px] uppercase outline-none focus-visible:border-primary"
        />
        <button
          type="submit"
          className="bg-primary p-4 text-center font-display text-xs font-bold tracking-[0.12em] uppercase text-primary-foreground transition-colors hover:bg-gold-light"
        >
          Ver estado del pedido
        </button>
      </form>
      <p className="mt-4 text-sm text-muted-foreground">
        El código de seguimiento te lo mostramos al confirmar tu pedido.
      </p>
    </div>
  )
}
