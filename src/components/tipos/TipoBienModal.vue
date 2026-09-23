<template>
  <BaseModal
    v-model:open="open"
    :title="tipo ? 'Editar tipo de bien' : 'Agregar tipo de bien'"
    :subtitle="tipo ? 'Cambia la descripción o la categoría del tipo' : 'Da de alta un nuevo tipo en el catálogo'"
    size="md"
  >
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" :d="tipo ? ICONO_EDITAR : ICONO_AGREGAR" />
      </svg>
    </template>

    <form id="form-tipo-bien" class="grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="guardar">
      <div class="sm:col-span-2">
        <label class="mb-1.5 block text-sm font-semibold text-slate-700" for="tipo-descripcion">
          Descripción <span class="text-rose-500">*</span>
        </label>
        <input
          id="tipo-descripcion"
          v-model="descripcion"
          type="text"
          placeholder="Ej. Disco duro"
          autocomplete="off"
          :class="INPUT"
        />
        <p v-if="error" role="alert" class="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{{ error }}</p>
      </div>

      <div class="sm:col-span-2">
        <label class="mb-1.5 block text-sm font-semibold text-slate-700">Categoría <span class="text-rose-500">*</span></label>
        <BaseSelect v-model="categoria">
          <option value="" disabled>Selecciona una categoría</option>
          <option v-for="opcion in CATEGORIAS" :key="opcion" :value="opcion">{{ opcion }}</option>
        </BaseSelect>
        <p class="mt-1.5 text-xs text-slate-400">La categoría agrupa los tipos y sugiere qué características definir.</p>
      </div>
    </form>

    <template #footer>
      <AppButton variant="secondary" @click="open = false">Cancelar</AppButton>
      <AppButton type="submit" form="form-tipo-bien" :disabled="!puedeGuardar">{{ tipo ? 'Guardar cambios' : 'Agregar tipo' }}</AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { CATEGORIAS, useTiposBienData, type CategoriaTipoBien, type TipoBien } from '@/composables/useTiposBienData'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const props = defineProps<{
  /** null = alta de un tipo nuevo */
  tipo: TipoBien | null
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  guardar: [datos: { descripcion: string; categoria: CategoriaTipoBien }]
}>()

const { existeDescripcion } = useTiposBienData()

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'
const ICONO_AGREGAR = 'M12 4.5v15m7.5-7.5h-15'
const ICONO_EDITAR =
  'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'

const descripcion = ref('')
const categoria = ref<CategoriaTipoBien | ''>('')

// Cada vez que se abre, arranca desde el tipo a editar (o vacío si es un alta).
watch(open, (isOpen) => {
  if (!isOpen) return
  descripcion.value = props.tipo?.descripcion ?? ''
  categoria.value = props.tipo?.categoria ?? ''
})

const error = computed(() =>
  descripcion.value.trim() !== '' && existeDescripcion(descripcion.value, props.tipo?.id)
    ? 'Ya existe un tipo de bien con esa descripción.'
    : '',
)

const puedeGuardar = computed(() => descripcion.value.trim() !== '' && categoria.value !== '' && error.value === '')

function guardar() {
  if (!puedeGuardar.value || categoria.value === '') return
  emit('guardar', { descripcion: descripcion.value.trim(), categoria: categoria.value })
  open.value = false
}
</script>
