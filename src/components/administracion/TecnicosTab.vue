<template>
  <div>
    <div class="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <PageSizeSelect v-if="hayVariasPaginas" v-model="pageSize" />
      <SearchInput v-model="busqueda" placeholder="Buscar por nombre, especialidad o usuario..." class="w-full sm:ml-auto sm:w-80" />
    </div>

    <div class="max-h-[600px] overflow-auto">
      <table class="w-full text-left text-sm">
        <thead class="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
          <tr>
            <th class="whitespace-nowrap px-3 py-3">Nombre</th>
            <th class="whitespace-nowrap px-3 py-3">Especialidad</th>
            <th class="whitespace-nowrap px-3 py-3">Contacto</th>
            <th class="whitespace-nowrap px-3 py-3">Acceso</th>
            <th class="min-w-[4.5rem] px-3 py-3">Mant. abiertos</th>
            <th class="whitespace-nowrap px-3 py-3">Estatus</th>
            <th class="whitespace-nowrap px-3 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="tecnico in tecnicosPagina" :key="tecnico.id" class="transition hover:bg-slate-50" data-doc="fila-tecnico">
            <td class="min-w-[8.5rem] px-3 py-2.5 font-medium" :class="tecnico.activo ? 'text-slate-800' : 'text-slate-400'">{{ tecnico.nombre }}</td>
            <td class="px-3 py-2.5 text-slate-600">{{ tecnico.especialidad || '—' }}</td>
            <td class="px-3 py-2.5 text-slate-600">{{ tecnico.contacto || '—' }}</td>
            <td class="whitespace-nowrap px-3 py-2.5" data-doc="acceso-tecnico">
              <template v-if="cuentaDe(tecnico.id)">
                <span class="text-slate-700">{{ cuentaDe(tecnico.id)?.username }}</span>
                <span
                  class="ml-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
                  :class="cuentaDe(tecnico.id)?.activo ? ESTATUS_ACTIVO : ESTATUS_INACTIVO"
                >
                  {{ cuentaDe(tecnico.id)?.activo ? 'Activa' : 'Inactiva' }}
                </span>
              </template>
              <span v-else class="text-slate-400">Sin acceso</span>
            </td>
            <td class="whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-600" data-doc="abiertos-tecnico">{{ abiertosDe(tecnico.id) }}</td>
            <td class="whitespace-nowrap px-3 py-2.5">
              <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="tecnico.activo ? ESTATUS_ACTIVO : ESTATUS_INACTIVO">
                {{ tecnico.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="whitespace-nowrap px-3 py-2.5">
              <div class="flex items-center gap-1">
                <IconButton label="Editar" tone="blue" @click="abrirEdicion(tecnico)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="ICONO_EDITAR" />
                  </svg>
                </IconButton>
                <IconButton v-if="cuentaDe(tecnico.id)" label="Ver cuenta" tone="blue" @click="verCuenta(cuentaDe(tecnico.id)?.username ?? '')">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="ICONO_PERSONA" />
                  </svg>
                </IconButton>
                <IconButton
                  v-else
                  :label="tecnico.activo ? 'Crear acceso' : 'Crear acceso (reactiva al técnico antes)'"
                  tone="blue"
                  :disabled="!tecnico.activo"
                  @click="abrirAcceso(tecnico)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="ICONO_LLAVE" />
                  </svg>
                </IconButton>
                <IconButton
                  :label="etiquetaEstatus(tecnico)"
                  :tone="tecnico.activo ? 'amber' : 'emerald'"
                  :disabled="tecnico.activo && abiertosDe(tecnico.id) > 0"
                  @click="alternar(tecnico)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="tecnico.activo ? ICONO_INACTIVAR : ICONO_REACTIVAR" />
                  </svg>
                </IconButton>
                <IconButton :label="etiquetaEliminar(tecnico)" tone="amber" :disabled="referencias(tecnico.id) > 0" @click="pedirEliminar(tecnico)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="ICONO_ELIMINAR" />
                  </svg>
                </IconButton>
              </div>
            </td>
          </tr>

          <tr v-if="tecnicosPagina.length === 0">
            <td colspan="7">
              <EmptyState mensaje="No se encontraron técnicos que coincidan con la búsqueda." />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <TablePagination
      v-if="hayVariasPaginas"
      v-model:pagina-actual="paginaActual"
      :total-paginas="totalPaginas"
      :rango-inicio="rangoInicio"
      :rango-fin="rangoFin"
      :total="total"
    />

    <TecnicoModal v-model:open="mostrarModalTecnico" :tecnico="tecnicoEditando" @guardar="onGuardarTecnico" />
    <AccesoTecnicoModal v-model:open="mostrarModalAcceso" :tecnico="tecnicoAcceso" @guardar="onCrearAcceso" />
    <ConfirmModal
      v-model:open="mostrarConfirmacion"
      title="Eliminar técnico"
      :message="`¿Eliminar a «${porEliminar?.nombre ?? ''}»? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar"
      @confirmar="confirmarEliminar"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useTecnicosData, type AccesoNuevo, type Tecnico } from '@/composables/useTecnicosData'
import { usePaginacion } from '@/composables/usePaginacion'
import { useToast } from '@/composables/useToast'
import { normalizarTexto } from '@/utils/formato'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import IconButton from '@/components/ui/IconButton.vue'
import PageSizeSelect from '@/components/ui/PageSizeSelect.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import TablePagination from '@/components/ui/TablePagination.vue'
import AccesoTecnicoModal from './AccesoTecnicoModal.vue'
import TecnicoModal, { type GuardarTecnico } from './TecnicoModal.vue'
import { ICONO_EDITAR, ICONO_ELIMINAR, ICONO_INACTIVAR, ICONO_LLAVE, ICONO_PERSONA, ICONO_REACTIVAR } from './iconos'

const { tecnicos, cuentaDe, abiertosDe, referencias, crear, crearAcceso, actualizar, alternarActivo, eliminar } = useTecnicosData()
const toast = useToast()
const router = useRouter()

const ESTATUS_ACTIVO = 'bg-emerald-50 text-emerald-700'
const ESTATUS_INACTIVO = 'bg-slate-100 text-slate-500'

const busqueda = ref('')
const pageSize = ref(10)

const filtrados = computed<Tecnico[]>(() => {
  const termino = normalizarTexto(busqueda.value.trim())
  if (!termino) return tecnicos
  return tecnicos.filter((tecnico) =>
    [tecnico.nombre, tecnico.especialidad, tecnico.contacto, cuentaDe(tecnico.id)?.username ?? ''].some((campo) => normalizarTexto(campo).includes(termino)),
  )
})

const { paginaActual, totalPaginas, pagina: tecnicosPagina, rangoInicio, rangoFin, total, irAlInicio } = usePaginacion(filtrados, pageSize)
watch(busqueda, irAlInicio)

// El tamaño de página mínimo es 10: con menos técnicos en total no hay nada que paginar.
const hayVariasPaginas = computed(() => tecnicos.length > 10)

function etiquetaEstatus(tecnico: Tecnico): string {
  if (!tecnico.activo) return 'Reactivar'
  const abiertos = abiertosDe(tecnico.id)
  return abiertos > 0
    ? `Inactivar (tiene ${abiertos} ${abiertos === 1 ? 'mantenimiento abierto' : 'mantenimientos abiertos'}; concluye o reasígnalos antes)`
    : 'Inactivar'
}

function etiquetaEliminar(tecnico: Tecnico): string {
  return referencias(tecnico.id) > 0 ? 'Eliminar (tiene mantenimientos o una cuenta de acceso; inactívalo en su lugar)' : 'Eliminar'
}

// --- Alta / edición ---
const mostrarModalTecnico = ref(false)
const tecnicoEditando = ref<Tecnico | null>(null)

function abrirAlta() {
  tecnicoEditando.value = null
  mostrarModalTecnico.value = true
}

function abrirEdicion(tecnico: Tecnico) {
  tecnicoEditando.value = tecnico
  mostrarModalTecnico.value = true
}

defineExpose({ abrirAlta })

function onGuardarTecnico({ datos, acceso }: GuardarTecnico) {
  const editando = tecnicoEditando.value
  const resultado = editando ? actualizar(editando.id, datos) : crear(datos, acceso)

  if (!resultado.ok) {
    toast.error(resultado.motivo ?? 'No se pudo guardar al técnico.')
    return
  }
  if (!editando) irAlInicio()
  toast.success(
    editando ? `Técnico actualizado: ${datos.nombre}` : acceso ? `Técnico creado con acceso: ${datos.nombre} (${acceso.username})` : `Técnico creado: ${datos.nombre}`,
  )
}

// --- Crear acceso desde la fila ---
const mostrarModalAcceso = ref(false)
const tecnicoAcceso = ref<Tecnico | null>(null)

function abrirAcceso(tecnico: Tecnico) {
  tecnicoAcceso.value = tecnico
  mostrarModalAcceso.value = true
}

function onCrearAcceso(acceso: AccesoNuevo) {
  const tecnico = tecnicoAcceso.value
  if (!tecnico) return
  const resultado = crearAcceso(tecnico.id, acceso)
  if (!resultado.ok) {
    toast.error(resultado.motivo ?? 'No se pudo crear el acceso.')
    return
  }
  toast.success(`Acceso creado: ${tecnico.nombre} (${acceso.username})`)
}

function verCuenta(username: string) {
  router.push({ query: { seccion: 'cuentas', buscar: username } })
}

// --- Inactivar / reactivar ---
function alternar(tecnico: Tecnico) {
  // Es el objeto vivo del catálogo: se lee antes de cambiarlo.
  const estabaActivo = tecnico.activo
  const resultado = alternarActivo(tecnico.id)
  if (!resultado.ok) {
    toast.error(resultado.motivo ?? 'No se pudo cambiar el estatus.')
    return
  }
  const accion = estabaActivo ? 'inactivado' : 'reactivado'
  toast.success(`${tecnico.nombre}: ${accion}${resultado.cuentaInactivada ? '. También se inactivó su cuenta de acceso.' : ''}`)
}

// --- Eliminar ---
const mostrarConfirmacion = ref(false)
const porEliminar = ref<Tecnico | null>(null)

function pedirEliminar(tecnico: Tecnico) {
  porEliminar.value = tecnico
  mostrarConfirmacion.value = true
}

function confirmarEliminar() {
  const pendiente = porEliminar.value
  if (!pendiente) return
  const resultado = eliminar(pendiente.id)
  if (!resultado.ok) {
    toast.error(resultado.motivo ?? 'No se pudo eliminar.')
    return
  }
  toast.success(`Técnico eliminado: ${pendiente.nombre}`)
}
</script>
