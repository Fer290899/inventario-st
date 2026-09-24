<template>
  <BaseModal v-model:open="open" title="Importar bienes" subtitle="Alta masiva desde un archivo CSV" size="xl">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    </template>

    <div class="space-y-5">
      <!-- Paso 1 y 2: plantilla y archivo -->
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section class="rounded-xl border border-slate-200 p-4">
          <h4 class="text-sm font-semibold text-slate-800">1. Descarga la plantilla</h4>
          <p class="mt-1 text-xs text-slate-500">
            Llénala en Excel y guárdala como CSV. Para incluir las características de un tipo de bien, elígelo aquí; también puedes agregar columnas
            «Característica: nombre» a mano.
          </p>
          <div class="mt-3 flex flex-wrap items-center gap-2">
            <BaseSelect v-model="tipoPlantilla" class="min-w-[12rem]" aria-label="Tipo de bien para la plantilla">
              <option value="">Solo columnas generales</option>
              <option v-for="tipo in tipos" :key="tipo.id" :value="tipo.id">{{ tipo.descripcion }}</option>
            </BaseSelect>
            <AppButton variant="secondary" @click="descargarPlantilla">Descargar plantilla</AppButton>
          </div>
        </section>

        <section class="rounded-xl border border-slate-200 p-4">
          <h4 class="text-sm font-semibold text-slate-800">2. Sube el archivo</h4>
          <p class="mt-1 text-xs text-slate-500">
            CSV en UTF-8 (coma o punto y coma), hasta {{ MAX_FILAS_IMPORTACION }} filas. Los bienes entran con estatus «Por asignar».
          </p>
          <label class="mt-3 flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-2.5 text-sm text-slate-600 transition focus-within:ring-2 focus-within:ring-blue-500/40 hover:border-blue-400 hover:bg-blue-50/40">
            <input ref="archivoRef" type="file" accept=".csv,text/csv" class="sr-only" data-doc="archivo-csv" @change="alElegirArchivo" />
            <span class="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-blue-700 shadow-sm">Elegir archivo</span>
            <span class="truncate">{{ nombreArchivo || 'Ningún archivo seleccionado' }}</span>
          </label>
        </section>
      </div>

      <p v-if="errorLectura" role="alert" class="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" data-doc="error-global">{{ errorLectura }}</p>

      <!-- Paso 3: vista previa -->
      <section v-if="filas.length > 0" data-doc="vista-previa-importacion">
        <div class="mb-3 flex flex-wrap items-center gap-2">
          <h4 class="mr-2 text-sm font-semibold text-slate-800">3. Revisa antes de importar</h4>
          <span class="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600" data-doc="total-filas">{{ filas.length }} filas</span>
          <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700" data-doc="filas-validas">{{ validas.length }} válidas</span>
          <span
            class="rounded-full px-2.5 py-1 text-xs font-medium"
            :class="conError.length > 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-500'"
            data-doc="filas-error"
          >
            {{ conError.length }} con error
          </span>
          <label v-if="conError.length > 0" class="ml-auto flex items-center gap-2 text-xs text-slate-600">
            <input v-model="soloErrores" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/40" />
            Mostrar solo las filas con error
          </label>
        </div>

        <div class="max-h-[340px] overflow-auto rounded-xl border border-slate-200">
          <table class="w-full text-left text-sm">
            <thead class="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
              <tr>
                <th class="whitespace-nowrap px-3 py-2.5">Fila</th>
                <th class="whitespace-nowrap px-3 py-2.5">Tipo</th>
                <th class="whitespace-nowrap px-3 py-2.5">Marca / modelo</th>
                <th class="whitespace-nowrap px-3 py-2.5">Serie</th>
                <th class="whitespace-nowrap px-3 py-2.5">Resultado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="fila in visibles" :key="fila.numero" data-doc="fila-importacion" :data-estado="fila.errores.length === 0 ? 'ok' : 'error'">
                <td class="whitespace-nowrap px-3 py-2 tabular-nums text-slate-500">{{ fila.numero }}</td>
                <td class="whitespace-nowrap px-3 py-2 font-medium text-slate-800">{{ fila.resumen.tipo || '—' }}</td>
                <td class="whitespace-nowrap px-3 py-2 text-slate-600">{{ fila.resumen.marca }} {{ fila.resumen.modelo }}</td>
                <td class="whitespace-nowrap px-3 py-2 font-mono text-xs text-slate-600">{{ fila.resumen.numeroSerie || '—' }}</td>
                <td class="px-3 py-2">
                  <span v-if="fila.errores.length === 0" class="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    Lista para importar
                  </span>
                  <ul v-else class="space-y-0.5 text-xs text-rose-700">
                    <li v-for="error in fila.errores" :key="error">{{ error }}</li>
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <template #footer>
      <AppButton variant="secondary" @click="open = false">Cancelar</AppButton>
      <AppButton v-if="conError.length > 0" variant="secondary" @click="descargarErrores">Descargar errores</AppButton>
      <AppButton :disabled="validas.length === 0" data-doc="confirmar-importacion" @click="confirmar">
        Importar {{ validas.length }} {{ validas.length === 1 ? 'bien válido' : 'bienes válidos' }}
      </AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { Bien } from '@/composables/useBienesData'
