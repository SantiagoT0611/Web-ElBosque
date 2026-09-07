import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(
  _request: Request,
  ctx: RouteContext<"/api/pedidos/seguimiento/[codigo]/reportar-pago">
) {
  const { codigo } = await ctx.params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("pedidos")
    .update({ pago_reportado_cliente_at: new Date().toISOString() })
    .eq("codigo_seguimiento", codigo.toUpperCase())
    .select("codigo_seguimiento")
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  if (!data) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
