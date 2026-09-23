<template>
  <BaseSelect v-model="model" size="sm">
    <option v-for="opcion in options" :key="opcion" :value="opcion">Últimos {{ opcion }} días</option>
  </BaseSelect>
</template>

<script setup lang="ts">
import BaseSelect from '@/components/ui/BaseSelect.vue'

defineProps<{
  options: readonly number[]
}>()

const model = defineModel<number>({ required: true })
</script>
