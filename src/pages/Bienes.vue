<template>
  <div class="min-w-0 space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div class="flex items-baseline gap-3.5">
        <h1 class="page-title">Bienes</h1>
        <p class="text-[15px] text-slate-500">{{ bienes.length }} registrados</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Exportar a Excel (con variantes) -->
        <div ref="menuExportarRef" class="relative">
          <AppButton variant="secondary" :aria-expanded="mostrarMenuExportar" @click="mostrarMenuExportar = !mostrarMenuExportar">
            Exportar a Excel
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-slate-500 transition-transform" :class="{ 'rotate-180': mostrarMenuExportar }" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </AppButton>

          <Transition name="fade">
            <div
              v-if="mostrarMenuExportar"
              class="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
            >
              <button
                type="button"
                class="block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                @click="exportarExcel('filtrados')"
              >
                Excel con los filtros aplicados
                <span class="block text-xs text-slate-500">{{ bienesFiltrados.length }} bienes visibles ahora</span>
              </button>
              <button
                type="button"
                class="block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                @click="exportarExcel('asignados')"
              >
                Excel de bienes asignados
                <span class="block text-xs text-slate-500">Solo con estatus "Asignado"</span>
              </button>
              <button
                type="button"
                class="block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                @click="exportarExcel('todos')"
              >
                Excel de todos los bienes
                <span class="block text-xs text-slate-500">Ignora la búsqueda y los filtros</span>
              </button>
            </div>
          </Transition>
        </div>

        <AppButton
          variant="secondary"
          :disabled="!can('bienes:importar')"
          :title="can('bienes:importar') ? undefined : motivoSinPermiso('bienes:importar', rol)"
          data-doc="importar-bienes"
          @click="mostrarImportacion = true"
        >
          Importar
        </AppButton>

        <AppButton :disabled="!can('bienes:crear')" :title="can('bienes:crear') ? undefined : motivoSinPermiso('bienes:crear', rol)" @click="abrirNuevoBien">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar bien
        </AppButton>
      </div>
    </div>

    <div class="grid items-start gap-7" :class="bienActivo ? 'xl:grid-cols-[minmax(0,1fr)_25rem]' : ''">
      <div class="min-w-0 rounded border border-slate-200 bg-white">
        <!-- El estatus es el filtro más usado: va a la vista, no dentro del modal de filtros. -->
        <TabsBar v-model="tabEstatus" :tabs="tabsEstatus" label="Estatus del bien" />

        <!-- Controles: buscador + filtros avanzados + tamaño de página -->
        <div class="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center">
          <div class="flex items-center gap-2">
            <SearchInput v-model="busqueda" placeholder="Nombre, serie o inventario" class="w-full sm:w-72" />

            <button
              type="button"
              class="relative flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
              :class="hayFiltrosActivos
                ? 'border-blue-600 bg-blue-50 text-blue-800 hover:bg-blue-100'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'"
              @click="mostrarModalFiltros = true"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              Más filtros
              <span v-if="hayFiltrosActivos" class="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-blue-600"></span>
            </button>
          </div>

          <PageSizeSelect v-model="pageSize" class="sm:ml-auto" />
        </div>

        <FocoChip v-if="foco" :etiqueta="FOCO_ETIQUETAS[foco]" @quitar="quitarFoco" />

        <!-- Barra de acciones sobre la selección -->
        <div v-if="bienesSeleccionados.length > 0" class="flex flex-wrap items-center gap-2 border-b border-manila-200 bg-manila-50 px-4 py-2.5">
          <span class="mr-2 text-sm font-medium tabular-nums text-slate-900">
            {{ bienesSeleccionados.length }} {{ bienesSeleccionados.length === 1 ? 'bien seleccionado' : 'bienes seleccionados' }}
          </span>
          <AppButton
            size="sm"
            :disabled="!puedeAsignar || !can('bienes:mover')"
            :title="tituloMovimiento(puedeAsignar, 'Solo se pueden asignar bienes con estatus «Por asignar»')"
            @click="abrirMovimiento('Asignación', bienesSeleccionados)"
          >
            Asignar
          </AppButton>
          <AppButton
            variant="secondary"
            size="sm"
            :disabled="!puedeReasignarODevolver || !can('bienes:mover')"
            :title="tituloMovimiento(puedeReasignarODevolver, 'Solo se pueden reasignar bienes con estatus «Asignado»')"
            @click="abrirMovimiento('Reasignación', bienesSeleccionados)"
          >
            Reasignar
          </AppButton>
          <AppButton
            variant="secondary"
            size="sm"
            :disabled="!puedeReasignarODevolver || !can('bienes:mover')"
            :title="tituloMovimiento(puedeReasignarODevolver, 'Solo se pueden devolver bienes con estatus «Asignado»')"
            @click="abrirMovimiento('Devolución', bienesSeleccionados)"
          >
            Devolver a almacén
          </AppButton>
          <AppButton
            variant="secondary"
            size="sm"
            :disabled="!can('mantenimiento:programar')"
            :title="can('mantenimiento:programar') ? undefined : motivoSinPermiso('mantenimiento:programar', rol)"
            @click="abrirCorrectivo(bienesSeleccionados)"
          >
            Enviar a correctivo
          </AppButton>
          <AppButton variant="secondary" size="sm" data-doc="imprimir-etiquetas" @click="mostrarEtiquetas = true">Imprimir etiquetas</AppButton>
          <AppButton variant="ghost" size="sm" class="ml-auto" @click="limpiarSeleccion">Limpiar selección</AppButton>
        </div>

        <!-- Tabla: lo necesario para ubicar el bien; el resto de los datos está en su expediente. -->
        <div class="max-h-[600px] overflow-auto">
          <table class="w-full text-left text-sm">
            <thead class="sticky top-0 z-10 bg-slate-50 text-[13px] font-semibold text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
              <tr>
                <th class="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar los bienes de esta página"
                    title="Seleccionar los bienes de esta página"
                    class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-40"
                    :checked="todaLaPaginaSeleccionada"
                    :indeterminate="algoDeLaPaginaSeleccionado && !todaLaPaginaSeleccionada"
                    :disabled="seleccionablesPagina.length === 0"
                    @change="alternarPagina"
                  />
                </th>
                <th class="whitespace-nowrap px-4 py-3">Bien</th>
                <th class="whitespace-nowrap px-4 py-3">Número de inventario</th>
                <th class="whitespace-nowrap px-4 py-3">Estatus</th>
                <th class="whitespace-nowrap px-4 py-3">Responsable</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="bien in bienesPagina"
                :key="bien.id"
                class="cursor-pointer transition hover:bg-manila-50"
                :class="{
                  'bg-manila-50 shadow-[inset_0_0_0_1.5px_var(--color-manila-200)]': bienActivoId === bien.id,
                  'bg-blue-50/60': bienActivoId !== bien.id && seleccionados.has(bien.id),
                }"
                @click="alternarExpediente(bien)"
              >
                <td class="px-4 py-3" @click.stop>
                  <input
                    type="checkbox"
                    :aria-label="`Seleccionar ${bien.nombre} ${bien.numeroInventario}`"
                    :title="esSeleccionable(bien) ? undefined : `Un bien «${bien.estatus}» no se puede asignar ni mover`"
                    class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-40"
                    :checked="seleccionados.has(bien.id)"
                    :disabled="!esSeleccionable(bien)"
                    @change="alternarSeleccion(bien.id)"
                  />
                </td>
                <td class="px-4 py-3">
                  <button
                    type="button"
                    class="block rounded text-left font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    :aria-expanded="bienActivoId === bien.id"
                    :aria-label="`Ver el expediente de ${bien.nombre} ${bien.marca} ${bien.modelo}`"
                    @click.stop="alternarExpediente(bien)"
                  >
                    {{ bien.nombre }}
                  </button>
                  <span class="block text-[13px] text-slate-500">{{ bien.marca }} · {{ bien.modelo }}</span>
                </td>
                <td class="whitespace-nowrap px-4 py-3 font-mono text-[12.5px] tabular-nums text-slate-700">{{ bien.numeroInventario || 'Sin inventario' }}</td>
                <td class="px-4 py-3 text-slate-800"><EstatusPunto :estatus="bien.estatus" /></td>
                <td class="whitespace-nowrap px-4 py-3" :class="bien.responsable ? 'text-slate-800' : 'text-slate-500'">{{ bien.responsable ?? 'Sin responsable' }}</td>
              </tr>

              <tr v-if="bienesPagina.length === 0">
                <td colspan="5">
                  <EmptyState mensaje="No se encontraron bienes que coincidan con la búsqueda o los filtros." />
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

      <!-- Expediente del bien seleccionado -->
      <div v-if="bienActivo" ref="expedienteRef" class="min-w-0 scroll-mt-4 xl:sticky xl:top-0">
        <ExpedienteBien
          :bien="bienActivo"
          @cerrar="bienActivoId = null"
          @mover="(tipo) => abrirMovimiento(tipo, [bienActivo!])"
          @editar="editarBien(bienActivo!)"
          @ficha="imprimirFicha(bienActivo!)"
          @historial="verHistorial(bienActivo!)"
        />
      </div>
    </div>

    <NuevoBienModal v-model:open="mostrarModalNuevoBien" :bien="bienEditando" @guardar="onGuardarBien" />
    <FiltrosBienesModal v-model:open="mostrarModalFiltros" :filtros="filtros" @aplicar="onAplicarFiltros" />
    <MovimientoBienesModal
      v-model:open="mostrarModalMovimiento"
      :tipo="tipoMovimiento"
      :bienes="bienesMovimiento"
      @confirmar="onConfirmarMovimiento"
    />
    <ProgramarMantenimientoModal
      v-model:open="mostrarModalCorrectivo"
      tipo-inicial="Correctivo"
      :bienes="bienesCorrectivo"
      @confirmar="onConfirmarCorrectivo"
    />

    <HistorialBienModal v-model:open="mostrarHistorial" :bien="bienHistorial" />

    <ImportarBienesModal v-model:open="mostrarImportacion" @importar="onImportar" />

    <VistaPreviaDocumento
      v-model:open="mostrarEtiquetas"
      title="Etiquetas con código QR"
      :subtitle="`${bienesSeleccionados.length} ${bienesSeleccionados.length === 1 ? 'etiqueta' : 'etiquetas'}`"
    >
      <DocumentoEtiquetas :bienes="bienesSeleccionados" />
    </VistaPreviaDocumento>

    <VistaPreviaDocumento
      v-model:open="mostrarVistaPrevia"
      title="Ficha del bien"
      :subtitle="bienImpresion ? `${bienImpresion.nombre} · ${bienImpresion.numeroInventario}` : undefined"
    >
      <DocumentoFichaBien v-if="bienImpresion" :bien="bienImpresion" />
    </VistaPreviaDocumento>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { FOCO_ETIQUETAS, useAlertasData } from '@/composables/useAlertasData'
