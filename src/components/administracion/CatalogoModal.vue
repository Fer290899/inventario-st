<template>
  <BaseModal v-model:open="open" :title="titulo" :subtitle="subtitulo" size="sm">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" :d="elemento ? ICONO_EDITAR : ICONO_AGREGAR" />
      </svg>
    </template>

    <form id="form-catalogo" @submit.prevent="guardar">
      <label class="mb-1.5 block text-sm font-semibold text-slate-700" for="catalogo-nombre">
        Nombre <span class="text-rose-500">*</span>
      </label>
      <input
        id="catalogo-nombre"
        v-model="nombre"
        type="text"
        :placeholder="`Ej. ${EJEMPLOS[catalogo]}`"
        autocomplete="off"
        :class="INPUT"
      />
      <p v-if="error" role="alert" class="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{{ error }}</p>
      <p v-else-if="elemento" class="mt-1.5 text-xs text-slate-400">
        Los bienes que ya lo tienen se actualizan con el nombre nuevo. Las hojas y movimientos firmados conservan el nombre anterior.
      </p>
    </form>

    <template #footer>
      <AppButton variant="secondary" @click="open = false">Cancelar</AppButton>
      <AppButton type="submit" form="form-catalogo" :disabled="!puedeGuardar">{{ elemento ? 'Guardar cambios' : 'Agregar' }}</AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCatalogosData, type CatalogoSimple, type ElementoCatalogo } from '@/composables/useCatalogosData'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const props = defineProps<{
  catalogo: CatalogoSimple
  /** null = alta */
  elemento: ElementoCatalogo | null
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  guardar: [nombre: string]
}>()

const { existeNombre } = useCatalogosData()

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'
const ICONO_AGREGAR = 'M12 4.5v15m7.5-7.5h-15'
const ICONO_EDITAR =
  'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'

const SINGULAR: Record<CatalogoSimple, string> = { ubicacion: 'ubicación', direccion: 'dirección', departamento: 'departamento' }
const EJEMPLOS: Record<CatalogoSimple, string> = {
  ubicacion: 'Edificio Central - Piso 3',
  direccion: 'Dirección de Planeación',
  departamento: 'Archivo General',
}

const nombre = ref('')

// Cada vez que se abre, arranca desde el elemento a editar (o vacío si es un alta).
watch(open, (isOpen) => {
  if (isOpen) nombre.value = props.elemento?.nombre ?? ''
})

const titulo = computed(() => (props.elemento ? `Editar ${SINGULAR[props.catalogo]}` : `Agregar ${SINGULAR[props.catalogo]}`))
const subtitulo = computed(() =>
  props.elemento ? 'Cambia el nombre del elemento del catálogo' : 'Da de alta un nuevo elemento en el catálogo',
)

const error = computed(() =>
  nombre.value.trim() !== '' && existeNombre(props.catalogo, nombre.value, props.elemento?.id)
    ? `Ya existe ${props.catalogo === 'ubicacion' ? 'una' : 'un'} ${SINGULAR[props.catalogo]} con ese nombre.`
    : '',
)

const puedeGuardar = computed(() => nombre.value.trim() !== '' && error.value === '')

function guardar() {
  if (!puedeGuardar.value) return
  emit('guardar', nombre.value.trim())
  open.value = false
}
</script>
