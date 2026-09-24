<template>
  <BaseModal v-model:open="open" :title="cuenta ? 'Editar cuenta' : 'Agregar cuenta'" :subtitle="subtitulo" size="md">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    </template>

    <form id="form-cuenta" class="grid grid-cols-1 gap-4" @submit.prevent="guardar">
      <div>
        <label class="mb-1.5 block text-sm font-semibold text-slate-700" for="cuenta-nombre">Nombre completo <span class="text-rose-500">*</span></label>
        <input id="cuenta-nombre" v-model="nombre" type="text" placeholder="Ej. Ana Torres Medina" autocomplete="off" :class="INPUT" />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-semibold text-slate-700" for="cuenta-username">Usuario <span class="text-rose-500">*</span></label>
        <input
          id="cuenta-username"
          v-model="username"
          type="text"
          placeholder="Ej. ana.torres"
          autocomplete="off"
          spellcheck="false"
          :readonly="cuenta !== null"
          :class="[INPUT, cuenta ? 'cursor-not-allowed text-slate-500' : '']"
        />
        <p v-if="errorUsuario" role="alert" data-doc="error-username" class="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{{ errorUsuario }}</p>
        <p v-else-if="cuenta" class="mt-1 text-xs text-slate-400">El usuario no se puede cambiar.</p>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-semibold text-slate-700">Rol <span class="text-rose-500">*</span></label>
        <BaseSelect v-model="rolElegido" :disabled="propia" aria-label="Rol" data-doc="cuenta-rol">
          <option v-for="opcion in ROLES" :key="opcion" :value="opcion">{{ opcion }}</option>
        </BaseSelect>
        <p class="mt-1 text-xs text-slate-400">{{ propia ? 'No puedes cambiar tu propio rol.' : DESCRIPCION_ROL[rolElegido] }}</p>
      </div>

      <CampoPassword v-if="!cuenta" id="cuenta-password" v-model="password" />
    </form>

    <template #footer>
      <AppButton variant="secondary" @click="open = false">Cancelar</AppButton>
      <AppButton type="submit" form="form-cuenta" :disabled="!puedeGuardar">{{ cuenta ? 'Guardar cambios' : 'Agregar cuenta' }}</AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { DESCRIPCION_ROL, ROLES, type Rol } from '@/config/permisos'
import { useCuentasData, type CuentaPublica } from '@/composables/useCuentasData'
import { errorPassword } from '@/utils/password'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import CampoPassword from './CampoPassword.vue'

export interface DatosCuentaModal {
  nombre: string
  username: string
  rol: Rol
  /** Solo en el alta */
  password: string
}

const props = defineProps<{
  /** null = alta */
  cuenta: CuentaPublica | null
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  guardar: [datos: DatosCuentaModal]
}>()

const { errorUsername, esPropia } = useCuentasData()

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'

const nombre = ref('')
const username = ref('')
const rolElegido = ref<Rol>('Consulta')
const password = ref('')

// Cada vez que se abre, arranca desde la cuenta a editar (o vacío si es un alta; el rol inicial es el de menos privilegios).
watch(open, (abierto) => {
  if (!abierto) return
  nombre.value = props.cuenta?.nombre ?? ''
  username.value = props.cuenta?.username ?? ''
  rolElegido.value = props.cuenta?.rol ?? 'Consulta'
  password.value = ''
})

const propia = computed(() => props.cuenta !== null && esPropia(props.cuenta.id))
const errorUsuario = computed(() => (props.cuenta ? '' : errorUsername(username.value)))

const subtitulo = computed(() =>
  props.cuenta ? 'Actualiza el nombre y el rol de la cuenta' : 'Da acceso al sistema a una persona con el rol que le corresponda',
)

const puedeGuardar = computed(
  () =>
    nombre.value.trim() !== '' &&
    (props.cuenta !== null || (username.value.trim() !== '' && errorUsuario.value === '' && errorPassword(password.value) === '')),
)

function guardar() {
  if (!puedeGuardar.value) return
  emit('guardar', { nombre: nombre.value.trim(), username: username.value.trim().toLowerCase(), rol: rolElegido.value, password: password.value })
  open.value = false
}
</script>
