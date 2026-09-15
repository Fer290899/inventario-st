<template>
  <div class="relative">
    <select
      v-model.number="model"
      class="m-0 appearance-none rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-2.5 pr-7 text-xs font-medium text-slate-600 shadow-none outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
    >
      <option v-for="opcion in options" :key="opcion" :value="opcion">Últimos {{ opcion }} días</option>
    </select>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  options: readonly number[]
}>()

const model = defineModel<number>({ required: true })
</script>
