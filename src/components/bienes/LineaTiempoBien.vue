<template>
  <ol class="relative ml-2 space-y-5 border-l-2 border-slate-200 pl-6" data-doc="linea-tiempo">
    <li v-for="evento in eventos" :key="evento.clave" class="relative" data-doc="evento-historial">
      <span class="absolute -left-[33px] top-1 h-3.5 w-3.5 rounded-full ring-4 ring-white" :class="PUNTO[evento.tipo]"></span>
      <div class="flex flex-wrap items-baseline justify-between gap-x-3">
        <p class="text-sm font-semibold text-slate-800">{{ evento.titulo }}</p>
        <p class="text-xs tabular-nums text-slate-500">{{ formatFecha(evento.fecha) }}</p>
      </div>
      <p class="text-sm text-slate-600">{{ evento.detalle }}</p>
      <ul v-if="evento.cambios?.length" class="mt-1.5 space-y-1 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <li v-for="cambio in evento.cambios" :key="cambio.campo" data-doc="cambio-historial">
          <span class="font-medium text-slate-700">{{ cambio.campo }}:</span> <span class="text-slate-400 line-through">{{ cambio.antes }}</span> → <span class="font-medium text-slate-800">{{ cambio.despues }}</span>
        </li>
      </ul>
    </li>
  </ol>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Bien } from '@/composables/useBienesData'
import { useHistorialBien, type TipoEventoHistorial } from '@/composables/useHistorialBien'
import { formatFecha } from '@/utils/formato'

const props = defineProps<{
  bien: Bien
}>()

const { historialDe } = useHistorialBien()

const PUNTO: Record<TipoEventoHistorial, string> = {
  alta: 'bg-blue-500',
  movimiento: 'bg-emerald-500',
  mantenimiento: 'bg-amber-500',
  dictamen: 'bg-rose-500',
  edicion: 'bg-slate-400',
}

const eventos = computed(() => historialDe(props.bien))
</script>
