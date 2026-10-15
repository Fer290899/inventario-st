<template>
  <div id="panel-alertas" class="scroll-mt-4">
    <PestanaCarpeta id="panel-alertas-titulo" titulo="Requiere atención">
      <template #acciones>
        <div role="group" aria-label="Filtrar por tipo de alerta" class="flex flex-wrap items-center gap-x-4 gap-y-1">
          <button
            v-for="chip in CHIPS"
            :key="chip.valor"
            type="button"
            class="inline-flex items-baseline gap-1.5 whitespace-nowrap border-b-2 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            :class="grupoActivo === chip.valor ? 'border-blue-600 font-semibold text-slate-900' : 'border-transparent font-medium text-slate-500 hover:text-slate-800'"
            :aria-pressed="grupoActivo === chip.valor"
            @click="grupoActivo = chip.valor"
          >
            {{ chip.etiqueta }}
            <span class="font-mono text-xs tabular-nums">{{ conteo(chip.valor) }}</span>
          </button>
        </div>
      </template>

      <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 px-6 py-3.5">
        <p class="text-[13px] text-slate-500" data-kpi="alertasActivas">
          <template v-if="resumen.criticas > 0">
            <span class="font-semibold text-rose-700">{{ resumen.criticas }} {{ resumen.criticas === 1 ? 'crítica' : 'críticas' }}</span> de
          </template>
          {{ resumen.total }} {{ resumen.total === 1 ? 'alerta activa' : 'alertas activas' }}
        </p>
        <BaseSelect
          v-if="departamentos.length > 0"
          v-model="departamentoActivo"
          size="sm"
          class="w-auto min-w-[11rem]"
          aria-label="Filtrar por departamento"
          data-doc="filtro-departamento-alertas"
        >
          <option value="">Todos los departamentos</option>
          <option v-for="depto in departamentos" :key="depto" :value="depto">{{ depto }}</option>
        </BaseSelect>
      </div>

      <ul v-if="visibles.length > 0" class="max-h-[28rem] divide-y divide-slate-100 overflow-auto" data-doc="lista-alertas">
        <li v-for="alerta in visibles" :key="alerta.id">
          <button
            type="button"
            class="grid w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-1 px-6 py-3.5 text-left transition hover:bg-manila-50 focus-visible:bg-manila-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 sm:grid-cols-[5.5rem_minmax(0,1fr)_auto]"
            @click="abrir(alerta)"
          >
            <span class="inline-flex items-center gap-2 text-[13px] font-semibold" :class="SEVERIDAD_TEXTO[alerta.severidad]">
              <span class="h-2 w-2 rounded-full" :class="SEVERIDAD_PUNTO[alerta.severidad]" aria-hidden="true"></span>
              {{ SEVERIDAD_ETIQUETA[alerta.severidad] }}
            </span>
            <span class="min-w-0">
              <span class="block text-[15px] font-medium text-slate-900 sm:truncate">{{ alerta.titulo }}</span>
              <span class="block text-[13px] text-slate-500 sm:truncate">
                <span class="font-mono text-xs">{{ partes(alerta).folio }}</span>
                <template v-if="partes(alerta).resto"> · {{ partes(alerta).resto }}</template>
              </span>
            </span>
            <span class="col-span-2 text-sm font-semibold text-blue-800 sm:col-span-1 sm:text-right">Revisar</span>
          </button>
        </li>
      </ul>
      <EmptyState v-else mensaje="Todo al día: no hay alertas activas." />

      <p v-if="visibles.length > 0" class="border-t border-slate-100 px-6 py-3 text-[13px] text-slate-500">
        {{ visibles.length }} {{ visibles.length === 1 ? 'alerta' : 'alertas' }} en esta lista
      </p>
    </PestanaCarpeta>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { GRUPO_ETIQUETAS, grupoDe, useAlertasData, type Alerta, type GrupoAlerta } from '@/composables/useAlertasData'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PestanaCarpeta from '@/components/ui/PestanaCarpeta.vue'
import { SEVERIDAD_ETIQUETA, SEVERIDAD_PUNTO, SEVERIDAD_TEXTO } from './alertaEstilos'

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

/** El detalle empieza con el folio o el inventario ("M-C012 · abierto hace 80 días"): el folio va en mono. */
function partes(alerta: Alerta): { folio: string; resto: string } {
  const [folio = '', ...resto] = alerta.detalle.split(' · ')
  return { folio, resto: resto.join(' · ') }
}

function abrir(alerta: Alerta) {
  router.push(alerta.destino)
}
</script>
