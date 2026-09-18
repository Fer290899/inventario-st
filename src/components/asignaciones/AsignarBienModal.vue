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
          <div v-if="open" class="flex max-h-[94vh] w-full max-w-[110rem] flex-col rounded-2xl bg-white shadow-2xl">
            <!-- Encabezado -->
            <div class="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/30">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-base font-semibold text-slate-800">{{ esReasignacion ? 'Reasignar bien' : 'Asignar bien' }}</h3>
                  <p class="text-xs text-slate-500">
                    {{ esReasignacion ? 'Elige el nuevo responsable y los bienes que cambian de manos' : 'Completa los datos y selecciona los bienes a asignar' }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-3">
                <!-- Selector de modo -->
                <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                  <button
                    v-for="opcion in MODOS"
                    :key="opcion"
                    type="button"
                    class="rounded-md px-4 py-1.5 text-sm font-medium transition"
                    :class="modo === opcion ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                    @click="modo = opcion"
                  >
                    {{ opcion }}
                  </button>
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
            </div>

            <!-- Cuerpo: formulario + tabla de bienes -->
            <div class="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div class="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
                <!-- Formulario -->
                <div class="space-y-4 lg:border-r lg:border-slate-200 lg:pr-6">
                  <div>
                    <h4 class="text-sm font-semibold text-slate-800">{{ esReasignacion ? 'Nuevo responsable' : 'Datos de la asignación' }}</h4>
                    <p class="mt-0.5 text-xs text-slate-500">
                      {{ esReasignacion ? 'Usuario que recibirá los bienes y su nuevo destino' : 'Información del usuario y el destino del bien' }}
                    </p>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-slate-700">Usuario al que se asigna <span class="text-rose-500">*</span></label>
                    <div class="relative">
                      <select v-model="usuario" class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-7 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30">
                        <option value="">Selecciona el usuario</option>
                        <option v-for="opcion in USUARIOS_OPCIONES" :key="opcion" :value="opcion">{{ opcion }}</option>
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-slate-700">Puesto que el usuario ejerce <span class="text-rose-500">*</span></label>
                    <input
                      v-model="puesto"
                      type="text"
                      placeholder="Ingresa el puesto"
                      class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-slate-700">Fecha de asignación <span class="text-rose-500">*</span></label>
                    <input
                      v-model="fechaAsignacion"
                      type="date"
                      class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-slate-700">Mesa de ayuda <span class="text-rose-500">*</span></label>
                    <input
                      v-model="mesaAyuda"
                      type="text"
                      placeholder="Número de mesa de ayuda"
                      class="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
                    />
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-slate-700">Ubicación <span class="text-rose-500">*</span></label>
                    <div class="relative">
                      <select v-model="ubicacion" class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-7 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30">
                        <option value="">Selecciona una ubicación</option>
                        <option v-for="opcion in UBICACION_OPCIONES" :key="opcion" :value="opcion">{{ opcion }}</option>
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-slate-700">Dirección <span class="text-rose-500">*</span></label>
                    <div class="relative">
                      <select v-model="direccion" class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-7 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30">
                        <option value="">Selecciona una dirección</option>
                        <option v-for="opcion in DIRECCION_OPCIONES" :key="opcion" :value="opcion">{{ opcion }}</option>
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-slate-700">Departamento <span class="text-rose-500">*</span></label>
                    <div class="relative">
                      <select v-model="departamento" class="w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-3 pr-7 text-sm text-slate-700 outline-none transition focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30">
                        <option value="">Selecciona un departamento</option>
                        <option v-for="opcion in DEPARTAMENTO_OPCIONES" :key="opcion" :value="opcion">{{ opcion }}</option>
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-slate-700">Notas</label>
                    <textarea
                      v-model="notas"
                      rows="2"
                      :placeholder="esReasignacion ? 'Motivo de la reasignación' : 'Por favor especifique la asignación'"
                      class="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
                    ></textarea>
                  </div>
                </div>

                <!-- Tabla de bienes -->
                <div class="flex min-h-0 flex-col gap-3">
                  <div>
                    <h4 class="text-sm font-semibold text-slate-800">{{ esReasignacion ? 'Bienes asignados' : 'Bienes disponibles' }}</h4>
                    <p class="mt-0.5 text-xs text-slate-500">
                      {{ esReasignacion ? 'Busca por bien o por responsable actual y agrega los que se van a mover' : 'Busca y agrega los bienes que se van a asignar' }}
                    </p>
                  </div>

                  <div class="relative">
                    <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </span>
                    <input
                      v-model="busquedaBien"
                      type="text"
                      :placeholder="esReasignacion ? 'Buscar por bien o responsable actual...' : 'Buscar bienes sin asignar...'"
                      :disabled="!camposRequeridosCompletos"
                      class="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </div>

                  <div class="relative">
                    <div
                      class="max-h-[520px] overflow-auto rounded-xl border border-slate-200 transition"
                      :class="{ 'pointer-events-none select-none opacity-50': !camposRequeridosCompletos }"
                    >
                      <table class="w-full text-left text-sm">
                        <thead class="sticky top-0 z-10 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
                          <tr>
                            <th class="w-10 px-3 py-3"></th>
                            <th class="whitespace-nowrap px-4 py-3">Nombre</th>
                            <th class="whitespace-nowrap px-4 py-3">Modelo</th>
                            <th class="whitespace-nowrap px-4 py-3">Marca</th>
                            <th class="whitespace-nowrap px-4 py-3">Número de serie</th>
                            <th class="whitespace-nowrap px-4 py-3">Número de inventario</th>
                            <th v-if="esReasignacion" class="whitespace-nowrap px-4 py-3">Responsable actual</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100">
                          <tr v-for="bien in bienesDisponibles" :key="bien.id" class="transition hover:bg-slate-50">
                            <td class="px-3 py-2">
                              <button
                                type="button"
                                title="Agregar bien"
                                aria-label="Agregar bien"
                                class="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 transition hover:bg-emerald-100"
                                @click="agregarBienSeleccionado(bien)"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                              </button>
                            </td>
                            <td class="whitespace-nowrap px-4 py-2 font-medium text-slate-800">{{ bien.nombre }}</td>
                            <td class="whitespace-nowrap px-4 py-2 text-slate-600">{{ bien.modelo }}</td>
                            <td class="whitespace-nowrap px-4 py-2 text-slate-600">{{ bien.marca }}</td>
                            <td class="whitespace-nowrap px-4 py-2 text-slate-600">{{ bien.numeroSerie }}</td>
                            <td class="whitespace-nowrap px-4 py-2 text-slate-600">{{ bien.numeroInventario }}</td>
                            <td v-if="esReasignacion" class="whitespace-nowrap px-4 py-2 text-slate-600">{{ responsableActualDe(bien.id) ?? '—' }}</td>
                          </tr>

                          <tr v-if="bienesDisponibles.length === 0">
                            <td :colspan="esReasignacion ? 7 : 6" class="px-4 py-10 text-center text-sm text-slate-400">
                              {{ esReasignacion ? 'No hay bienes asignados que coincidan con la búsqueda.' : 'No hay bienes sin asignar que coincidan con la búsqueda.' }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Overlay de bloqueo hasta completar los campos requeridos -->
                    <div
                      v-if="!camposRequeridosCompletos"
                      class="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-white/70 px-6 text-center backdrop-blur-[1px]"
                    >
                      <div class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                      </div>
                      <p class="text-sm font-medium text-slate-500">Completa los campos requeridos del formulario para seleccionar bienes</p>
                    </div>
                  </div>

                  <!-- "Text area" de bienes seleccionados, con etiquetas removibles -->
                  <div>
                    <label class="mb-1.5 block text-sm font-semibold text-slate-700">
                      {{ esReasignacion ? 'Bienes a reasignar' : 'Bienes a asignar' }} <span class="text-rose-500">*</span>
                    </label>
                    <div class="flex min-h-[84px] w-full flex-wrap content-start gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <span v-if="bienesSeleccionados.length === 0" class="px-1 py-1 text-sm text-slate-400">
                        Selecciona bienes de la tabla de arriba…
                      </span>
                      <span
                        v-for="bien in bienesSeleccionados"
                        :key="bien.id"
                        class="flex items-center gap-1.5 rounded-full bg-blue-50 py-1 pl-2.5 pr-1.5 text-xs font-medium text-blue-700"
                      >
                        {{ bien.nombre }} · {{ bien.numeroInventario }}
                        <span v-if="esReasignacion" class="text-blue-400">de: {{ responsableActualDe(bien.id) ?? '—' }}</span>
                        <button
                          type="button"
                          title="Quitar bien"
                          aria-label="Quitar bien"
                          class="rounded-full p-0.5 text-blue-500 transition hover:bg-blue-100 hover:text-blue-700"
                          @click="quitarBienSeleccionado(bien.id)"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    </div>
                    <p class="mt-1 text-xs text-slate-400">{{ bienesSeleccionados.length }} bien(es) seleccionados</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pie -->
            <div class="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                class="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                @click="cancelar"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:from-blue-600 disabled:hover:to-indigo-600"
                :disabled="!puedeGuardar"
                @click="guardar"
              >
                {{ esReasignacion ? 'Guardar reasignación' : 'Guardar asignación' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, h, ref, watch } from 'vue'
import {
  DEPARTAMENTO_OPCIONES,
  DIRECCION_OPCIONES,
  UBICACION_OPCIONES,
  useBienesData,
  type Bien,
} from '@/composables/useBienesData'
import {
  USUARIOS_OPCIONES,
  useAsignacionesData,
  type DatosMovimiento,
  type TipoMovimiento,
} from '@/composables/useAsignacionesData'

const props = defineProps<{
  modoInicial?: TipoMovimiento
  /** Pre-filtra la tabla con este responsable (útil al reasignar desde una fila). */
  personaInicial?: string
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  guardar: [tipo: TipoMovimiento, datos: DatosMovimiento, bienesIds: string[]]
}>()

const { bienes } = useBienesData()
const { responsableActualDe } = useAsignacionesData()

const MODOS: TipoMovimiento[] = ['Asignación', 'Reasignación']
const modo = ref<TipoMovimiento>('Asignación')
const esReasignacion = computed(() => modo.value === 'Reasignación')

const usuario = ref('')
const puesto = ref('')
const ubicacion = ref('')
const direccion = ref('')
const departamento = ref('')
const fechaAsignacion = ref('')
const mesaAyuda = ref('')
const notas = ref('')
const busquedaBien = ref('')
const bienesSeleccionados = ref<Bien[]>([])

const camposRequeridosCompletos = computed(
  () =>
    usuario.value !== '' &&
    puesto.value.trim() !== '' &&
    ubicacion.value !== '' &&
    direccion.value !== '' &&
    departamento.value !== '' &&
    fechaAsignacion.value !== '' &&
    mesaAyuda.value.trim() !== '',
)

const puedeGuardar = computed(() => camposRequeridosCompletos.value && bienesSeleccionados.value.length > 0)

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

const bienesDisponibles = computed(() => {
  const idsSeleccionados = new Set(bienesSeleccionados.value.map((bien) => bien.id))
  const termino = normalizar(busquedaBien.value.trim())

  return bienes.filter((bien) => {
    if (idsSeleccionados.has(bien.id)) return false

    const responsable = esReasignacion.value ? responsableActualDe(bien.id) : undefined
    if (esReasignacion.value) {
      // Solo bienes que ya tienen dueño, y nunca al mismo usuario que los tiene.
      if (bien.estatus !== 'Asignado' || responsable === usuario.value) return false
    } else if (bien.estatus !== 'Por asignar') {
      return false
    }

    if (!termino) return true
    const campos = [bien.nombre, bien.modelo, bien.marca, bien.numeroSerie, bien.numeroInventario, responsable ?? '']
    return campos.some((campo) => normalizar(campo).includes(termino))
  })
})

function agregarBienSeleccionado(bien: Bien) {
  if (!camposRequeridosCompletos.value) return
  bienesSeleccionados.value.push(bien)
}

function quitarBienSeleccionado(bienId: string) {
  bienesSeleccionados.value = bienesSeleccionados.value.filter((bien) => bien.id !== bienId)
}

function limpiarFormulario() {
  usuario.value = ''
  puesto.value = ''
  ubicacion.value = ''
  direccion.value = ''
  departamento.value = ''
  fechaAsignacion.value = ''
  mesaAyuda.value = ''
  notas.value = ''
  busquedaBien.value = ''
  bienesSeleccionados.value = []
}

// Cada vez que se abre, arranca desde un formulario limpio en el modo pedido.
watch(open, (isOpen) => {
  if (!isOpen) return
  limpiarFormulario()
  modo.value = props.modoInicial ?? 'Asignación'
  if (modo.value === 'Reasignación' && props.personaInicial) busquedaBien.value = props.personaInicial
})

// Cambiar de modo cambia la fuente de bienes, así que la selección deja de tener sentido.
watch(modo, () => {
  busquedaBien.value = ''
  bienesSeleccionados.value = []
})

// Si el nuevo responsable ya tiene alguno de los bienes elegidos, se descarta de la selección.
watch(usuario, (nuevoUsuario) => {
  if (!esReasignacion.value) return
  bienesSeleccionados.value = bienesSeleccionados.value.filter((bien) => responsableActualDe(bien.id) !== nuevoUsuario)
})

function cancelar() {
  open.value = false
}

function guardar() {
  if (!puedeGuardar.value) return

  emit(
    'guardar',
    modo.value,
    {
      persona: usuario.value,
      puesto: puesto.value.trim(),
      ubicacion: ubicacion.value,
      direccion: direccion.value,
      departamento: departamento.value,
      fechaAsignacion: fechaAsignacion.value,
      mesaAyuda: mesaAyuda.value.trim(),
      notas: notas.value.trim(),
    },
    bienesSeleccionados.value.map((bien) => bien.id),
  )

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
