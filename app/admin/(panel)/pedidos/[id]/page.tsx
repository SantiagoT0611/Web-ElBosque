import { notFound } from "next/navigation"
import Link from "next/link"
import { getPedidoAdminPorId } from "@/lib/data/pedidos-admin"
import { StatusBadge } from "@/components/shared/status-badge"
import { OrderStatusStepper } from "@/components/public/order-status-stepper"
import { PedidoAcciones } from "@/components/admin/pedido-acciones"
import { DevolucionDialog } from "@/components/admin/devolucion-dialog"
import { RealtimeRefresh } from "@/components/admin/realtime-refresh"
import { formatCOP } from "@/lib/format/currency"

export default async function AdminPedidoDetallePage(props: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await props.params
  const pedido = await getPedidoAdminPorId(id)
  if (!pedido) notFound()

  const historial = [...pedido.historial_estado_pedido].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return (
    <div className="p-8">
      <RealtimeRefresh />
      <Link
        href="/admin/pedidos"
        className="mb-6 inline-block font-mono text-[11px] tracking-[0.16em] text-muted-foreground transition-colors hover:text-primary"
      >
        ← VOLVER A PEDIDOS
      </Link>

      <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
        <div>
          <span className="font-mono text-xl font-bold text-primary">{pedido.codigo_seguimiento}</span>
          <div className="mt-1 text-sm text-muted-foreground">
            {new Date(pedido.created_at).toLocaleString("es-CO")}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge estado={pedido.estado_pedido} />
          {pedido.devoluciones ? (
            <span className="border border-destructive bg-transparent px-2.5 py-1 font-mono text-[10px] tracking-[0.1em] text-destructive uppercase">
              Devuelto
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col gap-6">
          <div className="border border-border p-6">
            <div className="mb-3 font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
              Datos del cliente
            </div>
            <dl className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Nombre</dt>
                <dd>{pedido.cliente_nombre}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Teléfono</dt>
                <dd>{pedido.cliente_telefono}</dd>
              </div>
              {pedido.cliente_email ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Correo</dt>
                  <dd>{pedido.cliente_email}</dd>
                </div>
              ) : null}
              {pedido.tipo_entrega === "domicilio" ? (
                <>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Dirección</dt>
                    <dd className="text-right">{pedido.cliente_direccion}</dd>
                  </div>
                  {pedido.cliente_barrio ? (
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Barrio</dt>
                      <dd>{pedido.cliente_barrio}</dd>
                    </div>
                  ) : null}
                  {pedido.cliente_referencia ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Referencia</dt>
                      <dd className="text-right">{pedido.cliente_referencia}</dd>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Entrega</dt>
                  <dd>Recoge en tienda</dd>
                </div>
              )}
              {pedido.cliente_notas ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Notas</dt>
                  <dd className="text-right">{pedido.cliente_notas}</dd>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-border pt-2.5">
                <dt className="text-muted-foreground">Método de pago</dt>
                <dd className="capitalize">{pedido.metodo_pago}</dd>
              </div>
              {pedido.metodo_pago === "efectivo" && pedido.efectivo_paga_con != null ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Paga con</dt>
                  <dd className="font-mono">
                    {formatCOP(pedido.efectivo_paga_con)} · cambio{" "}
                    {formatCOP(pedido.efectivo_paga_con - pedido.total)}
                  </dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Estado del pago</dt>
                <dd className="uppercase">{pedido.estado_pago.replace("_", " ")}</dd>
              </div>
            </dl>
          </div>

          <div className="border border-border p-6">
            <div className="mb-3 font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
              Detalle del pedido
            </div>
            <div className="flex flex-col gap-2.5">
              {pedido.detalle_pedido.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 text-sm">
                  <span>
                    <span className="font-mono text-primary">{item.cantidad}×</span>{" "}
                    {item.producto_nombre}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {formatCOP(item.subtotal_linea)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-3.5 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono">{formatCOP(pedido.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Domicilio</span>
                <span className="font-mono">{formatCOP(pedido.costo_domicilio)}</span>
              </div>
              {pedido.propina > 0 ? (
                <div className="flex justify-between">
                  <span>Propina</span>
                  <span className="font-mono">{formatCOP(pedido.propina)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-base text-foreground">
                <span className="font-serif text-lg">Total</span>
                <span className="font-mono text-lg text-primary">{formatCOP(pedido.total)}</span>
              </div>
            </div>
          </div>

          {historial.length > 0 ? (
            <div className="border border-border p-6">
              <div className="mb-3 font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
                Historial
              </div>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                {historial.map((h) => (
                  <div key={h.id} className="flex justify-between gap-3">
                    <span>
                      {h.estado_anterior ? `${h.estado_anterior} → ` : ""}
                      <span className="text-foreground">{h.estado_nuevo}</span>
                    </span>
                    <span className="font-mono text-xs">
                      {new Date(h.created_at).toLocaleString("es-CO")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-border p-6">
            <div className="mb-4 font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
              Progreso
            </div>
            <OrderStatusStepper estado={pedido.estado_pedido} tipoEntrega={pedido.tipo_entrega} />
          </div>
          <PedidoAcciones pedido={pedido} />
          {pedido.estado_pedido === "entregado" ? (
            <div className="border border-border p-6">
              <div className="mb-3 font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
                Devolución
              </div>
              {pedido.devoluciones ? (
                <p className="text-sm text-muted-foreground">{pedido.devoluciones.motivo}</p>
              ) : (
                <DevolucionDialog pedidoId={pedido.id} />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
