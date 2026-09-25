import { reactive } from 'vue'
import { hoyIso, sumarDiasIso, sumarMesesIso } from '@/utils/formato'
import { registrarAuditoria } from './useAuditoria'
import { nombreActual, usuarioActual } from './useAuth'
import { ASIGNABLES_SEMILLA } from './tecnicosSemilla'
import { snapshotDe, useBienesData, type Bien, type BienSnapshot, type EstatusBien } from './useBienesData'

export type TipoMantenimiento = 'Preventivo' | 'Correctivo'
export type EstatusMantenimiento = 'Programado' | 'En curso' | 'Concluido' | 'Cancelado'
export type Prioridad = 'Baja' | 'Media' | 'Alta' | 'Urgente'
export type ResultadoCorrectivo = 'Reparado' | 'No reparable'
export type Periodicidad = 'Mensual' | 'Trimestral' | 'Semestral' | 'Anual'
export type CausaBaja =
  | 'Daño físico no reparable'
  | 'Costo de reparación no conviene'
  | 'Obsolescencia tecnológica'
  | 'Fin de vida útil'
  | 'Pérdida o robo'
  | 'Siniestro'
  | 'Otro'
export type DestinoFinal = 'Destrucción / chatarra' | 'Donación' | 'Venta' | 'Reciclaje' | 'Resguardo para baja'

/** Un mantenimiento por bien. Preventivo y Correctivo comparten el mismo registro; solo cambian sus campos propios. */
export interface Mantenimiento {
  id: string
  /** M-P### (Preventivo) o M-C### (Correctivo) */
  folio: string
  tipo: TipoMantenimiento
  bienId: string
  /** Fecha ISO (YYYY-MM-DD), programada o de inicio */
  fecha: string
  /** Nombre de quien lo ejecuta, tal como se programó (texto: los documentos ya emitidos no cambian si se renombra) */
  tecnico: string
  /** Solo si lo ejecuta un técnico del catálogo (no un proveedor); es lo que limita lo que ve un rol Técnico */
  tecnicoId?: string
  descripcion: string
  prioridad?: Prioridad
  fallaReportada?: string
  periodicidad?: Periodicidad
  /** Sugerida = fecha + periodicidad; solo Preventivo */
  proximaFecha?: string
  estatus: EstatusMantenimiento
  fechaConclusion?: string
  costo?: number
  notasConclusion?: string
  resultado?: ResultadoCorrectivo
  /** Estatus del bien justo antes de iniciar el correctivo, para restaurarlo si el resultado es "Reparado". */
  estatusPrevioBien?: EstatusBien
  registradoPor: string
}

/** Documento inmutable generado al concluir un Correctivo como "No reparable". */
export interface Dictamen {
  id: string
  /** DICT-### */
  folio: string
  mantenimientoId: string
  bienId: string
  /** Datos del bien al momento del dictamen. */
  bien: BienSnapshot
  fecha: string
  causa: CausaBaja
  conclusion: string
  /** Cifras del momento del dictamen, no una propiedad permanente del bien. */
  costoReparacion?: number
  valorReposicion?: number
  destinoFinal: DestinoFinal
  elaboradoPor: string
}

export interface FiltrosMantenimiento {
  tipo: TipoMantenimiento | ''
  estatus: EstatusMantenimiento | ''
  tecnico: string
  prioridad: Prioridad | ''
  fechaDesde: string
  fechaHasta: string
}

export function filtrosMantenimientoVacios(): FiltrosMantenimiento {
  return { tipo: '', estatus: '', tecnico: '', prioridad: '', fechaDesde: '', fechaHasta: '' }
}

const PERIODICIDADES: Periodicidad[] = ['Mensual', 'Trimestral', 'Semestral', 'Anual']
const PERIODOS_MESES: Record<Periodicidad, number> = { Mensual: 1, Trimestral: 3, Semestral: 6, Anual: 12 }
export const CAUSAS_BAJA: CausaBaja[] = [
  'Daño físico no reparable',
  'Costo de reparación no conviene',
  'Obsolescencia tecnológica',
  'Fin de vida útil',
  'Pérdida o robo',
  'Siniestro',
  'Otro',
]
export const DESTINOS_FINALES: DestinoFinal[] = ['Destrucción / chatarra', 'Donación', 'Venta', 'Reciclaje', 'Resguardo para baja']
const FALLAS_EJEMPLO = [
  'No enciende',
  'Ruido anormal al operar',
  'Sobrecalentamiento',
  'No conecta a la red',
  'Pantalla con líneas/manchas',
  'Atasco de papel recurrente',
]

