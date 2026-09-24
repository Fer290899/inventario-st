<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 print:grid-cols-3 print:gap-0" data-doc="hoja-etiquetas">
    <div
      v-for="bien in bienes"
      :key="bien.id"
      data-doc="etiqueta"
      class="box-border flex h-[36mm] w-full break-inside-avoid items-center gap-2 overflow-hidden rounded border border-dashed border-slate-400 p-2 text-slate-900"
    >
      <QrCode :valor="enlaceDe(bien)" :tamano="88" class="shrink-0" />
      <div class="min-w-0 flex-1 leading-tight">
        <p class="truncate text-[8px] font-semibold uppercase tracking-wide text-slate-500">{{ institucion.nombre }}</p>
        <p class="mt-0.5 truncate text-[11px] font-bold">{{ bien.nombre }}</p>
        <p class="truncate text-[10px]">{{ bien.marca }} {{ bien.modelo }}</p>
        <p class="mt-1 break-all font-mono text-[9px] font-semibold">{{ bien.numeroInventario || 'Sin inventario' }}</p>
        <p class="break-all font-mono text-[8px] text-slate-600">S/N {{ bien.numeroSerie }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Bien } from '@/composables/useBienesData'
import { useInstitucionData } from '@/composables/useInstitucionData'
import QrCode from '@/components/bienes/QrCode.vue'

defineProps<{
  bienes: Bien[]
}>()

const { institucion } = useInstitucionData()

// El QR abre la página del bien; el id no cambia al editarlo (el inventario es opcional y editable).
function enlaceDe(bien: Bien): string {
  return `${window.location.origin}/dashboard/bienes/${bien.id}`
}
</script>
