import { reactive } from 'vue'
import type { Rol } from '@/config/permisos'

export interface UsuarioSesion {
  id: string
  username: string
  nombre: string
  rol: Rol
}

interface Cuenta extends UsuarioSesion {
  password: string
  activo: boolean
  /** Fecha y hora ISO */
  creadoEn: string
  /** Fecha y hora ISO del último inicio de sesión; null si nunca ha entrado */
  ultimoAcceso: string | null
}

/** Cuenta tal como la ve la interfaz: nunca incluye la contraseña. */
export type CuentaPublica = Omit<Cuenta, 'password'>

export interface DatosCuentaNueva {
  username: string
  nombre: string
  rol: Rol
  password: string
}

export interface CambiosCuenta {
  nombre: string
  rol: Rol
}

// Cuentas de demostración: mientras no exista backend la validación ocurre en el cliente y los datos viven en memoria.
// TODO: reemplazar todo este módulo por los endpoints reales (las contraseñas nunca viven en el frontend).
const ahora = new Date().toISOString()
const CUENTAS = reactive<Cuenta[]>([
  { id: 'u-admin', username: 'admin', password: 'admin123', nombre: 'Administrador', rol: 'Administrador', activo: true, creadoEn: ahora, ultimoAcceso: null },
  { id: 'u-captura', username: 'capturista', password: 'captura123', nombre: 'Carla Capturista', rol: 'Capturista', activo: true, creadoEn: ahora, ultimoAcceso: null },
  { id: 'u-consulta', username: 'consulta', password: 'consulta123', nombre: 'Carlos Consulta', rol: 'Consulta', activo: true, creadoEn: ahora, ultimoAcceso: null },
])

/** Lista fija que el login muestra en desarrollo; no refleja cambios hechos desde Administración. */
export const CUENTAS_DEMO: ReadonlyArray<{ username: string; password: string; rol: Rol }> = [
  { username: 'admin', password: 'admin123', rol: 'Administrador' },
  { username: 'capturista', password: 'captura123', rol: 'Capturista' },
  { username: 'consulta', password: 'consulta123', rol: 'Consulta' },
]

let contador = 0

function sinPassword({ password: _password, ...resto }: Cuenta): CuentaPublica {
  return resto
}

function aSesion({ id, username, nombre, rol }: Cuenta): UsuarioSesion {
  return { id, username, nombre, rol }
}

function normalizarUsername(username: string): string {
  return username.trim().toLowerCase()
}

export const authService = {
  async login(username: string, password: string): Promise<UsuarioSesion> {
    // Latencia simulada para que la interfaz muestre su estado de carga.
    await new Promise((resolver) => setTimeout(resolver, 500))

    const cuenta = CUENTAS.find((item) => item.username === normalizarUsername(username) && item.password === password)
    if (!cuenta) throw new Error('Usuario o contraseña incorrectos.')
    // Solo se revela que está inactiva a quien ya acertó la contraseña.
    if (!cuenta.activo) throw new Error('Esta cuenta está inactiva. Contacta al administrador.')

    cuenta.ultimoAcceso = new Date().toISOString()
    return aSesion(cuenta)
  },

  /** La cuenta vigente de una sesión abierta (con su rol y nombre actuales), o null si ya no tiene acceso. */
  validarSesion(usuario: UsuarioSesion): UsuarioSesion | null {
    const cuenta = CUENTAS.find((item) => item.id === usuario.id)
    return cuenta?.activo ? aSesion(cuenta) : null
  },

  listarCuentas(): CuentaPublica[] {
    return CUENTAS.map(sinPassword)
  },

  existeUsername(username: string, ignorarId?: string): boolean {
    const buscado = normalizarUsername(username)
    return CUENTAS.some((cuenta) => cuenta.username === buscado && cuenta.id !== ignorarId)
  },

  crearCuenta(datos: DatosCuentaNueva): CuentaPublica {
    contador += 1
    const cuenta: Cuenta = {
      id: `u-${Date.now()}-${contador}`,
      username: normalizarUsername(datos.username),
      password: datos.password,
      nombre: datos.nombre.trim(),
      rol: datos.rol,
      activo: true,
      creadoEn: new Date().toISOString(),
      ultimoAcceso: null,
    }
    CUENTAS.push(cuenta)
    return sinPassword(cuenta)
  },

  actualizarCuenta(id: string, cambios: CambiosCuenta): void {
    const cuenta = CUENTAS.find((item) => item.id === id)
    if (!cuenta) return
    cuenta.nombre = cambios.nombre.trim()
    cuenta.rol = cambios.rol
  },

  alternarEstatus(id: string): void {
    const cuenta = CUENTAS.find((item) => item.id === id)
    if (cuenta) cuenta.activo = !cuenta.activo
  },

  restablecerPassword(id: string, password: string): void {
    const cuenta = CUENTAS.find((item) => item.id === id)
    if (cuenta) cuenta.password = password
  },
}
