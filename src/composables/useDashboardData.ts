import { computed, type ComputedRef } from 'vue'
import { hoyIso, sumarDiasIso } from '@/utils/formato'
import { useAlertasData } from './useAlertasData'
import { useBienesData } from './useBienesData'
import { useMantenimientosData, type Mantenimiento } from './useMantenimientosData'

export interface DashboardKpi {
  id: 'bienesAsignados' | 'bienesSinAsignar' | 'preventivosPendientes' | 'correctivosAbiertos' | 'bienesBaja' | 'alertasActivas'
  label: string
  value: number
  hint?: string
  /** Pantalla filtrada a la que lleva la tarjeta; sin `to`, la tarjeta dispara una acción propia (alertas). */
  to?: { path: string; query?: Record<string, string> }
  /** Marca la tarjeta como crítica (se tiñe de rojo). */
  critico?: boolean
}

export interface DailyPoint {
  /** Fecha ISO (YYYY-MM-DD) */
  date: string
  total: number
}

export interface LastMaintenance {
  /** Fecha ISO (YYYY-MM-DD) en que se finalizó el mantenimiento */
  fecha: string
  tecnico: string
}

export interface DashboardData {
  kpis: ComputedRef<DashboardKpi[]>
  /** Últimos 60 días de mantenimientos preventivos registrados, uno por día. */
  mantenimientosPreventivosPorDia: ComputedRef<DailyPoint[]>
  /** Últimos 60 días de mantenimientos correctivos concluidos, uno por día. */
  mantenimientosCorrectivosConcluidosPorDia: ComputedRef<DailyPoint[]>
  ultimoPreventivo: ComputedRef<LastMaintenance | null>
  ultimoCorrectivo: ComputedRef<LastMaintenance | null>
}

/** Máximo de días que las gráficas del dashboard pueden mostrar hacia atrás. */
export const MAX_DASHBOARD_DAYS = 60

function serieDiaria(fechas: string[]): DailyPoint[] {
  const conteo = new Map<string, number>()
  for (const fecha of fechas) conteo.set(fecha, (conteo.get(fecha) ?? 0) + 1)

  const hoy = hoyIso()
  const puntos: DailyPoint[] = []
  for (let atras = MAX_DASHBOARD_DAYS - 1; atras >= 0; atras -= 1) {
    const date = sumarDiasIso(hoy, -atras)
    puntos.push({ date, total: conteo.get(date) ?? 0 })
  }
  return puntos
}

function ultimoConcluido(lista: Mantenimiento[]): LastMaintenance | null {
  const concluidos = lista.filter((item) => item.estatus === 'Concluido' && item.fechaConclusion)
  if (concluidos.length === 0) return null
  const ultimo = concluidos.reduce((a, b) => (a.fechaConclusion! >= b.fechaConclusion! ? a : b))
  return { fecha: ultimo.fechaConclusion!, tecnico: ultimo.tecnico }
}

export function useDashboardData(): DashboardData {
  // TODO: reemplazar por la llamada real al servicio/store de dashboard,
  // ej. await dashboardApi.getResumen(dias) / dashboardStore.fetchResumen(dias)
  const { bienes } = useBienesData()
  const { mantenimientosVisibles, dictamenesVisibles } = useMantenimientosData()
  const { resumen, idsDeFoco } = useAlertasData()

  const kpis = computed<DashboardKpi[]>(() => {
    const cuenta = (estatus: string) => bienes.filter((bien) => bien.estatus === estatus).length
    const asignados = cuenta('Asignado')
    const activos = bienes.length - cuenta('Baja')
    const enReparacion = cuenta('En reparación')
    const baja = cuenta('Baja')
    const preventivosPendientes = idsDeFoco('preventivos-pendientes').size
    const correctivosAbiertos = idsDeFoco('correctivos-abiertos').size
    const atrasados = resumen.value.porFoco['preventivo-vencido']

    const tarjetas: DashboardKpi[] = [
      {
        id: 'bienesAsignados',
        label: 'Bienes asignados',
        value: asignados,
        hint: `${activos ? Math.round((asignados / activos) * 100) : 0}% del inventario activo`,
        to: { path: '/dashboard/bienes', query: { estatus: 'Asignado' } },
      },
      {
        id: 'bienesSinAsignar',
        label: 'Bienes sin asignar',
        value: cuenta('Por asignar'),
        hint: 'Disponibles en almacén',
        to: { path: '/dashboard/bienes', query: { estatus: 'Por asignar' } },
      },
      {
        id: 'preventivosPendientes',
        label: 'Preventivos pendientes',
        value: preventivosPendientes,
        hint: `${atrasados} ${atrasados === 1 ? 'vencido' : 'vencidos'}`,
        to: { path: '/dashboard/mantenimiento', query: { tab: 'Preventivo', foco: 'preventivos-pendientes' } },
      },
      {
        id: 'correctivosAbiertos',
        label: 'Correctivos abiertos',
        value: correctivosAbiertos,
        hint: `${enReparacion} ${enReparacion === 1 ? 'bien' : 'bienes'} en reparación`,
        to: { path: '/dashboard/mantenimiento', query: { tab: 'Correctivo', foco: 'correctivos-abiertos' } },
      },
      {
        id: 'bienesBaja',
        label: 'Bienes dados de baja',
        value: baja,
        hint: `${dictamenesVisibles().length} ${dictamenesVisibles().length === 1 ? 'dictamen emitido' : 'dictámenes emitidos'}`,
        to: { path: '/dashboard/bienes', query: { estatus: 'Baja' } },
      },
      {
        id: 'alertasActivas',
        label: 'Alertas activas',
        value: resumen.value.total,
        hint: resumen.value.criticas > 0 ? `${resumen.value.criticas} ${resumen.value.criticas === 1 ? 'crítica' : 'críticas'}` : 'Sin críticas',
        critico: resumen.value.criticas > 0,
      },
    ]
    return tarjetas
  })

  const mantenimientosPreventivosPorDia = computed(() =>
    serieDiaria(mantenimientosVisibles().filter((item) => item.tipo === 'Preventivo' && item.estatus !== 'Cancelado').map((item) => item.fecha)),
  )
  const mantenimientosCorrectivosConcluidosPorDia = computed(() =>
    serieDiaria(
      mantenimientosVisibles()
        .filter((item) => item.tipo === 'Correctivo' && item.estatus === 'Concluido' && item.fechaConclusion)
        .map((item) => item.fechaConclusion!),
    ),
  )

  const ultimoPreventivo = computed(() => ultimoConcluido(mantenimientosVisibles().filter((item) => item.tipo === 'Preventivo')))
  const ultimoCorrectivo = computed(() => ultimoConcluido(mantenimientosVisibles().filter((item) => item.tipo === 'Correctivo')))

  return { kpis, mantenimientosPreventivosPorDia, mantenimientosCorrectivosConcluidosPorDia, ultimoPreventivo, ultimoCorrectivo }
}
