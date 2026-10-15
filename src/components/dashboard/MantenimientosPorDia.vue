<template>
  <SeccionPanel id="mantenimientos-por-dia" titulo="Mantenimientos por día">
    <div class="mt-2 flex flex-wrap items-end justify-between gap-3">
      <ul class="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-slate-800">
        <li v-for="serie in series" :key="serie.name" class="inline-flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-sm" :style="{ background: serie.color }" aria-hidden="true"></span>
          {{ serie.name }}
        </li>
      </ul>

      <div role="group" aria-label="Rango de días" class="flex gap-4">
        <button
          v-for="opcion in RANGOS"
          :key="opcion"
          type="button"
          class="border-b-2 py-1 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          :class="dias === opcion ? 'border-blue-600 font-semibold text-slate-900' : 'border-transparent font-medium text-slate-500 hover:text-slate-800'"
          :aria-pressed="dias === opcion"
          @click="dias = opcion"
        >
          {{ opcion }} días
        </button>
      </div>
    </div>

    <div class="mt-3" role="img" :aria-label="resumenAccesible">
      <VueApexCharts :key="dias" type="bar" height="220" :options="grafica.options" :series="grafica.series" />
    </div>
  </SeccionPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { DailyPoint } from '@/composables/useDashboardData'
import { buildDailyBarChart, type SerieDiaria } from './chartOptions'
import SeccionPanel from './SeccionPanel.vue'

const props = defineProps<{
  preventivos: DailyPoint[]
  correctivos: DailyPoint[]
}>()

// Rango de días: 14 por defecto, ampliable a 30/60 o reducible a 7.
const RANGOS = [7, 14, 30, 60] as const
const dias = ref<(typeof RANGOS)[number]>(14)

const series = computed<SerieDiaria[]>(() => [
  { name: 'Preventivos', color: '#0D6E5C', puntos: props.preventivos.slice(-dias.value) },
  { name: 'Correctivos concluidos', color: '#B42318', puntos: props.correctivos.slice(-dias.value) },
])

// Evita que las marcas de fecha se amontonen al crecer el rango.
const grafica = computed(() => buildDailyBarChart(series.value, { tickAmount: Math.min(dias.value, 7) }))

const resumenAccesible = computed(() => {
  const suma = (puntos: DailyPoint[]) => puntos.reduce((total, punto) => total + punto.total, 0)
  const [preventivos, correctivos] = series.value
  return `Últimos ${dias.value} días: ${suma(preventivos!.puntos)} preventivos y ${suma(correctivos!.puntos)} correctivos concluidos.`
})
</script>
