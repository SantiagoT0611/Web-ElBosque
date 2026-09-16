"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { siguientesEstadosPosibles, type EstadoPedido } from "@/lib/orders/state-machine"
import type { PedidoCompleto } from "@/lib/data/pedidos"
import { ComandaDialog } from "@/components/admin/comanda-dialog"

const ACCION_LABEL: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmar",
  preparando: "Pasar a preparando",
  en_ruta: "Enviar (en ruta)",
  listo_para_recoger: "Marcar listo para recoger",
  entregado: "Marcar entregado",
  cancelado: "Cancelar pedido",
}

const ESTADO_NOMBRE: Record<EstadoPedido, string> = {
  pendiente: "pendiente",
  confirmado: "confirmado",
  preparando: "preparando",
  en_ruta: "en ruta",
  listo_para_recoger: "listo para recoger",
  entregado: "entregado",
  cancelado: "cancelado",
}

export function PedidoAcciones({ pedido }: { pedido: PedidoCompleto }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [comandaAbierta, setComandaAbierta] = useState(false)
  const esperandoComanda = useRef(false)

  const siguientes = siguientesEstadosPosibles(pedido.estado_pedido, pedido.tipo_entrega)
  const bloqueadoPorPago =
    pedido.metodo_pago === "transferencia" && pedido.estado_pago !== "confirmado"
  const yaConfirmado = pedido.estado_pedido !== "pendiente" && pedido.estado_pedido !== "cancelado"

  // Al confirmar, la respuesta del PATCH no trae detalle_pedido — se espera
  // a que router.refresh() traiga el `pedido` completo (prop nuevo) antes de
  // abrir la comanda, en vez de armarla con datos incompletos.
  useEffect(() => {
    if (esperandoComanda.current && pedido.estado_pedido === "confirmado") {
      esperandoComanda.current = false
      setComandaAbierta(true)
    }
  }, [pedido.estado_pedido])

  async function cambiarEstado(estado: EstadoPedido) {
    setLoading(estado)
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "No se pudo cambiar el estado.")
      toast.success(`Pedido actualizado a "${ESTADO_NOMBRE[estado]}".`)
      if (estado === "confirmado") esperandoComanda.current = true
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ocurrió un error.")
    } finally {
      setLoading(null)
    }
  }

  async function verificarPago(estado_pago: "confirmado" | "rechazado") {
    setLoading(estado_pago)
    try {
      const res = await fetch(`/api/admin/pedidos/${pedido.id}/pago`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado_pago }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "No se pudo actualizar el pago.")
      toast.success(estado_pago === "confirmado" ? "Pago verificado." : "Pago rechazado.")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Ocurrió un error.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {yaConfirmado ? (
        <button
          type="button"
          onClick={() => setComandaAbierta(true)}
          className="self-start border border-border px-4 py-2.5 font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:border-primary hover:text-primary"
        >
          Reimprimir comanda
        </button>
      ) : null}
      <ComandaDialog pedido={pedido} open={comandaAbierta} onOpenChange={setComandaAbierta} />

      {pedido.metodo_pago === "transferencia" && pedido.estado_pago !== "confirmado" ? (
        <div className="border border-primary/30 bg-card p-5">
          <div className="mb-3 font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
            Verificación de pago
          </div>
          <p className="mb-3.5 text-sm text-muted-foreground">
            Estado del pago:{" "}
            <span className="text-foreground uppercase">{pedido.estado_pago.replace("_", " ")}</span>
            {pedido.pago_reportado_cliente_at
              ? " · el cliente ya avisó que pagó"
              : " · el cliente aún no ha avisado"}
          </p>
          <div className="flex gap-2.5">
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => verificarPago("confirmado")}
              className="flex-1 bg-primary p-3 text-center font-display text-xs font-bold tracking-[0.1em] uppercase text-primary-foreground transition-colors hover:bg-gold-light disabled:opacity-50"
            >
              Verificar pago
            </button>
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => verificarPago("rechazado")}
              className="flex-1 border border-destructive/50 p-3 text-center font-display text-xs font-bold tracking-[0.1em] text-destructive uppercase transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              Rechazar pago
            </button>
          </div>
        </div>
      ) : null}

      <div className="border border-border bg-card p-5">
        <div className="mb-3 font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
          Cambiar estado
        </div>
        {siguientes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Este pedido no tiene más transiciones posibles.</p>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {siguientes.map((estado) => {
              const esConfirmar = estado === "confirmado"
              const deshabilitado = loading !== null || (esConfirmar && bloqueadoPorPago)
              const esCancelar = estado === "cancelado"
              return (
                <button
                  key={estado}
                  type="button"
                  disabled={deshabilitado}
                  onClick={() => cambiarEstado(estado)}
                  title={
                    esConfirmar && bloqueadoPorPago
                      ? "Verifica el pago antes de confirmar el pedido."
                      : undefined
                  }
                  className={
                    "px-4 py-2.5 font-display text-xs font-bold tracking-[0.08em] uppercase transition-colors disabled:opacity-40 " +
                    (esCancelar
                      ? "border border-destructive/50 text-destructive hover:bg-destructive/10"
                      : "bg-primary text-primary-foreground hover:bg-gold-light")
                  }
                >
                  {ACCION_LABEL[estado]}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
