<template>
  <div class="flex min-h-screen w-full items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-8 text-center">
      <p class="text-5xl font-bold text-slate-300">404</p>
      <h1 class="mt-3 text-lg font-semibold text-slate-800">Esta página no existe</h1>
      <p class="mt-1.5 text-sm text-slate-500">Puede que el enlace esté mal escrito o que la página se haya movido.</p>
      <AppButton class="mt-6 w-full" @click="irAlInicio">{{ estaAutenticado ? 'Volver al dashboard' : 'Ir al inicio de sesión' }}</AppButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const { estaAutenticado } = useAuth()

function irAlInicio() {
  router.push(estaAutenticado.value ? '/dashboard' : '/login')
}
</script>
