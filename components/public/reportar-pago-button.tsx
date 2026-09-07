"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function ReportarPagoButton({ codigo }: { codigo: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch(`/api/pedidos/seguimiento/${codigo}/reportar-pago`, {
        method: "PATCH",
      })
      if (!res.ok) throw new Error()
      toast.success("Gracias, le avisamos al restaurante que ya pagaste.")
      router.refresh()
    } catch {
      toast.error("No pudimos registrar tu pago. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full bg-primary p-4 text-center font-display text-xs font-bold tracking-[0.12em] uppercase text-primary-foreground transition-colors hover:bg-gold-light disabled:opacity-50"
    >
      {loading ? "Enviando..." : "Ya realicé el pago"}
    </button>
  )
}
