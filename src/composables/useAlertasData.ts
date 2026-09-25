import { computed, reactive } from 'vue'
import { registrarAuditoria } from './useAuditoria'
import { diasEntre, formatFecha, hoyIso, sumarDiasIso, sumarMesesIso } from '@/utils/formato'
import { useBienesData, type Bien } from './useBienesData'
import { useMantenimientosData, type Mantenimiento } from './useMantenimientosData'

/** Alertas que se calculan a partir del estado; desaparecen solas al resolverse. */
export type FocoAlerta = 'preventivo-vencido' | 'preventivo-proximo' | 'correctivo-atorado' | 'garantia-por-vencer'
/** Además de las alertas, las tarjetas del dashboard filtran las listas por estos dos grupos. */
export type FocoVista = FocoAlerta | 'preventivos-pendientes' | 'correctivos-abiertos'
export type GrupoAlerta = 'preventivos' | 'garantias' | 'correctivos'
export type Severidad = 'critica' | 'aviso'

export interface Alerta {
  id: string
  foco: FocoAlerta
  severidad: Severidad
  titulo: string
  detalle: string
  /** Fecha ISO límite (vencimiento, próxima fecha, fecha de inicio del correctivo) */
  fechaLimite: string
  bienId: string
  /** Id del mantenimiento (o del bien, en garantías) al que apunta el filtro */
  entidadId: string
  destino: { path: string; query: Record<string, string> }
}

export interface UmbralesAlertas {
  diasAvisoPreventivo: number
  diasAvisoGarantia: number
  diasCorrectivoAtorado: number
}

export const FOCO_ETIQUETAS: Record<FocoVista, string> = {
  'preventivo-vencido': 'Preventivos vencidos',
  'preventivo-proximo': 'Preventivos próximos',
  'correctivo-atorado': 'Correctivos atorados',
  'garantia-por-vencer': 'Garantías por vencer',
  'preventivos-pendientes': 'Preventivos pendientes',
  'correctivos-abiertos': 'Correctivos abiertos',
}

export const GRUPO_ETIQUETAS: Record<GrupoAlerta, string> = {
  preventivos: 'Preventivos',
  garantias: 'Garantías',
  correctivos: 'Correctivos',
}

const GRUPO_DE_FOCO: Record<FocoAlerta, GrupoAlerta> = {
  'preventivo-vencido': 'preventivos',
  'preventivo-proximo': 'preventivos',
  'correctivo-atorado': 'correctivos',
  'garantia-por-vencer': 'garantias',
}

export function grupoDe(foco: FocoAlerta): GrupoAlerta {
  return GRUPO_DE_FOCO[foco]
}

export function esFocoVista(valor: unknown): valor is FocoVista {
  return typeof valor === 'string' && valor in FOCO_ETIQUETAS
}

// TODO: reemplazar por la llamada real al servicio de configuración,
// ej. await configuracionApi.getUmbralesAlertas()
const umbrales = reactive<UmbralesAlertas>({
  diasAvisoPreventivo: 15,
  diasAvisoGarantia: 60,
  diasCorrectivoAtorado: 30,
})

function actualizarUmbrales(datos: UmbralesAlertas) {
  // TODO: reemplazar por la llamada real al servicio de configuración
  Object.assign(umbrales, datos)
  registrarAuditoria('Configuración', 'Umbrales de alertas', 'Alertas', `Preventivo ${datos.diasAvisoPreventivo} d · Garantía ${datos.diasAvisoGarantia} d · Correctivo ${datos.diasCorrectivoAtorado} d`)
}

const { bienes } = useBienesData()
const { mantenimientosVisibles } = useMantenimientosData()

const estaPendiente = (item: Mantenimiento) => item.estatus === 'Programado' || item.estatus === 'En curso'
const nombreBien = (bien: Bien) => `${bien.nombre} ${bien.marca}`.trim()

function alertasPreventivas(hoy: string, porId: Map<string, Bien>): Alerta[] {
  const porBien = new Map<string, Mantenimiento[]>()
  for (const item of mantenimientosVisibles()) {
    if (item.tipo !== 'Preventivo' || item.estatus === 'Cancelado') continue
    porBien.set(item.bienId, [...(porBien.get(item.bienId) ?? []), item])
  }

  const limiteProximo = sumarDiasIso(hoy, umbrales.diasAvisoPreventivo)
  const alertas: Alerta[] = []

  for (const [bienId, lista] of porBien) {
    const bien = porId.get(bienId)
    if (!bien || bien.estatus === 'Baja') continue

    const pendientes = lista.filter(estaPendiente).sort((a, b) => a.fecha.localeCompare(b.fecha))
    let referencia: Mantenimiento | undefined
    let fechaLimite: string | undefined
    let esProgramado = false

    if (pendientes.length > 0) {
      referencia = pendientes[0]
      fechaLimite = referencia!.fecha
      esProgramado = true
    } else {
      const concluidos = lista
        .filter((item) => item.estatus === 'Concluido' && item.proximaFecha)
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
      referencia = concluidos[0]
      fechaLimite = referencia?.proximaFecha
    }
    if (!referencia || !fechaLimite) continue

    const dias = diasEntre(hoy, fechaLimite)
    const vencido = fechaLimite < hoy
    if (!vencido && fechaLimite > limiteProximo) continue

    const cuando = vencido ? `hace ${-dias} ${-dias === 1 ? 'día' : 'días'}` : dias === 0 ? 'hoy' : `en ${dias} ${dias === 1 ? 'día' : 'días'}`
    const origen = esProgramado ? 'Programado' : 'Próximo sugerido'
    alertas.push({
      id: `preventivo-${referencia.id}`,
      foco: vencido ? 'preventivo-vencido' : 'preventivo-proximo',
      severidad: vencido ? 'critica' : 'aviso',
      titulo: `${vencido ? 'Preventivo vencido' : 'Preventivo próximo'} · ${nombreBien(bien)}`,
      detalle: `${bien.numeroInventario || 'Sin inventario'} · ${origen}: ${formatFecha(fechaLimite)} (${cuando})`,
      fechaLimite,
      bienId,
      entidadId: referencia.id,
      destino: { path: '/dashboard/mantenimiento', query: { tab: 'Preventivo', foco: vencido ? 'preventivo-vencido' : 'preventivo-proximo' } },
    })
  }
  return alertas
}

