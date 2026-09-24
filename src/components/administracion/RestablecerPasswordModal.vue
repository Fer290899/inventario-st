<template>
  <BaseModal v-model:open="open" title="Restablecer contraseña" :subtitle="cuenta ? `${cuenta.nombre} · ${cuenta.username}` : ''" size="md">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    </template>

    <form id="form-restablecer" class="space-y-4" @submit.prevent="guardar">
      <CampoPassword id="restablecer-password" v-model="password" label="Nueva contraseña" />
      <p class="text-xs text-slate-500">La contraseña anterior deja de funcionar de inmediato. Esta acción queda en la bitácora, sin la contraseña.</p>
    </form>

    <template #footer>
      <AppButton variant="secondary" @click="open = false">Cancelar</AppButton>
      <AppButton type="submit" form="form-restablecer" :disabled="!puedeGuardar">Restablecer</AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { CuentaPublica } from '@/composables/useCuentasData'
import { errorPassword } from '@/utils/password'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import CampoPassword from './CampoPassword.vue'

defineProps<{ cuenta: CuentaPublica | null }>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  guardar: [password: string]
}>()

const password = ref('')

watch(open, (abierto) => {
  if (abierto) password.value = ''
})

const puedeGuardar = computed(() => errorPassword(password.value) === '')

function guardar() {
  if (!puedeGuardar.value) return
  emit('guardar', password.value)
  open.value = false
}
</script>
