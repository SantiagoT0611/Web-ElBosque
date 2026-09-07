"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { categoriaSchema, type CategoriaInput } from "@/lib/validations/categoria.schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export function CategoriaForm({
  defaultValues,
  onSubmit,
  submitting,
}: {
  defaultValues?: Partial<CategoriaInput>
  onSubmit: (values: CategoriaInput) => void
  submitting: boolean
}) {
  const form = useForm<CategoriaInput>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      nombre: defaultValues?.nombre ?? "",
      slug: defaultValues?.slug ?? "",
      orden: defaultValues?.orden ?? 0,
      activo: defaultValues?.activo ?? true,
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" {...form.register("nombre")} />
        {form.formState.errors.nombre ? (
          <p className="text-xs text-destructive">{form.formState.errors.nombre.message}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">Slug (opcional, se genera solo)</Label>
        <Input id="slug" placeholder="hamburguesas" {...form.register("slug")} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="orden">Orden</Label>
        <Input id="orden" type="number" {...form.register("orden", { valueAsNumber: true })} />
      </div>
      <div className="flex items-center justify-between border border-border px-4 py-3">
        <Label htmlFor="activo">Visible en el menú</Label>
        <Switch
          id="activo"
          checked={form.watch("activo")}
          onCheckedChange={(v) => form.setValue("activo", v)}
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="mt-1 bg-primary p-3.5 text-center font-display text-xs font-bold tracking-[0.12em] uppercase text-primary-foreground transition-colors hover:bg-gold-light disabled:opacity-50"
      >
        {submitting ? "Guardando..." : "Guardar categoría"}
      </button>
    </form>
  )
}
