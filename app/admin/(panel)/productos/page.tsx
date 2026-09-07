import { listarProductosAdmin, listarCategoriasAdmin } from "@/lib/data/productos-admin"
import { ProductosLista } from "@/components/admin/productos-lista"

export default async function AdminProductosPage() {
  const [productos, categorias] = await Promise.all([
    listarProductosAdmin(),
    listarCategoriasAdmin(),
  ])

  return <ProductosLista productosIniciales={productos} categorias={categorias} />
}