function alertasCorrectivas(hoy: string, porId: Map<string, Bien>): Alerta[] {
  const alertas: Alerta[] = []
  for (const item of mantenimientosVisibles()) {
    if (item.tipo !== 'Correctivo' || !estaPendiente(item)) continue
    const dias = diasEntre(item.fecha, hoy)
    if (dias < umbrales.diasCorrectivoAtorado) continue

    const bien = porId.get(item.bienId)
    const urgente = item.prioridad === 'Alta' || item.prioridad === 'Urgente'
    alertas.push({
      id: `correctivo-${item.id}`,
      foco: 'correctivo-atorado',
      severidad: urgente ? 'critica' : 'aviso',
      titulo: `Correctivo atorado · ${bien ? nombreBien(bien) : item.folio}`,
      detalle: `${item.folio} · abierto hace ${dias} días${item.prioridad ? ` · prioridad ${item.prioridad}` : ''}`,
      fechaLimite: item.fecha,
      bienId: item.bienId,
      entidadId: item.id,
      destino: { path: '/dashboard/mantenimiento', query: { tab: 'Correctivo', foco: 'correctivo-atorado' } },
    })
  }
  return alertas
}

function alertasGarantia(hoy: string): Alerta[] {
  const alertas: Alerta[] = []
  for (const bien of bienes) {
    if (bien.estatus === 'Baja' || bien.mesesGarantia <= 0) continue
    const vencimiento = sumarMesesIso(bien.fechaAlta, bien.mesesGarantia)
    const dias = diasEntre(hoy, vencimiento)
    if (dias < 0 || dias > umbrales.diasAvisoGarantia) continue

    alertas.push({
      id: `garantia-${bien.id}`,
      foco: 'garantia-por-vencer',
      severidad: 'aviso',
      titulo: `Garantía por vencer · ${nombreBien(bien)}`,
      detalle: `${bien.numeroInventario || 'Sin inventario'} · vence el ${formatFecha(vencimiento)} (${dias === 0 ? 'hoy' : `en ${dias} ${dias === 1 ? 'día' : 'días'}`})`,
      fechaLimite: vencimiento,
      bienId: bien.id,
      entidadId: bien.id,
      destino: { path: '/dashboard/bienes', query: { foco: 'garantia-por-vencer' } },
    })
  }
  return alertas
}

const alertas = computed<Alerta[]>(() => {
  const hoy = hoyIso()
  const porId = new Map(bienes.map((bien) => [bien.id, bien]))
  return [...alertasPreventivas(hoy, porId), ...alertasCorrectivas(hoy, porId), ...alertasGarantia(hoy)].sort((a, b) => {
    if (a.severidad !== b.severidad) return a.severidad === 'critica' ? -1 : 1
    return a.fechaLimite.localeCompare(b.fechaLimite)
  })
})

const resumen = computed(() => {
  const porFoco: Record<FocoAlerta, number> = {
    'preventivo-vencido': 0,
    'preventivo-proximo': 0,
    'correctivo-atorado': 0,
    'garantia-por-vencer': 0,
  }
  const porGrupo: Record<GrupoAlerta, number> = { preventivos: 0, garantias: 0, correctivos: 0 }
  let criticas = 0
  for (const alerta of alertas.value) {
    porFoco[alerta.foco] += 1
    porGrupo[grupoDe(alerta.foco)] += 1
    if (alerta.severidad === 'critica') criticas += 1
  }
  return { total: alertas.value.length, criticas, avisos: alertas.value.length - criticas, porFoco, porGrupo }
})

/** Ids que cumplen el foco: de bien para garantías, de mantenimiento para todo lo demás. */
function idsDeFoco(foco: FocoVista): Set<string> {
  if (foco === 'preventivos-pendientes') {
    return new Set(mantenimientosVisibles().filter((item) => item.tipo === 'Preventivo' && estaPendiente(item)).map((item) => item.id))
  }
  if (foco === 'correctivos-abiertos') {
    return new Set(mantenimientosVisibles().filter((item) => item.tipo === 'Correctivo' && estaPendiente(item)).map((item) => item.id))
  }
  return new Set(alertas.value.filter((alerta) => alerta.foco === foco).map((alerta) => alerta.entidadId))
}

export function useAlertasData() {
  return { umbrales, actualizarUmbrales, alertas, resumen, idsDeFoco }
}
