<template>
  <div>
    <label class="mb-1.5 block text-sm font-semibold text-slate-700" :for="id">{{ label }} <span class="text-rose-500">*</span></label>
    <div class="flex gap-2">
      <input
        :id="id"
        v-model="model"
        :type="visible ? 'text' : 'password'"
        autocomplete="new-password"
        spellcheck="false"
        :class="INPUT"
        :aria-invalid="error !== ''"
        data-doc="campo-password"
      />
      <AppButton variant="secondary" type="button" data-doc="mostrar-password" @click="visible = !visible">{{ visible ? 'Ocultar' : 'Mostrar' }}</AppButton>
      <AppButton variant="secondary" type="button" data-doc="generar-password" @click="generar">Generar</AppButton>
    </div>
    <p v-if="error" role="alert" class="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{{ error }}</p>
    <p v-else class="mt-1 text-xs text-slate-400">Comunícasela a la persona: no se vuelve a mostrar.</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { errorPassword, generarPassword } from '@/utils/password'
import AppButton from '@/components/ui/AppButton.vue'

withDefaults(defineProps<{ id: string; label?: string }>(), { label: 'Contraseña' })

const model = defineModel<string>({ required: true })

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30'

const visible = ref(false)
// Solo se reprocha una contraseña ya escrita; un campo vacío no muestra error mientras se llena.
const error = computed(() => (model.value === '' ? '' : errorPassword(model.value)))

function generar() {
  model.value = generarPassword()
  visible.value = true
}
</script>
