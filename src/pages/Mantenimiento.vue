<template>
  <div class="min-w-0 space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Mantenimiento</h2>
        <p class="mt-1 text-sm text-slate-500">Preventivos, correctivos y los dictámenes de baja que se derivan de ellos</p>
      </div>

      <AppButton
        :disabled="!can('mantenimiento:programar')"
        :title="can('mantenimiento:programar') ? undefined : motivoSinPermiso('mantenimiento:programar', rol)"
        @click="abrirProgramar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Agregar mantenimiento
      </AppButton>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <!-- Pestañas -->
      <div class="overflow-x-auto border-b border-slate-200 px-4 pt-4">
        <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            v-for="pestana in PESTANAS"
            :key="pestana.valor"
            type="button"
            class="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 sm:px-4"
            :class="tabActivo === pestana.valor ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            :aria-pressed="tabActivo === pestana.valor"
            @click="tabActivo = pestana.valor"
          >
            {{ pestana.etiqueta }}
            <span
              class="rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums"
              :class="tabActivo === pestana.valor ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/70 text-slate-500'"
            >
              {{ conteos[pestana.valor] }}
            </span>
          </button>
        </div>
        <div class="h-4"></div>
      </div>

      <!-- Controles: tamaño de página + buscador + filtros -->
      <div class="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <PageSizeSelect v-model="pageSize" />

        <div class="flex items-center gap-2">
          <SearchInput v-model="busqueda" :placeholder="tabActivo === 'Dictámenes' ? 'Buscar por folio, bien, conclusión...' : 'Buscar por folio, bien, técnico...'" class="w-full sm:w-72" />

          <button
            v-if="tabActivo !== 'Dictámenes'"
            type="button"
            class="relative flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1"
            :class="hayFiltrosActivos
              ? 'border-blue-400/60 bg-blue-50 text-blue-700 hover:bg-blue-100'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'"
            @click="mostrarModalFiltros = true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
            </svg>
            Filtros
            <span v-if="hayFiltrosActivos" class="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-blue-600"></span>
          </button>
        </div>
      </div>

      <FocoChip v-if="foco && tabActivo !== 'Dictámenes'" :etiqueta="FOCO_ETIQUETAS[foco]" @quitar="quitarFoco" />

      <!-- Tabla: Todas / Preventivo / Correctivo -->
      <template v-if="tabActivo !== 'Dictámenes'">
        <div class="max-h-[600px] overflow-auto">
          <table class="w-full text-left text-sm">
            <thead class="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
              <tr>
                <th v-if="tabActivo === 'Todas'" class="whitespace-nowrap px-4 py-3">Tipo</th>
                <th class="whitespace-nowrap px-4 py-3">Folio</th>
                <th class="whitespace-nowrap px-4 py-3">Bien</th>
                <th class="whitespace-nowrap px-4 py-3">Fecha</th>
                <th class="whitespace-nowrap px-4 py-3">Técnico / proveedor</th>
                <th v-if="tabActivo === 'Preventivo'" class="whitespace-nowrap px-4 py-3">Periodicidad</th>
                <th v-if="tabActivo === 'Preventivo'" class="whitespace-nowrap px-4 py-3">Próxima fecha</th>
                <th v-if="tabActivo === 'Correctivo'" class="whitespace-nowrap px-4 py-3">Prioridad</th>
                <th v-if="tabActivo === 'Correctivo'" class="whitespace-nowrap px-4 py-3">Resultado</th>
                <th class="whitespace-nowrap px-4 py-3">Estatus</th>
                <th class="whitespace-nowrap px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="registro in mantenimientosPagina" :key="registro.id" class="transition hover:bg-slate-50">
                <td v-if="tabActivo === 'Todas'" class="whitespace-nowrap px-4 py-2.5">
                  <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="TIPO_ESTILOS[registro.tipo]">{{ registro.tipo }}</span>
                </td>
                <td class="whitespace-nowrap px-4 py-2.5 font-mono text-xs font-medium tabular-nums text-slate-800">{{ registro.folio }}</td>
                <td class="whitespace-nowrap px-4 py-2.5">
                  <p class="font-medium text-slate-800">{{ bienDe(registro.bienId)?.nombre ?? '—' }}</p>
                  <p class="font-mono text-xs tabular-nums text-slate-400">{{ bienDe(registro.bienId)?.numeroInventario ?? '—' }}</p>
                </td>
                <td class="whitespace-nowrap px-4 py-2.5 tabular-nums text-slate-600">{{ formatFecha(registro.fecha) }}</td>
                <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ registro.tecnico }}</td>
                <td v-if="tabActivo === 'Preventivo'" class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ registro.periodicidad ?? '—' }}</td>
                <td v-if="tabActivo === 'Preventivo'" class="whitespace-nowrap px-4 py-2.5 tabular-nums text-slate-600">
                  {{ registro.proximaFecha ? formatFecha(registro.proximaFecha) : '—' }}
                </td>
                <td v-if="tabActivo === 'Correctivo'" class="whitespace-nowrap px-4 py-2.5">
                  <span v-if="registro.prioridad" class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="PRIORIDAD_ESTILOS[registro.prioridad]">
                    {{ registro.prioridad }}
                  </span>
                  <span v-else class="text-slate-400">—</span>
                </td>
                <td v-if="tabActivo === 'Correctivo'" class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ registro.resultado ?? '—' }}</td>
                <td class="whitespace-nowrap px-4 py-2.5">
                  <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="ESTATUS_ESTILOS[registro.estatus]">{{ registro.estatus }}</span>
                </td>
                <td class="whitespace-nowrap px-4 py-2.5">
                  <IconButton
                    v-if="registro.estatus === 'Programado' || registro.estatus === 'En curso'"
                    :label="can('mantenimiento:concluir') ? 'Concluir mantenimiento' : `Concluir mantenimiento (${motivoSinPermiso('mantenimiento:concluir', rol)})`"
                    :disabled="!can('mantenimiento:concluir')"
                    tone="emerald"
                    @click="abrirConclusion(registro)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </IconButton>
                  <span v-else class="text-slate-300">—</span>
                </td>
              </tr>

              <tr v-if="mantenimientosPagina.length === 0">
                <td :colspan="tabActivo === 'Todas' ? 9 : 8">
                  <EmptyState mensaje="No se encontraron mantenimientos que coincidan con la búsqueda o los filtros." />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <TablePagination
          v-model:pagina-actual="paginaActualMantenimientos"
          :total-paginas="totalPaginasMantenimientos"
          :rango-inicio="rangoInicioMantenimientos"
          :rango-fin="rangoFinMantenimientos"
          :total="totalMantenimientos"
        />
      </template>

      <!-- Tabla: Dictámenes -->
      <template v-else>
        <div class="max-h-[600px] overflow-auto">
          <table class="w-full text-left text-sm">
            <thead class="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
              <tr>
                <th class="whitespace-nowrap px-4 py-3">Folio</th>
                <th class="whitespace-nowrap px-4 py-3">Bien</th>
                <th class="whitespace-nowrap px-4 py-3">Fecha</th>
                <th class="whitespace-nowrap px-4 py-3">Causa</th>
                <th class="min-w-[16rem] px-4 py-3">Conclusión</th>
                <th class="whitespace-nowrap px-4 py-3">Costos</th>
                <th class="whitespace-nowrap px-4 py-3">Destino final</th>
                <th class="whitespace-nowrap px-4 py-3">Elaboró</th>
                <th class="whitespace-nowrap px-4 py-3">Correctivo de origen</th>
                <th class="whitespace-nowrap px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="dictamen in dictamenesPagina" :key="dictamen.id" class="transition hover:bg-slate-50">
                <td class="whitespace-nowrap px-4 py-2.5 font-mono text-xs font-medium tabular-nums text-slate-800">{{ dictamen.folio }}</td>
                <td class="whitespace-nowrap px-4 py-2.5">
                  <p class="font-medium text-slate-800">{{ dictamen.bien.nombre }}</p>
                  <p class="font-mono text-xs tabular-nums text-slate-400">{{ dictamen.bien.numeroInventario }}</p>
                </td>
                <td class="whitespace-nowrap px-4 py-2.5 tabular-nums text-slate-600">{{ formatFecha(dictamen.fecha) }}</td>
                <td class="whitespace-nowrap px-4 py-2.5">
                  <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="CAUSA_ESTILOS[dictamen.causa]">{{ dictamen.causa }}</span>
                </td>
                <td class="px-4 py-2.5 text-slate-600">{{ dictamen.conclusion }}</td>
                <td class="whitespace-nowrap px-4 py-2.5 text-xs text-slate-600">
                  <p>Rep: {{ formatMoney(dictamen.costoReparacion) }}</p>
                  <p>Repos: {{ formatMoney(dictamen.valorReposicion) }}</p>
                </td>
                <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ dictamen.destinoFinal }}</td>
                <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ dictamen.elaboradoPor }}</td>
                <td class="whitespace-nowrap px-4 py-2.5 font-mono text-xs tabular-nums text-slate-600">{{ mantenimientoDe(dictamen.mantenimientoId)?.folio ?? '—' }}</td>
                <td class="whitespace-nowrap px-4 py-2.5">
                  <IconButton label="Imprimir dictamen" tone="slate" @click="imprimirDictamen(dictamen)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                    </svg>
                  </IconButton>
                </td>
              </tr>

              <tr v-if="dictamenesPagina.length === 0">
                <td colspan="10">
                  <EmptyState mensaje="No se encontraron dictámenes que coincidan con la búsqueda." />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <TablePagination
          v-model:pagina-actual="paginaActualDictamenes"
          :total-paginas="totalPaginasDictamenes"
          :rango-inicio="rangoInicioDictamenes"
          :rango-fin="rangoFinDictamenes"
          :total="totalDictamenes"
        />
      </template>
    </div>

    <ProgramarMantenimientoModal v-model:open="mostrarModalProgramar" :tipo-inicial="tipoInicialProgramar" :bienes="[]" @confirmar="onConfirmarProgramar" />
    <ConcluirMantenimientoModal v-model:open="mostrarModalConclusion" :mantenimiento="mantenimientoConcluir" @confirmar="onConfirmarConclusion" />
    <FiltrosMantenimientoModal v-model:open="mostrarModalFiltros" :filtros="filtros" @aplicar="onAplicarFiltros" />

    <VistaPreviaDocumento
      v-model:open="mostrarVistaPrevia"
      :title="dictamenImpresion ? `Dictamen ${dictamenImpresion.folio}` : 'Dictamen'"
      :subtitle="dictamenImpresion?.bien.numeroInventario"
    >
      <DocumentoDictamen v-if="dictamenImpresion" :dictamen="dictamenImpresion" />
    </VistaPreviaDocumento>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { motivoSinPermiso } from '@/config/permisos'
