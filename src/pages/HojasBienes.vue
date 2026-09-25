<template>
  <div class="min-w-0 space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Hojas de resguardo y entrega</h2>
        <p class="mt-1 text-sm text-slate-500">Historial de documentos generados por cada asignación, reasignación y devolución</p>
      </div>

      <!-- Exportar a Excel (con variantes) -->
      <div ref="menuExportarRef" class="relative">
        <AppButton variant="secondary" :aria-expanded="mostrarMenuExportar" @click="mostrarMenuExportar = !mostrarMenuExportar">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Exportar a Excel
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-slate-400 transition-transform" :class="{ 'rotate-180': mostrarMenuExportar }" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </AppButton>

        <Transition name="fade">
          <div
            v-if="mostrarMenuExportar"
            class="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            <button type="button" class="block w-full px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none" @click="exportarExcel('visibles')">
              Excel con los filtros aplicados
              <span class="block text-xs text-slate-400">{{ hojasFiltradas.length }} hojas visibles ahora</span>
            </button>
            <button type="button" class="block w-full px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none" @click="exportarExcel('Resguardo')">
              Excel de hojas de resguardo
              <span class="block text-xs text-slate-400">Todas, ignora búsqueda y filtros</span>
            </button>
            <button type="button" class="block w-full px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none" @click="exportarExcel('Entrega')">
              Excel de hojas de entrega
              <span class="block text-xs text-slate-400">Todas, ignora búsqueda y filtros</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <TabsBar v-model="tipoActivo" :tabs="tabsConConteo" label="Tipo de hoja" />

      <!-- Controles: tamaño de página + buscador + filtros -->
      <div class="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <PageSizeSelect v-model="pageSize" />

        <div class="flex items-center gap-2">
          <SearchInput v-model="busqueda" placeholder="Buscar por folio, responsable, dirección..." class="w-full sm:w-72" />

          <button
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

      <!-- Tabla -->
      <div class="max-h-[600px] overflow-auto">
        <table class="w-full text-left text-sm">
          <thead class="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
            <tr>
              <th class="whitespace-nowrap px-4 py-3">Tipo</th>
              <th class="whitespace-nowrap px-4 py-3">Folio</th>
              <th class="whitespace-nowrap px-4 py-3">Movimiento</th>
              <th class="whitespace-nowrap px-4 py-3">Responsable</th>
              <th class="whitespace-nowrap px-4 py-3">Puesto</th>
              <th class="whitespace-nowrap px-4 py-3">Dirección</th>
              <th class="whitespace-nowrap px-4 py-3">Departamento</th>
              <th class="whitespace-nowrap px-4 py-3">Fecha</th>
              <th class="whitespace-nowrap px-4 py-3">Asignó</th>
              <th class="whitespace-nowrap px-4 py-3">Bienes</th>
              <th class="whitespace-nowrap px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="hoja in hojasPagina" :key="hoja.id" class="transition hover:bg-slate-50">
              <td class="whitespace-nowrap px-4 py-2.5">
                <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="TIPO_HOJA_ESTILOS[hoja.tipo]">
                  {{ hoja.tipo }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-2.5 font-mono text-xs font-medium tabular-nums text-slate-800">{{ hoja.folio }}</td>
              <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ hoja.movimiento }}</td>
              <td class="whitespace-nowrap px-4 py-2.5 font-medium text-slate-800">{{ hoja.persona }}</td>
              <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ hoja.puesto ?? '—' }}</td>
              <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ hoja.direccion }}</td>
              <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ hoja.departamento }}</td>
              <td class="whitespace-nowrap px-4 py-2.5 tabular-nums text-slate-600">{{ formatFecha(hoja.fecha) }}</td>
              <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ hoja.asignadoPor }}</td>
              <td class="whitespace-nowrap px-4 py-2.5">
                <button
                  type="button"
                  class="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:border-blue-400/60 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                  @click="verBienes(hoja)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ hoja.bienesIds.length }} {{ hoja.bienesIds.length === 1 ? 'bien' : 'bienes' }}
                </button>
              </td>
              <td class="whitespace-nowrap px-4 py-2.5">
                <IconButton :label="`Imprimir hoja de ${hoja.tipo.toLowerCase()}`" tone="slate" @click="imprimirHoja(hoja)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                  </svg>
                </IconButton>
              </td>
            </tr>

            <tr v-if="hojasPagina.length === 0">
              <td colspan="11">
                <EmptyState mensaje="No se encontraron hojas que coincidan con la búsqueda o los filtros." />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <TablePagination
        v-model:pagina-actual="paginaActual"
        :total-paginas="totalPaginas"
        :rango-inicio="rangoInicio"
        :rango-fin="rangoFin"
        :total="total"
      />
    </div>

    <BienesAsignadosModal
      v-model:open="mostrarModalBienes"
      :titulo="hojaSeleccionada ? `Bienes de la hoja ${hojaSeleccionada.folio}` : 'Bienes de la hoja'"
      :persona="hojaSeleccionada?.persona ?? ''"
      :bienes="hojaSeleccionada?.bienes ?? []"
    />
    <FiltrosHojasModal v-model:open="mostrarModalFiltros" :filtros="filtros" @aplicar="onAplicarFiltros" />

    <VistaPreviaDocumento
      v-model:open="mostrarVistaPrevia"
      :title="hojaImpresion ? `Hoja de ${hojaImpresion.tipo.toLowerCase()} ${hojaImpresion.folio}` : 'Hoja'"
      :subtitle="hojaImpresion?.persona"
    >
      <DocumentoHoja v-if="hojaImpresion" :hoja="hojaImpresion" />
    </VistaPreviaDocumento>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  filtrosHojasVacios,
  useMovimientosData,
  type FiltrosHojas,
  type Hoja,
  type TipoHoja,
} from '@/composables/useMovimientosData'
import { usePaginacion } from '@/composables/usePaginacion'
import { useToast } from '@/composables/useToast'
import { descargarCsv } from '@/utils/csv'
import BienesAsignadosModal from '@/components/asignaciones/BienesAsignadosModal.vue'
import DocumentoHoja from '@/components/documentos/DocumentoHoja.vue'
import VistaPreviaDocumento from '@/components/documentos/VistaPreviaDocumento.vue'
import FiltrosHojasModal from '@/components/hojas/FiltrosHojasModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import TabsBar from '@/components/ui/TabsBar.vue'
import IconButton from '@/components/ui/IconButton.vue'
import PageSizeSelect from '@/components/ui/PageSizeSelect.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import TablePagination from '@/components/ui/TablePagination.vue'