import { useAuth } from '@/composables/useAuth'
import { motivoSinPermiso } from '@/config/permisos'
import { useFocoDeRuta } from '@/composables/useFocoDeRuta'
import { filtrosVacios, useBienesData, type Bien, type EstatusBien, type FiltrosBienes } from '@/composables/useBienesData'
import { useMantenimientosData, type NuevoDictamenDirecto, type NuevoMantenimiento } from '@/composables/useMantenimientosData'
import { useMovimientosData, type NuevoMovimiento, type TipoMovimiento } from '@/composables/useMovimientosData'
import { usePaginacion } from '@/composables/usePaginacion'
import { useToast } from '@/composables/useToast'
import { descargarCsv } from '@/utils/csv'
import { formatFecha, formatMoneda } from '@/utils/formato'
import DocumentoFichaBien from '@/components/documentos/DocumentoFichaBien.vue'
import VistaPreviaDocumento from '@/components/documentos/VistaPreviaDocumento.vue'
import HistorialBienModal from '@/components/bienes/HistorialBienModal.vue'
import ImportarBienesModal from '@/components/bienes/ImportarBienesModal.vue'
import DocumentoEtiquetas from '@/components/documentos/DocumentoEtiquetas.vue'
import NuevoBienModal from '@/components/bienes/NuevoBienModal.vue'
import FiltrosBienesModal from '@/components/bienes/FiltrosBienesModal.vue'
import ProgramarMantenimientoModal from '@/components/mantenimiento/ProgramarMantenimientoModal.vue'
import MovimientoBienesModal from '@/components/movimientos/MovimientoBienesModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FocoChip from '@/components/ui/FocoChip.vue'
import EstatusPunto from '@/components/ui/EstatusPunto.vue'
import PageSizeSelect from '@/components/ui/PageSizeSelect.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import TablePagination from '@/components/ui/TablePagination.vue'
import TabsBar from '@/components/ui/TabsBar.vue'
import ExpedienteBien from '@/components/bienes/ExpedienteBien.vue'

