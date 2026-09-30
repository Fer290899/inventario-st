<template>
  <div ref="raizRef" class="relative hidden md:block" @keydown.esc="abierto = false">
    <SearchInput v-model="texto" placeholder="Buscar bienes, responsables, folios..." class="w-72" />

    <Transition name="fade">
      <div
        v-if="abierto && termino.length >= MIN_CARACTERES"
        role="menu"
        class="absolute left-0 top-full z-50 mt-2 w-96 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
      >
        <template v-if="hayResultados">
          <div v-if="resultadosBienes.length > 0" class="border-b border-slate-100 py-1.5">
            <p class="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Bienes</p>
            <button
              v-for="bien in resultadosBienes"
              :key="bien.id"
              type="button"
              role="menuitem"
              class="flex w-full flex-col px-4 py-2 text-left transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
              @click="irABien(bien)"
            >
              <span class="truncate text-sm font-medium text-slate-800">{{ bien.nombre }} {{ bien.marca }}</span>
              <span class="truncate text-xs text-slate-500">{{ bien.numeroInventario || bien.numeroSerie || 'Sin inventario' }}</span>
            </button>
          </div>

          <div v-if="resultadosResponsables.length > 0" class="border-b border-slate-100 py-1.5">
            <p class="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Responsables</p>
            <button
              v-for="usuario in resultadosResponsables"
              :key="usuario.id"
              type="button"
              role="menuitem"
              class="flex w-full flex-col px-4 py-2 text-left transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
              @click="irAResponsable(usuario)"
            >
              <span class="truncate text-sm font-medium text-slate-800">{{ usuario.nombre }}</span>
              <span class="truncate text-xs text-slate-500">{{ usuario.puesto || 'Sin puesto' }}</span>
            </button>
          </div>

          <div v-if="resultadosMantenimiento.length > 0" class="py-1.5">
            <p class="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Mantenimiento</p>
            <button
              v-for="item in resultadosMantenimiento"
              :key="item.folio"
              type="button"
              role="menuitem"
              class="flex w-full flex-col px-4 py-2 text-left transition hover:bg-slate-50 focus-visible:bg-slate-50 focus-visible:outline-none"
              @click="irAMantenimiento(item)"
            >
              <span class="truncate text-sm font-medium text-slate-800">{{ item.folio }}</span>
              <span class="truncate text-xs text-slate-500">{{ item.detalle }}</span>
            </button>
          </div>
        </template>
        <p v-else class="px-4 py-6 text-center text-sm text-slate-400">Sin resultados para «{{ texto.trim() }}».</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBienesData, type Bien } from '@/composables/useBienesData'
import { useCatalogosData, type Usuario } from '@/composables/useCatalogosData'
import { useMantenimientosData } from '@/composables/useMantenimientosData'
import { normalizarTexto } from '@/utils/formato'
import SearchInput from '@/components/ui/SearchInput.vue'

const MIN_CARACTERES = 2
const MAX_POR_GRUPO = 5

interface ResultadoMantenimiento {
  folio: string
  detalle: string
  tab: 'Preventivo' | 'Correctivo' | 'Dictámenes'
}

const { bienes } = useBienesData()
const { usuarios } = useCatalogosData()
const { mantenimientosVisibles, dictamenesVisibles, bienDe } = useMantenimientosData()
const router = useRouter()

const texto = ref('')
const abierto = ref(false)
const raizRef = ref<HTMLElement | null>(null)

const termino = computed(() => normalizarTexto(texto.value.trim()))

// Basta con escribir para abrir el panel; Esc o un clic fuera lo cierran (ver abajo).
watch(texto, (nuevo) => {
  if (nuevo.trim() !== '') abierto.value = true
})

function coincide(campos: Array<string | undefined>): boolean {
  return campos.some((campo) => campo && normalizarTexto(campo).includes(termino.value))
}

const resultadosBienes = computed<Bien[]>(() => {
  if (termino.value.length < MIN_CARACTERES) return []
  return bienes.filter((bien) => coincide([bien.nombre, bien.marca, bien.modelo, bien.numeroSerie, bien.numeroInventario])).slice(0, MAX_POR_GRUPO)
})

const resultadosResponsables = computed<Usuario[]>(() => {
  if (termino.value.length < MIN_CARACTERES) return []
  return usuarios.filter((usuario) => coincide([usuario.nombre, usuario.puesto])).slice(0, MAX_POR_GRUPO)
})

const resultadosMantenimiento = computed<ResultadoMantenimiento[]>(() => {
  if (termino.value.length < MIN_CARACTERES) return []
  const items: ResultadoMantenimiento[] = []

  for (const registro of mantenimientosVisibles()) {
    if (!normalizarTexto(registro.folio).includes(termino.value)) continue
    items.push({ folio: registro.folio, detalle: `${registro.tipo} · ${bienDe(registro.bienId)?.nombre ?? 'Sin bien'}`, tab: registro.tipo })
  }
  for (const dictamen of dictamenesVisibles()) {
    if (!normalizarTexto(dictamen.folio).includes(termino.value)) continue
    items.push({ folio: dictamen.folio, detalle: `Dictamen · ${dictamen.bien.nombre}`, tab: 'Dictámenes' })
  }
  return items.slice(0, MAX_POR_GRUPO)
})

const hayResultados = computed(() => resultadosBienes.value.length > 0 || resultadosResponsables.value.length > 0 || resultadosMantenimiento.value.length > 0)

function cerrarSiEsFuera(evento: MouseEvent) {
  if (raizRef.value && !raizRef.value.contains(evento.target as Node)) abierto.value = false
}

onMounted(() => document.addEventListener('mousedown', cerrarSiEsFuera))
onBeforeUnmount(() => document.removeEventListener('mousedown', cerrarSiEsFuera))

function cerrarYLimpiar() {
  abierto.value = false
  texto.value = ''
}

function irABien(bien: Bien) {
  cerrarYLimpiar()
  router.push(`/dashboard/bienes/${bien.id}`)
}

function irAResponsable(usuario: Usuario) {
  cerrarYLimpiar()
  router.push({ path: '/dashboard/administracion', query: { seccion: 'usuario', buscar: usuario.nombre } })
}

function irAMantenimiento(item: ResultadoMantenimiento) {
  cerrarYLimpiar()
  router.push({ path: '/dashboard/mantenimiento', query: { tab: item.tab, buscar: item.folio } })
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
