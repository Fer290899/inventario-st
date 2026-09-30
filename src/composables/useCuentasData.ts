import { computed } from 'vue'
import type { Rol } from '@/config/permisos'
import { authService, type CambiosCuenta, type CuentaPublica, type DatosCuentaNueva } from '@/services/authService'
import { normalizarTexto } from '@/utils/formato'
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
    // El rol Técnico solo existe ligado a un técnico, y una cuenta ligada a un técnico solo puede tener ese rol.
    if ((datos.rol === 'Técnico') !== (datos.tecnicoId !== undefined)) {
      return { ok: false, motivo: 'El rol Técnico se asigna únicamente al crear el acceso de un técnico.' }
    }

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
    if (cuenta.tecnicoId && (cambios.rol !== 'Técnico' || cambios.nombre.trim() !== cuenta.nombre)) {
      return { ok: false, motivo: 'El nombre y el rol de una cuenta de técnico se editan desde Técnicos.' }
    }
    if (!cuenta.tecnicoId && cambios.rol === 'Técnico') return { ok: false, motivo: 'El rol Técnico se asigna únicamente al crear el acceso de un técnico.' }

    const diferencias: string[] = []
    if (cuenta.nombre !== cambios.nombre.trim()) diferencias.push(`nombre: ${cuenta.nombre} → ${cambios.nombre.trim()}`)
    if (cuenta.rol !== cambios.rol) diferencias.push(`rol: ${cuenta.rol} → ${cambios.rol}`)

    // TODO: reemplazar por la llamada real, ej. await cuentasApi.actualizar(id, cambios)
    authService.actualizarCuenta(id, cambios)
    registrarAuditoria('Cuentas', 'Edición', 'Cuenta', [cuenta.username, ...diferencias].join(' · '))
    return { ok: true }
  }

  function alternarEstatus(id: string, motivo?: string): ResultadoAccion {
    const cuenta = cuentas.value.find((item) => item.id === id)
    if (!cuenta) return { ok: false, motivo: 'No se encontró la cuenta.' }
    if (cuenta.activo && esPropia(id)) return { ok: false, motivo: 'No puedes inactivar tu propia cuenta.' }

    // TODO: reemplazar por la llamada real, ej. await cuentasApi.cambiarEstatus(id)
    authService.alternarEstatus(id)
    const detalle = !cuenta.activo && motivo ? `${cuenta.username} · ${motivo}` : cuenta.username
    registrarAuditoria('Cuentas', cuenta.activo ? 'Inactivar' : 'Reactivar', 'Cuenta', detalle)
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

  /** Autoservicio: quien tiene la sesión abierta cambia su propia contraseña, verificando la actual. */
  function cambiarPasswordPropia(actual: string, nueva: string): ResultadoAccion {
    const propio = usuarioActual()
    if (!propio) return { ok: false, motivo: 'No hay sesión activa.' }
    if (!authService.verificarPassword(propio.id, actual)) return { ok: false, motivo: 'La contraseña actual no es correcta.' }
    const errorClave = errorPassword(nueva)
    if (errorClave) return { ok: false, motivo: errorClave }

    // TODO: reemplazar por la llamada real, ej. await cuentasApi.cambiarPasswordPropia(actual, nueva)
    authService.restablecerPassword(propio.id, nueva)
    // La contraseña nunca se registra.
    registrarAuditoria('Cuentas', 'Cambiar contraseña', 'Cuenta', propio.username)
    return { ok: true }
  }

  /** Usuario libre a partir de un nombre: «Ricardo Peña Osorio» → «ricardo.pena». */
  function sugerirUsername(nombre: string): string {
    const palabras = normalizarTexto(nombre).split(/\s+/).map((palabra) => palabra.replace(/[^a-z0-9]/g, '')).filter(Boolean)
    if (palabras.length === 0) return ''
    const base = (palabras.length > 1 ? `${palabras[0]}.${palabras[1]}` : palabras[0]!).slice(0, 18)
    if (!authService.existeUsername(base)) return base
    for (let numero = 2; numero < 100; numero += 1) {
      const candidato = `${base}${numero}`
      if (!authService.existeUsername(candidato)) return candidato
    }
    return base
  }

  return { cuentas, esPropia, errorUsername, sugerirUsername, crear, actualizar, alternarEstatus, restablecerPassword, cambiarPasswordPropia }
}
