<template>
  <!-- En escritorio la tarjeta se queda a la vista mientras se recorre una tabla larga. -->
  <div class="min-[1366px]:sticky min-[1366px]:top-4">
    <!-- Móvil: selector agrupado -->
    <div class="min-[1366px]:hidden">
      <label class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500" for="administracion-seccion">Sección</label>
      <BaseSelect id="administracion-seccion" :model-value="seccion" data-doc="seccion-movil" @update:model-value="ir">
        <optgroup v-for="grupo in GRUPOS" :key="grupo.titulo" :label="grupo.titulo">
          <option v-for="clave in grupo.secciones" :key="clave" :value="clave">{{ etiquetaMovil(clave) }}</option>
        </optgroup>
      </BaseSelect>
    </div>

    <!-- Escritorio: menú lateral -->
    <nav class="hidden rounded-lg border border-slate-200 bg-white p-2 min-[1366px]:block" aria-label="Secciones de administración" data-doc="nav-administracion">
      <div v-for="(grupo, indice) in GRUPOS" :key="grupo.titulo" :class="indice > 0 ? 'mt-2 border-t border-slate-100 pt-2' : ''">
        <p class="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{{ grupo.titulo }}</p>
        <RouterLink
          v-for="clave in grupo.secciones"
          :key="clave"
          :to="{ query: { seccion: clave } }"
          replace
          :aria-current="seccion === clave ? 'page' : undefined"
          class="flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          :class="seccion === clave ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'"
          :data-doc="`seccion-${clave}`"
        >
          {{ SECCIONES[clave].titulo }}
          <span
            v-if="conteos[clave] !== undefined"
            class="rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums"
            :class="seccion === clave ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'"
          >
            {{ conteos[clave] }}
          </span>
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { GRUPOS, SECCIONES, type Seccion } from './secciones'

const props = defineProps<{
  seccion: Seccion
  conteos: Partial<Record<Seccion, number>>
}>()

const router = useRouter()

function etiquetaMovil(clave: Seccion): string {
  const conteo = props.conteos[clave]
  return conteo === undefined ? SECCIONES[clave].titulo : `${SECCIONES[clave].titulo} (${conteo})`
}

function ir(clave: string | number) {
  router.replace({ query: { seccion: String(clave) } })
}
</script>
