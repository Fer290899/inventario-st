<template>
  <BaseModal v-model:open="open" :title="TITULOS[tipo]" :subtitle="subtitulo" size="lg">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" :d="ICONOS[tipo]" />
      </svg>
    </template>

    <div class="space-y-6">
      <!-- Tipo de registro -->
      <section>
        <h4 class="text-sm font-semibold text-slate-800">Tipo de mantenimiento</h4>
        <div class="mt-2 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
          <button
            v-for="opcion in TIPOS"
            :key="opcion"
            type="button"
            class="rounded-md px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            :class="tipo === opcion ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            :aria-pressed="tipo === opcion"
            @click="tipo = opcion"
          >
            {{ opcion }}
          </button>
        </div>
      </section>

      <!-- Bienes del mantenimiento -->
      <section>
        <h4 class="text-sm font-semibold text-slate-800">Bienes seleccionados</h4>
        <p class="mt-0.5 text-xs text-slate-500">{{ seleccion.length }} {{ seleccion.length === 1 ? 'bien' : 'bienes' }} en este mantenimiento</p>

        <!-- Buscador de bienes: solo cuando el modal se abre sin bienes preseleccionados -->
        <div v-if="permitirElegirBien" class="mt-3 space-y-2">
          <SearchInput v-model="busquedaBien" placeholder="Buscar bien por nombre, marca o número de inventario..." />
          <div v-if="busquedaBien.trim() !== ''" class="max-h-40 overflow-auto rounded-xl border border-slate-200">
            <button
              v-for="bien in resultadosBusqueda"
              :key="bien.id"
              type="button"
              class="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 text-left text-sm transition last:border-b-0 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500/40"
              @click="agregarBien(bien)"
            >
              <span class="min-w-0 truncate">
                <span class="font-medium text-slate-800">{{ bien.nombre }}</span>
                <span class="text-slate-500"> · {{ bien.marca }} · {{ bien.numeroInventario }}</span>
              </span>
              <span class="shrink-0 text-xs font-semibold text-blue-700">Agregar</span>
            </button>
            <p v-if="resultadosBusqueda.length === 0" class="px-3 py-2 text-sm text-slate-400">Sin resultados.</p>
          </div>
        </div>

        <div class="mt-3 max-h-56 overflow-auto rounded-xl border border-slate-200">
          <table class="w-full text-left text-sm">
            <thead class="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
              <tr>
                <th class="whitespace-nowrap px-4 py-2.5">Nombre</th>
                <th class="whitespace-nowrap px-4 py-2.5">Modelo</th>
                <th class="whitespace-nowrap px-4 py-2.5">Marca</th>
                <th class="whitespace-nowrap px-4 py-2.5">Número de inventario</th>
                <th class="w-10 px-3 py-2.5"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="bien in seleccion" :key="bien.id">
                <td class="whitespace-nowrap px-4 py-2 font-medium text-slate-800">{{ bien.nombre }}</td>
                <td class="whitespace-nowrap px-4 py-2 text-slate-600">{{ bien.modelo }}</td>
                <td class="whitespace-nowrap px-4 py-2 text-slate-600">{{ bien.marca }}</td>
                <td class="whitespace-nowrap px-4 py-2 font-mono text-xs tabular-nums text-slate-600">{{ bien.numeroInventario }}</td>
                <td class="px-3 py-2">
                  <IconButton label="Quitar del mantenimiento" tone="amber" @click="quitar(bien.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </IconButton>
                </td>
              </tr>

              <tr v-if="seleccion.length === 0">
                <td colspan="5">
                  <EmptyState mensaje="No hay bienes en este mantenimiento. Búscalos y agrégalos arriba." />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Datos del mantenimiento / del dictamen -->
      <section class="border-t border-slate-200 pt-5">
        <h4 class="text-sm font-semibold text-slate-800">{{ SECCION_TITULO[tipo] }}</h4>
        <p class="mt-0.5 text-xs text-slate-500">{{ NOTAS_TIPO[tipo] }}</p>

        <!-- Preventivo / Correctivo: campos sueltos -->
        <div v-if="tipo !== 'Dictamen'" class="mt-4 grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">Fecha <span class="text-rose-500">*</span></label>
            <input v-model="fecha" type="date" :class="INPUT" />
          </div>
          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">{{ ETIQUETA_TECNICO[tipo] }} <span class="text-rose-500">*</span></label>
            <BaseSelect v-model="tecnico">
              <option value="">Selecciona un técnico o proveedor</option>
              <option v-for="opcion in TECNICOS_OPCIONES" :key="opcion" :value="opcion">{{ opcion }}</option>
            </BaseSelect>
          </div>

          <template v-if="tipo === 'Correctivo'">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">Prioridad <span class="text-rose-500">*</span></label>
              <BaseSelect v-model="prioridad">
                <option value="">Selecciona una prioridad</option>
                <option v-for="opcion in PRIORIDADES" :key="opcion" :value="opcion">{{ opcion }}</option>
              </BaseSelect>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">Falla reportada <span class="text-rose-500">*</span></label>
              <input v-model="fallaReportada" type="text" placeholder="Ej. No enciende" :class="INPUT" />
            </div>
          </template>

          <template v-else>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">Periodicidad <span class="text-rose-500">*</span></label>
              <BaseSelect v-model="periodicidad">
                <option value="">Selecciona la periodicidad</option>
                <option v-for="opcion in PERIODICIDADES" :key="opcion" :value="opcion">{{ opcion }}</option>
              </BaseSelect>
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">Próxima fecha sugerida</label>
              <input v-model="proximaFecha" type="date" :class="INPUT" />
            </div>
          </template>

          <div class="sm:col-span-2">
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">Descripción <span class="text-rose-500">*</span></label>
            <textarea
              v-model="descripcion"
              rows="2"
              :placeholder="PLACEHOLDERS_DESCRIPCION[tipo]"
              class="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
            ></textarea>
          </div>
        </div>

        <!-- Dictamen: un solo bloque, sin la doble cabecera "mantenimiento" + "dictamen" -->
        <div v-else class="mt-4 space-y-4 rounded-xl border border-rose-200 bg-rose-50/60 p-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">Fecha <span class="text-rose-500">*</span></label>
              <input v-model="fecha" type="date" :class="INPUT_BLANCO" />
            </div>
            <div>
              <label class="mb-1.5 block text-sm font-semibold text-slate-700">{{ ETIQUETA_TECNICO[tipo] }} <span class="text-rose-500">*</span></label>
              <BaseSelect v-model="tecnico">
                <option value="">Selecciona un técnico o proveedor</option>
                <option v-for="opcion in TECNICOS_OPCIONES" :key="opcion" :value="opcion">{{ opcion }}</option>
              </BaseSelect>
            </div>
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
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">Diagnóstico <span class="text-rose-500">*</span></label>
            <textarea
              v-model="descripcion"
              rows="2"
              :placeholder="PLACEHOLDERS_DESCRIPCION[tipo]"
              class="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/30"
            ></textarea>
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
              <input v-model.number="valorReposicion" type="number" min="0" step="0.01" placeholder="0.00" :class="INPUT_BLANCO" />
            </div>
          </div>

          <div>
            <label class="mb-1.5 block text-sm font-semibold text-slate-700">Elaborado por <span class="text-rose-500">*</span></label>
            <BaseSelect v-model="elaboradoPor">
              <option value="">Selecciona quién elabora el dictamen</option>
              <option v-for="opcion in TECNICOS_OPCIONES" :key="opcion" :value="opcion">{{ opcion }}</option>
            </BaseSelect>
          </div>
          <p class="text-xs text-rose-700">{{ seleccion.length === 1 ? 'El bien pasará' : 'Los bienes pasarán' }} a estatus «Baja» al guardar.</p>
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
import { useBienesData, type Bien } from '@/composables/useBienesData'
import {
  CAUSAS_BAJA,
  DESTINOS_FINALES,
  TECNICOS_OPCIONES,
  type CausaBaja,
  type DestinoFinal,
  type NuevoDictamenDirecto,
  type NuevoMantenimiento,
  type Periodicidad,
  type Prioridad,
  type TipoMantenimiento,
} from '@/composables/useMantenimientosData'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import IconButton from '@/components/ui/IconButton.vue'
import SearchInput from '@/components/ui/SearchInput.vue'

