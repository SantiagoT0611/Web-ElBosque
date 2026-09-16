import "server-only"

/** Geocodificación gratuita vía Nominatim (OpenStreetMap) — sin API key.
 * Siempre server-side: la política de uso de Nominatim exige un
 * `User-Agent` descriptivo (que un `fetch` de navegador no puede fijar) y
 * limita a ~1 request/seg. El throttle de abajo es best-effort por
 * instancia de proceso — en serverless (Vercel) cada invocación puede ser
 * un proceso distinto, así que no es una garantía global, pero alcanza
 * para el volumen real de un solo restaurante. Nunca lanza: cualquier
 * fallo (sin resultados, timeout, red caída) devuelve `null` para que el
 * checkout caiga al selector manual de zona. */

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
const USER_AGENT = "ElBosqueHamburgueseria-Checkout/1.0 (contacto@elbosque.com)"
const TIMEOUT_MS = 6000
const THROTTLE_MS = 1100

let ultimaLlamada = 0

export async function geocodificarDireccion(direccion: string): Promise<{ lat: number; lng: number } | null> {
  const espera = THROTTLE_MS - (Date.now() - ultimaLlamada)
  if (espera > 0) await new Promise((r) => setTimeout(r, espera))
  ultimaLlamada = Date.now()

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const url = `${NOMINATIM_URL}?format=jsonv2&limit=1&countrycodes=co&q=${encodeURIComponent(direccion)}`
    const res = await fetch(url, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    })
    if (!res.ok) return null

    const resultados = (await res.json()) as Array<{ lat: string; lon: string }>
    if (resultados.length === 0) return null

    const lat = Number(resultados[0].lat)
    const lng = Number(resultados[0].lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null

    return { lat, lng }
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}
