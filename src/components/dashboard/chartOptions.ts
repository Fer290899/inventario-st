import type { ApexOptions } from 'apexcharts'
import type { DailyPoint } from '@/composables/useDashboardData'

export interface DailyChartTheme {
  colorFrom: string
  colorTo: string
}

const SLATE_TEXT = '#64748b'
const SLATE_GRID = '#e2e8f0'

/**
 * Convierte una serie diaria { date, total } al formato { x, y } que espera
 * ApexCharts para un eje `datetime` (x como timestamp epoch en milisegundos).
 */
export function buildDailySeries(points: DailyPoint[], name: string) {
  return [
    {
      name,
      data: points.map((point) => ({
        x: new Date(`${point.date}T00:00:00`).getTime(),
        y: point.total,
      })),
    },
  ]
}

/**
 * Opciones compartidas para una gráfica de área con eje de fechas, usadas
 * por ambas gráficas del dashboard (solo cambia la paleta de color y,
 * según el rango de días elegido, cuántas marcas de fecha se muestran).
 */
export function buildDailyAreaChartOptions(theme: DailyChartTheme, options: { tickAmount?: number } = {}): ApexOptions {
  const { tickAmount = 7 } = options

  return {
    chart: {
      type: 'area',
      height: 300,
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'inherit',
      animations: { speed: 300 },
    },
    colors: [theme.colorFrom],
    stroke: {
      curve: 'smooth',
      width: 2,
    },
    dataLabels: { enabled: false },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.02,
        colorStops: [
          { offset: 0, color: theme.colorFrom, opacity: 0.35 },
          { offset: 100, color: theme.colorTo, opacity: 0.02 },
        ],
      },
    },
    grid: {
      borderColor: SLATE_GRID,
      strokeDashArray: 4,
      padding: { left: 12, right: 12 },
    },
    xaxis: {
      type: 'datetime',
      tickAmount,
      labels: {
        format: 'dd MMM',
        datetimeUTC: false,
        style: { colors: SLATE_TEXT, fontSize: '12px' },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: {
        style: { colors: SLATE_TEXT, fontSize: '12px' },
      },
    },
    tooltip: {
      x: { format: 'dd MMM yyyy' },
      theme: 'light',
    },
    markers: {
      size: 0,
      strokeColors: theme.colorFrom,
      strokeWidth: 2,
      hover: { size: 5 },
    },
  }
}
