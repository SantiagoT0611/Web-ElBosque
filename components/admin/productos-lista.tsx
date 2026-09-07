"use client"

import { useOptimistic, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { ProductoForm } from "@/components/admin/producto-form"
import { formatCOP } from "@/lib/format/currency"
import type { Tables } from "@/lib/types/database.types"
import type { ProductoConCategoria } from "@/lib/data/productos-admin"
import type { ProductoInput } from "@/lib/validations/producto.schema"

export function ProductosLista({
  productosIniciales,
  categorias,
}: {
  productosIniciales: ProductoConCategoria[]
  categorias: Tables<"categorias">[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [productos, toggleOptimistic] = useOptimistic(
    productosIniciales,
    (state, id: string) =>
      state.map((p) => (p.id === id ? { ...p, disponible: !p.disponible } : p))
  )
  const [dialogAbierto, setDialogAbierto] = useState<string | "nuevo" | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function crear(values: ProductoInput) {
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success("Producto creado.")
      setDialogAbierto(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear el producto.")
    } finally {
      setSubmitting(false)
    }
  }

  async function actualizar(id: string, values: Partial<ProductoInput>) {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/productos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success("Producto actualizado.")
      setDialogAbierto(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar el producto.")
    } finally {
      setSubmitting(false)
    }
  }

  function toggleDisponible(producto: ProductoConCategoria) {
    startTransition(async () => {
      toggleOptimistic(producto.id)
      await fetch(`/api/admin/productos/${producto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disponible: !producto.disponible }),
      })
      router.refresh()
    })
  }

  async function archivar(id: string) {
    await fetch(`/api/admin/productos/${id}`, { method: "DELETE" })
    toast.success("Producto archivado.")
    router.refresh()
  }

  return (
    <div className="p-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="eyebrow">Menú</span>
          <h1 className="mt-2.5 font-serif text-3xl">Productos</h1>
        </div>
        <Dialog open={dialogAbierto === "nuevo"} onOpenChange={(o) => setDialogAbierto(o ? "nuevo" : null)}>
          <DialogTrigger asChild>
            <button className="bg-primary px-5 py-2.5 font-display text-xs font-bold tracking-[0.1em] uppercase text-primary-foreground transition-colors hover:bg-gold-light">
              + Nuevo producto
            </button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-normal">Nuevo producto</DialogTitle>
            </DialogHeader>
            <ProductoForm categorias={categorias} onSubmit={crear} submitting={submitting} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-2.5">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className="flex flex-col gap-3 border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1.5">
              <div className="flex flex-col">
                <span className="text-[15px] font-medium">{producto.nombre}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {producto.categorias?.nombre}
                </span>
              </div>
              {producto.etiqueta ? (
                <span className="border border-primary/40 px-2 py-1 font-mono text-[9px] tracking-[0.1em] text-primary uppercase">
                  {producto.etiqueta}
                </span>
              ) : null}
              <span className="font-mono text-sm text-primary">{formatCOP(producto.precio)}</span>
              <div className="flex items-center gap-2">
                <Switch
                  checked={producto.disponible}
                  onCheckedChange={() => toggleDisponible(producto)}
                />
                <span className="text-xs text-muted-foreground">
                  {producto.disponible ? "Disponible" : "Agotado"}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 justify-end gap-2">
              <Dialog
                open={dialogAbierto === producto.id}
                onOpenChange={(o) => setDialogAbierto(o ? producto.id : null)}
              >
                <DialogTrigger asChild>
                  <button className="border border-border px-3.5 py-2 font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:border-primary hover:text-primary">
                    Editar
                  </button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-xl font-normal">Editar producto</DialogTitle>
                  </DialogHeader>
                  <ProductoForm
                    categorias={categorias}
                    defaultValues={{
                      ...producto,
                      descripcion: producto.descripcion ?? "",
                      imagen_url: producto.imagen_url ?? "",
                      etiqueta: producto.etiqueta ?? "",
                    }}
                    onSubmit={(values) => actualizar(producto.id, values)}
                    submitting={submitting}
                  />
                </DialogContent>
              </Dialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="border border-destructive/40 px-3.5 py-2 font-mono text-[10px] tracking-[0.1em] text-destructive uppercase transition-colors hover:bg-destructive/10">
                    Archivar
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Archivar {producto.nombre}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Dejará de mostrarse en el menú público. Los pedidos pasados no se ven afectados.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={() => archivar(producto.id)}>Archivar</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
