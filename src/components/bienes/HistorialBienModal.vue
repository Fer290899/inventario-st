<template>
  <BaseModal v-model:open="open" title="Historial del bien" :subtitle="subtitulo" size="lg">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </template>

    <template v-if="bien">
      <dl class="mb-5 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Estatus</dt>
          <dd class="font-medium text-slate-800">{{ bien.estatus }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Responsable</dt>
          <dd class="font-medium text-slate-800">{{ bien.responsable ?? '—' }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Valor de adquisición</dt>
          <dd class="font-medium tabular-nums text-slate-800">{{ bien.valorAdquisicion !== undefined ? formatMoneda(bien.valorAdquisicion, { centavos: true }) : '—' }}</dd>
        </div>
      </dl>

      <LineaTiempoBien :bien="bien" />
    </template>

    <template #footer>
      <RouterLink
        v-if="bien"
        :to="`/dashboard/bienes/${bien.id}`"
        class="mr-auto text-sm font-medium text-blue-700 hover:text-blue-800 focus-visible:outline-none focus-visible:underline"
        @click="open = false"
      >
        Abrir página del bien
      </RouterLink>
      <AppButton variant="secondary" @click="open = false">Cerrar</AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Bien } from '@/composables/useBienesData'
import { formatMoneda } from '@/utils/formato'
import LineaTiempoBien from '@/components/bienes/LineaTiempoBien.vue'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'

const props = defineProps<{
  bien: Bien | null
}>()

const open = defineModel<boolean>('open', { required: true })

const subtitulo = computed(() => (props.bien ? `${props.bien.nombre} ${props.bien.marca} · ${props.bien.numeroInventario || 'sin inventario'}` : ''))
</script>
