"use client"

import Image from "next/image"
import { formatCOP } from "@/lib/format/currency"
import { useCartStore } from "@/store/cart-store"
import type { Tables } from "@/lib/types/database.types"

export function SideItemCard({ producto }: { producto: Tables<"productos"> }) {
  const cantidad = useCartStore((s) => s.items[producto.id]?.cantidad ?? 0)
  const add = useCartStore((s) => s.add)

  return (
    <div className="flex items-center gap-4 border border-border bg-card p-3.5">
      <div className="relative flex size-[84px] shrink-0 items-center justify-center overflow-hidden bg-stripe-placeholder p-1 text-center font-mono text-[8px] text-primary/50">
        {producto.imagen_url ? (
          <Image src={producto.imagen_url} alt={producto.nombre} fill className="object-cover" />
        ) : (
          "FOTO"
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2.5">
          <span className="font-serif text-xl">{producto.nombre}</span>
          <span className="font-mono text-sm text-primary">{formatCOP(producto.precio)}</span>
        </div>
        <p className="text-[13px] leading-relaxed text-muted-foreground">{producto.descripcion}</p>
        <button
          type="button"
          onClick={() =>
            add({
              id: producto.id,
              nombre: producto.nombre,
              precio: producto.precio,
              imagenUrl: producto.imagen_url,
            })
          }
          className="mt-0.5 self-start border border-primary px-3.5 py-2 font-mono text-[10px] font-bold tracking-[0.14em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          AÑADIR{cantidad > 0 ? ` · ${cantidad}` : ""}
        </button>
      </div>
    </div>
  )
}
