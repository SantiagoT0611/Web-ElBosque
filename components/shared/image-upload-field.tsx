"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"

export function ImageUploadField({
  bucket,
  value,
  onChange,
  label,
  hint,
}: {
  bucket: "productos" | "configuracion"
  value: string | null
  onChange: (url: string) => void
  label: string
  /** Resolución/proporción recomendada para este campo puntual (ej. "Horizontal,
   * mínimo 1200×800 px") — cada lugar donde se usa esta imagen recorta distinto. */
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.set("bucket", bucket)
      formData.set("file", file)
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "No se pudo subir la imagen.")
      onChange(data.url)
      toast.success("Imagen subida correctamente.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al subir la imagen.")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="font-display text-xs font-medium tracking-[0.06em] text-muted-foreground">
        {label}
      </span>
      <div className="flex items-center gap-4">
        <div className="flex size-20 shrink-0 items-center justify-center bg-stripe-placeholder">
          {value ? (
            <Image src={value} alt="" width={80} height={80} className="size-20 object-cover" />
          ) : (
            <span className="text-[9px] text-primary/50">SIN FOTO</span>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="border border-border px-4 py-2 font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {uploading ? "Subiendo..." : value ? "Cambiar imagen" : "Subir imagen"}
          </button>
          <span className="text-[11px] text-muted-foreground/70">JPG, PNG o WEBP · máx. 5 MB</span>
          {hint ? <span className="text-[11px] text-muted-foreground/70">{hint}</span> : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}
