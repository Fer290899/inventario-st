<template>
  <div class="min-w-0 space-y-6">
    <div>
      <h2 class="text-2xl font-bold text-slate-800">Administración</h2>
      <p class="mt-1 text-sm text-slate-500">Catálogos, configuración y seguridad del sistema</p>
    </div>

    <div class="grid grid-cols-1 gap-6 min-[1366px]:grid-cols-[13rem_minmax(0,1fr)] min-[1366px]:items-start">
      <AdministracionNav :seccion="tabActivo" :conteos="conteos" />

    <div class="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <!-- Encabezado de la sección -->
      <div class="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div class="min-w-0">
          <h3 class="text-lg font-semibold text-slate-800" data-doc="titulo-seccion">{{ SECCIONES[tabActivo].titulo }}</h3>
          <p class="mt-0.5 text-sm text-slate-500">{{ SECCIONES[tabActivo].descripcion }}</p>
        </div>

        <AppButton v-if="SECCIONES_CON_ALTA.includes(tabActivo)" class="shrink-0" data-doc="agregar-elemento" @click="abrirAlta">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          {{ textoAgregar }}
        </AppButton>
      </div>

      <InstitucionForm v-if="tabActivo === 'institucion'" />
      <AlertasForm v-else-if="tabActivo === 'alertas'" />
      <TecnicosTab v-else-if="tabActivo === 'tecnico'" ref="tecnicosTab" />
      <CuentasTab v-else-if="tabActivo === 'cuentas'" ref="cuentasTab" />
      <RolesPermisos v-else-if="tabActivo === 'roles'" />
      <BitacoraTab v-else-if="tabActivo === 'bitacora'" />

      <template v-else>
      <!-- Controles: tamaño de página (solo si hay más de una página) + buscador -->
      <div class="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
        <PageSizeSelect v-if="hayVariasPaginas" v-model="pageSize" />
        <SearchInput
          v-model="busqueda"
          :placeholder="catalogo === 'usuario' ? 'Buscar por nombre, puesto, dirección...' : 'Buscar por nombre...'"
          class="w-full sm:ml-auto sm:w-72"
        />
      </div>

      <!-- Tabla: Ubicaciones / Direcciones / Departamentos -->
      <template v-if="catalogo !== 'usuario'">
        <div class="max-h-[600px] overflow-auto">
          <table class="w-full text-left text-sm">
            <thead class="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
              <tr>
                <th class="whitespace-nowrap px-4 py-3">Nombre</th>
                <th v-if="etiquetaRelacionColumna" class="whitespace-nowrap px-4 py-3">{{ etiquetaRelacionColumna }}</th>
                <th class="whitespace-nowrap px-4 py-3">Estatus</th>
                <th class="whitespace-nowrap px-4 py-3">Bienes que lo usan</th>
                <th class="whitespace-nowrap px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="elemento in elementosPagina" :key="elemento.id" class="transition hover:bg-slate-50">
                <td class="whitespace-nowrap px-4 py-2.5 font-medium" :class="elemento.activo ? 'text-slate-800' : 'text-slate-400'">{{ elemento.nombre }}</td>
                <td v-if="etiquetaRelacionColumna" class="whitespace-nowrap px-4 py-2.5 text-slate-600">
                  {{ (catalogo === 'direccion' ? elemento.ubicacion : elemento.direccion) ?? '—' }}
                </td>
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
                    <IconButton :label="elemento.activo ? 'Inactivar' : 'Reactivar'" :tone="elemento.activo ? 'amber' : 'emerald'" @click="onAlternarClick(catalogo, elemento.id, elemento.nombre)">
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
                <td :colspan="etiquetaRelacionColumna ? 5 : 4">
                  <EmptyState mensaje="No se encontraron elementos que coincidan con la búsqueda." />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <TablePagination
          v-if="hayVariasPaginas"
          v-model:pagina-actual="paginaActualElementos"
          :total-paginas="totalPaginasElementos"
          :rango-inicio="rangoInicioElementos"
          :rango-fin="rangoFinElementos"
          :total="totalElementos"
        />
      </template>

      <!-- Tabla: Responsables -->
      <template v-else>
        <div class="max-h-[600px] overflow-auto">
          <table class="w-full text-left text-sm">
            <thead class="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
              <tr>
                <th class="whitespace-nowrap px-3 py-3">Nombre</th>
                <th class="whitespace-nowrap px-3 py-3">Puesto</th>
                <th class="whitespace-nowrap px-3 py-3">Dirección</th>
                <th class="whitespace-nowrap px-3 py-3">Departamento</th>
                <th class="min-w-[5.5rem] px-3 py-3">Bienes a su resguardo</th>
                <th class="whitespace-nowrap px-3 py-3">Estatus</th>
                <th class="whitespace-nowrap px-3 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="usuario in usuariosPagina" :key="usuario.id" class="transition hover:bg-slate-50">
                <td class="min-w-[8.5rem] px-3 py-2.5 font-medium" :class="usuario.activo ? 'text-slate-800' : 'text-slate-400'">{{ usuario.nombre }}</td>
                <td class="px-3 py-2.5 text-slate-600">{{ usuario.puesto }}</td>
                <td class="px-3 py-2.5 text-slate-600">{{ usuario.direccion }}</td>
                <td class="px-3 py-2.5 text-slate-600">{{ usuario.departamento }}</td>
                <td class="whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-600">{{ bienesEn('usuario', usuario.nombre) }}</td>
                <td class="whitespace-nowrap px-3 py-2.5">
                  <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="usuario.activo ? ESTATUS_ACTIVO : ESTATUS_INACTIVO">
                    {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td class="whitespace-nowrap px-3 py-2.5">
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
                      @click="onAlternarClick('usuario', usuario.id, usuario.nombre)"
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
                  <EmptyState mensaje="No se encontraron responsables que coincidan con la búsqueda." />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <TablePagination
          v-if="hayVariasPaginas"
          v-model:pagina-actual="paginaActualUsuarios"
          :total-paginas="totalPaginasUsuarios"
          :rango-inicio="rangoInicioUsuarios"
          :rango-fin="rangoFinUsuarios"
          :total="totalUsuarios"
        />
      </template>
      </template>
    </div>
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
    <ConfirmModal
      v-model:open="mostrarReactivar"
      title="Reactivar"
      :message="`¿Reactivar «${porReactivar?.nombre ?? ''}»?`"
      confirm-label="Reactivar"
      confirm-variant="primary"
      pedir-motivo
      motivo-label="Motivo de la reactivación (opcional)"
      @confirmar="confirmarReactivar"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  useCatalogosData,
  type Catalogo,
  type CatalogoSimple,
  type DatosUsuario,
  type ElementoCatalogo,
  type Usuario,
} from '@/composables/useCatalogosData'
import { useCuentasData } from '@/composables/useCuentasData'
import { useTecnicosData } from '@/composables/useTecnicosData'
import { usePaginacion } from '@/composables/usePaginacion'
import { useToast } from '@/composables/useToast'
import CatalogoModal from '@/components/administracion/CatalogoModal.vue'
import AdministracionNav from '@/components/administracion/AdministracionNav.vue'
import AlertasForm from '@/components/administracion/AlertasForm.vue'
import BitacoraTab from '@/components/administracion/BitacoraTab.vue'
import CuentasTab from '@/components/administracion/CuentasTab.vue'
import InstitucionForm from '@/components/administracion/InstitucionForm.vue'
import RolesPermisos from '@/components/administracion/RolesPermisos.vue'
import TecnicosTab from '@/components/administracion/TecnicosTab.vue'
import UsuarioModal from '@/components/administracion/UsuarioModal.vue'
import { ICONO_EDITAR, ICONO_ELIMINAR, ICONO_INACTIVAR, ICONO_REACTIVAR } from '@/components/administracion/iconos'
import { SECCIONES, SECCIONES_CON_ALTA, esCatalogo, seccionDesdeConsulta, type Seccion } from '@/components/administracion/secciones'
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
const { cuentas } = useCuentasData()
const { tecnicos } = useTecnicosData()


