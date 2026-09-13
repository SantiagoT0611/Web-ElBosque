import { z } from "zod"

export const configuracionSchema = z.object({
  nombre_restaurante: z.string().trim().min(2).max(120),
  direccion: z.string().trim().max(200).optional().or(z.literal("")),
  telefono: z.string().trim().max(30).optional().or(z.literal("")),
  horario_atencion: z.record(z.string(), z.string()),
  redes_sociales: z.record(z.string(), z.string()).optional(),
  costo_domicilio_default: z
    .number()
    .int({ error: "Debe ser un número entero de pesos." })
    .min(0),
  banco_nombre: z.string().trim().max(80).optional().or(z.literal("")),
  banco_tipo_cuenta: z.string().trim().max(40).optional().or(z.literal("")),
  banco_numero_cuenta: z.string().trim().max(60).optional().or(z.literal("")),
  banco_titular: z.string().trim().max(120).optional().or(z.literal("")),
  banco_documento: z.string().trim().max(40).optional().or(z.literal("")),
})

export type ConfiguracionInput = z.infer<typeof configuracionSchema>
