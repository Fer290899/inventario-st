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
