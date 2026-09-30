<template>
  <div>
    <div class="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <PageSizeSelect v-if="hayVariasPaginas" v-model="pageSize" />
      <SearchInput v-model="busqueda" placeholder="Buscar por nombre o usuario..." class="w-full sm:ml-auto sm:w-72" />
    </div>

    <div class="max-h-[600px] overflow-auto">
      <table class="w-full text-left text-sm">
        <thead class="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
          <tr>
            <th class="whitespace-nowrap px-3 py-3">Nombre</th>
            <th class="whitespace-nowrap px-3 py-3">Usuario</th>
            <th class="whitespace-nowrap px-3 py-3">Rol</th>
            <th class="whitespace-nowrap px-3 py-3">Vinculada a</th>
            <th class="whitespace-nowrap px-3 py-3">Estatus</th>
            <th class="whitespace-nowrap px-3 py-3">Último acceso</th>
            <th class="whitespace-nowrap px-3 py-3">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="cuenta in cuentasPagina" :key="cuenta.id" class="transition hover:bg-slate-50" data-doc="fila-cuenta">
            <td class="px-3 py-2.5 font-medium" :class="cuenta.activo ? 'text-slate-800' : 'text-slate-400'">
              {{ cuenta.nombre }}
              <span v-if="esPropia(cuenta.id)" class="ml-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700" data-doc="etiqueta-tu">Tú</span>
            </td>
            <td class="whitespace-nowrap px-3 py-2.5 text-slate-600">{{ cuenta.username }}</td>
            <td class="whitespace-nowrap px-3 py-2.5">
              <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="ESTILO_ROL[cuenta.rol]">{{ cuenta.rol }}</span>
            </td>
            <td class="whitespace-nowrap px-3 py-2.5 text-slate-600" data-doc="vinculo-cuenta">{{ cuenta.tecnicoId ? 'Técnico' : '—' }}</td>
            <td class="whitespace-nowrap px-3 py-2.5">
              <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="cuenta.activo ? ESTATUS_ACTIVO : ESTATUS_INACTIVO">
                {{ cuenta.activo ? 'Activa' : 'Inactiva' }}
              </span>
            </td>
            <td class="whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-600">{{ cuenta.ultimoAcceso ? formatFechaHora(cuenta.ultimoAcceso) : 'Nunca' }}</td>
            <td class="whitespace-nowrap px-3 py-2.5">
              <div class="flex items-center gap-1">
                <IconButton label="Editar" tone="blue" @click="abrirEdicion(cuenta)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="ICONO_EDITAR" />
                  </svg>
                </IconButton>
                <IconButton label="Restablecer contraseña" tone="blue" @click="abrirRestablecer(cuenta)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="ICONO_LLAVE" />
                  </svg>
                </IconButton>
                <IconButton
                  :label="etiquetaEstatus(cuenta)"
                  :tone="cuenta.activo ? 'amber' : 'emerald'"
                  :disabled="cuenta.activo && esPropia(cuenta.id)"
                  @click="alternar(cuenta)"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" :d="cuenta.activo ? ICONO_INACTIVAR : ICONO_REACTIVAR" />
                  </svg>
                </IconButton>
              </div>
            </td>
          </tr>

          <tr v-if="cuentasPagina.length === 0">
            <td colspan="7">
              <EmptyState mensaje="No se encontraron cuentas que coincidan con la búsqueda." />
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

    <CuentaModal v-model:open="mostrarModalCuenta" :cuenta="cuentaEditando" @guardar="onGuardarCuenta" />
    <RestablecerPasswordModal v-model:open="mostrarModalPassword" :cuenta="cuentaPassword" @guardar="onRestablecer" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Rol } from '@/config/permisos'
import { useCuentasData, type CuentaPublica } from '@/composables/useCuentasData'
import { usePaginacion } from '@/composables/usePaginacion'
import { useToast } from '@/composables/useToast'
import { formatFechaHora, normalizarTexto } from '@/utils/formato'
import EmptyState from '@/components/ui/EmptyState.vue'
import IconButton from '@/components/ui/IconButton.vue'
import PageSizeSelect from '@/components/ui/PageSizeSelect.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import TablePagination from '@/components/ui/TablePagination.vue'
import CuentaModal, { type DatosCuentaModal } from './CuentaModal.vue'
import RestablecerPasswordModal from './RestablecerPasswordModal.vue'
import { ICONO_EDITAR, ICONO_INACTIVAR, ICONO_LLAVE, ICONO_REACTIVAR } from './iconos'

