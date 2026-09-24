<template>
  <form class="max-w-2xl space-y-4 p-6" @submit.prevent="guardar">
    <div v-for="campo in CAMPOS" :key="campo.clave">
      <label class="mb-1.5 block text-sm font-semibold text-slate-700" :for="`alertas-${campo.clave}`">{{ campo.etiqueta }}</label>
      <div class="flex items-center gap-2">
        <input
          :id="`alertas-${campo.clave}`"
          v-model.number="form[campo.clave]"
          type="number"
          min="1"
          max="365"
          step="1"
          inputmode="numeric"
          :class="[INPUT, 'w-32']"
          :aria-invalid="!valido(campo.clave)"
        />
        <span class="text-sm text-slate-500">días</span>
      </div>
      <p class="mt-1 text-xs" :class="valido(campo.clave) ? 'text-slate-400' : 'text-rose-600'" :role="valido(campo.clave) ? undefined : 'alert'">
        {{ valido(campo.clave) ? campo.ayuda : 'Ingresa un número entero entre 1 y 365.' }}
      </p>
    </div>

    <div class="flex justify-end gap-2">
      <AppButton variant="secondary" :disabled="!hayCambios" @click="restablecer">Descartar cambios</AppButton>
      <AppButton type="submit" :disabled="!puedeGuardar">Guardar cambios</AppButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useAlertasData, type UmbralesAlertas } from '@/composables/useAlertasData'
import { useToast } from '@/composables/useToast'
import AppButton from '@/components/ui/AppButton.vue'

const { umbrales, actualizarUmbrales } = useAlertasData()
const toast = useToast()

const INPUT =
  'rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'

const CAMPOS: Array<{ clave: keyof UmbralesAlertas; etiqueta: string; ayuda: string }> = [
  { clave: 'diasAvisoPreventivo', etiqueta: 'Aviso de preventivo próximo', ayuda: 'Se avisa cuando la fecha del preventivo está a este número de días o menos.' },
  { clave: 'diasAvisoGarantia', etiqueta: 'Aviso de garantía por vencer', ayuda: 'Se avisa cuando a la garantía de un bien le quedan estos días o menos.' },
  { clave: 'diasCorrectivoAtorado', etiqueta: 'Correctivo atorado', ayuda: 'Un correctivo sin concluir después de estos días se marca como atorado.' },
]

const form = reactive<Record<keyof UmbralesAlertas, number | ''>>({ ...umbrales })

function valido(clave: keyof UmbralesAlertas): boolean {
  const valor = form[clave]
  return typeof valor === 'number' && Number.isInteger(valor) && valor >= 1 && valor <= 365
}

const hayCambios = computed(() => CAMPOS.some((campo) => form[campo.clave] !== umbrales[campo.clave]))
const puedeGuardar = computed(() => hayCambios.value && CAMPOS.every((campo) => valido(campo.clave)))

function restablecer() {
  Object.assign(form, umbrales)
}

function guardar() {
  if (!puedeGuardar.value) return
  actualizarUmbrales({
    diasAvisoPreventivo: form.diasAvisoPreventivo as number,
    diasAvisoGarantia: form.diasAvisoGarantia as number,
    diasCorrectivoAtorado: form.diasCorrectivoAtorado as number,
  })
  toast.success('Umbrales de alertas actualizados')
}
</script>
