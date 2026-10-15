<template>
  <SeccionPanel id="inventario-estatus" titulo="Inventario por estatus">
    <p class="mt-3 flex items-baseline gap-2">
      <span class="font-mono text-4xl font-medium leading-none tabular-nums text-slate-900" data-kpi="totalBienes">{{ total }}</span>
      <span class="text-sm text-slate-500">bienes</span>
    </p>

    <div class="mt-3.5 flex h-3.5 gap-0.5" role="img" :aria-label="resumenAccesible">
      <div
        v-for="fila in filas"
        :key="fila.estatus"
        class="first:rounded-l last:rounded-r"
        :class="ESTATUS_BIEN_ESTILO[fila.estatus].barra"
        :style="{ flexGrow: fila.cantidad, flexBasis: 0 }"
      ></div>
    </div>

    <ul class="mt-2.5">
      <li v-for="fila in filas" :key="fila.estatus">
        <RouterLink
          :to="{ path: '/dashboard/bienes', query: { estatus: fila.estatus } }"
          class="group flex items-center gap-2.5 rounded py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          :data-kpi="fila.kpi"
        >
          <span class="h-2.5 w-2.5 shrink-0 rounded-full" :class="ESTATUS_BIEN_ESTILO[fila.estatus].punto" aria-hidden="true"></span>
          <span class="flex-1 group-hover:underline">
            {{ fila.etiqueta }}<span v-if="fila.nota" class="text-slate-500"> · {{ fila.nota }}</span>
          </span>
          <span class="font-mono font-medium tabular-nums text-slate-900">{{ fila.cantidad }}</span>
        </RouterLink>
      </li>
    </ul>
  </SeccionPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useBienesData, type EstatusBien } from '@/composables/useBienesData'
import { useMantenimientosData } from '@/composables/useMantenimientosData'
import { ESTATUS_BIEN_ESTILO } from '@/utils/estatus'
import SeccionPanel from './SeccionPanel.vue'

const { bienes } = useBienesData()
const { dictamenesVisibles } = useMantenimientosData()

const ORDEN: Array<{ estatus: EstatusBien; etiqueta: string; kpi: string }> = [
  { estatus: 'Asignado', etiqueta: 'Asignados', kpi: 'bienesAsignados' },
  { estatus: 'Por asignar', etiqueta: 'Por asignar', kpi: 'bienesSinAsignar' },
  { estatus: 'En reparación', etiqueta: 'En reparación', kpi: 'bienesEnReparacion' },
  { estatus: 'Baja', etiqueta: 'De baja', kpi: 'bienesBaja' },
]

const total = computed(() => bienes.length)

const filas = computed(() => {
  const dictamenes = dictamenesVisibles().length
  return ORDEN.map((item) => {
    const nota =
      item.estatus === 'Por asignar'
        ? 'en almacén'
        : item.estatus === 'Baja' && dictamenes > 0
          ? `${dictamenes} ${dictamenes === 1 ? 'dictamen emitido' : 'dictámenes emitidos'}`
          : ''
    return { ...item, nota, cantidad: bienes.filter((bien) => bien.estatus === item.estatus).length }
  })
})

const resumenAccesible = computed(() => filas.value.map((fila) => `${fila.cantidad} ${fila.etiqueta.toLowerCase()}`).join(', '))
</script>
