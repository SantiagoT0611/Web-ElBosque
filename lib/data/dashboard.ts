import "server-only"
import { createAdminClient } from "@/lib/supabase/admin"

function inicioDeHoyISO(): string {
  const inicio = new Date()
  inicio.setHours(0, 0, 0, 0)
  return inicio.toISOString()
}

export async function getResumenDashboard() {
  const supabase = createAdminClient()

  const { data: pedidosHoy, error } = await supabase
    .from("pedidos")
    .select("*, detalle_pedido(producto_nombre, cantidad)")
    .gte("created_at", inicioDeHoyISO())

  if (error) throw new Error(error.message)

  const pedidos = pedidosHoy ?? []
  const noCancelados = pedidos.filter((p) => p.estado_pedido !== "cancelado")

  const ventasHoy = noCancelados.reduce((acc, p) => acc + p.total, 0)
  const pendientes = pedidos.filter((p) => p.estado_pedido === "pendiente").length
  const preparando = pedidos.filter((p) => p.estado_pedido === "preparando").length
  const entregados = pedidos.filter((p) => p.estado_pedido === "entregado").length
  const aDomicilio = pedidos.filter((p) => p.tipo_entrega === "domicilio").length
  const paraRecoger = pedidos.filter((p) => p.tipo_entrega === "recoger").length
  const pendientesPago = pedidos.filter((p) => p.estado_pago === "por_verificar").length

  const conteoProductos = new Map<string, number>()
  for (const pedido of pedidos) {
    for (const item of pedido.detalle_pedido) {
      conteoProductos.set(
        item.producto_nombre,
        (conteoProductos.get(item.producto_nombre) ?? 0) + item.cantidad
      )
    }
  }
  const masVendido = [...conteoProductos.entries()].sort((a, b) => b[1] - a[1])[0] ?? null

  return {
    totalPedidosHoy: pedidos.length,
    pendientes,
    preparando,
    entregados,
    ventasHoy,
    aDomicilio,
    paraRecoger,
    pendientesPago,
    productoMasVendido: masVendido ? { nombre: masVendido[0], cantidad: masVendido[1] } : null,
  }
}
