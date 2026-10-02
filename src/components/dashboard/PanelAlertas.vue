<template>
  <section id="panel-alertas" class="scroll-mt-4 rounded-lg border border-slate-200 bg-white" aria-labelledby="panel-alertas-titulo">
    <div class="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 id="panel-alertas-titulo" class="text-base font-semibold text-slate-800">Requiere atención</h3>
        <p class="text-xs text-slate-500">
          {{ resumen.total }} {{ resumen.total === 1 ? 'alerta activa' : 'alertas activas' }}
          <template v-if="resumen.criticas > 0"> · {{ resumen.criticas }} {{ resumen.criticas === 1 ? 'crítica' : 'críticas' }}</template>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div class="overflow-x-auto">
          <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              v-for="chip in CHIPS"
              :key="chip.valor"
              type="button"
              class="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
              :class="grupoActivo === chip.valor ? 'bg-white text-blue-700' : 'text-slate-500 hover:text-slate-700'"
              :aria-pressed="grupoActivo === chip.valor"
              @click="grupoActivo = chip.valor"
            >
              {{ chip.etiqueta }}
              <span
                class="rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums"
                :class="grupoActivo === chip.valor ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/70 text-slate-500'"
              >
                {{ conteo(chip.valor) }}
              </span>
            </button>
          </div>
        </div>
        <BaseSelect v-if="departamentos.length > 0" v-model="departamentoActivo" size="sm" class="w-auto min-w-[11rem]" aria-label="Filtrar por departamento" data-doc="filtro-departamento-alertas">
          <option value="">Todos los departamentos</option>
          <option v-for="depto in departamentos" :key="depto" :value="depto">{{ depto }}</option>
        </BaseSelect>
      </div>
    </div>

    <ul v-if="visibles.length > 0" class="max-h-96 divide-y divide-slate-100 overflow-auto" data-doc="lista-alertas">
      <li v-for="alerta in visibles" :key="alerta.id">
        <button
          type="button"
          class="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
          @click="abrir(alerta)"
        >
          <span class="inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-medium" :class="SEVERIDAD_ESTILOS[alerta.severidad]">
            {{ SEVERIDAD_ETIQUETA[alerta.severidad] }}
          </span>
          <span class="min-w-0 flex-1">
            <span class="block text-sm font-medium text-slate-800 sm:truncate">{{ alerta.titulo }}</span>
            <span class="block text-xs text-slate-500 sm:truncate">{{ alerta.detalle }}</span>
          </span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </li>
    </ul>
    <EmptyState v-else mensaje="Todo al día: no hay alertas activas." />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { GRUPO_ETIQUETAS, grupoDe, useAlertasData, type Alerta, type GrupoAlerta } from '@/composables/useAlertasData'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import { SEVERIDAD_ESTILOS, SEVERIDAD_ETIQUETA } from './alertaEstilos'

type Chip = GrupoAlerta | 'todas'

const { alertas, resumen } = useAlertasData()
const router = useRouter()

const CHIPS: Array<{ valor: Chip; etiqueta: string }> = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'preventivos', etiqueta: GRUPO_ETIQUETAS.preventivos },
  { valor: 'garantias', etiqueta: GRUPO_ETIQUETAS.garantias },
  { valor: 'correctivos', etiqueta: GRUPO_ETIQUETAS.correctivos },
]

const grupoActivo = ref<Chip>('todas')
const departamentoActivo = ref('')

// Solo los departamentos que de verdad tienen alguna alerta activa, para no mostrar opciones vacías.
const departamentos = computed(() => {
  const nombres = new Set<string>()
  for (const alerta of alertas.value) if (alerta.departamento) nombres.add(alerta.departamento)
  return [...nombres].sort((a, b) => a.localeCompare(b, 'es'))
})

const visibles = computed(() =>
  alertas.value
    .filter((alerta) => grupoActivo.value === 'todas' || grupoDe(alerta.foco) === grupoActivo.value)
    .filter((alerta) => departamentoActivo.value === '' || alerta.departamento === departamentoActivo.value),
)

function conteo(chip: Chip): number {
  return chip === 'todas' ? resumen.value.total : resumen.value.porGrupo[chip]
}

function abrir(alerta: Alerta) {
  router.push(alerta.destino)
}
</script>
