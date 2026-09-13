"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { cartCount, useCartStore } from "@/store/cart-store"
import { formatCOP } from "@/lib/format/currency"
import { cartSubtotal } from "@/store/cart-store"
import { buildWhatsAppLink } from "@/lib/format/whatsapp"

const NAV_LINKS = [
  { href: "/#carta", label: "Carta" },
  { href: "/#combos", label: "Combos" },
  { href: "/#local", label: "El local" },
]

export function SiteHeader({ telefono }: { telefono?: string | null }) {
  const items = useCartStore((s) => s.items)
  const openCart = useCartStore((s) => s.open)
  const count = cartCount(items)
  const subtotal = cartSubtotal(items)
  const whatsappHref = buildWhatsAppLink(telefono, "Hola, quiero hacer una pregunta sobre mi pedido.")

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-5 px-5 py-4 sm:px-7">
        <Link href="/" className="flex items-baseline gap-3">
          <span className="font-serif text-2xl tracking-[0.05em] text-primary uppercase">
            El Bosque
          </span>
          <span className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground">
            HAMBURGUESERÍA
          </span>
        </Link>

        <nav className="hidden flex-wrap gap-6 font-display text-xs tracking-[0.12em] text-muted-foreground uppercase md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chatear por WhatsApp"
              className="flex size-9 items-center justify-center border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <MessageCircle className="size-4" />
            </a>
          ) : null}
          <Link
            href="/admin"
            className="border border-border px-4 py-2.5 font-mono text-[11px] tracking-[0.14em] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            ADMIN
          </Link>
          <button
            type="button"
            onClick={openCart}
            className="flex items-center gap-2.5 bg-primary px-5 py-2.5 font-display text-xs font-bold tracking-[0.1em] text-primary-foreground uppercase transition-colors hover:bg-gold-light"
          >
            <span>Carrito</span>
            <span className="font-mono">
              {count} · {formatCOP(subtotal)}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
