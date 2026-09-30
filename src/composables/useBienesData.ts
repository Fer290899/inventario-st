import { reactive } from 'vue'
import { formatFecha, formatMoneda, hoyIso, sumarDiasIso, sumarMesesIso } from '@/utils/formato'
import { registrarAuditoria } from './useAuditoria'
import { nombreActual } from './useAuth'
import { DEPARTAMENTOS_SEMILLA, DIRECCIONES_SEMILLA, UBICACIONES_SEMILLA } from './catalogosSemilla'

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
  /** Texto derivado: resumen de `valores` + `observaciones` (los bienes heredados conservan aquí su texto libre). */
  caracteristicas: string
  /** Valores de las características definidas en el tipo, por id de `CaracteristicaDef`. */
  valores?: Record<string, string | number | boolean>
  observaciones?: string
  /** Importe en MXN */
  valorAdquisicion?: number
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
  /** Custodia vigente: persona que tiene el bien. Solo existe si `estatus === 'Asignado'`. */
  responsable?: string
  /** Foto del bien como data URL; opcional. No se audita en bitácora (es demasiado pesada para un diff de texto). */
  foto?: string
}

/** Copia fija de los datos del bien al emitir un documento (hoja, dictamen): editar el bien después no la altera. */
export type BienSnapshot = Pick<Bien, 'id' | 'nombre' | 'marca' | 'modelo' | 'numeroSerie' | 'numeroInventario' | 'caracteristicas'>

export function snapshotDe(bien: Bien): BienSnapshot {
  const { id, nombre, marca, modelo, numeroSerie, numeroInventario, caracteristicas } = bien
  return { id, nombre, marca, modelo, numeroSerie, numeroInventario, caracteristicas }
}

type Plantilla = Pick<Bien, 'nombre' | 'modelo' | 'marca' | 'caracteristicas' | 'mesesGarantia' | 'inventariable' | 'valorAdquisicion'>

const PLANTILLAS: Plantilla[] = [
  { nombre: 'Memoria RAM', modelo: 'KDMD', marca: 'HP', caracteristicas: 'MLKJCW', mesesGarantia: 12, inventariable: true , valorAdquisicion: 850 },
  { nombre: 'No-Break', modelo: 'R-UPR758', marca: 'CDP', caracteristicas: 'No Break CDP 750VA/375W, 8 contactos y sup. de picos', mesesGarantia: 12, inventariable: true , valorAdquisicion: 2400 },
  { nombre: 'Monitor', modelo: 'E2020H', marca: 'DELL', caracteristicas: 'Pantalla LED 20"', mesesGarantia: 12, inventariable: true , valorAdquisicion: 3200 },
  { nombre: 'Teclado', modelo: 'N/T', marca: 'DELL', caracteristicas: 'Alámbrico USB', mesesGarantia: 12, inventariable: true , valorAdquisicion: 350 },
  { nombre: 'No-Break', modelo: 'TPB-S', marca: 'TRIPP-LITE', caracteristicas: '500 VA', mesesGarantia: 12, inventariable: true , valorAdquisicion: 1800 },
  { nombre: 'Mouse', modelo: 'MS116T1', marca: 'DELL', caracteristicas: 'Alámbrico USB', mesesGarantia: 12, inventariable: true , valorAdquisicion: 180 },
  { nombre: 'Computadora', modelo: 'OPTIPLEX 3070', marca: 'DELL', caracteristicas: 'Computadora mini', mesesGarantia: 24, inventariable: true , valorAdquisicion: 14500 },
  { nombre: 'Teclado', modelo: 'KU-0225', marca: 'LENOVO', caracteristicas: 'Alámbrico USB', mesesGarantia: 12, inventariable: true , valorAdquisicion: 380 },
  { nombre: 'Teclado', modelo: 'Sin modelo', marca: 'Sin marca', caracteristicas: 'Alámbrico', mesesGarantia: 0, inventariable: false , valorAdquisicion: 120 },
  { nombre: 'Impresora', modelo: 'LaserJet Pro M404', marca: 'HP', caracteristicas: 'Láser monocromática', mesesGarantia: 12, inventariable: true , valorAdquisicion: 6800 },
  { nombre: 'Silla', modelo: 'ERGO-200', marca: 'Requiez', caracteristicas: 'Silla ejecutiva', mesesGarantia: 6, inventariable: true , valorAdquisicion: 2900 },
  { nombre: 'Escritorio', modelo: 'D-120', marca: 'OfficeMax', caracteristicas: 'Escritorio metálico 1.2m', mesesGarantia: 0, inventariable: true , valorAdquisicion: 3600 },
]

