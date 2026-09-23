import { computed, reactive } from 'vue'
import { useBienesData } from './useBienesData'

export type CategoriaTipoBien =
  | 'Equipo de cómputo'
  | 'Periféricos'
  | 'Componentes'
  | 'Energía'
  | 'Impresión'
  | 'Mobiliario'
  | 'Redes y comunicaciones'

export type TipoDato = 'texto' | 'numero' | 'lista' | 'si-no'

/** Define un dato que se capturará en cada bien de un tipo (no es el valor, es el campo). */
export interface CaracteristicaDef {
  id: string
  nombre: string
  tipoDato: TipoDato
  /** Solo para `numero` (GB, W, pulgadas...) */
  unidad?: string
  /** Solo para `lista` */
  opciones?: string[]
  requerida: boolean
}

export interface TipoBien {
  id: string
  descripcion: string
  categoria: CategoriaTipoBien
  caracteristicas: CaracteristicaDef[]
}

export const CATEGORIAS: CategoriaTipoBien[] = [
  'Equipo de cómputo',
  'Periféricos',
  'Componentes',
  'Energía',
  'Impresión',
  'Mobiliario',
  'Redes y comunicaciones',
]

export const TIPOS_DATO: Array<{ valor: TipoDato; etiqueta: string }> = [
  { valor: 'texto', etiqueta: 'Texto' },
  { valor: 'numero', etiqueta: 'Número' },
  { valor: 'lista', etiqueta: 'Lista de opciones' },
  { valor: 'si-no', etiqueta: 'Sí / No' },
]

type CaracteristicaBase = Omit<CaracteristicaDef, 'id'>

function texto(nombre: string, requerida = false): CaracteristicaBase {
  return { nombre, tipoDato: 'texto', requerida }
}
function numero(nombre: string, unidad: string, requerida = false): CaracteristicaBase {
  return { nombre, tipoDato: 'numero', unidad, requerida }
}
function lista(nombre: string, opciones: string[], requerida = false): CaracteristicaBase {
  return { nombre, tipoDato: 'lista', opciones, requerida }
}
function siNo(nombre: string): CaracteristicaBase {
  return { nombre, tipoDato: 'si-no', requerida: false }
}

// Marca, modelo, número de serie, número de inventario, garantía y fecha de alta ya son
// campos de cada bien: aquí solo van los datos técnicos que cambian según el tipo.
const CONEXION = ['Alámbrico USB', 'Inalámbrico', 'Bluetooth']

export const SUGERENCIAS_CARACTERISTICAS: Record<CategoriaTipoBien, CaracteristicaBase[]> = {
  'Equipo de cómputo': [
    texto('Procesador', true),
    numero('Memoria RAM', 'GB', true),
    numero('Almacenamiento', 'GB'),
    lista('Sistema operativo', ['Windows 10', 'Windows 11', 'Linux', 'Otro']),
  ],
  Periféricos: [lista('Conexión', CONEXION, true), texto('Color'), siNo('Incluye cable')],
  Componentes: [numero('Capacidad', 'GB'), numero('Velocidad', 'MHz'), lista('Interfaz', ['SATA', 'NVMe', 'USB'])],
  Energía: [numero('Capacidad', 'VA', true), numero('Potencia', 'W'), numero('Voltaje', 'V')],
  Impresión: [
    lista('Tecnología', ['Láser', 'Inyección de tinta', 'Matriz de puntos', 'Térmica'], true),
    lista('Color', ['Monocromática', 'Color']),
    siNo('Impresión a doble cara'),
  ],
  Mobiliario: [texto('Material'), texto('Color'), numero('Largo', 'cm'), numero('Ancho', 'cm')],
  'Redes y comunicaciones': [numero('Puertos', 'puertos', true), lista('Velocidad', ['100 Mbps', '1 Gbps', '10 Gbps']), siNo('Administrable')],
}

interface SemillaTipo {
  descripcion: string
  categoria: CategoriaTipoBien
  caracteristicas: CaracteristicaBase[]
}

