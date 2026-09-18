<template>
  <div class="min-w-0 space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Hojas de resguardo y entrega</h2>
        <p class="mt-1 text-sm text-slate-500">Historial de documentos generados por cada asignación y reasignación</p>
      </div>

      <!-- Exportar a Excel (con variantes) -->
      <div ref="menuExportarRef" class="relative">
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          @click="mostrarMenuExportar = !mostrarMenuExportar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Exportar a Excel
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-slate-400 transition-transform" :class="{ 'rotate-180': mostrarMenuExportar }" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        <Transition name="fade">
          <div
            v-if="mostrarMenuExportar"
            class="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            <button type="button" class="block w-full px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50" @click="exportarExcel('visibles')">
              Excel con los filtros aplicados
              <span class="block text-xs text-slate-400">{{ hojasFiltradas.length }} hojas visibles ahora</span>
            </button>
            <button type="button" class="block w-full px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50" @click="exportarExcel('Resguardo')">
              Excel de hojas de resguardo
              <span class="block text-xs text-slate-400">Todas, ignora búsqueda y filtros</span>
            </button>
            <button type="button" class="block w-full px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50" @click="exportarExcel('Entrega')">
              Excel de hojas de entrega
              <span class="block text-xs text-slate-400">Todas, ignora búsqueda y filtros</span>
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <!-- Pestañas por tipo de hoja -->
      <div class="border-b border-slate-200 px-4 pt-4">
        <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            v-for="pestana in PESTANAS"
            :key="pestana.valor"
            type="button"
            class="flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition"
            :class="tipoActivo === pestana.valor ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            @click="tipoActivo = pestana.valor"
          >
            {{ pestana.etiqueta }}
            <span
              class="rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
              :class="tipoActivo === pestana.valor ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/70 text-slate-500'"
            >
              {{ conteos[pestana.valor] }}
            </span>
          </button>
        </div>
        <div class="h-4"></div>
      </div>

      <!-- Controles: tamaño de página + buscador + filtros -->
      <div class="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex items-center gap-2 text-sm text-slate-600">
          <span>Mostrar</span>
          <div class="relative">
            <select
              v-model.number="pageSize"
              class="m-0 appearance-none rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-2.5 pr-7 text-sm font-medium text-slate-600 shadow-none outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
            >
              <option v-for="opcion in PAGE_SIZE_OPCIONES" :key="opcion" :value="opcion">{{ opcion }}</option>
            </select>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
          <span>elementos</span>
        </div>

        <div class="flex items-center gap-2">
          <div class="relative w-full sm:w-72">
            <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input
              v-model="busqueda"
              type="text"
              placeholder="Buscar por folio, usuario, dirección..."
              class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <button
            type="button"
            class="relative flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            :class="hayFiltrosActivos ? 'border-blue-400/60 bg-blue-50 text-blue-700' : ''"
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
          <thead class="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
            <tr>
              <th class="whitespace-nowrap px-4 py-3">Tipo</th>
              <th class="whitespace-nowrap px-4 py-3">Folio</th>
              <th class="whitespace-nowrap px-4 py-3">Movimiento</th>
              <th class="whitespace-nowrap px-4 py-3">Usuario</th>
              <th class="whitespace-nowrap px-4 py-3">Puesto</th>
              <th class="whitespace-nowrap px-4 py-3">Dirección</th>
              <th class="whitespace-nowrap px-4 py-3">Departamento</th>
              <th class="whitespace-nowrap px-4 py-3">Fecha</th>
              <th class="whitespace-nowrap px-4 py-3">Bienes</th>
              <th class="whitespace-nowrap px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="hoja in hojasPagina" :key="hoja.id" class="transition hover:bg-slate-50">
              <td class="whitespace-nowrap px-4 py-3">
                <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="TIPO_HOJA_ESTILOS[hoja.tipo]">
                  {{ hoja.tipo }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{{ hoja.folio }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ hoja.movimiento }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ hoja.persona }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ hoja.puesto ?? '—' }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ hoja.direccion }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ hoja.departamento }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ formatFecha(hoja.fecha) }}</td>
              <td class="whitespace-nowrap px-4 py-3">
                <button
                  type="button"
                  class="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:border-blue-400/60 hover:bg-blue-50"
                  @click="verBienes(hoja)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ hoja.bienesIds.length }} {{ hoja.bienesIds.length === 1 ? 'bien' : 'bienes' }}
                </button>
              </td>
              <td class="whitespace-nowrap px-4 py-3">
                <button
                  type="button"
                  :title="`Imprimir hoja de ${hoja.tipo.toLowerCase()}`"
                  :aria-label="`Imprimir hoja de ${hoja.tipo.toLowerCase()}`"
                  class="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                  @click="imprimirHoja(hoja)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                  </svg>
                </button>
              </td>
            </tr>

            <tr v-if="hojasPagina.length === 0">
              <td colspan="10" class="px-4 py-12 text-center text-sm text-slate-400">
                No se encontraron hojas que coincidan con la búsqueda o los filtros.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-slate-500">
          Mostrando {{ rangoInicio }} a {{ rangoFin }} de {{ hojasFiltradas.length }} elementos
        </p>

        <div class="flex items-center gap-1">
          <button
            type="button"
            title="Primera página"
            aria-label="Primera página"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="paginaActual === 1"
            @click="paginaActual = 1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5M11.25 19.5l-7.5-7.5 7.5-7.5" />
            </svg>
          </button>
          <button
            type="button"
            title="Página anterior"
            aria-label="Página anterior"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="paginaActual === 1"
            @click="paginaActual -= 1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <template v-for="(pagina, index) in numerosPagina" :key="`${pagina}-${index}`">
            <span v-if="pagina === '…'" class="px-2 text-slate-400">…</span>
            <button
              v-else
              type="button"
              class="h-8 w-8 rounded-lg text-sm font-medium transition"
              :class="pagina === paginaActual
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30'
                : 'text-slate-600 hover:bg-slate-100'"
              @click="paginaActual = pagina"
            >
              {{ pagina }}
            </button>
          </template>

          <button
            type="button"
            title="Página siguiente"
            aria-label="Página siguiente"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="paginaActual === totalPaginas"
            @click="paginaActual += 1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
          <button
            type="button"
            title="Última página"
            aria-label="Última página"
            class="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="paginaActual === totalPaginas"
            @click="paginaActual = totalPaginas"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 4.5l7.5 7.5-7.5 7.5M12.75 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <BienesAsignadosModal
      v-model:open="mostrarModalBienes"
      :titulo="hojaSeleccionada ? `Bienes de la hoja ${hojaSeleccionada.folio}` : 'Bienes de la hoja'"
      :persona="hojaSeleccionada?.persona ?? ''"
      :bienes="bienesDe(hojaSeleccionada?.bienesIds ?? [])"
    />
    <FiltrosHojasModal v-model:open="mostrarModalFiltros" :filtros="filtros" @aplicar="onAplicarFiltros" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  filtrosHojasVacios,
  useAsignacionesData,
  type FiltrosHojas,
  type Hoja,
  type TipoHoja,
} from '@/composables/useAsignacionesData'
import { descargarCsv } from '@/utils/csv'
import BienesAsignadosModal from '@/components/asignaciones/BienesAsignadosModal.vue'
import FiltrosHojasModal from '@/components/hojas/FiltrosHojasModal.vue'

