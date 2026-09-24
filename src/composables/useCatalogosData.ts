import { computed, reactive } from 'vue'
import {
  DEPARTAMENTOS_SEMILLA,
  DIRECCIONES_SEMILLA,
  PUESTOS_SEMILLA,
  UBICACIONES_SEMILLA,
  USUARIOS_SEMILLA,
} from './catalogosSemilla'
import { registrarAuditoria } from './useAuditoria'
import { useBienesData } from './useBienesData'
import { useMovimientosData } from './useMovimientosData'

export type Catalogo = 'ubicacion' | 'direccion' | 'departamento' | 'usuario'
export type CatalogoSimple = Exclude<Catalogo, 'usuario'>

/** Ubicación, dirección o departamento. Los bienes lo guardan por su nombre. */
export interface ElementoCatalogo {
  id: string
  nombre: string
  activo: boolean
}

/** Personal que recibe bienes en resguardo. La ficha es informativa: los formularios de asignación siguen con captura manual. */
export interface Usuario {
  id: string
  nombre: string
  puesto: string
  direccion: string
  departamento: string
  activo: boolean
}

export interface DatosUsuario {
  nombre: string
  puesto: string
  direccion: string
  departamento: string
}

export interface ResultadoAccion {
  ok: boolean
  /** Explica por qué no se pudo, para mostrarlo en un aviso */
  motivo?: string
}

const ETIQUETA_CATALOGO: Record<Catalogo, string> = { ubicacion: 'Ubicación', direccion: 'Dirección', departamento: 'Departamento', usuario: 'Responsable' }

let contador = 0
function nuevoId(prefijo: string): string {
  contador += 1
  return `${prefijo}-${contador}`
}

function semillaSimple(prefijo: string, nombres: string[]): ElementoCatalogo[] {
  return nombres.map((nombre) => ({ id: nuevoId(prefijo), nombre, activo: true }))
}

// Instancias compartidas: todas las vistas ven las mismas listas.
const ubicaciones = reactive<ElementoCatalogo[]>(semillaSimple('ubi', UBICACIONES_SEMILLA))
const direcciones = reactive<ElementoCatalogo[]>(semillaSimple('dir', DIRECCIONES_SEMILLA))
const departamentos = reactive<ElementoCatalogo[]>(semillaSimple('dep', DEPARTAMENTOS_SEMILLA))
const usuarios = reactive<Usuario[]>(
  USUARIOS_SEMILLA.map((nombre, indice) => ({
    id: nuevoId('usr'),
    nombre,
    puesto: PUESTOS_SEMILLA[indice % PUESTOS_SEMILLA.length]!,
    direccion: DIRECCIONES_SEMILLA[indice % DIRECCIONES_SEMILLA.length]!,
    departamento: DEPARTAMENTOS_SEMILLA[(indice + 2) % DEPARTAMENTOS_SEMILLA.length]!,
    activo: true,
  })),
)

function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
}

function listaDe(catalogo: Catalogo): Array<{ id: string; nombre: string; activo: boolean }> {
  if (catalogo === 'ubicacion') return ubicaciones
  if (catalogo === 'direccion') return direcciones
  if (catalogo === 'departamento') return departamentos
  return usuarios
}

