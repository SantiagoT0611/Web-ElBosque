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
import { getEstadoLocal } from "@/lib/format/horario"
import { LocalStatusBadge } from "@/components/public/local-status-badge"

const DENOMINACIONES = [10000, 20000, 50000, 100000] as const

export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const tipoEntregaStore = useCartStore((s) => s.tipoEntrega)
  const setTipoEntregaStore = useCartStore((s) => s.setTipoEntrega)
  const clearCart = useCartStore((s) => s.clear)

  const [mounted, setMounted] = useState(false)
  const [configuracion, setConfiguracion] = useState<ConfiguracionPublica | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [pagoExacto, setPagoExacto] = useState(false)
  const [estimacion, setEstimacion] = useState<{
    distanciaKm: number
    costoDomicilio: number
    lat: number
    lng: number
  } | null>(null)
  const [estimando, setEstimando] = useState(false)
  const [calculoFallido, setCalculoFallido] = useState(false)
  const [ubicacionCompartida, setUbicacionCompartida] = useState<{ lat: number; lng: number } | null>(
    null
  )
  const [solicitandoUbicacion, setSolicitandoUbicacion] = useState(false)

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
      zona_domicilio: undefined,
      metodo_pago: "efectivo",
    },
  })

  useEffect(() => {
    form.setValue("tipo_entrega", tipoEntregaStore)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipoEntregaStore])

  const tipoEntrega = form.watch("tipo_entrega")
  const metodoPago = form.watch("metodo_pago")
  const efectivoPagaCon = form.watch("efectivo_paga_con")
  const quierePropina = form.watch("quiere_propina")
  const zonaDomicilio = form.watch("zona_domicilio")
  const clienteDireccion = form.watch("cliente_direccion")
  const esDomicilio = tipoEntrega === "domicilio"
  const esEfectivo = metodoPago === "efectivo"
  const lines = cartLines(items)
  const subtotal = cartSubtotal(items)
  const zonasDomicilio = configuracion?.zonasDomicilio ?? []
  const calculoAutomaticoDisponible = Boolean(configuracion?.calculoDistanciaDisponible)
  // El selector manual de zona es el mecanismo único cuando el admin nunca
  // configuró el cálculo automático, y el respaldo cuando sí lo configuró
  // pero falló para esta dirección en particular.
  const mostrarSelectorZona =
    esDomicilio && zonasDomicilio.length > 0 && (!calculoAutomaticoDisponible || calculoFallido)
  const recargoZona = zonasDomicilio.find((z) => z.nombre === zonaDomicilio)?.recargo ?? 0
  const costoDomicilio = estimacion
    ? estimacion.costoDomicilio
    : (configuracion?.costoDomicilioDefault ?? 0) + (mostrarSelectorZona && zonaDomicilio ? recargoZona : 0)
  const propina = quierePropina ? Math.round(subtotal * 0.1) : 0
  const total = subtotal + (esDomicilio ? costoDomicilio : 0) + propina
  const estadoLocal = configuracion ? getEstadoLocal(configuracion.horarioAtencion) : null
  const faltaZona = mostrarSelectorZona && !zonaDomicilio
  const faltaEfectivo = esEfectivo && !pagoExacto && (!efectivoPagaCon || efectivoPagaCon < total)
  // Cálculo automático activo, todavía sin resultado y todavía sin haber
  // fallado (esperando el debounce o la respuesta del preview): bloquea el
  // submit para no crear un pedido con un costo de domicilio adivinado.
  const faltaEstimacion = esDomicilio && calculoAutomaticoDisponible && !estimacion && !mostrarSelectorZona

  useEffect(() => {
    if (pagoExacto) {
      form.setValue("efectivo_paga_con", total, { shouldValidate: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagoExacto, total])

  async function estimarDomicilio(body: { cliente_direccion?: string; lat?: number; lng?: number }) {
    setEstimando(true)
    try {
      const res = await fetch("/api/pedidos/estimar-domicilio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (data.disponible) {
        setEstimacion({
          distanciaKm: data.distancia_km,
          costoDomicilio: data.costo_domicilio,
          lat: data.lat,
          lng: data.lng,
        })
        setCalculoFallido(false)
      } else {
        setEstimacion(null)
        setCalculoFallido(true)
      }
    } catch {
      setEstimacion(null)
      setCalculoFallido(true)
    } finally {
      setEstimando(false)
    }
  }

  // Prioridad: ubicación compartida (más precisa) > dirección escrita
  // (debounced). Nunca se muestra el selector de zona mientras aún se está
  // calculando — solo tras confirmar que el cálculo automático falló.
  useEffect(() => {
    if (!esDomicilio || !calculoAutomaticoDisponible) {
      setEstimacion(null)
      setCalculoFallido(false)
      return
    }
    if (ubicacionCompartida) {
      estimarDomicilio({ lat: ubicacionCompartida.lat, lng: ubicacionCompartida.lng })
      return
    }
    if (!clienteDireccion || clienteDireccion.trim().length < 5) {
      setEstimacion(null)
      setCalculoFallido(false)
      return
    }
    const timer = setTimeout(() => {
      estimarDomicilio({ cliente_direccion: clienteDireccion })
    }, 700)
    return () => clearTimeout(timer)
  }, [esDomicilio, calculoAutomaticoDisponible, clienteDireccion, ubicacionCompartida])

  function compartirUbicacion() {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta compartir ubicación.")
      return
    }
    setSolicitandoUbicacion(true)
    navigator.geolocation.getCurrentPosition(
      (posicion) => {
        setUbicacionCompartida({ lat: posicion.coords.latitude, lng: posicion.coords.longitude })
        setSolicitandoUbicacion(false)
      },
      () => {
        setSolicitandoUbicacion(false)
        toast.error("No pudimos acceder a tu ubicación. Seguimos calculando por tu dirección.")
      }
    )
  }

  function elegirTipoEntrega(tipo: "domicilio" | "recoger") {
    form.setValue("tipo_entrega", tipo, { shouldValidate: true })
    if (tipo === "recoger") {
      form.setValue("zona_domicilio", undefined, { shouldValidate: true })
      setUbicacionCompartida(null)
    }
    setTipoEntregaStore(tipo)
  }

  function elegirMetodoPago(metodo: "efectivo" | "transferencia") {
    form.setValue("metodo_pago", metodo, { shouldValidate: true })
    if (metodo === "transferencia") {
      form.setValue("efectivo_paga_con", undefined, { shouldValidate: true })
      setPagoExacto(false)
    }
  }

  async function onSubmit(values: CheckoutFormInput) {
    if (lines.length === 0) return
    setSubmitting(true)
    try {
      const payload = {
        ...values,
        zona_domicilio: mostrarSelectorZona ? values.zona_domicilio : undefined,
        cliente_lat: esDomicilio && !mostrarSelectorZona ? estimacion?.lat : undefined,
        cliente_lng: esDomicilio && !mostrarSelectorZona ? estimacion?.lng : undefined,
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
      <h1 className="mb-4 font-serif text-[clamp(28px,4.4vw,46px)] leading-[1.03]">
        {esDomicilio ? "¿A dónde la llevamos?" : "¿A qué hora la recoges?"}
      </h1>

      {configuracion ? (
        <div className="mb-8">
          <LocalStatusBadge horario={configuracion.horarioAtencion} />
        </div>
      ) : null}

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

              {calculoAutomaticoDisponible ? (
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={compartirUbicacion}
                    disabled={solicitandoUbicacion}
                    className="self-start border border-border px-4 py-2.5 font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
                  >
                    {solicitandoUbicacion
                      ? "Obteniendo ubicación..."
                      : ubicacionCompartida
                        ? "📍 Ubicación compartida"
                        : "📍 Compartir mi ubicación (más preciso)"}
                  </button>
                  {estimando ? (
                    <p className="text-xs text-muted-foreground">Calculando distancia...</p>
                  ) : estimacion ? (
                    <p className="text-xs text-primary">
                      Aprox. {estimacion.distanciaKm} km desde el local — costo de domicilio
                      estimado.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {mostrarSelectorZona ? (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="zona_domicilio">Zona de domicilio</Label>
                  {calculoAutomaticoDisponible ? (
                    <p className="text-xs text-muted-foreground">
                      No pudimos calcular la distancia automáticamente. Elige tu zona:
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {zonasDomicilio.map((zona) => (
                      <button
                        key={zona.nombre}
                        type="button"
                        onClick={() =>
                          form.setValue("zona_domicilio", zona.nombre, { shouldValidate: true })
                        }
                        className={
                          "px-3 py-2 text-left text-xs transition-colors " +
                          (zonaDomicilio === zona.nombre
                            ? "bg-primary text-primary-foreground"
                            : "border border-border text-muted-foreground")
                        }
                      >
                        {zona.nombre}
                        {zona.recargo > 0 ? ` · +${formatCOP(zona.recargo)}` : ""}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
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
                  onClick={() => elegirMetodoPago(metodo)}
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

          {esEfectivo ? (
            <div className="flex flex-col gap-2.5">
              <Label htmlFor="efectivo_paga_con">¿Con cuánto vas a pagar?</Label>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  checked={pagoExacto}
                  onChange={(e) => {
                    const exacto = e.target.checked
                    setPagoExacto(exacto)
                    if (!exacto) form.setValue("efectivo_paga_con", undefined, { shouldValidate: true })
                  }}
                  className="size-4"
                />
                Tengo el valor exacto, no necesito que me devuelvan nada
              </label>

              {!pagoExacto ? (
                <>
                  <div className="grid grid-cols-4 gap-2">
                    {DENOMINACIONES.map((denom) => (
                      <button
                        key={denom}
                        type="button"
                        onClick={() => {
                          const actual = form.getValues("efectivo_paga_con") ?? 0
                          form.setValue("efectivo_paga_con", actual + denom, { shouldValidate: true })
                        }}
                        className="border border-border p-3 text-center font-mono text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        + {formatCOP(denom)}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Input
                      id="efectivo_paga_con"
                      type="number"
                      inputMode="numeric"
                      placeholder="Total con el que pagas"
                      value={efectivoPagaCon ?? ""}
                      onChange={(e) => {
                        const valor = e.target.value === "" ? undefined : Number(e.target.value)
                        form.setValue("efectivo_paga_con", valor, { shouldValidate: true })
                      }}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => form.setValue("efectivo_paga_con", undefined, { shouldValidate: true })}
                      className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:text-destructive"
                    >
                      Limpiar
                    </button>
                  </div>
                </>
              ) : null}

              {form.formState.errors.efectivo_paga_con ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.efectivo_paga_con.message}
                </p>
              ) : pagoExacto ? (
                <p className="text-xs text-primary">Pagas el valor exacto, sin vueltas.</p>
              ) : efectivoPagaCon && efectivoPagaCon >= total ? (
                <p className="text-xs text-primary">
                  Te devolvemos {formatCOP(efectivoPagaCon - total)}
                </p>
              ) : efectivoPagaCon ? (
                <p className="text-xs text-destructive">
                  Aún te faltan {formatCOP(total - efectivoPagaCon)} para cubrir el total.
                </p>
              ) : null}
            </div>
          ) : null}
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
              <span>
                {esDomicilio
                  ? estimacion
                    ? `Envío a domicilio (${estimacion.distanciaKm} km aprox.)`
                    : zonaDomicilio
                      ? `Envío a domicilio (${zonaDomicilio})`
                      : "Envío a domicilio"
                  : "Recoges en tienda"}
              </span>
              <span className="font-mono">{esDomicilio ? formatCOP(costoDomicilio) : "Sin costo"}</span>
            </div>
            <label className="flex cursor-pointer items-center justify-between gap-3 pt-1">
              <span className="flex items-center gap-2">
                <input type="checkbox" {...form.register("quiere_propina")} className="size-4" />
                Agregar propina voluntaria (10%)
              </span>
              {quierePropina ? <span className="font-mono">{formatCOP(propina)}</span> : null}
            </label>
          </div>
          <div className="flex items-baseline justify-between border-t border-primary/30 pt-3.5">
            <span className="font-serif text-xl">Total</span>
            <span className="font-mono text-2xl text-primary">{formatCOP(total)}</span>
          </div>
          {estadoLocal && !estadoLocal.abierto ? (
            <p className="text-center text-xs text-destructive">
              El local está cerrado ahora mismo. {estadoLocal.mensaje}.
            </p>
          ) : null}
          {faltaZona ? (
            <p className="text-center text-xs text-destructive">Selecciona tu zona de domicilio.</p>
          ) : null}
          {faltaEstimacion ? (
            <p className="text-center text-xs text-destructive">
              {clienteDireccion && clienteDireccion.trim().length >= 5
                ? "Calculando el costo de domicilio..."
                : "Escribe tu dirección para calcular el costo de domicilio."}
            </p>
          ) : null}
          {faltaEfectivo && !efectivoPagaCon ? (
            <p className="text-center text-xs text-destructive">
              Indica con cuánto vas a pagar en efectivo.
            </p>
          ) : null}
          <button
            type="submit"
            disabled={
              submitting ||
              !!(estadoLocal && !estadoLocal.abierto) ||
              faltaZona ||
              faltaEfectivo ||
              faltaEstimacion
            }
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
