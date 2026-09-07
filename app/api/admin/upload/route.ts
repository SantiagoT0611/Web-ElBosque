import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/dal"
import { createAdminClient } from "@/lib/supabase/admin"

const BUCKETS_PERMITIDOS = new Set(["productos", "configuracion"])
const TIPOS_PERMITIDOS = new Set(["image/jpeg", "image/png", "image/webp"])
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024

export async function POST(request: Request) {
  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 })
  }

  const formData = await request.formData()
  const bucket = formData.get("bucket")
  const file = formData.get("file")

  if (typeof bucket !== "string" || !BUCKETS_PERMITIDOS.has(bucket)) {
    return NextResponse.json({ error: "Bucket inválido." }, { status: 400 })
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 })
  }
  if (!TIPOS_PERMITIDOS.has(file.type)) {
    return NextResponse.json(
      { error: "Formato no permitido. Usa JPG, PNG o WEBP." },
      { status: 400 }
    )
  }
  if (file.size > TAMANO_MAXIMO_BYTES) {
    return NextResponse.json({ error: "La imagen no puede superar 5 MB." }, { status: 400 })
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg"
  const nombreArchivo = `${crypto.randomUUID()}.${extension}`

  const supabase = createAdminClient()
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(nombreArchivo, file, { contentType: file.type, upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(nombreArchivo)

  return NextResponse.json({ url: publicUrlData.publicUrl })
}
