import { z } from "zod"

export const estimarDomicilioSchema = z
  .object({
    cliente_direccion: z.string().trim().min(1).optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
  })
  .refine((data) => Boolean(data.cliente_direccion) || (data.lat != null && data.lng != null), {
    message: "Se necesita una dirección o coordenadas.",
  })

export type EstimarDomicilioInput = z.infer<typeof estimarDomicilioSchema>