import { MAX_FILAS_IMPORTACION, useImportacionBienes, type FilaImportacion } from '@/composables/useImportacionBienes'
import { useTiposBienData } from '@/composables/useTiposBienData'
import { descargarCsv, parseCsv } from '@/utils/csv'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  importar: [bienes: Array<Omit<Bien, 'id'>>]
}>()

const { tipos } = useTiposBienData()
const { plantilla, validar } = useImportacionBienes()

const tipoPlantilla = ref('')
const nombreArchivo = ref('')
const errorLectura = ref('')
const filas = ref<FilaImportacion[]>([])
const soloErrores = ref(false)
const archivoRef = ref<HTMLInputElement | null>(null)

// Cada vez que se abre, arranca sin archivo cargado.
watch(open, (abierto) => {
  if (!abierto) return
  tipoPlantilla.value = ''
  nombreArchivo.value = ''
  errorLectura.value = ''
  filas.value = []
  soloErrores.value = false
  if (archivoRef.value) archivoRef.value.value = ''
})

const validas = computed(() => filas.value.filter((fila) => fila.datos !== null))
const conError = computed(() => filas.value.filter((fila) => fila.errores.length > 0))
const visibles = computed(() => (soloErrores.value ? conError.value : filas.value))

function descargarPlantilla() {
  const tipo = tipos.find((item) => item.id === tipoPlantilla.value)
  const { encabezados, ejemplo } = plantilla(tipo)
  descargarCsv(encabezados, [ejemplo], tipo ? `plantilla_bienes_${tipo.descripcion.toLowerCase().replace(/\s+/g, '_')}` : 'plantilla_bienes')
}

async function alElegirArchivo(evento: Event) {
  const archivo = (evento.target as HTMLInputElement).files?.[0]
  errorLectura.value = ''
  filas.value = []
  nombreArchivo.value = archivo?.name ?? ''
  if (!archivo) return

  try {
    const resultado = validar(parseCsv(await archivo.text()))
    if (resultado.errorGlobal) errorLectura.value = resultado.errorGlobal
    else filas.value = resultado.filas
  } catch {
    errorLectura.value = 'No se pudo leer el archivo. Verifica que sea un CSV válido.'
  }
}

function descargarErrores() {
  descargarCsv(
    ['Fila', 'Tipo de bien', 'Marca', 'Modelo', 'Número de serie', 'Errores'],
    conError.value.map((fila) => [String(fila.numero), fila.resumen.tipo, fila.resumen.marca, fila.resumen.modelo, fila.resumen.numeroSerie, fila.errores.join(' | ')]),
    'errores_importacion',
  )
}

function confirmar() {
  const lista = validas.value.map((fila) => fila.datos!)
  if (lista.length === 0) return
  emit('importar', lista)
  open.value = false
}
</script>
