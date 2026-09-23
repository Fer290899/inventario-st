<template>
  <section class="mt-14 grid gap-8 break-inside-avoid" :style="{ gridTemplateColumns: `repeat(${firmas.length}, minmax(0, 1fr))` }">
    <div v-for="firma in firmas" :key="firma.rol" data-doc="firma" class="text-center">
      <div class="h-14 border-b border-slate-800"></div>
      <p class="mt-2 text-sm font-semibold text-slate-900">{{ firma.nombre || ' ' }}</p>
      <p v-if="firma.puesto" class="text-xs text-slate-600">{{ firma.puesto }}</p>
      <p class="mt-0.5 text-xs font-bold uppercase tracking-wide text-slate-500">{{ firma.rol }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
export interface Firma {
  rol: string
  nombre?: string
  puesto?: string
}

defineProps<{
  firmas: Firma[]
}>()
</script>
