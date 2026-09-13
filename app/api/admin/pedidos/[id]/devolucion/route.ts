import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/dal"
import { createAdminClient } from "@/lib/supabase/admin"
import { devolucionSchema } from "@/lib/validations/devolucion.schema"

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/pedidos/[id]/devolucion">
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const { id } = await ctx.params
  const body = await request.json()
  const parsed = devolucionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: pedido, error: pedidoError } = await supabase
    .from("pedidos")
    .select("estado_pedido")
    .eq("id", id)
    .maybeSingle()

  if (pedidoError) return NextResponse.json({ error: pedidoError.message }, { status: 500 })
  if (!pedido) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 })
  if (pedido.estado_pedido !== "entregado") {
    return NextResponse.json(
      { error: "Solo se puede registrar una devolución sobre un pedido ya entregado." },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("devoluciones")
    .insert({ pedido_id: id, motivo: parsed.data.motivo, registrado_por: session.userId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ devolucion: data }, { status: 201 })
}
