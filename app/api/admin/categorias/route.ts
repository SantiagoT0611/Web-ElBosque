import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/dal"
import { createAdminClient } from "@/lib/supabase/admin"
import { categoriaSchema, generarSlug } from "@/lib/validations/categoria.schema"

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const supabase = createAdminClient()
  const { data, error } = await supabase.from("categorias").select("*").order("orden", { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ categorias: data })
}

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const body = await request.json()
  const parsed = categoriaSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos.", detalles: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("categorias")
    .insert({ ...parsed.data, slug: parsed.data.slug || generarSlug(parsed.data.nombre) })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ categoria: data }, { status: 201 })
}
