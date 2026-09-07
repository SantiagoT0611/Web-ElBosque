import { listarCategoriasAdmin } from "@/lib/data/productos-admin"
import { CategoriasLista } from "@/components/admin/categorias-lista"

export default async function AdminCategoriasPage() {
  const categorias = await listarCategoriasAdmin()
  return <CategoriasLista categoriasIniciales={categorias} />
}