/** El modal genera cualquiera de los 3: Preventivo/Correctivo quedan pendientes; Dictamen se genera y concluye de una vez. */
type TipoRegistro = TipoMantenimiento | 'Dictamen'

const props = defineProps<{
  /** Tipo con el que abre el modal; el usuario puede cambiarlo con el selector de arriba. */
  tipoInicial: TipoRegistro
  /** Bienes ya elegidos (ej. desde Bienes); vacío permite buscarlos dentro del modal. */
  bienes: Bien[]
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  confirmar: [registro: NuevoMantenimiento | NuevoDictamenDirecto]
}>()

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'
const INPUT_BLANCO =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/30'

const TIPOS: TipoRegistro[] = ['Preventivo', 'Correctivo', 'Dictamen']
const PRIORIDADES: Prioridad[] = ['Baja', 'Media', 'Alta', 'Urgente']
const PERIODICIDADES: Periodicidad[] = ['Mensual', 'Trimestral', 'Semestral', 'Anual']
const PERIODOS_MESES: Record<Periodicidad, number> = { Mensual: 1, Trimestral: 3, Semestral: 6, Anual: 12 }

const TITULOS: Record<TipoRegistro, string> = {
  Preventivo: 'Programar mantenimiento preventivo',
  Correctivo: 'Enviar a mantenimiento correctivo',
  Dictamen: 'Generar dictamen de baja',
}

