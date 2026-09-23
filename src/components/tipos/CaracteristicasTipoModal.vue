<template>
  <BaseModal
    v-model:open="open"
    :title="`Características de ${tipo?.descripcion ?? ''}`"
    subtitle="Datos técnicos que se capturarán en cada bien de este tipo"
    size="xl"
  >
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
      </svg>
    </template>

    <div class="space-y-5">
      <p class="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
        Marca, modelo, número de serie, número de inventario, garantía y fecha de alta ya se capturan en todos los bienes; aquí solo van los datos
        técnicos propios de este tipo.
      </p>

      <!-- Encabezados (escritorio) -->
      <div v-if="filas.length > 0" class="hidden gap-3 px-1 text-[11px] font-semibold uppercase tracking-wider text-slate-500 sm:grid sm:grid-cols-12">
        <span class="sm:col-span-4">Característica</span>
        <span class="sm:col-span-2">Tipo de dato</span>
        <span class="sm:col-span-4">Unidad u opciones</span>
        <span class="text-center sm:col-span-1">Obligatoria</span>
        <span class="sm:col-span-1"></span>
      </div>

      <div class="max-h-[46vh] space-y-3 overflow-y-auto pr-1">
        <div
          v-for="(fila, indice) in filas"
          :key="fila.id"
          class="grid grid-cols-1 items-start gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-12 sm:border-0 sm:p-0"
        >
          <div class="sm:col-span-4">
            <label class="mb-1 block text-xs font-medium text-slate-500 sm:sr-only">Característica</label>
            <input v-model="fila.nombre" type="text" placeholder="Ej. Capacidad" :aria-label="`Nombre de la característica ${indice + 1}`" :class="INPUT" />
          </div>

          <div class="sm:col-span-2">
            <label class="mb-1 block text-xs font-medium text-slate-500 sm:sr-only">Tipo de dato</label>
            <BaseSelect v-model="fila.tipoDato" :aria-label="`Tipo de dato de la característica ${indice + 1}`">
              <option v-for="opcion in TIPOS_DATO" :key="opcion.valor" :value="opcion.valor">{{ opcion.etiqueta }}</option>
            </BaseSelect>
          </div>

          <div class="sm:col-span-4">
            <label class="mb-1 block text-xs font-medium text-slate-500 sm:sr-only">Unidad u opciones</label>
            <input
              v-if="fila.tipoDato === 'numero'"
              v-model="fila.unidad"
              type="text"
              placeholder="Unidad (GB, W, pulgadas…)"
              :aria-label="`Unidad de la característica ${indice + 1}`"
              :class="INPUT"
            />
            <input
              v-else-if="fila.tipoDato === 'lista'"
              v-model="fila.opcionesTexto"
              type="text"
              placeholder="Opciones separadas por coma"
              :aria-label="`Opciones de la característica ${indice + 1}`"
              :class="INPUT"
            />
            <p v-else class="px-1 py-2 text-sm text-slate-400">
              {{ fila.tipoDato === 'texto' ? 'Texto libre' : 'Se responde con Sí o No' }}
            </p>
          </div>

          <label class="flex items-center gap-2 py-2 text-sm text-slate-600 sm:col-span-1 sm:justify-center">
            <input
              v-model="fila.requerida"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/40"
              :aria-label="`Característica ${indice + 1} obligatoria`"
            />
            <span class="sm:hidden">Obligatoria</span>
          </label>

          <div class="flex sm:col-span-1 sm:justify-end">
            <IconButton label="Quitar característica" tone="amber" @click="quitarFila(fila.id)">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </IconButton>
          </div>
        </div>

        <EmptyState v-if="filas.length === 0" mensaje="Este tipo aún no tiene características. Agrega una o usa las sugeridas." />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <AppButton variant="secondary" size="sm" @click="agregarFila()">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Agregar característica
        </AppButton>
      </div>

      <!-- Sugeridas según la categoría del tipo -->
      <section v-if="sugerencias.length > 0" class="border-t border-slate-200 pt-4">
        <h4 class="text-sm font-semibold text-slate-800">Sugeridas para {{ tipo?.categoria }}</h4>
        <p class="mt-0.5 text-xs text-slate-500">Haz clic para agregarlas a la lista.</p>
        <div class="mt-3 flex flex-wrap gap-2">
          <button
            v-for="sugerencia in sugerencias"
            :key="sugerencia.nombre"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            @click="agregarFila(sugerencia)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {{ sugerencia.nombre }}
          </button>
        </div>
      </section>

      <p v-if="problema" role="alert" class="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{{ problema }}</p>
    </div>

    <template #footer>
      <AppButton variant="secondary" @click="open = false">Cancelar</AppButton>
      <AppButton :disabled="problema !== ''" @click="guardar">Guardar características</AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  SUGERENCIAS_CARACTERISTICAS,
  TIPOS_DATO,
  nuevaCaracteristicaId,
  type CaracteristicaDef,
  type TipoBien,
  type TipoDato,
} from '@/composables/useTiposBienData'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import IconButton from '@/components/ui/IconButton.vue'

