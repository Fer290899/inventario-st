<template>
  <div class="flex items-center gap-2 text-sm text-slate-600">
    <span>Mostrar</span>
    <BaseSelect v-model="model" size="sm">
      <option v-for="opcion in opciones" :key="opcion" :value="opcion">{{ opcion }}</option>
    </BaseSelect>
    <span>elementos</span>
  </div>
</template>

<script setup lang="ts">
import BaseSelect from '@/components/ui/BaseSelect.vue'

withDefaults(
  defineProps<{
    opciones?: readonly number[]
  }>(),
  { opciones: () => [10, 25, 50, 100] },
)

const model = defineModel<number>({ required: true })
</script>
