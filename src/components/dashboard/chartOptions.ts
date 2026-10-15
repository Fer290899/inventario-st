import type { ApexOptions } from 'apexcharts'
import type { DailyPoint } from '@/composables/useDashboardData'

const TEXTO = '#5F6A62'
const REJILLA = '#E4E1D6'
const EJE = '#14231F'

const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/** Fecha ISO (YYYY-MM-DD) → "12 oct", la etiqueta del eje X. */
export function etiquetaDia(fechaIso: string): string {
  const [, mes, dia] = fechaIso.split('-')
  return `${Number(dia)} ${MESES_CORTOS[Number(mes) - 1]}`
}

export interface SerieDiaria {
  name: string
  color: string
  puntos: DailyPoint[]
}

/**
 * Barras agrupadas por día: un conteo diario es una cantidad discreta, así que una barra lo dice
 * mejor que un área (que sugiere continuidad entre días). Todas las series comparten las fechas.
 */
export function buildDailyBarChart(
  series: SerieDiaria[],
  options: { tickAmount?: number } = {},
): { options: ApexOptions; series: Array<{ name: string; data: number[] }> } {
  const { tickAmount = 7 } = options
  const fechas = series[0]?.puntos.map((punto) => punto.date) ?? []

  return {
    series: series.map((serie) => ({ name: serie.name, data: serie.puntos.map((punto) => punto.total) })),
    options: {
      chart: {
        type: 'bar',
        height: 220,
        toolbar: { show: false },
        zoom: { enabled: false },
        fontFamily: 'inherit',
        animations: { speed: 250 },
      },
      colors: series.map((serie) => serie.color),
      plotOptions: { bar: { columnWidth: '70%', borderRadius: 2, borderRadiusApplication: 'end' } },
      stroke: { show: true, width: 1, colors: ['transparent'] },
      dataLabels: { enabled: false },
      legend: { show: false },
      grid: {
        borderColor: REJILLA,
        strokeDashArray: 0,
        padding: { left: 8, right: 8 },
        xaxis: { lines: { show: false } },
      },
      xaxis: {
        categories: fechas.map(etiquetaDia),
        tickAmount,
        tickPlacement: 'on',
        labels: { rotate: 0, hideOverlappingLabels: true, style: { colors: TEXTO, fontSize: '12px' } },
        axisBorder: { show: true, color: EJE },
        axisTicks: { show: false },
      },
      yaxis: {
        min: 0,
        forceNiceScale: true,
        labels: { style: { colors: TEXTO, fontSize: '12px' }, formatter: (valor: number) => String(Math.round(valor)) },
      },
      tooltip: { shared: true, intersect: false, theme: 'light' },
      states: { hover: { filter: { type: 'none' } } },
    },
  }
}
