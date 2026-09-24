/** Construye y descarga un CSV compatible con Excel (UTF-8 con BOM para acentos y ñ). */
export function descargarCsv(encabezados: string[], filas: string[][], nombreArchivo: string) {
  const escaparCelda = (valor: string) => `"${valor.replace(/"/g, '""')}"`
  const contenido = [encabezados, ...filas].map((fila) => fila.map(escaparCelda).join(',')).join('\r\n')

  const blob = new Blob([`﻿${contenido}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)

  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = `${nombreArchivo}_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(enlace)
  enlace.click()
  document.body.removeChild(enlace)
  URL.revokeObjectURL(url)
}

/**
 * Lee un CSV a una matriz de celdas. Acepta BOM, comillas dobles con saltos de línea dentro,
 * CRLF/LF y detecta si el separador es coma o punto y coma (Excel en español guarda con `;`).
 * Las filas totalmente vacías se descartan.
 */
export function parseCsv(texto: string): string[][] {
  const contenido = texto.replace(/^﻿/, '')

  // El separador se decide con la primera línea, ignorando lo que esté entre comillas.
  let comas = 0
  let puntosYComa = 0
  let entreComillas = false
  for (const caracter of contenido) {
    if (caracter === '"') entreComillas = !entreComillas
    else if (!entreComillas) {
      if (caracter === '\n') break
      if (caracter === ',') comas += 1
      else if (caracter === ';') puntosYComa += 1
    }
  }
  const separador = puntosYComa > comas ? ';' : ','

  const filas: string[][] = []
  let fila: string[] = []
  let celda = ''
  let enComillas = false

  const cerrarCelda = () => {
    fila.push(celda)
    celda = ''
  }
  const cerrarFila = () => {
    cerrarCelda()
    if (fila.some((valor) => valor.trim() !== '')) filas.push(fila)
    fila = []
  }

  for (let i = 0; i < contenido.length; i += 1) {
    const caracter = contenido[i]!
    if (enComillas) {
      if (caracter === '"' && contenido[i + 1] === '"') {
        celda += '"'
        i += 1
      } else if (caracter === '"') enComillas = false
      else celda += caracter
    } else if (caracter === '"') enComillas = true
    else if (caracter === separador) cerrarCelda()
    else if (caracter === '\n') cerrarFila()
    else if (caracter !== '\r') celda += caracter
  }
  if (celda !== '' || fila.length > 0) cerrarFila()

  return filas
}
