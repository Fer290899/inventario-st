<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
    <div class="flex items-center gap-3">
      <div
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br"
        :class="[accentClasses.badge, accentClasses.shadow]"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" :d="icon" />
        </svg>
      </div>
      <p class="text-sm font-medium text-slate-500">{{ title }}</p>
    </div>

    <dl class="mt-4 space-y-2">
      <div class="flex items-center justify-between text-sm">
        <dt class="text-slate-500">Finalizado</dt>
        <dd class="font-medium text-slate-800">{{ formattedDate }}</dd>
      </div>
      <div class="flex items-center justify-between text-sm">
        <dt class="text-slate-500">Técnico</dt>
        <dd class="font-medium text-slate-800">{{ tecnico }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type MaintenanceAccent = 'amber' | 'rose'

const props = defineProps<{
  title: string
  icon: string
  fecha: string
  tecnico: string
  accent: MaintenanceAccent
}>()

const ACCENT_CLASSES: Record<MaintenanceAccent, { badge: string; shadow: string }> = {
  amber: {
    badge: 'from-amber-500 to-orange-600',
    shadow: 'shadow-lg shadow-amber-900/30',
  },
  rose: {
    badge: 'from-rose-500 to-red-600',
    shadow: 'shadow-lg shadow-rose-900/30',
  },
}

const accentClasses = computed(() => ACCENT_CLASSES[props.accent])

const dateFormatter = new Intl.DateTimeFormat('es', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const formattedDate = computed(() => dateFormatter.format(new Date(props.fecha)))
</script>
