<template>
  <div class="min-w-0 space-y-6">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="text-2xl font-bold text-slate-800">Administración</h2>
        <p class="mt-1 text-sm text-slate-500">Catálogos de ubicaciones, direcciones, departamentos, el personal que recibe bienes y los datos de la institución</p>
      </div>

      <AppButton v-if="tabActivo !== 'institucion'" @click="abrirAlta">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        {{ textoAgregar }}
      </AppButton>
    </div>

    <div class="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <!-- Pestañas -->
      <div class="overflow-x-auto border-b border-slate-200 px-4 pt-4">
        <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            v-for="pestana in PESTANAS"
            :key="pestana"
            type="button"
            class="flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 sm:px-4"
            :class="tabActivo === pestana ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            :aria-pressed="tabActivo === pestana"
            @click="tabActivo = pestana"
          >
            {{ ETIQUETAS[pestana].plural }}
            <span
              v-if="pestana !== 'institucion'"
              class="rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums"
              :class="tabActivo === pestana ? 'bg-blue-50 text-blue-700' : 'bg-slate-200/70 text-slate-500'"
            >
              {{ conteos[pestana] }}
            </span>
          </button>
        </div>
        <div class="h-4"></div>
      </div>

      <InstitucionForm v-if="tabActivo === 'institucion'" />

      <template v-else>
      <!-- Controles: tamaño de página + buscador -->
      <div class="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <PageSizeSelect v-model="pageSize" />
        <SearchInput
          v-model="busqueda"
          :placeholder="catalogo === 'usuario' ? 'Buscar por nombre, puesto, dirección...' : 'Buscar por nombre...'"
          class="w-full sm:w-72"
        />
      </div>

      <!-- Tabla: Ubicaciones / Direcciones / Departamentos -->
      <template v-if="catalogo !== 'usuario'">
        <div class="max-h-[600px] overflow-auto">
          <table class="w-full text-left text-sm">
            <thead class="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
              <tr>
                <th class="whitespace-nowrap px-4 py-3">Nombre</th>
                <th class="whitespace-nowrap px-4 py-3">Estatus</th>
                <th class="whitespace-nowrap px-4 py-3">Bienes que lo usan</th>
                <th class="whitespace-nowrap px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="elemento in elementosPagina" :key="elemento.id" class="transition hover:bg-slate-50">
                <td class="whitespace-nowrap px-4 py-2.5 font-medium" :class="elemento.activo ? 'text-slate-800' : 'text-slate-400'">{{ elemento.nombre }}</td>
                <td class="whitespace-nowrap px-4 py-2.5">
                  <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="elemento.activo ? ESTATUS_ACTIVO : ESTATUS_INACTIVO">
                    {{ elemento.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-2.5 tabular-nums text-slate-600">{{ bienesEn(catalogo, elemento.nombre) }}</td>
                <td class="whitespace-nowrap px-4 py-2.5">
                  <div class="flex items-center gap-1">
                    <IconButton label="Editar" tone="blue" @click="abrirEdicionElemento(elemento)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" :d="ICONO_EDITAR" />
                      </svg>
                    </IconButton>
                    <IconButton :label="elemento.activo ? 'Inactivar' : 'Reactivar'" :tone="elemento.activo ? 'amber' : 'emerald'" @click="alternar(catalogo, elemento.id, elemento.nombre)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" :d="elemento.activo ? ICONO_INACTIVAR : ICONO_REACTIVAR" />
                      </svg>
                    </IconButton>
                    <IconButton
                      :label="etiquetaEliminar(catalogo, elemento.nombre)"
                      tone="amber"
                      :disabled="referencias(catalogo, elemento.nombre) > 0"
                      @click="pedirEliminar(catalogo, elemento.id, elemento.nombre)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" :d="ICONO_ELIMINAR" />
                      </svg>
                    </IconButton>
                  </div>
                </td>
              </tr>

              <tr v-if="elementosPagina.length === 0">
                <td colspan="4">
                  <EmptyState mensaje="No se encontraron elementos que coincidan con la búsqueda." />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <TablePagination
          v-model:pagina-actual="paginaActualElementos"
          :total-paginas="totalPaginasElementos"
          :rango-inicio="rangoInicioElementos"
          :rango-fin="rangoFinElementos"
          :total="totalElementos"
        />
      </template>

      <!-- Tabla: Usuarios -->
      <template v-else>
        <div class="max-h-[600px] overflow-auto">
          <table class="w-full text-left text-sm">
            <thead class="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
              <tr>
                <th class="whitespace-nowrap px-4 py-3">Nombre</th>
                <th class="whitespace-nowrap px-4 py-3">Puesto</th>
                <th class="whitespace-nowrap px-4 py-3">Dirección</th>
                <th class="whitespace-nowrap px-4 py-3">Departamento</th>
                <th class="whitespace-nowrap px-4 py-3">Bienes a su resguardo</th>
                <th class="whitespace-nowrap px-4 py-3">Estatus</th>
                <th class="whitespace-nowrap px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="usuario in usuariosPagina" :key="usuario.id" class="transition hover:bg-slate-50">
                <td class="whitespace-nowrap px-4 py-2.5 font-medium" :class="usuario.activo ? 'text-slate-800' : 'text-slate-400'">{{ usuario.nombre }}</td>
                <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ usuario.puesto }}</td>
                <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ usuario.direccion }}</td>
                <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ usuario.departamento }}</td>
                <td class="whitespace-nowrap px-4 py-2.5 tabular-nums text-slate-600">{{ bienesEn('usuario', usuario.nombre) }}</td>
                <td class="whitespace-nowrap px-4 py-2.5">
                  <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="usuario.activo ? ESTATUS_ACTIVO : ESTATUS_INACTIVO">
                    {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-4 py-2.5">
                  <div class="flex items-center gap-1">
                    <IconButton label="Editar" tone="blue" @click="abrirEdicionUsuario(usuario)">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" :d="ICONO_EDITAR" />
                      </svg>
                    </IconButton>
                    <IconButton
                      :label="etiquetaInactivarUsuario(usuario)"
                      :tone="usuario.activo ? 'amber' : 'emerald'"
                      :disabled="usuario.activo && bienesEn('usuario', usuario.nombre) > 0"
                      @click="alternar('usuario', usuario.id, usuario.nombre)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" :d="usuario.activo ? ICONO_INACTIVAR : ICONO_REACTIVAR" />
                      </svg>
                    </IconButton>
                    <IconButton
                      :label="etiquetaEliminar('usuario', usuario.nombre)"
                      tone="amber"
                      :disabled="referencias('usuario', usuario.nombre) > 0"
                      @click="pedirEliminar('usuario', usuario.id, usuario.nombre)"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" :d="ICONO_ELIMINAR" />
                      </svg>
                    </IconButton>
                  </div>
                </td>
              </tr>

              <tr v-if="usuariosPagina.length === 0">
                <td colspan="7">
                  <EmptyState mensaje="No se encontraron usuarios que coincidan con la búsqueda." />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <TablePagination
          v-model:pagina-actual="paginaActualUsuarios"
          :total-paginas="totalPaginasUsuarios"
          :rango-inicio="rangoInicioUsuarios"
          :rango-fin="rangoFinUsuarios"
          :total="totalUsuarios"
        />
      </template>
      </template>
    </div>

    <CatalogoModal v-if="catalogo !== 'usuario'" v-model:open="mostrarModalCatalogo" :catalogo="catalogo" :elemento="elementoEditando" @guardar="onGuardarElemento" />
    <UsuarioModal v-model:open="mostrarModalUsuario" :usuario="usuarioEditando" @guardar="onGuardarUsuario" />
    <ConfirmModal
      v-model:open="mostrarConfirmacion"
      title="Eliminar del catálogo"
      :message="`¿Eliminar «${porEliminar?.nombre ?? ''}»? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar"
      @confirmar="confirmarEliminar"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  useCatalogosData,
  type Catalogo,
  type CatalogoSimple,
  type DatosUsuario,
  type ElementoCatalogo,
  type Usuario,
} from '@/composables/useCatalogosData'
import { usePaginacion } from '@/composables/usePaginacion'
import { useToast } from '@/composables/useToast'
import CatalogoModal from '@/components/administracion/CatalogoModal.vue'
import InstitucionForm from '@/components/administracion/InstitucionForm.vue'
import UsuarioModal from '@/components/administracion/UsuarioModal.vue'
import AppButton from '@/components/ui/AppButton.vue'
import ConfirmModal from '@/components/ui/ConfirmModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import IconButton from '@/components/ui/IconButton.vue'
import PageSizeSelect from '@/components/ui/PageSizeSelect.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import TablePagination from '@/components/ui/TablePagination.vue'

