import { z } from "zod"

export const resenaSchema = z.object({
  codigo_seguimiento: z.string().trim().min(1, { error: "Falta el código de seguimiento." }),
  producto_id: z.uuid().optional(),
  calificacion: z.number().int().min(1).max(5),
  comentario: z
    .string()
    .trim()
    .min(10, { error: "Cuéntanos un poco más — mínimo 10 caracteres." })
    .max(500),
})

export type ResenaInput = z.infer<typeof resenaSchema>
