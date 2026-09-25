<template>
  <div class="space-y-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
    <div>
      <label class="mb-1.5 block text-sm font-semibold text-slate-700" :for="`${id}-username`">Usuario <span class="text-rose-500">*</span></label>
      <input
        :id="`${id}-username`"
        v-model="username"
        type="text"
        placeholder="Ej. ricardo.pena"
        autocomplete="off"
        spellcheck="false"
        :class="INPUT"
        data-doc="acceso-username"
      />
      <p v-if="errorUsuario" role="alert" data-doc="error-acceso-username" class="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{{ errorUsuario }}</p>
    </div>

    <CampoPassword :id="`${id}-password`" v-model="password" />

    <p class="text-xs text-slate-500">
      Rol: <span class="font-semibold text-amber-700">Técnico</span>. Solo verá y concluirá los mantenimientos que se le asignen.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useCuentasData } from '@/composables/useCuentasData'
import CampoPassword from './CampoPassword.vue'

const props = defineProps<{
  id: string
  /** Nombre del técnico, para sugerir el usuario */
  nombre: string
}>()

const username = defineModel<string>('username', { required: true })
const password = defineModel<string>('password', { required: true })

const { errorUsername, sugerirUsername } = useCuentasData()

const INPUT =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:ring-2 focus:ring-blue-500/30'

const errorUsuario = computed(() => errorUsername(username.value))

onMounted(() => {
  if (username.value === '') username.value = sugerirUsername(props.nombre)
})
</script>
