import { computed, reactive } from 'vue'
import { rolTienePermiso, type Permiso } from '@/config/permisos'
import { authService, type UsuarioSesion } from '@/services/authService'

const CLAVE = 'inventariost.sesion'

interface EstadoSesion {
  usuario: UsuarioSesion | null
}

function leerSesion(): UsuarioSesion | null {
  for (const almacen of ['localStorage', 'sessionStorage'] as const) {
    try {
      const crudo = window[almacen].getItem(CLAVE)
      if (crudo) return JSON.parse(crudo) as UsuarioSesion
    } catch {
      // Almacenamiento bloqueado o dato corrupto: se trata como sin sesión.
    }
  }
  return null
}

function borrarSesionGuardada() {
  for (const almacen of ['localStorage', 'sessionStorage'] as const) {
    try {
      window[almacen].removeItem(CLAVE)
    } catch {
      // Sin acceso al almacenamiento: nada que limpiar.
    }
  }
}

/** Actualiza la copia guardada, en el almacenamiento donde esté (localStorage si recordó la sesión, sessionStorage si no). */
function reescribirSesionGuardada(usuario: UsuarioSesion) {
  for (const almacen of ['localStorage', 'sessionStorage'] as const) {
    try {
      if (window[almacen].getItem(CLAVE)) window[almacen].setItem(CLAVE, JSON.stringify(usuario))
    } catch {
      // Sin acceso al almacenamiento: la sesión en memoria sigue siendo la vigente.
    }
  }
}

// La sesión se carga de forma síncrona para que el guard del router la vea desde la primera navegación.
const sesion = reactive<EstadoSesion>({ usuario: leerSesion() })

// Gancho para la bitácora sin importar el composable (evita un ciclo: la auditoría lee la sesión de aquí).
type Observador = (evento: 'inicio' | 'cierre', usuario: UsuarioSesion) => void
let observador: Observador | null = null
export function observarSesion(callback: Observador) {
  observador = callback
}

export function useAuth() {
  const usuario = computed(() => sesion.usuario)
  const rol = computed(() => sesion.usuario?.rol)
  const estaAutenticado = computed(() => sesion.usuario !== null)

  function can(permiso: Permiso): boolean {
    return rolTienePermiso(sesion.usuario?.rol, permiso)
  }

  async function iniciarSesion(username: string, password: string, recordar: boolean) {
    // TODO: reemplazar por authStore/API real; aquí solo se conserva el usuario, sin token.
    const autenticado = await authService.login(username, password)
    sesion.usuario = autenticado
    borrarSesionGuardada()
    try {
      ;(recordar ? window.localStorage : window.sessionStorage).setItem(CLAVE, JSON.stringify(autenticado))
    } catch {
      // Si no se puede guardar, la sesión dura mientras la pestaña siga abierta.
    }
    observador?.('inicio', autenticado)
  }

  function cerrarSesion() {
    const anterior = sesion.usuario
    if (anterior) observador?.('cierre', anterior)
    sesion.usuario = null
    borrarSesionGuardada()
  }

  /**
   * Contrasta la sesión abierta con su cuenta: si ya no existe o está inactiva la cierra (devuelve false);
   * si cambió su rol o nombre, los aplica. Se llama en cada navegación.
   */
  function refrescarSesion(): boolean {
    const actual = sesion.usuario
    if (!actual) return true

    const vigente = authService.validarSesion(actual)
    if (!vigente) {
      cerrarSesion()
      return false
    }
    if (vigente.nombre !== actual.nombre || vigente.rol !== actual.rol || vigente.username !== actual.username) {
      sesion.usuario = vigente
      reescribirSesionGuardada(vigente)
    }
    return true
  }

  return { usuario, rol, estaAutenticado, can, iniciarSesion, cerrarSesion, refrescarSesion }
}

/** Nombre de quien opera; 'Sistema' cuando no hay sesión (datos sembrados al cargar). */
export function nombreActual(): string {
  return sesion.usuario?.nombre ?? 'Sistema'
}

export function usuarioActual(): UsuarioSesion | null {
  return sesion.usuario
}