const { bienes, agregarBien, agregarBienes, actualizarBien } = useBienesData()
const { can, rol } = useAuth()
const { registrarMovimiento } = useMovimientosData()
const { iniciarMantenimiento, generarDictamenDirecto } = useMantenimientosData()
const toast = useToast()

const busqueda = ref('')
const pageSize = ref(10)

const mostrarModalFiltros = ref(false)
const filtros = ref<FiltrosBienes>(filtrosVacios())

// Las tarjetas del dashboard llegan con `?estatus=` y las alertas de garantía con `?foco=`.
const route = useRoute()
const ESTATUS_VALIDOS: EstatusBien[] = ['Asignado', 'Por asignar', 'En reparación', 'Baja']

function aplicarEstatusDeRuta() {
  const valor = route.query.estatus
  if (typeof valor === 'string' && (ESTATUS_VALIDOS as string[]).includes(valor)) {
    filtros.value = { ...filtrosVacios(), estatus: valor as EstatusBien }
  }
}
aplicarEstatusDeRuta()
watch(() => route.query.estatus, aplicarEstatusDeRuta)

const { foco, limpiar: quitarFoco } = useFocoDeRuta(['garantia-por-vencer'])
const { idsDeFoco } = useAlertasData()
const idsEnFoco = computed(() => (foco.value ? idsDeFoco(foco.value) : null))

