import { hoyIso } from '@/utils/formato'
import { resumirCaracteristicas, type ValorCaracteristica } from '@/utils/caracteristicas'
import { ORIGEN_OPCIONES, useBienesData, type Bien } from './useBienesData'
import { useCatalogosData } from './useCatalogosData'
import { useTiposBienData, type CaracteristicaDef, type TipoBien } from './useTiposBienData'

export const MAX_FILAS_IMPORTACION = 500

export type CampoImportacion =
  | 'tipo'
  | 'marca'
  | 'modelo'
  | 'numeroSerie'
  | 'numeroInventario'
  | 'fechaAlta'
  | 'origen'
  | 'numeroFactura'
  | 'fechaFactura'
  | 'valorAdquisicion'
  | 'mesesGarantia'
  | 'ubicacion'
  | 'direccion'
  | 'departamento'
  | 'mesaAyuda'
  | 'inventariable'
  | 'observaciones'

const COLUMNAS: Array<{ campo: CampoImportacion; encabezado: string; ejemplo: string }> = [
  { campo: 'tipo', encabezado: 'Tipo de bien', ejemplo: 'Computadora' },
  { campo: 'marca', encabezado: 'Marca', ejemplo: 'DELL' },
  { campo: 'modelo', encabezado: 'Modelo', ejemplo: 'OptiPlex 3070' },
  { campo: 'numeroSerie', encabezado: 'Número de serie', ejemplo: 'SN-000123' },
  { campo: 'numeroInventario', encabezado: 'Número de inventario', ejemplo: 'INV-000123' },
  { campo: 'fechaAlta', encabezado: 'Fecha de alta', ejemplo: hoyIso() },
  { campo: 'origen', encabezado: 'Origen', ejemplo: 'Compra directa' },
  { campo: 'numeroFactura', encabezado: 'Número de factura', ejemplo: 'F-2045' },
  { campo: 'fechaFactura', encabezado: 'Fecha de factura', ejemplo: hoyIso() },
  { campo: 'valorAdquisicion', encabezado: 'Valor de adquisición', ejemplo: '14500.00' },
  { campo: 'mesesGarantia', encabezado: 'Meses de garantía', ejemplo: '24' },
  { campo: 'ubicacion', encabezado: 'Ubicación', ejemplo: '' },
  { campo: 'direccion', encabezado: 'Dirección', ejemplo: '' },
  { campo: 'departamento', encabezado: 'Departamento', ejemplo: '' },
  { campo: 'mesaAyuda', encabezado: 'Mesa de ayuda', ejemplo: '' },
  { campo: 'inventariable', encabezado: 'Inventariable', ejemplo: 'Sí' },
  { campo: 'observaciones', encabezado: 'Observaciones', ejemplo: '' },
]

const OBLIGATORIAS: CampoImportacion[] = ['tipo', 'marca', 'modelo', 'numeroSerie']

export interface FilaImportacion {
  /** Número de línea en el archivo (la de encabezados es la 1) */
  numero: number
  resumen: { tipo: string; marca: string; modelo: string; numeroSerie: string }
  datos: Omit<Bien, 'id'> | null
  errores: string[]
}

export interface ResultadoValidacion {
  /** Problema que impide leer el archivo completo (columnas faltantes, vacío, demasiadas filas) */
  errorGlobal?: string
  filas: FilaImportacion[]
}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

const ENCABEZADO_A_CAMPO = new Map(COLUMNAS.map((columna) => [normalizar(columna.encabezado), columna.campo]))
const PREFIJO_CARACTERISTICA = /^caracteristica\s*:\s*(.+)$/

function esFechaValida(anio: number, mes: number, dia: number): boolean {
  const fecha = new Date(anio, mes - 1, dia)
  return fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia
}

