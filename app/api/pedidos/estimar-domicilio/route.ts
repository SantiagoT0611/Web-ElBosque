import { NextResponse } from "next/server"
import { getConfiguracion } from "@/lib/data/configuracion"
import { estimarDomicilioSchema } from "@/lib/validations/domicilio.schema"
import { geocodificarDireccion } from "@/lib/geo/geocodificar"
import { haversineKm, calcularRecargoPorTramos, type TramoDomicilio } from "@/lib/geo/haversine"

/** Preview del costo de domicilio antes de confirmar el pedido — nunca es
 * la fuente de verdad del cobro (eso vive en `crear_pedido`, que recalcula
 * todo de forma independiente). Responde siempre 200: el checkout usa
 * `disponible` para decidir si mostrar el estimado o caer al selector
 * manual de zona, sin tener que distinguir códigos de error HTTP. */
export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ disponible: false, motivo: "sin_datos" })
  }

  const parsed = estimarDomicilioSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ disponible: false, motivo: "sin_datos" })
  }

  const configuracion = await getConfiguracion()
  const tramos = (configuracion.tramos_domicilio ?? []) as TramoDomicilio[]
  if (configuracion.latitud == null || configuracion.longitud == null || tramos.length === 0) {
    return NextResponse.json({ disponible: false, motivo: "sin_datos" })
  }

  let lat: number
  let lng: number
  let fuente: "gps" | "direccion"

  if (parsed.data.lat != null && parsed.data.lng != null) {
    lat = parsed.data.lat
    lng = parsed.data.lng
    fuente = "gps"
  } else {
    const geocodificado = await geocodificarDireccion(parsed.data.cliente_direccion!)
    if (!geocodificado) {
      return NextResponse.json({ disponible: false, motivo: "direccion_no_encontrada" })
    }
    lat = geocodificado.lat
    lng = geocodificado.lng
    fuente = "direccion"
  }

  const distanciaKm = haversineKm(configuracion.latitud, configuracion.longitud, lat, lng)
  const recargo = calcularRecargoPorTramos(distanciaKm, tramos)
  const costoDomicilio = configuracion.costo_domicilio_default + recargo

  return NextResponse.json({
    disponible: true,
    distancia_km: Math.round(distanciaKm * 100) / 100,
    costo_domicilio: costoDomicilio,
    lat,
    lng,
    fuente,
  })
}
