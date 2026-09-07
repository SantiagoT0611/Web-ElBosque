import { z } from "zod"

export const productoSchema = z.object({
  categoria_id: z.uuid({ error: "Selecciona una categoría." }),
  nombre: z.string().trim().min(2, { error: "El nombre es muy corto." }).max(120),
  descripcion: z.string().trim().max(400).optional().or(z.literal("")),
  precio: z
    .number()
    .int({ error: "El precio debe ser un número entero." })
    .min(0, { error: "El precio no puede ser negativo." }),
  imagen_url: z.url().optional().or(z.literal("")),
  etiqueta: z.string().trim().max(40).optional().or(z.literal("")),
  disponible: z.boolean(),
  orden: z.number().int(),
})

export type ProductoInput = z.infer<typeof productoSchema>
