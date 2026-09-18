import { reactive } from 'vue'
import { DEPARTAMENTO_OPCIONES, DIRECCION_OPCIONES, UBICACION_OPCIONES, useBienesData, type Bien } from './useBienesData'

export type TipoMovimiento = 'Asignación' | 'Reasignación'
export type TipoHoja = 'Resguardo' | 'Entrega'

export interface Asignacion {
  id: string
  tipo: TipoMovimiento
  /** Folio de la hoja de resguardo generada por este movimiento (FOLIO-R###) */
  folioResguardo: string
  persona: string
  puesto?: string
  ubicacion: string
  direccion: string
  departamento: string
  /** Fecha ISO (YYYY-MM-DD) */
  fechaAsignacion: string
  mesaAyuda: string
  notas?: string
  /** Ids de los bienes que actualmente están bajo esta asignación */
  bienesIds: string[]
}

export interface Hoja {
  id: string
  tipo: TipoHoja
  /** FOLIO-R### (resguardo) o FOLIO-E### (entrega) */
  folio: string
  /** Id del movimiento que la generó; una reasignación genera una Entrega y un Resguardo con el mismo id */
  movimientoId: string
  movimiento: TipoMovimiento
  persona: string
  puesto?: string
  direccion: string
  departamento: string
  /** Fecha ISO (YYYY-MM-DD) */
  fecha: string
  bienesIds: string[]
}

export type DatosMovimiento = Omit<Asignacion, 'id' | 'tipo' | 'folioResguardo' | 'bienesIds'>

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

export const USUARIOS_OPCIONES = [
  'Ana Torres Medina',
  'Carlos Jiménez Ruiz',
  'María Fernández López',
  'Luis Hernández Castro',
  'Sofía Ramírez Ortiz',
  'Jorge Salinas Peña',
  'Daniela Cruz Villanueva',
  'Roberto Gómez Silva',
  'Patricia Mendoza Rivas',
  'Fernando Reyes Aguilar',
  'Claudia Navarro Soto',
  'Miguel Ángel Domínguez',
]

const PUESTOS_EJEMPLO = ['Jefe de departamento', 'Analista', 'Auxiliar administrativo', 'Coordinador', 'Técnico de soporte']

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0')
}

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

function randomFechaAsignacion(): string {
  const year = 2022 + Math.floor(Math.random() * 3)
  const month = 1 + Math.floor(Math.random() * 12)
  const day = 1 + Math.floor(Math.random() * 28)
  return `${year}-${pad(month, 2)}-${pad(day, 2)}`
}

// Instancias compartidas: todas las vistas ven las mismas listas.
const asignaciones = reactive<Asignacion[]>([])
const hojas = reactive<Hoja[]>([])

let contadorResguardo = 0
let contadorEntrega = 0
let contadorMovimiento = 0

function siguienteFolio(tipo: TipoHoja): string {
  if (tipo === 'Resguardo') {
    contadorResguardo += 1
    return `FOLIO-R${contadorResguardo}`
  }
  contadorEntrega += 1
  return `FOLIO-E${contadorEntrega}`
}