const {
  ubicaciones,
  direcciones,
  departamentos,
  usuarios,
  agregarElemento,
  actualizarElemento,
  agregarUsuario,
  actualizarUsuario,
  alternarActivo,
  eliminar,
  bienesEn,
  referencias,
} = useCatalogosData()
const toast = useToast()

type Pestana = Catalogo | 'institucion'

const PESTANAS: Pestana[] = ['ubicacion', 'direccion', 'departamento', 'usuario', 'institucion']

const ETIQUETAS: Record<Pestana, { plural: string; singular: string; femenino: boolean }> = {
  ubicacion: { plural: 'Ubicaciones', singular: 'Ubicación', femenino: true },
  direccion: { plural: 'Direcciones', singular: 'Dirección', femenino: true },
  departamento: { plural: 'Departamentos', singular: 'Departamento', femenino: false },
  usuario: { plural: 'Usuarios', singular: 'Usuario', femenino: false },
  institucion: { plural: 'Institución', singular: 'Institución', femenino: true },
}

const ESTATUS_ACTIVO = 'bg-emerald-50 text-emerald-700'
const ESTATUS_INACTIVO = 'bg-slate-100 text-slate-500'

const ICONO_EDITAR =
  'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
const ICONO_INACTIVAR = 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
const ICONO_REACTIVAR = 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
const ICONO_ELIMINAR =
  'M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'

