import { NextResponse } from "next/server"
import { getConfiguracionPublica } from "@/lib/data/configuracion"

export async function GET() {
  try {
    const configuracion = await getConfiguracionPublica()
    return NextResponse.json(configuracion)
  } catch {
    return NextResponse.json(
      { error: "No se pudo cargar la configuración del restaurante." },
      { status: 500 }
    )
  }
}
