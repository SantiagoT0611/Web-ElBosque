import Link from "next/link"
import { ExternalLink, MessageCircle, Star } from "lucide-react"
import { getMenuPublico } from "@/lib/data/menu"
import { getConfiguracion } from "@/lib/data/configuracion"
import { getResenasAprobadas } from "@/lib/data/resenas"
import { buildWhatsAppLink } from "@/lib/format/whatsapp"
import { ProductCard } from "@/components/public/product-card"
import { SideItemCard } from "@/components/public/side-item-card"
import { LocalStatusBadge } from "@/components/public/local-status-badge"
import { HeroCarousel } from "@/components/public/hero-carousel"

const HORARIOS_LABEL: Record<string, string> = {
  lunes_jueves: "Lunes a jueves",
  viernes: "Viernes",
  sabado: "Sábado",
  domingo: "Domingo",
}

export default async function HomePage() {
  const [categorias, configuracion, resenas] = await Promise.all([
    getMenuPublico(),
    getConfiguracion(),
    getResenasAprobadas(),
  ])

  const hamburguesas = categorias.find((c) => c.slug === "hamburguesas")
  const combos = categorias.find((c) => c.slug === "combos")
  const acompanamientos = categorias.find((c) => c.slug === "acompanamientos-y-bebidas")
  const otrasCategorias = categorias.filter(
    (c) => !["hamburguesas", "combos", "acompanamientos-y-bebidas"].includes(c.slug)
  )
  const horario = (configuracion.horario_atencion ?? {}) as Record<string, string>
  const fotosPanoramicas = configuracion.fotos_panoramicas ?? []
  const whatsappHref = buildWhatsAppLink(configuracion.telefono)
  const direccionMaps = `${configuracion.direccion}, Colombia`

  return (
    <div>
      {/* Hero */}
      <div className="mx-auto max-w-[1240px] px-5 sm:px-7">
        <div className="relative pt-12 pb-8 sm:pt-14">
          <div className="relative flex h-[min(46vh,400px)] min-h-[220px] items-center justify-center overflow-hidden bg-stripe-placeholder">
            {fotosPanoramicas.length > 0 ? (
              <HeroCarousel fotos={fotosPanoramicas} alt={configuracion.nombre_restaurante} />
            ) : (
              <span className="border border-primary/30 px-4 py-2.5 text-center font-mono text-[11px] tracking-[0.16em] text-primary/60">
                FOTO PANORÁMICA — parrilla al carbón, humo, luz cálida
              </span>
            )}
          </div>
          <div className="relative mx-auto -mt-16 max-w-[780px] border border-primary/30 bg-background px-6 py-9 text-center sm:px-10">
            <span className="font-mono text-[10px] tracking-[0.32em] text-primary">
              PIDE EN LÍNEA · RECOGE O TE LA LLEVAMOS
            </span>
            <h1 className="mt-3.5 font-serif text-[clamp(32px,6vw,68px)] leading-[1.03]">
              La hamburguesa que
              <br />
              <em className="font-serif text-primary italic">merece la espera</em>
            </h1>
            <p className="mx-auto mt-4 max-w-[52ch] text-base leading-relaxed text-muted-foreground">
              Somos una propuesta artesanal de cocina artesanal, nos gusta brindarte nuestro mejor sabor.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              <Link
                href="#carta"
                className="bg-primary px-7 py-3.5 font-display text-[13px] font-bold tracking-[0.1em] text-primary-foreground uppercase transition-colors hover:bg-gold-light"
              >
                Ver la carta
              </Link>
              <Link
                href="#local"
                className="border border-border px-7 py-3.5 font-display text-[13px] font-bold tracking-[0.1em] text-foreground uppercase transition-colors hover:border-primary hover:text-primary"
              >
                Cómo llegar
              </Link>
            </div>
            <div className="mt-5 flex justify-center">
              <LocalStatusBadge horario={horario} />
            </div>
          </div>
        </div>
      </div>

      {/* Carta */}
      {hamburguesas ? (
        <section id="carta" className="mx-auto max-w-[1240px] scroll-mt-24 px-5 pt-14 pb-5 sm:px-7">
          <div className="flex flex-wrap items-end justify-between gap-5 border-b border-border pb-5">
            <div>
              <span className="eyebrow">La carta</span>
              <h2 className="mt-2.5 font-serif text-[clamp(28px,4vw,46px)] leading-none">
                {hamburguesas.nombre}
              </h2>
            </div>
            <span className="text-[13px] text-muted-foreground">
              El bosque
            </span>
          </div>
          <div className="grid grid-cols-1 gap-6 pt-7 sm:grid-cols-2">
            {hamburguesas.productos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        </section>
      ) : null}

      {acompanamientos ? (
        <section className="mx-auto max-w-[1240px] px-5 pt-10 sm:px-7">
          <h3 className="border-b border-border pb-4 font-serif text-[clamp(24px,3vw,36px)] leading-none">
            {acompanamientos.nombre}
          </h3>
          <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2">
            {acompanamientos.productos.map((producto) => (
              <SideItemCard key={producto.id} producto={producto} />
            ))}
          </div>
        </section>
      ) : null}

      {otrasCategorias.map((categoria) => (
        <section
          key={categoria.id}
          className="mx-auto max-w-[1240px] px-5 pt-10 sm:px-7"
        >
          <h3 className="border-b border-border pb-4 font-serif text-[clamp(24px,3vw,36px)] leading-none">
            {categoria.nombre}
          </h3>
          <div className="grid grid-cols-1 gap-6 pt-7 sm:grid-cols-2">
            {categoria.productos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        </section>
      ))}

      {/* Combos */}
      {combos ? (
        <section id="combos" className="mx-auto max-w-[1240px] scroll-mt-24 px-5 pt-16 sm:px-7">
          <span className="eyebrow">Promociones</span>
          <h2 className="mt-2.5 mb-6 font-serif text-[clamp(28px,4vw,46px)] leading-none">
            Vale la pena venir seguido
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {combos.productos.map((producto) => (
              <ProductCard key={producto.id} producto={producto} />
            ))}
          </div>
        </section>
      ) : null}

      {/* El local */}
      <section id="local" className="mx-auto max-w-[1240px] scroll-mt-24 px-5 py-16 sm:px-7">
        <span className="eyebrow">El local</span>
        <h2 className="mt-2.5 mb-6 font-serif text-[clamp(28px,4vw,46px)] leading-none">
          {configuracion.direccion}
        </h2>
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2">
          <div className="group relative flex min-h-[280px] flex-col overflow-hidden border border-border bg-stripe-placeholder">
            <iframe
              src={`https://www.google.com/maps?q=${encodeURIComponent(direccionMaps)}&output=embed`}
              title={`Mapa — ${configuracion.direccion}`}
              loading="lazy"
              className="pointer-events-none absolute inset-0 size-full grayscale contrast-125 brightness-90 transition-[filter] duration-300 group-hover:grayscale-0 group-hover:brightness-100"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent" />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionMaps)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 mt-auto flex items-center gap-2 px-5 py-4 font-mono text-[11px] tracking-[0.14em] text-primary transition-colors hover:text-gold-light"
            >
              <ExternalLink className="size-4" />
              Abrir en Google Maps
            </a>
          </div>
          <div className="flex flex-col border border-border">
            <div className="border-b border-border px-6 py-5">
              <div className="mb-2 font-mono text-[10px] tracking-[0.2em] text-primary">HORARIOS</div>
              <div className="text-[15px] leading-relaxed text-muted-foreground/90">
                {Object.entries(horario).map(([dia, rango]) => (
                  <div key={dia}>
                    {HORARIOS_LABEL[dia] ?? dia} · {rango}
                  </div>
                ))}
              </div>
            </div>
            <div className="border-b border-border px-6 py-5">
              <div className="mb-2 font-mono text-[10px] tracking-[0.2em] text-primary">CONTACTO</div>
              <div className="text-[15px] leading-relaxed text-muted-foreground/90">
                Teléfono · {configuracion.telefono}
              </div>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] text-primary transition-colors hover:text-gold-light"
                >
                  <MessageCircle className="size-3.5" />
                  Escríbenos por WhatsApp
                </a>
              ) : null}
              {Object.entries((configuracion.redes_sociales ?? {}) as Record<string, string>)
                .filter(([, url]) => url)
                .map(([red, url]) => (
                  <a
                    key={red}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 flex items-center gap-1.5 text-[13px] text-primary transition-colors hover:text-gold-light"
                  >
                    <ExternalLink className="size-3.5" />
                    {red.charAt(0).toUpperCase() + red.slice(1)}
                  </a>
                ))}
            </div>
            <div className="flex flex-1 flex-col justify-center gap-2.5 px-6 py-5">
              <div className="font-mono text-[10px] tracking-[0.2em] text-primary">DOMICILIOS</div>
              <div className="text-[15px] leading-relaxed text-muted-foreground/90">
                Costo de envío estándar:{" "}
                {new Intl.NumberFormat("es-CO", {
                  style: "currency",
                  currency: "COP",
                  maximumFractionDigits: 0,
                }).format(configuracion.costo_domicilio_default)}
              </div>
              <Link
                href="#carta"
                className="mt-1.5 self-start bg-primary px-6 py-3 font-display text-xs font-bold tracking-[0.1em] text-primary-foreground uppercase transition-colors hover:bg-gold-light"
              >
                Pedir a domicilio
              </Link>
            </div>
          </div>
        </div>
      </section>

      {resenas.length > 0 ? (
        <section id="resenas" className="mx-auto max-w-[1240px] px-5 py-16 sm:px-7">
          <span className="eyebrow">Reseñas</span>
          <h2 className="mt-2.5 mb-7 font-serif text-[clamp(28px,4vw,46px)] leading-none">
            Lo que dicen nuestros clientes
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resenas.map((resena) => (
              <div key={resena.id} className="flex flex-col gap-2.5 border border-border bg-card p-5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={
                        n <= resena.calificacion
                          ? "size-3.5 fill-primary text-primary"
                          : "size-3.5 text-muted-foreground"
                      }
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{resena.comentario}&rdquo;
                </p>
                <span className="font-mono text-[11px] tracking-[0.1em] text-primary uppercase">
                  {resena.cliente_nombre}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mx-auto flex max-w-[1240px] flex-wrap justify-between gap-4 px-5 py-8 font-mono text-[11px] tracking-[0.14em] text-muted-foreground/60 uppercase sm:px-7">
        <span>
          {configuracion.direccion} · {configuracion.telefono}
        </span>
      </div>
    </div>
  )
}
