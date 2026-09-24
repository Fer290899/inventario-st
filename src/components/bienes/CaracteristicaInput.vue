<template>
  <div>
    <label :for="idCampo" class="mb-1.5 block text-sm font-medium text-slate-700">
      {{ def.nombre }}<span v-if="def.unidad" class="font-normal text-slate-400"> ({{ def.unidad }})</span>
      <span v-if="exigir && def.requerida" class="text-rose-500"> *</span>
    </label>

    <BaseSelect v-if="def.tipoDato === 'lista'" :id="idCampo" v-model="texto" :required="exigir && def.requerida" :data-caracteristica="def.nombre">
      <option value="">Selecciona una opción</option>
      <option v-if="valorAnterior" :value="valorAnterior">{{ valorAnterior }} (valor anterior)</option>
      <option v-for="opcion in def.opciones ?? []" :key="opcion" :value="opcion">{{ opcion }}</option>
    </BaseSelect>

    <BaseSelect v-else-if="def.tipoDato === 'si-no'" :id="idCampo" v-model="siNo" :data-caracteristica="def.nombre">
      <option value="">—</option>
      <option value="si">Sí</option>
      <option value="no">No</option>
    </BaseSelect>

    <input
      v-else-if="def.tipoDato === 'numero'"
      :id="idCampo"
      v-model="numero"
      type="number"
      step="any"
      min="0"
      :required="exigir && def.requerida"
      :data-caracteristica="def.nombre"
      :class="INPUT"
    />

    <input v-else :id="idCampo" v-model="texto" type="text" :required="exigir && def.requerida" :data-caracteristica="def.nombre" :class="INPUT" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CaracteristicaDef } from '@/composables/useTiposBienData'
import type { ValorCaracteristica } from '@/utils/caracteristicas'
import BaseSelect from '@/components/ui/BaseSelect.vue'

const props = defineProps<{
  def: CaracteristicaDef
  /** Si es true, las características marcadas como obligatorias se exigen al enviar el formulario. */
  exigir: boolean
}>()

const modelo = defineModel<ValorCaracteristica | undefined>({ required: true })

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'

const idCampo = computed(() => `car-${props.def.id}`)

// Texto y lista comparten el valor como cadena; vacío = sin valor.
const texto = computed({
  get: () => (typeof modelo.value === 'string' ? modelo.value : modelo.value === undefined ? '' : String(modelo.value)),
  set: (valor: string) => {
    modelo.value = valor === '' ? undefined : valor
  },
})

const numero = computed({
  get: () => (typeof modelo.value === 'number' ? modelo.value : ''),
  set: (valor: number | string) => {
    modelo.value = valor === '' || valor === null || Number.isNaN(Number(valor)) ? undefined : Number(valor)
  },
})

const siNo = computed({
  get: () => (modelo.value === true ? 'si' : modelo.value === false ? 'no' : ''),
  set: (valor: string) => {
    modelo.value = valor === 'si' ? true : valor === 'no' ? false : undefined
  },
})

// Si la opción guardada ya no está en la lista de la definición, se sigue mostrando para no perderla.
const valorAnterior = computed(() => {
  const valor = modelo.value
  return typeof valor === 'string' && valor !== '' && !(props.def.opciones ?? []).includes(valor) ? valor : ''
})
</script>