export interface NuevoMantenimiento {
  tipo: TipoMantenimiento
  bienesIds: string[]
  fecha: string
  tecnico: string
  tecnicoId?: string
  descripcion: string
  /** Solo Correctivo */
  prioridad?: Prioridad
  /** Solo Correctivo */
  fallaReportada?: string
  /** Solo Preventivo */
  periodicidad?: Periodicidad
}

/** Genera un dictamen de baja directamente, sin pasar antes por "Concluir" un correctivo ya existente. */
export interface NuevoDictamenDirecto {
  tipo: 'Dictamen'
  bienesIds: string[]
  fecha: string
  tecnico: string
  tecnicoId?: string
  descripcion: string
  causa: CausaBaja
  conclusion: string
  costoReparacion?: number
  valorReposicion?: number
  destinoFinal: DestinoFinal
  elaboradoPor: string
}

export interface DatosConclusion {
  fechaConclusion: string
  costo?: number
  notasConclusion?: string
  /** Requerido si el mantenimiento es Correctivo */
  resultado?: ResultadoCorrectivo
  /** Requeridos si resultado === 'No reparable' */
  conclusionDictamen?: string
  elaboradoPor?: string
  causaBaja?: CausaBaja
  destinoFinal?: DestinoFinal
  /** Opcionales, sustentan económicamente el dictamen */
  costoReparacion?: number
  valorReposicion?: number
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0')
}

// Instancias compartidas: todas las vistas ven las mismas listas.
const mantenimientos = reactive<Mantenimiento[]>([])
const dictamenes = reactive<Dictamen[]>([])

const contadores: Record<TipoMantenimiento, number> = { Preventivo: 0, Correctivo: 0 }
let contadorDictamen = 0
let contadorMantenimiento = 0

function siguienteFolio(tipo: TipoMantenimiento): string {
  contadores[tipo] += 1
  return `M-${tipo === 'Preventivo' ? 'P' : 'C'}${pad(contadores[tipo], 3)}`
}

function instantaneaBien(bien: Bien | undefined, bienId: string): BienSnapshot {
  if (bien) return snapshotDe(bien)
  return { id: bienId, nombre: '—', marca: '—', modelo: '—', numeroSerie: '—', numeroInventario: '—', caracteristicas: '' }
}

/**
 * El rol Técnico solo ve los mantenimientos que se le asignaron (por su técnico ligado); el resto de roles ve todo.
 * Lo usan las listas, el dashboard, las alertas y el historial para que cuenten lo mismo.
 */
function esVisibleParaSesion(mantenimiento: Mantenimiento): boolean {
  const sesion = usuarioActual()
  return sesion?.rol !== 'Técnico' || (sesion.tecnicoId !== undefined && mantenimiento.tecnicoId === sesion.tecnicoId)
}

function mantenimientosVisibles(): Mantenimiento[] {
  return mantenimientos.filter(esVisibleParaSesion)
}

function dictamenesVisibles(): Dictamen[] {
  const visibles = new Set(mantenimientosVisibles().map((mantenimiento) => mantenimiento.id))
  return dictamenes.filter((dictamen) => visibles.has(dictamen.mantenimientoId))
}

let auditoriaSilenciada = false
function auditar(accion: string, entidad: string, detalle: string) {
  if (!auditoriaSilenciada) registrarAuditoria('Mantenimiento', accion, entidad, detalle)
}

function siguienteFolioDictamen(): string {
  contadorDictamen += 1
  return `DICT-${pad(contadorDictamen, 3)}`
}

/**
 * Registra un mantenimiento por cada bien seleccionado. Si es Correctivo, marca el bien
 * "En reparación" guardando su estatus previo para poder restaurarlo al concluir.
 */
