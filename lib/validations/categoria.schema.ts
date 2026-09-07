import { z } from "zod"

export const categoriaSchema = z.object({
  nombre: z.string().trim().min(2, { error: "El nombre es muy corto." }).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
      error: "El slug solo puede tener minúsculas, números y guiones.",
    })
    .optional()
    .or(z.literal("")),
  orden: z.number().int(),
  activo: z.boolean(),
})

export type CategoriaInput = z.infer<typeof categoriaSchema>

const COMBINING_MARKS = /[̀-ͯ]/g

export function generarSlug(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
