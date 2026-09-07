import { createClient } from "@/lib/supabase/server"
import type { Tables } from "@/lib/types/database.types"

export type CategoriaConProductos = Tables<"categorias"> & {
  productos: Tables<"productos">[]
}

/** Menú público: solo categorías activas y productos disponibles (RLS). */
export async function getMenuPublico(): Promise<CategoriaConProductos[]> {
  const supabase = await createClient()

  const { data: categorias, error } = await supabase
    .from("categorias")
    .select("*, productos(*)")
    .order("orden", { ascending: true })
    .order("orden", { referencedTable: "productos", ascending: true })

  if (error) throw new Error(error.message)

  return (categorias ?? [])
    .map((categoria) => ({
      ...categoria,
      productos: (categoria.productos ?? []).filter((p) => p.disponible),
    }))
    .filter((categoria) => categoria.productos.length > 0)
}
