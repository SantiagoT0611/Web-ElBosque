import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { resenaSchema } from "@/lib/validations/resena.schema"
import { existeResenaParaPedido } from "@/lib/data/resenas"

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = resenaSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos de reseña inválidos.", detalles: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .select("id, cliente_nombre, estado_pedido")
    .eq("codigo_seguimiento", parsed.data.codigo_seguimiento.toUpperCase())
    .maybeSingle()

  if (pedidoError) return NextResponse.json({ error: pedidoError.message }, { status: 500 })
  if (!pedido) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 })
  if (pedido.estado_pedido !== "entregado") {
    return NextResponse.json(
      { error: "Solo puedes dejar una reseña una vez que el pedido fue entregado." },
      { status: 400 }
    )
  }
  if (await existeResenaParaPedido(pedido.id)) {
    return NextResponse.json(
      { error: "Ya dejaste una reseña para este pedido." },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("resenas")
    .insert({
      pedido_id: pedido.id,
      producto_id: parsed.data.producto_id ?? null,
      cliente_nombre: pedido.cliente_nombre,
      calificacion: parsed.data.calificacion,
      comentario: parsed.data.comentario,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ resena: data }, { status: 201 })
}
