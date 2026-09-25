<template>
  <BaseModal v-model:open="open" title="Concluir mantenimiento" :subtitle="subtitulo" size="md">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </template>

    <div v-if="mantenimiento" class="space-y-5">
      <div class="rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
        <p class="font-medium text-slate-800">{{ bien?.nombre ?? '—' }} · {{ bien?.numeroInventario ?? '—' }}</p>
        <p class="mt-0.5 text-xs text-slate-500">
          {{ mantenimiento.folio }} · {{ mantenimiento.tipo }} · programado {{ formatFecha(mantenimiento.fecha) }} con {{ mantenimiento.tecnico }}
        </p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-slate-700">Fecha de conclusión <span class="text-rose-500">*</span></label>
          <input v-model="fechaConclusion" type="date" :class="INPUT" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-semibold text-slate-700">Costo</label>
          <input v-model.number="costo" type="number" min="0" step="0.01" placeholder="0.00" :class="INPUT" />
        </div>
      </div>

      <div v-if="mantenimiento.tipo === 'Correctivo'">
        <label class="mb-1.5 block text-sm font-semibold text-slate-700">Resultado <span class="text-rose-500">*</span></label>
        <div class="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            v-for="opcion in RESULTADOS"
            :key="opcion"
            type="button"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50"
            :class="resultado === opcion ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            :aria-pressed="resultado === opcion"
            :disabled="opcion === 'No reparable' && !can('dictamen:emitir')"
            :title="opcion === 'No reparable' && !can('dictamen:emitir') ? motivoSinPermiso('dictamen:emitir', rol) : undefined"
            @click="resultado = opcion"
          >
            {{ opcion }}
          </button>
        </div>
      </div>

      <div v-if="resultado === 'No reparable'" class="space-y-4 rounded-xl border border-rose-200 bg-rose-50/60 p-4">
        <p class="text-xs font-semibold uppercase tracking-wider text-rose-700">Dictamen de baja</p>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">Causa de la baja <span class="text-rose-500">*</span></label>
            <BaseSelect v-model="causaBaja">
              <option value="">Selecciona una causa</option>
              <option v-for="opcion in CAUSAS_BAJA" :key="opcion" :value="opcion">{{ opcion }}</option>
            </BaseSelect>
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">Destino final <span class="text-rose-500">*</span></label>
            <BaseSelect v-model="destinoFinal">
              <option value="">Selecciona un destino</option>
              <option v-for="opcion in DESTINOS_FINALES" :key="opcion" :value="opcion">{{ opcion }}</option>
            </BaseSelect>
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-semibold text-slate-700">Conclusión del dictamen <span class="text-rose-500">*</span></label>
          <textarea
            v-model="conclusionDictamen"
            rows="3"
            placeholder="Motivo técnico por el que el bien no es reparable"
            class="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/30"
          ></textarea>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">Costo estimado de reparación</label>
            <input v-model.number="costoReparacion" type="number" min="0" step="0.01" placeholder="0.00" :class="INPUT_BLANCO" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">Valor de reposición</label>
            <input v-model.number="valorReposicion" type="number" min="0" step="0.01" placeholder="0.00" :class="INPUT_BLANCO" @input="valorSugerido = false" />
            <p v-if="valorSugerido" class="mt-1 text-xs text-slate-500">Sugerido: valor de adquisición del bien.</p>
          </div>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-semibold text-slate-700">Elaborado por <span class="text-rose-500">*</span></label>
          <BaseSelect v-model="elaboradoPor">
            <option value="">Selecciona quién elabora el dictamen</option>
            <OpcionesTecnico />
          </BaseSelect>
        </div>
        <p class="text-xs text-rose-700">El bien pasará a estatus «Baja» al guardar.</p>
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-semibold text-slate-700">Notas</label>
        <textarea
          v-model="notasConclusion"
          rows="2"
          placeholder="Observaciones adicionales del servicio"
          class="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
        ></textarea>
      </div>
    </div>

    <template #footer>
      <AppButton variant="secondary" @click="open = false">Cancelar</AppButton>
      <AppButton :disabled="!puedeConfirmar" @click="confirmar">Guardar conclusión</AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { useAuth } from '@/composables/useAuth'
