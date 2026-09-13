import Image from "next/image"
import { formatCOP } from "@/lib/format/currency"
import { StatusBadge } from "@/components/shared/status-badge"
import { OrderStatusStepper } from "@/components/public/order-status-stepper"
import { ReportarPagoButton } from "@/components/public/reportar-pago-button"
import { getConfiguracionPublica } from "@/lib/data/configuracion"
import type { PedidoCompleto } from "@/lib/data/pedidos"

export async function PedidoResumen({ pedido }: { pedido: PedidoCompleto }) {
  const mostrarPago =
    pedido.metodo_pago === "transferencia" && pedido.estado_pago !== "confirmado"
  const configuracion = mostrarPago ? await getConfiguracionPublica() : null

  return (
    <div className="grid grid-cols-1 gap-7 lg:grid-cols-[1.1fr_1fr]">
      <div className="flex flex-col gap-7">
        <div className="border border-border p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-lg font-bold tracking-[0.05em] text-primary">
              {pedido.codigo_seguimiento}
            </span>
            <StatusBadge estado={pedido.estado_pedido} />
          </div>
          <OrderStatusStepper estado={pedido.estado_pedido} tipoEntrega={pedido.tipo_entrega} />
        </div>

        {mostrarPago && configuracion ? (
          <div className="border border-primary/30 bg-card p-6">
            <div className="mb-4 font-mono text-[10px] tracking-[0.24em] text-primary uppercase">
              Paga tu pedido por transferencia
            </div>
            {configuracion.qrTransferenciaUrl ? (
              <div className="mb-4 flex justify-center">
                <Image
                  src={configuracion.qrTransferenciaUrl}
                  alt="Código QR para pago"
                  width={200}
                  height={200}
                />
              </div>
            ) : null}
            <dl className="flex flex-col gap-1.5 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <dt>Banco</dt>
                <dd className="text-foreground">{configuracion.banco.nombre}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Tipo de cuenta</dt>
                <dd className="text-foreground">{configuracion.banco.tipoCuenta}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Número</dt>
                <dd className="font-mono text-foreground">{configuracion.banco.numeroCuenta}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Titular</dt>
                <dd className="text-foreground">{configuracion.banco.titular}</dd>
              </div>
              <div className="flex justify-between border-t border-border pt-2.5 text-base">
                <dt className="text-foreground">Valor exacto</dt>
                <dd className="font-mono text-primary">{formatCOP(pedido.total)}</dd>
              </div>
            </dl>
            {pedido.pago_reportado_cliente_at ? (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                Ya avisaste que pagaste — el restaurante está verificando tu transferencia.
              </p>
            ) : (
              <div className="mt-5">
                <ReportarPagoButton codigo={pedido.codigo_seguimiento} />
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 border border-border bg-card p-6">
        <div className="font-mono text-[10px] tracking-[0.24em] text-primary uppercase">
          Tu pedido
        </div>
        <div className="flex flex-col gap-3">
          {pedido.detalle_pedido.map((item) => (
            <div
              key={item.id}
              className="flex items-baseline justify-between gap-3.5 border-b border-border pb-3"
            >
              <span className="text-[15px]">
                <span className="font-mono text-primary">{item.cantidad}×</span> {item.producto_nombre}
              </span>
              <span className="font-mono text-sm text-muted-foreground">
                {formatCOP(item.subtotal_linea)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="font-mono">{formatCOP(pedido.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>{pedido.tipo_entrega === "domicilio" ? "Domicilio" : "Recoges en tienda"}</span>
            <span className="font-mono">
              {pedido.tipo_entrega === "domicilio" ? formatCOP(pedido.costo_domicilio) : "Sin costo"}
            </span>
          </div>
          {pedido.propina > 0 ? (
            <div className="flex justify-between">
              <span>Propina</span>
              <span className="font-mono">{formatCOP(pedido.propina)}</span>
            </div>
          ) : null}
        </div>
        <div className="flex items-baseline justify-between border-t border-primary/30 pt-3.5">
          <span className="font-serif text-xl">Total</span>
          <span className="font-mono text-2xl text-primary">{formatCOP(pedido.total)}</span>
        </div>
        <div className="mt-2 flex flex-col gap-1.5 border-t border-border pt-4 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Cliente</span>
            <span className="text-foreground">{pedido.cliente_nombre}</span>
          </div>
          <div className="flex justify-between">
            <span>Teléfono</span>
            <span className="text-foreground">{pedido.cliente_telefono}</span>
          </div>
          {pedido.tipo_entrega === "domicilio" ? (
            <div className="flex justify-between gap-3">
              <span>Dirección</span>
              <span className="text-right text-foreground">
                {pedido.cliente_direccion}
                {pedido.cliente_barrio ? `, ${pedido.cliente_barrio}` : ""}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between">
            <span>Método de pago</span>
            <span className="text-foreground capitalize">{pedido.metodo_pago}</span>
          </div>
          {pedido.metodo_pago === "efectivo" && pedido.efectivo_paga_con != null ? (
            <div className="flex justify-between">
              <span>Paga con</span>
              <span className="font-mono text-foreground">
                {formatCOP(pedido.efectivo_paga_con)} · cambio{" "}
                {formatCOP(pedido.efectivo_paga_con - pedido.total)}
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
