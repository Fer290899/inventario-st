<template>
  <aside aria-label="Expediente del bien seleccionado" data-doc="expediente-bien">
    <div class="flex items-end justify-between gap-3">
      <h2 class="m-0 rounded-t-lg bg-manila-200 px-5 pb-[9px] pt-2.5 text-[15px] font-semibold text-slate-900">Expediente</h2>
      <button
        type="button"
        class="mb-1 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        aria-label="Cerrar el expediente"
        title="Cerrar el expediente"
        @click="emit('cerrar')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="relative rounded-b rounded-tr border border-t-2 border-slate-200 border-t-manila-200 bg-white p-6">
      <p
        v-if="garantiaVencida"
        role="note"
        class="absolute right-4 top-5 -rotate-[4deg] rounded border-[2.5px] border-rose-700 bg-white/60 px-2.5 py-0.5 text-[13px] font-bold text-rose-700"
      >
        Garantía vencida
      </p>

      <p class="font-mono text-[13px] font-semibold text-slate-800">{{ bien.numeroInventario || 'Sin número de inventario' }}</p>
      <h3 class="mb-1 mt-1.5 max-w-[11em] text-2xl font-semibold leading-tight tracking-tight text-slate-900" data-doc="expediente-titulo">
        {{ bien.nombre }} {{ bien.marca }} {{ bien.modelo }}
      </h3>
      <p class="mb-5 text-sm text-slate-500">
        <EstatusPunto :estatus="bien.estatus" /><template v-if="bien.responsable"> a {{ bien.responsable }}</template>
      </p>

      <dl class="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-sm">
        <template v-for="campo in campos" :key="campo.etiqueta">
          <dt class="text-slate-500">{{ campo.etiqueta }}</dt>
          <dd class="m-0 font-medium text-slate-800" :class="{ 'font-mono': campo.mono, 'font-normal': campo.normal }">{{ campo.valor }}</dd>
        </template>
      </dl>

      <div class="mt-6 flex flex-wrap gap-2">
        <AppButton
          v-if="bien.estatus === 'Por asignar'"
          :disabled="!can('bienes:mover')"
          :title="puedeMover ? undefined : motivoSinPermiso('bienes:mover', rol)"
          @click="emit('mover', 'Asignación')"
        >
          Asignar
        </AppButton>
        <template v-if="bien.estatus === 'Asignado'">
          <AppButton :disabled="!can('bienes:mover')" :title="puedeMover ? undefined : motivoSinPermiso('bienes:mover', rol)" @click="emit('mover', 'Reasignación')">
            Reasignar
          </AppButton>
          <AppButton
            variant="secondary"
            :disabled="!can('bienes:mover')"
            :title="puedeMover ? undefined : motivoSinPermiso('bienes:mover', rol)"
            @click="emit('mover', 'Devolución')"
          >
            Devolver a almacén
          </AppButton>
        </template>
        <AppButton variant="secondary" :disabled="bien.estatus === 'Baja' || !can('bienes:editar')" :title="tituloEditar" @click="emit('editar')">Editar</AppButton>
        <AppButton variant="secondary" @click="emit('ficha')">Imprimir ficha</AppButton>
      </div>

      <h3 class="mb-2.5 mt-7 border-t border-slate-900 pt-4 text-base font-semibold text-slate-900">Bitácora</h3>
      <ol v-if="eventos.length > 0" class="m-0 flex list-none flex-col gap-3 p-0 text-sm" data-doc="bitacora-expediente">
        <li v-for="evento in eventos" :key="evento.clave" class="grid grid-cols-[5.75rem_minmax(0,1fr)] gap-3">
          <span class="font-mono text-[12.5px] tabular-nums text-slate-500">{{ formatFecha(evento.fecha) }}</span>
          <span>
            {{ evento.titulo }}
            <span v-if="evento.detalle" class="block text-[13px] text-slate-500">{{ evento.detalle }}</span>
          </span>
        </li>
      </ol>
      <p v-else class="text-sm text-slate-500">Todavía no hay movimientos registrados.</p>

      <div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button
          type="button"
          class="rounded text-sm font-semibold text-blue-800 underline underline-offset-[3px] hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          @click="emit('historial')"
        >
          Ver historial completo
        </button>
        <RouterLink
          :to="`/dashboard/bienes/${bien.id}`"
          class="rounded text-sm font-semibold text-blue-800 underline underline-offset-[3px] hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          Abrir página del bien
        </RouterLink>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { Bien } from '@/composables/useBienesData'
import { useAuth } from '@/composables/useAuth'
import { useHistorialBien } from '@/composables/useHistorialBien'
import type { TipoMovimiento } from '@/composables/useMovimientosData'
import { motivoSinPermiso } from '@/config/permisos'
import { formatFecha, formatMoneda, hoyIso, sumarMesesIso } from '@/utils/formato'
import AppButton from '@/components/ui/AppButton.vue'
import EstatusPunto from '@/components/ui/EstatusPunto.vue'

const props = defineProps<{
  bien: Bien
}>()

const emit = defineEmits<{
  cerrar: []
  mover: [tipo: TipoMovimiento]
  editar: []
  ficha: []
  historial: []
}>()

const { can, rol } = useAuth()
const { historialDe } = useHistorialBien()

const puedeMover = computed(() => can('bienes:mover'))

const tituloEditar = computed(() => {
  if (props.bien.estatus === 'Baja') return 'Un bien dado de baja ya no se modifica'
  return can('bienes:editar') ? undefined : motivoSinPermiso('bienes:editar', rol.value)
})

const vencimientoGarantia = computed(() => (props.bien.mesesGarantia > 0 ? sumarMesesIso(props.bien.fechaAlta, props.bien.mesesGarantia) : null))
const garantiaVencida = computed(() => vencimientoGarantia.value !== null && vencimientoGarantia.value < hoyIso())

const campos = computed(() => {
  const actual = props.bien
  const vacio = '—'
  const garantia = vencimientoGarantia.value
    ? `${actual.mesesGarantia} meses · ${garantiaVencida.value ? 'terminó' : 'termina'} el ${formatFecha(vencimientoGarantia.value)}`
    : 'Sin garantía'

  return [
    { etiqueta: 'Marca y modelo', valor: `${actual.marca} · ${actual.modelo}` },
    { etiqueta: 'Número de serie', valor: actual.numeroSerie || vacio, mono: true },
    { etiqueta: 'Fecha de alta', valor: formatFecha(actual.fechaAlta) },
    { etiqueta: 'Garantía', valor: garantia },
    { etiqueta: 'Valor', valor: formatMoneda(actual.valorAdquisicion, { centavos: true }), mono: true },
    { etiqueta: 'Ubicación', valor: actual.ubicacion ?? vacio },
    { etiqueta: 'Departamento', valor: actual.departamento ?? vacio },
    { etiqueta: 'Características', valor: actual.caracteristicas || vacio, normal: true },
  ]
})

// Los cuatro movimientos más recientes; el resto vive en «Ver historial completo».
const eventos = computed(() => historialDe(props.bien).slice(0, 4))
</script>
