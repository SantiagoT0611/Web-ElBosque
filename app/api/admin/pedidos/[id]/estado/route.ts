import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/dal"
import { createAdminClient } from "@/lib/supabase/admin"
import { cambiarEstadoSchema } from "@/lib/validations/estado.schema"
import { validarTransicion, estadoPagoAlAplicar } from "@/lib/orders/state-machine"

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/pedidos/[id]/estado">
) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const { id } = await ctx.params
  const body = await request.json()
  const parsed = cambiarEstadoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos." }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: pedido, error: fetchError } = await supabase
    .from("pedidos")
    .select("estado_pedido, tipo_entrega, metodo_pago, estado_pago")
    .eq("id", id)
    .maybeSingle()

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 })
  if (!pedido) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 })

  const validacion = validarTransicion(pedido, parsed.data.estado)
  if (!validacion.ok) {
    return NextResponse.json({ error: validacion.motivo }, { status: validacion.status })
  }

  const nuevoEstadoPago = estadoPagoAlAplicar(pedido, parsed.data.estado)

  const { data: actualizado, error } = await supabase.rpc("aplicar_cambio_estado_pedido", {
    p_pedido_id: id,
    p_estado_nuevo: parsed.data.estado,
    p_estado_pago_nuevo: nuevoEstadoPago,
    p_admin_id: session.userId,
    p_nota: parsed.data.nota || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ pedido: actualizado })
}
