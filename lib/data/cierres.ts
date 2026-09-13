import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Tables } from "@/lib/types/database.types"
import { getFechaDeHoyBogota, getInicioDeHoyBogotaISO } from "@/lib/format/horario"

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
    .select("id, total, metodo_pago, estado_pedido")
    .gte("created_at", getInicioDeHoyBogotaISO())

  if (error) throw new Error(error.message)

  const todos = data ?? []
  const idsDevueltos = new Set<string>()
  if (todos.length > 0) {
    const { data: devoluciones, error: devolucionesError } = await supabase
      .from("devoluciones")
      .select("pedido_id")
      .in("pedido_id", todos.map((p) => p.id))

    if (devolucionesError) throw new Error(devolucionesError.message)
    for (const d of devoluciones ?? []) idsDevueltos.add(d.pedido_id)
  }

  const pedidos = todos.filter(
    (p) => p.estado_pedido !== "cancelado" && !idsDevueltos.has(p.id)
  )
  const efectivo = pedidos.filter((p) => p.metodo_pago === "efectivo")
  const transferencia = pedidos.filter((p) => p.metodo_pago === "transferencia")

  return {
    fecha: getFechaDeHoyBogota(),
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
    supabase.from("cierres_caja").select("*").eq("fecha", getFechaDeHoyBogota()).maybeSingle(),
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
