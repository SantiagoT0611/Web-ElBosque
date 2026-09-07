"use client"

import Image from "next/image"
import { Minus, Plus } from "lucide-react"
import { formatCOP } from "@/lib/format/currency"
import { useCartStore } from "@/store/cart-store"
import type { Tables } from "@/lib/types/database.types"

export function ProductCard({ producto }: { producto: Tables<"productos"> }) {
  const cantidad = useCartStore((s) => s.items[producto.id]?.cantidad ?? 0)
  const add = useCartStore((s) => s.add)
  const increment = useCartStore((s) => s.increment)
  const decrement = useCartStore((s) => s.decrement)

  return (
    <div className="flex flex-col border border-border bg-card">
      <div className="relative flex h-[210px] items-center justify-center bg-stripe-placeholder">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            className="object-cover"
          />
        ) : (
          <span className="px-3 text-center font-mono text-[10px] tracking-[0.14em] text-primary/50">
            FOTO — {producto.nombre}
          </span>
        )}
        {producto.etiqueta ? (
          <span className="absolute top-3 left-3 bg-primary px-2.5 py-1 font-mono text-[9px] font-bold tracking-[0.16em] text-primary-foreground">
            {producto.etiqueta}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2.5 p-5">
        <div className="flex items-baseline justify-between gap-3">
          <span className="font-serif text-[25px] leading-[1.1]">{producto.nombre}</span>
          <span className="font-mono text-[15px] text-primary">{formatCOP(producto.precio)}</span>
        </div>
        <p className="flex-1 text-sm leading-relaxed text-muted-foreground">
          {producto.descripcion}
        </p>
        {cantidad > 0 ? (
          <div className="mt-1 flex items-center justify-between border border-primary p-2">
            <button
              type="button"
              onClick={() => decrement(producto.id)}
              className="flex size-8 items-center justify-center bg-primary/15 text-primary"
              aria-label="Quitar una unidad"
            >
              <Minus className="size-4" />
            </button>
            <span className="font-mono text-[13px] font-bold tracking-[0.1em] text-primary">
              {cantidad} EN EL CARRITO
            </span>
            <button
              type="button"
              onClick={() => increment(producto.id)}
              className="flex size-8 items-center justify-center bg-primary/15 text-primary"
              aria-label="Añadir una unidad"
            >
              <Plus className="size-4" />
            </button>
          </div>
        ) : (
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
            className="mt-1 bg-primary p-3.5 text-center font-display text-xs font-bold tracking-[0.12em] uppercase text-primary-foreground transition-colors hover:bg-gold-light"
          >
            Añadir al carrito
          </button>
        )}
      </div>
    </div>
  )
}
