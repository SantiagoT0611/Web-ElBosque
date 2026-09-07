import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/dal"
import { createAdminClient } from "@/lib/supabase/admin"
import { verificarPagoSchema } from "@/lib/validations/estado.schema"

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/pedidos/[id]/pago">
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const { id } = await ctx.params
  const body = await request.json()
  const parsed = verificarPagoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("pedidos")
    .update({ estado_pago: parsed.data.estado_pago })
    .eq("id", id)
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 })

  return NextResponse.json({ pedido: data })
}
