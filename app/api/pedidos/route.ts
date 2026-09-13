import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { crearPedidoSchema } from "@/lib/validations/pedido.schema"
import { getConfiguracion } from "@/lib/data/configuracion"
import { getEstadoLocal } from "@/lib/format/horario"

export async function POST(request: Request) {
  const body = await request.json()
  const parsed = crearPedidoSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos de pedido inválidos.", detalles: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const configuracion = await getConfiguracion()
  const horario = (configuracion.horario_atencion ?? {}) as Record<string, string>
  const estadoLocal = getEstadoLocal(horario)
  if (!estadoLocal.abierto) {
    return NextResponse.json(
      { error: `El local está cerrado ahora mismo. ${estadoLocal.mensaje}.` },
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
