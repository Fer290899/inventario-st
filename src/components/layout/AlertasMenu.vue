<template>
  <div ref="raizRef" class="relative" @keydown.esc="abierto = false">
    <button
      type="button"
      :title="`Alertas: ${resumen.total}`"
      :aria-label="`Alertas: ${resumen.total}`"
      :aria-expanded="abierto"
      aria-haspopup="true"
      class="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
      @click="abierto = !abierto"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      <span
        v-if="resumen.total > 0"
        data-doc="insignia-alertas"
        class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums text-white"
        :class="resumen.criticas > 0 ? 'bg-rose-600' : 'bg-amber-500'"
      >
        {{ resumen.total > 99 ? '99+' : resumen.total }}
      </span>
    </button>

    <Transition name="fade">
      <div
        v-if="abierto"
        role="menu"
        class="fixed inset-x-4 top-16 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-96"
      >
        <div class="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <p class="text-sm font-semibold text-slate-800">Alertas</p>
          <p class="text-xs text-slate-500">
            {{ resumen.total }} {{ resumen.total === 1 ? 'activa' : 'activas' }}<template v-if="resumen.criticas > 0"> · {{ resumen.criticas }} {{ resumen.criticas === 1 ? 'crítica' : 'críticas' }}</template>
          </p>
        </div>

        <ul v-if="principales.length > 0" class="max-h-80 divide-y divide-slate-100 overflow-auto" data-doc="menu-alertas">
          <li v-for="alerta in principales" :key="alerta.id">
            <button
              type="button"
              role="menuitem"
              class="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
              @click="abrir(alerta)"
            >
              <span class="mt-1 h-2 w-2 shrink-0 rounded-full" :class="alerta.severidad === 'critica' ? 'bg-rose-500' : 'bg-amber-400'"></span>
              <span class="min-w-0 flex-1">
                <span class="block text-sm font-medium text-slate-800 sm:truncate">{{ alerta.titulo }}</span>
                <span class="block text-xs text-slate-500 sm:truncate">{{ alerta.detalle }}</span>
              </span>
            </button>
          </li>
        </ul>
        <p v-else class="px-4 py-8 text-center text-sm text-slate-400">Todo al día: no hay alertas activas.</p>

        <div class="border-t border-slate-100 bg-slate-50 px-4 py-2.5">
          <button type="button" class="w-full text-center text-sm font-medium text-blue-700 hover:text-blue-800 focus-visible:outline-none focus-visible:underline" @click="verTodas">
            Ver todas en el panel
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAlertasData, type Alerta } from '@/composables/useAlertasData'

const MAX_EN_MENU = 6

const { alertas, resumen } = useAlertasData()
const router = useRouter()

const abierto = ref(false)
const raizRef = ref<HTMLElement | null>(null)

const principales = computed(() => alertas.value.slice(0, MAX_EN_MENU))

function cerrarSiEsFuera(evento: MouseEvent) {
  if (raizRef.value && !raizRef.value.contains(evento.target as Node)) abierto.value = false
}

onMounted(() => document.addEventListener('mousedown', cerrarSiEsFuera))
onBeforeUnmount(() => document.removeEventListener('mousedown', cerrarSiEsFuera))

function abrir(alerta: Alerta) {
  abierto.value = false
  router.push(alerta.destino)
}

// El panel vive en el Dashboard: si aún no se montó (ruta con carga diferida), se reintenta unos cuadros.
async function verTodas() {
  abierto.value = false
  await router.push('/dashboard/home')
  for (let intento = 0; intento < 20; intento += 1) {
    const panel = document.getElementById('panel-alertas')
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }
    await new Promise((resolver) => requestAnimationFrame(resolver))
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