const hayFiltrosActivos = computed(
  () =>
    filtros.value.tipo !== '' ||
    filtros.value.inventariable !== 'todos' ||
    filtros.value.ubicacion !== '' ||
    filtros.value.direccion !== '' ||
    filtros.value.departamento !== '' ||
    filtros.value.responsable !== '' ||
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
  const coincideResponsable = !f.responsable || bien.responsable === f.responsable
  const coincideFechaDesde = !f.fechaAltaDesde || bien.fechaAlta >= f.fechaAltaDesde
  const coincideFechaHasta = !f.fechaAltaHasta || bien.fechaAlta <= f.fechaAltaHasta

  return (
    coincideTipo &&
    coincideEstatus &&
    coincideInventariable &&
    coincideUbicacion &&
    coincideDireccion &&
    coincideDepartamento &&
    coincideResponsable &&
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
        bien.responsable ?? '',
      ].some((campo) => normalizar(campo).includes(termino))

    return coincideBusqueda && coincideConFiltros(bien) && (!idsEnFoco.value || idsEnFoco.value.has(bien.id))
  })
})

const { paginaActual, totalPaginas, pagina: bienesPagina, rangoInicio, rangoFin, total, irAlInicio } = usePaginacion(
  bienesFiltrados,
  pageSize,
)

// Vuelve a la primera página cuando cambia la búsqueda o los filtros.
watch([busqueda, filtros], irAlInicio)

// Pestañas de estatus con conteo sobre todo el inventario (no sobre la búsqueda): son la vista rápida.
type TabEstatus = 'todos' | EstatusBien

const tabsEstatus = computed<Array<{ valor: TabEstatus; etiqueta: string; conteo: number }>>(() => [
  { valor: 'todos', etiqueta: 'Todos', conteo: bienes.length },
  ...ESTATUS_VALIDOS.map((estatus) => ({
    valor: estatus,
    etiqueta: estatus === 'Asignado' ? 'Asignados' : estatus === 'Baja' ? 'De baja' : estatus,
    conteo: bienes.filter((bien) => bien.estatus === estatus).length,
  })),
])

