<template>
  <div class="flex flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-sm tabular-nums text-slate-500">Mostrando {{ rangoInicio }} a {{ rangoFin }} de {{ total }} elementos</p>

    <div class="flex items-center gap-1">
      <button type="button" title="Primera página" aria-label="Primera página" :class="BOTON_BORDE" :disabled="paginaActual === 1" @click="paginaActual = 1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18.75 19.5l-7.5-7.5 7.5-7.5M11.25 19.5l-7.5-7.5 7.5-7.5" />
        </svg>
      </button>
      <button type="button" title="Página anterior" aria-label="Página anterior" :class="BOTON_BORDE" :disabled="paginaActual === 1" @click="paginaActual -= 1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <template v-for="(pagina, index) in numerosPagina" :key="`${pagina}-${index}`">
        <span v-if="pagina === '…'" class="px-2 text-slate-400">…</span>
        <button
          v-else
          type="button"
          class="h-8 w-8 rounded-lg text-sm font-medium tabular-nums transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          :class="pagina === paginaActual ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'"
          :aria-current="pagina === paginaActual ? 'page' : undefined"
          @click="paginaActual = pagina"
        >
          {{ pagina }}
        </button>
      </template>

      <button type="button" title="Página siguiente" aria-label="Página siguiente" :class="BOTON_BORDE" :disabled="paginaActual === totalPaginas" @click="paginaActual += 1">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      <button type="button" title="Última página" aria-label="Última página" :class="BOTON_BORDE" :disabled="paginaActual === totalPaginas" @click="paginaActual = totalPaginas">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 4.5l7.5 7.5-7.5 7.5M12.75 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  totalPaginas: number
  rangoInicio: number
  rangoFin: number
  total: number
}>()

const paginaActual = defineModel<number>('paginaActual', { required: true })

const BOTON_BORDE =
  'flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-40'

const numerosPagina = computed<Array<number | '…'>>(() => {
  const total = props.totalPaginas
  const actual = paginaActual.value
  const izquierda = Math.max(2, actual - 1)
  const derecha = Math.min(total - 1, actual + 1)

  const paginas: Array<number | '…'> = [1]
  if (izquierda > 2) paginas.push('…')
  for (let p = izquierda; p <= derecha; p += 1) paginas.push(p)
  if (derecha < total - 1) paginas.push('…')
  if (total > 1) paginas.push(total)

  return paginas
})
</script>
