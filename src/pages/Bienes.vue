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
              <button
                type="button"
                class="block w-full px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                @click="exportarExcel('filtrados')"
              >
                Excel con los filtros aplicados
                <span class="block text-xs text-slate-400">{{ bienesFiltrados.length }} bienes visibles ahora</span>
              </button>
              <button
                type="button"
                class="block w-full px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                @click="exportarExcel('asignados')"
              >
                Excel de bienes asignados
                <span class="block text-xs text-slate-400">Solo con estatus "Asignado"</span>
              </button>
              <button
                type="button"
                class="block w-full px-4 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
                @click="exportarExcel('todos')"
              >
                Excel de todos los bienes
                <span class="block text-xs text-slate-400">Ignora la búsqueda y los filtros</span>
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
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Importar
        </AppButton>

        <AppButton :disabled="!can('bienes:crear')" :title="can('bienes:crear') ? undefined : motivoSinPermiso('bienes:crear', rol)" @click="abrirNuevoBien">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar Bien
        </AppButton>
      </div>
    </div>

    <div class="rounded-lg border border-slate-200 bg-white">
      <!-- Controles: tamaño de página + buscador + filtros -->
      <div class="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <PageSizeSelect v-model="pageSize" />

        <div class="flex items-center gap-2">
          <SearchInput v-model="busqueda" placeholder="Buscar bienes..." class="w-full sm:w-72" />

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

      <FocoChip v-if="foco" :etiqueta="FOCO_ETIQUETAS[foco]" @quitar="quitarFoco" />

      <!-- Barra de acciones sobre la selección -->
      <div v-if="bienesSeleccionados.length > 0" class="flex flex-wrap items-center gap-2 border-b border-blue-100 bg-blue-50/60 px-4 py-2.5">
        <span class="mr-2 text-sm font-medium tabular-nums text-blue-800">
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

      <!-- Tabla -->
      <div class="max-h-[600px] overflow-auto">
        <table class="w-full text-left text-sm">
          <thead class="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
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
              <th class="whitespace-nowrap px-4 py-3">Nombre</th>
              <th class="whitespace-nowrap px-4 py-3">Modelo</th>
              <th class="whitespace-nowrap px-4 py-3">Marca</th>
              <th class="whitespace-nowrap px-4 py-3">Número de serie</th>
              <th class="whitespace-nowrap px-4 py-3">Número de inventario</th>
              <th class="whitespace-nowrap px-4 py-3">Fecha de alta</th>
              <th class="whitespace-nowrap px-4 py-3">Características</th>
              <th class="whitespace-nowrap px-4 py-3">Meses de garantía</th>
              <th class="whitespace-nowrap px-4 py-3">Valor de adquisición</th>
              <th class="whitespace-nowrap px-4 py-3">Estatus</th>
              <th class="whitespace-nowrap px-4 py-3">Responsable</th>
              <th class="whitespace-nowrap px-4 py-3">Inventariable</th>
              <th class="whitespace-nowrap px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr
              v-for="bien in bienesPagina"
              :key="bien.id"
              class="transition hover:bg-slate-50"
              :class="{ 'bg-blue-50/40': seleccionados.has(bien.id) }"
            >
              <td class="px-4 py-2.5">
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
              <td class="whitespace-nowrap px-4 py-2.5 font-medium text-slate-800">{{ bien.nombre }}</td>
              <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ bien.modelo }}</td>
              <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ bien.marca }}</td>
              <td class="whitespace-nowrap px-4 py-2.5 font-mono text-xs tabular-nums text-slate-600">{{ bien.numeroSerie }}</td>
              <td class="whitespace-nowrap px-4 py-2.5 font-mono text-xs tabular-nums text-slate-600">{{ bien.numeroInventario }}</td>
              <td class="whitespace-nowrap px-4 py-2.5 tabular-nums text-slate-600">{{ formatFecha(bien.fechaAlta) }}</td>
              <td class="min-w-[14rem] px-4 py-2.5 text-slate-600">{{ bien.caracteristicas }}</td>
              <td class="whitespace-nowrap px-4 py-2.5 tabular-nums text-slate-600">{{ bien.mesesGarantia }}</td>
              <td class="whitespace-nowrap px-4 py-2.5 font-mono tabular-nums text-slate-600">{{ formatMoneda(bien.valorAdquisicion, { centavos: true }) }}</td>
              <td class="whitespace-nowrap px-4 py-2.5">
                <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="ESTATUS_ESTILOS[bien.estatus]">
                  {{ bien.estatus }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ bien.responsable ?? '—' }}</td>
              <td class="whitespace-nowrap px-4 py-2.5">
                <span
                  class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium"
                  :class="bien.inventariable ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'"
                >
                  {{ bien.inventariable ? 'Sí' : 'No' }}
                </span>
              </td>
              <td class="whitespace-nowrap px-4 py-2.5">
                <div class="flex items-center gap-1">
                  <IconButton
                    :label="etiquetaEditar(bien)"
                    tone="blue"
                    :disabled="bien.estatus === 'Baja' || !can('bienes:editar')"
                    @click="editarBien(bien)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </IconButton>
                  <IconButton v-if="bien.estatus === 'Por asignar'" :label="etiquetaMover('Asignar')" tone="emerald" :disabled="!can('bienes:mover')" @click="abrirMovimiento('Asignación', [bien])">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                    </svg>
                  </IconButton>
                  <template v-if="bien.estatus === 'Asignado'">
                    <IconButton :label="etiquetaMover('Reasignar')" tone="amber" :disabled="!can('bienes:mover')" @click="abrirMovimiento('Reasignación', [bien])">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                    </IconButton>
                    <IconButton :label="etiquetaMover('Devolver a almacén')" tone="blue" :disabled="!can('bienes:mover')" @click="abrirMovimiento('Devolución', [bien])">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                      </svg>
                    </IconButton>
                  </template>
                  <IconButton label="Ver historial" tone="slate" @click="verHistorial(bien)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </IconButton>
                  <IconButton label="Imprimir ficha" tone="slate" @click="imprimirFicha(bien)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                    </svg>
                  </IconButton>
                </div>
              </td>
            </tr>

            <tr v-if="bienesPagina.length === 0">
              <td colspan="14">
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
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
import IconButton from '@/components/ui/IconButton.vue'
import PageSizeSelect from '@/components/ui/PageSizeSelect.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import TablePagination from '@/components/ui/TablePagination.vue'

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
    filtros.value.estatus !== '' ||
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

const ESTATUS_ESTILOS: Record<EstatusBien, string> = {
  Asignado: 'bg-emerald-50 text-emerald-700',
  'Por asignar': 'bg-amber-50 text-amber-700',
  'En reparación': 'bg-blue-50 text-blue-700',
  Baja: 'bg-slate-100 text-slate-500',
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

// --- Permisos: los controles se deshabilitan explicando el motivo en vez de desaparecer ---
function etiquetaEditar(bien: Bien): string {
  if (bien.estatus === 'Baja') return 'Editar (un bien dado de baja ya no se modifica)'
  return can('bienes:editar') ? 'Editar' : `Editar (${motivoSinPermiso('bienes:editar', rol.value)})`
}

function etiquetaMover(accion: string): string {
  return can('bienes:mover') ? accion : `${accion} (${motivoSinPermiso('bienes:mover', rol.value)})`
}

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
