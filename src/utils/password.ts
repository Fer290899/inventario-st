export const PASSWORD_MINIMA = 8

// Sin caracteres que se confunden al dictarlos (0/O, 1/l/I).
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'

export function generarPassword(longitud = 10): string {
  const valores = new Uint32Array(longitud)
  crypto.getRandomValues(valores)
  return Array.from(valores, (valor) => ALFABETO[valor % ALFABETO.length]).join('')
}

/** Texto del error, o '' si la contraseña es válida. */
export function errorPassword(password: string): string {
  return password.length >= PASSWORD_MINIMA ? '' : `La contraseña debe tener al menos ${PASSWORD_MINIMA} caracteres.`
}
