"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function ResenaForm({ codigoSeguimiento }: { codigoSeguimiento: string }) {
  const [calificacion, setCalificacion] = useState(0)
  const [comentario, setComentario] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  async function enviar() {
    if (calificacion === 0) {
      toast.error("Selecciona una calificación.")
      return
    }
    setEnviando(true)
    try {
      const res = await fetch("/api/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo_seguimiento: codigoSeguimiento,
          calificacion,
          comentario,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setEnviado(true)
      toast.success("¡Gracias por tu reseña!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo enviar tu reseña.")
    } finally {
      setEnviando(false)
    }
  }

  if (enviado) {
    return (
      <div className="border border-primary/30 bg-card p-6 text-center text-sm text-muted-foreground">
        Ya enviamos tu reseña — el equipo la revisa antes de publicarla. ¡Gracias por contarnos!
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 border border-border bg-card p-6">
      <div className="font-mono text-[10px] tracking-[0.24em] text-primary uppercase">
        Deja tu reseña
      </div>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setCalificacion(n)}
            aria-label={`${n} estrellas`}
            className="p-0.5"
          >
            <Star
              className={
                n <= calificacion
                  ? "size-6 fill-primary text-primary"
                  : "size-6 text-muted-foreground"
              }
            />
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="comentario">Cuéntanos cómo te fue</Label>
        <Textarea
          id="comentario"
          rows={3}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="La hamburguesa llegó caliente y a tiempo..."
        />
      </div>
      <button
        type="button"
        disabled={enviando || comentario.trim().length < 10}
        onClick={enviar}
        className="bg-primary p-3.5 text-center font-display text-xs font-bold tracking-[0.12em] uppercase text-primary-foreground transition-colors hover:bg-gold-light disabled:opacity-50"
      >
        {enviando ? "Enviando..." : "Enviar reseña"}
      </button>
    </div>
  )
}
