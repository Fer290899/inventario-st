const fechaFormatter = new Intl.DateTimeFormat('es', { day: '2-digit', month: '2-digit', year: 'numeric' })
const monedaFormatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

/** Fecha ISO (YYYY-MM-DD) → DD/MM/AAAA */
export function formatFecha(fechaIso: string): string {
  return fechaFormatter.format(new Date(`${fechaIso}T00:00:00`))
}

const monedaCentavosFormatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 })

/** Importe en MXN; con `centavos` muestra siempre 2 decimales (valores de adquisición). */
export function formatMoneda(valor?: number, opciones: { centavos?: boolean } = {}): string {
  if (valor === undefined) return '—'
  return (opciones.centavos ? monedaCentavosFormatter : monedaFormatter).format(valor)
}

/** Suma meses a una fecha ISO y devuelve otra fecha ISO. */
export function sumarMesesIso(fechaIso: string, meses: number): string {
  const fecha = new Date(`${fechaIso}T00:00:00`)
  fecha.setMonth(fecha.getMonth() + meses)
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function aIso(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, '0')
  const d = String(fecha.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Fecha de hoy (zona local) en ISO YYYY-MM-DD. */
export function hoyIso(): string {
  return aIso(new Date())
}

/** Suma (o resta, con valor negativo) días a una fecha ISO. */
export function sumarDiasIso(fechaIso: string, dias: number): string {
  const fecha = new Date(`${fechaIso}T00:00:00`)
  fecha.setDate(fecha.getDate() + dias)
  return aIso(fecha)
}

/** Días entre dos fechas ISO (b − a); positivo si b es posterior. */
export function diasEntre(aIsoFecha: string, bIsoFecha: string): number {
  const ms = new Date(`${bIsoFecha}T00:00:00`).getTime() - new Date(`${aIsoFecha}T00:00:00`).getTime()
  return Math.round(ms / 86_400_000)
}

const formateadorFechaHora = new Intl.DateTimeFormat('es', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

/** Fecha y hora local de un instante ISO completo, sin segundos. */
export function formatFechaHora(instanteIso: string): string {
  return formateadorFechaHora.format(new Date(instanteIso))
}

const fechaCortaFormatter = new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short', year: 'numeric' })

/** Fecha con mes abreviado (ej. "05 ene 2026"); acepta ISO de solo fecha o con hora. */
export function formatFechaCorta(fechaIso: string): string {
  return fechaCortaFormatter.format(new Date(fechaIso.length === 10 ? `${fechaIso}T00:00:00` : fechaIso))
}

/** Minúsculas y sin acentos, para comparar textos al buscar. */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}
