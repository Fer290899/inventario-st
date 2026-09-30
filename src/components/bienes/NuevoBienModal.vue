<template>
  <BaseModal v-model:open="open" :title="titulo" :subtitle="subtitulo" size="md">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" :d="bien ? ICONO_EDITAR : ICONO_ALTA" />
      </svg>
    </template>

    <form id="form-nuevo-bien" @submit.prevent="guardar">
      <div class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Identificación -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Tipo de bien <span class="text-rose-500">*</span></label>
          <BaseSelect v-model="tipoSeleccionado" required>
            <option value="" disabled>Selecciona un bien</option>
            <option v-for="tipo in opcionesTipo" :key="tipo" :value="tipo">{{ tipo }}</option>
          </BaseSelect>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Marca <span class="text-rose-500">*</span></label>
          <input v-model="form.marca" type="text" required placeholder="Ej. DELL" :class="INPUT" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Modelo <span class="text-rose-500">*</span></label>
          <input v-model="form.modelo" type="text" required placeholder="Ej. OptiPlex 3070" :class="INPUT" />
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Número de serie <span class="text-rose-500">*</span></label>
          <input v-model="form.numeroSerie" type="text" required placeholder="Ingresa el número de serie" :class="INPUT" :aria-invalid="errorSerie !== ''" />
          <p v-if="errorSerie" role="alert" class="mt-1.5 text-xs text-rose-600" data-doc="error-serie">{{ errorSerie }}</p>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Número de inventario</label>
          <input v-model="form.numeroInventario" type="text" placeholder="Número de inventario" :class="INPUT" :aria-invalid="errorInventario !== ''" />
          <p v-if="errorInventario" role="alert" class="mt-1.5 text-xs text-rose-600" data-doc="error-inventario">{{ errorInventario }}</p>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Fecha de alta</label>
          <input v-model="form.fechaAlta" type="date" :class="INPUT" />
        </div>

        <!-- Procedencia -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Origen</label>
          <BaseSelect v-model="form.origen">
            <option value="">Seleccione origen</option>
            <option v-for="opcion in ORIGEN_OPCIONES" :key="opcion" :value="opcion">{{ opcion }}</option>
          </BaseSelect>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Número de factura</label>
          <input v-model="form.numeroFactura" type="text" placeholder="Número de factura" :class="INPUT" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Fecha de factura</label>
          <input v-model="form.fechaFactura" type="date" :class="INPUT" />
        </div>

        <!-- Ubicación administrativa -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Ubicación</label>
          <BaseSelect v-model="form.ubicacion" :disabled="ubicacionBloqueada">
            <option value="">Selecciona una ubicación</option>
            <option v-for="opcion in opcionesUbicacion" :key="opcion" :value="opcion">{{ opcion }}</option>
          </BaseSelect>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Dirección</label>
          <BaseSelect v-model="form.direccion" :disabled="ubicacionBloqueada">
            <option value="">Selecciona una dirección</option>
            <option v-for="opcion in opcionesDireccion" :key="opcion" :value="opcion">{{ opcion }}</option>
          </BaseSelect>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Departamento</label>
          <BaseSelect v-model="form.departamento" :disabled="ubicacionBloqueada">
            <option value="">Selecciona un departamento</option>
            <option v-for="opcion in opcionesDepartamento" :key="opcion" :value="opcion">{{ opcion }}</option>
          </BaseSelect>
        </div>

        <p v-if="ubicacionBloqueada" class="text-xs text-slate-500 sm:col-span-2 lg:col-span-3">
          Este bien está asignado: su ubicación, dirección y departamento siguen al responsable y se cambian con Reasignar.
        </p>

        <!-- Detalles -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Valor de adquisición (MXN)</label>
          <input v-model.number="form.valorAdquisicion" type="number" min="0" step="0.01" placeholder="0.00" :class="INPUT" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Meses de garantía</label>
          <input v-model.number="form.mesesGarantia" type="number" min="0" placeholder="0" :class="INPUT" />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Mesa de ayuda</label>
          <input v-model="form.mesaAyuda" type="text" placeholder="Número de ticket" :class="INPUT" />
        </div>
        <div class="sm:col-span-2 lg:col-span-3">
          <label class="flex items-center gap-2 text-sm text-slate-700">
            <input
              v-model="form.inventariable"
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/40"
            />
            Inventariable
          </label>
        </div>

        <!-- Características del tipo de bien -->
        <fieldset v-if="definiciones.length > 0" class="sm:col-span-2 lg:col-span-3" data-doc="caracteristicas-tipo">
          <legend class="mb-3 text-sm font-semibold text-slate-700">Características de {{ form.tipoBien }}</legend>
          <div class="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            <CaracteristicaInput v-for="def in definiciones" :key="def.id" v-model="form.valores[def.id]" :def="def" :exigir="exigirRequeridas" />
          </div>
          <p v-if="bien && !exigirRequeridas" class="mt-2 text-xs text-slate-500">
            Este bien se dio de alta con una descripción libre: completa las características cuando quieras; no son obligatorias al editarlo.
          </p>
        </fieldset>

        <!-- Foto -->
        <div class="sm:col-span-2 lg:col-span-3">
          <CampoFoto v-model="form.foto" id="bien-foto" />
        </div>

        <!-- Observaciones -->
        <div class="sm:col-span-2 lg:col-span-3">
          <label class="mb-1.5 block text-sm font-medium text-slate-700">Observaciones</label>
          <textarea
            v-model="form.observaciones"
            rows="3"
            placeholder="Notas adicionales sobre el bien"
            class="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
          ></textarea>
        </div>
      </div>
    </form>

    <template #footer>
      <AppButton variant="secondary" @click="cerrar">Cancelar</AppButton>
      <AppButton type="submit" form="form-nuevo-bien" :disabled="errorSerie !== '' || errorInventario !== ''">{{ bien ? 'Guardar cambios' : 'Guardar' }}</AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { Bien } from '@/composables/useBienesData'
