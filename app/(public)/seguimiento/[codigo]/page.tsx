import { notFound } from "next/navigation"
import { getPedidoPorCodigo } from "@/lib/data/pedidos"
import { existeResenaParaPedido } from "@/lib/data/resenas"
import { PedidoResumen } from "@/components/public/pedido-resumen"
import { ResenaForm } from "@/components/public/resena-form"
import { PedidoAutoRefresh } from "@/components/public/pedido-auto-refresh"

export default async function SeguimientoDetallePage(
  props: PageProps<"/seguimiento/[codigo]">
) {
  const { codigo } = await props.params
  const pedido = await getPedidoPorCodigo(codigo)

  if (!pedido) notFound()

  const puedeResenar =
    pedido.estado_pedido === "entregado" && !(await existeResenaParaPedido(pedido.id))

  return (
    <div className="mx-auto max-w-[900px] px-5 py-14 sm:px-7">
      <PedidoAutoRefresh />
      <div className="mb-9">
        <span className="eyebrow">Seguimiento</span>
        <h1 className="mt-2.5 font-serif text-[clamp(28px,4vw,42px)] leading-none">
          Pedido {pedido.codigo_seguimiento}
        </h1>
      </div>
      <PedidoResumen pedido={pedido} />
      {puedeResenar ? (
        <div className="mt-7">
          <ResenaForm codigoSeguimiento={pedido.codigo_seguimiento} />
        </div>
      ) : null}
    </div>
  )
}