const { hojas } = useMovimientosData()
const toast = useToast()

type PestanaTipo = TipoHoja | 'todas'

const PESTANAS: Array<{ valor: PestanaTipo; etiqueta: string }> = [
  { valor: 'todas', etiqueta: 'Todas' },
  { valor: 'Resguardo', etiqueta: 'Resguardo' },
  { valor: 'Entrega', etiqueta: 'Entrega' },
]

const TIPO_HOJA_ESTILOS: Record<TipoHoja, string> = {
  Resguardo: 'bg-emerald-50 text-emerald-700',
  Entrega: 'bg-amber-50 text-amber-700',
}

const tipoActivo = ref<PestanaTipo>('todas')
const busqueda = ref('')
const pageSize = ref(10)

const mostrarModalFiltros = ref(false)
const filtros = ref<FiltrosHojas>(filtrosHojasVacios())

const hayFiltrosActivos = computed(
  () =>
    filtros.value.movimiento !== '' ||
    filtros.value.persona !== '' ||
    filtros.value.direccion !== '' ||
    filtros.value.departamento !== '' ||
    filtros.value.fechaDesde !== '' ||
    filtros.value.fechaHasta !== '',
)

function onAplicarFiltros(nuevosFiltros: FiltrosHojas) {
  filtros.value = nuevosFiltros
}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

function coincideConFiltros(hoja: Hoja): boolean {
  const f = filtros.value
  return (
    (!f.movimiento || hoja.movimiento === f.movimiento) &&
    (!f.persona || hoja.persona === f.persona) &&
    (!f.direccion || hoja.direccion === f.direccion) &&
    (!f.departamento || hoja.departamento === f.departamento) &&
    (!f.fechaDesde || hoja.fecha >= f.fechaDesde) &&
    (!f.fechaHasta || hoja.fecha <= f.fechaHasta)
  )
}