const SEMILLA: SemillaTipo[] = [
  {
    descripcion: 'Computadora',
    categoria: 'Equipo de cómputo',
    caracteristicas: [
      texto('Procesador', true),
      numero('Memoria RAM', 'GB', true),
      numero('Almacenamiento', 'GB'),
      lista('Tipo de almacenamiento', ['HDD', 'SSD', 'NVMe']),
      lista('Sistema operativo', ['Windows 10', 'Windows 11', 'Linux', 'Otro']),
      lista('Formato', ['Torre', 'Mini', 'All-in-one', 'Portátil']),
    ],
  },
  {
    descripcion: 'Monitor',
    categoria: 'Periféricos',
    caracteristicas: [
      numero('Tamaño', 'pulgadas', true),
      lista('Resolución', ['1366x768', '1920x1080', '2560x1440', '3840x2160']),
      lista('Tipo de panel', ['IPS', 'VA', 'TN']),
      texto('Puertos de video'),
    ],
  },
  {
    descripcion: 'Teclado',
    categoria: 'Periféricos',
    caracteristicas: [lista('Conexión', CONEXION, true), lista('Distribución', ['Español', 'Inglés', 'Latinoamericano']), siNo('Teclado numérico')],
  },
  {
    descripcion: 'Mouse',
    categoria: 'Periféricos',
    caracteristicas: [lista('Conexión', CONEXION, true), lista('Sensor', ['Óptico', 'Láser']), numero('Resolución', 'DPI')],
  },
  {
    descripcion: 'Impresora',
    categoria: 'Impresión',
    caracteristicas: [
      lista('Tecnología', ['Láser', 'Inyección de tinta', 'Matriz de puntos', 'Térmica'], true),
      lista('Color', ['Monocromática', 'Color']),
      lista('Conexión', ['USB', 'Red', 'WiFi']),
      siNo('Impresión a doble cara'),
    ],
  },
  {
    descripcion: 'No-Break',
    categoria: 'Energía',
    caracteristicas: [numero('Capacidad', 'VA', true), numero('Potencia', 'W'), numero('Contactos', 'contactos'), numero('Autonomía', 'minutos')],
  },
  {
    descripcion: 'Memoria RAM',
    categoria: 'Componentes',
    caracteristicas: [numero('Capacidad', 'GB', true), lista('Tipo', ['DDR3', 'DDR4', 'DDR5'], true), numero('Frecuencia', 'MHz'), lista('Formato', ['DIMM', 'SODIMM'])],
  },
  {
    descripcion: 'Disco duro',
    categoria: 'Componentes',
    caracteristicas: [
      numero('Capacidad', 'GB', true),
      lista('Tipo', ['HDD', 'SSD', 'NVMe'], true),
      lista('Interfaz', ['SATA', 'NVMe', 'SAS']),
      lista('Factor de forma', ['2.5"', '3.5"', 'M.2']),
      numero('Velocidad', 'RPM'),
    ],
  },
  {
    descripcion: 'Fuente de poder',
    categoria: 'Componentes',
    caracteristicas: [numero('Potencia', 'W', true), lista('Certificación', ['Sin certificación', '80 Plus', '80 Plus Gold']), texto('Conectores')],
  },
  {
    descripcion: 'Lector óptico',
    categoria: 'Componentes',
    caracteristicas: [lista('Tipo', ['CD', 'DVD', 'Blu-ray'], true), lista('Función', ['Solo lectura', 'Grabador']), lista('Interfaz', ['SATA', 'USB'])],
  },
  {
    descripcion: 'Silla',
    categoria: 'Mobiliario',
    caracteristicas: [lista('Tipo', ['Ejecutiva', 'Operativa', 'Visitante']), texto('Material'), texto('Color'), siNo('Con descansabrazos')],
  },
  {
    descripcion: 'Escritorio',
    categoria: 'Mobiliario',
    caracteristicas: [texto('Material'), numero('Largo', 'cm'), numero('Ancho', 'cm'), siNo('Con cajones')],
  },
  {
    descripcion: 'Switch',
    categoria: 'Redes y comunicaciones',
    caracteristicas: [numero('Puertos', 'puertos', true), lista('Velocidad', ['100 Mbps', '1 Gbps', '10 Gbps']), siNo('Administrable'), siNo('PoE')],
  },
]

let contador = 0
function nuevoId(prefijo: string): string {
  contador += 1
  return `${prefijo}-${Date.now()}-${contador}`
}

const tipos = reactive<TipoBien[]>(
  SEMILLA.map((semilla) => ({
    id: nuevoId('tipo'),
    descripcion: semilla.descripcion,
    categoria: semilla.categoria,
    caracteristicas: semilla.caracteristicas.map((caracteristica) => ({ id: nuevoId('car'), ...caracteristica })),
  })),
)

export function nuevaCaracteristicaId(): string {
  return nuevoId('car')
}

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
}

export function useTiposBienData() {
  // TODO: reemplazar por la llamada real al servicio del catálogo,
  // ej. await tiposBienApi.getTipos()
  const { bienes } = useBienesData()

  const nombresTipos = computed(() => tipos.map((tipo) => tipo.descripcion))

  const bienesPorTipo = computed(() => {
    const conteo = new Map<string, number>()
    for (const bien of bienes) conteo.set(bien.nombre, (conteo.get(bien.nombre) ?? 0) + 1)
    return conteo
  })

  function existeDescripcion(descripcion: string, ignorarId?: string): boolean {
    const buscada = normalizar(descripcion)
    return tipos.some((tipo) => tipo.id !== ignorarId && normalizar(tipo.descripcion) === buscada)
  }

  function agregarTipo(datos: { descripcion: string; categoria: CategoriaTipoBien }): TipoBien {
    // TODO: reemplazar por la llamada real, ej. await tiposBienApi.crearTipo(datos)
    const tipo: TipoBien = { id: nuevoId('tipo'), descripcion: datos.descripcion.trim(), categoria: datos.categoria, caracteristicas: [] }
    tipos.unshift(tipo)
    return tipo
  }

  function actualizarTipo(id: string, datos: { descripcion: string; categoria: CategoriaTipoBien }) {
    // TODO: reemplazar por la llamada real, ej. await tiposBienApi.actualizarTipo(id, datos)
    const tipo = tipos.find((candidato) => candidato.id === id)
    if (!tipo) return

    const anterior = tipo.descripcion
    tipo.descripcion = datos.descripcion.trim()
    tipo.categoria = datos.categoria

    // El bien guarda el tipo por su descripción: al renombrar, sus bienes lo siguen.
    if (anterior !== tipo.descripcion) {
      for (const bien of bienes) {
        if (bien.nombre === anterior) bien.nombre = tipo.descripcion
      }
    }
  }

  function guardarCaracteristicas(id: string, caracteristicas: CaracteristicaDef[]) {
    // TODO: reemplazar por la llamada real, ej. await tiposBienApi.guardarCaracteristicas(id, caracteristicas)
    const tipo = tipos.find((candidato) => candidato.id === id)
    if (tipo) tipo.caracteristicas = caracteristicas
  }

  return { tipos, nombresTipos, bienesPorTipo, existeDescripcion, agregarTipo, actualizarTipo, guardarCaracteristicas }
}
