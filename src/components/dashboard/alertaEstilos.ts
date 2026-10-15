import type { Severidad } from '@/composables/useAlertasData'

export const SEVERIDAD_ETIQUETA: Record<Severidad, string> = {
  critica: 'Crítica',
  aviso: 'Aviso',
}

/** Texto y punto comparten color; la severidad se lee por la palabra, no solo por el tono. */
export const SEVERIDAD_TEXTO: Record<Severidad, string> = {
  critica: 'text-rose-700',
  aviso: 'text-amber-700',
}

export const SEVERIDAD_PUNTO: Record<Severidad, string> = {
  critica: 'bg-rose-700',
  aviso: 'bg-amber-700',
}
