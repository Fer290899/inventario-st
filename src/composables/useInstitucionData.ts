import { reactive } from 'vue'
import { registrarAuditoria } from './useAuditoria'

export interface Institucion {
  nombre: string
  area: string
  /** Leyenda de responsabilidad que se imprime en las hojas de resguardo. */
  textoResponsabilidad: string
}

// Instancia compartida: el encabezado de todos los documentos lee de aquí.
const institucion = reactive<Institucion>({
  nombre: 'InventarioST',
  area: 'Área de inventarios',
  textoResponsabilidad:
    'El resguardante declara recibir los bienes descritos en buen estado, se compromete a usarlos únicamente para fines institucionales, a conservarlos y a informar de inmediato cualquier daño, pérdida o cambio de ubicación.',
})

export function useInstitucionData() {
  // TODO: reemplazar por la llamada real al servicio de configuración,
  // ej. await configuracionApi.actualizarInstitucion(datos)
  function actualizarInstitucion(datos: Institucion) {
    Object.assign(institucion, datos)
    registrarAuditoria('Configuración', 'Institución', datos.nombre, 'Datos de encabezado de los documentos')
  }

  return { institucion, actualizarInstitucion }
}
