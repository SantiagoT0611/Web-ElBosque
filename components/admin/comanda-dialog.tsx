"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCOP } from "@/lib/format/currency"
import type { PedidoCompleto } from "@/lib/data/pedidos"

export function ComandaDialog({
  pedido,
  open,
  onOpenChange,
}: {
  pedido: PedidoCompleto
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const esDomicilio = pedido.tipo_entrega === "domicilio"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-normal">
            Comanda — {pedido.codigo_seguimiento}
          </DialogTitle>
        </DialogHeader>

        <div id="comanda-imprimible" className="flex flex-col gap-3 font-mono text-[13px]">
          <div className="border-b border-dashed border-border pb-2 text-center">
            <div className="text-sm font-bold uppercase">El Bosque Hamburguesería</div>
            <div className="text-[11px] text-muted-foreground">Comanda de cocina</div>
          </div>

          <div className="flex justify-between">
            <span className="text-muted-foreground">Pedido</span>
            <span className="font-bold">{pedido.codigo_seguimiento}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Hora</span>
            <span>{new Date(pedido.created_at).toLocaleString("es-CO")}</span>
          </div>
          <div className="border border-foreground px-2 py-1 text-center text-sm font-bold uppercase">
            {esDomicilio ? "Domicilio" : "Recoge en tienda"}
          </div>

          <div className="border-t border-dashed border-border pt-2">
            <div className="mb-1 text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
              Cliente
            </div>
            <div>{pedido.cliente_nombre}</div>
            <div>{pedido.cliente_telefono}</div>
            {esDomicilio ? (
              <>
                <div>
                  {pedido.cliente_direccion}
                  {pedido.cliente_barrio ? `, ${pedido.cliente_barrio}` : ""}
                </div>
                {pedido.distancia_km != null ? (
                  <div>Distancia: {pedido.distancia_km} km aprox.</div>
                ) : pedido.zona_domicilio ? (
                  <div>Zona: {pedido.zona_domicilio}</div>
                ) : null}
                {pedido.cliente_referencia ? <div>Ref: {pedido.cliente_referencia}</div> : null}
              </>
            ) : null}
          </div>

          {pedido.cliente_notas ? (
            <div className="border-t border-dashed border-border pt-2">
              <div className="mb-1 text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
                Notas
              </div>
              <div>{pedido.cliente_notas}</div>
            </div>
          ) : null}

          <div className="border-t border-dashed border-border pt-2">
            <div className="mb-1 text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
              Pedido
            </div>
            <div className="flex flex-col gap-1">
              {pedido.detalle_pedido.map((item) => (
                <div key={item.id}>
                  {item.cantidad}× {item.producto_nombre}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-dashed border-border pt-2">
            <div className="mb-1 text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
              Pago
            </div>
            <div className="uppercase">{pedido.metodo_pago}</div>
            {pedido.metodo_pago === "efectivo" && pedido.efectivo_paga_con != null ? (
              <div>
                Paga con {formatCOP(pedido.efectivo_paga_con)} · cambio{" "}
                {formatCOP(pedido.efectivo_paga_con - pedido.total)}
              </div>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="bg-primary p-3.5 text-center font-display text-xs font-bold tracking-[0.12em] uppercase text-primary-foreground transition-colors hover:bg-gold-light"
        >
          Imprimir comanda
        </button>
      </DialogContent>
    </Dialog>
  )
}
