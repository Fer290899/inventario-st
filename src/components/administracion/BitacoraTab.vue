<template>
  <div>
    <div class="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
      <PageSizeSelect v-model="pageSize" />

      <div class="flex flex-wrap items-center gap-2">
        <BaseSelect v-model="modulo" class="min-w-[10rem]" aria-label="Filtrar por módulo">
          <option value="">Todos los módulos</option>
          <option v-for="opcion in MODULOS" :key="opcion" :value="opcion">{{ opcion }}</option>
        </BaseSelect>
        <SearchInput v-model="busqueda" placeholder="Buscar por usuario, acción, detalle..." class="w-full sm:w-72" />
        <AppButton variant="secondary" :disabled="filtrados.length === 0" data-doc="exportar-bitacora" @click="exportar">Exportar CSV</AppButton>
      </div>
    </div>

    <div class="max-h-[600px] overflow-auto">
      <table class="w-full text-left text-sm">
        <thead class="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
          <tr>
            <th class="whitespace-nowrap px-4 py-3">Fecha y hora</th>
            <th class="whitespace-nowrap px-4 py-3">Usuario</th>
            <th class="whitespace-nowrap px-4 py-3">Rol</th>
            <th class="whitespace-nowrap px-4 py-3">Módulo</th>
            <th class="whitespace-nowrap px-4 py-3">Acción</th>
            <th class="whitespace-nowrap px-4 py-3">Elemento</th>
            <th class="min-w-[18rem] px-4 py-3">Detalle</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="evento in eventosPagina" :key="evento.id" class="transition hover:bg-slate-50" data-doc="fila-bitacora">
            <td class="whitespace-nowrap px-4 py-2.5 tabular-nums text-slate-600">{{ formatearFechaHora(evento.fechaHora) }}</td>
            <td class="whitespace-nowrap px-4 py-2.5 font-medium text-slate-800">{{ evento.usuario }}</td>
            <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ evento.rol }}</td>
            <td class="whitespace-nowrap px-4 py-2.5">
              <span class="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{{ evento.modulo }}</span>
            </td>
            <td class="whitespace-nowrap px-4 py-2.5 text-slate-700">{{ evento.accion }}</td>
            <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ evento.entidad }}</td>
            <td class="px-4 py-2.5 text-slate-600">{{ evento.detalle || '—' }}</td>
          </tr>

          <tr v-if="eventosPagina.length === 0">
            <td colspan="7">
              <EmptyState mensaje="Todavía no hay acciones registradas en esta sesión de trabajo, o ninguna coincide con la búsqueda." />
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
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useAuditoria, type ModuloAuditoria } from '@/composables/useAuditoria'
import { usePaginacion } from '@/composables/usePaginacion'
import { descargarCsv } from '@/utils/csv'
import AppButton from '@/components/ui/AppButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import PageSizeSelect from '@/components/ui/PageSizeSelect.vue'
import SearchInput from '@/components/ui/SearchInput.vue'
import TablePagination from '@/components/ui/TablePagination.vue'

const { eventos } = useAuditoria()

const MODULOS: ModuloAuditoria[] = ['Sesión', 'Bienes', 'Movimientos', 'Mantenimiento', 'Catálogos', 'Cuentas', 'Tipos de bien', 'Configuración']

const busqueda = ref('')
const modulo = ref<ModuloAuditoria | ''>('')
const pageSize = ref(10)

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

const filtrados = computed(() => {
  const termino = normalizar(busqueda.value.trim())
  return eventos.filter(
    (evento) =>
      (modulo.value === '' || evento.modulo === modulo.value) &&
      (!termino || [evento.usuario, evento.rol, evento.modulo, evento.accion, evento.entidad, evento.detalle].some((campo) => normalizar(campo).includes(termino))),
  )
})

const { paginaActual, totalPaginas, pagina: eventosPagina, rangoInicio, rangoFin, total, irAlInicio } = usePaginacion(filtrados, pageSize)
watch([busqueda, modulo], irAlInicio)

const formateador = new Intl.DateTimeFormat('es', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
function formatearFechaHora(iso: string): string {
  return formateador.format(new Date(iso))
}

function exportar() {
  descargarCsv(
    ['Fecha y hora', 'Usuario', 'Rol', 'Módulo', 'Acción', 'Elemento', 'Detalle'],
    filtrados.value.map((evento) => [formatearFechaHora(evento.fechaHora), evento.usuario, evento.rol, evento.modulo, evento.accion, evento.entidad, evento.detalle]),
    'bitacora',
  )
}
</script>
