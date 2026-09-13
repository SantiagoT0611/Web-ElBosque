import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/dal"
import { getConfiguracion } from "@/lib/data/configuracion"
import { createAdminClient } from "@/lib/supabase/admin"
import { configuracionSchema } from "@/lib/validations/configuracion.schema"

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const configuracion = await getConfiguracion()
  return NextResponse.json({ configuracion })
}

export async function PUT(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const body = await request.json()
  const parsed = configuracionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos.", detalles: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("configuracion_restaurante")
    .update({
      ...parsed.data,
      direccion: parsed.data.direccion || null,
      telefono: parsed.data.telefono || null,
      banco_nombre: parsed.data.banco_nombre || null,
      banco_tipo_cuenta: parsed.data.banco_tipo_cuenta || null,
      banco_numero_cuenta: parsed.data.banco_numero_cuenta || null,
      banco_titular: parsed.data.banco_titular || null,
      banco_documento: parsed.data.banco_documento || null,
    })
    .eq("id", 1)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ configuracion: data })
}

export async function PATCH(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const body = (await request.json()) as {
    qr_transferencia_url?: string
    fotos_panoramicas?: string[]
  }
  const updates: { qr_transferencia_url?: string | null; fotos_panoramicas?: string[] } = {}
  if ("qr_transferencia_url" in body) updates.qr_transferencia_url = body.qr_transferencia_url || null
  if ("fotos_panoramicas" in body) {
    const fotos = (body.fotos_panoramicas ?? []).filter((url) => url)
    if (fotos.length > 4) {
      return NextResponse.json({ error: "Máximo 4 fotos de portada." }, { status: 400 })
    }
    updates.fotos_panoramicas = fotos
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("configuracion_restaurante")
    .update(updates)
    .eq("id", 1)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ configuracion: data })
}