const tabActivo = ref<Pestana>('ubicacion')
// Pestaña de catálogo vigente; en "Institución" (que no es un catálogo) no se usa.
const catalogo = computed<Catalogo>(() => (tabActivo.value === 'institucion' ? 'ubicacion' : tabActivo.value))
const busqueda = ref('')
const pageSize = ref(10)

const conteos = computed<Record<Catalogo, number>>(() => ({
  ubicacion: ubicaciones.length,
  direccion: direcciones.length,
  departamento: departamentos.length,
  usuario: usuarios.length,
}))

const textoAgregar = computed(() => `Agregar ${ETIQUETAS[catalogo.value].singular.toLowerCase()}`)

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

const elementosFiltrados = computed<ElementoCatalogo[]>(() => {
  const lista = catalogo.value === 'ubicacion' ? ubicaciones : catalogo.value === 'direccion' ? direcciones : departamentos
  const termino = normalizar(busqueda.value.trim())
  return termino ? lista.filter((elemento) => normalizar(elemento.nombre).includes(termino)) : lista
})

const usuariosFiltrados = computed<Usuario[]>(() => {
  const termino = normalizar(busqueda.value.trim())
  if (!termino) return usuarios
  return usuarios.filter((usuario) =>
    [usuario.nombre, usuario.puesto, usuario.direccion, usuario.departamento].some((campo) => normalizar(campo).includes(termino)),
  )
})

const {
  paginaActual: paginaActualElementos,
  totalPaginas: totalPaginasElementos,
  pagina: elementosPagina,
  rangoInicio: rangoInicioElementos,
  rangoFin: rangoFinElementos,
  total: totalElementos,
  irAlInicio: irAlInicioElementos,
} = usePaginacion(elementosFiltrados, pageSize)

const {
  paginaActual: paginaActualUsuarios,
  totalPaginas: totalPaginasUsuarios,
  pagina: usuariosPagina,
  rangoInicio: rangoInicioUsuarios,
  rangoFin: rangoFinUsuarios,
  total: totalUsuarios,
  irAlInicio: irAlInicioUsuarios,
} = usePaginacion(usuariosFiltrados, pageSize)

// Vuelve a la primera página cuando cambia la pestaña o la búsqueda.
watch([tabActivo, busqueda], () => {
  irAlInicioElementos()
  irAlInicioUsuarios()
})