const { cuentas, esPropia, crear, actualizar, alternarEstatus, restablecerPassword } = useCuentasData()
const toast = useToast()

const ESTATUS_ACTIVO = 'bg-emerald-50 text-emerald-700'
const ESTATUS_INACTIVO = 'bg-slate-100 text-slate-500'
const ESTILO_ROL: Record<Rol, string> = {
  Administrador: 'bg-violet-50 text-violet-700',
  Capturista: 'bg-blue-50 text-blue-700',
  Técnico: 'bg-amber-50 text-amber-700',
  Consulta: 'bg-slate-100 text-slate-600',
}

// «Ver cuenta» desde Técnicos llega con el usuario ya buscado (?buscar=).
const route = useRoute()
const busqueda = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const pageSize = ref(10)

const filtradas = computed(() => {
  const termino = normalizarTexto(busqueda.value.trim())
  return termino ? cuentas.value.filter((cuenta) => [cuenta.nombre, cuenta.username].some((campo) => normalizarTexto(campo).includes(termino))) : cuentas.value
})

const { paginaActual, totalPaginas, pagina: cuentasPagina, rangoInicio, rangoFin, total, irAlInicio } = usePaginacion(filtradas, pageSize)
watch(busqueda, irAlInicio)

// El tamaño de página mínimo es 10: con menos cuentas en total no hay nada que paginar.
const hayVariasPaginas = computed(() => cuentas.value.length > 10)

function etiquetaEstatus(cuenta: CuentaPublica): string {
  if (!cuenta.activo) return 'Reactivar'
  return esPropia(cuenta.id) ? 'Inactivar (no puedes inactivar tu propia cuenta)' : 'Inactivar'
}

// --- Alta / edición ---
const mostrarModalCuenta = ref(false)
const cuentaEditando = ref<CuentaPublica | null>(null)

function abrirAlta() {
  cuentaEditando.value = null
  mostrarModalCuenta.value = true
}

function abrirEdicion(cuenta: CuentaPublica) {
  cuentaEditando.value = cuenta
  mostrarModalCuenta.value = true
}

defineExpose({ abrirAlta })

function onGuardarCuenta(datos: DatosCuentaModal) {
  const editando = cuentaEditando.value
  const resultado = editando
    ? actualizar(editando.id, { nombre: datos.nombre, rol: datos.rol })
    : crear({ username: datos.username, nombre: datos.nombre, rol: datos.rol, password: datos.password })

  if (!resultado.ok) {
    toast.error(resultado.motivo ?? 'No se pudo guardar la cuenta.')
    return
  }
  if (!editando) irAlInicio()
  toast.success(editando ? `Cuenta actualizada: ${editando.username}` : `Cuenta creada: ${datos.username}`)
}

// --- Restablecer contraseña ---
const mostrarModalPassword = ref(false)
const cuentaPassword = ref<CuentaPublica | null>(null)

function abrirRestablecer(cuenta: CuentaPublica) {
  cuentaPassword.value = cuenta
  mostrarModalPassword.value = true
}

function onRestablecer(password: string) {
  const cuenta = cuentaPassword.value
  if (!cuenta) return
  const resultado = restablecerPassword(cuenta.id, password)
  if (!resultado.ok) {
    toast.error(resultado.motivo ?? 'No se pudo restablecer la contraseña.')
    return
  }
  toast.success(`Contraseña restablecida: ${cuenta.username}`)
}

// --- Inactivar / reactivar ---
function alternar(cuenta: CuentaPublica) {
  const estabaActiva = cuenta.activo
  const resultado = alternarEstatus(cuenta.id)
  if (!resultado.ok) {
    toast.error(resultado.motivo ?? 'No se pudo cambiar el estatus.')
    return
  }
  if (!estabaActiva) {
    toast.success(`${cuenta.username}: reactivada`)
    return
  }
  toast.success(`${cuenta.username}: inactivada`, { etiqueta: 'Deshacer', ejecutar: () => alternarEstatus(cuenta.id) })
}
</script>
