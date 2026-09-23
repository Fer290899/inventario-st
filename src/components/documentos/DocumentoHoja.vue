<template>
  <article class="text-slate-900">
    <DocumentoEncabezado :titulo="titulo" :folio="hoja.folio" :fecha="hoja.fecha" />

    <dl class="grid grid-cols-1 gap-x-8 sm:grid-cols-2 gap-y-2 text-sm">
      <div v-for="campo in campos" :key="campo.etiqueta">
        <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{{ campo.etiqueta }}</dt>
        <dd class="font-medium">{{ campo.valor }}</dd>
      </div>
    </dl>

    <table class="mt-6 w-full border-collapse text-left text-xs">
      <thead>
        <tr class="border-y border-slate-800 bg-slate-100 text-[11px] font-bold uppercase tracking-wide">
          <th class="w-8 px-2 py-1.5">#</th>
          <th class="px-2 py-1.5">Bien</th>
          <th class="px-2 py-1.5">Marca</th>
          <th class="px-2 py-1.5">Modelo</th>
          <th class="px-2 py-1.5">No. de serie</th>
          <th class="px-2 py-1.5">No. de inventario</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(bien, indice) in hoja.bienes" :key="bien.id" data-doc="fila-bien" class="break-inside-avoid border-b border-slate-300">
          <td class="px-2 py-1.5 tabular-nums">{{ indice + 1 }}</td>
          <td class="px-2 py-1.5 font-medium">{{ bien.nombre }}</td>
          <td class="px-2 py-1.5">{{ bien.marca }}</td>
          <td class="px-2 py-1.5">{{ bien.modelo }}</td>
          <td class="px-2 py-1.5 font-mono">{{ bien.numeroSerie }}</td>
          <td class="px-2 py-1.5 font-mono">{{ bien.numeroInventario }}</td>
        </tr>
      </tbody>
    </table>
    <p class="mt-2 text-xs text-slate-600">Total de bienes: {{ hoja.bienes.length }}</p>

    <section v-if="movimiento?.notas" class="mt-4 text-sm">
      <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Observaciones</p>
      <p>{{ movimiento.notas }}</p>
    </section>

    <p v-if="hoja.tipo === 'Resguardo'" class="mt-6 break-inside-avoid text-justify text-xs leading-relaxed text-slate-700">
      {{ institucion.textoResponsabilidad }}
    </p>

    <BloqueFirmas :firmas="firmas" />
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useInstitucionData } from '@/composables/useInstitucionData'
import { useMovimientosData, type Hoja } from '@/composables/useMovimientosData'
import { formatFecha } from '@/utils/formato'
import BloqueFirmas, { type Firma } from './BloqueFirmas.vue'
import DocumentoEncabezado from './DocumentoEncabezado.vue'

const props = defineProps<{
  hoja: Hoja
}>()

const { institucion } = useInstitucionData()
const { movimientos } = useMovimientosData()

const movimiento = computed(() => movimientos.find((item) => item.id === props.hoja.movimientoId))

const titulo = computed(() => {
  if (props.hoja.tipo === 'Resguardo') return 'Hoja de resguardo'
  return props.hoja.movimiento === 'Devolución' ? 'Hoja de devolución de bienes' : 'Hoja de entrega de bienes'
})

const campos = computed(() => {
  const { hoja } = props
  const lista: Array<{ etiqueta: string; valor: string }> = [
    { etiqueta: hoja.tipo === 'Resguardo' ? 'Resguardante' : 'Entrega', valor: hoja.persona },
    { etiqueta: 'Puesto', valor: hoja.puesto ?? '—' },
    { etiqueta: 'Dirección', valor: hoja.direccion },
    { etiqueta: 'Departamento', valor: hoja.departamento },
  ]
  if (hoja.tipo === 'Resguardo' && movimiento.value?.destino?.ubicacion) {
    lista.push({ etiqueta: 'Ubicación', valor: movimiento.value.destino.ubicacion })
  }
  lista.push(
    { etiqueta: 'Movimiento', valor: hoja.movimiento },
    { etiqueta: 'Mesa de ayuda', valor: movimiento.value?.mesaAyuda || '—' },
    { etiqueta: 'Fecha', valor: formatFecha(hoja.fecha) },
  )
  return lista
})

const firmas = computed<Firma[]>(() => {
  const { hoja } = props
  if (hoja.tipo === 'Resguardo') {
    return [
      { rol: 'Entrega', nombre: hoja.asignadoPor },
      { rol: 'Recibe (resguardante)', nombre: hoja.persona, puesto: hoja.puesto },
    ]
  }
  const destino = movimiento.value?.destino
  return [
    { rol: 'Devuelve', nombre: hoja.persona, puesto: hoja.puesto },
    destino
      ? { rol: 'Recibe', nombre: destino.persona, puesto: destino.puesto }
      : { rol: 'Recibe', nombre: 'Almacén de bienes', puesto: hoja.asignadoPor },
  ]
})
</script>
