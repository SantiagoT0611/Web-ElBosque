import { notFound } from "next/navigation"
import { getPedidoPorCodigo } from "@/lib/data/pedidos"
import { PedidoResumen } from "@/components/public/pedido-resumen"

export default async function SeguimientoDetallePage(
  props: PageProps<"/seguimiento/[codigo]">
) {
  const { codigo } = await props.params
  const pedido = await getPedidoPorCodigo(codigo)

  if (!pedido) notFound()

  return (
    <div className="mx-auto max-w-[900px] px-5 py-14 sm:px-7">
      <div className="mb-9">
        <span className="eyebrow">Seguimiento</span>
        <h1 className="mt-2.5 font-serif text-[clamp(28px,4vw,42px)] leading-none">
          Pedido {pedido.codigo_seguimiento}
        </h1>
      </div>
      <PedidoResumen pedido={pedido} />
    </div>
  )
}
