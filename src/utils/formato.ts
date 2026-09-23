const fechaFormatter = new Intl.DateTimeFormat('es', { day: '2-digit', month: '2-digit', year: 'numeric' })
const monedaFormatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

/** Fecha ISO (YYYY-MM-DD) → DD/MM/AAAA */
export function formatFecha(fechaIso: string): string {
  return fechaFormatter.format(new Date(`${fechaIso}T00:00:00`))
}

export function formatMoneda(valor?: number): string {
  return valor === undefined ? '—' : monedaFormatter.format(valor)
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
