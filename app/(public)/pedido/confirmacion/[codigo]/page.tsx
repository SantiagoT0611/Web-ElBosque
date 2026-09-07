import { notFound } from "next/navigation"
import Link from "next/link"
import { getPedidoPorCodigo } from "@/lib/data/pedidos"
import { PedidoResumen } from "@/components/public/pedido-resumen"

export default async function ConfirmacionPage(
  props: PageProps<"/pedido/confirmacion/[codigo]">
) {
  const { codigo } = await props.params
  const pedido = await getPedidoPorCodigo(codigo)

  if (!pedido) notFound()

  return (
    <div className="mx-auto max-w-[900px] px-5 py-14 sm:px-7">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-5 flex size-[70px] items-center justify-center border border-primary font-serif text-3xl text-primary">
          ✓
        </div>
        <span className="eyebrow">Pedido {pedido.codigo_seguimiento}</span>
        <h1 className="mt-3.5 font-serif text-[clamp(28px,4.6vw,44px)] leading-[1.05]">
          Estamos encendiendo la parrilla
        </h1>
        <p className="mx-auto mt-3.5 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
          {pedido.tipo_entrega === "domicilio"
            ? "Te avisamos por WhatsApp cuando el pedido salga. Guarda este enlace para ver el estado."
            : "Pregunta por tu número de pedido en el mostrador. Guarda este enlace para ver el estado."}
        </p>
      </div>

      <PedidoResumen pedido={pedido} />

      <div className="mt-9 flex flex-wrap justify-center gap-2.5">
        <Link
          href="/"
          className="bg-primary px-7 py-3.5 font-display text-xs font-bold tracking-[0.1em] text-primary-foreground uppercase transition-colors hover:bg-gold-light"
        >
          Volver a la carta
        </Link>
        <Link
          href={`/seguimiento/${pedido.codigo_seguimiento}`}
          className="border border-border px-7 py-3.5 font-display text-xs font-bold tracking-[0.1em] text-foreground uppercase transition-colors hover:border-primary hover:text-primary"
        >
          Ver seguimiento
        </Link>
      </div>
    </div>
  )
}
