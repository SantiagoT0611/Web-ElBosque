"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  ClipboardList,
  Beef,
  Tags,
  Settings,
  LogOut,
  ExternalLink,
  CalendarCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Star,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/cierres", label: "Cierres", icon: CalendarCheck },
  { href: "/admin/productos", label: "Productos", icon: Beef },
  { href: "/admin/categorias", label: "Categorías", icon: Tags },
  { href: "/admin/resenas", label: "Reseñas", icon: Star },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
]

const STORAGE_KEY = "el-bosque-admin-sidebar-colapsado"

export function AdminSidebar({ nombre }: { nombre: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [colapsado, setColapsado] = useState(false)

  useEffect(() => {
    // Lectura única de localStorage tras el montaje: en SSR no existe
    // `window`, así que el primer render siempre es "expandido" y se ajusta
    // aquí — no hay forma de sincronizar esto sin un efecto.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setColapsado(localStorage.getItem(STORAGE_KEY) === "1")
    } catch {
      // localStorage no disponible (modo privado, etc.) — se queda expandido
    }
  }, [])

  function toggleColapsado() {
    setColapsado((prev) => {
      const next = !prev
      try {
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0")
      } catch {
        // ignorar si no hay localStorage disponible
      }
      return next
    })
  }

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200",
        colapsado ? "w-[72px]" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex items-center border-b border-border py-6",
          colapsado ? "justify-center px-2" : "justify-between px-6"
        )}
      >
        {colapsado ? null : (
          <div>
            <div className="font-serif text-xl tracking-[0.05em] text-primary uppercase">
              El Bosque
            </div>
            <div className="mt-1 font-mono text-[9px] tracking-[0.25em] text-muted-foreground">
              PANEL ADMIN
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={toggleColapsado}
          title={colapsado ? "Expandir menú" : "Contraer menú"}
          className="flex size-8 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-primary"
        >
          {colapsado ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
        </button>
      </div>

      <div className={cn("pt-4", colapsado ? "px-2" : "px-4")}>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Ver tienda"
          className={cn(
            "flex items-center gap-2 border border-border py-2.5 font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase transition-colors hover:border-primary hover:text-primary",
            colapsado ? "justify-center px-2" : "justify-center px-3.5"
          )}
        >
          <ExternalLink className="size-3.5 shrink-0" />
          {colapsado ? null : "Ver tienda"}
        </Link>
      </div>

      <nav className={cn("flex flex-1 flex-col gap-1 p-4", colapsado && "px-2")}>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                "flex items-center gap-3 py-3 font-display text-xs font-bold tracking-[0.08em] uppercase transition-colors",
                colapsado ? "justify-center px-2" : "px-3.5",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {colapsado ? null : item.label}
            </Link>
          )
        })}
      </nav>

      <div className={cn("border-t border-border p-4", colapsado && "px-2")}>
        {colapsado ? null : (
          <div className="mb-3 px-1 text-xs text-muted-foreground">{nombre}</div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          title="Cerrar sesión"
          className={cn(
            "flex w-full items-center gap-3 py-3 font-display text-xs font-bold tracking-[0.08em] text-muted-foreground uppercase transition-colors hover:bg-muted hover:text-foreground",
            colapsado ? "justify-center px-2" : "px-3.5"
          )}
        >
          <LogOut className="size-4 shrink-0" />
          {colapsado ? null : "Cerrar sesión"}
        </button>
      </div>
    </aside>
  )
}
