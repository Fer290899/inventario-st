<template>
  <div>
    <label class="mb-1.5 block text-sm font-medium text-slate-700" :for="id">{{ label }}</label>

    <div v-if="model" class="flex items-center gap-3">
      <img :src="model" alt="Foto del bien" class="h-20 w-20 rounded-lg border border-slate-200 object-cover" />
      <AppButton variant="secondary" type="button" size="sm" data-doc="quitar-foto" @click="quitar">Quitar foto</AppButton>
    </div>
    <div v-else>
      <AppButton variant="secondary" type="button" size="sm" data-doc="elegir-foto" @click="inputRef?.click()">Elegir imagen</AppButton>
      <input :id="id" ref="inputRef" type="file" accept="image/*" data-doc="campo-foto" class="sr-only" @change="onSeleccionar" />
    </div>

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

const inputRef = ref<HTMLInputElement | null>(null)
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
