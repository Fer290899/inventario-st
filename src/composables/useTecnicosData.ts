import { computed, reactive } from 'vue'
import { authService } from '@/services/authService'
import { normalizarTexto } from '@/utils/formato'
import { errorPassword } from '@/utils/password'
import { registrarAuditoria } from './useAuditoria'
import type { ResultadoAccion } from './useCatalogosData'
import { useCuentasData, type CuentaPublica } from './useCuentasData'
import { useMantenimientosData } from './useMantenimientosData'
import { PROVEEDORES_OPCIONES, TECNICOS_SEMILLA } from './tecnicosSemilla'

export interface Tecnico {
  id: string
  nombre: string
  especialidad: string
  contacto: string
  activo: boolean
}

export interface DatosTecnico {
  nombre: string
  especialidad: string
  contacto: string
}

export interface AccesoNuevo {
  username: string
  password: string
}

export interface ResultadoTecnico extends ResultadoAccion {
  /** Al inactivar a un técnico con acceso, su cuenta también se inactiva */
  cuentaInactivada?: boolean
}

export interface OpcionTecnico {
  id: string
  nombre: string
}

// TODO: reemplazar por la llamada real, ej. await tecnicosApi.getTecnicos()
const tecnicos = reactive<Tecnico[]>(TECNICOS_SEMILLA.map((tecnico) => ({ ...tecnico, activo: true })))
let contador = 0

function nuevoId(): string {
  contador += 1
  return `tec-${Date.now()}-${contador}`
}

