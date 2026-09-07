import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import type { PedidoCompleto } from "@/lib/data/pedidos"
import type { EstadoPedido, TipoEntrega } from "@/lib/orders/state-machine"

function inicioDeHoyISO(): string {
  const inicio = new Date()
  inicio.setHours(0, 0, 0, 0)
  return inicio.toISOString()
}

export type VistaPedidos = "pendientes" | "hoy" | "completados" | "todos"

export async function listarPedidosAdmin(params: {
  vista?: VistaPedidos
  estado?: EstadoPedido
  tipo?: TipoEntrega
}): Promise<PedidoCompleto[]> {
  const supabase = createAdminClient()
  let query = supabase
    .from("pedidos")
    .select("*, detalle_pedido(*), historial_estado_pedido(*)")
    .order("created_at", { ascending: false })

  const vista = params.vista ?? "hoy"
  if (vista === "pendientes") {
    query = query.eq("estado_pedido", "pendiente")
  } else if (vista === "completados") {
    query = query.eq("estado_pedido", "entregado")
  } else if (vista === "hoy") {
    query = query.gte("created_at", inicioDeHoyISO())
  }

  if (params.estado) query = query.eq("estado_pedido", params.estado)
  if (params.tipo) query = query.eq("tipo_entrega", params.tipo)

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getPedidoAdminPorId(id: string): Promise<PedidoCompleto | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("pedidos")
    .select("*, detalle_pedido(*), historial_estado_pedido(*)")
    .eq("id", id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}
