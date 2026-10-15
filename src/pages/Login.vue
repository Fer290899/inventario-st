<template>
  <div class="flex min-h-screen w-full bg-slate-50">
    <!-- Marca: una pila de carpetas, sin datos. Solo en pantallas anchas. -->
    <section class="relative hidden min-w-0 flex-1 basis-[560px] flex-col justify-between overflow-hidden bg-slate-900 px-14 pt-10 text-white lg:flex">
      <div class="flex items-center gap-3">
        <MarcaCarpeta />
        <span class="text-lg font-semibold tracking-tight">InventarioST</span>
      </div>

      <div class="max-w-[26rem]">
        <p class="text-3xl font-semibold leading-tight tracking-tight">Bienes, resguardos y mantenimientos en un solo registro.</p>
        <p class="mt-3.5 text-base leading-relaxed text-ink-muted">Entra para consultar dónde está cada bien, quién lo tiene y qué mantenimiento le toca.</p>
      </div>

      <div class="relative mt-12 h-[250px] w-full max-w-[32.5rem]" aria-hidden="true">
        <div
          v-for="carpeta in CARPETAS"
          :key="carpeta.top"
          class="absolute inset-x-0 h-60 rounded-t-lg"
          :style="{ top: `${carpeta.top}px`, background: carpeta.color }"
        >
          <span class="absolute -top-5 h-5 rounded-t-lg" :style="{ left: carpeta.izquierda, width: carpeta.ancho, background: carpeta.color }"></span>
          <span
            v-if="carpeta.rotulo"
            class="absolute -top-5 flex h-5 items-center whitespace-nowrap px-3.5 text-xs font-semibold text-slate-900"
            :style="{ left: carpeta.izquierda }"
          >
            {{ carpeta.rotulo }}
          </span>
        </div>
      </div>
    </section>

    <!-- Formulario -->
    <section class="flex min-w-0 flex-1 basis-[480px] flex-col items-center justify-center gap-7 px-6 py-12">
      <div class="flex items-center gap-3 lg:hidden">
        <MarcaCarpeta />
        <span class="text-lg font-semibold tracking-tight text-slate-900">InventarioST</span>
      </div>

      <div class="w-full max-w-[25rem]">
        <p class="inline-block rounded-t-lg bg-manila-200 px-5 pb-[9px] pt-2.5 text-[15px] font-semibold text-slate-900">Acceso</p>
        <div class="rounded-b rounded-tr border border-t-2 border-slate-200 border-t-manila-200 bg-white px-8 pb-6 pt-8">
          <h1 class="page-title text-[1.75rem]!">Iniciar sesión</h1>
          <p class="mb-6 mt-2 text-[15px] text-slate-500">Ingresa con tu usuario del sistema.</p>

          <!-- Falla de credenciales o cuenta inactiva -->
          <div v-if="errorMessage" role="alert" class="mb-5 rounded-lg border border-rose-300 bg-rose-50 px-3.5 py-3 text-sm leading-snug text-rose-800">
            <strong class="font-semibold">{{ errorMessage }}</strong>
            <template v-if="sugerirRevision"> Revisa que escribiste bien tu usuario y que no tienes Bloq Mayús activado.</template>
          </div>

          <form class="space-y-5" novalidate @submit.prevent="handleLogin">
            <div>
              <label for="username" class="mb-1.5 block text-sm font-medium text-slate-900">Usuario</label>
              <input
                id="username"
                v-model="form.username"
                type="text"
                autocomplete="username"
                autocapitalize="none"
                spellcheck="false"
                :aria-invalid="errores.username ? 'true' : 'false'"
                :aria-describedby="errores.username ? 'username-error' : undefined"
                class="h-11 w-full rounded-lg border bg-white px-3.5 text-[15px] text-slate-900 outline-none transition focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
                :class="errores.username ? 'border-rose-600 ring-1 ring-rose-600' : 'border-slate-500'"
                @input="errores.username = false"
              />
              <p v-if="errores.username" id="username-error" class="mt-1.5 text-[13px] font-medium text-rose-700">Escribe tu usuario.</p>
            </div>

            <div>
              <label for="password" class="mb-1.5 block text-sm font-medium text-slate-900">Contraseña</label>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  :aria-invalid="errores.password ? 'true' : 'false'"
                  :aria-describedby="descripcionPassword"
                  class="h-11 w-full rounded-lg border bg-white pl-3.5 pr-24 text-[15px] text-slate-900 outline-none transition focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
                  :class="errores.password ? 'border-rose-600 ring-1 ring-rose-600' : 'border-slate-500'"
                  @input="errores.password = false"
                  @keydown="detectarMayusculas"
                  @keyup="detectarMayusculas"
                  @blur="mayusculas = false"
                />
                <button
                  type="button"
                  class="absolute right-1.5 top-1.5 h-8 rounded-md px-2.5 text-[13px] font-semibold text-blue-800 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  :aria-pressed="showPassword"
                  :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? 'Ocultar' : 'Mostrar' }}
                </button>
              </div>
              <p v-if="errores.password" id="password-error" class="mt-1.5 text-[13px] font-medium text-rose-700">Escribe tu contraseña.</p>
              <p v-if="mayusculas" id="password-mayusculas" class="mt-1.5 text-[13px] font-medium text-amber-700">Bloq Mayús está activado.</p>
            </div>

            <label class="flex items-center gap-2.5 text-sm text-slate-800">
              <input id="remember" v-model="form.remember" type="checkbox" class="h-[18px] w-[18px] rounded border-slate-400 text-blue-600 focus:ring-2 focus:ring-blue-600" />
              Mantener la sesión en este equipo
            </label>

            <button
              type="submit"
              :disabled="loading"
              class="flex h-12 w-full items-center justify-center gap-2.5 rounded-lg bg-blue-600 text-[15px] font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <svg v-if="loading" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>{{ loading ? 'Ingresando…' : 'Iniciar sesión' }}</span>
            </button>
          </form>

          <p class="mt-5 border-t border-slate-200 pt-4 text-[13px] leading-snug text-slate-500">
            ¿No recuerdas tu contraseña? Pide a un administrador que la restablezca.
          </p>

          <!-- Cuentas de prueba: solo en desarrollo -->
          <div v-if="esDesarrollo" class="mt-5 rounded-lg border border-dashed border-slate-300 px-3 py-2.5" data-doc="cuentas-demo">
            <p class="mb-1.5 text-xs font-semibold text-slate-500">Cuentas de prueba (solo en desarrollo)</p>
            <ul class="space-y-0.5">
              <li v-for="cuenta in CUENTAS_DEMO" :key="cuenta.username">
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-3 rounded px-2 py-1 text-left text-xs text-slate-700 transition hover:bg-manila-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  @click="usarCuenta(cuenta.username, cuenta.password)"
                >
                  <span class="font-mono">{{ cuenta.username }} / {{ cuenta.password }}</span>
                  <span class="text-slate-500">{{ cuenta.rol }}</span>
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MarcaCarpeta from '@/components/ui/MarcaCarpeta.vue'
import { useAuth } from '@/composables/useAuth'
import { CUENTAS_DEMO } from '@/services/authService'

