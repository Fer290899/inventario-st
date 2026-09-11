<template>
  <div class="relative min-h-screen w-full flex items-center justify-center px-4 py-10 bg-[url('@/assets/fondoLogin.jpg')] bg-cover bg-center">
    <!-- Overlay para dar contraste y ambientar la imagen -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-blue-950/80"></div>

    <!-- Tarjeta de login -->
    <div class="relative w-full max-w-md">
      <div class="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-2xl px-8 py-10 sm:px-10">
        <!-- Encabezado / marca -->
        <div class="flex flex-col items-center text-center mb-8">
          <div class="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/40 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <h1 class="text-2xl font-bold text-white tracking-tight">InventarioST</h1>
          <p class="text-sm text-white/60 mt-1">Ingresa a tu cuenta para continuar</p>
        </div>

        <!-- Mensaje de error -->
        <Transition name="fade">
          <div
            v-if="errorMessage"
            class="mb-5 flex items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span>{{ errorMessage }}</span>
          </div>
        </Transition>

        <form class="space-y-5" @submit.prevent="handleLogin">
          <!-- Usuario -->
          <div>
            <label for="username" class="block text-sm font-medium text-white/80 mb-1.5">Usuario</label>
            <div class="relative">
              <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </span>
              <input
                id="username"
                v-model="form.username"
                type="text"
                autocomplete="username"
                placeholder="Ingresa tu usuario"
                class="w-full rounded-lg border border-white/15 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white placeholder-white/40 outline-none transition focus:border-blue-400/60 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          <!-- Contraseña -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label for="password" class="block text-sm font-medium text-white/80">Contraseña</label>
              <a href="#" class="text-xs font-medium text-blue-300 hover:text-blue-200 transition">¿Olvidaste tu contraseña?</a>
            </div>
            <div class="relative">
              <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-white/40">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </span>
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Ingresa tu contraseña"
                class="w-full rounded-lg border border-white/15 bg-white/5 py-2.5 pl-11 pr-11 text-sm text-white placeholder-white/40 outline-none transition focus:border-blue-400/60 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/40"
              />
              <button
                type="button"
                tabindex="-1"
                class="absolute inset-y-0 right-0 flex items-center pr-3.5 text-white/40 hover:text-white/70 transition"
                @click="showPassword = !showPassword"
              >
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Recordarme -->
          <div class="flex items-center">
            <input
              id="remember"
              v-model="form.remember"
              type="checkbox"
              class="h-4 w-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-0"
            />
            <label for="remember" class="ml-2 text-sm text-white/70 select-none">Recordarme en este equipo</label>
          </div>

          <!-- Botón submit -->
          <button
            type="submit"
            :disabled="loading"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg v-if="loading" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <span>{{ loading ? 'Ingresando...' : 'Iniciar sesión' }}</span>
          </button>
        </form>
      </div>

      <p class="mt-6 text-center text-xs text-white/40">
        © {{ new Date().getFullYear() }} InventarioST · Todos los derechos reservados
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  username: '',
  password: '',
  remember: false,
})

const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')

async function handleLogin() {
  errorMessage.value = ''

  if (!form.username.trim() || !form.password.trim()) {
    errorMessage.value = 'Ingresa tu usuario y contraseña.'
    return
  }

  loading.value = true
  try {
    // TODO: reemplazar por la llamada real a tu servicio/store de autenticación,
    // por ejemplo: await authStore.login(form.username, form.password)
    await new Promise((resolve) => setTimeout(resolve, 900))

    router.push('/dashboard')
  } catch (error) {
    errorMessage.value = 'Usuario o contraseña incorrectos.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
