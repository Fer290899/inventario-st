// Datos de demostración compartidos por el catálogo de técnicos y por la semilla de mantenimientos.
// Vive aparte (sin dependencias) para que ninguno de los dos composables tenga que importar al otro.

export interface TecnicoSemilla {
  id: string
  nombre: string
  especialidad: string
  contacto: string
}

export const TECNICOS_SEMILLA: TecnicoSemilla[] = [
  { id: 'tec-1', nombre: 'Ricardo Peña Osorio', especialidad: 'Cómputo y redes', contacto: '55 5010 2201' },
  { id: 'tec-2', nombre: 'Marcos Villalobos Núñez', especialidad: 'Impresión y periféricos', contacto: '55 5010 2202' },
  { id: 'tec-3', nombre: 'Elena Quintero Salas', especialidad: 'Electricidad y climatización', contacto: '55 5010 2203' },
]

/** Empresas y equipos externos: todavía no tienen catálogo propio, se ofrecen como segundo grupo al programar. */
export const PROVEEDORES_OPCIONES = [
  'Soporte Técnico Interno',
  'ServiTec Refacciones S.A.',
  'ElectroSoluciones del Bajío',
  'CompuServicios Integrales',
  'Mantenimiento Industrial Cruz',
]

/** A quién se asignan los mantenimientos sembrados, en rotación: primero los técnicos y luego los proveedores. */
export const ASIGNABLES_SEMILLA: ReadonlyArray<{ tecnico: string; tecnicoId?: string }> = [
  ...TECNICOS_SEMILLA.map((tecnico) => ({ tecnico: tecnico.nombre, tecnicoId: tecnico.id })),
  ...PROVEEDORES_OPCIONES.map((nombre) => ({ tecnico: nombre })),
]
