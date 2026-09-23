<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
    <div class="flex items-center justify-between">
      <div class="flex h-11 w-11 items-center justify-center rounded-xl" :class="accentClasses.badge">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" :d="icon" />
        </svg>
      </div>
      <span v-if="hint" class="rounded-full px-2 py-0.5 text-xs font-medium" :class="accentClasses.hint">
        {{ hint }}
      </span>
    </div>

    <p class="mt-4 text-2xl font-bold tabular-nums text-slate-800">{{ value }}</p>
    <p class="text-sm text-slate-500">{{ label }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type StatAccent = 'brand' | 'neutral' | 'amber' | 'rose'

const props = withDefaults(
  defineProps<{
    label: string
    value: number | string
    icon: string
    hint?: string
    accent?: StatAccent
  }>(),
  {
    accent: 'brand',
  },
)

const ACCENT_CLASSES: Record<StatAccent, { badge: string; hint: string }> = {
  brand: { badge: 'bg-blue-50 text-blue-600', hint: 'bg-blue-50 text-blue-700' },
  neutral: { badge: 'bg-slate-100 text-slate-600', hint: 'bg-slate-100 text-slate-600' },
  amber: { badge: 'bg-amber-50 text-amber-600', hint: 'bg-amber-50 text-amber-700' },
  rose: { badge: 'bg-rose-50 text-rose-600', hint: 'bg-rose-50 text-rose-700' },
}

const accentClasses = computed(() => ACCENT_CLASSES[props.accent])
</script>
