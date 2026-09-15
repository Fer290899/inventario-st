<template>
  <FwbCard class="min-w-0! w-full bg-white p-5">
    <div class="mb-4 flex items-center justify-between gap-3">
      <h3 class="text-sm font-semibold text-slate-700">{{ title }}</h3>
      <slot name="actions" />
    </div>
    <slot />
  </FwbCard>
</template>

<script setup lang="ts">
import { FwbCard } from 'flowbite-vue'

defineProps<{
  title: string
}>()
</script>
