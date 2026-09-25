export type Rol = 'Administrador' | 'Capturista' | 'Técnico' | 'Consulta'

export type Permiso =
  | 'bienes:crear'
  | 'bienes:editar'
  | 'bienes:importar'
  | 'bienes:mover'
  | 'mantenimiento:programar'
  | 'mantenimiento:concluir'
  | 'dictamen:emitir'
  | 'tipos:gestionar'
  | 'admin:gestionar'

const CAPTURA: Permiso[] = ['bienes:crear', 'bienes:editar', 'bienes:importar', 'bienes:mover', 'mantenimiento:programar', 'mantenimiento:concluir']

// Consultar, imprimir y exportar están abiertos a todo rol, por eso no tienen permiso propio.
export const PERMISOS_POR_ROL: Record<Rol, Permiso[]> = {
  Administrador: [...CAPTURA, 'dictamen:emitir', 'tipos:gestionar', 'admin:gestionar'],
  Capturista: CAPTURA,
  // Solo concluye mantenimientos, y únicamente los suyos: ese límite lo aplica useMantenimientosData.
  Técnico: ['mantenimiento:concluir'],
  Consulta: [],
}

export const ROLES: readonly Rol[] = ['Administrador', 'Capturista', 'Técnico', 'Consulta']

export const DESCRIPCION_ROL: Record<Rol, string> = {
  Administrador: 'Control total: opera el sistema, emite bajas y administra catálogos, cuentas y configuración.',
  Capturista: 'Registra y mueve bienes y da mantenimiento, sin emitir bajas ni administrar el sistema.',
  Técnico: 'Ve y concluye únicamente los mantenimientos que se le asignaron; consulta, imprime y exporta.',
  Consulta: 'Solo lectura: consulta, imprime y exporta.',
}

/** Permisos agrupados para mostrarlos ordenados en la matriz de roles. */
export const GRUPOS_PERMISO: ReadonlyArray<{ titulo: string; permisos: readonly Permiso[] }> = [
  { titulo: 'Bienes', permisos: ['bienes:crear', 'bienes:editar', 'bienes:importar', 'bienes:mover'] },
  { titulo: 'Mantenimiento', permisos: ['mantenimiento:programar', 'mantenimiento:concluir'] },
  { titulo: 'Baja definitiva', permisos: ['dictamen:emitir'] },
  { titulo: 'Administración', permisos: ['tipos:gestionar', 'admin:gestionar'] },
]

export const ACCION_DE_PERMISO: Record<Permiso, string> = {
  'bienes:crear': 'dar de alta bienes',
  'bienes:editar': 'editar bienes',
  'bienes:importar': 'importar bienes',
  'bienes:mover': 'asignar, reasignar o devolver bienes',
  'mantenimiento:programar': 'programar mantenimientos',
  'mantenimiento:concluir': 'concluir mantenimientos',
  'dictamen:emitir': 'emitir dictámenes de baja',
  'tipos:gestionar': 'gestionar los tipos de bien',
  'admin:gestionar': 'usar la administración del sistema',
}

export function rolTienePermiso(rol: Rol | undefined, permiso: Permiso): boolean {
  return rol !== undefined && PERMISOS_POR_ROL[rol].includes(permiso)
}

/** Texto para el `title` de un control deshabilitado por falta de permiso. */
export function motivoSinPermiso(permiso: Permiso, rol: Rol | undefined): string {
  return `Tu rol${rol ? ` (${rol})` : ''} no permite ${ACCION_DE_PERMISO[permiso]}`
}