const ESTATUS_OPCIONES: EstatusBien[] = ['Asignado', 'Asignado', 'Asignado', 'Por asignar', 'En reparación', 'Baja']

// Ubicación, dirección y departamento viven en el módulo de Administración (useCatalogosData).
export const ORIGEN_OPCIONES = ['Compra directa', 'Licitación', 'Donación', 'Comodato', 'Transferencia interna']

export interface FiltrosBienes {
  /** '' significa "todos los tipos" */
  tipo: string
  /** '' significa "todos los estatus" */
  estatus: EstatusBien | ''
  inventariable: 'todos' | 'si' | 'no'
  ubicacion: string
  direccion: string
  departamento: string
  /** '' significa "todos los responsables" */
  responsable: string
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
    responsable: '',
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

// Alta calculada para que la garantía venza dentro de 10-55 días: así el mock siempre tiene casos "por vencer".
function fechaAltaConGarantiaPorVencer(mesesGarantia: number, indice: number): string {
  const vencimiento = sumarDiasIso(hoyIso(), 10 + ((indice * 3) % 46))
  return sumarMesesIso(vencimiento, -mesesGarantia)
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
      fechaAlta: i % 7 === 0 && plantilla.mesesGarantia > 0 ? fechaAltaConGarantiaPorVencer(plantilla.mesesGarantia, i) : randomFechaAlta(),
      estatus: randomFrom(ESTATUS_OPCIONES),
      origen: randomFrom(ORIGEN_OPCIONES),
      ubicacion: randomFrom(UBICACIONES_SEMILLA),
      direccion: randomFrom(DIRECCIONES_SEMILLA),
      departamento: randomFrom(DEPARTAMENTOS_SEMILLA),
    })
  }

  return bienes
}

// Instancia compartida: todas las vistas que usen useBienesData() ven la
// misma lista (para que un alta hecha desde el modal aparezca en la tabla).
const bienes = reactive<Bien[]>(generateBienes(140))

export interface CambioBitacora {
  campo: string
  antes: string
  despues: string
}

/** Registro de una edición de bien: qué cambió, cuándo y quién. */
export interface RegistroBitacora {
  id: string
  bienId: string
  /** Fecha ISO (YYYY-MM-DD) */
  fecha: string
  accion: 'Edición'
  cambios: CambioBitacora[]
  registradoPor: string
}

const bitacora = reactive<RegistroBitacora[]>([])
let contadorBitacora = 0

const aFecha = (valor: unknown) => (valor ? formatFecha(String(valor)) : '')

const CAMPOS_BITACORA: Array<{ campo: keyof Bien; etiqueta: string; formato?: (valor: unknown) => string }> = [
  { campo: 'nombre', etiqueta: 'Tipo de bien' },
  { campo: 'marca', etiqueta: 'Marca' },
  { campo: 'modelo', etiqueta: 'Modelo' },
  { campo: 'numeroSerie', etiqueta: 'Número de serie' },
  { campo: 'numeroInventario', etiqueta: 'Número de inventario' },
  { campo: 'fechaAlta', etiqueta: 'Fecha de alta', formato: aFecha },
  { campo: 'mesesGarantia', etiqueta: 'Meses de garantía' },
  { campo: 'inventariable', etiqueta: 'Inventariable', formato: (valor) => (valor ? 'Sí' : 'No') },
  { campo: 'origen', etiqueta: 'Origen' },
  { campo: 'numeroFactura', etiqueta: 'Número de factura' },
  { campo: 'fechaFactura', etiqueta: 'Fecha de factura', formato: aFecha },
  {
    campo: 'valorAdquisicion',
    etiqueta: 'Valor de adquisición',
    formato: (valor) => (valor === undefined || valor === '' ? '' : formatMoneda(Number(valor), { centavos: true })),
  },
  { campo: 'mesaAyuda', etiqueta: 'Mesa de ayuda' },
  { campo: 'ubicacion', etiqueta: 'Ubicación' },
  { campo: 'direccion', etiqueta: 'Dirección' },
  { campo: 'departamento', etiqueta: 'Departamento' },
  { campo: 'caracteristicas', etiqueta: 'Características' },
]

