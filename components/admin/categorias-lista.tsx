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
import { Switch } from "@/components/ui/switch"
import { CategoriaForm } from "@/components/admin/categoria-form"
import type { Tables } from "@/lib/types/database.types"
import type { CategoriaInput } from "@/lib/validations/categoria.schema"

export function CategoriasLista({
  categoriasIniciales,
}: {
  categoriasIniciales: Tables<"categorias">[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [categorias, toggleOptimistic] = useOptimistic(
    categoriasIniciales,
    (state, id: string) => state.map((c) => (c.id === id ? { ...c, activo: !c.activo } : c))
  )
  const [dialogAbierto, setDialogAbierto] = useState<string | "nuevo" | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function crear(values: CategoriaInput) {
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/categorias", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success("Categoría creada.")
      setDialogAbierto(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo crear la categoría.")
    } finally {
      setSubmitting(false)
    }
  }

  async function actualizar(id: string, values: Partial<CategoriaInput>) {
    setSubmitting(true)
    try {
      const res = await fetch(`/api/admin/categorias/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success("Categoría actualizada.")
      setDialogAbierto(null)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar.")
    } finally {
      setSubmitting(false)
    }
  }

  function toggleActivo(categoria: Tables<"categorias">) {
    startTransition(async () => {
      toggleOptimistic(categoria.id)
      await fetch(`/api/admin/categorias/${categoria.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !categoria.activo }),
      })
      router.refresh()
    })
  }

  return (
    <div className="p-8">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="eyebrow">Menú</span>
          <h1 className="mt-2.5 font-serif text-3xl">Categorías</h1>
        </div>
        <Dialog open={dialogAbierto === "nuevo"} onOpenChange={(o) => setDialogAbierto(o ? "nuevo" : null)}>
          <DialogTrigger asChild>
            <button className="bg-primary px-5 py-2.5 font-display text-xs font-bold tracking-[0.1em] uppercase text-primary-foreground transition-colors hover:bg-gold-light">
              + Nueva categoría
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-normal">Nueva categoría</DialogTitle>
            </DialogHeader>
            <CategoriaForm onSubmit={crear} submitting={submitting} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-2.5">
        {categorias.map((categoria) => (
          <div
            key={categoria.id}
            className="flex flex-col gap-3 border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1.5">
              <div className="flex flex-col">
                <span className="text-[15px] font-medium">{categoria.nombre}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{categoria.slug}</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={categoria.activo} onCheckedChange={() => toggleActivo(categoria)} />
                <span className="text-xs text-muted-foreground">
                  {categoria.activo ? "Visible" : "Oculta"}
                </span>
              </div>
              <span className="font-mono text-xs text-muted-foreground">Orden {categoria.orden}</span>
            </div>
            <div className="flex shrink-0 justify-end">
              <Dialog
                open={dialogAbierto === categoria.id}
                onOpenChange={(o) => setDialogAbierto(o ? categoria.id : null)}
              >
                <DialogTrigger asChild>
                  <button className="border border-border px-3.5 py-2 font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:border-primary hover:text-primary">
                    Editar
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-serif text-xl font-normal">Editar categoría</DialogTitle>
                  </DialogHeader>
                  <CategoriaForm
                    defaultValues={categoria}
                    onSubmit={(values) => actualizar(categoria.id, values)}
                    submitting={submitting}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
