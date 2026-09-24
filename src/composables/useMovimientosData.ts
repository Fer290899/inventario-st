import { reactive } from 'vue'
import {
  DEPARTAMENTOS_SEMILLA,
  DIRECCIONES_SEMILLA,
  PUESTOS_SEMILLA,
  UBICACIONES_SEMILLA,
  USUARIOS_SEMILLA,
} from './catalogosSemilla'
import { registrarAuditoria } from './useAuditoria'
import { nombreActual } from './useAuth'
import { snapshotDe, useBienesData, type Bien, type BienSnapshot } from './useBienesData'

export type TipoMovimiento = 'Asignación' | 'Reasignación' | 'Devolución'
export type TipoHoja = 'Resguardo' | 'Entrega'

/** Persona que recibe los bienes y su ubicación administrativa. */
export interface Destino {
  persona: string
  puesto: string
  ubicacion: string
  direccion: string
  departamento: string
}

/** Registro inmutable de lo que se hizo; la custodia vigente vive en `Bien.responsable`. */
export interface Movimiento {
  id: string
  tipo: TipoMovimiento
  /** Fecha ISO (YYYY-MM-DD) */
  fecha: string
  asignadoPor: string
  destino?: Destino
  mesaAyuda: string
  notas?: string
  bienesIds: string[]
}

/** Documento generado por un movimiento. Es un snapshot: nunca se modifica. */
export interface Hoja {
  id: string
  tipo: TipoHoja
  /** FOLIO-R### (resguardo) o FOLIO-E### (entrega) */
  folio: string
  movimientoId: string
  movimiento: TipoMovimiento
  persona: string
  puesto?: string
  direccion: string
  departamento: string
  /** Fecha ISO (YYYY-MM-DD) */
  fecha: string
  asignadoPor: string
  bienesIds: string[]
  /** Datos de los bienes al emitir la hoja: editar un bien después no cambia lo firmado. */
  bienes: BienSnapshot[]
}

interface DatosBase {
  fecha: string
  mesaAyuda: string
  notas?: string
  bienesIds: string[]
}

export type NuevoMovimiento =
  | (DatosBase & { tipo: 'Asignación' | 'Reasignación'; destino: Destino })
  | (DatosBase & { tipo: 'Devolución' })

export interface FiltrosHojas {
  /** '' significa "todos los movimientos" */
  movimiento: TipoMovimiento | ''
  persona: string
  direccion: string
  departamento: string
  /** Fecha ISO (YYYY-MM-DD) o '' si no aplica */
  fechaDesde: string
  /** Fecha ISO (YYYY-MM-DD) o '' si no aplica */
  fechaHasta: string
}

export function filtrosHojasVacios(): FiltrosHojas {
  return { movimiento: '', persona: '', direccion: '', departamento: '', fechaDesde: '', fechaHasta: '' }
}

// Instancias compartidas: todas las vistas ven las mismas listas.
const movimientos = reactive<Movimiento[]>([])
const hojas = reactive<Hoja[]>([])

const contadores: Record<TipoHoja, number> = { Resguardo: 0, Entrega: 0 }
let contadorMovimiento = 0

function siguienteFolio(tipo: TipoHoja): string {
  contadores[tipo] += 1
  return `FOLIO-${tipo === 'Resguardo' ? 'R' : 'E'}${contadores[tipo]}`
}

/**
 * Registra un movimiento, actualiza la custodia de los bienes y genera sus hojas.
 * Devuelve las hojas creadas (las de entrega primero, el resguardo al final).
 */
