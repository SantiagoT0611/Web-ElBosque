import { z } from "zod"

export const itemPedidoSchema = z.object({
  producto_id: z.uuid(),
  cantidad: z.number().int().min(1, { error: "La cantidad mínima es 1." }).max(50),
})

const baseCheckoutSchema = z.object({
  cliente_nombre: z
    .string()
    .trim()
    .min(2, { error: "Ingresa tu nombre completo." })
    .max(120),
  cliente_telefono: z
    .string()
    .trim()
    .min(7, { error: "Ingresa un teléfono válido." })
    .max(20),
  cliente_email: z.email({ error: "Correo inválido." }).optional().or(z.literal("")),
  cliente_notas: z.string().trim().max(300).optional().or(z.literal("")),
  tipo_entrega: z.enum(["domicilio", "recoger"]),
  cliente_direccion: z.string().trim().max(200).optional().or(z.literal("")),
  cliente_barrio: z.string().trim().max(80).optional().or(z.literal("")),
  cliente_referencia: z.string().trim().max(200).optional().or(z.literal("")),
  metodo_pago: z.enum(["efectivo", "transferencia"]),
  items: z.array(itemPedidoSchema).min(1, { error: "El carrito está vacío." }),
})

function requiereDireccion(data: { tipo_entrega: string; cliente_direccion?: string }, ctx: z.RefinementCtx) {
  if (data.tipo_entrega === "domicilio" && !data.cliente_direccion) {
    ctx.addIssue({
      code: "custom",
      path: ["cliente_direccion"],
      message: "La dirección es obligatoria para pedidos a domicilio.",
    })
  }
}

export const crearPedidoSchema = baseCheckoutSchema.superRefine(requiereDireccion)

export type CrearPedidoInput = z.infer<typeof crearPedidoSchema>

/** Subconjunto para el formulario del cliente en /checkout (sin `items`, que viene del carrito). */
export const checkoutFormSchema = baseCheckoutSchema
  .omit({ items: true })
  .superRefine(requiereDireccion)

export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>