import { FOCO_ETIQUETAS, useAlertasData } from '@/composables/useAlertasData'
import { useFocoDeRuta } from '@/composables/useFocoDeRuta'
import { useBienesData } from '@/composables/useBienesData'
import {
  filtrosMantenimientoVacios,
  useMantenimientosData,
  type CausaBaja,
  type Dictamen,
  type EstatusMantenimiento,
  type FiltrosMantenimiento,
  type Mantenimiento,
  type NuevoDictamenDirecto,
  type NuevoMantenimiento,
  type Prioridad,
  type TipoMantenimiento,
} from '@/composables/useMantenimientosData'
import { usePaginacion } from '@/composables/usePaginacion'
import { useToast } from '@/composables/useToast'
import DocumentoDictamen from '@/components/documentos/DocumentoDictamen.vue'
import VistaPreviaDocumento from '@/components/documentos/VistaPreviaDocumento.vue'
import ConcluirMantenimientoModal from '@/components/mantenimiento/ConcluirMantenimientoModal.vue'
import FiltrosMantenimientoModal from '@/components/mantenimiento/FiltrosMantenimientoModal.vue'
import ProgramarMantenimientoModal from '@/components/mantenimiento/ProgramarMantenimientoModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FocoChip from '@/components/ui/FocoChip.vue'
import IconButton from '@/components/ui/IconButton.vue'
import PageSizeSelect from '@/components/ui/PageSizeSelect.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import TablePagination from '@/components/ui/TablePagination.vue'

