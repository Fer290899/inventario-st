export interface DashboardKpi {
  id: 'bienesAsignados' | 'bienesSinAsignar' | 'preventivosEnCurso' | 'correctivosEnCurso'
  label: string
  value: number
  hint?: string
}

export interface DailyPoint {
  /** Fecha ISO (YYYY-MM-DD) */
  date: string
  total: number
}

export interface LastMaintenance {
  /** Fecha y hora ISO en que se finalizó el mantenimiento */
  fecha: string
  tecnico: string
}

export interface DashboardData {
  kpis: DashboardKpi[]
  /** Últimos 60 días de mantenimientos preventivos registrados, uno por día. */
  mantenimientosPreventivosPorDia: DailyPoint[]
  /** Últimos 60 días de mantenimientos correctivos concluidos, uno por día. */
  mantenimientosCorrectivosConcluidosPorDia: DailyPoint[]
  ultimoPreventivo: LastMaintenance
  ultimoCorrectivo: LastMaintenance
}

/** Máximo de días que las gráficas del dashboard pueden mostrar hacia atrás. */
export const MAX_DASHBOARD_DAYS = 60

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * Genera una serie diaria de ejemplo (patrón ondulado + variación
 * determinista) para simular datos de mantenimientos mientras no hay backend.
 */
function generateDailySeries(days: number, base: number, amplitude: number, seed: number): DailyPoint[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const points: DailyPoint[] = []
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(today)
    date.setDate(date.getDate() - offset)

    const dayIndex = days - 1 - offset
    const wave = Math.sin((dayIndex + seed) / 3.5) * amplitude
    const noise = ((dayIndex * seed * 37) % 5) - 2
    const total = Math.max(0, Math.round(base + wave + noise))

    points.push({ date: toIsoDate(date), total })
  }

  return points
}

export function useDashboardData(): DashboardData {
  const kpis: DashboardKpi[] = [
    {
      id: 'bienesAsignados',
      label: 'Bienes asignados',
      value: 482,
      hint: '+12 esta semana',
    },
    {
      id: 'bienesSinAsignar',
      label: 'Bienes sin asignar',
      value: 37,
      hint: '-3 respecto al mes pasado',
    },
    {
      id: 'preventivosEnCurso',
      label: 'Preventivos en curso',
      value: 6,
      hint: '2 programados para hoy',
    },
    {
      id: 'correctivosEnCurso',
      label: 'Correctivos en curso',
      value: 4,
      hint: '1 marcado como crítico',
    },
  ]

  const mantenimientosPreventivosPorDia = generateDailySeries(MAX_DASHBOARD_DAYS, 6, 3, 7)
  const mantenimientosCorrectivosConcluidosPorDia = generateDailySeries(MAX_DASHBOARD_DAYS, 4, 2, 13)

  const ultimoPreventivo: LastMaintenance = {
    fecha: '2026-09-14T10:30:00',
    tecnico: 'Carlos Méndez',
  }
  const ultimoCorrectivo: LastMaintenance = {
    fecha: '2026-09-13T16:45:00',
    tecnico: 'Ana Torres',
  }

  // TODO: reemplazar por la llamada real al servicio/store de dashboard,
  // ej. await dashboardApi.getResumen(dias) / dashboardStore.fetchResumen(dias)
  return {
    kpis,
    mantenimientosPreventivosPorDia,
    mantenimientosCorrectivosConcluidosPorDia,
    ultimoPreventivo,
    ultimoCorrectivo,
  }
}
