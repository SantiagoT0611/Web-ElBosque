import { NextResponse } from "next/server"
import { getAdminSession } from "@/lib/auth/dal"
import { cerrarDia, getResumenHoyYUltimoCierre, listarCierres } from "@/lib/data/cierres"

export async function GET() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const [{ resumen, yaCerradoHoy }, historial] = await Promise.all([
    getResumenHoyYUltimoCierre(),
    listarCierres(),
  ])

  return NextResponse.json({ resumen, yaCerradoHoy, historial })
}

export async function POST() {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: "No autenticado." }, { status: 401 })

  const cierre = await cerrarDia(session.userId)
  return NextResponse.json({ cierre })
}