const ESTATUS_ACTIVO = 'bg-emerald-50 text-emerald-700'
const ESTATUS_INACTIVO = 'bg-slate-100 text-slate-500'

const route = useRoute()

// La sección activa vive en la URL (?seccion=…): se puede enlazar y sobrevive a recargar.
const tabActivo = computed<Seccion>(() => seccionDesdeConsulta(route.query.seccion))
// Catálogo vigente; en las secciones que no son un catálogo no se usa.
const catalogo = computed<Catalogo>(() => (esCatalogo(tabActivo.value) ? tabActivo.value : 'ubicacion'))
const busqueda = ref(typeof route.query.buscar === 'string' ? route.query.buscar : '')
const pageSize = ref(10)

const conteos = computed<Partial<Record<Seccion, number>>>(() => ({
  ubicacion: ubicaciones.length,
  direccion: direcciones.length,
  departamento: departamentos.length,
  usuario: usuarios.length,
  tecnico: tecnicos.length,
  cuentas: cuentas.value.length,
}))

const textoAgregar = computed(() => `Agregar ${SECCIONES[tabActivo.value].singular.toLowerCase()}`)

// Dirección se relaciona con Ubicación; Departamento, con Dirección. Ubicación no tiene columna de relación.
const etiquetaRelacionColumna = computed(() =>
  catalogo.value === 'direccion' ? 'Ubicación' : catalogo.value === 'departamento' ? 'Dirección' : null,
)