function iniciarMantenimiento(nuevo: NuevoMantenimiento): Mantenimiento[] {
  // TODO: reemplazar por la llamada real al servicio de mantenimientos,
  // ej. await mantenimientosApi.iniciar(nuevo)
  const { bienes } = useBienesData()
  const porId = new Map(bienes.map((bien) => [bien.id, bien]))

  const creados = nuevo.bienesIds.map((bienId) => {
    contadorMantenimiento += 1
    const bien = porId.get(bienId)

    const mantenimiento: Mantenimiento = {
      id: `mant-${contadorMantenimiento}`,
      folio: siguienteFolio(nuevo.tipo),
      tipo: nuevo.tipo,
      bienId,
      fecha: nuevo.fecha,
      tecnico: nuevo.tecnico,
      tecnicoId: nuevo.tecnicoId,
      descripcion: nuevo.descripcion,
      estatus: 'Programado',
      registradoPor: nombreActual(),
    }

    if (nuevo.tipo === 'Correctivo') {
      mantenimiento.prioridad = nuevo.prioridad
      mantenimiento.fallaReportada = nuevo.fallaReportada
      if (bien) {
        mantenimiento.estatusPrevioBien = bien.estatus
        bien.estatus = 'En reparación'
      }
    } else {
      mantenimiento.periodicidad = nuevo.periodicidad
      if (nuevo.periodicidad) mantenimiento.proximaFecha = sumarMesesIso(nuevo.fecha, PERIODOS_MESES[nuevo.periodicidad])
    }

    return mantenimiento
  })

  for (const mantenimiento of creados) mantenimientos.unshift(mantenimiento)
  auditar('Programar', `${creados.length} ${creados.length === 1 ? 'bien' : 'bienes'}`, `${nuevo.tipo} · ${creados.map((item) => item.folio).join(', ')}`)
  return creados
}

/**
 * Concluye un mantenimiento. En Correctivo, "Reparado" restaura el estatus previo del bien;
 * "No reparable" genera un Dictamen inmutable y pasa el bien a "Baja". Devuelve el dictamen si se generó.
 */
function concluirMantenimiento(id: string, datos: DatosConclusion): Dictamen | null {
  // TODO: reemplazar por la llamada real al servicio de mantenimientos,
  // ej. await mantenimientosApi.concluir(id, datos)
  const mantenimiento = mantenimientos.find((item) => item.id === id)
  if (!mantenimiento || mantenimiento.estatus === 'Concluido' || mantenimiento.estatus === 'Cancelado') return null
  // Un técnico solo concluye lo suyo, aunque la interfaz nunca le ofrezca lo ajeno.
  if (!esVisibleParaSesion(mantenimiento)) return null

  mantenimiento.estatus = 'Concluido'
  mantenimiento.fechaConclusion = datos.fechaConclusion
  mantenimiento.costo = datos.costo
  mantenimiento.notasConclusion = datos.notasConclusion

  if (mantenimiento.tipo !== 'Correctivo') {
    auditar('Concluir', mantenimiento.folio, 'Preventivo')
    return null
  }

  mantenimiento.resultado = datos.resultado
  const { bienes } = useBienesData()
  const bien = bienes.find((item) => item.id === mantenimiento.bienId)

  if (datos.resultado === 'Reparado') {
    if (bien) bien.estatus = mantenimiento.estatusPrevioBien ?? 'Por asignar'
    auditar('Concluir', mantenimiento.folio, 'Correctivo · Reparado')
    return null
  }

  if (datos.resultado === 'No reparable') {
    if (bien) bien.estatus = 'Baja'

    const dictamen: Dictamen = {
      id: `dict-${mantenimiento.id}`,
      folio: siguienteFolioDictamen(),
      mantenimientoId: mantenimiento.id,
      bienId: mantenimiento.bienId,
      bien: instantaneaBien(bien, mantenimiento.bienId),
      fecha: datos.fechaConclusion,
      causa: datos.causaBaja ?? 'Otro',
      conclusion: datos.conclusionDictamen ?? '',
      costoReparacion: datos.costoReparacion,
      valorReposicion: datos.valorReposicion,
      destinoFinal: datos.destinoFinal ?? 'Resguardo para baja',
      elaboradoPor: datos.elaboradoPor ?? nombreActual(),
    }
    dictamenes.unshift(dictamen)
    auditar('Dictamen de baja', mantenimiento.folio, `${dictamen.folio} · ${dictamen.causa} · ${dictamen.destinoFinal}`)
    return dictamen
  }

  return null
}

/**
 * Genera un dictamen de baja para cada bien sin pasar por el flujo de dos pasos (iniciar + concluir):
 * internamente crea el correctivo ya concluido como "No reparable" y su dictamen, para no duplicar esa lógica.
 */
function generarDictamenDirecto(nuevo: NuevoDictamenDirecto): Dictamen[] {
  // Se compone de "programar" + "concluir": se silencian sus registros y se deja uno solo.
  auditoriaSilenciada = true
  try {
    return generarDictamenesSinAuditoria(nuevo)
  } finally {
    auditoriaSilenciada = false
  }
}

