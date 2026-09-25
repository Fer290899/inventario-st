import type { Catalogo } from '@/composables/useCatalogosData'

export type Seccion = Catalogo | 'tecnico' | 'institucion' | 'alertas' | 'cuentas' | 'roles' | 'bitacora'

export interface InfoSeccion {
  titulo: string
  singular: string
  femenino: boolean
  descripcion: string
}

export const SECCIONES: Record<Seccion, InfoSeccion> = {
  ubicacion: { titulo: 'Ubicaciones', singular: 'Ubicación', femenino: true, descripcion: 'Lugares físicos donde se encuentran los bienes.' },
  direccion: { titulo: 'Direcciones', singular: 'Dirección', femenino: true, descripcion: 'Áreas administrativas de la institución.' },
  departamento: { titulo: 'Departamentos', singular: 'Departamento', femenino: false, descripcion: 'Departamentos de la institución.' },
  usuario: {
    titulo: 'Responsables',
    singular: 'Responsable',
    femenino: false,
    descripcion: 'Personas que reciben bienes en resguardo. No son cuentas de acceso al sistema; los técnicos se administran en Técnicos.',
  },
  tecnico: {
    titulo: 'Técnicos',
    singular: 'Técnico',
    femenino: false,
    descripcion: 'Personal que da mantenimiento a los bienes y puede tener acceso al sistema con el rol Técnico. Los proveedores externos se eligen aparte al programar.',
  },
  institucion: {
    titulo: 'Institución',
    singular: 'Institución',
    femenino: true,
    descripcion: 'Datos que aparecen en el encabezado de las hojas, fichas y dictámenes impresos.',
  },
  alertas: {
    titulo: 'Alertas',
    singular: 'Alertas',
    femenino: true,
    descripcion: 'Definen cuándo aparece una alerta en la campana y en el panel «Requiere atención» del Dashboard. Los cambios se aplican de inmediato.',
  },
  cuentas: {
    titulo: 'Cuentas de acceso',
    singular: 'Cuenta',
    femenino: true,
    descripcion: 'Personas que pueden iniciar sesión y el rol que define lo que pueden hacer. Quienes reciben bienes se administran en Responsables.',
  },
  roles: {
    titulo: 'Roles y permisos',
    singular: 'Rol',
    femenino: false,
    descripcion: 'Qué puede hacer cada rol. Los roles son fijos; se asignan desde Cuentas de acceso.',
  },
  bitacora: { titulo: 'Bitácora', singular: 'Bitácora', femenino: true, descripcion: 'Registro de las acciones realizadas en el sistema.' },
}

export const GRUPOS: ReadonlyArray<{ titulo: string; secciones: readonly Seccion[] }> = [
  { titulo: 'Catálogos', secciones: ['ubicacion', 'direccion', 'departamento', 'usuario', 'tecnico'] },
  { titulo: 'Configuración', secciones: ['institucion', 'alertas'] },
  { titulo: 'Seguridad', secciones: ['cuentas', 'roles', 'bitacora'] },
]

export const SECCION_INICIAL: Seccion = 'ubicacion'

/** Secciones con un botón «Agregar …» en su encabezado. */
export const SECCIONES_CON_ALTA: readonly Seccion[] = ['ubicacion', 'direccion', 'departamento', 'usuario', 'tecnico', 'cuentas']

const CATALOGOS: readonly Seccion[] = ['ubicacion', 'direccion', 'departamento', 'usuario']

export function esCatalogo(seccion: Seccion): seccion is Catalogo {
  return CATALOGOS.includes(seccion)
}

export function seccionDesdeConsulta(valor: unknown): Seccion {
  const texto = Array.isArray(valor) ? valor[0] : valor
  return typeof texto === 'string' && texto in SECCIONES ? (texto as Seccion) : SECCION_INICIAL
}
