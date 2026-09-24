import { computed } from 'vue'
import type { Rol } from '@/config/permisos'
import { authService, type CambiosCuenta, type CuentaPublica, type DatosCuentaNueva } from '@/services/authService'
import { errorPassword } from '@/utils/password'
import type { ResultadoAccion } from './useCatalogosData'
import { usuarioActual } from './useAuth'
import { registrarAuditoria } from './useAuditoria'

const FORMATO_USERNAME = /^[a-z0-9._-]{3,20}$/

export type { CuentaPublica, Rol }

export function useCuentasData() {
  // TODO: reemplazar por la llamada real, ej. await cuentasApi.listar()
  const cuentas = computed<CuentaPublica[]>(() => authService.listarCuentas())

  function esPropia(id: string): boolean {
    return usuarioActual()?.id === id
  }

  /** Texto del error del nombre de usuario, o '' si es válido y está libre. */
  function errorUsername(username: string): string {
    const limpio = username.trim().toLowerCase()
    if (limpio === '') return ''
    if (!FORMATO_USERNAME.test(limpio)) return 'Usa de 3 a 20 caracteres: letras sin acento, números, punto, guion o guion bajo.'
    return authService.existeUsername(limpio) ? 'Ya existe una cuenta con ese usuario.' : ''
  }

  function crear(datos: DatosCuentaNueva): ResultadoAccion {
    if (datos.nombre.trim() === '') return { ok: false, motivo: 'El nombre es obligatorio.' }
    const errorUsuario = datos.username.trim() === '' ? 'El usuario es obligatorio.' : errorUsername(datos.username)
    if (errorUsuario) return { ok: false, motivo: errorUsuario }
    const errorClave = errorPassword(datos.password)
    if (errorClave) return { ok: false, motivo: errorClave }

    // TODO: reemplazar por la llamada real, ej. await cuentasApi.crear(datos)
    const cuenta = authService.crearCuenta(datos)
    registrarAuditoria('Cuentas', 'Alta', 'Cuenta', `${cuenta.username} · ${cuenta.rol}`)
    return { ok: true }
  }

  function actualizar(id: string, cambios: CambiosCuenta): ResultadoAccion {
    const cuenta = cuentas.value.find((item) => item.id === id)
    if (!cuenta) return { ok: false, motivo: 'No se encontró la cuenta.' }
    if (cambios.nombre.trim() === '') return { ok: false, motivo: 'El nombre es obligatorio.' }
    // Con esta regla siempre queda al menos un administrador activo: nadie puede quitarse el acceso a sí mismo.
    if (esPropia(id) && cambios.rol !== cuenta.rol) return { ok: false, motivo: 'No puedes cambiar tu propio rol.' }

    const diferencias: string[] = []
    if (cuenta.nombre !== cambios.nombre.trim()) diferencias.push(`nombre: ${cuenta.nombre} → ${cambios.nombre.trim()}`)
    if (cuenta.rol !== cambios.rol) diferencias.push(`rol: ${cuenta.rol} → ${cambios.rol}`)

    // TODO: reemplazar por la llamada real, ej. await cuentasApi.actualizar(id, cambios)
    authService.actualizarCuenta(id, cambios)
    registrarAuditoria('Cuentas', 'Edición', 'Cuenta', [cuenta.username, ...diferencias].join(' · '))
    return { ok: true }
  }

  function alternarEstatus(id: string): ResultadoAccion {
    const cuenta = cuentas.value.find((item) => item.id === id)
    if (!cuenta) return { ok: false, motivo: 'No se encontró la cuenta.' }
    if (cuenta.activo && esPropia(id)) return { ok: false, motivo: 'No puedes inactivar tu propia cuenta.' }

    // TODO: reemplazar por la llamada real, ej. await cuentasApi.cambiarEstatus(id)
    authService.alternarEstatus(id)
    registrarAuditoria('Cuentas', cuenta.activo ? 'Inactivar' : 'Reactivar', 'Cuenta', cuenta.username)
    return { ok: true }
  }

  function restablecerPassword(id: string, password: string): ResultadoAccion {
    const cuenta = cuentas.value.find((item) => item.id === id)
    if (!cuenta) return { ok: false, motivo: 'No se encontró la cuenta.' }
    const errorClave = errorPassword(password)
    if (errorClave) return { ok: false, motivo: errorClave }

    // TODO: reemplazar por la llamada real, ej. await cuentasApi.restablecerPassword(id, password)
    authService.restablecerPassword(id, password)
    // La contraseña nunca se registra.
    registrarAuditoria('Cuentas', 'Restablecer contraseña', 'Cuenta', cuenta.username)
    return { ok: true }
  }

  return { cuentas, esPropia, errorUsername, crear, actualizar, alternarEstatus, restablecerPassword }
}
