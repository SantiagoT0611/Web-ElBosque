import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Tables } from "@/lib/types/database.types"

export type ProductoConCategoria = Tables<"productos"> & {
  categorias: { nombre: string } | null
}

export async function listarProductosAdmin(): Promise<ProductoConCategoria[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("productos")
    .select("*, categorias(nombre)")
    .order("orden", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function listarCategoriasAdmin(): Promise<Tables<"categorias">[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("orden", { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}