const { hojas, bienesDe } = useAsignacionesData()

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

const PAGE_SIZE_OPCIONES = [10, 25, 50, 100] as const

const tipoActivo = ref<PestanaTipo>('todas')
const busqueda = ref('')
const pageSize = ref<(typeof PAGE_SIZE_OPCIONES)[number]>(10)
const paginaActual = ref(1)

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

const hojasFiltradas = computed(() =>
  tipoActivo.value === 'todas' ? hojasBase.value : hojasBase.value.filter((hoja) => hoja.tipo === tipoActivo.value),
)

const totalPaginas = computed(() => Math.max(1, Math.ceil(hojasFiltradas.value.length / pageSize.value)))

const hojasPagina = computed(() => {
  const inicio = (paginaActual.value - 1) * pageSize.value
  return hojasFiltradas.value.slice(inicio, inicio + pageSize.value)
})

const rangoInicio = computed(() => (hojasFiltradas.value.length === 0 ? 0 : (paginaActual.value - 1) * pageSize.value + 1))
const rangoFin = computed(() => Math.min(paginaActual.value * pageSize.value, hojasFiltradas.value.length))

// Vuelve a la primera página cuando cambia la pestaña, la búsqueda, los filtros o el tamaño de página.
watch([tipoActivo, busqueda, pageSize, filtros], () => {
  paginaActual.value = 1
})

// Si la página actual queda fuera de rango, la ajusta.
watch(totalPaginas, (total) => {
  if (paginaActual.value > total) paginaActual.value = total
})

const numerosPagina = computed<Array<number | '…'>>(() => {
  const total = totalPaginas.value
  const actual = paginaActual.value
  const izquierda = Math.max(2, actual - 1)
  const derecha = Math.min(total - 1, actual + 1)

  const paginas: Array<number | '…'> = [1]
  if (izquierda > 2) paginas.push('…')
  for (let p = izquierda; p <= derecha; p += 1) paginas.push(p)
  if (derecha < total - 1) paginas.push('…')
  if (total > 1) paginas.push(total)

  return paginas
})

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

function imprimirHoja(hoja: Hoja) {
  // TODO: generar/mostrar la hoja imprimible cuando exista
  console.info(`Imprimir hoja de ${hoja.tipo}`, hoja.folio)
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

  const encabezados = ['Tipo', 'Folio', 'Movimiento', 'Usuario', 'Puesto', 'Dirección', 'Departamento', 'Fecha', 'Bienes', 'Números de inventario']
  const filas = lista.map((hoja) => [
    hoja.tipo,
    hoja.folio,
    hoja.movimiento,
    hoja.persona,
    hoja.puesto ?? '',
    hoja.direccion,
    hoja.departamento,
    formatFecha(hoja.fecha),
    String(hoja.bienesIds.length),
    bienesDe(hoja.bienesIds)
      .map((bien) => bien.numeroInventario)
      .join('; '),
  ])

  descargarCsv(encabezados, filas, `hojas_${sufijo}`)
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
