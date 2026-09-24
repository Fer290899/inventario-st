<template>
  <div class="flex items-center gap-2 border-b border-blue-100 bg-blue-50/60 px-4 py-2.5" data-doc="chip-foco">
    <span class="text-sm text-blue-800">
      Mostrando: <strong class="font-semibold">{{ etiqueta }}</strong>
    </span>
    <button
      type="button"
      class="flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
      :aria-label="`Quitar filtro: ${etiqueta}`"
      @click="emit('quitar')"
    >
      Quitar
      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  etiqueta: string
}>()

const emit = defineEmits<{
  quitar: []
}>()
</script>