const { bienes } = useBienesData()
const { mantenimientos, mantenimientosVisibles, dictamenesVisibles, iniciarMantenimiento, concluirMantenimiento, generarDictamenDirecto } = useMantenimientosData()
const toast = useToast()

type Pestana = 'Todas' | TipoMantenimiento | 'Dictámenes'

const PESTANAS: Array<{ valor: Pestana; etiqueta: string }> = [
  { valor: 'Todas', etiqueta: 'Todas' },
  { valor: 'Preventivo', etiqueta: 'Preventivo' },
  { valor: 'Correctivo', etiqueta: 'Correctivo' },
  { valor: 'Dictámenes', etiqueta: 'Dictámenes' },
]

const route = useRoute()
const { can, rol } = useAuth()

function pestanaDeRuta(): Pestana | null {
  const valor = route.query.tab
  return PESTANAS.some((pestana) => pestana.valor === valor) ? (valor as Pestana) : null
}

const tabActivo = ref<Pestana>(pestanaDeRuta() ?? 'Todas')
// Una alerta o tarjeta del dashboard puede llegar con la misma ruta pero otro `?tab=`.
watch(() => route.query.tab, () => {
  const pestana = pestanaDeRuta()
  if (pestana) tabActivo.value = pestana
})

const { foco, limpiar: quitarFoco } = useFocoDeRuta([
  'preventivo-vencido',
  'preventivo-proximo',
  'correctivo-atorado',
  'preventivos-pendientes',
  'correctivos-abiertos',
])
const { idsDeFoco } = useAlertasData()
const idsEnFoco = computed(() => (foco.value ? idsDeFoco(foco.value) : null))

