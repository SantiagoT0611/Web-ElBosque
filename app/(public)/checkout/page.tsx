"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { checkoutFormSchema, type CheckoutFormInput } from "@/lib/validations/pedido.schema"
import { cartLines, cartSubtotal, useCartStore } from "@/store/cart-store"
import { formatCOP } from "@/lib/format/currency"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { ConfiguracionPublica } from "@/lib/data/configuracion"

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const tipoEntregaStore = useCartStore((s) => s.tipoEntrega)
  const setTipoEntregaStore = useCartStore((s) => s.setTipoEntrega)
  const clearCart = useCartStore((s) => s.clear)

  const [mounted, setMounted] = useState(false)
  const [configuracion, setConfiguracion] = useState<ConfiguracionPublica | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetch("/api/configuracion")
      .then((r) => r.json())
      .then(setConfiguracion)
      .catch(() => {})
  }, [])

  const form = useForm<CheckoutFormInput>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      cliente_nombre: "",
      cliente_telefono: "",
      cliente_email: "",
      cliente_notas: "",
      tipo_entrega: tipoEntregaStore,
      cliente_direccion: "",
      cliente_barrio: "",
      cliente_referencia: "",
      metodo_pago: "efectivo",
    },
  })

  useEffect(() => {
    form.setValue("tipo_entrega", tipoEntregaStore)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoEntregaStore])

  const tipoEntrega = form.watch("tipo_entrega")
  const metodoPago = form.watch("metodo_pago")
  const esDomicilio = tipoEntrega === "domicilio"
  const lines = cartLines(items)
  const subtotal = cartSubtotal(items)
  const costoDomicilio = configuracion?.costoDomicilioDefault ?? 0
  const total = subtotal + (esDomicilio ? costoDomicilio : 0)

  function elegirTipoEntrega(tipo: "domicilio" | "recoger") {
    form.setValue("tipo_entrega", tipo, { shouldValidate: true })
    setTipoEntregaStore(tipo)
  }

  async function onSubmit(values: CheckoutFormInput) {
    if (lines.length === 0) return
    setSubmitting(true)
    try {
      const payload = {
        ...values,
        items: lines.map((l) => ({ producto_id: l.productoId, cantidad: l.cantidad })),
      }
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "No se pudo crear el pedido.")
      clearCart()
      router.push(`/pedido/confirmacion/${data.codigo_seguimiento}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ocurrió un error creando tu pedido.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted) return null

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-[600px] px-5 py-24 text-center sm:px-7">
        <p className="text-lg text-muted-foreground">Tu carrito está vacío.</p>
        <Link
          href="/#carta"
          className="mt-6 inline-block bg-primary px-7 py-3.5 font-display text-xs font-bold tracking-[0.1em] text-primary-foreground uppercase transition-colors hover:bg-gold-light"
        >
          Ver la carta
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1120px] px-5 py-10 sm:px-7 sm:py-14">
      <Link
        href="/"
        className="mb-6 inline-block font-mono text-[11px] tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
      >
        ← VOLVER A LA CARTA
      </Link>
      <div className="mb-7 flex gap-2.5 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
        <span className="text-primary">1 CARRITO</span>
        <span>—</span>
        <span className="text-primary">2 DATOS DE ENTREGA</span>
        <span>—</span>
        <span>3 CONFIRMACIÓN</span>
      </div>
      <h1 className="mb-8 font-serif text-[clamp(28px,4.4vw,46px)] leading-[1.03]">
        {esDomicilio ? "¿A dónde la llevamos?" : "¿A qué hora la recoges?"}
      </h1>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 items-start gap-7 lg:grid-cols-2"
      >
        <div className="flex flex-col gap-4.5 border border-border p-6 sm:p-7">
          <div className="font-mono text-[10px] tracking-[0.24em] text-primary uppercase">
            {esDomicilio ? "Datos de entrega" : "Datos de recogida"}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => elegirTipoEntrega("recoger")}
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
            </button>
            <button
              type="button"
              onClick={() => elegirTipoEntrega("domicilio")}
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
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cliente_nombre">Nombre completo</Label>
            <Input id="cliente_nombre" placeholder="Camila Restrepo" {...form.register("cliente_nombre")} />
            {form.formState.errors.cliente_nombre ? (
              <p className="text-xs text-destructive">{form.formState.errors.cliente_nombre.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cliente_telefono">Teléfono</Label>
            <Input id="cliente_telefono" placeholder="310 555 0118" {...form.register("cliente_telefono")} />
            {form.formState.errors.cliente_telefono ? (
              <p className="text-xs text-destructive">{form.formState.errors.cliente_telefono.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cliente_email">Correo (opcional)</Label>
            <Input id="cliente_email" placeholder="camila@correo.com" {...form.register("cliente_email")} />
          </div>

          {esDomicilio ? (
            <>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cliente_direccion">Dirección</Label>
                <Input
                  id="cliente_direccion"
                  placeholder="Calle 45 #12-08, apto 302"
                  {...form.register("cliente_direccion")}
                />
                {form.formState.errors.cliente_direccion ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.cliente_direccion.message}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cliente_barrio">Barrio</Label>
                <Input id="cliente_barrio" placeholder="Chapinero" {...form.register("cliente_barrio")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="cliente_referencia">Referencia</Label>
                <Input
                  id="cliente_referencia"
                  placeholder="Portería, torre, punto de referencia…"
                  {...form.register("cliente_referencia")}
                />
              </div>
            </>
          ) : configuracion ? (
            <div className="border border-dashed border-primary/40 p-4 text-sm leading-relaxed text-muted-foreground">
              Recoges en <strong className="text-primary">{configuracion.direccion}</strong>. Te
              avisamos cuando esté lista.
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cliente_notas">Notas (opcional)</Label>
            <Textarea id="cliente_notas" rows={3} {...form.register("cliente_notas")} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="metodo_pago">Medio de pago</Label>
            <div className="grid grid-cols-2 gap-2">
              {(["efectivo", "transferencia"] as const).map((metodo) => (
                <button
                  key={metodo}
                  type="button"
                  onClick={() => form.setValue("metodo_pago", metodo, { shouldValidate: true })}
                  className={
                    "p-3 text-center capitalize transition-colors " +
                    (metodoPago === metodo
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground")
                  }
                >
                  <div className="font-display text-xs font-bold tracking-[0.08em] uppercase">
                    {metodo}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border border-primary/30 bg-card p-6 sm:p-7">
          <div className="flex items-baseline justify-between">
            <span className="font-mono text-[10px] tracking-[0.24em] text-primary uppercase">
              Tu pedido
            </span>
            <Link href="/" className="font-mono text-[10px] tracking-[0.14em] text-muted-foreground">
              EDITAR
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {lines.map((l) => (
              <div
                key={l.productoId}
                className="flex items-baseline justify-between gap-3.5 border-b border-border pb-3"
              >
                <span className="text-[15px]">
                  <span className="font-mono text-primary">{l.cantidad}×</span> {l.nombre}
                </span>
                <span className="font-mono text-sm text-muted-foreground">
                  {formatCOP(l.precio * l.cantidad)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono">{formatCOP(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>{esDomicilio ? "Envío a domicilio" : "Recoges en tienda"}</span>
              <span className="font-mono">{esDomicilio ? formatCOP(costoDomicilio) : "Sin costo"}</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between border-t border-primary/30 pt-3.5">
            <span className="font-serif text-xl">Total</span>
            <span className="font-mono text-2xl text-primary">{formatCOP(total)}</span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary p-4 text-center font-display text-xs font-bold tracking-[0.12em] uppercase text-primary-foreground transition-colors hover:bg-gold-light disabled:opacity-50"
          >
            {submitting ? "Enviando..." : "Confirmar pedido"}
          </button>
          <span className="text-center text-[11px] leading-relaxed text-muted-foreground/70">
            {esDomicilio
              ? "Entrega estimada 25-40 min"
              : "Lista para recoger en unos 25 min"}
          </span>
        </div>
      </form>
    </div>
  )
}