const CONFIRMAR: Record<TipoRegistro, string> = {
  Preventivo: 'Programar preventivo',
  Correctivo: 'Registrar correctivo',
  Dictamen: 'Generar dictamen',
}

const NOTAS_TIPO: Record<TipoRegistro, string> = {
  Preventivo: 'Servicio programado; no cambia el estatus del bien',
  Correctivo: 'El bien queda marcado «En reparación» hasta concluir el servicio',
  Dictamen: 'Se registra ya concluido y el bien pasa directo a «Baja»',
}

const ETIQUETA_TECNICO: Record<TipoRegistro, string> = {
  Preventivo: 'Técnico / proveedor',
  Correctivo: 'Técnico / proveedor',
  Dictamen: 'Diagnosticado por',
}

const SECCION_TITULO: Record<TipoRegistro, string> = {
  Preventivo: 'Datos del mantenimiento',
  Correctivo: 'Datos del mantenimiento',
  Dictamen: 'Dictamen de baja',
}

const PLACEHOLDERS_DESCRIPCION: Record<TipoRegistro, string> = {
  Preventivo: 'Trabajo a realizar (limpieza, calibración, revisión...)',
  Correctivo: 'Trabajo a realizar para atender la falla',
  Dictamen: 'Falla o motivo que llevó a considerar el bien no reparable',
}

const ICONOS: Record<TipoRegistro, string> = {
  Preventivo: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
  Correctivo:
    'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L1.5 3l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z',
  Dictamen: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
}

function hoy(): string {
  return new Date().toISOString().slice(0, 10)
}

function sumarMeses(fechaIso: string, meses: number): string {
  const fecha = new Date(`${fechaIso}T00:00:00`)
  fecha.setMonth(fecha.getMonth() + meses)
  return fecha.toISOString().slice(0, 10)
}

const tipo = ref<TipoRegistro>(props.tipoInicial)
const seleccion = ref<Bien[]>([])
const fecha = ref(hoy())
const tecnico = ref('')
const descripcion = ref('')
const prioridad = ref<Prioridad | ''>('')
const fallaReportada = ref('')
const periodicidad = ref<Periodicidad | ''>('')
const proximaFecha = ref('')
const causaBaja = ref<CausaBaja | ''>('')
const destinoFinal = ref<DestinoFinal | ''>('')
const conclusionDictamen = ref('')
const costoReparacion = ref<number | undefined>(undefined)
const valorReposicion = ref<number | undefined>(undefined)
const elaboradoPor = ref('')
const busquedaBien = ref('')

