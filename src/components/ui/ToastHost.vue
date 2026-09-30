<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          role="status"
          class="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
        >
          <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full" :class="ESTILOS[toast.tipo]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" :d="ICONOS[toast.tipo]" />
            </svg>
          </span>
          <p class="flex-1 pt-0.5 text-sm text-slate-700">{{ toast.mensaje }}</p>
          <button
            v-if="toast.accion"
            type="button"
            class="shrink-0 pt-0.5 text-sm font-semibold text-blue-700 hover:text-blue-800 focus-visible:outline-none focus-visible:underline"
            @click="deshacer(toast)"
          >
            {{ toast.accion.etiqueta }}
          </button>
          <button
            type="button"
            title="Cerrar"
            aria-label="Cerrar"
            class="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            @click="cerrar(toast.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast, type Toast, type ToastTipo } from '@/composables/useToast'

const { toasts, cerrar } = useToast()

function deshacer(toast: Toast) {
  toast.accion?.ejecutar()
  cerrar(toast.id)
}

const ESTILOS: Record<ToastTipo, string> = {
  success: 'bg-emerald-50 text-emerald-600',
  info: 'bg-blue-50 text-blue-600',
  error: 'bg-rose-50 text-rose-600',
}

const ICONOS: Record<ToastTipo, string> = {
  success: 'M4.5 12.75l6 6 9-13.5',
  info: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
  error: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z',
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
