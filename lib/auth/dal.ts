import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Tables } from "@/lib/types/database.types"

export type AdminSession = {
  userId: string
  email: string | null
  perfil: Tables<"admin_users">
}

/**
 * Verificación "segura" de sesión de admin: confirma la sesión de Supabase
 * Auth Y que exista una fila en admin_users (no todo usuario autenticado
 * es administrador). Memoizada por render con React cache — se puede
 * invocar en múltiples Server Components/Route Handlers sin duplicar la
 * consulta. proxy.ts solo hace la verificación optimista (cookie de sesión
 * presente); esta es la que realmente autoriza el acceso a datos.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // admin_users no tiene políticas RLS públicas a propósito (ver plan,
  // sección RLS); esta comprobación de autorización debe pasar por el
  // cliente de service-role, nunca por el cliente con cookies del usuario.
  const { data: perfil } = await createAdminClient()
    .from("admin_users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  if (!perfil) return null

  return { userId: user.id, email: user.email ?? null, perfil }
})

/** Para Server Components de /admin/**: exige sesión o redirige al login. */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession()
  if (!session) redirect("/admin/login")
  return session
}
