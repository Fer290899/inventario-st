<template>
  <SeccionPanel id="resumen-mantenimiento" titulo="Mantenimiento">
    <div class="mt-4 grid grid-cols-2 gap-4">
      <RouterLink
        v-for="item in items"
        :key="item.id"
        :to="item.to"
        class="block rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        :data-kpi="item.id"
      >
        <span class="block font-mono text-4xl font-medium leading-none tabular-nums text-slate-900">{{ item.valor }}</span>
        <span class="mt-1.5 block text-sm text-slate-800">{{ item.etiqueta }}</span>
        <span v-if="item.hint" class="mt-0.5 block text-[13px] font-semibold" :class="item.hintClase">{{ item.hint }}</span>
        <span class="mt-2 block text-xs text-slate-500">{{ item.ultimo }}</span>
      </RouterLink>
    </div>
  </SeccionPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import type { DashboardKpi, LastMaintenance } from '@/composables/useDashboardData'
import { formatFechaCorta } from '@/utils/formato'
import SeccionPanel from './SeccionPanel.vue'

const props = defineProps<{
  preventivos: DashboardKpi
  correctivos: DashboardKpi
  ultimoPreventivo: LastMaintenance | null
  ultimoCorrectivo: LastMaintenance | null
}>()

function textoUltimo(ultimo: LastMaintenance | null): string {
  return ultimo ? `Último concluido: ${formatFechaCorta(ultimo.fecha)} · ${ultimo.tecnico}` : 'Aún no hay concluidos'
}

const items = computed(() => [
  {
    id: props.preventivos.id,
    valor: props.preventivos.value,
    etiqueta: 'Preventivos pendientes',
    hint: props.preventivos.hint,
    // Los vencidos son el dato que pide acción; si no hay ninguno, el apoyo queda neutro.
    hintClase: props.preventivos.hint?.startsWith('0 ') ? 'text-slate-500' : 'text-amber-700',
    to: props.preventivos.to as RouteLocationRaw,
    ultimo: textoUltimo(props.ultimoPreventivo),
  },
  {
    id: props.correctivos.id,
    valor: props.correctivos.value,
    etiqueta: 'Correctivos abiertos',
    hint: props.correctivos.hint,
    hintClase: 'text-slate-500',
    to: props.correctivos.to as RouteLocationRaw,
    ultimo: textoUltimo(props.ultimoCorrectivo),
  },
])
</script>
