<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
        @mousedown.self="cerrar"
        @keydown.esc="cerrar"
      >
        <Transition name="scale" appear>
          <div
            v-if="open"
            role="dialog"
            aria-modal="true"
            class="flex max-h-[92vh] w-full flex-col rounded-2xl bg-white shadow-2xl"
            :class="SIZE_CLASSES[size]"
          >
            <!-- Encabezado -->
            <div class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <div class="flex min-w-0 items-center gap-3">
                <div v-if="$slots.icon" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <slot name="icon" />
                </div>
                <div class="min-w-0">
                  <h3 class="truncate text-base font-semibold text-slate-800">{{ title }}</h3>
                  <p v-if="subtitle" class="truncate text-xs text-slate-500">{{ subtitle }}</p>
                </div>
              </div>

              <div class="flex shrink-0 items-center gap-3">
                <slot name="header-actions" />
                <button
                  type="button"
                  title="Cerrar"
                  aria-label="Cerrar"
                  class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
                  @click="cerrar"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Cuerpo -->
            <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <slot />
            </div>

            <!-- Pie -->
            <div v-if="$slots.footer" class="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    size?: ModalSize
  }>(),
  { size: 'md' },
)

const open = defineModel<boolean>('open', { required: true })

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-3xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-[110rem]',
}

function cerrar() {
  open.value = false
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.2s ease;
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(8px);
}
</style>
