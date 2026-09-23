<template>
  <BaseModal v-model:open="open" title="Filtros" subtitle="Ajusta los criterios y aplica para filtrar el listado" size="lg">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
      </svg>
    </template>

    <div class="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-3">
      <!-- Clasificación -->
      <div class="space-y-4">
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-slate-700">Tipo de bien</label>
          <BaseSelect v-model="draft.tipo">
            <option value="">Todos los tipos</option>
            <option v-for="tipo in nombresTipos" :key="tipo" :value="tipo">{{ tipo }}</option>
          </BaseSelect>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-slate-700">Estatus</label>
          <BaseSelect v-model="draft.estatus">
            <option value="">Todos los estatus</option>
            <option v-for="opcion in ESTATUS_LISTA" :key="opcion" :value="opcion">{{ opcion }}</option>
          </BaseSelect>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-slate-700">Inventariable</label>
          <BaseSelect v-model="draft.inventariable">
            <option v-for="opcion in INVENTARIABLE_OPCIONES" :key="opcion.valor" :value="opcion.valor">{{ opcion.etiqueta }}</option>
          </BaseSelect>
        </div>
      </div>

      <!-- Ubicación administrativa -->
      <div class="space-y-4">
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-slate-700">Ubicación</label>
          <BaseSelect v-model="draft.ubicacion">
            <option value="">Todas las ubicaciones</option>
            <option v-for="opcion in todas.ubicaciones" :key="opcion" :value="opcion">{{ opcion }}</option>
          </BaseSelect>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-slate-700">Dirección</label>
          <BaseSelect v-model="draft.direccion">
            <option value="">Todas las direcciones</option>
            <option v-for="opcion in todas.direcciones" :key="opcion" :value="opcion">{{ opcion }}</option>
          </BaseSelect>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-slate-700">Departamento</label>
          <BaseSelect v-model="draft.departamento">
            <option value="">Todos los departamentos</option>
            <option v-for="opcion in todas.departamentos" :key="opcion" :value="opcion">{{ opcion }}</option>
          </BaseSelect>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-slate-700">Responsable</label>
          <BaseSelect v-model="draft.responsable">
            <option value="">Todos los responsables</option>
            <option v-for="opcion in todas.usuarios" :key="opcion" :value="opcion">{{ opcion }}</option>
          </BaseSelect>
        </div>
      </div>

      <!-- Fecha de alta -->
      <div>
        <h4 class="mb-2 text-sm font-semibold text-slate-700">Fecha de alta</h4>
        <div class="space-y-3">
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500">De</label>
            <input v-model="draft.fechaAltaDesde" type="date" :class="INPUT" />
          </div>
          <div>
            <label class="mb-1 block text-xs font-medium text-slate-500">A</label>
            <input v-model="draft.fechaAltaHasta" type="date" :class="INPUT" />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full items-center justify-between gap-2">
        <AppButton variant="ghost" size="sm" @click="draft = filtrosVacios()">Limpiar filtros</AppButton>
        <div class="flex items-center gap-2">
          <AppButton variant="secondary" @click="cancelar">Cancelar</AppButton>
          <AppButton @click="aplicar">Aplicar filtros</AppButton>
        </div>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { filtrosVacios, type EstatusBien, type FiltrosBienes } from '@/composables/useBienesData'
import { useCatalogosData } from '@/composables/useCatalogosData'
import { useTiposBienData } from '@/composables/useTiposBienData'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const { nombresTipos } = useTiposBienData()
const { todas } = useCatalogosData()

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'

const props = defineProps<{
  filtros: FiltrosBienes
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  aplicar: [filtros: FiltrosBienes]
}>()

const ESTATUS_LISTA: EstatusBien[] = ['Asignado', 'Por asignar', 'En reparación', 'Baja']
const INVENTARIABLE_OPCIONES: Array<{ valor: FiltrosBienes['inventariable']; etiqueta: string }> = [
  { valor: 'todos', etiqueta: 'Ambos' },
  { valor: 'si', etiqueta: 'Sí' },
  { valor: 'no', etiqueta: 'No' },
]

const draft = ref<FiltrosBienes>({ ...props.filtros })

// Cada vez que se abre, arranca desde los filtros ya aplicados.
watch(open, (isOpen) => {
  if (isOpen) draft.value = { ...props.filtros }
})

function cancelar() {
  open.value = false
}

function aplicar() {
  emit('aplicar', draft.value)
  open.value = false
}
</script>
