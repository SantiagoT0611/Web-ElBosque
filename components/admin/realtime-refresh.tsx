"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

/** No renderiza nada — se suscribe a cambios en pedidos/historial y refresca
 * la página cuando algo cambia desde otra sesión/dispositivo (otro admin, o
 * un cliente creando un pedido nuevo). Mismo router.refresh() que ya usan
 * las mutaciones propias del panel, solo que ahora también reacciona a
 * cambios ajenos. */
export function RealtimeRefresh() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let activo = true

    async function suscribir() {
      // La conexión de Realtime necesita el JWT de la sesión ya cargado
      // antes de suscribirse — si no, se conecta como anónimo y las
      // políticas RLS descartan todos los cambios en silencio.
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!activo) return
      if (session) supabase.realtime.setAuth(session.access_token)

      const channel = supabase
        .channel("admin-pedidos")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "pedidos" },
          () => router.refresh()
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "historial_estado_pedido" },
          () => router.refresh()
        )
        .subscribe()

      return channel
    }

    const channelPromise = suscribir()

    return () => {
      activo = false
      channelPromise.then((channel) => {
        if (channel) supabase.removeChannel(channel)
      })
    }
  }, [router])

  return null
}