const cuentasTab = ref<InstanceType<typeof CuentasTab> | null>(null)
const tecnicosTab = ref<InstanceType<typeof TecnicosTab> | null>(null)

// El tamaño de página mínimo es 10: con menos elementos en total no hay nada que paginar.
const TAMANO_PAGINA_MINIMO = 10
const hayVariasPaginas = computed(() => (conteos.value[catalogo.value] ?? 0) > TAMANO_PAGINA_MINIMO)

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
  const { singular, femenino } = SECCIONES[catalogo]
  return `${singular} ${femenino ? femeninoMasculino[0] : femeninoMasculino[1]}`
}

// --- Alta / edición ---
const mostrarModalCatalogo = ref(false)
const elementoEditando = ref<ElementoCatalogo | null>(null)
const mostrarModalUsuario = ref(false)
const usuarioEditando = ref<Usuario | null>(null)

function abrirAlta() {
  if (tabActivo.value === 'cuentas') {
    cuentasTab.value?.abrirAlta()
    return
  }
  if (tabActivo.value === 'tecnico') {
    tecnicosTab.value?.abrirAlta()
    return
  }
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

function onGuardarElemento(nombre: string, relacion: string | undefined) {
  const elegido = catalogo.value as CatalogoSimple
  if (elementoEditando.value) {
    actualizarElemento(elegido, elementoEditando.value.id, nombre, relacion)
    toast.success(`${accion(elegido, ['actualizada', 'actualizado'])}: ${nombre}`)
    return
  }

  agregarElemento(elegido, nombre, relacion)
  irAlInicioElementos()
  toast.success(`${accion(elegido, ['agregada', 'agregado'])}: ${nombre}`)
}

function onGuardarUsuario(datos: DatosUsuario) {
  if (usuarioEditando.value) {
    actualizarUsuario(usuarioEditando.value.id, datos)
    toast.success(`Responsable actualizado: ${datos.nombre}`)
    return
  }

  agregarUsuario(datos)
  irAlInicioUsuarios()
  toast.success(`Responsable agregado: ${datos.nombre}`)
}

// --- Inactivar / reactivar ---
function alternar(catalogo: Catalogo, id: string, nombre: string) {
  const resultado = alternarActivo(catalogo, id)
  if (!resultado.ok) {
    toast.error(resultado.motivo ?? 'No se pudo cambiar el estatus.')
    return
  }
  toast.success(`${nombre}: inactivado`, { etiqueta: 'Deshacer', ejecutar: () => alternarActivo(catalogo, id) })
}

function estaActivo(catalogo: Catalogo, id: string): boolean {
  const lista = catalogo === 'ubicacion' ? ubicaciones : catalogo === 'direccion' ? direcciones : catalogo === 'departamento' ? departamentos : usuarios
  return lista.find((item) => item.id === id)?.activo ?? false
}

/** Inactivar sigue siendo instantáneo (con «Deshacer»); reactivar pasa por un modal que permite anotar un motivo. */
function onAlternarClick(catalogo: Catalogo, id: string, nombre: string) {
  if (estaActivo(catalogo, id)) {
    alternar(catalogo, id, nombre)
    return
  }
  porReactivar.value = { catalogo, id, nombre }
  mostrarReactivar.value = true
}

const mostrarReactivar = ref(false)
const porReactivar = ref<{ catalogo: Catalogo; id: string; nombre: string } | null>(null)

function confirmarReactivar(motivo?: string) {
  const pendiente = porReactivar.value
  if (!pendiente) return

  const resultado = alternarActivo(pendiente.catalogo, pendiente.id, motivo)
  if (!resultado.ok) {
    toast.error(resultado.motivo ?? 'No se pudo reactivar.')
    return
  }
  toast.success(`${pendiente.nombre}: reactivado`)
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
  return referencias(catalogo, nombre) > 0 ? 'Eliminar (tiene bienes, responsables o documentos que lo mencionan; inactívalo en su lugar)' : 'Eliminar'
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
