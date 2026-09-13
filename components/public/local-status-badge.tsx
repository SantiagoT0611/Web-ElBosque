import { getEstadoLocal } from "@/lib/format/horario"
import { cn } from "@/lib/utils"

export function LocalStatusBadge({ horario }: { horario: Record<string, string> }) {
  const { abierto, mensaje } = getEstadoLocal(horario)

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border px-3 py-1.5 font-mono text-[10px] tracking-[0.14em] uppercase",
        abierto ? "border-primary/50 text-primary" : "border-destructive/50 text-destructive"
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", abierto ? "bg-primary" : "bg-destructive")}
      />
      {mensaje}
    </span>
  )
}
