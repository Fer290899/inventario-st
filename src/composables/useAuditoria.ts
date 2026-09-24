import { reactive } from 'vue'
import { observarSesion, usuarioActual } from './useAuth'

export type ModuloAuditoria = 'Sesión' | 'Bienes' | 'Movimientos' | 'Mantenimiento' | 'Catálogos' | 'Cuentas' | 'Tipos de bien' | 'Configuración'

export interface EventoAuditoria {
  id: string
  /** Fecha y hora ISO completas */
  fechaHora: string
  usuario: string
  rol: string
  modulo: ModuloAuditoria
  accion: string
  entidad: string
  detalle: string
}

// TODO: reemplazar por el servicio de auditoría del backend; hoy vive en memoria como los demás datos.
const eventos = reactive<EventoAuditoria[]>([])
let contador = 0

/**
 * Registra una acción de quien tiene la sesión abierta. Sin sesión no hace nada, así la siembra de datos
 * que ocurre al cargar los módulos no ensucia la bitácora.
 */
export function registrarAuditoria(modulo: ModuloAuditoria, accion: string, entidad: string, detalle = '') {
  const sesion = usuarioActual()
  if (!sesion) return
  contador += 1
  eventos.unshift({
    id: `aud-${contador}`,
    fechaHora: new Date().toISOString(),
    usuario: sesion.nombre,
    rol: sesion.rol,
    modulo,
    accion,
    entidad,
    detalle,
  })
}

observarSesion((evento, usuario) => {
  contador += 1
  eventos.unshift({
    id: `aud-${contador}`,
    fechaHora: new Date().toISOString(),
    usuario: usuario.nombre,
    rol: usuario.rol,
    modulo: 'Sesión',
    accion: evento === 'inicio' ? 'Inicio de sesión' : 'Cierre de sesión',
    entidad: usuario.username,
    detalle: '',
  })
})

export function useAuditoria() {
  return { eventos }
}
