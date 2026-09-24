<template>
  <div class="mx-auto max-w-5xl min-w-0 space-y-6">
    <div>
      <RouterLink to="/dashboard/bienes" class="text-sm font-medium text-blue-700 hover:text-blue-800 focus-visible:outline-none focus-visible:underline">
        ← Volver a la lista de bienes
      </RouterLink>
    </div>

    <div v-if="!bien" class="rounded-2xl border border-slate-200 bg-white shadow-sm" data-doc="bien-no-encontrado">
      <EmptyState mensaje="No se encontró el bien. Puede haberse eliminado o el enlace ya no es válido." />
    </div>

    <template v-else>
      <div class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0">
          <h2 class="text-2xl font-bold text-slate-800" data-doc="detalle-titulo">{{ bien.nombre }} {{ bien.marca }}</h2>
          <p class="mt-1 font-mono text-sm text-slate-500">{{ bien.numeroInventario || 'Sin número de inventario' }}</p>
          <span class="mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-medium" :class="ESTATUS_ESTILOS[bien.estatus]">{{ bien.estatus }}</span>
          <div class="mt-4 flex flex-wrap gap-2">
            <AppButton variant="secondary" size="sm" @click="fichaAbierta = true">Imprimir ficha</AppButton>
            <AppButton variant="secondary" size="sm" @click="etiquetaAbierta = true">Imprimir etiqueta</AppButton>
          </div>
        </div>
        <QrCode :valor="enlace" :tamano="96" class="shrink-0 self-start rounded-lg border border-slate-200 p-2" />
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 class="mb-3 text-sm font-semibold text-slate-800">Datos del bien</h3>
          <dl class="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div v-for="campo in campos" :key="campo.etiqueta" :class="{ 'sm:col-span-2': campo.ancho }">
              <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{{ campo.etiqueta }}</dt>
              <dd class="font-medium text-slate-800">{{ campo.valor }}</dd>
            </div>
          </dl>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 class="mb-4 text-sm font-semibold text-slate-800">Historial</h3>
          <LineaTiempoBien :bien="bien" />
        </section>
      </div>

      <VistaPreviaDocumento v-model:open="fichaAbierta" title="Ficha del bien" :subtitle="`${bien.nombre} · ${bien.numeroInventario}`">
        <DocumentoFichaBien :bien="bien" />
      </VistaPreviaDocumento>
      <VistaPreviaDocumento v-model:open="etiquetaAbierta" title="Etiqueta del bien" :subtitle="bien.numeroInventario">
        <DocumentoEtiquetas :bienes="[bien]" />
      </VistaPreviaDocumento>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useBienesData, type EstatusBien } from '@/composables/useBienesData'
import { formatFecha, formatMoneda, sumarMesesIso } from '@/utils/formato'
import LineaTiempoBien from '@/components/bienes/LineaTiempoBien.vue'
import QrCode from '@/components/bienes/QrCode.vue'
import DocumentoEtiquetas from '@/components/documentos/DocumentoEtiquetas.vue'
import DocumentoFichaBien from '@/components/documentos/DocumentoFichaBien.vue'
import VistaPreviaDocumento from '@/components/documentos/VistaPreviaDocumento.vue'
import AppButton from '@/components/ui/AppButton.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

const route = useRoute()
const { bienes } = useBienesData()

const ESTATUS_ESTILOS: Record<EstatusBien, string> = {
  Asignado: 'bg-emerald-50 text-emerald-700',
  'Por asignar': 'bg-amber-50 text-amber-700',
  'En reparación': 'bg-blue-50 text-blue-700',
  Baja: 'bg-slate-100 text-slate-500',
}

const bien = computed(() => bienes.find((item) => item.id === route.params.id))
const enlace = computed(() => `${window.location.origin}/dashboard/bienes/${bien.value?.id ?? ''}`)

const fichaAbierta = ref(false)
const etiquetaAbierta = ref(false)

const campos = computed(() => {
  const actual = bien.value
  if (!actual) return []
  const vacio = '—'
  const garantia =
    actual.mesesGarantia > 0
      ? `${actual.mesesGarantia} meses (hasta ${formatFecha(sumarMesesIso(actual.fechaAlta, actual.mesesGarantia))})`
      : 'Sin garantía'

  return [
    { etiqueta: 'Tipo de bien', valor: actual.nombre },
    { etiqueta: 'Marca / modelo', valor: `${actual.marca} ${actual.modelo}` },
    { etiqueta: 'Número de serie', valor: actual.numeroSerie },
    { etiqueta: 'Responsable', valor: actual.responsable ?? vacio },
    { etiqueta: 'Ubicación', valor: actual.ubicacion ?? vacio },
    { etiqueta: 'Dirección', valor: actual.direccion ?? vacio },
    { etiqueta: 'Departamento', valor: actual.departamento ?? vacio },
    { etiqueta: 'Fecha de alta', valor: formatFecha(actual.fechaAlta) },
    { etiqueta: 'Garantía', valor: garantia },
    { etiqueta: 'Valor de adquisición', valor: actual.valorAdquisicion !== undefined ? formatMoneda(actual.valorAdquisicion, { centavos: true }) : vacio },
    { etiqueta: 'Características', valor: actual.caracteristicas || vacio, ancho: true },
  ]
})
</script>