function registrarMovimiento(nuevo: NuevoMovimiento): Hoja[] {
  // TODO: reemplazar por la llamada real al servicio de movimientos,
  // ej. await movimientosApi.registrar(nuevo)
  const { bienes } = useBienesData()
  const porId = new Map(bienes.map((bien) => [bien.id, bien]))
  const seleccion = nuevo.bienesIds.map((id) => porId.get(id)).filter((bien): bien is Bien => bien !== undefined)

  contadorMovimiento += 1
  const movimientoId = `mov-${contadorMovimiento}`
  const creadas: Hoja[] = []

  // Quien tenía los bienes los entrega: una hoja de entrega por cada responsable anterior.
  if (nuevo.tipo !== 'Asignación') {
    const porResponsable = new Map<string, Bien[]>()
    for (const bien of seleccion) {
      if (!bien.responsable) continue
      porResponsable.set(bien.responsable, [...(porResponsable.get(bien.responsable) ?? []), bien])
    }

    for (const [persona, lista] of porResponsable) {
      const ultimoResguardo = hojas.find((hoja) => hoja.tipo === 'Resguardo' && hoja.persona === persona)
      creadas.push({
        id: `hoja-${movimientoId}-entrega-${creadas.length + 1}`,
        tipo: 'Entrega',
        folio: siguienteFolio('Entrega'),
        movimientoId,
        movimiento: nuevo.tipo,
        persona,
        puesto: ultimoResguardo?.puesto,
        direccion: ultimoResguardo?.direccion ?? lista[0]?.direccion ?? '—',
        departamento: ultimoResguardo?.departamento ?? lista[0]?.departamento ?? '—',
        fecha: nuevo.fecha,
        asignadoPor: nombreActual(),
        bienesIds: lista.map((bien) => bien.id),
        bienes: lista.map(snapshotDe),
      })
    }
  }

  if (nuevo.tipo === 'Devolución') {
    for (const bien of seleccion) {
      bien.responsable = undefined
      bien.estatus = 'Por asignar'
    }
  } else {
    const { destino } = nuevo
    for (const bien of seleccion) {
      bien.responsable = destino.persona
      bien.estatus = 'Asignado'
      bien.ubicacion = destino.ubicacion
      bien.direccion = destino.direccion
      bien.departamento = destino.departamento
    }

    creadas.push({
      id: `hoja-${movimientoId}-resguardo`,
      tipo: 'Resguardo',
      folio: siguienteFolio('Resguardo'),
      movimientoId,
      movimiento: nuevo.tipo,
      persona: destino.persona,
      puesto: destino.puesto,
      direccion: destino.direccion,
      departamento: destino.departamento,
      fecha: nuevo.fecha,
      asignadoPor: nombreActual(),
      bienesIds: [...nuevo.bienesIds],
      bienes: seleccion.map(snapshotDe),
    })
  }

  movimientos.unshift({
    id: movimientoId,
    tipo: nuevo.tipo,
    fecha: nuevo.fecha,
    asignadoPor: nombreActual(),
    destino: nuevo.tipo === 'Devolución' ? undefined : nuevo.destino,
    mesaAyuda: nuevo.mesaAyuda,
    notas: nuevo.notas,
    bienesIds: [...nuevo.bienesIds],
  })
  for (const hoja of creadas) hojas.unshift(hoja)

  registrarAuditoria(
    'Movimientos',
    nuevo.tipo,
    `${seleccion.length} ${seleccion.length === 1 ? 'bien' : 'bienes'}`,
    [nuevo.tipo === 'Devolución' ? '' : `A ${nuevo.destino.persona}`, creadas.map((hoja) => hoja.folio).join(', ')].filter(Boolean).join(' · '),
  )

  return creadas
}

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0')
}

function randomFecha(): string {
  const year = 2022 + Math.floor(Math.random() * 3)
  const month = 1 + Math.floor(Math.random() * 12)
  const day = 1 + Math.floor(Math.random() * 28)
  return `${year}-${pad(month, 2)}-${pad(day, 2)}`
}

function destinoEjemplo(persona: string): Destino {
  return {
    persona,
    puesto: randomFrom(PUESTOS_SEMILLA),
    ubicacion: randomFrom(UBICACIONES_SEMILLA),
    direccion: randomFrom(DIRECCIONES_SEMILLA),
    departamento: randomFrom(DEPARTAMENTOS_SEMILLA),
  }
}

// Semilla: los bienes que el mock ya marca como "Asignado" se reparten entre los usuarios
// registrando movimientos reales, así custodia, movimientos y hojas cuentan la misma historia.
function sembrarDatos() {
  const { bienes } = useBienesData()
  const porUsuario = USUARIOS_SEMILLA.map<string[]>(() => [])

  bienes
    .filter((bien) => bien.estatus === 'Asignado')
    .forEach((bien, indice) => porUsuario[indice % USUARIOS_SEMILLA.length]!.push(bien.id))

  USUARIOS_SEMILLA.forEach((persona, indice) => {
    const ids = porUsuario[indice]!
    if (ids.length === 0) return
    registrarMovimiento({
      tipo: 'Asignación',
      destino: destinoEjemplo(persona),
      fecha: randomFecha(),
      mesaAyuda: `MA-${pad(1000 + indice * 13, 5)}`,
      bienesIds: ids,
    })
  })

  // Dos reasignaciones y una devolución para que el historial muestre los tres casos.
  registrarMovimiento({
    tipo: 'Reasignación',
    destino: destinoEjemplo(USUARIOS_SEMILLA[5]!),
    fecha: '2025-03-10',
    mesaAyuda: 'MA-01260',
    bienesIds: porUsuario[0]!.slice(0, 1),
  })
  registrarMovimiento({
    tipo: 'Reasignación',
    destino: destinoEjemplo(USUARIOS_SEMILLA[7]!),
    fecha: '2025-06-22',
    mesaAyuda: 'MA-01273',
    bienesIds: porUsuario[1]!.slice(0, 2),
  })
  registrarMovimiento({
    tipo: 'Devolución',
    fecha: '2025-08-15',
    mesaAyuda: 'MA-01301',
    notas: 'Equipo devuelto a almacén por cambio de área',
    bienesIds: porUsuario[2]!.slice(0, 1),
  })
}

sembrarDatos()

export function useMovimientosData() {
  // TODO: reemplazar por la llamada real al servicio,
  // ej. await movimientosApi.getHojas() / getMovimientos()
  const { bienes } = useBienesData()

  function bienesDe(ids: string[]): Bien[] {
    const porId = new Map(bienes.map((bien) => [bien.id, bien]))
    return ids.map((id) => porId.get(id)).filter((bien): bien is Bien => bien !== undefined)
  }

  return { movimientos, hojas, registrarMovimiento, bienesDe }
}
