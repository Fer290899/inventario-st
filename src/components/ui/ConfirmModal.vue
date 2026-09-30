<template>
  <BaseModal v-model:open="open" :title="title" size="sm">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    </template>

    <p class="text-sm text-slate-600">{{ message }}</p>

    <div v-if="pedirMotivo" class="mt-4">
      <label class="mb-1.5 block text-sm font-semibold text-slate-700" for="confirm-motivo">{{ motivoLabel }}</label>
      <textarea
        id="confirm-motivo"
        v-model="motivo"
        rows="2"
        class="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
      ></textarea>
    </div>

    <template #footer>
      <AppButton variant="secondary" @click="open = false">Cancelar</AppButton>
      <AppButton :variant="confirmVariant" @click="confirmar">{{ confirmLabel }}</AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const props = withDefaults(
  defineProps<{
    title: string
    message: string
    confirmLabel?: string
    confirmVariant?: 'danger' | 'primary'
    /** Muestra un textarea de motivo opcional junto al mensaje */
    pedirMotivo?: boolean
    motivoLabel?: string
  }>(),
  { confirmLabel: 'Confirmar', confirmVariant: 'danger', pedirMotivo: false, motivoLabel: 'Motivo (opcional)' },
)

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  confirmar: [motivo?: string]
}>()

const motivo = ref('')

watch(open, (abierto) => {
  if (abierto) motivo.value = ''
})

function confirmar() {
  emit('confirmar', props.pedirMotivo ? motivo.value.trim() || undefined : undefined)
  open.value = false
}
</script>
