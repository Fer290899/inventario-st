<template>
  <BaseModal v-model:open="open" :title="TITULOS[tipo]" :subtitle="subtitulo" size="lg">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" :d="ICONOS[tipo]" />
      </svg>
    </template>

    <div class="space-y-6">
      <!-- Bienes del movimiento -->
      <section>
        <h4 class="text-sm font-semibold text-slate-800">Bienes seleccionados</h4>
        <p class="mt-0.5 text-xs text-slate-500">{{ seleccion.length }} {{ seleccion.length === 1 ? 'bien' : 'bienes' }} en este movimiento</p>

        <div class="mt-3 max-h-56 overflow-auto rounded-xl border border-slate-200">
          <table class="w-full text-left text-sm">
            <thead class="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
              <tr>
                <th class="whitespace-nowrap px-4 py-2.5">Nombre</th>
                <th class="whitespace-nowrap px-4 py-2.5">Modelo</th>
                <th class="whitespace-nowrap px-4 py-2.5">Marca</th>
                <th class="whitespace-nowrap px-4 py-2.5">Número de inventario</th>
                <th v-if="tipo !== 'Asignación'" class="whitespace-nowrap px-4 py-2.5">Responsable actual</th>
                <th class="w-10 px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="bien in seleccion" :key="bien.id">
                <td class="whitespace-nowrap px-4 py-2 font-medium text-slate-800">{{ bien.nombre }}</td>
                <td class="whitespace-nowrap px-4 py-2 text-slate-600">{{ bien.modelo }}</td>
                <td class="whitespace-nowrap px-4 py-2 text-slate-600">{{ bien.marca }}</td>
                <td class="whitespace-nowrap px-4 py-2 font-mono text-xs tabular-nums text-slate-600">{{ bien.numeroInventario }}</td>
                <td v-if="tipo !== 'Asignación'" class="whitespace-nowrap px-4 py-2 text-slate-600">{{ bien.responsable ?? '—' }}</td>
                <td class="px-3 py-2">
                  <IconButton label="Quitar del movimiento" tone="amber" @click="quitar(bien.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </IconButton>
                </td>
              </tr>

              <tr v-if="seleccion.length === 0">
                <td colspan="6">
                  <EmptyState mensaje="No queda ningún bien en este movimiento. Cierra y vuelve a seleccionar en la lista." />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p v-if="notaHojas" class="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">{{ notaHojas }}</p>
      </section>

      <!-- Datos del movimiento -->
      <section class="border-t border-slate-200 pt-5">
        <h4 class="text-sm font-semibold text-slate-800">{{ tipo === 'Devolución' ? 'Datos de la devolución' : 'Datos del nuevo responsable' }}</h4>
        <p class="mt-0.5 text-xs text-slate-500">
          {{ tipo === 'Devolución' ? 'Los bienes regresan a almacén como "Por asignar"' : 'Responsable que recibirá los bienes y su ubicación administrativa' }}
        </p>

        <div class="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <template v-if="tipo !== 'Devolución'">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">Responsable al que se asigna <span class="text-rose-500">*</span></label>
              <BaseSelect v-model="usuario">
                <option value="">Selecciona el responsable</option>
                <option v-for="opcion in activas.usuarios" :key="opcion" :value="opcion">{{ opcion }}</option>
              </BaseSelect>
              <p v-if="conflictoDestino" role="alert" class="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{{ conflictoDestino }}</p>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">Puesto que el responsable ejerce <span class="text-rose-500">*</span></label>
              <input v-model="puesto" type="text" placeholder="Ingresa el puesto" :class="INPUT" />
            </div>
          </template>

          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">
              {{ tipo === 'Devolución' ? 'Fecha de devolución' : 'Fecha de asignación' }} <span class="text-rose-500">*</span>
            </label>
            <input v-model="fecha" type="date" :class="INPUT" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">Mesa de ayuda <span class="text-rose-500">*</span></label>
            <input v-model="mesaAyuda" type="text" placeholder="Número de mesa de ayuda" :class="INPUT" />
          </div>

          <template v-if="tipo !== 'Devolución'">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">Ubicación <span class="text-rose-500">*</span></label>
              <BaseSelect v-model="ubicacion">
                <option value="">Selecciona una ubicación</option>
                <option v-for="opcion in activas.ubicaciones" :key="opcion" :value="opcion">{{ opcion }}</option>
              </BaseSelect>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">Dirección <span class="text-rose-500">*</span></label>
              <BaseSelect v-model="direccion">
                <option value="">Selecciona una dirección</option>
                <option v-for="opcion in activas.direcciones" :key="opcion" :value="opcion">{{ opcion }}</option>
              </BaseSelect>
            </div>
            <div class="sm:col-span-2">
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">Departamento <span class="text-rose-500">*</span></label>
              <BaseSelect v-model="departamento">
                <option value="">Selecciona un departamento</option>
                <option v-for="opcion in activas.departamentos" :key="opcion" :value="opcion">{{ opcion }}</option>
              </BaseSelect>
            </div>
          </template>

          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">{{ tipo === 'Devolución' ? 'Motivo de la devolución' : 'Notas' }}</label>
            <textarea
              v-model="notas"
              rows="2"
              :placeholder="PLACEHOLDERS_NOTAS[tipo]"
              class="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
            ></textarea>
          </div>
        </div>
      </section>
    </div>

    <template #footer>
      <AppButton variant="secondary" @click="open = false">Cancelar</AppButton>
      <AppButton :disabled="!puedeConfirmar" @click="confirmar">{{ CONFIRMAR[tipo] }}</AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Bien } from '@/composables/useBienesData'