import { ORIGEN_OPCIONES, useBienesData } from '@/composables/useBienesData'
import { useCatalogosData } from '@/composables/useCatalogosData'
import { useTiposBienData } from '@/composables/useTiposBienData'
import { resumirCaracteristicas, type ValorCaracteristica } from '@/utils/caracteristicas'
import CampoFoto from '@/components/bienes/CampoFoto.vue'
import CaracteristicaInput from '@/components/bienes/CaracteristicaInput.vue'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const { nombresTipos, tipos } = useTiposBienData()
const { existeNumeroSerie, existeNumeroInventario } = useBienesData()
const { activas } = useCatalogosData()

const ICONO_ALTA = 'M12 4.5v15m7.5-7.5h-15'
const ICONO_EDITAR =
  'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125'

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'

const props = defineProps<{
  /** null/undefined = alta; con un bien = edición */
  bien?: Bien | null
}>()

const open = defineModel<boolean>('open', { required: true })

const emit = defineEmits<{
  guardar: [bien: Omit<Bien, 'id'>]
}>()

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function formDesde(bien?: Bien | null) {
  if (!bien) return formVacio()
  return {
    tipoBien: bien.nombre,
    marca: bien.marca,
    modelo: bien.modelo,
    numeroSerie: bien.numeroSerie,
    numeroInventario: bien.numeroInventario,
    fechaAlta: bien.fechaAlta,
    // Un bien heredado (sin valores estructurados) conserva su texto libre como observaciones.
    observaciones: bien.observaciones ?? (bien.valores ? '' : bien.caracteristicas),
    valores: { ...bien.valores } as Record<string, ValorCaracteristica | undefined>,
    valorAdquisicion: (bien.valorAdquisicion ?? '') as number | '',
    mesesGarantia: bien.mesesGarantia,
    inventariable: bien.inventariable,
    origen: bien.origen ?? '',
    numeroFactura: bien.numeroFactura ?? '',
    fechaFactura: bien.fechaFactura ?? '',
    mesaAyuda: bien.mesaAyuda ?? '',
    ubicacion: bien.ubicacion ?? '',
    direccion: bien.direccion ?? '',
    departamento: bien.departamento ?? '',
    foto: bien.foto,
  }
}

