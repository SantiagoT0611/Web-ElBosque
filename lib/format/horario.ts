/** Colombia vive siempre en UTC-5, sin horario de verano — pero el servidor
 * (Vercel) no corre necesariamente en esa zona horaria, así que toda la
 * aritmética de "qué hora es en Bogotá ahora mismo" pasa por Intl en vez de
 * `Date.getHours()`/`Date.getDay()`, que reflejan la hora del servidor. */

const DIAS_SEMANA = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
] as const

type DiaSemana = (typeof DIAS_SEMANA)[number]

/** Agrupamiento usado en el formulario de configuración: lunes a jueves
 * comparten horario; viernes, sábado y domingo tienen cada uno el suyo. */
function claveHorario(dia: DiaSemana): string {
  if (dia === "lunes" || dia === "martes" || dia === "miercoles" || dia === "jueves") {
    return "lunes_jueves"
  }
  return dia
}

function diaAnterior(dia: DiaSemana): DiaSemana {
  const indice = DIAS_SEMANA.indexOf(dia)
  return DIAS_SEMANA[(indice + 6) % 7]
}

function getPartesBogota(): { dia: DiaSemana; minutos: number; year: number; month: number; day: number } {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date())

  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? ""
  const weekdayEnUS = valor("weekday").toLowerCase()
  const mapaDias: Record<string, DiaSemana> = {
    sunday: "domingo",
    monday: "lunes",
    tuesday: "martes",
    wednesday: "miercoles",
    thursday: "jueves",
    friday: "viernes",
    saturday: "sabado",
  }
  // hour="24" cuando es medianoche exacta con hour12:false en algunos motores — se normaliza a 0.
  const hora = Number(valor("hour")) % 24
  const minuto = Number(valor("minute"))

  return {
    dia: mapaDias[weekdayEnUS] ?? "domingo",
    minutos: hora * 60 + minuto,
    year: Number(valor("year")),
    month: Number(valor("month")),
    day: Number(valor("day")),
  }
}

/** Medianoche de "hoy" en Bogotá, como ISO en UTC — para reemplazar los
 * cálculos de "inicio del día" que hoy usan la hora local del servidor. */
export function getInicioDeHoyBogotaISO(): string {
  const { year, month, day } = getPartesBogota()
  // Medianoche en Bogotá (UTC-5, sin horario de verano) = 05:00 UTC del mismo día.
  return new Date(Date.UTC(year, month - 1, day, 5, 0, 0)).toISOString()
}

/** Fecha de "hoy" en Bogotá como "YYYY-MM-DD". */
export function getFechaDeHoyBogota(): string {
  const { year, month, day } = getPartesBogota()
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

const MERIDIANO_RE = "a\\.?\\s*m\\.?|p\\.?\\s*m\\.?"

/** Convierte "4:30" + meridiano opcional ("pm"/"a.m."/...) a minutos desde
 * medianoche. Sin meridiano se interpreta como 24 horas (ej. "16:30"). */
function parseHora(hora: string, meridiano: string | undefined): number | null {
  const [h, m] = hora.split(":").map(Number)
  if (m < 0 || m > 59) return null

  if (meridiano) {
    if (h < 1 || h > 12) return null
    const esPM = /^p/i.test(meridiano)
    return ((h % 12) + (esPM ? 12 : 0)) * 60 + m
  }
  if (h < 0 || h > 23) return null
  return h * 60 + m
}

/** Acepta tanto 24 horas ("16:30 - 23:00") como 12 horas con am/pm
 * ("4:30 pm - 11:00 pm", con o sin espacio/puntos) — un dueño de
 * restaurante escribe naturalmente en 12 horas, no hay razón para
 * exigirle que piense en 24. También normaliza guion largo/corto. */
function parseRango(rango: string | undefined): { inicio: number; fin: number } | null {
  if (!rango) return null
  const normalizado = rango.trim().replace(/[–—]/g, "-")
  const re = new RegExp(
    `^(\\d{1,2}:\\d{2})\\s*(${MERIDIANO_RE})?\\s*-\\s*(\\d{1,2}:\\d{2})\\s*(${MERIDIANO_RE})?$`,
    "i"
  )
  const match = normalizado.match(re)
  if (!match) return null

  const [, hora1, meridiano1, hora2, meridiano2] = match
  const inicio = parseHora(hora1, meridiano1)
  const fin = parseHora(hora2, meridiano2)
  if (inicio === null || fin === null) return null

  return { inicio, fin }
}

export type EstadoLocal = { abierto: boolean; mensaje: string }

const VENTANA_AVISO_MIN = 15

/** Si el local está abierto ahora mismo en Bogotá, con un mensaje listo para
 * mostrar. Si el horario no se puede interpretar, se asume abierto — un
 * bloqueo por error de formato costaría ventas reales, un falso "abierto"
 * solo genera un pedido inesperado. */
export function getEstadoLocal(horario: Record<string, string>): EstadoLocal {
  const { dia, minutos } = getPartesBogota()
  const claveHoy = claveHorario(dia)
  const rangoHoy = parseRango(horario[claveHoy])

  if (!rangoHoy) {
    return { abierto: true, mensaje: "Horario no configurado" }
  }

  const claveAyer = claveHorario(diaAnterior(dia))
  const mismaClaveQueAyer = claveAyer === claveHoy
  const rangoAyer = mismaClaveQueAyer ? null : parseRango(horario[claveAyer])

  const cruzaMedianoche = rangoHoy.fin <= rangoHoy.inicio

  // Dentro de la ventana de hoy: empezó hoy y sigue (con o sin cruce de
  // medianoche), o es la cola de una sesión que ya venía igual desde ayer
  // (mismo día agrupado, ej. lunes a jueves comparten horario).
  const dentroDeHoy =
    minutos >= rangoHoy.inicio && (cruzaMedianoche || minutos < rangoHoy.fin)
  const dentroDeColaMismoPatron =
    cruzaMedianoche && mismaClaveQueAyer && minutos < rangoHoy.fin

  // Cola de la sesión de ayer cuando ayer tiene un patrón distinto al de hoy
  // y esa sesión cruzó medianoche (ej. domingo 20:00-02:00 llegando al lunes).
  const dentroDeColaDeAyer =
    !!rangoAyer && rangoAyer.fin <= rangoAyer.inicio && minutos < rangoAyer.fin

  const abierto = dentroDeHoy || dentroDeColaMismoPatron || dentroDeColaDeAyer

  if (abierto) {
    const finEfectivo = dentroDeColaDeAyer && rangoAyer ? rangoAyer.fin : rangoHoy.fin
    const minutosParaCerrar =
      dentroDeColaMismoPatron || dentroDeColaDeAyer
        ? finEfectivo - minutos
        : cruzaMedianoche
          ? (finEfectivo - minutos + 1440) % 1440
          : finEfectivo - minutos
    if (minutosParaCerrar <= VENTANA_AVISO_MIN) {
      return { abierto: true, mensaje: `Cierra en ${minutosParaCerrar} minutos` }
    }
    return { abierto: true, mensaje: "Abierto ahora" }
  }

  const minutosParaAbrir = rangoHoy.inicio - minutos
  if (minutosParaAbrir > 0 && minutosParaAbrir <= VENTANA_AVISO_MIN) {
    return { abierto: false, mensaje: `Abre en ${minutosParaAbrir} minutos` }
  }

  const horaApertura = `${String(Math.floor(rangoHoy.inicio / 60)).padStart(2, "0")}:${String(rangoHoy.inicio % 60).padStart(2, "0")}`
  return { abierto: false, mensaje: `Cerrado — abre a las ${horaApertura}` }
}
