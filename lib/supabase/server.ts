import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/types/database.types"

/**
 * Cliente Supabase para Server Components / Route Handlers, con la
 * publishable key (respeta RLS). Usado para leer sesión de admin y el
 * menú público. Para operaciones privilegiadas usar lib/supabase/admin.ts.
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Se llamó desde un Server Component sin poder escribir cookies;
            // proxy.ts se encarga de refrescar la sesión en ese caso.
          }
        },
      },
    }
  )
}