// Cada vez que se abre, arranca desde el tipo/bienes con los que se invocó y un formulario limpio.
watch(open, (isOpen) => {
  if (!isOpen) return
  tipo.value = props.tipoInicial
  seleccion.value = [...props.bienes]
  fecha.value = hoy()
  tecnico.value = ''
  descripcion.value = ''
  prioridad.value = ''
  fallaReportada.value = ''
  periodicidad.value = ''
  proximaFecha.value = ''
  causaBaja.value = ''
  destinoFinal.value = ''
  conclusionDictamen.value = ''
  costoReparacion.value = undefined
  valorReposicion.value = undefined
  elaboradoPor.value = ''
  busquedaBien.value = ''
})

// La próxima fecha sugerida se recalcula mientras el usuario no la edite después de fijar fecha/periodicidad.
watch([fecha, periodicidad], () => {
  if (periodicidad.value) proximaFecha.value = sumarMeses(fecha.value, PERIODOS_MESES[periodicidad.value])
})

function quitar(bienId: string) {
  seleccion.value = seleccion.value.filter((bien) => bien.id !== bienId)
}

const permitirElegirBien = computed(() => props.bienes.length === 0)

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

const resultadosBusqueda = computed(() => {
  if (!permitirElegirBien.value) return []
  const { bienes } = useBienesData()
  const termino = normalizar(busquedaBien.value.trim())
  const yaElegidos = new Set(seleccion.value.map((bien) => bien.id))

  return bienes
    .filter((bien) => bien.estatus !== 'Baja' && !(tipo.value === 'Preventivo' && bien.estatus === 'En reparación') && !yaElegidos.has(bien.id))
    .filter((bien) => [bien.nombre, bien.marca, bien.numeroInventario].some((campo) => normalizar(campo).includes(termino)))
    .slice(0, 8)
})

function agregarBien(bien: Bien) {
  seleccion.value = [...seleccion.value, bien]
  busquedaBien.value = ''
}

const subtitulo = computed(() => {
  const cantidad = seleccion.value.length
  const bienes = `${cantidad} ${cantidad === 1 ? 'bien' : 'bienes'}`
  if (tipo.value === 'Correctivo') return `Registra la falla de ${bienes} y genera el mantenimiento correctivo`
  if (tipo.value === 'Dictamen') return `Genera el dictamen de baja de ${bienes}`
  return `Programa el servicio preventivo de ${bienes}`
})

const camposCompletos = computed(() => {
  const base = fecha.value !== '' && tecnico.value !== '' && descripcion.value.trim() !== ''
  if (tipo.value === 'Correctivo') return base && prioridad.value !== '' && fallaReportada.value.trim() !== ''
  if (tipo.value === 'Dictamen') {
    return base && conclusionDictamen.value.trim() !== '' && elaboradoPor.value !== '' && causaBaja.value !== '' && destinoFinal.value !== ''
  }
  return base && periodicidad.value !== ''
})

const puedeConfirmar = computed(() => camposCompletos.value && seleccion.value.length > 0)

function confirmar() {
  if (!puedeConfirmar.value) return

  const base = {
    bienesIds: seleccion.value.map((bien) => bien.id),
    fecha: fecha.value,
    tecnico: tecnico.value,
    descripcion: descripcion.value.trim(),
  }

  if (tipo.value === 'Correctivo') {
    emit('confirmar', { ...base, tipo: 'Correctivo', prioridad: prioridad.value || undefined, fallaReportada: fallaReportada.value.trim() })
  } else if (tipo.value === 'Dictamen') {
    emit('confirmar', {
      ...base,
      tipo: 'Dictamen',
      causa: causaBaja.value || 'Otro',
      conclusion: conclusionDictamen.value.trim(),
      costoReparacion: costoReparacion.value,
      valorReposicion: valorReposicion.value,
      destinoFinal: destinoFinal.value || 'Resguardo para baja',
      elaboradoPor: elaboradoPor.value,
    })
  } else {
    emit('confirmar', { ...base, tipo: 'Preventivo', periodicidad: periodicidad.value || undefined })
  }

  open.value = false
}
</script>
