import type { CaracteristicaDef } from '@/composables/useTiposBienData'

export type ValorCaracteristica = string | number | boolean

/** Valor legible: número con su unidad, sí/no como "Sí"/"No"; '' si no hay valor. */
export function formatearValor(def: CaracteristicaDef, valor: ValorCaracteristica | undefined): string {
  if (valor === undefined || valor === '') return ''
  if (def.tipoDato === 'si-no') return valor === true ? 'Sí' : valor === false ? 'No' : String(valor)
  if (def.tipoDato === 'numero') return def.unidad ? `${valor} ${def.unidad}` : String(valor)
  return String(valor)
}

/** "Procesador: i5 · RAM: 8 GB · observaciones", omitiendo lo que esté vacío. */
export function resumirCaracteristicas(
  defs: CaracteristicaDef[],
  valores: Record<string, ValorCaracteristica> | undefined,
  observaciones: string | undefined,
): string {
  const partes = defs
    .map((def) => {
      const texto = formatearValor(def, valores?.[def.id])
      return texto ? `${def.nombre}: ${texto}` : ''
    })
    .filter(Boolean)
  const nota = observaciones?.trim()
  if (nota) partes.push(nota)
  return partes.join(' · ')
}
