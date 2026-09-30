<template>
  <BaseModal v-model:open="open" title="Cancelar mantenimiento" :subtitle="subtitulo" size="md">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </template>

    <div v-if="mantenimiento" class="space-y-4">
      <div class="rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
        <p class="font-medium text-slate-800">{{ bien?.nombre ?? '—' }} · {{ bien?.numeroInventario ?? '—' }}</p>
        <p class="mt-0.5 text-xs text-slate-500">
          {{ mantenimiento.folio }} · {{ mantenimiento.tipo }} · programado {{ formatFecha(mantenimiento.fecha) }} con {{ mantenimiento.tecnico }}
        </p>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-semibold text-slate-700">Motivo de la cancelación <span class="text-rose-500">*</span></label>
        <textarea
          v-model="motivo"
          rows="3"
          placeholder="Por qué ya no se va a realizar este mantenimiento"
          class="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
        ></textarea>
      </div>
      <p v-if="mantenimiento.tipo === 'Correctivo'" class="text-xs text-slate-500">El bien vuelve al estatus que tenía antes de programar este correctivo.</p>
    </div>

    <template #footer>
      <AppButton variant="secondary" @click="open = false">Volver</AppButton>
      <AppButton variant="danger" :disabled="!puedeConfirmar" @click="confirmar">Cancelar mantenimiento</AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useBienesData } from '@/composables/useBienesData'
import type { Mantenimiento } from '@/composables/useMantenimientosData'
import { formatFecha } from '@/utils/formato'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const props = defineProps<{
  mantenimiento: Mantenimiento | null
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  confirmar: [motivo: string]
}>()

const motivo = ref('')

watch(open, (isOpen) => {
  if (isOpen) motivo.value = ''
})

const bien = computed(() => {
  if (!props.mantenimiento) return undefined
  const { bienes } = useBienesData()
  return bienes.find((item) => item.id === props.mantenimiento!.bienId)
})

const subtitulo = computed(() => (props.mantenimiento ? `${props.mantenimiento.folio} · ${props.mantenimiento.tipo}` : ''))

const puedeConfirmar = computed(() => motivo.value.trim() !== '')

function confirmar() {
  if (!puedeConfirmar.value) return
  emit('confirmar', motivo.value.trim())
  open.value = false
}
</script>
