import { Check } from "lucide-react"
import type { EstadoPedido, TipoEntrega } from "@/lib/orders/state-machine"
import { cn } from "@/lib/utils"

const FLUJO: Record<TipoEntrega, { estado: EstadoPedido; label: string }[]> = {
  domicilio: [
    { estado: "pendiente", label: "Pedido recibido" },
    { estado: "confirmado", label: "Confirmado" },
    { estado: "preparando", label: "Preparando" },
    { estado: "en_ruta", label: "En ruta" },
    { estado: "entregado", label: "Entregado" },
  ],
  recoger: [
    { estado: "pendiente", label: "Pedido recibido" },
    { estado: "confirmado", label: "Confirmado" },
    { estado: "preparando", label: "Preparando" },
    { estado: "listo_para_recoger", label: "Listo para recoger" },
    { estado: "entregado", label: "Entregado" },
  ],
}

export function OrderStatusStepper({
  estado,
  tipoEntrega,
}: {
  estado: EstadoPedido
  tipoEntrega: TipoEntrega
}) {
  if (estado === "cancelado") {
    return (
      <div className="border border-destructive/40 bg-destructive/10 px-5 py-4 font-mono text-sm tracking-[0.05em] text-destructive uppercase">
        Este pedido fue cancelado
      </div>
    )
  }

  const pasos = FLUJO[tipoEntrega]
  const indiceActual = pasos.findIndex((p) => p.estado === estado)

  return (
    <div className="flex flex-col gap-0">
      {pasos.map((paso, i) => {
        const completado = i < indiceActual
        const actual = i === indiceActual
        const pendiente = i > indiceActual
        return (
          <div key={paso.estado} className="flex gap-3.5">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center border font-mono text-[10px]",
                  completado && "border-primary bg-primary text-primary-foreground",
                  actual && "border-primary bg-transparent text-primary",
                  pendiente && "border-border text-muted-foreground/40"
                )}
              >
                {completado ? <Check className="size-3.5" /> : i + 1}
              </div>
              {i < pasos.length - 1 ? (
                <div
                  className={cn(
                    "w-px flex-1 min-h-6",
                    completado ? "bg-primary" : "bg-border"
                  )}
                />
              ) : null}
            </div>
            <div className={cn("pb-6 text-sm", pendiente ? "text-muted-foreground/50" : "text-foreground")}>
              {paso.label}
              {actual ? (
                <span className="ml-2 font-mono text-[10px] tracking-[0.1em] text-primary uppercase">
                  · en curso
                </span>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
