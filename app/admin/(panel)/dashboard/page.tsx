import Link from "next/link"
import { getResumenDashboard } from "@/lib/data/dashboard"
import { getResumenHoyYUltimoCierre } from "@/lib/data/cierres"
import { StatCard } from "@/components/admin/stat-card"
import { CerrarDiaDialog } from "@/components/admin/cerrar-dia-dialog"
import { RealtimeRefresh } from "@/components/admin/realtime-refresh"
import { formatCOP } from "@/lib/format/currency"

export default async function AdminDashboardPage() {
  const [resumen, { resumen: resumenCierre, yaCerradoHoy }] = await Promise.all([
    getResumenDashboard(),
    getResumenHoyYUltimoCierre(),
  ])

  return (
    <div className="p-8">
      <RealtimeRefresh />
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="eyebrow">Panel interno</span>
          <h1 className="mt-2.5 font-serif text-3xl">Hoy en El Bosque</h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/pedidos"
            className="border border-border px-5 py-2.5 font-mono text-[11px] tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            VER TODOS LOS PEDIDOS
          </Link>
          <CerrarDiaDialog resumenInicial={resumenCierre} yaCerradoHoyInicial={yaCerradoHoy} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard value={resumen.totalPedidosHoy} label="Pedidos hoy" />
        <StatCard value={resumen.pendientes} label="Pendientes" />
        <StatCard value={resumen.preparando} label="Preparando" />
        <StatCard value={resumen.entregados} label="Entregados" />
        <StatCard value={formatCOP(resumen.ventasHoy)} label="Ventas del día" />
        <StatCard value={resumen.aDomicilio} label="A domicilio" />
        <StatCard value={resumen.paraRecoger} label="Para recoger" />
        <StatCard value={resumen.pendientesPago} label="Pago por verificar" />
      </div>

      {resumen.productoMasVendido ? (
        <div className="mt-6 border border-border bg-card p-5">
          <div className="font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
            Producto más vendido hoy
          </div>
          <div className="mt-2 font-serif text-2xl">
            {resumen.productoMasVendido.nombre}{" "}
            <span className="font-mono text-base text-muted-foreground">
              · {resumen.productoMasVendido.cantidad} unidades
            </span>
          </div>
        </div>
      ) : null}
    </div>
  )
}