function accion(catalogo: Catalogo, femeninoMasculino: [string, string]): string {
  const { singular, femenino } = ETIQUETAS[catalogo]
  return `${singular} ${femenino ? femeninoMasculino[0] : femeninoMasculino[1]}`
}

// --- Alta / edición ---
const mostrarModalCatalogo = ref(false)
const elementoEditando = ref<ElementoCatalogo | null>(null)
const mostrarModalUsuario = ref(false)
const usuarioEditando = ref<Usuario | null>(null)

function abrirAlta() {
  if (catalogo.value === 'usuario') {
    usuarioEditando.value = null
    mostrarModalUsuario.value = true
  } else {
    elementoEditando.value = null
    mostrarModalCatalogo.value = true
  }
}

function abrirEdicionElemento(elemento: ElementoCatalogo) {
  elementoEditando.value = elemento
  mostrarModalCatalogo.value = true
}

function abrirEdicionUsuario(usuario: Usuario) {
  usuarioEditando.value = usuario
  mostrarModalUsuario.value = true
}

function onGuardarElemento(nombre: string) {
  const elegido = catalogo.value as CatalogoSimple
  if (elementoEditando.value) {
    actualizarElemento(elegido, elementoEditando.value.id, nombre)
    toast.success(`${accion(elegido, ['actualizada', 'actualizado'])}: ${nombre}`)
    return
  }

  agregarElemento(elegido, nombre)
  irAlInicioElementos()
  toast.success(`${accion(elegido, ['agregada', 'agregado'])}: ${nombre}`)
}

function onGuardarUsuario(datos: DatosUsuario) {
  if (usuarioEditando.value) {
    actualizarUsuario(usuarioEditando.value.id, datos)
    toast.success(`Usuario actualizado: ${datos.nombre}`)
    return
  }

  agregarUsuario(datos)
  irAlInicioUsuarios()
  toast.success(`Usuario agregado: ${datos.nombre}`)
}

// --- Inactivar / reactivar ---
function alternar(catalogo: Catalogo, id: string, nombre: string) {
  const resultado = alternarActivo(catalogo, id)
  if (!resultado.ok) {
    toast.error(resultado.motivo ?? 'No se pudo cambiar el estatus.')
    return
  }
  toast.success(`${nombre}: ${estaActivo(catalogo, id) ? 'reactivado' : 'inactivado'}`)
}

function estaActivo(catalogo: Catalogo, id: string): boolean {
  const lista = catalogo === 'ubicacion' ? ubicaciones : catalogo === 'direccion' ? direcciones : catalogo === 'departamento' ? departamentos : usuarios
  return lista.find((item) => item.id === id)?.activo ?? false
}

function etiquetaInactivarUsuario(usuario: Usuario): string {
  if (!usuario.activo) return 'Reactivar'
  const bienesACargo = bienesEn('usuario', usuario.nombre)
  return bienesACargo > 0
    ? `Inactivar (tiene ${bienesACargo} ${bienesACargo === 1 ? 'bien' : 'bienes'} a su resguardo; devuélvelos o reasígnalos antes)`
    : 'Inactivar'
}

// --- Eliminar ---
function etiquetaEliminar(catalogo: Catalogo, nombre: string): string {
  return referencias(catalogo, nombre) > 0 ? 'Eliminar (tiene bienes, usuarios o documentos que lo mencionan; inactívalo en su lugar)' : 'Eliminar'
}

const mostrarConfirmacion = ref(false)
const porEliminar = ref<{ catalogo: Catalogo; id: string; nombre: string } | null>(null)

function pedirEliminar(catalogo: Catalogo, id: string, nombre: string) {
  porEliminar.value = { catalogo, id, nombre }
  mostrarConfirmacion.value = true
}

function confirmarEliminar() {
  const pendiente = porEliminar.value
  if (!pendiente) return

  const resultado = eliminar(pendiente.catalogo, pendiente.id)
  if (!resultado.ok) {
    toast.error(resultado.motivo ?? 'No se pudo eliminar.')
    return
  }
  toast.success(`${accion(pendiente.catalogo, ['eliminada', 'eliminado'])}: ${pendiente.nombre}`)
}
</script>
