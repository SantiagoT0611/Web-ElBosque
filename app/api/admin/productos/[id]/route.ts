import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/dal"
import { createAdminClient } from "@/lib/supabase/admin"
import { productoSchema } from "@/lib/validations/producto.schema"

export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/productos/[id]">) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const { id } = await ctx.params
  const body = await request.json()
  const parsed = productoSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos.", detalles: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("productos")
    .update({
      ...parsed.data,
      descripcion: parsed.data.descripcion === "" ? null : parsed.data.descripcion,
      imagen_url: parsed.data.imagen_url === "" ? null : parsed.data.imagen_url,
    })
    .eq("id", id)
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Producto no encontrado." }, { status: 404 })
  return NextResponse.json({ producto: data })
}

/** Archivado suave (disponible=false): conserva el histórico en pedidos pasados. */
export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/productos/[id]">) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const { id } = await ctx.params
  const supabase = createAdminClient()
  const { error } = await supabase.from("productos").update({ disponible: false }).eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
