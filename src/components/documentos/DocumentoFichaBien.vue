<template>
  <article class="text-slate-900">
    <DocumentoEncabezado titulo="Ficha del bien" :folio="bien.numeroInventario" :fecha="hoy" />

    <section v-for="seccion in secciones" :key="seccion.titulo" class="mb-5 break-inside-avoid text-sm">
      <h2 class="mb-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide text-slate-500">{{ seccion.titulo }}</h2>
      <dl class="grid grid-cols-1 gap-x-8 sm:grid-cols-2 gap-y-2">
        <div v-for="campo in seccion.campos" :key="campo.etiqueta" :class="{ 'sm:col-span-2': campo.ancho }">
          <dt class="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{{ campo.etiqueta }}</dt>
          <dd class="font-medium">{{ campo.valor }}</dd>
        </div>
      </dl>
    </section>

    <section class="text-sm">
      <h2 class="mb-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-wide text-slate-500">Historial</h2>
      <p v-if="historial.length === 0" class="text-xs text-slate-500">Sin movimientos ni mantenimientos registrados.</p>
      <table v-else class="w-full border-collapse text-left text-xs">
        <thead>
          <tr class="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wide">
            <th class="w-24 py-1.5 pr-2">Fecha</th>
            <th class="w-40 py-1.5 pr-2">Evento</th>
            <th class="py-1.5">Detalle</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="evento in historial" :key="evento.clave" data-doc="fila-historial" class="break-inside-avoid border-b border-slate-200">
            <td class="py-1.5 pr-2 tabular-nums">{{ formatFecha(evento.fecha) }}</td>
            <td class="py-1.5 pr-2 font-medium">{{ evento.evento }}</td>
            <td class="py-1.5">{{ evento.detalle }}</td>
          </tr>
        </tbody>
      </table>
    </section>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Bien } from '@/composables/useBienesData'
import { useMantenimientosData } from '@/composables/useMantenimientosData'
import { useMovimientosData } from '@/composables/useMovimientosData'
import { formatFecha, sumarMesesIso } from '@/utils/formato'
import DocumentoEncabezado from './DocumentoEncabezado.vue'

const props = defineProps<{
  bien: Bien
}>()

const { movimientos, hojas } = useMovimientosData()
const { mantenimientos, dictamenes } = useMantenimientosData()

const hoy = new Date().toISOString().slice(0, 10)

const secciones = computed(() => {
  const { bien } = props
  const vacio = '—'

  const vigenciaGarantia =
    bien.mesesGarantia > 0
      ? `${bien.mesesGarantia} meses (hasta ${formatFecha(sumarMesesIso(bien.fechaAlta, bien.mesesGarantia))})`
      : 'Sin garantía'

  const puestoResponsable = bien.responsable
    ? hojas.find((hoja) => hoja.tipo === 'Resguardo' && hoja.persona === bien.responsable)?.puesto
    : undefined

  return [
    {
      titulo: 'Datos generales',
      campos: [
        { etiqueta: 'Bien', valor: bien.nombre },
        { etiqueta: 'No. de inventario', valor: bien.numeroInventario || vacio },
        { etiqueta: 'Marca', valor: bien.marca },
        { etiqueta: 'Modelo', valor: bien.modelo },
        { etiqueta: 'No. de serie', valor: bien.numeroSerie },
        { etiqueta: 'Inventariable', valor: bien.inventariable ? 'Sí' : 'No' },
        { etiqueta: 'Fecha de alta', valor: formatFecha(bien.fechaAlta) },
        { etiqueta: 'Garantía', valor: vigenciaGarantia },
        { etiqueta: 'Características', valor: bien.caracteristicas || vacio, ancho: true },
      ],
    },
    {
      titulo: 'Adquisición',
      campos: [
        { etiqueta: 'Origen', valor: bien.origen ?? vacio },
        { etiqueta: 'No. de factura', valor: bien.numeroFactura ?? vacio },
        { etiqueta: 'Fecha de factura', valor: bien.fechaFactura ? formatFecha(bien.fechaFactura) : vacio },
      ],
    },
    {
      titulo: 'Estado y resguardo',
      campos: [
        { etiqueta: 'Estatus', valor: bien.estatus },
        { etiqueta: 'Responsable', valor: bien.responsable ? `${bien.responsable}${puestoResponsable ? ` (${puestoResponsable})` : ''}` : vacio },
        { etiqueta: 'Ubicación', valor: bien.ubicacion ?? vacio },
        { etiqueta: 'Mesa de ayuda', valor: bien.mesaAyuda ?? vacio },
        { etiqueta: 'Dirección', valor: bien.direccion ?? vacio },
        { etiqueta: 'Departamento', valor: bien.departamento ?? vacio },
      ],
    },
  ]
})

interface EventoHistorial {
  clave: string
  fecha: string
  evento: string
  detalle: string
}

const historial = computed<EventoHistorial[]>(() => {
  const id = props.bien.id
  const eventos: EventoHistorial[] = []

  for (const mov of movimientos) {
    if (!mov.bienesIds.includes(id)) continue
    eventos.push({
      clave: mov.id,
      fecha: mov.fecha,
      evento: mov.tipo,
      detalle: mov.destino ? `A ${mov.destino.persona} · ${mov.destino.direccion}` : 'Devuelto al almacén',
    })
  }

  for (const mant of mantenimientos) {
    if (mant.bienId !== id) continue
    eventos.push({
      clave: mant.id,
      fecha: mant.fecha,
      evento: `Mantenimiento ${mant.tipo.toLowerCase()}`,
      detalle: `${mant.folio} · ${mant.estatus}${mant.resultado ? ` · ${mant.resultado}` : ''}`,
    })
  }

  for (const dict of dictamenes) {
    if (dict.bienId !== id) continue
    eventos.push({ clave: dict.id, fecha: dict.fecha, evento: 'Dictamen de baja', detalle: `${dict.folio} · ${dict.causa}` })
  }

  return eventos.sort((a, b) => b.fecha.localeCompare(a.fecha))
})
</script>
