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
          <div v-if="open" class="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
            <!-- Encabezado -->
            <div class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/30">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-semibold text-slate-800">{{ titulo }}</h3>
                  <p class="text-xs text-slate-500">{{ persona }} · {{ bienes.length }} {{ bienes.length === 1 ? 'bien' : 'bienes' }}</p>
                </div>
              </div>
              <button
                type="button"
                title="Cerrar"
                aria-label="Cerrar"
                class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                @click="cerrar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Cuerpo: tabla informativa con alto máximo y scroll -->
            <div class="min-h-0 flex-1 overflow-y-auto p-6">
              <div class="max-h-[420px] overflow-auto rounded-xl border border-slate-200">
                <table class="w-full text-left text-sm">
                  <thead class="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
                    <tr>
                      <th class="whitespace-nowrap px-4 py-3">Nombre</th>
                      <th class="whitespace-nowrap px-4 py-3">Modelo</th>
                      <th class="whitespace-nowrap px-4 py-3">Marca</th>
                      <th class="whitespace-nowrap px-4 py-3">Número de serie</th>
                      <th class="whitespace-nowrap px-4 py-3">Número de inventario</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr v-for="bien in bienes" :key="bien.id">
                      <td class="whitespace-nowrap px-4 py-3 font-medium text-slate-800">{{ bien.nombre }}</td>
                      <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ bien.modelo }}</td>
                      <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ bien.marca }}</td>
                      <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ bien.numeroSerie }}</td>
                      <td class="whitespace-nowrap px-4 py-3 text-slate-600">{{ bien.numeroInventario }}</td>
                    </tr>

                    <tr v-if="bienes.length === 0">
                      <td colspan="5" class="px-4 py-10 text-center text-sm text-slate-400">
                        No hay bienes registrados en este movimiento.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Pie -->
            <div class="flex shrink-0 items-center justify-end border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                @click="cerrar"
              >
                Cerrar
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { Bien } from '@/composables/useBienesData'

withDefaults(
  defineProps<{
    persona: string
    bienes: Bien[]
    titulo?: string
  }>(),
  { titulo: 'Bienes asignados' },
)

const open = defineModel<boolean>('open', { required: true })

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
