<template>
  <section :aria-labelledby="id" class="border-t border-slate-900 pt-[18px]">
    <h2 :id="id" class="text-lg font-semibold text-slate-900">{{ titulo }}</h2>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  titulo: string
  /** Id del encabezado, referenciado con aria-labelledby. */
  id: string
}>()
</script>
