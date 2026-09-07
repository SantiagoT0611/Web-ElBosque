import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/dal"
import { createAdminClient } from "@/lib/supabase/admin"
import { categoriaSchema } from "@/lib/validations/categoria.schema"

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/categorias/[id]">) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const { id } = await ctx.params
  const body = await request.json()
  const parsed = categoriaSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos.", detalles: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("categorias")
    .update(parsed.data)
    .eq("id", id)
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Categoría no encontrada." }, { status: 404 })
  return NextResponse.json({ categoria: data })
}

/** Archivado suave (activo=false): no rompe productos que la referencian. */
export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/categorias/[id]">) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const { id } = await ctx.params
  const supabase = createAdminClient()
  const { error } = await supabase.from("categorias").update({ activo: false }).eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
