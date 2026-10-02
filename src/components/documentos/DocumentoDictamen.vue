<template>
  <article class="text-slate-900">
    <DocumentoEncabezado titulo="Dictamen técnico de baja" :folio="dictamen.folio" :fecha="dictamen.fecha" />

    <section class="text-sm">
      <h2 class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Bien dictaminado</h2>
      <dl class="grid grid-cols-1 gap-x-8 sm:grid-cols-2 gap-y-2">
        <div v-for="campo in datosBien" :key="campo.etiqueta">
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{{ campo.etiqueta }}</dt>
          <dd class="font-medium">{{ campo.valor }}</dd>
        </div>
      </dl>
    </section>

    <section class="mt-5 text-sm">
      <h2 class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Diagnóstico</h2>
      <dl class="grid grid-cols-1 gap-x-8 sm:grid-cols-2 gap-y-2">
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Causa de la baja</dt>
          <dd class="font-medium">{{ dictamen.causa }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Diagnosticado por</dt>
          <dd class="font-medium">{{ mantenimiento?.tecnico ?? '—' }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Falla / descripción</dt>
          <dd>{{ mantenimiento?.fallaReportada || mantenimiento?.descripcion || '—' }}</dd>
        </div>
        <div class="sm:col-span-2">
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Conclusión</dt>
          <dd class="text-justify">{{ dictamen.conclusion || '—' }}</dd>
        </div>
      </dl>
    </section>

    <section class="mt-5 text-sm">
      <h2 class="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Valoración y destino</h2>
      <dl class="grid grid-cols-1 gap-x-8 sm:grid-cols-3 gap-y-2">
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Costo de reparación</dt>
          <dd class="font-mono font-medium tabular-nums">{{ formatMoneda(dictamen.costoReparacion) }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Valor de reposición</dt>
          <dd class="font-mono font-medium tabular-nums">{{ formatMoneda(dictamen.valorReposicion) }}</dd>
        </div>
        <div>
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Destino final</dt>
          <dd class="font-medium">{{ dictamen.destinoFinal }}</dd>
        </div>
      </dl>
    </section>

    <BloqueFirmas :firmas="firmas" />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMantenimientosData, type Dictamen } from '@/composables/useMantenimientosData'
import { formatMoneda } from '@/utils/formato'
import BloqueFirmas, { type Firma } from './BloqueFirmas.vue'
import DocumentoEncabezado from './DocumentoEncabezado.vue'

const props = defineProps<{
  dictamen: Dictamen
}>()

const { mantenimientoDe } = useMantenimientosData()

const mantenimiento = computed(() => mantenimientoDe(props.dictamen.mantenimientoId))

const datosBien = computed(() => {
  const { bien } = props.dictamen
  return [
    { etiqueta: 'Bien', valor: bien.nombre },
    { etiqueta: 'No. de inventario', valor: bien.numeroInventario },
    { etiqueta: 'Marca', valor: bien.marca },
    { etiqueta: 'Modelo', valor: bien.modelo },
    { etiqueta: 'No. de serie', valor: bien.numeroSerie },
    { etiqueta: 'Características', valor: bien.caracteristicas || '—' },
  ]
})

const firmas = computed<Firma[]>(() => [
  { rol: 'Diagnosticó', nombre: mantenimiento.value?.tecnico },
  { rol: 'Elaboró', nombre: props.dictamen.elaboradoPor },
  { rol: 'Vo. Bo.' },
])
</script>
