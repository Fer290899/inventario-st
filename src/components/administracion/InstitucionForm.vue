<template>
  <form class="max-w-2xl space-y-4 p-6" @submit.prevent="guardar">
    <p class="text-sm text-slate-500">Estos datos aparecen en el encabezado de las hojas de resguardo, las fichas de bien y los dictámenes que se imprimen.</p>

    <div>
      <label class="mb-1.5 block text-sm font-semibold text-slate-700" for="institucion-nombre">
        Nombre de la institución <span class="text-rose-500">*</span>
      </label>
      <input id="institucion-nombre" v-model="form.nombre" type="text" autocomplete="off" :class="INPUT" />
    </div>

    <div>
      <label class="mb-1.5 block text-sm font-semibold text-slate-700" for="institucion-area">Área o leyenda</label>
      <input id="institucion-area" v-model="form.area" type="text" placeholder="Ej. Departamento de Tecnologías de la Información" autocomplete="off" :class="INPUT" />
    </div>

    <div>
      <label class="mb-1.5 block text-sm font-semibold text-slate-700" for="institucion-texto">Texto de responsabilidad (hojas de resguardo)</label>
      <textarea id="institucion-texto" v-model="form.textoResponsabilidad" rows="5" :class="INPUT" class="resize-none"></textarea>
    </div>

    <div class="flex justify-end gap-2">
      <AppButton variant="secondary" :disabled="!hayCambios" @click="restablecer">Descartar cambios</AppButton>
      <AppButton type="submit" :disabled="!puedeGuardar">Guardar cambios</AppButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useInstitucionData } from '@/composables/useInstitucionData'
import { useToast } from '@/composables/useToast'
import AppButton from '@/components/ui/AppButton.vue'

const { institucion, actualizarInstitucion } = useInstitucionData()
const toast = useToast()

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'

const form = reactive({ ...institucion })

const hayCambios = computed(
  () =>
    form.nombre !== institucion.nombre || form.area !== institucion.area || form.textoResponsabilidad !== institucion.textoResponsabilidad,
)
const puedeGuardar = computed(() => hayCambios.value && form.nombre.trim() !== '')

function restablecer() {
  Object.assign(form, institucion)
}

function guardar() {
  if (!puedeGuardar.value) return
  actualizarInstitucion({
    nombre: form.nombre.trim(),
    area: form.area.trim(),
    textoResponsabilidad: form.textoResponsabilidad.trim(),
  })
  restablecer()
  toast.success('Datos de la institución actualizados')
}
</script>