import { useCatalogosData } from '@/composables/useCatalogosData'
import type { NuevoMovimiento, TipoMovimiento } from '@/composables/useMovimientosData'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import IconButton from '@/components/ui/IconButton.vue'

const props = defineProps<{
  tipo: TipoMovimiento
  /** Bienes elegidos en la lista; el modal trabaja sobre una copia. */
  bienes: Bien[]
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  confirmar: [movimiento: NuevoMovimiento]
}>()

const { activas } = useCatalogosData()

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'

const TITULOS: Record<TipoMovimiento, string> = {
  Asignación: 'Asignar bienes',
  Reasignación: 'Reasignar bienes',
  Devolución: 'Devolver bienes',
}

const CONFIRMAR: Record<TipoMovimiento, string> = {
  Asignación: 'Confirmar asignación',
  Reasignación: 'Confirmar reasignación',
  Devolución: 'Confirmar devolución',
}

const PLACEHOLDERS_NOTAS: Record<TipoMovimiento, string> = {
  Asignación: 'Por favor especifique la asignación',
  Reasignación: 'Motivo de la reasignación',
  Devolución: 'Motivo por el que regresan a almacén',
}

const ICONOS: Record<TipoMovimiento, string> = {
  Asignación:
    'M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z',
  Reasignación: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
  Devolución: 'M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3',
}

function hoy(): string {
  return new Date().toISOString().slice(0, 10)
}

const seleccion = ref<Bien[]>([])
const usuario = ref('')
const puesto = ref('')
const ubicacion = ref('')
const direccion = ref('')
const departamento = ref('')
const fecha = ref(hoy())
const mesaAyuda = ref('')
const notas = ref('')

// Cada vez que se abre, arranca desde los bienes elegidos y un formulario limpio.
watch(open, (isOpen) => {
  if (!isOpen) return
  seleccion.value = [...props.bienes]
  usuario.value = ''
  puesto.value = ''
  ubicacion.value = ''
  direccion.value = ''
  departamento.value = ''
  fecha.value = hoy()
  mesaAyuda.value = ''
  notas.value = ''
})

function quitar(bienId: string) {
  seleccion.value = seleccion.value.filter((bien) => bien.id !== bienId)
}

const subtitulo = computed(() => {
  const cantidad = seleccion.value.length
  const bienes = `${cantidad} ${cantidad === 1 ? 'bien' : 'bienes'}`
  if (props.tipo === 'Asignación') return `Asigna ${bienes} a un responsable y genera su hoja de resguardo`
  if (props.tipo === 'Reasignación') return `Pasa ${bienes} a otro responsable`
  return `Regresa ${bienes} a almacén y genera la hoja de entrega`
})

const responsablesActuales = computed(() => new Set(seleccion.value.map((bien) => bien.responsable).filter(Boolean)))

const notaHojas = computed(() => {
  const entregas = responsablesActuales.value.size
  const hojasEntrega = `${entregas} ${entregas === 1 ? 'hoja de entrega' : 'hojas de entrega'} (una por responsable actual)`
  if (props.tipo === 'Reasignación') return `Se generarán ${hojasEntrega} y 1 hoja de resguardo para el nuevo responsable.`
  if (props.tipo === 'Devolución') return `Se generarán ${hojasEntrega}.`
  return ''
})

const conflictoDestino = computed(() => {
  if (props.tipo !== 'Reasignación' || !usuario.value) return ''
  const yaLoTiene = seleccion.value.filter((bien) => bien.responsable === usuario.value)
  if (yaLoTiene.length === 0) return ''
  return `${usuario.value} ya tiene ${yaLoTiene.length === 1 ? 'uno de los bienes' : `${yaLoTiene.length} de los bienes`}. Quítalos del movimiento o elige otro responsable.`
})

const camposCompletos = computed(() => {
  const base = fecha.value !== '' && mesaAyuda.value.trim() !== ''
  if (props.tipo === 'Devolución') return base
  return (
    base &&
    usuario.value !== '' &&
    puesto.value.trim() !== '' &&
    ubicacion.value !== '' &&
    direccion.value !== '' &&
    departamento.value !== ''
  )
})

const puedeConfirmar = computed(() => camposCompletos.value && seleccion.value.length > 0 && conflictoDestino.value === '')

function confirmar() {
  if (!puedeConfirmar.value) return

  const base = {
    fecha: fecha.value,
    mesaAyuda: mesaAyuda.value.trim(),
    notas: notas.value.trim() || undefined,
    bienesIds: seleccion.value.map((bien) => bien.id),
  }

  if (props.tipo === 'Devolución') {
    emit('confirmar', { ...base, tipo: 'Devolución' })
  } else {
    emit('confirmar', {
      ...base,
      tipo: props.tipo,
      destino: {
        persona: usuario.value,
        puesto: puesto.value.trim(),
        ubicacion: ubicacion.value,
        direccion: direccion.value,
        departamento: departamento.value,
      },
    })
  }

  open.value = false
}
</script>
