import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { crearPedidoSchema } from "@/lib/validations/pedido.schema"

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = crearPedidoSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos de pedido inválidos.", detalles: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("crear_pedido", {
    payload: parsed.data,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ codigo_seguimiento: data.codigo_seguimiento }, { status: 201 })
}
