import { listarResenasAdmin } from "@/lib/data/resenas"
import { ResenasLista } from "@/components/admin/resenas-lista"

export default async function AdminResenasPage() {
  const resenas = await listarResenasAdmin()

  return (
    <div className="p-8">
      <div className="mb-7 border-b border-border pb-6">
        <span className="eyebrow">Menú</span>
        <h1 className="mt-2.5 font-serif text-3xl">Reseñas</h1>
      </div>
      <ResenasLista resenasIniciales={resenas} />
    </div>
  )
}
