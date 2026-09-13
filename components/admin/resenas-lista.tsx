"use client"

import { useOptimistic, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Star } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { Tables } from "@/lib/types/database.types"

export function ResenasLista({
  resenasIniciales,
}: {
  resenasIniciales: Tables<"resenas">[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [resenas, toggleOptimistic] = useOptimistic(
    resenasIniciales,
    (state, id: string) => state.map((r) => (r.id === id ? { ...r, aprobado: !r.aprobado } : r))
  )

  function toggleAprobado(resena: Tables<"resenas">) {
    startTransition(async () => {
      toggleOptimistic(resena.id)
      await fetch(`/api/admin/resenas/${resena.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aprobado: !resena.aprobado }),
      })
      router.refresh()
    })
  }

  if (resenas.length === 0) {
    return (
      <div className="border border-border p-10 text-center text-muted-foreground">
        Todavía no hay reseñas de clientes.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2.5">
      {resenas.map((resena) => (
        <div
          key={resena.id}
          className="flex flex-col gap-3 border border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between"
        >
          <div className="flex flex-1 flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <span className="text-[15px] font-medium">{resena.cliente_nombre}</span>
              <span className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={
                      n <= resena.calificacion
                        ? "size-3.5 fill-primary text-primary"
                        : "size-3.5 text-muted-foreground"
                    }
                  />
                ))}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {new Date(resena.created_at).toLocaleDateString("es-CO")}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{resena.comentario}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Switch checked={resena.aprobado} onCheckedChange={() => toggleAprobado(resena)} />
            <span className="text-xs text-muted-foreground">
              {resena.aprobado ? "Publicada" : "Oculta"}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
