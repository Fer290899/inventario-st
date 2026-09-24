<template>
  <BaseModal v-model:open="open" :title="usuario ? 'Editar responsable' : 'Agregar responsable'" :subtitle="subtitulo" size="md">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    </template>

    <form id="form-usuario" class="grid grid-cols-1 gap-4 sm:grid-cols-2" @submit.prevent="guardar">
      <div class="sm:col-span-2">
        <label class="mb-1.5 block text-sm font-semibold text-slate-700" for="usuario-nombre">
          Nombre completo <span class="text-rose-500">*</span>
        </label>
        <input id="usuario-nombre" v-model="nombre" type="text" placeholder="Ej. Ana Torres Medina" autocomplete="off" :class="INPUT" />
        <p v-if="error" role="alert" class="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{{ error }}</p>
      </div>

      <div class="sm:col-span-2">
        <label class="mb-1.5 block text-sm font-semibold text-slate-700" for="usuario-puesto">Puesto <span class="text-rose-500">*</span></label>
        <input id="usuario-puesto" v-model="puesto" type="text" placeholder="Ej. Jefe de departamento" autocomplete="off" :class="INPUT" />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-semibold text-slate-700">Dirección <span class="text-rose-500">*</span></label>
        <BaseSelect v-model="direccion">
          <option value="">Selecciona una dirección</option>
          <option v-for="opcion in opcionesDireccion" :key="opcion" :value="opcion">{{ opcion }}</option>
        </BaseSelect>
      </div>
      <div>
        <label class="mb-1.5 block text-sm font-semibold text-slate-700">Departamento <span class="text-rose-500">*</span></label>
        <BaseSelect v-model="departamento">
          <option value="">Selecciona un departamento</option>
          <option v-for="opcion in opcionesDepartamento" :key="opcion" :value="opcion">{{ opcion }}</option>
        </BaseSelect>
      </div>

      <p class="text-xs text-slate-400 sm:col-span-2">
        Es la ficha del responsable, solo informativa: al asignar bienes, el puesto, la dirección y el departamento se siguen capturando a mano.
      </p>
    </form>

    <template #footer>
      <AppButton variant="secondary" @click="open = false">Cancelar</AppButton>
      <AppButton type="submit" form="form-usuario" :disabled="!puedeGuardar">{{ usuario ? 'Guardar cambios' : 'Agregar responsable' }}</AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCatalogosData, type DatosUsuario, type Usuario } from '@/composables/useCatalogosData'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const props = defineProps<{
  /** null = alta */
  usuario: Usuario | null
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  guardar: [datos: DatosUsuario]
}>()

const { activas, existeNombre } = useCatalogosData()

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'

const nombre = ref('')
const puesto = ref('')
const direccion = ref('')
const departamento = ref('')

// Cada vez que se abre, arranca desde el usuario a editar (o vacío si es un alta).
watch(open, (isOpen) => {
  if (!isOpen) return
  nombre.value = props.usuario?.nombre ?? ''
  puesto.value = props.usuario?.puesto ?? ''
  direccion.value = props.usuario?.direccion ?? ''
  departamento.value = props.usuario?.departamento ?? ''
})

// Si la dirección/departamento actuales del responsable están inactivos, se siguen mostrando para poder editarlo.
const opcionesDireccion = computed(() =>
  direccion.value && !activas.direcciones.includes(direccion.value) ? [direccion.value, ...activas.direcciones] : activas.direcciones,
)
const opcionesDepartamento = computed(() =>
  departamento.value && !activas.departamentos.includes(departamento.value)
    ? [departamento.value, ...activas.departamentos]
    : activas.departamentos,
)

const subtitulo = computed(() =>
  props.usuario ? 'Actualiza la ficha del personal' : 'Da de alta a una persona que puede recibir bienes en resguardo',
)

const error = computed(() =>
  nombre.value.trim() !== '' && existeNombre('usuario', nombre.value, props.usuario?.id) ? 'Ya existe un responsable con ese nombre.' : '',
)

const puedeGuardar = computed(
  () => nombre.value.trim() !== '' && puesto.value.trim() !== '' && direccion.value !== '' && departamento.value !== '' && error.value === '',
)

function guardar() {
  if (!puedeGuardar.value) return
  emit('guardar', {
    nombre: nombre.value.trim(),
    puesto: puesto.value.trim(),
    direccion: direccion.value,
    departamento: departamento.value,
  })
  open.value = false
}
</script>