const TIPO_ESTILOS: Record<TipoMantenimiento, string> = {
  Preventivo: 'bg-emerald-50 text-emerald-700',
  Correctivo: 'bg-amber-50 text-amber-700',
}

const ESTATUS_ESTILOS: Record<EstatusMantenimiento, string> = {
  Programado: 'bg-amber-50 text-amber-700',
  'En curso': 'bg-blue-50 text-blue-700',
  Concluido: 'bg-emerald-50 text-emerald-700',
  Cancelado: 'bg-slate-100 text-slate-500',
}

const PRIORIDAD_ESTILOS: Record<Prioridad, string> = {
  Baja: 'bg-slate-100 text-slate-600',
  Media: 'bg-blue-50 text-blue-700',
  Alta: 'bg-amber-50 text-amber-700',
  Urgente: 'bg-rose-50 text-rose-700',
}

const CAUSA_ESTILOS: Record<CausaBaja, string> = {
  'Daño físico no reparable': 'bg-rose-50 text-rose-700',
  'Costo de reparación no conviene': 'bg-amber-50 text-amber-700',
  'Obsolescencia tecnológica': 'bg-blue-50 text-blue-700',
  'Fin de vida útil': 'bg-slate-100 text-slate-600',
  'Pérdida o robo': 'bg-rose-50 text-rose-700',
  Siniestro: 'bg-rose-50 text-rose-700',
  Otro: 'bg-slate-100 text-slate-600',
}

const moneyFormatter = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
function formatMoney(valor?: number): string {
  return valor === undefined ? '—' : moneyFormatter.format(valor)
}

const busqueda = ref('')
const pageSize = ref(10)

const mostrarModalFiltros = ref(false)
const filtros = ref<FiltrosMantenimiento>(filtrosMantenimientoVacios())

const hayFiltrosActivos = computed(
  () =>
    filtros.value.tipo !== '' ||
    filtros.value.estatus !== '' ||
    filtros.value.tecnico !== '' ||
    filtros.value.prioridad !== '' ||
    filtros.value.fechaDesde !== '' ||
    filtros.value.fechaHasta !== '',
)

function onAplicarFiltros(nuevosFiltros: FiltrosMantenimiento) {
  filtros.value = nuevosFiltros
}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

function bienDe(bienId: string) {
  return bienes.find((bien) => bien.id === bienId)
}

function mantenimientoDe(mantenimientoId: string) {
  return mantenimientos.find((mantenimiento) => mantenimiento.id === mantenimientoId)
}

function coincideConFiltros(registro: Mantenimiento): boolean {
  const f = filtros.value
  return (
    (!f.tipo || registro.tipo === f.tipo) &&
    (!f.estatus || registro.estatus === f.estatus) &&
    (!f.tecnico || registro.tecnico === f.tecnico) &&
    (!f.prioridad || registro.prioridad === f.prioridad) &&
    (!f.fechaDesde || registro.fecha >= f.fechaDesde) &&
    (!f.fechaHasta || registro.fecha <= f.fechaHasta)
  )
}

// Búsqueda + filtros, sin la pestaña: es la base para los contadores de cada pestaña.
const mantenimientosBase = computed<Mantenimiento[]>(() => {
  const termino = normalizar(busqueda.value.trim())

  return mantenimientosVisibles().filter((registro) => {
    const coincideBusqueda =
      !termino ||
      [registro.folio, bienDe(registro.bienId)?.nombre ?? '', registro.tecnico, registro.descripcion].some((campo) =>
        normalizar(campo).includes(termino),
      )
    return coincideBusqueda && coincideConFiltros(registro) && (!idsEnFoco.value || idsEnFoco.value.has(registro.id))
  })
})

const dictamenesBase = computed<Dictamen[]>(() => {
  const termino = normalizar(busqueda.value.trim())
  const dictamenes = dictamenesVisibles()
  if (!termino) return dictamenes

  return dictamenes.filter((dictamen) =>
    [dictamen.folio, dictamen.bien.nombre, dictamen.causa, dictamen.conclusion, dictamen.destinoFinal, dictamen.elaboradoPor].some(
      (campo) => normalizar(campo).includes(termino),
    ),
  )
})