const props = defineProps<{
  tipo: TipoBien | null
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  guardar: [caracteristicas: CaracteristicaDef[]]
}>()

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'

// Las opciones se editan como texto ("HDD, SSD") y se convierten a lista solo al guardar.
interface Fila {
  id: string
  nombre: string
  tipoDato: TipoDato
  unidad: string
  opcionesTexto: string
  requerida: boolean
}

const filas = ref<Fila[]>([])

// Cada vez que se abre, arranca desde una copia de las características del tipo.
watch(open, (isOpen) => {
  if (!isOpen || !props.tipo) return
  filas.value = props.tipo.caracteristicas.map((caracteristica) => ({
    id: caracteristica.id,
    nombre: caracteristica.nombre,
    tipoDato: caracteristica.tipoDato,
    unidad: caracteristica.unidad ?? '',
    opcionesTexto: caracteristica.opciones?.join(', ') ?? '',
    requerida: caracteristica.requerida,
  }))
})

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
}

function agregarFila(base?: Omit<CaracteristicaDef, 'id'>) {
  filas.value.push({
    id: nuevaCaracteristicaId(),
    nombre: base?.nombre ?? '',
    tipoDato: base?.tipoDato ?? 'texto',
    unidad: base?.unidad ?? '',
    opcionesTexto: base?.opciones?.join(', ') ?? '',
    requerida: base?.requerida ?? false,
  })
}

function quitarFila(id: string) {
  filas.value = filas.value.filter((fila) => fila.id !== id)
}

const sugerencias = computed(() => {
  if (!props.tipo) return []
  const existentes = new Set(filas.value.map((fila) => normalizar(fila.nombre)))
  return SUGERENCIAS_CARACTERISTICAS[props.tipo.categoria].filter((sugerencia) => !existentes.has(normalizar(sugerencia.nombre)))
})

function opcionesDe(fila: Fila): string[] {
  return [...new Set(fila.opcionesTexto.split(',').map((opcion) => opcion.trim()).filter(Boolean))]
}

const problema = computed(() => {
  const vistos = new Set<string>()
  for (const fila of filas.value) {
    const nombre = fila.nombre.trim()
    if (nombre === '') return 'Todas las características necesitan un nombre.'
    const clave = normalizar(nombre)
    if (vistos.has(clave)) return `«${nombre}» está repetida.`
    vistos.add(clave)
    if (fila.tipoDato === 'lista' && opcionesDe(fila).length < 2) {
      return `«${nombre}» necesita al menos 2 opciones separadas por coma.`
    }
  }
  return ''
})

function guardar() {
  if (problema.value !== '') return

  emit(
    'guardar',
    filas.value.map((fila) => {
      const caracteristica: CaracteristicaDef = {
        id: fila.id,
        nombre: fila.nombre.trim(),
        tipoDato: fila.tipoDato,
        requerida: fila.requerida,
      }
      if (fila.tipoDato === 'numero' && fila.unidad.trim() !== '') caracteristica.unidad = fila.unidad.trim()
      if (fila.tipoDato === 'lista') caracteristica.opciones = opcionesDe(fila)
      return caracteristica
    }),
  )

  open.value = false
}
</script>
