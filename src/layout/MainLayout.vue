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
      class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 lg:static! lg:translate-x-0"
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
        <template v-for="item in navItems" :key="item.label">
          <!-- Enlace simple -->
          <RouterLink
            v-if="item.type === 'link'"
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

          <!-- Grupo desplegable -->
          <div v-else>
            <button
              type="button"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition"
              :class="isGroupActive(item) || isGroupOpen(item.label)
                ? 'bg-slate-800/80 text-white'
                : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'"
              :title="collapsed ? item.label : undefined"
              @click="toggleGroup(item.label)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
              </svg>
              <span v-if="!collapsed" class="flex-1 truncate text-left">{{ item.label }}</span>
              <svg
                v-if="!collapsed"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 shrink-0 transition-transform duration-300"
                :class="{ 'rotate-180': isGroupOpen(item.label) }"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            <div
              v-if="!collapsed"
              class="grid transition-all duration-300 ease-in-out"
              :class="isGroupOpen(item.label) ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
            >
              <div class="overflow-hidden">
                <div class="ml-5 mt-1 space-y-0.5 border-l border-slate-800 pl-4">
                  <RouterLink
                    v-for="child in item.children"
                    :key="child.to"
                    :to="child.to"
                    class="flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium transition"
                    :class="isActive(child.to)
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'"
                  >
                    <span class="truncate">{{ child.label }}</span>
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>
        </template>
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
      <main class="min-w-0 flex-1 overflow-y-auto">
        <div class="min-w-0 p-4 sm:p-6 lg:p-8">
          <RouterView />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'

interface NavChild {
  label: string
  to: string
}

interface NavLink {
  type: 'link'
  label: string
  to: string
  icon: string
}

interface NavGroup {
  type: 'group'
  label: string
  icon: string
  children: NavChild[]
}

type NavItem = NavLink | NavGroup

const route = useRoute()
const router = useRouter()

const collapsed = ref(false)
const mobileOpen = ref(false)
const openGroups = ref<Set<string>>(new Set())

const navItems: NavItem[] = [
  {
    type: 'link',
    label: 'Dashboard',
    to: '/dashboard/home',
    icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25',
  },
  {
    type: 'group',
    label: 'Bienes',
    icon: 'M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9',
    children: [
      { label: 'Lista de Bienes', to: '/dashboard/bienes' },
      { label: 'Asignación/Reasignación', to: '/dashboard/bienes/asignacion' },
      { label: 'Hoja de resguardo', to: '/dashboard/bienes/resguardo' },
      { label: 'Hojas de Entrega', to: '/dashboard/bienes/entrega' },
      { label: 'Agregar un tipo de bien', to: '/dashboard/bienes/tipos/nuevo' },
    ],
  },
  {
    type: 'group',
    label: 'Mantenimiento',
    icon: 'M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L1.5 3l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z',
    children: [
      { label: 'Preventivo', to: '/dashboard/mantenimiento/preventivo' },
      { label: 'Correctivo', to: '/dashboard/mantenimiento/correctivo' },
      { label: 'Dictámenes', to: '/dashboard/mantenimiento/dictamenes' },
    ],
  },
  {
    type: 'group',
    label: 'Administración',
    icon: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
    children: [
      { label: 'Ubicación', to: '/dashboard/administracion/ubicacion' },
      { label: 'Dirección', to: '/dashboard/administracion/direccion' },
      { label: 'Departamento', to: '/dashboard/administracion/departamento' },
      { label: 'Usuarios', to: '/dashboard/administracion/usuarios' },
    ],
  },
]

const pageTitle = computed(() => {
  const metaTitle = route.meta?.title as string | undefined
  if (metaTitle) return metaTitle

  for (const item of navItems) {
    if (item.type === 'link' && isActive(item.to)) return item.label
    if (item.type === 'group') {
      const activeChild = item.children.find((child) => isActive(child.to))
      if (activeChild) return activeChild.label
    }
  }
  return 'Panel'
})

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}

function isGroupActive(group: NavGroup) {
  return group.children.some((child) => isActive(child.to))
}

function isGroupOpen(label: string) {
  return openGroups.value.has(label)
}

function toggleGroup(label: string) {
  if (collapsed.value) collapsed.value = false

  const next = new Set(openGroups.value)
  if (next.has(label)) next.delete(label)
  else next.add(label)
  openGroups.value = next
}

function handleLogout() {
  // TODO: reemplazar por la llamada real a tu store de autenticación,
  // ej. authStore.logout()
  router.push('/login')
}

// Abre automáticamente el grupo de la ruta activa y cierra el drawer móvil al navegar
watch(
  () => route.path,
  () => {
    for (const item of navItems) {
      if (item.type === 'group' && isGroupActive(item)) {
        openGroups.value = new Set(openGroups.value).add(item.label)
      }
    }
    mobileOpen.value = false
  },
  { immediate: true },
)
</script>