import { motivoSinPermiso } from '@/config/permisos'
import { computed, ref, watch } from 'vue'
import { useBienesData } from '@/composables/useBienesData'
import {
  CAUSAS_BAJA,
  DESTINOS_FINALES,
  type CausaBaja,
  type DatosConclusion,
  type DestinoFinal,
  type Mantenimiento,
  type ResultadoCorrectivo,
} from '@/composables/useMantenimientosData'
import AppButton from '@/components/ui/AppButton.vue'
import OpcionesTecnico from './OpcionesTecnico.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const props = defineProps<{
  mantenimiento: Mantenimiento | null
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  confirmar: [datos: DatosConclusion]
}>()

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'
const INPUT_BLANCO =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/30'

const { can, rol } = useAuth()

const RESULTADOS: ResultadoCorrectivo[] = ['Reparado', 'No reparable']

function hoy(): string {
  return new Date().toISOString().slice(0, 10)
}

const fechaConclusion = ref(hoy())
const costo = ref<number | undefined>(undefined)
const notasConclusion = ref('')
const resultado = ref<ResultadoCorrectivo | ''>('')
const causaBaja = ref<CausaBaja | ''>('')
const destinoFinal = ref<DestinoFinal | ''>('')
const conclusionDictamen = ref('')
const costoReparacion = ref<number | undefined>(undefined)
const valorReposicion = ref<number | undefined>(undefined)
const valorSugerido = ref(false)
const elaboradoPor = ref('')

// Cada vez que se abre, arranca desde un formulario limpio.
watch(open, (isOpen) => {
  if (!isOpen) return
  fechaConclusion.value = hoy()
  costo.value = undefined
  notasConclusion.value = ''
  resultado.value = ''
  causaBaja.value = ''
  destinoFinal.value = ''
  conclusionDictamen.value = ''
  costoReparacion.value = undefined
  valorReposicion.value = undefined
  valorSugerido.value = false
  elaboradoPor.value = ''
})

const bien = computed(() => {
  if (!props.mantenimiento) return undefined
  const { bienes } = useBienesData()
  return bienes.find((item) => item.id === props.mantenimiento!.bienId)
})

// Al elegir "No reparable" se sugiere el valor de adquisición del bien como valor de reposición (editable).
watch(resultado, (nuevo) => {
  const valor = bien.value?.valorAdquisicion
  if (nuevo === 'No reparable' && valor !== undefined && valorReposicion.value === undefined) {
    valorReposicion.value = valor
    valorSugerido.value = true
  }
})

const subtitulo = computed(() => (props.mantenimiento ? `${props.mantenimiento.folio} · ${props.mantenimiento.tipo}` : ''))

const dateFormatter = new Intl.DateTimeFormat('es', { day: '2-digit', month: '2-digit', year: 'numeric' })
function formatFecha(fechaIso: string): string {
  return dateFormatter.format(new Date(`${fechaIso}T00:00:00`))
}

const puedeConfirmar = computed(() => {
  if (!props.mantenimiento || fechaConclusion.value === '') return false
  if (props.mantenimiento.tipo !== 'Correctivo') return true
  if (resultado.value === '') return false
  if (resultado.value === 'No reparable') {
    return conclusionDictamen.value.trim() !== '' && elaboradoPor.value !== '' && causaBaja.value !== '' && destinoFinal.value !== ''
  }
  return true
})

function confirmar() {
  if (!puedeConfirmar.value || !props.mantenimiento) return

  const datos: DatosConclusion = {
    fechaConclusion: fechaConclusion.value,
    costo: costo.value,
    notasConclusion: notasConclusion.value.trim() || undefined,
  }

  if (props.mantenimiento.tipo === 'Correctivo') {
    datos.resultado = resultado.value || undefined
    if (resultado.value === 'No reparable') {
      datos.conclusionDictamen = conclusionDictamen.value.trim()
      datos.elaboradoPor = elaboradoPor.value
      datos.causaBaja = causaBaja.value || undefined
      datos.destinoFinal = destinoFinal.value || undefined
      datos.costoReparacion = costoReparacion.value
      datos.valorReposicion = valorReposicion.value
    }
  }

  emit('confirmar', datos)
  open.value = false
}
</script>
