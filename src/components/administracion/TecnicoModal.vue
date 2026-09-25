<template>
  <BaseModal v-model:open="open" :title="tecnico ? 'Editar técnico' : 'Agregar técnico'" :subtitle="subtitulo" size="md">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" :d="ICONO_PERSONA" />
      </svg>
    </template>

    <form id="form-tecnico" class="grid grid-cols-1 gap-4" @submit.prevent="guardar">
      <div>
        <label class="mb-1.5 block text-sm font-semibold text-slate-700" for="tecnico-nombre">Nombre completo <span class="text-rose-500">*</span></label>
        <input id="tecnico-nombre" v-model="nombre" type="text" placeholder="Ej. Ricardo Peña Osorio" autocomplete="off" :class="INPUT" />
        <p v-if="errorNombre" role="alert" data-doc="error-nombre-tecnico" class="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{{ errorNombre }}</p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-slate-700" for="tecnico-especialidad">Especialidad</label>
          <input id="tecnico-especialidad" v-model="especialidad" type="text" placeholder="Ej. Cómputo y redes" autocomplete="off" :class="INPUT" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-slate-700" for="tecnico-contacto">Contacto</label>
          <input id="tecnico-contacto" v-model="contacto" type="text" placeholder="Teléfono o correo" autocomplete="off" :class="INPUT" />
        </div>
      </div>

      <div v-if="!tecnico" class="space-y-3">
        <label class="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50">
          <input v-model="conAcceso" type="checkbox" class="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500/40" data-doc="crear-acceso" />
          <span>
            <span class="block text-sm font-semibold text-slate-700">Crear acceso al sistema</span>
            <span class="block text-xs text-slate-500">Le permite iniciar sesión con el rol Técnico. También puede crearse después, desde su fila.</span>
          </span>
        </label>
        <CamposAccesoTecnico v-if="conAcceso" id="tecnico-acceso" v-model:username="username" v-model:password="password" :nombre="nombre" />
      </div>
    </form>

    <template #footer>
      <AppButton variant="secondary" @click="open = false">Cancelar</AppButton>
      <AppButton type="submit" form="form-tecnico" :disabled="!puedeGuardar">{{ tecnico ? 'Guardar cambios' : 'Agregar técnico' }}</AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTecnicosData, type AccesoNuevo, type DatosTecnico, type Tecnico } from '@/composables/useTecnicosData'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import CamposAccesoTecnico from './CamposAccesoTecnico.vue'
import { ICONO_PERSONA } from './iconos'

export interface GuardarTecnico {
  datos: DatosTecnico
  acceso?: AccesoNuevo
}

const props = defineProps<{
  /** null = alta */
  tecnico: Tecnico | null
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  guardar: [envio: GuardarTecnico]
}>()

const { existeNombre, errorAcceso } = useTecnicosData()

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'

const nombre = ref('')
const especialidad = ref('')
const contacto = ref('')
const conAcceso = ref(false)
const username = ref('')
const password = ref('')

watch(open, (abierto) => {
  if (!abierto) return
  nombre.value = props.tecnico?.nombre ?? ''
  especialidad.value = props.tecnico?.especialidad ?? ''
  contacto.value = props.tecnico?.contacto ?? ''
  conAcceso.value = false
  username.value = ''
  password.value = ''
})

// Al apagar el interruptor se descarta lo escrito, para que la próxima vez arranque con el usuario sugerido.
watch(conAcceso, (activo) => {
  if (activo) return
  username.value = ''
  password.value = ''
})

const subtitulo = computed(() => (props.tecnico ? 'Actualiza los datos del técnico' : 'Da de alta a quien realiza los mantenimientos'))

const errorNombre = computed(() =>
  nombre.value.trim() !== '' && existeNombre(nombre.value, props.tecnico?.id) ? 'Ya existe un técnico con ese nombre.' : '',
)

const puedeGuardar = computed(
  () => nombre.value.trim() !== '' && errorNombre.value === '' && (!conAcceso.value || errorAcceso({ username: username.value, password: password.value }) === ''),
)

function guardar() {
  if (!puedeGuardar.value) return
  emit('guardar', {
    datos: { nombre: nombre.value.trim(), especialidad: especialidad.value.trim(), contacto: contacto.value.trim() },
    acceso: conAcceso.value ? { username: username.value.trim().toLowerCase(), password: password.value } : undefined,
  })
  open.value = false
}
</script>