export function useTecnicosData() {
  const { mantenimientos } = useMantenimientosData()
  const { cuentas, crear: crearCuenta, errorUsername } = useCuentasData()

  function existeNombre(nombre: string, ignorarId?: string): boolean {
    const buscado = normalizarTexto(nombre.trim())
    return tecnicos.some((tecnico) => tecnico.id !== ignorarId && normalizarTexto(tecnico.nombre) === buscado)
  }

  function cuentaDe(tecnicoId: string): CuentaPublica | undefined {
    return cuentas.value.find((cuenta) => cuenta.tecnicoId === tecnicoId)
  }

  /** Mantenimientos programados o en curso que tiene asignados. */
  function abiertosDe(tecnicoId: string): number {
    return mantenimientos.filter((item) => item.tecnicoId === tecnicoId && (item.estatus === 'Programado' || item.estatus === 'En curso')).length
  }

  /** Todo lo que lo menciona (abierto o concluido) más su cuenta: si es mayor que 0, solo se puede inactivar. */
  function referencias(tecnicoId: string): number {
    return mantenimientos.filter((item) => item.tecnicoId === tecnicoId).length + (cuentaDe(tecnicoId) ? 1 : 0)
  }

  /** Error de validación del acceso, o '' si se puede crear. */
  function errorAcceso(acceso: AccesoNuevo): string {
    if (acceso.username.trim() === '') return 'El usuario es obligatorio.'
    return errorUsername(acceso.username) || errorPassword(acceso.password)
  }

  function crear(datos: DatosTecnico, acceso?: AccesoNuevo): ResultadoAccion {
    const nombre = datos.nombre.trim()
    if (nombre === '') return { ok: false, motivo: 'El nombre es obligatorio.' }
    if (existeNombre(nombre)) return { ok: false, motivo: 'Ya existe un técnico con ese nombre.' }
    if (acceso) {
      const error = errorAcceso(acceso)
      if (error) return { ok: false, motivo: error }
    }

    // TODO: reemplazar por la llamada real, ej. await tecnicosApi.crear(datos)
    const tecnico: Tecnico = { id: nuevoId(), nombre, especialidad: datos.especialidad.trim(), contacto: datos.contacto.trim(), activo: true }
    tecnicos.unshift(tecnico)
    registrarAuditoria('Catálogos', 'Alta', 'Técnico', nombre)

    // Ya se validó todo arriba, así que crear la cuenta no falla; el técnico no queda a medias.
    return acceso ? crearCuenta({ username: acceso.username, nombre, rol: 'Técnico', password: acceso.password, tecnicoId: tecnico.id }) : { ok: true }
  }

  function crearAcceso(tecnicoId: string, acceso: AccesoNuevo): ResultadoAccion {
    const tecnico = tecnicos.find((item) => item.id === tecnicoId)
    if (!tecnico) return { ok: false, motivo: 'No se encontró al técnico.' }
    if (!tecnico.activo) return { ok: false, motivo: 'Reactiva al técnico antes de darle acceso.' }
    if (cuentaDe(tecnicoId)) return { ok: false, motivo: 'Este técnico ya tiene acceso.' }
    const error = errorAcceso(acceso)
    if (error) return { ok: false, motivo: error }

    return crearCuenta({ username: acceso.username, nombre: tecnico.nombre, rol: 'Técnico', password: acceso.password, tecnicoId })
  }

  function actualizar(id: string, datos: DatosTecnico): ResultadoAccion {
    const tecnico = tecnicos.find((item) => item.id === id)
    if (!tecnico) return { ok: false, motivo: 'No se encontró al técnico.' }
    const nombre = datos.nombre.trim()
    if (nombre === '') return { ok: false, motivo: 'El nombre es obligatorio.' }
    if (existeNombre(nombre, id)) return { ok: false, motivo: 'Ya existe un técnico con ese nombre.' }

    // TODO: reemplazar por la llamada real, ej. await tecnicosApi.actualizar(id, datos)
    const anterior = tecnico.nombre
    tecnico.nombre = nombre
    tecnico.especialidad = datos.especialidad.trim()
    tecnico.contacto = datos.contacto.trim()

    if (anterior !== nombre) {
      // Lo vigente sigue al nombre nuevo (su cuenta y lo que aún no concluye); lo ya concluido queda como se firmó.
      const cuenta = cuentaDe(id)
      if (cuenta) authService.actualizarCuenta(cuenta.id, { nombre, rol: cuenta.rol })
      for (const item of mantenimientos) {
        if (item.tecnicoId === id && (item.estatus === 'Programado' || item.estatus === 'En curso')) item.tecnico = nombre
      }
    }
    registrarAuditoria('Catálogos', 'Edición', 'Técnico', anterior === nombre ? nombre : `${anterior} → ${nombre}`)
    return { ok: true }
  }

  function alternarActivo(id: string): ResultadoTecnico {
    const tecnico = tecnicos.find((item) => item.id === id)
    if (!tecnico) return { ok: false, motivo: 'No se encontró al técnico.' }

    if (tecnico.activo) {
      const abiertos = abiertosDe(id)
      if (abiertos > 0) {
        return {
          ok: false,
          motivo: `${tecnico.nombre} tiene ${abiertos} ${abiertos === 1 ? 'mantenimiento abierto' : 'mantenimientos abiertos'}. Concluye o reasígnalos antes de inactivarlo.`,
        }
      }
    }

    // TODO: reemplazar por la llamada real, ej. await tecnicosApi.cambiarEstatus(id)
    tecnico.activo = !tecnico.activo
    registrarAuditoria('Catálogos', tecnico.activo ? 'Reactivar' : 'Inactivar', 'Técnico', tecnico.nombre)

    // Quien ya no es técnico activo tampoco debe poder entrar; reactivarlo no reactiva la cuenta sola.
    const cuenta = cuentaDe(id)
    if (!tecnico.activo && cuenta?.activo) {
      authService.alternarEstatus(cuenta.id)
      registrarAuditoria('Cuentas', 'Inactivar', 'Cuenta', `${cuenta.username} · por inactivar al técnico`)
      return { ok: true, cuentaInactivada: true }
    }
    return { ok: true }
  }

  function eliminar(id: string): ResultadoAccion {
    const indice = tecnicos.findIndex((item) => item.id === id)
    if (indice === -1) return { ok: false, motivo: 'No se encontró al técnico.' }
    if (referencias(id) > 0) return { ok: false, motivo: 'Tiene mantenimientos o una cuenta de acceso; inactívalo en su lugar.' }

    // TODO: reemplazar por la llamada real, ej. await tecnicosApi.eliminar(id)
    const [eliminado] = tecnicos.splice(indice, 1)
    registrarAuditoria('Catálogos', 'Eliminar', 'Técnico', eliminado!.nombre)
    return { ok: true }
  }

  /** Lo que ofrece el selector al programar: técnicos activos y, aparte, los proveedores externos. */
  const opcionesParaProgramar = computed<{ tecnicos: OpcionTecnico[]; proveedores: readonly string[] }>(() => ({
    tecnicos: tecnicos.filter((tecnico) => tecnico.activo).map(({ id, nombre }) => ({ id, nombre })),
    proveedores: PROVEEDORES_OPCIONES,
  }))

  function idPorNombre(nombre: string): string | undefined {
    return tecnicos.find((tecnico) => tecnico.nombre === nombre)?.id
  }

  return {
    tecnicos,
    opcionesParaProgramar,
    existeNombre,
    errorAcceso,
    cuentaDe,
    abiertosDe,
    referencias,
    idPorNombre,
    crear,
    crearAcceso,
    actualizar,
    alternarActivo,
    eliminar,
  }
}
