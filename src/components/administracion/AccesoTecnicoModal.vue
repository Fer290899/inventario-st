<template>
  <BaseModal v-model:open="open" title="Crear acceso" :subtitle="tecnico ? `${tecnico.nombre} · rol Técnico` : ''" size="md">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" :d="ICONO_LLAVE" />
      </svg>
    </template>

    <form id="form-acceso-tecnico" @submit.prevent="guardar">
      <CamposAccesoTecnico v-if="open && tecnico" id="acceso-tecnico" v-model:username="username" v-model:password="password" :nombre="tecnico.nombre" />
    </form>

    <template #footer>
      <AppButton variant="secondary" @click="open = false">Cancelar</AppButton>
      <AppButton type="submit" form="form-acceso-tecnico" :disabled="!puedeGuardar">Crear acceso</AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useTecnicosData, type AccesoNuevo, type Tecnico } from '@/composables/useTecnicosData'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import CamposAccesoTecnico from './CamposAccesoTecnico.vue'
import { ICONO_LLAVE } from './iconos'

defineProps<{ tecnico: Tecnico | null }>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  guardar: [acceso: AccesoNuevo]
}>()

const { errorAcceso } = useTecnicosData()

const username = ref('')
const password = ref('')

watch(open, (abierto) => {
  if (!abierto) return
  username.value = ''
  password.value = ''
})

const puedeGuardar = computed(() => errorAcceso({ username: username.value, password: password.value }) === '')

function guardar() {
  if (!puedeGuardar.value) return
  emit('guardar', { username: username.value.trim().toLowerCase(), password: password.value })
  open.value = false
}
</script>
