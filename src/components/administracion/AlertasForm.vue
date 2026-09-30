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

    <div class="border-t border-slate-200 pt-4">
      <p class="mb-1.5 text-sm font-semibold text-slate-700">Silenciar alertas</p>
      <p class="mb-3 text-xs text-slate-500">Los tipos marcados dejan de mostrarse en la campana y en el panel, aunque se cumpla su condición.</p>
      <div class="space-y-2">
        <label v-for="foco in FOCOS" :key="foco" class="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            :checked="form.silenciados.includes(foco)"
            class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/40"
            @change="alternarSilenciado(foco)"
          />
          {{ FOCO_ETIQUETAS[foco] }}
        </label>
      </div>
    </div>

    <div class="flex justify-end gap-2">
      <AppButton variant="secondary" :disabled="!hayCambios" @click="restablecer">Descartar cambios</AppButton>
      <AppButton type="submit" :disabled="!puedeGuardar">Guardar cambios</AppButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { FOCO_ETIQUETAS, useAlertasData, type FocoAlerta, type UmbralesAlertas } from '@/composables/useAlertasData'
import { useToast } from '@/composables/useToast'
import AppButton from '@/components/ui/AppButton.vue'

const { umbrales, actualizarUmbrales } = useAlertasData()
const toast = useToast()

const INPUT =
  'rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'

const CAMPOS: Array<{ clave: keyof Pick<UmbralesAlertas, 'diasAvisoPreventivo' | 'diasAvisoGarantia' | 'diasCorrectivoAtorado'>; etiqueta: string; ayuda: string }> = [
  { clave: 'diasAvisoPreventivo', etiqueta: 'Aviso de preventivo próximo', ayuda: 'Se avisa cuando la fecha del preventivo está a este número de días o menos.' },
  { clave: 'diasAvisoGarantia', etiqueta: 'Aviso de garantía por vencer', ayuda: 'Se avisa cuando a la garantía de un bien le quedan estos días o menos.' },
  { clave: 'diasCorrectivoAtorado', etiqueta: 'Correctivo atorado', ayuda: 'Un correctivo sin concluir después de estos días se marca como atorado.' },
]

const FOCOS: FocoAlerta[] = ['preventivo-vencido', 'preventivo-proximo', 'correctivo-atorado', 'garantia-por-vencer']

const form = reactive<{ diasAvisoPreventivo: number | ''; diasAvisoGarantia: number | ''; diasCorrectivoAtorado: number | ''; silenciados: FocoAlerta[] }>({
  diasAvisoPreventivo: umbrales.diasAvisoPreventivo,
  diasAvisoGarantia: umbrales.diasAvisoGarantia,
  diasCorrectivoAtorado: umbrales.diasCorrectivoAtorado,
  silenciados: [...umbrales.silenciados],
})

function valido(clave: (typeof CAMPOS)[number]['clave']): boolean {
  const valor = form[clave]
  return typeof valor === 'number' && Number.isInteger(valor) && valor >= 1 && valor <= 365
}

function alternarSilenciado(foco: FocoAlerta) {
  const indice = form.silenciados.indexOf(foco)
  if (indice === -1) form.silenciados.push(foco)
  else form.silenciados.splice(indice, 1)
}

const mismosSilenciados = computed(
  () => form.silenciados.length === umbrales.silenciados.length && form.silenciados.every((foco) => umbrales.silenciados.includes(foco)),
)
const hayCambios = computed(() => CAMPOS.some((campo) => form[campo.clave] !== umbrales[campo.clave]) || !mismosSilenciados.value)
const puedeGuardar = computed(() => hayCambios.value && CAMPOS.every((campo) => valido(campo.clave)))

function restablecer() {
  form.diasAvisoPreventivo = umbrales.diasAvisoPreventivo
  form.diasAvisoGarantia = umbrales.diasAvisoGarantia
  form.diasCorrectivoAtorado = umbrales.diasCorrectivoAtorado
  form.silenciados = [...umbrales.silenciados]
}

function guardar() {
  if (!puedeGuardar.value) return
  actualizarUmbrales({
    diasAvisoPreventivo: form.diasAvisoPreventivo as number,
    diasAvisoGarantia: form.diasAvisoGarantia as number,
    diasCorrectivoAtorado: form.diasCorrectivoAtorado as number,
    silenciados: form.silenciados,
  })
  toast.success('Umbrales de alertas actualizados')
}
</script>
