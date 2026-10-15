<template>
  <span class="inline-flex items-center gap-2 whitespace-nowrap">
    <span class="h-2.5 w-2.5 shrink-0 rounded-full" :class="ESTATUS_BIEN_ESTILO[estatus].punto" aria-hidden="true"></span>
    {{ estatus }}
  </span>
</template>

<script setup lang="ts">
import type { EstatusBien } from '@/composables/useBienesData'
import { ESTATUS_BIEN_ESTILO } from '@/utils/estatus'

defineProps<{
  estatus: EstatusBien
}>()
</script>
