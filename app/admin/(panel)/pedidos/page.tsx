import Link from "next/link"
import { listarPedidosAdmin, type VistaPedidos } from "@/lib/data/pedidos-admin"
import { OrderRow } from "@/components/admin/order-row"
import { RealtimeRefresh } from "@/components/admin/realtime-refresh"
import { cn } from "@/lib/utils"

const TABS: { value: VistaPedidos; label: string }[] = [
  { value: "hoy", label: "Hoy" },
  { value: "pendientes", label: "Pendientes" },
  { value: "completados", label: "Completados" },
  { value: "todos", label: "Todos" },
]

export default async function AdminPedidosPage(props: PageProps<"/admin/pedidos">) {
  const searchParams = await props.searchParams
  const vistaParam = searchParams.vista
  const vista: VistaPedidos =
    typeof vistaParam === "string" && TABS.some((t) => t.value === vistaParam)
      ? (vistaParam as VistaPedidos)
      : "hoy"

  const pedidos = await listarPedidosAdmin({ vista })

  return (
    <div className="p-8">
      <RealtimeRefresh />
      <div className="mb-6 border-b border-border pb-6">
        <span className="eyebrow">Gestión</span>
        <h1 className="mt-2.5 font-serif text-3xl">Pedidos</h1>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/admin/pedidos?vista=${tab.value}`}
            className={cn(
              "px-4 py-2.5 font-mono text-[11px] font-bold tracking-[0.12em] uppercase transition-colors",
              vista === tab.value
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:border-primary hover:text-primary"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {pedidos.length === 0 ? (
        <div className="border border-border p-10 text-center text-muted-foreground">
          No hay pedidos en esta vista.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {pedidos.map((pedido) => (
            <OrderRow key={pedido.id} pedido={pedido} />
          ))}
        </div>
      )}
    </div>
  )
}
