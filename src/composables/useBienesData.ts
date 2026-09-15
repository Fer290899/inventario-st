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
    })
  }

  return bienes
}

export function useBienesData() {
  // TODO: reemplazar por la llamada real al servicio/store de bienes,
  // ej. await bienesApi.getBienes({ pagina, tamano, busqueda })
  const bienes = generateBienes(140)

  return { bienes }
}