const router = useRouter()
const route = useRoute()
const { iniciarSesion, rol } = useAuth()

const esDesarrollo = import.meta.env.DEV

// Pila de carpetas (de atrás hacia adelante): la de enfrente lleva el rótulo con los módulos reales.
const CARPETAS = [
  { top: 0, color: '#6B6A4E', izquierda: '4%', ancho: '110px', rotulo: '' },
  { top: 34, color: '#8D8760', izquierda: '25%', ancho: '110px', rotulo: '' },
  { top: 68, color: '#B0A576', izquierda: '46%', ancho: '110px', rotulo: '' },
  { top: 102, color: '#CEBF88', izquierda: '67%', ancho: '110px', rotulo: '' },
  { top: 136, color: '#EBD79B', izquierda: '4%', ancho: '12.25rem', rotulo: 'Bienes · Resguardos · Mantenimiento' },
]

const form = reactive({
  username: '',
  password: '',
  remember: false,
})

const errores = reactive({ username: false, password: false })
const showPassword = ref(false)
const mayusculas = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const sugerirRevision = ref(false)

// aria-describedby del campo de contraseña: el error y el aviso de Bloq Mayús, si están a la vista.
const descripcionPassword = computed(() => {
  const ids = [errores.password ? 'password-error' : '', mayusculas.value ? 'password-mayusculas' : ''].filter(Boolean)
  return ids.length > 0 ? ids.join(' ') : undefined
})

function detectarMayusculas(evento: KeyboardEvent) {
  mayusculas.value = evento.getModifierState?.('CapsLock') ?? false
}

function usarCuenta(username: string, password: string) {
  form.username = username
  form.password = password
  errores.username = false
  errores.password = false
}

// Solo se acepta un destino interno del dashboard, para que ?redirect no sirva de redirección abierta.
function destino(): string {
  const pedido = route.query.redirect
  if (typeof pedido === 'string' && pedido.startsWith('/dashboard')) return pedido
  // Quien entra como técnico trabaja en Mantenimiento: ahí aterriza.
  return rol.value === 'Técnico' ? '/dashboard/mantenimiento' : '/dashboard'
}

async function handleLogin() {
  errorMessage.value = ''
  errores.username = !form.username.trim()
  errores.password = !form.password.trim()
  if (errores.username || errores.password) return

  loading.value = true
  try {
    await iniciarSesion(form.username, form.password, form.remember)
    await router.push(destino())
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No se pudo iniciar sesión.'
    // La sugerencia aplica solo a credenciales incorrectas, no a una cuenta inactiva.
    sugerirRevision.value = errorMessage.value.includes('incorrectos')
  } finally {
    loading.value = false
  }
}
</script>