function generarDictamenesSinAuditoria(nuevo: NuevoDictamenDirecto): Dictamen[] {
  const creados = iniciarMantenimiento({
    tipo: 'Correctivo',
    bienesIds: nuevo.bienesIds,
    fecha: nuevo.fecha,
    tecnico: nuevo.tecnico,
    tecnicoId: nuevo.tecnicoId,
    descripcion: nuevo.descripcion,
    prioridad: 'Alta',
    fallaReportada: nuevo.descripcion,
  })

  const dictamenesGenerados: Dictamen[] = []
  for (const mantenimiento of creados) {
    const dictamen = concluirMantenimiento(mantenimiento.id, {
      fechaConclusion: nuevo.fecha,
      resultado: 'No reparable',
      conclusionDictamen: nuevo.conclusion,
      elaboradoPor: nuevo.elaboradoPor,
      causaBaja: nuevo.causa,
      destinoFinal: nuevo.destinoFinal,
      costoReparacion: nuevo.costoReparacion,
      valorReposicion: nuevo.valorReposicion,
    })
    if (dictamen) dictamenesGenerados.push(dictamen)
  }
  registrarAuditoria(
    'Mantenimiento',
    'Dictamen de baja',
    `${dictamenesGenerados.length} ${dictamenesGenerados.length === 1 ? 'bien' : 'bienes'}`,
    `${dictamenesGenerados.map((item) => item.folio).join(', ')} · ${nuevo.causa}`,
  )
  return dictamenesGenerados
}

// Semilla determinista y relativa a hoy: siempre hay mantenimientos recientes, atrasados y por vencer,
// así el dashboard y las alertas muestran casos de cada tipo sin depender de la fecha en que se abra.
const ANTIGUEDAD_CORRECTIVOS_ABIERTOS = [3, 9, 15, 22, 28, 34, 41, 48, 56, 64, 72, 80, 90, 6, 12, 19]
const PRIORIDADES_SEMILLA: Prioridad[] = ['Media', 'Baja', 'Alta', 'Urgente']

