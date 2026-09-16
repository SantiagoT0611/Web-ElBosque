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
  zonas_domicilio: z
    .array(
      z.object({
        nombre: z.string().trim().min(1).max(60),
        recargo: z.number().int().min(0),
      })
    )
    .optional(),
  latitud: z.number().min(-90).max(90).optional().nullable(),
  longitud: z.number().min(-180).max(180).optional().nullable(),
  tramos_domicilio: z
    .array(
      z.object({
        hasta_km: z.number().positive().max(200),
        recargo: z.number().int().min(0),
      })
    )
    .optional(),
  banco_nombre: z.string().trim().max(80).optional().or(z.literal("")),
  banco_tipo_cuenta: z.string().trim().max(40).optional().or(z.literal("")),
  banco_numero_cuenta: z.string().trim().max(60).optional().or(z.literal("")),
  banco_titular: z.string().trim().max(120).optional().or(z.literal("")),
  banco_documento: z.string().trim().max(40).optional().or(z.literal("")),
})

export type ConfiguracionInput = z.infer<typeof configuracionSchema>
