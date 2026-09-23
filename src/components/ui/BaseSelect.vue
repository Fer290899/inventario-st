<template>
  <div class="relative" :class="attrs.class">
    <select
      v-model="model"
      v-bind="attrsSinClase"
      class="m-0 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 pr-7 text-slate-700 shadow-none outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
      :class="TAMANOS[size]"
    >
      <slot />
    </select>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="2"
      stroke="currentColor"
    >
      <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number">
import { computed, useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

type Tamano = 'sm' | 'md'

withDefaults(defineProps<{ size?: Tamano }>(), { size: 'md' })

const model = defineModel<T>({ required: true })

// La clase va al contenedor (ancho/margen); el resto de atributos (disabled, id, aria-*) al <select>.
const attrs = useAttrs()
const attrsSinClase = computed(() => {
  const { class: _clase, ...resto } = attrs
  return resto
})

const TAMANOS: Record<Tamano, string> = {
  sm: 'py-1.5 pl-2.5 text-sm font-medium',
  md: 'py-2 pl-3 text-sm',
}
</script>