const conteos = computed<Record<Pestana, number>>(() => ({
  Todas: mantenimientosBase.value.length,
  Preventivo: mantenimientosBase.value.filter((registro) => registro.tipo === 'Preventivo').length,
  Correctivo: mantenimientosBase.value.filter((registro) => registro.tipo === 'Correctivo').length,
  Dictámenes: dictamenesBase.value.length,
}))

const mantenimientosFiltrados = computed(() =>
  tabActivo.value === 'Todas' || tabActivo.value === 'Dictámenes'
    ? mantenimientosBase.value
    : mantenimientosBase.value.filter((registro) => registro.tipo === tabActivo.value),
)

const {
  paginaActual: paginaActualMantenimientos,
  totalPaginas: totalPaginasMantenimientos,
  pagina: mantenimientosPagina,
  rangoInicio: rangoInicioMantenimientos,
  rangoFin: rangoFinMantenimientos,
  total: totalMantenimientos,
  irAlInicio: irAlInicioMantenimientos,
} = usePaginacion(mantenimientosFiltrados, pageSize)

const {
  paginaActual: paginaActualDictamenes,
  totalPaginas: totalPaginasDictamenes,
  pagina: dictamenesPagina,
  rangoInicio: rangoInicioDictamenes,
  rangoFin: rangoFinDictamenes,
  total: totalDictamenes,
  irAlInicio: irAlInicioDictamenes,
} = usePaginacion(dictamenesBase, pageSize)

// Vuelve a la primera página cuando cambia la pestaña, la búsqueda o los filtros.
watch([tabActivo, busqueda, filtros], () => {
  irAlInicioMantenimientos()
  irAlInicioDictamenes()
})

const dateFormatter = new Intl.DateTimeFormat('es', { day: '2-digit', month: '2-digit', year: 'numeric' })
function formatFecha(fechaIso: string): string {
  return dateFormatter.format(new Date(`${fechaIso}T00:00:00`))
}

const mostrarVistaPrevia = ref(false)
const dictamenImpresion = ref<Dictamen | null>(null)

function imprimirDictamen(dictamen: Dictamen) {
  dictamenImpresion.value = dictamen
  mostrarVistaPrevia.value = true
}

const mostrarModalProgramar = ref(false)

// El botón "Agregar mantenimiento" arranca en el tipo de la pestaña activa; el usuario puede cambiarlo dentro del modal.
const tipoInicialProgramar = computed(() => {
  if (tabActivo.value === 'Correctivo') return 'Correctivo'
  if (tabActivo.value === 'Dictámenes') return 'Dictamen'
  return 'Preventivo'
})

function abrirProgramar() {
  mostrarModalProgramar.value = true
}

function onConfirmarProgramar(registro: NuevoMantenimiento | NuevoDictamenDirecto) {
  if (registro.tipo === 'Dictamen') {
    const dictamenesGenerados = generarDictamenDirecto(registro)
    irAlInicioMantenimientos()
    irAlInicioDictamenes()
    const cantidad = dictamenesGenerados.length
    const folios = dictamenesGenerados.map((dictamen) => dictamen.folio).join(', ')
    toast.success(`Dictamen generado: ${cantidad} ${cantidad === 1 ? 'bien dado' : 'bienes dados'} de baja (${folios})`)
    return
  }

  const creados = iniciarMantenimiento(registro)
  irAlInicioMantenimientos()
  const cantidad = creados.length
  const folios = creados.map((item) => item.folio).join(', ')
  toast.success(`${registro.tipo} registrado: ${cantidad} ${cantidad === 1 ? 'bien' : 'bienes'} (${folios})`)
}

const mostrarModalConclusion = ref(false)
const mantenimientoConcluir = ref<Mantenimiento | null>(null)

function abrirConclusion(registro: Mantenimiento) {
  mantenimientoConcluir.value = registro
  mostrarModalConclusion.value = true
}

function onConfirmarConclusion(datos: Parameters<typeof concluirMantenimiento>[1]) {
  const registro = mantenimientoConcluir.value
  if (!registro) return

  const dictamen = concluirMantenimiento(registro.id, datos)
  if (dictamen) {
    toast.success(`Dictamen generado: ${dictamen.folio}, bien dado de baja`)
  } else if (registro.tipo === 'Correctivo') {
    toast.success(`Mantenimiento concluido: ${registro.folio} reparado`)
  } else {
    toast.success(`Mantenimiento concluido: ${registro.folio}`)
  }
}
</script>
