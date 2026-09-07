"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { configuracionSchema, type ConfiguracionInput } from "@/lib/validations/configuracion.schema"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUploadField } from "@/components/shared/image-upload-field"

const DIAS_HORARIO: { key: string; label: string }[] = [
  { key: "lunes_jueves", label: "Lunes a jueves" },
  { key: "viernes_sabado", label: "Viernes y sábado" },
  { key: "domingo", label: "Domingo" },
]

export default function AdminConfiguracionPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [qrUrl, setQrUrl] = useState<string | null>(null)

  const form = useForm<ConfiguracionInput>({
    resolver: zodResolver(configuracionSchema),
    defaultValues: {
      nombre_restaurante: "",
      direccion: "",
      telefono: "",
      horario_atencion: {},
      costo_domicilio_default: 0,
      banco_nombre: "",
      banco_tipo_cuenta: "",
      banco_numero_cuenta: "",
      banco_titular: "",
      banco_documento: "",
    },
  })

  useEffect(() => {
    fetch("/api/admin/configuracion")
      .then((r) => r.json())
      .then(({ configuracion }) => {
        form.reset({
          nombre_restaurante: configuracion.nombre_restaurante,
          direccion: configuracion.direccion ?? "",
          telefono: configuracion.telefono ?? "",
          horario_atencion: configuracion.horario_atencion ?? {},
          costo_domicilio_default: configuracion.costo_domicilio_default,
          banco_nombre: configuracion.banco_nombre ?? "",
          banco_tipo_cuenta: configuracion.banco_tipo_cuenta ?? "",
          banco_numero_cuenta: configuracion.banco_numero_cuenta ?? "",
          banco_titular: configuracion.banco_titular ?? "",
          banco_documento: configuracion.banco_documento ?? "",
        })
        setQrUrl(configuracion.qr_transferencia_url)
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onSubmit(values: ConfiguracionInput) {
    setSubmitting(true)
    try {
      const res = await fetch("/api/admin/configuracion", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success("Configuración guardada.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo guardar.")
    } finally {
      setSubmitting(false)
    }
  }

  async function handleQrChange(url: string) {
    setQrUrl(url)
    await fetch("/api/admin/configuracion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ qr_transferencia_url: url }),
    })
    toast.success("Código QR actualizado.")
  }

  const horario = form.watch("horario_atencion")

  if (loading) {
    return <div className="p-8 text-muted-foreground">Cargando...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-7 border-b border-border pb-6">
        <span className="eyebrow">Ajustes</span>
        <h1 className="mt-2.5 font-serif text-3xl">Configuración del restaurante</h1>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid max-w-2xl grid-cols-1 gap-6">
        <div className="border border-border p-6">
          <div className="mb-4 font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
            Datos generales
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nombre_restaurante">Nombre del restaurante</Label>
              <Input id="nombre_restaurante" {...form.register("nombre_restaurante")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" {...form.register("direccion")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" {...form.register("telefono")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="costo_domicilio_default">Costo de domicilio por defecto (COP)</Label>
              <Input
                id="costo_domicilio_default"
                type="number"
                {...form.register("costo_domicilio_default", { valueAsNumber: true })}
              />
            </div>
          </div>
        </div>

        <div className="border border-border p-6">
          <div className="mb-4 font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
            Horario de atención
          </div>
          <div className="flex flex-col gap-3">
            {DIAS_HORARIO.map((dia) => (
              <div key={dia.key} className="flex flex-col gap-1.5">
                <Label htmlFor={`horario-${dia.key}`}>{dia.label}</Label>
                <Input
                  id={`horario-${dia.key}`}
                  placeholder="12:00 – 23:00"
                  value={horario?.[dia.key] ?? ""}
                  onChange={(e) =>
                    form.setValue("horario_atencion", {
                      ...form.getValues("horario_atencion"),
                      [dia.key]: e.target.value,
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border border-border p-6">
          <div className="mb-4 font-mono text-[10px] tracking-[0.2em] text-primary uppercase">
            Pago por transferencia
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="banco_nombre">Banco</Label>
              <Input id="banco_nombre" {...form.register("banco_nombre")} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="banco_tipo_cuenta">Tipo de cuenta</Label>
                <Input id="banco_tipo_cuenta" {...form.register("banco_tipo_cuenta")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="banco_numero_cuenta">Número de cuenta</Label>
                <Input id="banco_numero_cuenta" {...form.register("banco_numero_cuenta")} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="banco_titular">Titular</Label>
              <Input id="banco_titular" {...form.register("banco_titular")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="banco_documento">NIT / documento</Label>
              <Input id="banco_documento" {...form.register("banco_documento")} />
            </div>
            <ImageUploadField
              bucket="configuracion"
              value={qrUrl}
              onChange={handleQrChange}
              label="Código QR para transferencias"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-primary p-4 text-center font-display text-xs font-bold tracking-[0.12em] uppercase text-primary-foreground transition-colors hover:bg-gold-light disabled:opacity-50"
        >
          {submitting ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  )
}
