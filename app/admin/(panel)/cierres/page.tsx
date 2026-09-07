import { listarCierres } from "@/lib/data/cierres"
import { formatCOP } from "@/lib/format/currency"

export default async function AdminCierresPage() {
  const cierres = await listarCierres()

  return (
    <div className="p-8">
      <div className="mb-7 border-b border-border pb-6">
        <span className="eyebrow">Control</span>
        <h1 className="mt-2.5 font-serif text-3xl">Historial de cierres</h1>
      </div>

      {cierres.length === 0 ? (
        <div className="border border-border p-10 text-center text-muted-foreground">
          Todavía no has cerrado ningún día. Hazlo desde el Dashboard.
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {cierres.map((cierre) => (
            <div
              key={cierre.id}
              className="grid grid-cols-2 gap-3 border border-border bg-card p-5 sm:grid-cols-5"
            >
              <div className="flex flex-col">
                <span className="font-serif text-lg">
                  {new Date(cierre.fecha + "T00:00:00").toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {cierre.total_pedidos} pedidos
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-sm text-primary">
                  {formatCOP(cierre.total_ventas)}
                </span>
                <span className="text-[11px] text-muted-foreground">Total ventas</span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-sm">{formatCOP(cierre.total_efectivo)}</span>
                <span className="text-[11px] text-muted-foreground">
                  Efectivo ({cierre.cantidad_efectivo})
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-mono text-sm">{formatCOP(cierre.total_transferencia)}</span>
                <span className="text-[11px] text-muted-foreground">
                  Transferencia ({cierre.cantidad_transferencia})
                </span>
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-mono text-[11px] text-muted-foreground">
                  Cerrado {new Date(cierre.created_at).toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
