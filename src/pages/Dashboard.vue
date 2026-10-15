<template>
  <div class="mx-auto max-w-[1240px] space-y-9">
    <div>
      <h1 class="page-title">Panel de control</h1>
      <p class="mt-2 text-sm text-slate-500">{{ fechaHoy }} · {{ totalBienes }} bienes registrados</p>
    </div>

    <div class="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_21rem]">
      <PanelAlertas />

      <div class="space-y-7">
        <InventarioPorEstatus />
        <ResumenMantenimiento
          v-if="kpiPreventivos && kpiCorrectivos"
          :preventivos="kpiPreventivos"
          :correctivos="kpiCorrectivos"
          :ultimo-preventivo="ultimoPreventivo"
          :ultimo-correctivo="ultimoCorrectivo"
        />
      </div>
    </div>

    <MantenimientosPorDia :preventivos="mantenimientosPreventivosPorDia" :correctivos="mantenimientosCorrectivosConcluidosPorDia" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import InventarioPorEstatus from '@/components/dashboard/InventarioPorEstatus.vue'
import MantenimientosPorDia from '@/components/dashboard/MantenimientosPorDia.vue'
import PanelAlertas from '@/components/dashboard/PanelAlertas.vue'
import ResumenMantenimiento from '@/components/dashboard/ResumenMantenimiento.vue'
import { useBienesData } from '@/composables/useBienesData'
import { useDashboardData } from '@/composables/useDashboardData'

const { kpis, mantenimientosPreventivosPorDia, mantenimientosCorrectivosConcluidosPorDia, ultimoPreventivo, ultimoCorrectivo } = useDashboardData()
const { bienes } = useBienesData()

const kpiPreventivos = computed(() => kpis.value.find((kpi) => kpi.id === 'preventivosPendientes'))
const kpiCorrectivos = computed(() => kpis.value.find((kpi) => kpi.id === 'correctivosAbiertos'))

const totalBienes = computed(() => bienes.length)

// "Lunes 12 de octubre": el día importa porque las alertas se cuentan desde hoy.
const fechaHoy = computed(() => {
  const texto = new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())
  return texto.charAt(0).toUpperCase() + texto.slice(1)
})
</script>
