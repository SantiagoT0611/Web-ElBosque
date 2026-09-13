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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function DevolucionDialog({ pedidoId }: { pedidoId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [motivo, setMotivo] = useState("")
  const [loading, setLoading] = useState(false)

  async function registrarDevolucion() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/pedidos/${pedidoId}/devolucion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivo }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success("Devolución registrada.")
      setOpen(false)
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo registrar la devolución.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="border border-destructive/50 px-5 py-2.5 font-display text-xs font-bold tracking-[0.1em] text-destructive uppercase transition-colors hover:bg-destructive hover:text-destructive-foreground"
        >
          Registrar devolución
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-normal">Registrar devolución</DialogTitle>
          <DialogDescription>
            Esto marca el pedido como devuelto y descuenta el total de las ventas del día. No se
            puede deshacer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="motivo">Motivo</Label>
          <Textarea
            id="motivo"
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder="El cliente reportó que el pedido llegó incompleto..."
          />
        </div>

        <button
          type="button"
          disabled={loading || motivo.trim().length < 5}
          onClick={registrarDevolucion}
          className="bg-destructive p-3.5 text-center font-display text-xs font-bold tracking-[0.12em] uppercase text-destructive-foreground transition-colors disabled:opacity-50"
        >
          {loading ? "Registrando..." : "Confirmar devolución"}
        </button>
      </DialogContent>
    </Dialog>
  )
}
