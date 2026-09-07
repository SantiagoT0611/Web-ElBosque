import Link from "next/link"
import { formatCOP } from "@/lib/format/currency"
import { StatusBadge } from "@/components/shared/status-badge"
import type { PedidoCompleto } from "@/lib/data/pedidos"

export function OrderRow({ pedido }: { pedido: PedidoCompleto }) {
  const hora = new Date(pedido.created_at).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  })
  const resumen = pedido.detalle_pedido
    .map((item) => `${item.cantidad}× ${item.producto_nombre}`)
    .join(", ")

  return (
    <Link
      href={`/admin/pedidos/${pedido.id}`}
      className="grid grid-cols-2 gap-3.5 border border-border bg-card p-5 transition-colors hover:border-primary/50 sm:grid-cols-4 lg:grid-cols-6"
    >
      <div className="flex flex-col gap-1">
        <span className="font-mono text-[13px] font-bold text-primary">
          {pedido.codigo_seguimiento}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {hora} · {pedido.tipo_entrega === "domicilio" ? "DOMICILIO" : "RECOGE"}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[15px] font-medium">{pedido.cliente_nombre}</span>
        <span className="font-mono text-xs text-muted-foreground">{pedido.cliente_telefono}</span>
      </div>
      <div className="text-[13px] leading-relaxed text-muted-foreground sm:col-span-2 lg:col-span-2">
        {resumen}
      </div>
      <div className="font-mono text-lg text-foreground">{formatCOP(pedido.total)}</div>
      <div className="flex items-center justify-start gap-2 sm:justify-end">
        <StatusBadge estado={pedido.estado_pedido} />
      </div>
    </Link>
  )
}
