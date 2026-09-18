import { reactive } from 'vue'

export type EstatusBien = 'Asignado' | 'Por asignar' | 'En reparación' | 'Baja'

export interface Bien {
  id: string
  nombre: string
  modelo: string
  marca: string
  numeroSerie: string
  numeroInventario: string
  /** Fecha ISO (YYYY-MM-DD) */
  fechaAlta: string
  caracteristicas: string
  mesesGarantia: number
  estatus: EstatusBien
  inventariable: boolean
  // Datos adicionales del expediente del bien (no se muestran en la tabla,
  // pero sí en el alta/ficha). Opcionales porque los bienes de ejemplo
  // generados no los traen cargados.
  origen?: string
  numeroFactura?: string
  /** Fecha ISO (YYYY-MM-DD) */
  fechaFactura?: string
  mesaAyuda?: string
  ubicacion?: string
  direccion?: string
  departamento?: string
}

type Plantilla = Pick<Bien, 'nombre' | 'modelo' | 'marca' | 'caracteristicas' | 'mesesGarantia' | 'inventariable'>

const PLANTILLAS: Plantilla[] = [
  { nombre: 'Memoria RAM', modelo: 'KDMD', marca: 'HP', caracteristicas: 'MLKJCW', mesesGarantia: 12, inventariable: true },
  { nombre: 'No-Break', modelo: 'R-UPR758', marca: 'CDP', caracteristicas: 'No Break CDP 750VA/375W, 8 contactos y sup. de picos', mesesGarantia: 12, inventariable: true },
  { nombre: 'Monitor', modelo: 'E2020H', marca: 'DELL', caracteristicas: 'Pantalla LED 20"', mesesGarantia: 12, inventariable: true },
  { nombre: 'Teclado', modelo: 'N/T', marca: 'DELL', caracteristicas: 'Alámbrico USB', mesesGarantia: 12, inventariable: true },
  { nombre: 'No-Break', modelo: 'TPB-S', marca: 'TRIPP-LITE', caracteristicas: '500 VA', mesesGarantia: 12, inventariable: true },
  { nombre: 'Mouse', modelo: 'MS116T1', marca: 'DELL', caracteristicas: 'Alámbrico USB', mesesGarantia: 12, inventariable: true },
  { nombre: 'Computadora', modelo: 'OPTIPLEX 3070', marca: 'DELL', caracteristicas: 'Computadora mini', mesesGarantia: 24, inventariable: true },
  { nombre: 'Teclado', modelo: 'KU-0225', marca: 'LENOVO', caracteristicas: 'Alámbrico USB', mesesGarantia: 12, inventariable: true },
  { nombre: 'Teclado', modelo: 'Sin modelo', marca: 'Sin marca', caracteristicas: 'Alámbrico', mesesGarantia: 0, inventariable: false },
  { nombre: 'Impresora', modelo: 'LaserJet Pro M404', marca: 'HP', caracteristicas: 'Láser monocromática', mesesGarantia: 12, inventariable: true },
  { nombre: 'Silla', modelo: 'ERGO-200', marca: 'Requiez', caracteristicas: 'Silla ejecutiva', mesesGarantia: 6, inventariable: true },
  { nombre: 'Escritorio', modelo: 'D-120', marca: 'OfficeMax', caracteristicas: 'Escritorio metálico 1.2m', mesesGarantia: 0, inventariable: true },
]

const ESTATUS_OPCIONES: EstatusBien[] = ['Asignado', 'Asignado', 'Asignado', 'Por asignar', 'En reparación', 'Baja']

// Catálogos de ejemplo para el formulario de alta de bienes.
// TODO: reemplazar por los catálogos reales del módulo de Administración
// (Ubicación, Dirección, Departamento) una vez que existan.
export const TIPOS_BIEN_OPCIONES = [...new Set(PLANTILLAS.map((plantilla) => plantilla.nombre))]
export const ORIGEN_OPCIONES = ['Compra directa', 'Licitación', 'Donación', 'Comodato', 'Transferencia interna']
export const UBICACION_OPCIONES = ['Edificio Central - Piso 1', 'Edificio Central - Piso 2', 'Bodega General', 'Anexo Norte', 'Anexo Sur']
export const DIRECCION_OPCIONES = ['Dirección General', 'Dirección de Administración', 'Dirección de Sistemas', 'Dirección Jurídica', 'Dirección de Finanzas']
export const DEPARTAMENTO_OPCIONES = ['Recursos Humanos', 'Tecnologías de la Información', 'Contabilidad', 'Mantenimiento', 'Compras']

export interface FiltrosBienes {
  /** '' significa "todos los tipos" */
  tipo: string
  /** '' significa "todos los estatus" */
  estatus: EstatusBien | ''
  inventariable: 'todos' | 'si' | 'no'
  ubicacion: string
  direccion: string
  departamento: string
  /** Fecha ISO (YYYY-MM-DD) o '' si no aplica */
  fechaAltaDesde: string
  /** Fecha ISO (YYYY-MM-DD) o '' si no aplica */
  fechaAltaHasta: string
}

export function filtrosVacios(): FiltrosBienes {
  return {
    tipo: '',
    estatus: '',
    inventariable: 'todos',
    ubicacion: '',
    direccion: '',
    departamento: '',
    fechaAltaDesde: '',
    fechaAltaHasta: '',
  }
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, '0')
}

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

function randomFechaAlta(): string {
  const year = 2019 + Math.floor(Math.random() * 7)
  const month = 1 + Math.floor(Math.random() * 12)
  const day = 1 + Math.floor(Math.random() * 28)
  return `${year}-${pad(month, 2)}-${pad(day, 2)}`
}

function generateBienes(count: number): Bien[] {
  const bienes: Bien[] = []

  for (let i = 0; i < count; i += 1) {
    const plantilla = PLANTILLAS[i % PLANTILLAS.length]!

    bienes.push({
      id: `bien-${i + 1}`,
      ...plantilla,
      numeroSerie: `${pad(100000 + i, 6)}${pad((i * 7) % 1000, 3)}`,
      numeroInventario: `ISS-${pad(20000 + i, 5)}-${pad((i * 3) % 1000, 3)}-${pad(20 + (i % 5), 2)}-${pad(i % 9999, 4)}`,
      fechaAlta: randomFechaAlta(),
      estatus: randomFrom(ESTATUS_OPCIONES),
      origen: randomFrom(ORIGEN_OPCIONES),
      ubicacion: randomFrom(UBICACION_OPCIONES),
      direccion: randomFrom(DIRECCION_OPCIONES),
      departamento: randomFrom(DEPARTAMENTO_OPCIONES),
    })
  }

  return bienes
}

// Instancia compartida: todas las vistas que usen useBienesData() ven la
// misma lista (para que un alta hecha desde el modal aparezca en la tabla).
const bienes = reactive<Bien[]>(generateBienes(140))

export function useBienesData() {
  // TODO: reemplazar por la llamada real al servicio/store de bienes,
  // ej. await bienesApi.getBienes({ pagina, tamano, busqueda })

  function agregarBien(datos: Omit<Bien, 'id'>) {
    // TODO: reemplazar por la llamada real al servicio de alta de bienes,
    // ej. await bienesApi.crearBien(datos)
    bienes.unshift({ id: `bien-${Date.now()}`, ...datos })
  }

  return { bienes, agregarBien }
}
