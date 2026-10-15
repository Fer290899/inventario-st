import type { EstatusBien } from '@/composables/useBienesData'

/**
 * Un único mapa de estatus para todo el sistema: el estatus se lee por el punto (forma + color) y
 * por el texto, nunca solo por el color. `punto` es el marcador de listas; `barra` pinta un tramo
 * de la barra de distribución del dashboard.
 */
export const ESTATUS_BIEN_ESTILO: Record<EstatusBien, { punto: string; barra: string }> = {
  Asignado: { punto: 'bg-blue-600', barra: 'bg-blue-600' },
  // Hueco: "disponible, sin dueño". Se distingue de los demás por la forma y no solo por el tono.
  'Por asignar': { punto: 'bg-transparent ring-2 ring-inset ring-slate-900', barra: 'bg-white ring-2 ring-inset ring-slate-900' },
  'En reparación': { punto: 'bg-amber-500', barra: 'bg-amber-500' },
  Baja: { punto: 'bg-slate-400', barra: 'bg-slate-400' },
}
