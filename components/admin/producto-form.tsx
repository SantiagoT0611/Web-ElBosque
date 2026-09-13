"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productoSchema, type ProductoInput } from "@/lib/validations/producto.schema"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUploadField } from "@/components/shared/image-upload-field"
import type { Tables } from "@/lib/types/database.types"

export function ProductoForm({
  categorias,
  defaultValues,
  onSubmit,
  submitting,
}: {
  categorias: Tables<"categorias">[]
  defaultValues?: Partial<ProductoInput>
  onSubmit: (values: ProductoInput) => void
  submitting: boolean
}) {
  const form = useForm<ProductoInput>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      categoria_id: defaultValues?.categoria_id ?? categorias[0]?.id ?? "",
      nombre: defaultValues?.nombre ?? "",
      descripcion: defaultValues?.descripcion ?? "",
      precio: defaultValues?.precio ?? 0,
      imagen_url: defaultValues?.imagen_url ?? "",
      etiqueta: defaultValues?.etiqueta ?? "",
      disponible: defaultValues?.disponible ?? true,
      orden: defaultValues?.orden ?? 0,
    },
  })

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label>Categoría</Label>
        <Select
          value={form.watch("categoria_id")}
          onValueChange={(v) => form.setValue("categoria_id", v, { shouldValidate: true })}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una categoría" />
          </SelectTrigger>
          <SelectContent>
            {categorias.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input id="nombre" {...form.register("nombre")} />
        {form.formState.errors.nombre ? (
          <p className="text-xs text-destructive">{form.formState.errors.nombre.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="descripcion">Descripción</Label>
        <Textarea id="descripcion" rows={3} {...form.register("descripcion")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="precio">Precio (COP)</Label>
          <Input
            id="precio"
            type="number"
            step="1"
            {...form.register("precio", { valueAsNumber: true })}
          />
          {form.formState.errors.precio ? (
            <p className="text-xs text-destructive">{form.formState.errors.precio.message}</p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="orden">Orden</Label>
          <Input id="orden" type="number" step="1" {...form.register("orden", { valueAsNumber: true })} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="etiqueta">Etiqueta (opcional)</Label>
        <Input id="etiqueta" placeholder="MÁS PEDIDA, VEGETARIANA…" {...form.register("etiqueta")} />
      </div>

      <ImageUploadField
        bucket="productos"
        value={form.watch("imagen_url") || null}
        onChange={(url) => form.setValue("imagen_url", url)}
        label="Foto del producto"
        hint="Cuadrada o casi cuadrada, mínimo 1000×1000 px — se recorta distinto según la sección del menú."
      />

      <div className="flex items-center justify-between border border-border px-4 py-3">
        <Label htmlFor="disponible">Disponible en el menú</Label>
        <Switch
          id="disponible"
          checked={form.watch("disponible")}
          onCheckedChange={(v) => form.setValue("disponible", v)}
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 bg-primary p-3.5 text-center font-display text-xs font-bold tracking-[0.12em] uppercase text-primary-foreground transition-colors hover:bg-gold-light disabled:opacity-50"
      >
        {submitting ? "Guardando..." : "Guardar producto"}
      </button>
    </form>
  )
}