function comoTexto(valor: unknown, formato?: (valor: unknown) => string): string {
  if (valor === undefined || valor === null || valor === '') return '—'
  const texto = formato ? formato(valor) : String(valor)
  return texto === '' ? '—' : texto
}

function calcularCambios(antes: Bien, datos: Partial<Bien>): CambioBitacora[] {
  const cambios: CambioBitacora[] = []
  for (const { campo, etiqueta, formato } of CAMPOS_BITACORA) {
    if (!(campo in datos)) continue
    const previo = antes[campo]
    const nuevo = datos[campo]
    if ((previo ?? '') !== (nuevo ?? '')) {
      cambios.push({ campo: etiqueta, antes: comoTexto(previo, formato), despues: comoTexto(nuevo, formato) })
    }
  }
  return cambios
}

// Los ids no dependen solo del reloj: dos altas en el mismo milisegundo (importación masiva) no deben chocar.
let contadorIds = 0
function nuevoId(): string {
  contadorIds += 1
  return `bien-${Date.now()}-${contadorIds}`
}

export function useBienesData() {
  // TODO: reemplazar por la llamada real al servicio/store de bienes,
  // ej. await bienesApi.getBienes({ pagina, tamano, busqueda })

  function agregarBien(datos: Omit<Bien, 'id'>) {
    // TODO: reemplazar por la llamada real al servicio de alta de bienes,
    // ej. await bienesApi.crearBien(datos)
    bienes.unshift({ id: nuevoId(), ...datos })
    registrarAuditoria('Bienes', 'Alta', `${datos.nombre} ${datos.marca}`.trim(), datos.numeroInventario || datos.numeroSerie)
  }

  /** Alta de varios bienes de una vez (importación por CSV): un solo registro de auditoría. */
  function agregarBienes(lista: Array<Omit<Bien, 'id'>>) {
    // TODO: reemplazar por la llamada real al servicio de alta masiva, ej. await bienesApi.importarBienes(lista)
    for (const datos of [...lista].reverse()) bienes.unshift({ id: nuevoId(), ...datos })
    registrarAuditoria('Bienes', 'Importación', `${lista.length} ${lista.length === 1 ? 'bien' : 'bienes'}`, 'Alta masiva por CSV')
  }

  /** ¿Ya hay otro bien con ese número de serie? Compara sin distinguir mayúsculas ni espacios en los extremos. */
  function existeNumeroSerie(numeroSerie: string, ignorarId?: string): boolean {
    const buscado = numeroSerie.trim().toLowerCase()
    return buscado !== '' && bienes.some((bien) => bien.id !== ignorarId && bien.numeroSerie.trim().toLowerCase() === buscado)
  }

  function existeNumeroInventario(numeroInventario: string, ignorarId?: string): boolean {
    const buscado = numeroInventario.trim().toLowerCase()
    return buscado !== '' && bienes.some((bien) => bien.id !== ignorarId && bien.numeroInventario.trim().toLowerCase() === buscado)
  }

  function actualizarBien(id: string, datos: Partial<Omit<Bien, 'id' | 'estatus' | 'responsable'>>) {
    // TODO: reemplazar por la llamada real al servicio de bienes,
    // ej. await bienesApi.actualizarBien(id, datos)
    const bien = bienes.find((item) => item.id === id)
    if (!bien) return

    const cambios = calcularCambios(bien, datos)
    Object.assign(bien, datos)
    if (cambios.length > 0) {
      contadorBitacora += 1
      registrarAuditoria('Bienes', 'Edición', `${bien.nombre} ${bien.marca}`.trim(), cambios.map((cambio) => `${cambio.campo}: ${cambio.antes} → ${cambio.despues}`).join(' · '))
      bitacora.unshift({ id: `bit-${contadorBitacora}`, bienId: id, fecha: hoyIso(), accion: 'Edición', cambios, registradoPor: nombreActual() })
    }
  }

  return { bienes, agregarBien, agregarBienes, actualizarBien, existeNumeroSerie, existeNumeroInventario, bitacora }
}
