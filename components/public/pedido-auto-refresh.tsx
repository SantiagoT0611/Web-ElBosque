"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/** Sin websockets: refresca la página de seguimiento cada 15s para que el
 * cliente vea cambios de estado sin tener que recargar manualmente. No
 * requiere abrir ninguna política RLS nueva para un visitante anónimo. */
export function PedidoAutoRefresh() {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => router.refresh(), 15000)
    return () => clearInterval(id)
  }, [router])

  return null
}