/** Acepta AAAA-MM-DD y DD/MM/AAAA; devuelve ISO o null si no es una fecha real. */
function parsearFecha(texto: string): string | null {
  const iso = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  const latina = texto.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  const [anio, mes, dia] = iso ? [+iso[1]!, +iso[2]!, +iso[3]!] : latina ? [+latina[3]!, +latina[2]!, +latina[1]!] : [0, 0, 0]
  if (!esFechaValida(anio, mes, dia)) return null
  return `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

/** Acepta "12345.5", "12,345.50", "12.345,50" y "$ 12345,5"; null si no es un número. */
function parsearNumero(texto: string): number | null {
  let limpio = texto.replace(/[$\s]/g, '')
  if (limpio === '') return null
  if (limpio.includes(',') && limpio.includes('.')) {
    // El último separador es el decimal.
    limpio = limpio.lastIndexOf(',') > limpio.lastIndexOf('.') ? limpio.replace(/\./g, '').replace(',', '.') : limpio.replace(/,/g, '')
  } else if (limpio.includes(',')) limpio = limpio.replace(',', '.')
  const numero = Number(limpio)
  return Number.isFinite(numero) ? numero : null
}

function parsearSiNo(texto: string): boolean | null {
  const valor = normalizar(texto)
  if (['si', 'sí', 's', 'yes', 'true', '1', 'x'].includes(valor)) return true
  if (['no', 'n', 'false', '0'].includes(valor)) return false
  return null
}

export function useImportacionBienes() {
  const { tipos } = useTiposBienData()
  const { activas } = useCatalogosData()
  const { existeNumeroSerie, existeNumeroInventario } = useBienesData()

  /** Encabezados y una fila de ejemplo; con un tipo, se añaden sus columnas `Característica: …`. */
  function plantilla(tipo?: TipoBien): { encabezados: string[]; ejemplo: string[] } {
    const definiciones = tipo?.caracteristicas ?? []
    return {
      encabezados: [...COLUMNAS.map((columna) => columna.encabezado), ...definiciones.map((def) => `Característica: ${def.nombre}`)],
      ejemplo: [
        ...COLUMNAS.map((columna) => (columna.campo === 'tipo' && tipo ? tipo.descripcion : columna.ejemplo)),
        ...definiciones.map(() => ''),
      ],
    }
  }

  function validar(matriz: string[][]): ResultadoValidacion {
    if (matriz.length === 0) return { errorGlobal: 'El archivo está vacío.', filas: [] }

    const [encabezados, ...datos] = matriz as [string[], ...string[][]]
    if (datos.length === 0) return { errorGlobal: 'El archivo solo tiene la fila de encabezados: no hay bienes que importar.', filas: [] }
    if (datos.length > MAX_FILAS_IMPORTACION) {
      return { errorGlobal: `El archivo tiene ${datos.length} filas; el máximo por importación es ${MAX_FILAS_IMPORTACION}.`, filas: [] }
    }

    // Columna de cada campo y de cada característica (por nombre normalizado).
    const columnaDe = new Map<CampoImportacion, number>()
    const columnasCaracteristica = new Map<string, number>()
    encabezados.forEach((encabezado, indice) => {
      const clave = normalizar(encabezado)
      const campo = ENCABEZADO_A_CAMPO.get(clave)
      if (campo && !columnaDe.has(campo)) columnaDe.set(campo, indice)
      const coincidencia = clave.match(PREFIJO_CARACTERISTICA)
      if (coincidencia) columnasCaracteristica.set(coincidencia[1]!, indice)
    })

    const faltantes = OBLIGATORIAS.filter((campo) => !columnaDe.has(campo)).map(
      (campo) => COLUMNAS.find((columna) => columna.campo === campo)!.encabezado,
    )
    if (faltantes.length > 0) {
      return { errorGlobal: `Faltan columnas obligatorias en el encabezado: ${faltantes.join(', ')}.`, filas: [] }
    }

    const tiposPorNombre = new Map(tipos.map((tipo) => [normalizar(tipo.descripcion), tipo]))
    const canonico = (lista: string[]) => new Map(lista.map((nombre) => [normalizar(nombre), nombre]))
    const origenes = canonico(ORIGEN_OPCIONES)
    const ubicaciones = canonico(activas.ubicaciones)
    const direcciones = canonico(activas.direcciones)
    const departamentos = canonico(activas.departamentos)

    const seriesVistas = new Map<string, number>()
    const inventariosVistos = new Map<string, number>()

    const filas = datos.map<FilaImportacion>((celdas, indice) => {
      const numero = indice + 2
      const valor = (campo: CampoImportacion) => (celdas[columnaDe.get(campo) ?? -1] ?? '').trim()
      const errores: string[] = []

      const tipoTexto = valor('tipo')
      const marca = valor('marca')
      const modelo = valor('modelo')
      const numeroSerie = valor('numeroSerie')
      const numeroInventario = valor('numeroInventario')

      const tipo = tiposPorNombre.get(normalizar(tipoTexto))
      if (tipoTexto === '') errores.push('Falta el tipo de bien.')
      else if (!tipo) errores.push(`El tipo de bien «${tipoTexto}» no existe en el catálogo.`)
      if (marca === '') errores.push('Falta la marca.')
      if (modelo === '') errores.push('Falta el modelo.')

      if (numeroSerie === '') errores.push('Falta el número de serie.')
      else {
        const clave = normalizar(numeroSerie)
        if (existeNumeroSerie(numeroSerie)) errores.push(`El número de serie «${numeroSerie}» ya está registrado en otro bien.`)
        else if (seriesVistas.has(clave)) errores.push(`El número de serie «${numeroSerie}» se repite (ya aparece en la fila ${seriesVistas.get(clave)}).`)
        else seriesVistas.set(clave, numero)
      }
      if (numeroInventario !== '') {
        const clave = normalizar(numeroInventario)
        if (existeNumeroInventario(numeroInventario)) errores.push(`El número de inventario «${numeroInventario}» ya está registrado en otro bien.`)
        else if (inventariosVistos.has(clave)) {
          errores.push(`El número de inventario «${numeroInventario}» se repite (ya aparece en la fila ${inventariosVistos.get(clave)}).`)
        } else inventariosVistos.set(clave, numero)
      }

      let fechaAlta = hoyIso()
      if (valor('fechaAlta') !== '') {
        const fecha = parsearFecha(valor('fechaAlta'))
        if (fecha) fechaAlta = fecha
        else errores.push(`La fecha de alta «${valor('fechaAlta')}» no es válida (usa AAAA-MM-DD o DD/MM/AAAA).`)
      }

      let fechaFactura: string | undefined
      if (valor('fechaFactura') !== '') {
        const fecha = parsearFecha(valor('fechaFactura'))
        if (fecha) fechaFactura = fecha
        else errores.push(`La fecha de factura «${valor('fechaFactura')}» no es válida (usa AAAA-MM-DD o DD/MM/AAAA).`)
      }

      let valorAdquisicion: number | undefined
      if (valor('valorAdquisicion') !== '') {
        const numeroValor = parsearNumero(valor('valorAdquisicion'))
        if (numeroValor !== null && numeroValor >= 0) valorAdquisicion = numeroValor
        else errores.push(`El valor de adquisición «${valor('valorAdquisicion')}» no es un importe válido.`)
      }

      let mesesGarantia = 12
      if (valor('mesesGarantia') !== '') {
        const meses = parsearNumero(valor('mesesGarantia'))
        if (meses !== null && meses >= 0 && Number.isInteger(meses)) mesesGarantia = meses
        else errores.push(`Los meses de garantía «${valor('mesesGarantia')}» deben ser un entero mayor o igual a 0.`)
      }

      let origen: string | undefined
      if (valor('origen') !== '') {
        origen = origenes.get(normalizar(valor('origen')))
        if (!origen) errores.push(`El origen «${valor('origen')}» no es válido (${ORIGEN_OPCIONES.join(', ')}).`)
      }

      const catalogo = (campo: 'ubicacion' | 'direccion' | 'departamento', mapa: Map<string, string>, etiqueta: string) => {
        if (valor(campo) === '') return undefined
        const encontrado = mapa.get(normalizar(valor(campo)))
        if (!encontrado) errores.push(`${etiqueta} «${valor(campo)}» no existe o está inactiva en Administración.`)
        return encontrado
      }
      const ubicacion = catalogo('ubicacion', ubicaciones, 'La ubicación')
      const direccion = catalogo('direccion', direcciones, 'La dirección')
      const departamento = catalogo('departamento', departamentos, 'El departamento')

      let inventariable = true
      if (valor('inventariable') !== '') {
        const respuesta = parsearSiNo(valor('inventariable'))
        if (respuesta === null) errores.push(`«Inventariable» debe ser Sí o No (se recibió «${valor('inventariable')}»).`)
        else inventariable = respuesta
      }

      // Características del tipo: mismas reglas que el alta manual.
      const valores: Record<string, ValorCaracteristica> = {}
      const definiciones: CaracteristicaDef[] = tipo?.caracteristicas ?? []
      for (const def of definiciones) {
        const columna = columnasCaracteristica.get(normalizar(def.nombre))
        const texto = columna === undefined ? '' : (celdas[columna] ?? '').trim()

        if (texto === '') {
          if (def.requerida) errores.push(`Falta la característica obligatoria «${def.nombre}».`)
          continue
        }
        if (def.tipoDato === 'numero') {
          const numeroValor = parsearNumero(texto)
          if (numeroValor !== null && numeroValor >= 0) valores[def.id] = numeroValor
          else errores.push(`La característica «${def.nombre}» debe ser un número mayor o igual a 0.`)
        } else if (def.tipoDato === 'lista') {
          const opcion = (def.opciones ?? []).find((item) => normalizar(item) === normalizar(texto))
          if (opcion) valores[def.id] = opcion
          else errores.push(`«${texto}» no es una opción de «${def.nombre}» (${(def.opciones ?? []).join(', ')}).`)
        } else if (def.tipoDato === 'si-no') {
          const respuesta = parsearSiNo(texto)
          if (respuesta === null) errores.push(`La característica «${def.nombre}» debe ser Sí o No.`)
          else valores[def.id] = respuesta
        } else valores[def.id] = texto
      }

      const resumen = { tipo: tipoTexto, marca, modelo, numeroSerie }
      if (errores.length > 0 || !tipo) return { numero, resumen, datos: null, errores }

      const observaciones = valor('observaciones')
      const hayValores = Object.keys(valores).length > 0
      const datosBien: Omit<Bien, 'id'> = {
        nombre: tipo.descripcion,
        marca,
        modelo,
        numeroSerie,
        numeroInventario,
        fechaAlta,
        caracteristicas: resumirCaracteristicas(definiciones, valores, observaciones),
        valores: hayValores ? valores : undefined,
        observaciones: observaciones || undefined,
        valorAdquisicion,
        mesesGarantia,
        estatus: 'Por asignar',
        inventariable,
        origen,
        numeroFactura: valor('numeroFactura') || undefined,
        fechaFactura,
        mesaAyuda: valor('mesaAyuda') || undefined,
        ubicacion,
        direccion,
        departamento,
      }
      return { numero, resumen, datos: datosBien, errores }
    })

    return { filas }
  }

  return { plantilla, validar }
}
