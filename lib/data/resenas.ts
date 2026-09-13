import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Tables } from "@/lib/types/database.types"

export async function getResenasAprobadas(): Promise<Tables<"resenas">[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("resenas")
    .select("*")
    .eq("aprobado", true)
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function existeResenaParaPedido(pedidoId: string): Promise<boolean> {
  const supabase = createAdminClient()
  const { count, error } = await supabase
    .from("resenas")
    .select("id", { count: "exact", head: true })
    .eq("pedido_id", pedidoId)

  if (error) throw new Error(error.message)
  return (count ?? 0) > 0
}

export async function listarResenasAdmin(): Promise<Tables<"resenas">[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("resenas")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}
