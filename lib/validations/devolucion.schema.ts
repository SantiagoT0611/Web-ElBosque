import { z } from "zod"

export const devolucionSchema = z.object({
  motivo: z.string().trim().min(5, { error: "Cuéntanos brevemente el motivo." }).max(300),
})

export type DevolucionInput = z.infer<typeof devolucionSchema>
