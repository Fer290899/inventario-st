<template>
  <div class="min-w-0 space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Tipos de bien</h2>
        <p class="mt-1 text-sm text-slate-500">
          Catálogo de tipos y las características que se capturan en cada uno · {{ tipos.length }} {{ tipos.length === 1 ? 'tipo' : 'tipos' }}
        </p>
      </div>

      <AppButton @click="abrirAlta">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Agregar tipo
      </AppButton>
    </div>

    <div class="rounded-lg border border-slate-200 bg-white">
      <!-- Controles: tamaño de página + categoría + buscador -->
      <div class="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <PageSizeSelect v-model="pageSize" />

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <BaseSelect v-model="categoriaFiltro" class="sm:w-56" aria-label="Filtrar por categoría">
            <option value="">Todas las categorías</option>
            <option v-for="categoria in CATEGORIAS" :key="categoria" :value="categoria">{{ categoria }}</option>
          </BaseSelect>
          <SearchInput v-model="busqueda" placeholder="Buscar tipos o características..." class="w-full sm:w-72" />
        </div>
      </div>

      <!-- Tabla -->
      <div class="max-h-[600px] overflow-auto">
        <table class="w-full text-left text-sm">
          <thead class="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
            <tr>
              <th class="whitespace-nowrap px-4 py-3">Descripción</th>
              <th class="whitespace-nowrap px-4 py-3">Categoría</th>
              <th class="whitespace-nowrap px-4 py-3">Características del bien</th>
              <th class="whitespace-nowrap px-4 py-3">Bienes registrados</th>
              <th class="whitespace-nowrap px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="tipo in tiposPagina" :key="tipo.id" class="transition hover:bg-slate-50">
              <td class="whitespace-nowrap px-4 py-2.5 font-medium text-slate-800">{{ tipo.descripcion }}</td>
              <td class="whitespace-nowrap px-4 py-2.5">
                <span class="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{{ tipo.categoria }}</span>
              </td>
              <td class="px-4 py-2.5">
                <button
                  v-if="tipo.caracteristicas.length === 0"
                  type="button"
                  class="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-500 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                  @click="abrirCaracteristicas(tipo)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Definir características
                </button>
                <div v-else class="flex flex-wrap items-center gap-1">
                  <span
                    v-for="caracteristica in tipo.caracteristicas.slice(0, MAX_VISIBLES)"
                    :key="caracteristica.id"
                    class="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                  >
                    {{ caracteristica.nombre }}
                    <span v-if="caracteristica.requerida" class="text-rose-500" title="Obligatoria">*</span>
                  </span>
                  <button
                    v-if="tipo.caracteristicas.length > MAX_VISIBLES"
                    type="button"
                    class="rounded-md px-1.5 py-0.5 text-xs font-medium text-blue-700 transition hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                    :title="tipo.caracteristicas.slice(MAX_VISIBLES).map((caracteristica) => caracteristica.nombre).join(', ')"
                    @click="abrirCaracteristicas(tipo)"
                  >
                    +{{ tipo.caracteristicas.length - MAX_VISIBLES }} más
                  </button>
                </div>
              </td>
              <td class="whitespace-nowrap px-4 py-2.5 tabular-nums text-slate-600">{{ bienesPorTipo.get(tipo.descripcion) ?? 0 }}</td>
              <td class="whitespace-nowrap px-4 py-2.5">
                <div class="flex items-center gap-1">
                  <IconButton label="Editar características" tone="emerald" @click="abrirCaracteristicas(tipo)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                  </IconButton>
                  <IconButton label="Editar tipo" tone="blue" @click="abrirEdicion(tipo)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </IconButton>
                </div>
              </td>
            </tr>

            <tr v-if="tiposPagina.length === 0">
              <td colspan="5">
                <EmptyState mensaje="No se encontraron tipos de bien que coincidan con la búsqueda." />
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

    <TipoBienModal v-model:open="mostrarModalTipo" :tipo="tipoEditando" @guardar="onGuardarTipo" />
    <CaracteristicasTipoModal
      v-model:open="mostrarModalCaracteristicas"
      :tipo="tipoCaracteristicas"
      @guardar="onGuardarCaracteristicas"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  CATEGORIAS,
  useTiposBienData,
  type CaracteristicaDef,
  type CategoriaTipoBien,
  type TipoBien,
} from '@/composables/useTiposBienData'
import { usePaginacion } from '@/composables/usePaginacion'
import { useToast } from '@/composables/useToast'
import CaracteristicasTipoModal from '@/components/tipos/CaracteristicasTipoModal.vue'
import TipoBienModal from '@/components/tipos/TipoBienModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import IconButton from '@/components/ui/IconButton.vue'
import PageSizeSelect from '@/components/ui/PageSizeSelect.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import TablePagination from '@/components/ui/TablePagination.vue'

const { tipos, bienesPorTipo, agregarTipo, actualizarTipo, guardarCaracteristicas } = useTiposBienData()
const toast = useToast()

const MAX_VISIBLES = 4

const busqueda = ref('')
const categoriaFiltro = ref<CategoriaTipoBien | ''>('')
const pageSize = ref(10)

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

const tiposFiltrados = computed(() => {
  const termino = normalizar(busqueda.value.trim())

  return tipos.filter((tipo) => {
    if (categoriaFiltro.value && tipo.categoria !== categoriaFiltro.value) return false
    if (!termino) return true
    return [tipo.descripcion, tipo.categoria, ...tipo.caracteristicas.map((caracteristica) => caracteristica.nombre)].some((campo) =>
      normalizar(campo).includes(termino),
    )
  })
})

const { paginaActual, totalPaginas, pagina: tiposPagina, rangoInicio, rangoFin, total, irAlInicio } = usePaginacion(
  tiposFiltrados,
  pageSize,
)

// Vuelve a la primera página cuando cambia la búsqueda o la categoría.
watch([busqueda, categoriaFiltro], irAlInicio)

// --- Alta / edición del tipo ---
const mostrarModalTipo = ref(false)
const tipoEditando = ref<TipoBien | null>(null)

function abrirAlta() {
  tipoEditando.value = null
  mostrarModalTipo.value = true
}

function abrirEdicion(tipo: TipoBien) {
  tipoEditando.value = tipo
  mostrarModalTipo.value = true
}

function onGuardarTipo(datos: { descripcion: string; categoria: CategoriaTipoBien }) {
  if (tipoEditando.value) {
    actualizarTipo(tipoEditando.value.id, datos)
    toast.success(`Tipo actualizado: ${datos.descripcion}`)
    return
  }

  agregarTipo(datos)
  irAlInicio()
  toast.success(`Tipo agregado: ${datos.descripcion}. Ahora puedes definir sus características.`)
}

// --- Características del tipo ---
const mostrarModalCaracteristicas = ref(false)
const tipoCaracteristicas = ref<TipoBien | null>(null)

function abrirCaracteristicas(tipo: TipoBien) {
  tipoCaracteristicas.value = tipo
  mostrarModalCaracteristicas.value = true
}

function onGuardarCaracteristicas(caracteristicas: CaracteristicaDef[]) {
  const tipo = tipoCaracteristicas.value
  if (!tipo) return

  guardarCaracteristicas(tipo.id, caracteristicas)
  const cantidad = caracteristicas.length
  toast.success(`${tipo.descripcion}: ${cantidad} ${cantidad === 1 ? 'característica guardada' : 'características guardadas'}`)
}
</script>
