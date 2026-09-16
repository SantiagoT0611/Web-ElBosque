/** Distancia en línea recta ("as the crow flies"), no de ruta real — la
 * opción gratuita frente a una API de rutas paga. Misma fórmula replicada
 * en PL/pgSQL dentro de `crear_pedido` (única fuente de verdad para el
 * cobro real); esta copia en TS es solo para el preview en el checkout. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const rad = (deg: number) => (deg * Math.PI) / 180
  const dLat = rad(lat2 - lat1)
  const dLng = rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export type TramoDomicilio = { hasta_km: number; recargo: number }

/** Tramo con el `hasta_km` más chico que cubra la distancia; si ninguno
 * alcanza, se usa el más lejano como "y más lejos" (misma regla aplicada
 * en `crear_pedido`). */
export function calcularRecargoPorTramos(distanciaKm: number, tramos: TramoDomicilio[]): number {
  if (tramos.length === 0) return 0
  const ordenados = [...tramos].sort((a, b) => a.hasta_km - b.hasta_km)
  const tramo = ordenados.find((t) => distanciaKm <= t.hasta_km)
  return (tramo ?? ordenados[ordenados.length - 1]).recargo
}
