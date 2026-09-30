<template>
  <div>
    <label class="mb-1.5 block text-sm font-medium text-slate-700" :for="id">{{ label }}</label>

    <div v-if="model" class="flex items-center gap-3">
      <img :src="model" alt="Foto del bien" class="h-20 w-20 rounded-lg border border-slate-200 object-cover" />
      <AppButton variant="secondary" type="button" size="sm" data-doc="quitar-foto" @click="quitar">Quitar foto</AppButton>
    </div>
    <input v-else :id="id" type="file" accept="image/*" data-doc="campo-foto" :class="INPUT" @change="onSeleccionar" />

    <p v-if="error" role="alert" class="mt-1.5 text-xs text-rose-600" data-doc="error-foto">{{ error }}</p>
    <p v-else class="mt-1 text-xs text-slate-400">Opcional, máximo {{ TAMANO_MAXIMO_MB }} MB.</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'

withDefaults(defineProps<{ id?: string; label?: string }>(), { id: 'campo-foto', label: 'Foto del bien (opcional)' })

const model = defineModel<string | undefined>()

const TAMANO_MAXIMO_MB = 2
const TAMANO_MAXIMO_BYTES = TAMANO_MAXIMO_MB * 1024 * 1024

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-300 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'

const error = ref('')

function onSeleccionar(evento: Event) {
  error.value = ''
  const input = evento.target as HTMLInputElement
  const archivo = input.files?.[0]
  if (!archivo) return

  if (!archivo.type.startsWith('image/')) {
    error.value = 'Elige un archivo de imagen.'
    input.value = ''
    return
  }
  if (archivo.size > TAMANO_MAXIMO_BYTES) {
    error.value = `La imagen pesa demasiado; usa una de máximo ${TAMANO_MAXIMO_MB} MB.`
    input.value = ''
    return
  }

  const lector = new FileReader()
  lector.onload = () => {
    model.value = typeof lector.result === 'string' ? lector.result : undefined
  }
  lector.onerror = () => {
    error.value = 'No se pudo leer la imagen. Intenta con otro archivo.'
  }
  lector.readAsDataURL(archivo)
}

function quitar() {
  model.value = undefined
  error.value = ''
}
</script>
