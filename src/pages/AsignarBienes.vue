<template>
  <div class="min-w-0 space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Asignación y reasignación de bienes</h2>
        <p class="mt-1 text-sm text-slate-500">Movimientos de bienes por persona, ubicación y departamento</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          @click="abrirModal('Reasignación')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          Reasignar bien
        </button>
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-500 hover:to-indigo-500"
          @click="abrirModal('Asignación')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Asignar bien
        </button>
      </div>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <!-- Controles: tamaño de página + buscador -->
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

        <div class="relative w-full sm:w-72">
          <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>
          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar movimientos..."
            class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
      </div>

      <!-- Tabla -->
      <div class="max-h-[600px] overflow-auto">
        <table class="w-full text-left text-sm">
          <thead class="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
            <tr>
              <th class="whitespace-nowrap px-4 py-3">Tipo</th>
              <th class="whitespace-nowrap px-4 py-3">Folio</th>
              <th class="whitespace-nowrap px-4 py-3">Persona</th>
              <th class="whitespace-nowrap px-4 py-3">Ubicación</th>
              <th class="whitespace-nowrap px-4 py-3">Dirección</th>
              <th class="whitespace-nowrap px-4 py-3">Departamento</th>
              <th class="whitespace-nowrap px-4 py-3">Fecha</th>
              <th class="whitespace-nowrap px-4 py-3">Mesa de ayuda</th>
              <th class="whitespace-nowrap px-4 py-3">Bienes</th>
              <th class="whitespace-nowrap px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="asignacion in asignacionesPagina" :key="asignacion.id" class="transition hover:bg-slate-50">
              <td class="whitespace-nowrap px-4 py-3">
                <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="TIPO_ESTILOS[asignacion.tipo]">
                  {{ asignacion.tipo }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{{ asignacion.folioResguardo }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ asignacion.persona }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ asignacion.ubicacion }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ asignacion.direccion }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ asignacion.departamento }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ formatFecha(asignacion.fechaAsignacion) }}</td>
              <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ asignacion.mesaAyuda }}</td>
              <td class="whitespace-nowrap px-4 py-3">
                <button
                  type="button"
                  class="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition hover:border-blue-400/60 hover:bg-blue-50"
                  @click="verBienes(asignacion)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {{ asignacion.bienesIds.length }} {{ asignacion.bienesIds.length === 1 ? 'bien' : 'bienes' }}
                </button>
              </td>
              <td class="whitespace-nowrap px-4 py-3">
                <div class="flex items-center gap-1">
                  <button
                    type="button"
                    title="Reasignar bienes de esta persona"
                    aria-label="Reasignar"
                    class="rounded-lg p-1.5 text-slate-500 transition hover:bg-amber-50 hover:text-amber-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                    :disabled="asignacion.bienesIds.length === 0"
                    @click="abrirModal('Reasignación', asignacion.persona)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    title="Imprimir hoja de resguardo"
                    aria-label="Imprimir hoja de resguardo"
                    class="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    @click="imprimirResguardo(asignacion)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="asignacionesPagina.length === 0">
              <td colspan="10" class="px-4 py-12 text-center text-sm text-slate-400">
                No se encontraron movimientos que coincidan con "{{ busqueda }}".
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p class="text-sm text-slate-500">
          Mostrando {{ rangoInicio }} a {{ rangoFin }} de {{ asignacionesFiltradas.length }} elementos
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
      :persona="asignacionSeleccionada?.persona ?? ''"
      :bienes="bienesDe(asignacionSeleccionada?.bienesIds ?? [])"
    />
    <AsignarBienModal
      v-model:open="mostrarModalMovimiento"
      :modo-inicial="modoModal"
      :persona-inicial="personaModal"
      @guardar="onGuardarMovimiento"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  useAsignacionesData,
  type Asignacion,
  type DatosMovimiento,
  type TipoMovimiento,
} from '@/composables/useAsignacionesData'
import AsignarBienModal from '@/components/asignaciones/AsignarBienModal.vue'
import BienesAsignadosModal from '@/components/asignaciones/BienesAsignadosModal.vue'

const { asignaciones, registrarMovimiento, bienesDe } = useAsignacionesData()

const PAGE_SIZE_OPCIONES = [10, 25, 50, 100] as const

const busqueda = ref('')
const pageSize = ref<(typeof PAGE_SIZE_OPCIONES)[number]>(10)
const paginaActual = ref(1)

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

const asignacionesFiltradas = computed(() => {
  const termino = normalizar(busqueda.value.trim())
  if (!termino) return asignaciones

  return asignaciones.filter((asignacion) =>
    [
      asignacion.tipo,
      asignacion.folioResguardo,
      asignacion.persona,
      asignacion.ubicacion,
      asignacion.direccion,
      asignacion.departamento,
      asignacion.mesaAyuda,
    ].some((campo) => normalizar(campo).includes(termino)),
  )
})

const totalPaginas = computed(() => Math.max(1, Math.ceil(asignacionesFiltradas.value.length / pageSize.value)))

const asignacionesPagina = computed(() => {
  const inicio = (paginaActual.value - 1) * pageSize.value
  return asignacionesFiltradas.value.slice(inicio, inicio + pageSize.value)
})

const rangoInicio = computed(() => (asignacionesFiltradas.value.length === 0 ? 0 : (paginaActual.value - 1) * pageSize.value + 1))
const rangoFin = computed(() => Math.min(paginaActual.value * pageSize.value, asignacionesFiltradas.value.length))

// Vuelve a la primera página cuando cambia la búsqueda o el tamaño de página.
watch([busqueda, pageSize], () => {
  paginaActual.value = 1
})

// Si la página actual queda fuera de rango (ej. al buscar), la ajusta.
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

const TIPO_ESTILOS: Record<TipoMovimiento, string> = {
  Asignación: 'bg-blue-50 text-blue-700',
  Reasignación: 'bg-amber-50 text-amber-700',
}

const mostrarModalBienes = ref(false)
const asignacionSeleccionada = ref<Asignacion | null>(null)

function verBienes(asignacion: Asignacion) {
  asignacionSeleccionada.value = asignacion
  mostrarModalBienes.value = true
}

const mostrarModalMovimiento = ref(false)
const modoModal = ref<TipoMovimiento>('Asignación')
const personaModal = ref<string | undefined>(undefined)

function abrirModal(modo: TipoMovimiento, persona?: string) {
  modoModal.value = modo
  personaModal.value = persona
  mostrarModalMovimiento.value = true
}

function onGuardarMovimiento(tipo: TipoMovimiento, datos: DatosMovimiento, bienesIds: string[]) {
  registrarMovimiento(tipo, datos, bienesIds)
  paginaActual.value = 1
}

function imprimirResguardo(asignacion: Asignacion) {
  // TODO: generar/mostrar la hoja de resguardo imprimible cuando exista
  console.info('Imprimir hoja de resguardo', asignacion.folioResguardo)
}
</script>
