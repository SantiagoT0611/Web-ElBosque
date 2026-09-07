import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/dal"
import { createAdminClient } from "@/lib/supabase/admin"
import { productoSchema } from "@/lib/validations/producto.schema"

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("productos")
    .select("*, categorias(nombre)")
    .order("orden", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ productos: data })
}

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const body = await request.json()
  const parsed = productoSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos.", detalles: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("productos")
    .insert({
      ...parsed.data,
      descripcion: parsed.data.descripcion || null,
      imagen_url: parsed.data.imagen_url || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ producto: data }, { status: 201 })
}
