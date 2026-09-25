<template>
  <div class="overflow-x-auto border-b border-slate-200 px-4">
    <div role="tablist" :aria-label="label" class="flex gap-1" @keydown="alTeclear">
      <button
        v-for="(tab, indice) in tabs"
        :key="tab.valor"
        :ref="(el) => (botones[indice] = el as HTMLButtonElement | null)"
        type="button"
        role="tab"
        :aria-selected="modelo === tab.valor"
        :tabindex="modelo === tab.valor ? 0 : -1"
        class="-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/40 sm:px-4"
        :class="modelo === tab.valor ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-800'"
        @click="modelo = tab.valor"
      >
        {{ tab.etiqueta }}
        <span
          v-if="tab.conteo !== undefined"
          class="rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums"
          :class="modelo === tab.valor ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'"
        >
          {{ tab.conteo }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends string">
import { nextTick } from 'vue'

export interface TabBarItem<V extends string = string> {
  valor: V
  etiqueta: string
  conteo?: number
}

const props = defineProps<{
  tabs: ReadonlyArray<TabBarItem<T>>
  label: string
}>()

const modelo = defineModel<T>({ required: true })

const botones: Array<HTMLButtonElement | null> = []

// Flechas, Inicio y Fin cambian de pestaña y llevan el foco con ella (patrón de WAI-ARIA para pestañas).
async function alTeclear(evento: KeyboardEvent) {
  const actual = props.tabs.findIndex((tab) => tab.valor === modelo.value)
  let destino = actual
  if (evento.key === 'ArrowRight') destino = (actual + 1) % props.tabs.length
  else if (evento.key === 'ArrowLeft') destino = (actual - 1 + props.tabs.length) % props.tabs.length
  else if (evento.key === 'Home') destino = 0
  else if (evento.key === 'End') destino = props.tabs.length - 1
  else return

  evento.preventDefault()
  modelo.value = props.tabs[destino]!.valor
  await nextTick()
  botones[destino]?.focus()
}
</script>
