import { reactive } from 'vue'

export type ToastTipo = 'success' | 'info' | 'error'

export interface AccionToast {
  etiqueta: string
  ejecutar: () => void
}

export interface Toast {
  id: number
  tipo: ToastTipo
  mensaje: string
  accion?: AccionToast
}

// Lista compartida: cualquier vista puede disparar un toast y ToastHost los muestra.
const toasts = reactive<Toast[]>([])
let contador = 0

function cerrar(id: number) {
  const indice = toasts.findIndex((toast) => toast.id === id)
  if (indice !== -1) toasts.splice(indice, 1)
}

function mostrar(tipo: ToastTipo, mensaje: string, accion?: AccionToast) {
  contador += 1
  const id = contador
  toasts.push({ id, tipo, mensaje, accion })
  // Con una acción (p. ej. «Deshacer») se deja más tiempo para alcanzar a leerla y usarla.
  window.setTimeout(() => cerrar(id), accion ? 6000 : 3500)
}

export function useToast() {
  return {
    toasts,
    cerrar,
    success: (mensaje: string, accion?: AccionToast) => mostrar('success', mensaje, accion),
    info: (mensaje: string) => mostrar('info', mensaje),
    error: (mensaje: string) => mostrar('error', mensaje),
  }
}
