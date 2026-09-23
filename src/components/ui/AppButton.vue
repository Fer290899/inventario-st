<template>
  <button :type="type" :disabled="disabled" :class="[BASE, VARIANTES[variant], TAMANOS[size]]">
    <slot />
  </button>
</template>

<script setup lang="ts">
type Variante = 'primary' | 'secondary' | 'ghost' | 'danger'
type Tamano = 'sm' | 'md'

withDefaults(
  defineProps<{
    variant?: Variante
    size?: Tamano
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
  }>(),
  { variant: 'primary', size: 'md', type: 'button', disabled: false },
)

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50'

const VARIANTES: Record<Variante, string> = {
  primary: 'bg-blue-600 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:hover:bg-blue-600',
  secondary: 'border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50 disabled:hover:bg-white',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-rose-600 font-semibold text-white shadow-sm hover:bg-rose-700 disabled:hover:bg-rose-600',
}

const TAMANOS: Record<Tamano, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
}
</script>
