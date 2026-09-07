import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/pedidos/seguimiento/[codigo]">
) {
  const { codigo } = await ctx.params
  const supabase = createAdminClient()

  const { data: pedido, error } = await supabase
    .from("pedidos")
    .select("*, detalle_pedido(*), historial_estado_pedido(*)")
    .eq("codigo_seguimiento", codigo.toUpperCase())
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!pedido) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 })
  }

  return NextResponse.json({ pedido })
}
