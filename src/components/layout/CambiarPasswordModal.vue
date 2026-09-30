<template>
  <BaseModal v-model:open="open" title="Cambiar mi contraseña" subtitle="Verifica tu contraseña actual para establecer una nueva" size="md">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
      </svg>
    </template>

    <form id="form-cambiar-password" class="space-y-4" @submit.prevent="guardar">
      <div>
        <label class="mb-1.5 block text-sm font-semibold text-slate-700" for="password-actual">Contraseña actual <span class="text-rose-500">*</span></label>
        <input id="password-actual" v-model="actual" type="password" autocomplete="current-password" :class="INPUT" data-doc="password-actual" />
      </div>
      <CampoPassword id="password-nueva" v-model="nueva" label="Nueva contraseña" />
    </form>

    <template #footer>
      <AppButton variant="secondary" @click="open = false">Cancelar</AppButton>
      <AppButton type="submit" form="form-cambiar-password" :disabled="!puedeGuardar">Cambiar contraseña</AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { errorPassword } from '@/utils/password'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import CampoPassword from '@/components/administracion/CampoPassword.vue'

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  guardar: [actual: string, nueva: string]
}>()

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'

const actual = ref('')
const nueva = ref('')

watch(open, (abierto) => {
  if (abierto) {
    actual.value = ''
    nueva.value = ''
  }
})

const puedeGuardar = computed(() => actual.value !== '' && errorPassword(nueva.value) === '')

function guardar() {
  if (!puedeGuardar.value) return
  emit('guardar', actual.value, nueva.value)
  open.value = false
}
</script>
