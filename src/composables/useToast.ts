import { reactive } from 'vue'

export type ToastTipo = 'success' | 'info' | 'error'

export interface Toast {
  id: number
  tipo: ToastTipo
  mensaje: string
}

// Lista compartida: cualquier vista puede disparar un toast y ToastHost los muestra.
const toasts = reactive<Toast[]>([])
let contador = 0

function cerrar(id: number) {
  const indice = toasts.findIndex((toast) => toast.id === id)
  if (indice !== -1) toasts.splice(indice, 1)
}

function mostrar(tipo: ToastTipo, mensaje: string, duracionMs = 3500) {
  contador += 1
  const id = contador
  toasts.push({ id, tipo, mensaje })
  window.setTimeout(() => cerrar(id), duracionMs)
}

export function useToast() {
  return {
    toasts,
    cerrar,
    success: (mensaje: string) => mostrar('success', mensaje),
    info: (mensaje: string) => mostrar('info', mensaje),
    error: (mensaje: string) => mostrar('error', mensaje),
  }
}
