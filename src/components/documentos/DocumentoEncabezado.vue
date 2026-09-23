<template>
  <header class="mb-6 border-b-2 border-slate-800 pb-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <div class="flex items-center gap-3">
        <div class="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        </div>
        <div>
          <p data-doc="institucion" class="text-base font-bold leading-tight text-slate-900">{{ institucion.nombre }}</p>
          <p class="text-xs text-slate-600">{{ institucion.area }}</p>
        </div>
      </div>

      <div class="sm:text-right">
        <p v-if="folio" class="font-mono text-sm font-bold tabular-nums text-slate-900">{{ folio }}</p>
        <p class="text-xs text-slate-600">{{ formatFecha(fecha) }}</p>
      </div>
    </div>

    <h1 class="mt-4 text-center text-lg font-bold uppercase tracking-wide text-slate-900">{{ titulo }}</h1>
  </header>
</template>

<script setup lang="ts">
import { useInstitucionData } from '@/composables/useInstitucionData'
import { formatFecha } from '@/utils/formato'

defineProps<{
  titulo: string
  folio?: string
  /** Fecha ISO (YYYY-MM-DD) */
  fecha: string
}>()

const { institucion } = useInstitucionData()
</script>
