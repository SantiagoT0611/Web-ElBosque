import { cn } from "@/lib/utils"
import type { EstadoPedido } from "@/lib/orders/state-machine"

const ESTADO_LABEL: Record<EstadoPedido, string> = {
  pendiente: "Pendiente",
  confirmado: "Confirmado",
  preparando: "Preparando",
  en_ruta: "En ruta",
  listo_para_recoger: "Listo para recoger",
  entregado: "Entregado",
  cancelado: "Cancelado",
}

const ESTADO_CLASSES: Record<EstadoPedido, string> = {
  pendiente: "border border-primary bg-transparent text-primary",
  confirmado: "border-transparent bg-primary text-primary-foreground",
  preparando: "border-transparent bg-gold-light text-primary-foreground",
  en_ruta: "border-transparent bg-foreground text-background",
  listo_para_recoger: "border-transparent bg-foreground text-background",
  entregado: "border-transparent bg-foreground/10 text-muted-foreground",
  cancelado: "border-transparent bg-destructive text-destructive-foreground",
}

export function StatusBadge({
  estado,
  className,
}: {
  estado: EstadoPedido
  className?: string
}) {
  return (
    <span
      className={cn(
        "group/badge inline-flex h-auto w-fit shrink-0 items-center justify-center gap-1 px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.14em] uppercase whitespace-nowrap",
        ESTADO_CLASSES[estado],
        className
      )}
    >
      {ESTADO_LABEL[estado]}
    </span>
  )
}
