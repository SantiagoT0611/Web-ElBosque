import { z } from "zod"

export const cambiarEstadoSchema = z.object({
  estado: z.enum([
    "confirmado",
    "preparando",
    "en_ruta",
    "listo_para_recoger",
    "entregado",
    "cancelado",
  ]),
  nota: z.string().trim().max(300).optional().or(z.literal("")),
})

export const verificarPagoSchema = z.object({
  estado_pago: z.enum(["confirmado", "rechazado"]),
})
