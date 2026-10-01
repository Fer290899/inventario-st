// Módulo hoja (sin imports): datos iniciales de los catálogos. Vive aparte para que useBienesData,
// useMovimientosData y useCatalogosData puedan usarlos sin crear imports circulares.

export const UBICACIONES_SEMILLA = ['Edificio Central - Piso 1', 'Edificio Central - Piso 2', 'Bodega General', 'Anexo Norte', 'Anexo Sur']

export const DIRECCIONES_SEMILLA = [
  'Dirección General',
  'Dirección de Administración',
  'Dirección de Sistemas',
  'Dirección Jurídica',
  'Dirección de Finanzas',
]

export const DEPARTAMENTOS_SEMILLA = ['Recursos Humanos', 'Tecnologías de la Información', 'Contabilidad', 'Mantenimiento', 'Compras']

/** Ubicación a la que pertenece cada Dirección (por nombre), para la relación entre catálogos. */
export const UBICACION_POR_DIRECCION: Record<string, string> = {
  'Dirección General': 'Edificio Central - Piso 1',
  'Dirección de Administración': 'Edificio Central - Piso 2',
  'Dirección de Sistemas': 'Anexo Norte',
  'Dirección Jurídica': 'Edificio Central - Piso 2',
  'Dirección de Finanzas': 'Bodega General',
}

/** Dirección a la que pertenece cada Departamento (por nombre), para la relación entre catálogos. */
export const DIRECCION_POR_DEPARTAMENTO: Record<string, string> = {
  'Recursos Humanos': 'Dirección de Administración',
  'Tecnologías de la Información': 'Dirección de Sistemas',
  Contabilidad: 'Dirección de Finanzas',
  Mantenimiento: 'Dirección de Administración',
  Compras: 'Dirección de Administración',
}

export const USUARIOS_SEMILLA = [
  'Ana Torres Medina',
  'Carlos Jiménez Ruiz',
  'María Fernández López',
  'Luis Hernández Castro',
  'Sofía Ramírez Ortiz',
  'Jorge Salinas Peña',
  'Daniela Cruz Villanueva',
  'Roberto Gómez Silva',
  'Patricia Mendoza Rivas',
  'Fernando Reyes Aguilar',
  'Claudia Navarro Soto',
  'Miguel Ángel Domínguez',
]

export const PUESTOS_SEMILLA = ['Jefe de departamento', 'Analista', 'Auxiliar administrativo', 'Coordinador', 'Técnico de soporte']
