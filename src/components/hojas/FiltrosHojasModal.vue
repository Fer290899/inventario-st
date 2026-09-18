<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
        @mousedown.self="cancelar"
        @keydown.esc="cancelar"
      >
        <Transition name="scale" appear>
          <div v-if="open" class="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
            <!-- Encabezado -->
            <div class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/30">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-semibold text-slate-800">Filtros</h3>
                  <p class="text-xs text-slate-500">Ajusta los criterios y aplica para filtrar el historial</p>
                </div>
              </div>
              <button
                type="button"
                title="Cerrar"
                aria-label="Cerrar"
                class="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                @click="cancelar"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Cuerpo -->
            <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div class="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-3">
                <!-- Movimiento + Usuario -->
                <div class="space-y-4">
                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-slate-700">Movimiento</label>
                    <div class="relative">
                      <select v-model="draft.movimiento" class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-7 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30">
                        <option value="">Todos los movimientos</option>
                        <option v-for="opcion in MOVIMIENTOS" :key="opcion" :value="opcion">{{ opcion }}</option>
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>
                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-slate-700">Usuario</label>
                    <div class="relative">
                      <select v-model="draft.persona" class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-7 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30">
                        <option value="">Todos los usuarios</option>
                        <option v-for="opcion in USUARIOS_OPCIONES" :key="opcion" :value="opcion">{{ opcion }}</option>
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>
                </div>

                <!-- Ubicación administrativa -->
                <div class="space-y-4">
                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-slate-700">Dirección</label>
                    <div class="relative">
                      <select v-model="draft.direccion" class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-7 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30">
                        <option value="">Todas las direcciones</option>
                        <option v-for="opcion in DIRECCION_OPCIONES" :key="opcion" :value="opcion">{{ opcion }}</option>
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>
                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-slate-700">Departamento</label>
                    <div class="relative">
                      <select v-model="draft.departamento" class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-7 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30">
                        <option value="">Todos los departamentos</option>
                        <option v-for="opcion in DEPARTAMENTO_OPCIONES" :key="opcion" :value="opcion">{{ opcion }}</option>
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>
                </div>

                <!-- Fecha -->
                <div>
                  <h4 class="mb-2 text-sm font-semibold text-slate-700">Fecha de la hoja</h4>
                  <div class="space-y-3">
                    <div>
                      <label class="mb-1 block text-xs font-medium text-slate-500">De</label>
                      <input v-model="draft.fechaDesde" type="date" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30" />
                    </div>
                    <div>
                      <label class="mb-1 block text-xs font-medium text-slate-500">A</label>
                      <input v-model="draft.fechaHasta" type="date" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pie -->
            <div class="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 px-6 py-4">
              <button type="button" class="text-sm font-medium text-blue-600 transition hover:text-blue-700" @click="draft = filtrosHojasVacios()">
                Limpiar filtros
              </button>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  @click="cancelar"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  class="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-500 hover:to-indigo-500"
                  @click="aplicar"
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { h, ref, watch } from 'vue'
import { DEPARTAMENTO_OPCIONES, DIRECCION_OPCIONES } from '@/composables/useBienesData'
import {
  USUARIOS_OPCIONES,
  filtrosHojasVacios,
  type FiltrosHojas,
  type TipoMovimiento,
} from '@/composables/useAsignacionesData'

const props = defineProps<{
  filtros: FiltrosHojas
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  aplicar: [filtros: FiltrosHojas]
}>()

const MOVIMIENTOS: TipoMovimiento[] = ['Asignación', 'Reasignación']

const draft = ref<FiltrosHojas>({ ...props.filtros })

// Cada vez que se abre, arranca desde los filtros ya aplicados.
watch(open, (isOpen) => {
  if (isOpen) draft.value = { ...props.filtros }
})

function cancelar() {
  open.value = false
}

function aplicar() {
  emit('aplicar', draft.value)
  open.value = false
}

const ChevronIcon = () =>
  h(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      class: 'pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400',
      fill: 'none',
      viewBox: '0 0 24 24',
      'stroke-width': '2',
      stroke: 'currentColor',
    },
    [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', d: 'M19.5 8.25l-7.5 7.5-7.5-7.5' })],
  )
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