export function useCatalogosData() {
  // TODO: reemplazar por la llamada real a los servicios de catálogos,
  // ej. await catalogosApi.getUbicaciones() / getUsuarios()
  const { bienes } = useBienesData()
  const { hojas, movimientos } = useMovimientosData()

  // Las activas alimentan los formularios de alta y movimiento; las "todas" (con inactivas) alimentan los
  // filtros, para que lo histórico siga siendo filtrable.
  const activas = reactive({
    ubicaciones: computed(() => ubicaciones.filter((item) => item.activo).map((item) => item.nombre)),
    direcciones: computed(() => direcciones.filter((item) => item.activo).map((item) => item.nombre)),
    departamentos: computed(() => departamentos.filter((item) => item.activo).map((item) => item.nombre)),
    usuarios: computed(() => usuarios.filter((item) => item.activo).map((item) => item.nombre)),
  })

  const todas = reactive({
    ubicaciones: computed(() => ubicaciones.map((item) => item.nombre)),
    direcciones: computed(() => direcciones.map((item) => item.nombre)),
    departamentos: computed(() => departamentos.map((item) => item.nombre)),
    usuarios: computed(() => usuarios.map((item) => item.nombre)),
  })

  function existeNombre(catalogo: Catalogo, nombre: string, ignorarId?: string): boolean {
    const buscado = normalizar(nombre)
    return listaDe(catalogo).some((item) => item.id !== ignorarId && normalizar(item.nombre) === buscado)
  }

  /** Bienes vigentes que lo tienen (en usuarios: los bienes a su resguardo). */
  function bienesEn(catalogo: Catalogo, nombre: string): number {
    return bienes.filter((bien) => {
      if (catalogo === 'ubicacion') return bien.ubicacion === nombre
      if (catalogo === 'direccion') return bien.direccion === nombre
      if (catalogo === 'departamento') return bien.departamento === nombre
      return bien.responsable === nombre
    }).length
  }

  /** Toda mención: bienes, fichas de usuario, hojas y movimientos. Si es mayor que 0, solo se puede inactivar. */
  function referencias(catalogo: Catalogo, nombre: string): number {
    let total = bienesEn(catalogo, nombre)

    if (catalogo === 'ubicacion') {
      total += movimientos.filter((movimiento) => movimiento.destino?.ubicacion === nombre).length
    } else if (catalogo === 'direccion') {
      total += usuarios.filter((usuario) => usuario.direccion === nombre).length
      total += hojas.filter((hoja) => hoja.direccion === nombre).length
      total += movimientos.filter((movimiento) => movimiento.destino?.direccion === nombre).length
    } else if (catalogo === 'departamento') {
      total += usuarios.filter((usuario) => usuario.departamento === nombre).length
      total += hojas.filter((hoja) => hoja.departamento === nombre).length
      total += movimientos.filter((movimiento) => movimiento.destino?.departamento === nombre).length
    } else {
      total += hojas.filter((hoja) => hoja.persona === nombre).length
      total += movimientos.filter((movimiento) => movimiento.destino?.persona === nombre).length
    }

    return total
  }

  function listaSimple(catalogo: CatalogoSimple): ElementoCatalogo[] {
    return catalogo === 'ubicacion' ? ubicaciones : catalogo === 'direccion' ? direcciones : departamentos
  }

  function agregarElemento(catalogo: CatalogoSimple, nombre: string): ElementoCatalogo {
    // TODO: reemplazar por la llamada real, ej. await catalogosApi.crear(catalogo, { nombre })
    const elemento: ElementoCatalogo = { id: nuevoId(catalogo.slice(0, 3)), nombre: nombre.trim(), activo: true }
    listaSimple(catalogo).unshift(elemento)
    registrarAuditoria('Catálogos', 'Alta', ETIQUETA_CATALOGO[catalogo], elemento.nombre)
    return elemento
  }

  function actualizarElemento(catalogo: CatalogoSimple, id: string, nombre: string) {
    // TODO: reemplazar por la llamada real, ej. await catalogosApi.actualizar(catalogo, id, { nombre })
    const elemento = listaSimple(catalogo).find((item) => item.id === id)
    if (!elemento) return

    const anterior = elemento.nombre
    elemento.nombre = nombre.trim()
    if (anterior === elemento.nombre) return
    registrarAuditoria('Catálogos', 'Renombrar', ETIQUETA_CATALOGO[catalogo], `${anterior} → ${elemento.nombre}`)

    // Lo vigente (bienes y fichas de usuario) sigue al nombre nuevo; las hojas y movimientos son
    // instantáneas firmadas y conservan el nombre que tenían.
    for (const bien of bienes) {
      if (catalogo === 'ubicacion' && bien.ubicacion === anterior) bien.ubicacion = elemento.nombre
      if (catalogo === 'direccion' && bien.direccion === anterior) bien.direccion = elemento.nombre
      if (catalogo === 'departamento' && bien.departamento === anterior) bien.departamento = elemento.nombre
    }
    for (const usuario of usuarios) {
      if (catalogo === 'direccion' && usuario.direccion === anterior) usuario.direccion = elemento.nombre
      if (catalogo === 'departamento' && usuario.departamento === anterior) usuario.departamento = elemento.nombre
    }
  }

  function agregarUsuario(datos: DatosUsuario): Usuario {
    // TODO: reemplazar por la llamada real, ej. await catalogosApi.crearUsuario(datos)
    const usuario: Usuario = {
      id: nuevoId('usr'),
      nombre: datos.nombre.trim(),
      puesto: datos.puesto.trim(),
      direccion: datos.direccion,
      departamento: datos.departamento,
      activo: true,
    }
    usuarios.unshift(usuario)
    registrarAuditoria('Catálogos', 'Alta', 'Responsable', usuario.nombre)
    return usuario
  }

  function actualizarUsuario(id: string, datos: DatosUsuario) {
    // TODO: reemplazar por la llamada real, ej. await catalogosApi.actualizarUsuario(id, datos)
    const usuario = usuarios.find((item) => item.id === id)
    if (!usuario) return

    const anterior = usuario.nombre
    usuario.nombre = datos.nombre.trim()
    usuario.puesto = datos.puesto.trim()
    usuario.direccion = datos.direccion
    usuario.departamento = datos.departamento
    registrarAuditoria('Catálogos', 'Edición', 'Responsable',anterior === usuario.nombre ? usuario.nombre : `${anterior} → ${usuario.nombre}`)

    // La custodia vigente sigue a la persona; las hojas firmadas conservan el nombre con el que se firmaron.
    if (anterior !== usuario.nombre) {
      for (const bien of bienes) {
        if (bien.responsable === anterior) bien.responsable = usuario.nombre
      }
    }
  }

  function alternarActivo(catalogo: Catalogo, id: string): ResultadoAccion {
    // TODO: reemplazar por la llamada real, ej. await catalogosApi.cambiarEstatus(catalogo, id)
    const elemento = listaDe(catalogo).find((item) => item.id === id)
    if (!elemento) return { ok: false, motivo: 'No se encontró el elemento.' }

    if (elemento.activo && catalogo === 'usuario') {
      const bienesACargo = bienesEn('usuario', elemento.nombre)
      if (bienesACargo > 0) {
        return {
          ok: false,
          motivo: `${elemento.nombre} tiene ${bienesACargo} ${bienesACargo === 1 ? 'bien' : 'bienes'} a su resguardo. Devuélvelos o reasígnalos antes de inactivarlo.`,
        }
      }
    }

    elemento.activo = !elemento.activo
    registrarAuditoria('Catálogos', elemento.activo ? 'Reactivar' : 'Inactivar', ETIQUETA_CATALOGO[catalogo], elemento.nombre)
    return { ok: true }
  }

  function eliminar(catalogo: Catalogo, id: string): ResultadoAccion {
    // TODO: reemplazar por la llamada real, ej. await catalogosApi.eliminar(catalogo, id)
    const lista = listaDe(catalogo)
    const indice = lista.findIndex((item) => item.id === id)
    if (indice === -1) return { ok: false, motivo: 'No se encontró el elemento.' }

    if (referencias(catalogo, lista[indice]!.nombre) > 0) {
      return { ok: false, motivo: 'Tiene bienes, responsables o documentos que lo mencionan; inactívalo en su lugar.' }
    }

    const [eliminado] = lista.splice(indice, 1)
    registrarAuditoria('Catálogos', 'Eliminar', ETIQUETA_CATALOGO[catalogo], eliminado!.nombre)
    return { ok: true }
  }

  return {
    ubicaciones,
    direcciones,
    departamentos,
    usuarios,
    activas,
    todas,
    existeNombre,
    bienesEn,
    referencias,
    agregarElemento,
    actualizarElemento,
    agregarUsuario,
    actualizarUsuario,
    alternarActivo,
    eliminar,
  }
}
