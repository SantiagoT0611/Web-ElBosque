import type { Enums } from "@/lib/types/database.types"

export type EstadoPedido = Enums<"estado_pedido_enum">
export type TipoEntrega = Enums<"tipo_entrega_enum">
export type MetodoPago = Enums<"metodo_pago_enum">
export type EstadoPago = Enums<"estado_pago_enum">

/**
 * Tabla de transiciones: pendiente → confirmado → preparando →
 * en_ruta/listo_para_recoger → entregado, con "cancelado" alcanzable desde
 * cualquier estado no terminal. Ver sección "Máquina de estados" del plan.
 */
const TRANSICIONES: Record<
  EstadoPedido,
  Partial<Record<TipoEntrega, readonly EstadoPedido[]>>
> = {
  pendiente: {
    domicilio: ["confirmado", "cancelado"],
    recoger: ["confirmado", "cancelado"],
  },
  confirmado: {
    domicilio: ["preparando", "cancelado"],
    recoger: ["preparando", "cancelado"],
  },
  preparando: {
    domicilio: ["en_ruta", "cancelado"],
    recoger: ["listo_para_recoger", "cancelado"],
  },
  en_ruta: {
    domicilio: ["entregado", "cancelado"],
  },
  listo_para_recoger: {
    recoger: ["entregado", "cancelado"],
  },
  entregado: {},
  cancelado: {},
}

export function siguientesEstadosPosibles(
  actual: EstadoPedido,
  tipoEntrega: TipoEntrega
): readonly EstadoPedido[] {
  return TRANSICIONES[actual]?.[tipoEntrega] ?? []
}

export function esTransicionValida(
  actual: EstadoPedido,
  tipoEntrega: TipoEntrega,
  siguiente: EstadoPedido
): boolean {
  return siguientesEstadosPosibles(actual, tipoEntrega).includes(siguiente)
}

export type ResultadoValidacion =
  | { ok: true }
  | { ok: false; status: 400 | 409; motivo: string }

/**
 * Reglas de negocio de pago (sección "Máquina de estados" del plan):
 * - Transferencia: no se puede pasar a "confirmado" mientras estado_pago
 *   siga "por_verificar" — primero hay que verificar el pago.
 * - Efectivo: no hay bloqueo, estado_pago queda "pendiente" hasta la entrega.
 */
export function validarTransicion(pedido: {
  estado_pedido: EstadoPedido
  tipo_entrega: TipoEntrega
  metodo_pago: MetodoPago
  estado_pago: EstadoPago
}, siguiente: EstadoPedido): ResultadoValidacion {
  if (!esTransicionValida(pedido.estado_pedido, pedido.tipo_entrega, siguiente)) {
    return {
      ok: false,
      status: 400,
      motivo: `No se puede pasar de "${pedido.estado_pedido}" a "${siguiente}" para un pedido de tipo "${pedido.tipo_entrega}".`,
    }
  }

  if (
    siguiente === "confirmado" &&
    pedido.metodo_pago === "transferencia" &&
    pedido.estado_pago !== "confirmado"
  ) {
    return {
      ok: false,
      status: 409,
      motivo: "Debes verificar el pago antes de confirmar el pedido.",
    }
  }

  return { ok: true }
}

/**
 * Efecto colateral de negocio: un pedido en efectivo se da por pagado al
 * entregarlo. Los de transferencia ya llegan a "confirmado" con el pago
 * verificado, así que no necesitan este ajuste.
 */
export function estadoPagoAlAplicar(
  pedido: { metodo_pago: MetodoPago; estado_pago: EstadoPago },
  siguienteEstado: EstadoPedido
): EstadoPago {
  if (
    siguienteEstado === "entregado" &&
    pedido.metodo_pago === "efectivo" &&
    pedido.estado_pago === "pendiente"
  ) {
    return "confirmado"
  }
  return pedido.estado_pago
}
