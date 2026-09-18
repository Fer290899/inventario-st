<template>
  <div class="min-w-0 space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Bienes</h2>
        <p class="mt-1 text-sm text-slate-500">Listado de bienes registrados en el inventario</p>
      </div>

      <div class="flex items-center gap-2">
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
              <button
                type="button"
                class="block w-full px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50"
                @click="exportarExcel('filtrados')"
              >
                Excel con los filtros aplicados
                <span class="block text-xs text-slate-400">{{ bienesFiltrados.length }} bienes visibles ahora</span>
              </button>
              <button
                type="button"
                class="block w-full px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50"
                @click="exportarExcel('asignados')"
              >
                Excel de bienes asignados
                <span class="block text-xs text-slate-400">Solo con estatus "Asignado"</span>
              </button>
              <button
                type="button"
                class="block w-full px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50"
                @click="exportarExcel('todos')"
              >
                Excel de todos los bienes
                <span class="block text-xs text-slate-400">Ignora la búsqueda y los filtros</span>
              </button>
            </div>
          </Transition>
        </div>

        <button
          type="button"
          class="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-500 hover:to-indigo-500"
          @click="nuevoBien"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar Bien
        </button>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
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
              placeholder="Buscar bienes..."
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
              <th class="whitespace-nowrap px-4 py-3">Nombre</th>
              <th class="whitespace-nowrap px-4 py-3">Modelo</th>
              <th class="whitespace-nowrap px-4 py-3">Marca</th>
              <th class="whitespace-nowrap px-4 py-3">Número de serie</th>
              <th class="whitespace-nowrap px-4 py-3">Número de inventario</th>
              <th class="whitespace-nowrap px-4 py-3">Fecha de alta</th>
              <th class="whitespace-nowrap px-4 py-3">Características</th>
              <th class="whitespace-nowrap px-4 py-3">Meses de garantía</th>
              <th class="whitespace-nowrap px-4 py-3">Estatus</th>
              <th class="whitespace-nowrap px-4 py-3">Inventariable</th>
              <th class="whitespace-nowrap px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="bien in bienesPagina" :key="bien.id" class="transition hover:bg-slate-50">
              <td class="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{{ bien.nombre }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ bien.modelo }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ bien.marca }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ bien.numeroSerie }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ bien.numeroInventario }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ formatFecha(bien.fechaAlta) }}</td>
              <td class="min-w-[14rem] px-4 py-3 text-slate-600">{{ bien.caracteristicas }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ bien.mesesGarantia }}</td>
              <td class="whitespace-nowrap px-4 py-3">
                <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="estatusClasses(bien.estatus)">
                  {{ bien.estatus }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-3">
                <span
                  class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="bien.inventariable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                >
                  {{ bien.inventariable ? 'Sí' : 'No' }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-3">
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    title="Editar"
                    aria-label="Editar"
                    class="rounded-lg p-1.5 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                    @click="editarBien(bien)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    title="Asignar"
                    aria-label="Asignar"
                    class="rounded-lg p-1.5 text-slate-500 transition hover:bg-emerald-50 hover:text-emerald-600"
                    @click="asignarBien(bien)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    title="Imprimir ficha"
                    aria-label="Imprimir ficha"
                    class="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    @click="imprimirFicha(bien)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="bienesPagina.length === 0">
              <td colspan="11" class="px-4 py-12 text-center text-sm text-slate-400">
                No se encontraron bienes que coincidan con "{{ busqueda }}".
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-slate-500">
          Mostrando {{ rangoInicio }} a {{ rangoFin }} de {{ bienesFiltrados.length }} elementos
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

    <NuevoBienModal v-model:open="mostrarModalNuevoBien" @guardar="onGuardarBien" />
    <FiltrosBienesModal v-model:open="mostrarModalFiltros" :filtros="filtros" @aplicar="onAplicarFiltros" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { filtrosVacios, useBienesData, type Bien, type EstatusBien, type FiltrosBienes } from '@/composables/useBienesData'
import { descargarCsv } from '@/utils/csv'
import NuevoBienModal from '@/components/bienes/NuevoBienModal.vue'
import FiltrosBienesModal from '@/components/bienes/FiltrosBienesModal.vue'

const { bienes, agregarBien } = useBienesData()

const PAGE_SIZE_OPCIONES = [10, 25, 50, 100] as const

const busqueda = ref('')
const pageSize = ref<(typeof PAGE_SIZE_OPCIONES)[number]>(10)
const paginaActual = ref(1)

const mostrarModalFiltros = ref(false)
const filtros = ref<FiltrosBienes>(filtrosVacios())

const hayFiltrosActivos = computed(
  () =>
    filtros.value.tipo !== '' ||
    filtros.value.estatus !== '' ||
    filtros.value.inventariable !== 'todos' ||
    filtros.value.ubicacion !== '' ||
    filtros.value.direccion !== '' ||
    filtros.value.departamento !== '' ||
    filtros.value.fechaAltaDesde !== '' ||
    filtros.value.fechaAltaHasta !== '',
)

function onAplicarFiltros(nuevosFiltros: FiltrosBienes) {
  filtros.value = nuevosFiltros
}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

function coincideConFiltros(bien: Bien): boolean {
  const f = filtros.value

  const coincideTipo = !f.tipo || bien.nombre === f.tipo
  const coincideEstatus = !f.estatus || bien.estatus === f.estatus
  const coincideInventariable =
    f.inventariable === 'todos' || (f.inventariable === 'si' && bien.inventariable) || (f.inventariable === 'no' && !bien.inventariable)
  const coincideUbicacion = !f.ubicacion || bien.ubicacion === f.ubicacion
  const coincideDireccion = !f.direccion || bien.direccion === f.direccion
  const coincideDepartamento = !f.departamento || bien.departamento === f.departamento
  const coincideFechaDesde = !f.fechaAltaDesde || bien.fechaAlta >= f.fechaAltaDesde
  const coincideFechaHasta = !f.fechaAltaHasta || bien.fechaAlta <= f.fechaAltaHasta

  return (
    coincideTipo &&
    coincideEstatus &&
    coincideInventariable &&
    coincideUbicacion &&
    coincideDireccion &&
    coincideDepartamento &&
    coincideFechaDesde &&
    coincideFechaHasta
  )
}

const bienesFiltrados = computed(() => {
  const termino = normalizar(busqueda.value.trim())

  return bienes.filter((bien) => {
    const coincideBusqueda =
      !termino ||
      [
        bien.nombre,
        bien.modelo,
        bien.marca,
        bien.numeroSerie,
        bien.numeroInventario,
        bien.caracteristicas,
        bien.estatus,
      ].some((campo) => normalizar(campo).includes(termino))

    return coincideBusqueda && coincideConFiltros(bien)
  })
})

const totalPaginas = computed(() => Math.max(1, Math.ceil(bienesFiltrados.value.length / pageSize.value)))

const bienesPagina = computed(() => {
  const inicio = (paginaActual.value - 1) * pageSize.value
  return bienesFiltrados.value.slice(inicio, inicio + pageSize.value)
})

const rangoInicio = computed(() => (bienesFiltrados.value.length === 0 ? 0 : (paginaActual.value - 1) * pageSize.value + 1))
const rangoFin = computed(() => Math.min(paginaActual.value * pageSize.value, bienesFiltrados.value.length))

// Vuelve a la primera página cuando cambia la búsqueda, los filtros o el tamaño de página.
watch([busqueda, pageSize, filtros], () => {
  paginaActual.value = 1
})

// Si la página actual queda fuera de rango (ej. al filtrar), la ajusta.
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

const ESTATUS_ESTILOS: Record<EstatusBien, string> = {
  Asignado: 'bg-emerald-50 text-emerald-700',
  'Por asignar': 'bg-amber-50 text-amber-700',
  'En reparación': 'bg-blue-50 text-blue-700',
  Baja: 'bg-slate-100 text-slate-500',
}
function estatusClasses(estatus: EstatusBien): string {
  return ESTATUS_ESTILOS[estatus]
}

const mostrarModalNuevoBien = ref(false)

function nuevoBien() {
  mostrarModalNuevoBien.value = true
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

function onGuardarBien(datos: Omit<Bien, 'id'>) {
  agregarBien(datos)
  // Vuelve a la primera página para que el bien recién agregado sea visible.
  paginaActual.value = 1
}

function editarBien(bien: Bien) {
  // TODO: navegar a la pantalla de edición del bien cuando exista,
  // ej. router.push(`/dashboard/bienes/${bien.id}/editar`)
  console.info('Editar bien', bien.id)
}

function asignarBien(bien: Bien) {
  // TODO: abrir el flujo de asignación/reasignación del bien cuando exista
  console.info('Asignar bien', bien.id)
}

function imprimirFicha(bien: Bien) {
  // TODO: generar/mostrar la ficha imprimible del bien cuando exista
  console.info('Imprimir ficha de bien', bien.id)
}

type VarianteExportacion = 'filtrados' | 'asignados' | 'todos'

/** Exporta una lista de bienes a CSV (compatible con Excel). */
function exportarBienes(lista: Bien[], sufijoArchivo: string) {
  const encabezados = [
    'Nombre',
    'Modelo',
    'Marca',
    'Número de serie',
    'Número de inventario',
    'Fecha de alta',
    'Características',
    'Meses de garantía',
    'Estatus',
    'Inventariable',
  ]

  const filas = lista.map((bien) => [
    bien.nombre,
    bien.modelo,
    bien.marca,
    bien.numeroSerie,
    bien.numeroInventario,
    formatFecha(bien.fechaAlta),
    bien.caracteristicas,
    String(bien.mesesGarantia),
    bien.estatus,
    bien.inventariable ? 'Sí' : 'No',
  ])

  descargarCsv(encabezados, filas, `bienes_${sufijoArchivo}`)
}

/** Exporta a CSV según la variante elegida en el menú "Exportar a Excel". */
function exportarExcel(variante: VarianteExportacion) {
  if (variante === 'asignados') {
    exportarBienes(bienes.filter((bien) => bien.estatus === 'Asignado'), 'asignados')
  } else if (variante === 'todos') {
    exportarBienes(bienes, 'todos')
  } else {
    exportarBienes(bienesFiltrados.value, 'filtrados')
  }

  mostrarMenuExportar.value = false
}
</script>