// Búsqueda + filtros, sin la pestaña: es la base para los contadores de cada pestaña.
const hojasBase = computed(() => {
  const termino = normalizar(busqueda.value.trim())

  return hojas.filter((hoja) => {
    const coincideBusqueda =
      !termino ||
      [hoja.folio, hoja.movimiento, hoja.persona, hoja.puesto ?? '', hoja.direccion, hoja.departamento].some((campo) =>
        normalizar(campo).includes(termino),
      )
    return coincideBusqueda && coincideConFiltros(hoja)
  })
})

const conteos = computed<Record<PestanaTipo, number>>(() => ({
  todas: hojasBase.value.length,
  Resguardo: hojasBase.value.filter((hoja) => hoja.tipo === 'Resguardo').length,
  Entrega: hojasBase.value.filter((hoja) => hoja.tipo === 'Entrega').length,
}))
const tabsConConteo = computed(() => PESTANAS.map((pestana) => ({ ...pestana, conteo: conteos.value[pestana.valor] })))

const hojasFiltradas = computed(() =>
  tipoActivo.value === 'todas' ? hojasBase.value : hojasBase.value.filter((hoja) => hoja.tipo === tipoActivo.value),
)

const { paginaActual, totalPaginas, pagina: hojasPagina, rangoInicio, rangoFin, total, irAlInicio } = usePaginacion(
  hojasFiltradas,
  pageSize,
)

// Vuelve a la primera página cuando cambia la pestaña, la búsqueda o los filtros.
watch([tipoActivo, busqueda, filtros], irAlInicio)

const dateFormatter = new Intl.DateTimeFormat('es', { day: '2-digit', month: '2-digit', year: 'numeric' })
function formatFecha(fechaIso: string): string {
  return dateFormatter.format(new Date(`${fechaIso}T00:00:00`))
}

const mostrarModalBienes = ref(false)
const hojaSeleccionada = ref<Hoja | null>(null)

function verBienes(hoja: Hoja) {
  hojaSeleccionada.value = hoja
  mostrarModalBienes.value = true
}

const mostrarVistaPrevia = ref(false)
const hojaImpresion = ref<Hoja | null>(null)

function imprimirHoja(hoja: Hoja) {
  hojaImpresion.value = hoja
  mostrarVistaPrevia.value = true
}

// Menú desplegable "Exportar a Excel" — se cierra al hacer clic fuera de él.
const mostrarMenuExportar = ref(false)
const menuExportarRef = ref<HTMLElement | null>(null)

function cerrarMenuExportarSiEsFuera(evento: MouseEvent) {
  if (menuExportarRef.value && !menuExportarRef.value.contains(evento.target as Node)) {
    mostrarMenuExportar.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', cerrarMenuExportarSiEsFuera))
onBeforeUnmount(() => document.removeEventListener('mousedown', cerrarMenuExportarSiEsFuera))

function exportarExcel(variante: 'visibles' | TipoHoja) {
  const lista = variante === 'visibles' ? hojasFiltradas.value : hojas.filter((hoja) => hoja.tipo === variante)
  const sufijo = variante === 'visibles' ? 'filtradas' : variante.toLowerCase()

  const encabezados = ['Tipo', 'Folio', 'Movimiento', 'Responsable', 'Puesto', 'Dirección', 'Departamento', 'Fecha', 'Asignó', 'Bienes', 'Números de inventario']
  const filas = lista.map((hoja) => [
    hoja.tipo,
    hoja.folio,
    hoja.movimiento,
    hoja.persona,
    hoja.puesto ?? '',
    hoja.direccion,
    hoja.departamento,
    formatFecha(hoja.fecha),
    hoja.asignadoPor,
    String(hoja.bienesIds.length),
    hoja.bienes.map((bien) => bien.numeroInventario).join('; '),
  ])

  descargarCsv(encabezados, filas, `hojas_${sufijo}`)
  toast.success(`Exportación lista: ${lista.length} hojas`)
  mostrarMenuExportar.value = false
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
