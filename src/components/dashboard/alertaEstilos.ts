import type { Severidad } from '@/composables/useAlertasData'

export const SEVERIDAD_ETIQUETA: Record<Severidad, string> = {
  critica: 'Crítica',
  aviso: 'Aviso',
}

export const SEVERIDAD_ESTILOS: Record<Severidad, string> = {
  critica: 'bg-rose-50 text-rose-700',
  aviso: 'bg-amber-50 text-amber-700',
}