function sembrarDatos() {
  const { bienes } = useBienesData()
  const hoy = hoyIso()
  const enDias = (dias: number) => sumarDiasIso(hoy, dias)
  const asignado = (indice: number) => ASIGNABLES_SEMILLA[indice % ASIGNABLES_SEMILLA.length]!

  // Bienes que el mock ya marca "En reparación": se les asocia el correctivo que los dejó así,
  // con antigüedades escalonadas (algunos recientes, otros atorados hace meses).
  bienes
    .filter((bien) => bien.estatus === 'En reparación')
    .forEach((bien, indice) => {
      contadorMantenimiento += 1
      mantenimientos.unshift({
        id: `mant-${contadorMantenimiento}`,
        folio: siguienteFolio('Correctivo'),
        tipo: 'Correctivo',
        bienId: bien.id,
        fecha: enDias(-ANTIGUEDAD_CORRECTIVOS_ABIERTOS[indice % ANTIGUEDAD_CORRECTIVOS_ABIERTOS.length]!),
        ...asignado(indice),
        descripcion: 'Revisión por falla reportada por el usuario',
        prioridad: PRIORIDADES_SEMILLA[indice % PRIORIDADES_SEMILLA.length],
        fallaReportada: FALLAS_EJEMPLO[indice % FALLAS_EJEMPLO.length],
        estatus: indice % 2 === 0 ? 'En curso' : 'Programado',
        estatusPrevioBien: bien.responsable ? 'Asignado' : 'Por asignar',
        registradoPor: nombreActual(),
      })
    })

  // Un par de bienes "Baja" ya existentes: se les asocia el correctivo y el dictamen que los llevó ahí.
  bienes
    .filter((bien) => bien.estatus === 'Baja')
    .slice(0, 2)
    .forEach((bien, indice) => {
      contadorMantenimiento += 1
      const mantenimientoId = `mant-${contadorMantenimiento}`
      const fecha = enDias(-(25 + indice * 20))
      mantenimientos.unshift({
        id: mantenimientoId,
        folio: siguienteFolio('Correctivo'),
        tipo: 'Correctivo',
        bienId: bien.id,
        fecha,
        ...asignado(indice),
        descripcion: 'Diagnóstico de falla',
        prioridad: 'Alta',
        fallaReportada: FALLAS_EJEMPLO[indice % FALLAS_EJEMPLO.length],
        estatus: 'Concluido',
        fechaConclusion: fecha,
        resultado: 'No reparable',
        estatusPrevioBien: 'Asignado',
        registradoPor: nombreActual(),
      })
      dictamenes.unshift({
        id: `dict-${mantenimientoId}`,
        folio: siguienteFolioDictamen(),
        mantenimientoId,
        bienId: bien.id,
        bien: snapshotDe(bien),
        fecha,
        causa: 'Costo de reparación no conviene',
        conclusion: 'El costo de reparación supera el valor de reposición del bien; se recomienda su baja definitiva.',
        costoReparacion: 3200,
        valorReposicion: 2800,
        destinoFinal: 'Destrucción / chatarra',
        elaboradoPor: asignado(indice + 1).tecnico,
      })
    })

  // Cada grupo usa bienes distintos entre sí, para que las alertas (una por bien) sean independientes.
  const activos = bienes.filter((bien) => bien.estatus === 'Asignado' || bien.estatus === 'Por asignar')
  const preventivo = (bien: Bien, indice: number, fecha: string, estatus: EstatusMantenimiento, periodicidad: Periodicidad) => {
    contadorMantenimiento += 1
    mantenimientos.unshift({
      id: `mant-${contadorMantenimiento}`,
      folio: siguienteFolio('Preventivo'),
      tipo: 'Preventivo',
      bienId: bien.id,
      fecha,
      ...asignado(indice),
      descripcion: 'Limpieza y revisión general programada',
      periodicidad,
      proximaFecha: sumarMesesIso(fecha, PERIODOS_MESES[periodicidad]),
      estatus,
      fechaConclusion: estatus === 'Concluido' ? fecha : undefined,
      registradoPor: nombreActual(),
    })
  }

  // Preventivos programados: 4 atrasados, 4 próximos y 2 lejanos.
  const OFFSETS_PROGRAMADOS = [-20, -14, -8, -3, 2, 5, 9, 14, 25, 40]
  OFFSETS_PROGRAMADOS.forEach((dias, indice) => {
    const bien = activos[indice]
    if (bien) preventivo(bien, indice, enDias(dias), 'Programado', PERIODICIDADES[indice % PERIODICIDADES.length]!)
  })

  // Preventivos concluidos en los últimos 60 días (alimentan la gráfica); según periodicidad y antigüedad,
  // su próxima fecha queda vencida, por vencer o lejana.
  for (let k = 0; k < 20; k += 1) {
    const bien = activos[OFFSETS_PROGRAMADOS.length + k]
    if (bien) preventivo(bien, k, enDias(-(2 + k * 3)), 'Concluido', PERIODICIDADES[k % PERIODICIDADES.length]!)
  }

  // Correctivos reparados en los últimos 60 días (alimentan la gráfica).
  for (let k = 0; k < 10; k += 1) {
    const bien = activos[OFFSETS_PROGRAMADOS.length + 20 + k]
    if (!bien) continue
    contadorMantenimiento += 1
    const fecha = enDias(-(3 + k * 5))
    mantenimientos.unshift({
      id: `mant-${contadorMantenimiento}`,
      folio: siguienteFolio('Correctivo'),
      tipo: 'Correctivo',
      bienId: bien.id,
      fecha,
      ...asignado(k),
      descripcion: 'Reparación de falla reportada',
      prioridad: PRIORIDADES_SEMILLA[k % PRIORIDADES_SEMILLA.length],
      fallaReportada: FALLAS_EJEMPLO[k % FALLAS_EJEMPLO.length],
      estatus: 'Concluido',
      fechaConclusion: sumarDiasIso(fecha, 1),
      costo: 500 + k * 120,
      resultado: 'Reparado',
      estatusPrevioBien: bien.estatus,
      registradoPor: nombreActual(),
    })
  }
}

sembrarDatos()

export function useMantenimientosData() {
  // TODO: reemplazar por la llamada real al servicio,
  // ej. await mantenimientosApi.getMantenimientos() / getDictamenes()
  const { bienes } = useBienesData()

  function bienDe(bienId: string): Bien | undefined {
    return bienes.find((bien) => bien.id === bienId)
  }

  function mantenimientoDe(mantenimientoId: string): Mantenimiento | undefined {
    return mantenimientos.find((mantenimiento) => mantenimiento.id === mantenimientoId)
  }

  return {
    mantenimientos,
    dictamenes,
    mantenimientosVisibles,
    dictamenesVisibles,
    iniciarMantenimiento,
    concluirMantenimiento,
    generarDictamenDirecto,
    bienDe,
    mantenimientoDe,
  }
}
