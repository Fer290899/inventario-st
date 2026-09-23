import { reactive } from 'vue'
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
  tecnico: string
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

// TODO: reemplazar por el usuario de la sesión cuando exista autenticación real.
export const REGISTRADO_POR = 'Administrador'

export const TECNICOS_OPCIONES = [
  'Soporte Técnico Interno',
  'ServiTec Refacciones S.A.',
  'ElectroSoluciones del Bajío',
  'Ricardo Peña Osorio',
  'CompuServicios Integrales',
  'Mantenimiento Industrial Cruz',
]

const PRIORIDADES: Prioridad[] = ['Baja', 'Media', 'Alta', 'Urgente']
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

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

function randomFecha(): string {
  const year = 2023 + Math.floor(Math.random() * 3)
  const month = 1 + Math.floor(Math.random() * 12)
  const day = 1 + Math.floor(Math.random() * 28)
  return `${year}-${pad(month, 2)}-${pad(day, 2)}`
}

function sumarMeses(fechaIso: string, meses: number): string {
  const fecha = new Date(`${fechaIso}T00:00:00`)
  fecha.setMonth(fecha.getMonth() + meses)
  return fecha.toISOString().slice(0, 10)
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
      descripcion: nuevo.descripcion,
      estatus: 'Programado',
      registradoPor: REGISTRADO_POR,
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
      if (nuevo.periodicidad) mantenimiento.proximaFecha = sumarMeses(nuevo.fecha, PERIODOS_MESES[nuevo.periodicidad])
    }

    return mantenimiento
  })

  for (const mantenimiento of creados) mantenimientos.unshift(mantenimiento)
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

  mantenimiento.estatus = 'Concluido'
  mantenimiento.fechaConclusion = datos.fechaConclusion
  mantenimiento.costo = datos.costo
  mantenimiento.notasConclusion = datos.notasConclusion

  if (mantenimiento.tipo !== 'Correctivo') return null

  mantenimiento.resultado = datos.resultado
  const { bienes } = useBienesData()
  const bien = bienes.find((item) => item.id === mantenimiento.bienId)

  if (datos.resultado === 'Reparado') {
    if (bien) bien.estatus = mantenimiento.estatusPrevioBien ?? 'Por asignar'
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
      elaboradoPor: datos.elaboradoPor ?? REGISTRADO_POR,
    }
    dictamenes.unshift(dictamen)
    return dictamen
  }

  return null
}

/**
 * Genera un dictamen de baja para cada bien sin pasar por el flujo de dos pasos (iniciar + concluir):
 * internamente crea el correctivo ya concluido como "No reparable" y su dictamen, para no duplicar esa lógica.
 */
function generarDictamenDirecto(nuevo: NuevoDictamenDirecto): Dictamen[] {
  const creados = iniciarMantenimiento({
    tipo: 'Correctivo',
    bienesIds: nuevo.bienesIds,
    fecha: nuevo.fecha,
    tecnico: nuevo.tecnico,
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
  return dictamenesGenerados
}

// Semilla: coherente con los bienes que useBienesData ya generó (algunos "En reparación"/"Baja" de fábrica).
function sembrarDatos() {
  const { bienes } = useBienesData()

  // Bienes que el mock ya marca "En reparación": se les asocia el correctivo que los dejó así.
  bienes
    .filter((bien) => bien.estatus === 'En reparación')
    .forEach((bien, indice) => {
      contadorMantenimiento += 1
      mantenimientos.unshift({
        id: `mant-${contadorMantenimiento}`,
        folio: siguienteFolio('Correctivo'),
        tipo: 'Correctivo',
        bienId: bien.id,
        fecha: randomFecha(),
        tecnico: randomFrom(TECNICOS_OPCIONES),
        descripcion: 'Revisión por falla reportada por el usuario',
        prioridad: randomFrom(PRIORIDADES),
        fallaReportada: randomFrom(FALLAS_EJEMPLO),
        estatus: indice % 2 === 0 ? 'En curso' : 'Programado',
        estatusPrevioBien: bien.responsable ? 'Asignado' : 'Por asignar',
        registradoPor: REGISTRADO_POR,
      })
    })

  // Un par de bienes "Baja" ya existentes: se les asocia el correctivo y el dictamen que los llevó ahí.
  bienes
    .filter((bien) => bien.estatus === 'Baja')
    .slice(0, 2)
    .forEach((bien) => {
      contadorMantenimiento += 1
      const mantenimientoId = `mant-${contadorMantenimiento}`
      const fecha = randomFecha()
      mantenimientos.unshift({
        id: mantenimientoId,
        folio: siguienteFolio('Correctivo'),
        tipo: 'Correctivo',
        bienId: bien.id,
        fecha,
        tecnico: randomFrom(TECNICOS_OPCIONES),
        descripcion: 'Diagnóstico de falla',
        prioridad: 'Alta',
        fallaReportada: randomFrom(FALLAS_EJEMPLO),
        estatus: 'Concluido',
        fechaConclusion: sumarMeses(fecha, 0),
        resultado: 'No reparable',
        estatusPrevioBien: 'Asignado',
        registradoPor: REGISTRADO_POR,
      })
      dictamenes.unshift({
        id: `dict-${mantenimientoId}`,
        folio: siguienteFolioDictamen(),
        mantenimientoId,
        bienId: bien.id,
        bien: snapshotDe(bien),
        fecha: sumarMeses(fecha, 0),
        causa: 'Costo de reparación no conviene',
        conclusion: 'El costo de reparación supera el valor de reposición del bien; se recomienda su baja definitiva.',
        costoReparacion: 3200,
        valorReposicion: 2800,
        destinoFinal: 'Destrucción / chatarra',
        elaboradoPor: randomFrom(TECNICOS_OPCIONES),
      })
    })

  // Preventivos de ejemplo sobre bienes activos: algunos concluidos, otros programados.
  bienes
    .filter((bien) => bien.estatus === 'Asignado' || bien.estatus === 'Por asignar')
    .slice(0, 8)
    .forEach((bien, indice) => {
      contadorMantenimiento += 1
      const periodicidad = randomFrom(PERIODICIDADES)
      const fecha = randomFecha()
      const concluido = indice % 2 === 0
      mantenimientos.unshift({
        id: `mant-${contadorMantenimiento}`,
        folio: siguienteFolio('Preventivo'),
        tipo: 'Preventivo',
        bienId: bien.id,
        fecha,
        tecnico: randomFrom(TECNICOS_OPCIONES),
        descripcion: 'Limpieza y revisión general programada',
        periodicidad,
        proximaFecha: sumarMeses(fecha, PERIODOS_MESES[periodicidad]),
        estatus: concluido ? 'Concluido' : 'Programado',
        fechaConclusion: concluido ? sumarMeses(fecha, 0) : undefined,
        registradoPor: REGISTRADO_POR,
      })
    })
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
    TECNICOS_OPCIONES,
    iniciarMantenimiento,
    concluirMantenimiento,
    generarDictamenDirecto,
    bienDe,
    mantenimientoDe,
  }
}
