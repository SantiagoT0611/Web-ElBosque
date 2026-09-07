"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { formatCOP } from "@/lib/format/currency"
import type { ResumenCierre } from "@/lib/data/cierres"

export function CerrarDiaDialog({
  resumenInicial,
  yaCerradoHoyInicial,
}: {
  resumenInicial: ResumenCierre
  yaCerradoHoyInicial: boolean
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [resumen, setResumen] = useState(resumenInicial)
  const [yaCerradoHoy, setYaCerradoHoy] = useState(yaCerradoHoyInicial)
  const [loading, setLoading] = useState(false)
  const [cerrado, setCerrado] = useState(false)

  async function abrir() {
    setOpen(true)
    setCerrado(false)
    const res = await fetch("/api/admin/cierres")
    if (res.ok) {
      const data = await res.json()
      setResumen(data.resumen)
      setYaCerradoHoy(data.yaCerradoHoy)
    }
  }

  async function confirmarCierre() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/cierres", { method: "POST" })
      if (!res.ok) throw new Error((await res.json()).error)
      setCerrado(true)
      toast.success("Día cerrado correctamente.")
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cerrar el día.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          onClick={abrir}
          className="border border-primary/50 px-5 py-2.5 font-display text-xs font-bold tracking-[0.1em] text-primary uppercase transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Cerrar día
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-normal">
            {cerrado ? "Día cerrado" : "Resumen del día"}
          </DialogTitle>
          <DialogDescription>
            {cerrado
              ? "Este cierre quedó guardado en el historial."
              : new Date(resumen.fecha + "T00:00:00").toLocaleDateString("es-CO", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
          </DialogDescription>
        </DialogHeader>

        <dl className="flex flex-col gap-2.5 border border-border p-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Total de pedidos</dt>
            <dd className="font-mono">{resumen.totalPedidos}</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-2.5">
            <dt className="text-muted-foreground">Total en ventas</dt>
            <dd className="font-mono text-primary">{formatCOP(resumen.totalVentas)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Efectivo <span className="text-xs">({resumen.cantidadEfectivo})</span>
            </dt>
            <dd className="font-mono">{formatCOP(resumen.totalEfectivo)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Transferencia <span className="text-xs">({resumen.cantidadTransferencia})</span>
            </dt>
            <dd className="font-mono">{formatCOP(resumen.totalTransferencia)}</dd>
          </div>
        </dl>

        {!cerrado ? (
          <>
            {yaCerradoHoy ? (
              <p className="text-xs text-muted-foreground">
                Ya cerraste el día hoy. Si confirmas, se actualizará ese cierre con los totales
                más recientes.
              </p>
            ) : null}
            <button
              type="button"
              disabled={loading}
              onClick={confirmarCierre}
              className="bg-primary p-3.5 text-center font-display text-xs font-bold tracking-[0.12em] uppercase text-primary-foreground transition-colors hover:bg-gold-light disabled:opacity-50"
            >
              {loading ? "Cerrando..." : yaCerradoHoy ? "Actualizar cierre" : "Confirmar cierre"}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="border border-border p-3.5 text-center font-display text-xs font-bold tracking-[0.12em] uppercase text-foreground transition-colors hover:border-primary hover:text-primary"
          >
            Cerrar
          </button>
        )}
      </DialogContent>
    </Dialog>
  )
}
