import "server-only"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/types/database.types"

/**
 * Cliente con la service-role key: ignora RLS por completo. Solo debe
 * usarse dentro de Route Handlers de app/api/**, nunca importarse desde
 * código que pueda terminar en el bundle del cliente.
 */
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!secretKey) {
    throw new Error(
      "Falta SUPABASE_SECRET_KEY en las variables de entorno del servidor."
    )
  }

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secretKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
