import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Tables } from "@/lib/types/database.types"

export type PedidoCompleto = Tables<"pedidos"> & {
  detalle_pedido: Tables<"detalle_pedido">[]
  historial_estado_pedido: Tables<"historial_estado_pedido">[]
}

export async function getPedidoPorCodigo(codigo: string): Promise<PedidoCompleto | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("pedidos")
    .select("*, detalle_pedido(*), historial_estado_pedido(*)")
    .eq("codigo_seguimiento", codigo.toUpperCase())
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}