function registrarMovimiento(tipo: TipoMovimiento, datos: DatosMovimiento, bienesIds: string[]) {
  // TODO: reemplazar por la llamada real al servicio de asignaciones,
  // ej. await asignacionesApi.registrarMovimiento({ tipo, ...datos, bienesIds })
  contadorMovimiento += 1
  const movimientoId = `mov-${contadorMovimiento}`
  const idsMovidos = new Set(bienesIds)

  if (tipo === 'Reasignación') {
    // El responsable anterior entrega los bienes que se mueven: una hoja de
    // entrega por cada asignación de origen, ligada al mismo movimiento.
    for (const anterior of asignaciones) {
      const entregados = anterior.bienesIds.filter((id) => idsMovidos.has(id))
      if (entregados.length === 0) continue

      anterior.bienesIds = anterior.bienesIds.filter((id) => !idsMovidos.has(id))
      hojas.unshift({
        id: `hoja-${movimientoId}-entrega-${anterior.id}`,
        tipo: 'Entrega',
        folio: siguienteFolio('Entrega'),
        movimientoId,
        movimiento: tipo,
        persona: anterior.persona,
        puesto: anterior.puesto,
        direccion: anterior.direccion,
        departamento: anterior.departamento,
        fecha: datos.fechaAsignacion,
        bienesIds: entregados,
      })
    }
  } else {
    const { bienes } = useBienesData()
    bienes.forEach((bien) => {
      if (idsMovidos.has(bien.id)) bien.estatus = 'Asignado'
    })
  }

  const folioResguardo = siguienteFolio('Resguardo')
  asignaciones.unshift({ id: movimientoId, tipo, folioResguardo, ...datos, bienesIds: [...bienesIds] })
  hojas.unshift({
    id: `hoja-${movimientoId}-resguardo`,
    tipo: 'Resguardo',
    folio: folioResguardo,
    movimientoId,
    movimiento: tipo,
    persona: datos.persona,
    puesto: datos.puesto,
    direccion: datos.direccion,
    departamento: datos.departamento,
    fecha: datos.fechaAsignacion,
    bienesIds: [...bienesIds],
  })
}

function datosEjemplo(persona: string, indice: number, fecha = randomFechaAsignacion()): DatosMovimiento {
  return {
    persona,
    puesto: randomFrom(PUESTOS_EJEMPLO),
    ubicacion: randomFrom(UBICACION_OPCIONES),
    direccion: randomFrom(DIRECCION_OPCIONES),
    departamento: randomFrom(DEPARTAMENTO_OPCIONES),
    fechaAsignacion: fecha,
    mesaAyuda: `MA-${pad(1000 + indice * 13, 5)}`,
  }
}

// Semilla: los bienes que ya están "Asignado" se reparten entre los usuarios de
// ejemplo, para que asignaciones y bienes cuenten la misma historia.
function sembrarDatos() {
  const { bienes } = useBienesData()
  const porUsuario = USUARIOS_OPCIONES.map<string[]>(() => [])

  bienes
    .filter((bien) => bien.estatus === 'Asignado')
    .forEach((bien, indice) => porUsuario[indice % USUARIOS_OPCIONES.length]!.push(bien.id))

  USUARIOS_OPCIONES.forEach((persona, indice) => {
    const ids = porUsuario[indice]!
    if (ids.length > 0) registrarMovimiento('Asignación', datosEjemplo(persona, indice), ids)
  })

  // Dos reasignaciones para que el historial muestre pares Entrega/Resguardo.
  const deAna = porUsuario[0]!.slice(0, 1)
  const deCarlos = porUsuario[1]!.slice(0, 2)
  if (deAna.length > 0) registrarMovimiento('Reasignación', datosEjemplo(USUARIOS_OPCIONES[5]!, 20, '2025-03-10'), deAna)
  if (deCarlos.length > 0) registrarMovimiento('Reasignación', datosEjemplo(USUARIOS_OPCIONES[7]!, 21, '2025-06-22'), deCarlos)
}

sembrarDatos()

export function useAsignacionesData() {
  // TODO: reemplazar por la llamada real al servicio de asignaciones,
  // ej. await asignacionesApi.getAsignaciones() / getHojas()
  const { bienes } = useBienesData()

  function bienesDe(ids: string[]): Bien[] {
    const porId = new Map(bienes.map((bien) => [bien.id, bien]))
    return ids.map((id) => porId.get(id)).filter((bien): bien is Bien => bien !== undefined)
  }

  function responsableActualDe(bienId: string): string | undefined {
    return asignaciones.find((asignacion) => asignacion.bienesIds.includes(bienId))?.persona
  }

  return { asignaciones, hojas, registrarMovimiento, bienesDe, responsableActualDe }
}
