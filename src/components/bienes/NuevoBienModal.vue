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
          <div v-if="open" class="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl">
            <!-- Encabezado -->
            <div class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/30">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-semibold text-slate-800">Agregar bien</h3>
                  <p class="text-xs text-slate-500">Completa los datos para dar de alta un nuevo bien</p>
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

            <!-- Cuerpo -->
            <form id="form-nuevo-bien" class="min-h-0 flex-1 overflow-y-auto px-6 py-5" @submit.prevent="guardar">
              <div class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <!-- Identificación -->
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Tipo de bien <span class="text-rose-500">*</span></label>
                  <div class="relative">
                    <select v-model="form.tipoBien" required class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-7 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30">
                      <option value="" disabled>Selecciona un bien</option>
                      <option v-for="tipo in TIPOS_BIEN_OPCIONES" :key="tipo" :value="tipo">{{ tipo }}</option>
                    </select>
                    <ChevronIcon />
                  </div>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Marca <span class="text-rose-500">*</span></label>
                  <input v-model="form.marca" type="text" required placeholder="Ej. DELL" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Modelo <span class="text-rose-500">*</span></label>
                  <input v-model="form.modelo" type="text" required placeholder="Ej. OptiPlex 3070" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30" />
                </div>

                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Número de serie <span class="text-rose-500">*</span></label>
                  <input v-model="form.numeroSerie" type="text" required placeholder="Ingresa el número de serie" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Número de inventario</label>
                  <input v-model="form.numeroInventario" type="text" placeholder="Número de inventario" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Fecha de alta</label>
                  <input v-model="form.fechaAlta" type="date" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30" />
                </div>

                <!-- Procedencia -->
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Origen</label>
                  <div class="relative">
                    <select v-model="form.origen" class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-7 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30">
                      <option value="">Seleccione origen</option>
                      <option v-for="opcion in ORIGEN_OPCIONES" :key="opcion" :value="opcion">{{ opcion }}</option>
                    </select>
                    <ChevronIcon />
                  </div>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Número de factura</label>
                  <input v-model="form.numeroFactura" type="text" placeholder="Número de factura" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Fecha de factura</label>
                  <input v-model="form.fechaFactura" type="date" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30" />
                </div>

                <!-- Ubicación administrativa -->
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Ubicación</label>
                  <div class="relative">
                    <select v-model="form.ubicacion" class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-7 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30">
                      <option value="">Selecciona una ubicación</option>
                      <option v-for="opcion in UBICACION_OPCIONES" :key="opcion" :value="opcion">{{ opcion }}</option>
                    </select>
                    <ChevronIcon />
                  </div>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Dirección</label>
                  <div class="relative">
                    <select v-model="form.direccion" class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-7 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30">
                      <option value="">Selecciona una dirección</option>
                      <option v-for="opcion in DIRECCION_OPCIONES" :key="opcion" :value="opcion">{{ opcion }}</option>
                    </select>
                    <ChevronIcon />
                  </div>
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Departamento</label>
                  <div class="relative">
                    <select v-model="form.departamento" class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-7 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30">
                      <option value="">Selecciona un departamento</option>
                      <option v-for="opcion in DEPARTAMENTO_OPCIONES" :key="opcion" :value="opcion">{{ opcion }}</option>
                    </select>
                    <ChevronIcon />
                  </div>
                </div>

                <!-- Detalles -->
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Meses de garantía</label>
                  <input v-model.number="form.mesesGarantia" type="number" min="0" placeholder="0" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div>
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Mesa de ayuda</label>
                  <input v-model="form.mesaAyuda" type="text" placeholder="Número de ticket" class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30" />
                </div>
                <div class="flex items-end pb-2.5">
                  <label class="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      v-model="form.inventariable"
                      type="checkbox"
                      class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/40"
                    />
                    Inventariable
                  </label>
                </div>

                <!-- Características -->
                <div class="sm:col-span-2 lg:col-span-3">
                  <label class="mb-1.5 block text-sm font-medium text-slate-700">Características</label>
                  <textarea
                    v-model="form.caracteristicas"
                    rows="3"
                    placeholder="Describe las características del bien"
                    class="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
                  ></textarea>
                </div>
              </div>
            </form>

            <!-- Pie -->
            <div class="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                @click="cerrar"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="form-nuevo-bien"
                class="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-500 hover:to-indigo-500"
              >
                Guardar
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { h, reactive, watch } from 'vue'
import type { Bien } from '@/composables/useBienesData'
import {
  DEPARTAMENTO_OPCIONES,
  DIRECCION_OPCIONES,
  ORIGEN_OPCIONES,
  TIPOS_BIEN_OPCIONES,
  UBICACION_OPCIONES,
} from '@/composables/useBienesData'

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  guardar: [bien: Omit<Bien, 'id'>]
}>()

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function formVacio() {
  return {
    tipoBien: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    numeroInventario: '',
    fechaAlta: today(),
    caracteristicas: '',
    mesesGarantia: 12,
    inventariable: true,
    origen: '',
    numeroFactura: '',
    fechaFactura: '',
    mesaAyuda: '',
    ubicacion: '',
    direccion: '',
    departamento: '',
  }
}

const form = reactive(formVacio())

// Reinicia el formulario cada vez que se abre el modal.
watch(open, (isOpen) => {
  if (isOpen) Object.assign(form, formVacio())
})

function cerrar() {
  open.value = false
}

function guardar() {
  emit('guardar', {
    nombre: form.tipoBien,
    marca: form.marca,
    modelo: form.modelo,
    numeroSerie: form.numeroSerie,
    numeroInventario: form.numeroInventario,
    fechaAlta: form.fechaAlta || today(),
    caracteristicas: form.caracteristicas,
    mesesGarantia: form.mesesGarantia || 0,
    estatus: 'Por asignar',
    inventariable: form.inventariable,
    origen: form.origen || undefined,
    numeroFactura: form.numeroFactura || undefined,
    fechaFactura: form.fechaFactura || undefined,
    mesaAyuda: form.mesaAyuda || undefined,
    ubicacion: form.ubicacion || undefined,
    direccion: form.direccion || undefined,
    departamento: form.departamento || undefined,
  })
  cerrar()
}

// Pequeño helper para no repetir el SVG del chevron en cada select.
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
