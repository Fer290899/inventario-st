<template>
  <div class="mx-auto max-w-7xl space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-slate-800">Panel de control</h2>
      <p class="mt-1 text-sm text-slate-500">Resumen general de bienes y mantenimientos</p>
    </div>

    <!-- KPIs -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        v-for="kpi in statCards"
        :key="kpi.id"
        :label="kpi.label"
        :value="kpi.value"
        :hint="kpi.hint"
        :icon="kpi.icon"
        :accent="kpi.accent"
      />
    </div>

    <!-- Últimos mantenimientos realizados -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <LastMaintenanceCard
        title="Último preventivo realizado"
        :icon="ICONO_RELOJ"
        accent="amber"
        :fecha="ultimoPreventivo.fecha"
        :tecnico="ultimoPreventivo.tecnico"
      />
      <LastMaintenanceCard
        title="Último correctivo realizado"
        :icon="ICONO_LLAVE"
        accent="rose"
        :fecha="ultimoCorrectivo.fecha"
        :tecnico="ultimoCorrectivo.tecnico"
      />
    </div>

    <!-- Gráficas -->
    <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <ChartCard title="Mantenimientos preventivos por día">
        <template #actions>
          <DaysRangeSelect v-model="preventivoDias" :options="RANGO_DIAS_OPCIONES" />
        </template>
        <VueApexCharts
          :key="preventivoDias"
          type="area"
          height="300"
          :options="preventivoOptions"
          :series="preventivoSeries"
        />
      </ChartCard>

      <ChartCard title="Mantenimientos correctivos concluidos por día">
        <template #actions>
          <DaysRangeSelect v-model="correctivoDias" :options="RANGO_DIAS_OPCIONES" />
        </template>
        <VueApexCharts
          :key="correctivoDias"
          type="area"
          height="300"
          :options="correctivoOptions"
          :series="correctivoSeries"
        />
      </ChartCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

import StatCard from '@/components/dashboard/StatCard.vue'
import ChartCard from '@/components/dashboard/ChartCard.vue'
import DaysRangeSelect from '@/components/dashboard/DaysRangeSelect.vue'
import LastMaintenanceCard from '@/components/dashboard/LastMaintenanceCard.vue'
import { buildDailyAreaChartOptions, buildDailySeries } from '@/components/dashboard/chartOptions'
import { useDashboardData, type DashboardKpi } from '@/composables/useDashboardData'

type StatAccent = 'brand' | 'neutral' | 'amber' | 'rose'

const {
  kpis,
  mantenimientosPreventivosPorDia,
  mantenimientosCorrectivosConcluidosPorDia,
  ultimoPreventivo,
  ultimoCorrectivo,
} = useDashboardData()

// Iconos reutilizados para los cards de "último mantenimiento".
const ICONO_RELOJ = 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z'
const ICONO_LLAVE =
  'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L1.5 3l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z'

// Presentación (icono/color) de cada KPI — se mantiene separada de los datos
// porque la data mock/API solo debería describir números, no detalles de UI.
const KPI_PRESENTATION: Record<DashboardKpi['id'], { icon: string; accent: StatAccent }> = {
  bienesAsignados: {
    accent: 'brand',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z',
  },
  bienesSinAsignar: {
    accent: 'neutral',
    icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
  },
  preventivosEnCurso: {
    accent: 'amber',
    icon: ICONO_RELOJ,
  },
  correctivosEnCurso: {
    accent: 'rose',
    icon: ICONO_LLAVE,
  },
}

const statCards = computed(() =>
  kpis.map((kpi) => ({
    ...kpi,
    ...KPI_PRESENTATION[kpi.id],
  })),
)

// Rango de días para cada gráfica: 7 por defecto, ampliable a 14/30/60.
const RANGO_DIAS_OPCIONES = [7, 14, 30, 60] as const
type RangoDias = (typeof RANGO_DIAS_OPCIONES)[number]

const preventivoDias = ref<RangoDias>(7)
const correctivoDias = ref<RangoDias>(7)

// Número de marcas de fecha a mostrar en el eje X, según el rango elegido
// (evita que se amontonen o corten al crecer el rango de días).
function tickAmountFor(dias: number) {
  return Math.min(dias, 7)
}

const preventivoOptions = computed(() =>
  buildDailyAreaChartOptions(
    { colorFrom: '#2563eb', colorTo: '#4f46e5' },
    { tickAmount: tickAmountFor(preventivoDias.value) },
  ),
)
const preventivoSeries = computed(() =>
  buildDailySeries(mantenimientosPreventivosPorDia.slice(-preventivoDias.value), 'Preventivos'),
)

const correctivoOptions = computed(() =>
  buildDailyAreaChartOptions(
    { colorFrom: '#f43f5e', colorTo: '#dc2626' },
    { tickAmount: tickAmountFor(correctivoDias.value) },
  ),
)
const correctivoSeries = computed(() =>
  buildDailySeries(
    mantenimientosCorrectivosConcluidosPorDia.slice(-correctivoDias.value),
    'Correctivos concluidos',
  ),
)
</script>
