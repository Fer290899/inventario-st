import { formatMoneda } from '@/utils/formato'
import { useBienesData, type Bien, type CambioBitacora } from './useBienesData'
import { useMantenimientosData } from './useMantenimientosData'
import { useMovimientosData } from './useMovimientosData'

export type TipoEventoHistorial = 'alta' | 'movimiento' | 'mantenimiento' | 'dictamen' | 'edicion'

export interface EventoHistorial {
  clave: string
  /** Fecha ISO (YYYY-MM-DD) */
  fecha: string
  tipo: TipoEventoHistorial
  titulo: string
  detalle: string
  /** Solo ediciones: qué cambió */
  cambios?: CambioBitacora[]
}

/**
 * Línea de tiempo de un bien, del evento más reciente al más antiguo. La alta se deriva de `fechaAlta`;
 * lo demás viene de movimientos, mantenimientos, dictámenes y la bitácora de ediciones.
 */
export function useHistorialBien() {
  const { bitacora } = useBienesData()
  const { movimientos, hojas } = useMovimientosData()
  const { mantenimientos, dictamenes } = useMantenimientosData()

  function historialDe(bien: Bien): EventoHistorial[] {
    const orden = new Map<string, number>()
    const eventos: EventoHistorial[] = []
    const agregar = (evento: EventoHistorial) => {
      orden.set(evento.clave, orden.size)
      eventos.push(evento)
    }

    agregar({
      clave: `alta-${bien.id}`,
      fecha: bien.fechaAlta,
      tipo: 'alta',
      titulo: 'Alta en inventario',
      detalle:
        [
          bien.origen,
          bien.numeroFactura ? `Factura ${bien.numeroFactura}` : '',
          bien.valorAdquisicion !== undefined ? formatMoneda(bien.valorAdquisicion, { centavos: true }) : '',
        ]
          .filter(Boolean)
          .join(' · ') || 'Registro inicial',
    })

    for (const mov of movimientos) {
      if (!mov.bienesIds.includes(bien.id)) continue
      const folios = hojas
        .filter((hoja) => hoja.movimientoId === mov.id && hoja.bienesIds.includes(bien.id))
        .map((hoja) => hoja.folio)
      agregar({
        clave: mov.id,
        fecha: mov.fecha,
        tipo: 'movimiento',
        titulo: mov.tipo,
        detalle: [
          mov.destino ? `A ${mov.destino.persona} (${mov.destino.puesto}) · ${mov.destino.direccion}` : 'Devuelto al almacén',
          mov.mesaAyuda ? `Mesa de ayuda ${mov.mesaAyuda}` : '',
          folios.length > 0 ? `Hojas: ${folios.join(', ')}` : '',
          mov.notas ?? '',
        ]
          .filter(Boolean)
          .join(' · '),
      })
    }

    for (const mant of mantenimientos) {
      if (mant.bienId !== bien.id) continue
      agregar({
        clave: `${mant.id}-programado`,
        fecha: mant.fecha,
        tipo: 'mantenimiento',
        titulo: `Mantenimiento ${mant.tipo.toLowerCase()} programado`,
        detalle: [
          mant.folio,
          mant.tecnico,
          mant.prioridad ? `Prioridad ${mant.prioridad}` : '',
          mant.periodicidad ? mant.periodicidad : '',
          mant.fallaReportada ?? '',
        ]
          .filter(Boolean)
          .join(' · '),
      })
      if (mant.estatus === 'Concluido' && mant.fechaConclusion) {
        agregar({
          clave: `${mant.id}-concluido`,
          fecha: mant.fechaConclusion,
          tipo: 'mantenimiento',
          titulo: `Mantenimiento ${mant.tipo.toLowerCase()} concluido`,
          detalle: [
            mant.folio,
            mant.resultado ?? 'Realizado',
            mant.costo !== undefined ? `Costo ${formatMoneda(mant.costo)}` : '',
            mant.notasConclusion ?? '',
          ]
            .filter(Boolean)
            .join(' · '),
        })
      }
    }

    for (const dictamen of dictamenes) {
      if (dictamen.bienId !== bien.id) continue
      agregar({
        clave: dictamen.id,
        fecha: dictamen.fecha,
        tipo: 'dictamen',
        titulo: 'Dictamen de baja',
        detalle: `${dictamen.folio} · ${dictamen.causa} · ${dictamen.destinoFinal}`,
      })
    }

    for (const registro of bitacora) {
      if (registro.bienId !== bien.id) continue
      agregar({
        clave: registro.id,
        fecha: registro.fecha,
        tipo: 'edicion',
        titulo: 'Edición de datos',
        detalle: `${registro.cambios.length} ${registro.cambios.length === 1 ? 'cambio' : 'cambios'} · ${registro.registradoPor}`,
        cambios: registro.cambios,
      })
    }

    // Más reciente primero; en la misma fecha, lo generado después (conclusión, edición) queda arriba.
    return eventos.sort((a, b) => b.fecha.localeCompare(a.fecha) || orden.get(b.clave)! - orden.get(a.clave)!)
  }

  return { historialDe }
}