const tabEstatus = computed<TabEstatus>({
  get: () => filtros.value.estatus || 'todos',
  set: (valor) => {
    filtros.value = { ...filtros.value, estatus: valor === 'todos' ? '' : valor }
  },
})

// --- Expediente: el bien abierto a la derecha de la lista (un clic en la fila lo abre o lo cierra) ---
const bienActivoId = ref<string | null>(null)
const bienActivo = computed(() => (bienActivoId.value ? (bienes.find((bien) => bien.id === bienActivoId.value) ?? null) : null))
const expedienteRef = ref<HTMLElement | null>(null)

async function alternarExpediente(bien: Bien) {
  if (bienActivoId.value === bien.id) {
    bienActivoId.value = null
    return
  }
  bienActivoId.value = bien.id
  // En pantallas angostas el expediente queda debajo de la lista: se lleva a la vista.
  if (window.matchMedia('(max-width: 1279px)').matches) {
    await nextTick()
    expedienteRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const mostrarModalNuevoBien = ref(false)

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

// null = el modal está en modo alta; con un bien = modo edición.
const bienEditando = ref<Bien | null>(null)

function abrirNuevoBien() {
  bienEditando.value = null
  mostrarModalNuevoBien.value = true
}

function onGuardarBien(datos: Omit<Bien, 'id'>) {
  const editando = bienEditando.value
  if (editando) {
    const { estatus: _estatus, responsable: _responsable, ...editables } = datos
    actualizarBien(editando.id, editables)
    toast.success(`Bien actualizado: ${datos.numeroInventario || `${datos.nombre} ${datos.marca}`.trim()}`)
    return
  }

  agregarBien(datos)
  // Vuelve a la primera página para que el bien recién agregado sea visible.
  irAlInicio()
  toast.success(`Bien agregado: ${datos.nombre} ${datos.marca}`.trim())
}

function editarBien(bien: Bien) {
  if (bien.estatus === 'Baja') return
  bienEditando.value = bien
  mostrarModalNuevoBien.value = true
}

// --- Selección múltiple y movimientos (asignar / reasignar / devolver) ---
// La selección persiste entre páginas, búsquedas y filtros.
const seleccionados = ref<Set<string>>(new Set())

function esSeleccionable(bien: Bien): boolean {
  return bien.estatus === 'Por asignar' || bien.estatus === 'Asignado'
}

function alternarSeleccion(bienId: string) {
  const siguiente = new Set(seleccionados.value)
  if (!siguiente.delete(bienId)) siguiente.add(bienId)
  seleccionados.value = siguiente
}

const seleccionablesPagina = computed(() => bienesPagina.value.filter(esSeleccionable))
const todaLaPaginaSeleccionada = computed(
  () => seleccionablesPagina.value.length > 0 && seleccionablesPagina.value.every((bien) => seleccionados.value.has(bien.id)),
)
const algoDeLaPaginaSeleccionado = computed(() => seleccionablesPagina.value.some((bien) => seleccionados.value.has(bien.id)))

function alternarPagina() {
  const siguiente = new Set(seleccionados.value)
  for (const bien of seleccionablesPagina.value) {
    if (todaLaPaginaSeleccionada.value) siguiente.delete(bien.id)
    else siguiente.add(bien.id)
  }
  seleccionados.value = siguiente
}

function limpiarSeleccion() {
  seleccionados.value = new Set()
}

const bienesSeleccionados = computed(() => bienes.filter((bien) => seleccionados.value.has(bien.id)))
const puedeAsignar = computed(() => bienesSeleccionados.value.length > 0 && bienesSeleccionados.value.every((bien) => bien.estatus === 'Por asignar'))
const puedeReasignarODevolver = computed(
  () => bienesSeleccionados.value.length > 0 && bienesSeleccionados.value.every((bien) => bien.estatus === 'Asignado'),
)

const mostrarModalMovimiento = ref(false)
const tipoMovimiento = ref<TipoMovimiento>('Asignación')
const bienesMovimiento = ref<Bien[]>([])

function abrirMovimiento(tipo: TipoMovimiento, lista: Bien[]) {
  tipoMovimiento.value = tipo
  bienesMovimiento.value = lista
  mostrarModalMovimiento.value = true
}

function onConfirmarMovimiento(nuevo: NuevoMovimiento) {
  const hojasCreadas = registrarMovimiento(nuevo)

  // Los bienes ya movidos dejan la selección; el resto de la selección se conserva.
  const siguiente = new Set(seleccionados.value)
  nuevo.bienesIds.forEach((id) => siguiente.delete(id))
  seleccionados.value = siguiente

  const cantidad = nuevo.bienesIds.length
  const bienesTexto = `${cantidad} ${cantidad === 1 ? 'bien' : 'bienes'}`
  const folios = hojasCreadas.map((hoja) => hoja.folio).join(', ')
  const destino = nuevo.tipo === 'Devolución' ? 'a almacén' : `para ${nuevo.destino.persona}`
  toast.success(`${nuevo.tipo} guardada: ${bienesTexto} ${destino} (${folios})`)
}

// --- Mantenimiento correctivo (desde la barra de acciones de la selección) ---
const mostrarModalCorrectivo = ref(false)
const bienesCorrectivo = ref<Bien[]>([])

function abrirCorrectivo(lista: Bien[]) {
  bienesCorrectivo.value = lista
  mostrarModalCorrectivo.value = true
}

function onConfirmarCorrectivo(registro: NuevoMantenimiento | NuevoDictamenDirecto) {
  const siguiente = new Set(seleccionados.value)
  registro.bienesIds.forEach((id) => siguiente.delete(id))
  seleccionados.value = siguiente

  if (registro.tipo === 'Dictamen') {
    const dictamenesGenerados = generarDictamenDirecto(registro)
    const cantidad = dictamenesGenerados.length
    const folios = dictamenesGenerados.map((dictamen) => dictamen.folio).join(', ')
    toast.success(`Dictamen generado: ${cantidad} ${cantidad === 1 ? 'bien dado' : 'bienes dados'} de baja (${folios})`)
    return
  }

  const creados = iniciarMantenimiento(registro)
  const cantidad = creados.length
  const folios = creados.map((item) => item.folio).join(', ')
  toast.success(`${registro.tipo} registrado: ${cantidad} ${cantidad === 1 ? 'bien' : 'bienes'} (${folios})`)
}

// --- Permisos: los controles se deshabilitan explicando el motivo en vez de desaparecer (los de una fila, en ExpedienteBien) ---
/** Título de un botón de movimiento en lote: primero el permiso, después la regla de estatus. */
function tituloMovimiento(cumpleEstatus: boolean, reglaEstatus: string): string | undefined {
  if (!can('bienes:mover')) return motivoSinPermiso('bienes:mover', rol.value)
  return cumpleEstatus ? undefined : reglaEstatus
}

// --- Importación masiva y etiquetas ---
const mostrarImportacion = ref(false)
const mostrarEtiquetas = ref(false)

function onImportar(lista: Array<Omit<Bien, 'id'>>) {
  agregarBienes(lista)
  irAlInicio()
  toast.success(`Importación lista: ${lista.length} ${lista.length === 1 ? 'bien agregado' : 'bienes agregados'}`)
}

const mostrarHistorial = ref(false)
const bienHistorial = ref<Bien | null>(null)

function verHistorial(bien: Bien) {
  bienHistorial.value = bien
  mostrarHistorial.value = true
}

const mostrarVistaPrevia = ref(false)
const bienImpresion = ref<Bien | null>(null)

function imprimirFicha(bien: Bien) {
  bienImpresion.value = bien
  mostrarVistaPrevia.value = true
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
    'Valor de adquisición',
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
    bien.valorAdquisicion === undefined ? '' : bien.valorAdquisicion.toFixed(2),
    bien.estatus,
    bien.inventariable ? 'Sí' : 'No',
  ])

  descargarCsv(encabezados, filas, `bienes_${sufijoArchivo}`)
  toast.success(`Exportación lista: ${lista.length} bienes`)
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
