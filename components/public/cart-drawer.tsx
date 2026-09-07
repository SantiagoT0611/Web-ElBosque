"use client"

import { useRouter } from "next/navigation"
import { Minus, Plus, X } from "lucide-react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { formatCOP } from "@/lib/format/currency"
import { cartLines, cartSubtotal, useCartStore } from "@/store/cart-store"

export function CartDrawer() {
  const router = useRouter()
  const isOpen = useCartStore((s) => s.isOpen)
  const close = useCartStore((s) => s.close)
  const items = useCartStore((s) => s.items)
  const tipoEntrega = useCartStore((s) => s.tipoEntrega)
  const setTipoEntrega = useCartStore((s) => s.setTipoEntrega)
  const increment = useCartStore((s) => s.increment)
  const decrement = useCartStore((s) => s.decrement)
  const remove = useCartStore((s) => s.remove)

  const lines = cartLines(items)
  const subtotal = cartSubtotal(items)
  const esDomicilio = tipoEntrega === "domicilio"
  const costoEnvioEstimado = 6000
  const total = subtotal + (esDomicilio && subtotal > 0 ? costoEnvioEstimado : 0)

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? null : close())}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-l border-primary/30 bg-background p-0 sm:max-w-[430px]"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <SheetTitle className="font-serif text-2xl font-normal text-foreground">
            Tu carrito
          </SheetTitle>
          <button type="button" onClick={close} aria-label="Cerrar carrito">
            <X className="size-5 text-muted-foreground" />
          </button>
        </div>

        <div className="border-b border-border px-6 py-4">
          <div className="eyebrow mb-2.5">¿Cómo lo quieres?</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setTipoEntrega("recoger")}
              className={
                "p-3 text-center transition-colors " +
                (!esDomicilio
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground")
              }
            >
              <div className="font-display text-xs font-bold tracking-[0.08em] uppercase">
                Recoger en tienda
              </div>
              <div className="mt-1 font-mono text-[10px] opacity-75">SIN COSTO · 25 MIN</div>
            </button>
            <button
              type="button"
              onClick={() => setTipoEntrega("domicilio")}
              className={
                "p-3 text-center transition-colors " +
                (esDomicilio
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground")
              }
            >
              <div className="font-display text-xs font-bold tracking-[0.08em] uppercase">
                A domicilio
              </div>
              <div className="mt-1 font-mono text-[10px] opacity-75">
                {formatCOP(costoEnvioEstimado)} envío · 25-40 min
              </div>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {lines.length === 0 ? (
            <div className="py-12 text-center text-[15px] leading-relaxed text-muted-foreground">
              Todavía no has añadido nada.
              <br />
              Explora la carta para empezar.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {lines.map((line) => (
                <div key={line.productoId} className="flex items-center gap-3.5">
                  <div className="flex size-[62px] shrink-0 items-center justify-center bg-stripe-placeholder font-mono text-[8px] text-primary/50">
                    FOTO
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-baseline justify-between gap-2.5">
                      <span className="font-serif text-lg">{line.nombre}</span>
                      <span className="font-mono text-[13px] text-primary">
                        {formatCOP(line.precio * line.cantidad)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => decrement(line.productoId)}
                        className="flex size-[26px] items-center justify-center border border-border"
                        aria-label="Quitar una unidad"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="min-w-4 text-center font-mono text-xs font-bold">
                        {line.cantidad}
                      </span>
                      <button
                        type="button"
                        onClick={() => increment(line.productoId)}
                        className="flex size-[26px] items-center justify-center border border-border"
                        aria-label="Añadir una unidad"
                      >
                        <Plus className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(line.productoId)}
                        className="ml-auto font-mono text-[10px] tracking-[0.12em] text-muted-foreground"
                      >
                        QUITAR
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 border-t border-primary/30 px-6 py-5">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-mono">{formatCOP(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{esDomicilio ? "Envío a domicilio" : "Recoges en tienda"}</span>
            <span className="font-mono">
              {esDomicilio ? formatCOP(costoEnvioEstimado) : "Sin costo"}
            </span>
          </div>
          <div className="flex items-baseline justify-between border-t border-border pt-3">
            <span className="font-serif text-xl">Total</span>
            <span className="font-mono text-2xl text-primary">{formatCOP(total)}</span>
          </div>
          <button
            type="button"
            disabled={lines.length === 0}
            onClick={() => {
              close()
              router.push("/checkout")
            }}
            className="bg-primary p-4 text-center font-display text-xs font-bold tracking-[0.12em] uppercase text-primary-foreground transition-colors hover:bg-gold-light disabled:pointer-events-none disabled:opacity-40"
          >
            {esDomicilio ? "Continuar con datos de entrega" : "Continuar con la recogida"}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
