<template>
  <button
    type="button"
    :title="label"
    :aria-label="label"
    :disabled="disabled"
    class="rounded-lg p-1.5 text-slate-500 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-slate-500"
    :class="TONOS[tone]"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
type Tono = 'blue' | 'emerald' | 'amber' | 'slate'

withDefaults(
  defineProps<{
    label: string
    tone?: Tono
    disabled?: boolean
  }>(),
  { tone: 'slate', disabled: false },
)

const TONOS: Record<Tono, string> = {
  blue: 'hover:bg-blue-50 hover:text-blue-600',
  emerald: 'hover:bg-emerald-50 hover:text-emerald-600',
  amber: 'hover:bg-amber-50 hover:text-amber-600',
  slate: 'hover:bg-slate-100 hover:text-slate-700',
}
</script>