function formVacio() {
  return {
    tipoBien: '',
    marca: '',
    modelo: '',
    numeroSerie: '',
    numeroInventario: '',
    fechaAlta: today(),
    observaciones: '',
    valores: {} as Record<string, ValorCaracteristica | undefined>,
    valorAdquisicion: '' as number | '',
    mesesGarantia: 12,
    inventariable: true,
    origen: '',
    numeroFactura: '',
    fechaFactura: '',
    mesaAyuda: '',
    ubicacion: '',
    direccion: '',
    departamento: '',
    foto: undefined as string | undefined,
  }
}

const form = reactive(formVacio())

// Cada vez que se abre parte del bien a editar (o vacío si es un alta).
watch(open, (isOpen) => {
  if (isOpen) Object.assign(form, formDesde(props.bien))
})

// Cambiar de tipo descarta los valores del tipo anterior (sus características no aplican).
const tipoSeleccionado = computed({
  get: () => form.tipoBien,
  set: (valor: string) => {
    if (valor !== form.tipoBien) form.valores = {}
    form.tipoBien = valor
  },
})

const definiciones = computed(() => tipos.find((tipo) => tipo.descripcion === form.tipoBien)?.caracteristicas ?? [])

// Los bienes heredados (sin valores estructurados) no se bloquean por campos obligatorios al editarlos.
const exigirRequeridas = computed(() => !props.bien || props.bien.valores !== undefined)

// El número de serie y el de inventario identifican a un solo bien: no se admiten repetidos (alta ni edición).
const errorSerie = computed(() => (existeNumeroSerie(form.numeroSerie, props.bien?.id) ? 'Ya existe otro bien con este número de serie.' : ''))
const errorInventario = computed(() =>
  existeNumeroInventario(form.numeroInventario, props.bien?.id) ? 'Ya existe otro bien con este número de inventario.' : '',
)

const titulo = computed(() => (props.bien ? 'Editar bien' : 'Agregar bien'))
const subtitulo = computed(() =>
  props.bien ? `${props.bien.nombre} · ${props.bien.numeroInventario || 'sin inventario'}` : 'Completa los datos para dar de alta un nuevo bien',
)

// Un bien asignado toma su ubicación del responsable: solo Reasignar la cambia.
const ubicacionBloqueada = computed(() => props.bien?.estatus === 'Asignado')

// Si el valor actual ya no está activo en el catálogo, se sigue mostrando para no perderlo al editar.
function conActual(lista: string[], actual: string): string[] {
  return actual && !lista.includes(actual) ? [actual, ...lista] : lista
}
const opcionesTipo = computed(() => conActual(nombresTipos.value, form.tipoBien))
const opcionesUbicacion = computed(() => conActual(activas.ubicaciones, form.ubicacion))
const opcionesDireccion = computed(() => conActual(activas.direcciones, form.direccion))
const opcionesDepartamento = computed(() => conActual(activas.departamentos, form.departamento))

function cerrar() {
  open.value = false
}

function guardar() {
  if (errorSerie.value !== '' || errorInventario.value !== '') return
  const valores: Record<string, ValorCaracteristica> = {}
  for (const def of definiciones.value) {
    const valor = form.valores[def.id]
    if (valor !== undefined && valor !== '') valores[def.id] = valor
  }
  const hayValores = Object.keys(valores).length > 0

  emit('guardar', {
    nombre: form.tipoBien,
    marca: form.marca,
    modelo: form.modelo,
    numeroSerie: form.numeroSerie,
    numeroInventario: form.numeroInventario,
    fechaAlta: form.fechaAlta || today(),
    caracteristicas: resumirCaracteristicas(definiciones.value, valores, form.observaciones),
    valores: hayValores ? valores : undefined,
    observaciones: form.observaciones.trim() || undefined,
    valorAdquisicion: form.valorAdquisicion === '' ? undefined : Number(form.valorAdquisicion),
    mesesGarantia: form.mesesGarantia || 0,
    estatus: props.bien?.estatus ?? 'Por asignar',
    responsable: props.bien?.responsable,
    inventariable: form.inventariable,
    origen: form.origen || undefined,
    numeroFactura: form.numeroFactura || undefined,
    fechaFactura: form.fechaFactura || undefined,
    mesaAyuda: form.mesaAyuda || undefined,
    ubicacion: form.ubicacion || undefined,
    direccion: form.direccion || undefined,
    departamento: form.departamento || undefined,
    foto: form.foto,
  })
  cerrar()
}
</script>
