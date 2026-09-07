import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"

/**
 * configuracion_restaurante no tiene políticas RLS públicas (ver plan,
 * sección RLS): incluso la lectura para el checkout pasa por el cliente
 * de service-role, nunca por el cliente con la publishable key.
 */
export async function getConfiguracion() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("configuracion_restaurante")
    .select("*")
    .eq("id", 1)
    .single()

  if (error) throw new Error(error.message)
  return data
}

export type ConfiguracionPublica = {
  nombreRestaurante: string
  direccion: string | null
  telefono: string | null
  horarioAtencion: Record<string, string>
  costoDomicilioDefault: number
  banco: {
    nombre: string | null
    tipoCuenta: string | null
    numeroCuenta: string | null
    titular: string | null
    documento: string | null
  }
  qrTransferenciaUrl: string | null
}

export async function getConfiguracionPublica(): Promise<ConfiguracionPublica> {
  const config = await getConfiguracion()
  return {
    nombreRestaurante: config.nombre_restaurante,
    direccion: config.direccion,
    telefono: config.telefono,
    horarioAtencion: (config.horario_atencion ?? {}) as Record<string, string>,
    costoDomicilioDefault: config.costo_domicilio_default,
    banco: {
      nombre: config.banco_nombre,
      tipoCuenta: config.banco_tipo_cuenta,
      numeroCuenta: config.banco_numero_cuenta,
      titular: config.banco_titular,
      documento: config.banco_documento,
    },
    qrTransferenciaUrl: config.qr_transferencia_url,
  }
}
