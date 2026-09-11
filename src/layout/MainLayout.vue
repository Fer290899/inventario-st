<template>
  <div class="flex h-screen w-full overflow-hidden bg-slate-50">
    <!-- Overlay móvil -->
    <div
      v-if="mobileOpen"
      class="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
      @click="mobileOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 lg:static lg:translate-x-0"
      :class="[
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        collapsed ? 'lg:w-20' : 'lg:w-64',
      ]"
    >
      <!-- Logo -->
      <div class="flex h-16 shrink-0 items-center gap-3 border-b border-slate-800 px-5">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-900/40">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
        </div>
        <span v-if="!collapsed" class="truncate text-lg font-bold tracking-tight text-white">InventarioST</span>
      </div>

      <!-- Navegación -->
      <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
          :class="isActive(item.to)
            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/30'
            : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'"
          :title="collapsed ? item.label : undefined"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
          </svg>
          <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- Colapsar (solo escritorio) -->
      <button
        type="button"
        class="hidden shrink-0 items-center justify-center gap-2 border-t border-slate-800 py-3 text-slate-400 transition hover:bg-slate-800/80 hover:text-white lg:flex"
        @click="collapsed = !collapsed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 transition-transform duration-300" :class="{ 'rotate-180': collapsed }" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>

      <!-- Usuario -->
      <div class="shrink-0 border-t border-slate-800 p-3">
        <div class="flex items-center gap-3 rounded-lg px-2 py-2" :class="collapsed ? 'justify-center' : ''">
          <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-semibold text-white">
            US
          </div>
          <div v-if="!collapsed" class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-white">Usuario</p>
            <p class="truncate text-xs text-slate-400">Administrador</p>
          </div>
          <button
            v-if="!collapsed"
            type="button"
            title="Cerrar sesión"
            class="shrink-0 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            @click="handleLogout"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0110.5 3h6a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0116.5 21h-6a2.25 2.25 0 01-2.25-2.25V15m-3 0l-3-3m0 0l3-3m-3 3H15" />
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Columna principal -->
    <div class="flex min-w-0 flex-1 flex-col">
      <!-- Toolbar / Header -->
      <header class="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
            @click="mobileOpen = true"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <h1 class="text-lg font-semibold text-slate-800">{{ pageTitle }}</h1>
        </div>

        <div class="flex items-center gap-2 sm:gap-4">
          <!-- Buscador -->
          <div class="relative hidden md:block">
            <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Buscar..."
              class="w-56 rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400/60 focus:bg-white focus:ring-2 focus:ring-blue-500/30"
            />
          </div>

          <!-- Notificaciones -->
          <button type="button" class="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <span class="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600"></span>
          </button>

          <div class="h-8 w-px bg-slate-200"></div>

          <!-- Avatar -->
          <div class="flex items-center gap-2">
            <div class="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-semibold text-white">
              US
            </div>
            <span class="hidden text-sm font-medium text-slate-700 sm:block">Usuario</span>
          </div>
        </div>
      </header>

      <!-- Contenido (pages) -->
      <main class="flex-1 overflow-y-auto">
        <div class="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'

interface NavItem {
  label: string
  to: string
  icon: string
}

const route = useRoute()
const router = useRouter()

const collapsed = ref(false)
const mobileOpen = ref(false)

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    to: '/dashboard',
    icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  },
  {
    label: 'Productos',
    to: '/productos',
    icon: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
  },
  {
    label: 'Categorías',
    to: '/categorias',
    icon: 'M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.83.699 2.529 0l4.318-4.318a1.79 1.79 0 000-2.529l-9.581-9.581A2.25 2.25 0 009.568 3zM6 6h.008v.008H6V6z',
  },
  {
    label: 'Movimientos',
    to: '/movimientos',
    icon: 'M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5',
  },
  {
    label: 'Proveedores',
    to: '/proveedores',
    icon: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z',
  },
  {
    label: 'Reportes',
    to: '/reportes',
    icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  },
  {
    label: 'Configuración',
    to: '/configuracion',
    icon: 'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.752.43.992l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.752-.43-.992l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
  },
]

const pageTitle = computed(() => {
  const metaTitle = route.meta?.title as string | undefined
  return metaTitle ?? navItems.find((item) => isActive(item.to))?.label ?? 'Panel'
})

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}

function handleLogout() {
  // TODO: reemplazar por la llamada real a tu store de autenticación,
  // ej. authStore.logout()
  router.push('/login')
}

// Cierra el drawer móvil al navegar
watch(
  () => route.path,
  () => {
    mobileOpen.value = false
  },
)
</script>
