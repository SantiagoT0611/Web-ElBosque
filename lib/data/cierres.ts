import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Tables } from "@/lib/types/database.types"

function fechaDeHoy(): string {
  const hoy = new Date()
  const yyyy = hoy.getFullYear()
  const mm = String(hoy.getMonth() + 1).padStart(2, "0")
  const dd = String(hoy.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

function inicioDeHoyISO(): string {
  const inicio = new Date()
  inicio.setHours(0, 0, 0, 0)
  return inicio.toISOString()
}

export type ResumenCierre = {
  fecha: string
  totalPedidos: number
  totalVentas: number
  totalEfectivo: number
  totalTransferencia: number
  cantidadEfectivo: number
  cantidadTransferencia: number
}

async function calcularResumenHoy(): Promise<ResumenCierre> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("pedidos")
    .select("total, metodo_pago, estado_pedido")
    .gte("created_at", inicioDeHoyISO())

  if (error) throw new Error(error.message)

  const pedidos = (data ?? []).filter((p) => p.estado_pedido !== "cancelado")
  const efectivo = pedidos.filter((p) => p.metodo_pago === "efectivo")
  const transferencia = pedidos.filter((p) => p.metodo_pago === "transferencia")

  return {
    fecha: fechaDeHoy(),
    totalPedidos: pedidos.length,
    totalVentas: pedidos.reduce((acc, p) => acc + p.total, 0),
    totalEfectivo: efectivo.reduce((acc, p) => acc + p.total, 0),
    totalTransferencia: transferencia.reduce((acc, p) => acc + p.total, 0),
    cantidadEfectivo: efectivo.length,
    cantidadTransferencia: transferencia.length,
  }
}

export async function getResumenHoyYUltimoCierre() {
  const supabase = createAdminClient()
  const [resumen, { data: cierreHoy }] = await Promise.all([
    calcularResumenHoy(),
    supabase.from("cierres_caja").select("*").eq("fecha", fechaDeHoy()).maybeSingle(),
  ])
  return { resumen, yaCerradoHoy: !!cierreHoy }
}

export async function cerrarDia(adminId: string): Promise<Tables<"cierres_caja">> {
  const resumen = await calcularResumenHoy()
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("cierres_caja")
    .upsert(
      {
        fecha: resumen.fecha,
        total_pedidos: resumen.totalPedidos,
        total_ventas: resumen.totalVentas,
        total_efectivo: resumen.totalEfectivo,
        total_transferencia: resumen.totalTransferencia,
        cantidad_efectivo: resumen.cantidadEfectivo,
        cantidad_transferencia: resumen.cantidadTransferencia,
        cerrado_por: adminId,
      },
      { onConflict: "fecha" }
    )
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function listarCierres(): Promise<Tables<"cierres_caja">[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("cierres_caja")
    .select("*")
    .order("fecha", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}
