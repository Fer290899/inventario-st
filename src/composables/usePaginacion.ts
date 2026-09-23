import { computed, ref, watch, type Ref } from 'vue'

/** Pagina una lista ya filtrada y mantiene la página actual dentro de rango. */
export function usePaginacion<T>(lista: Ref<T[]>, pageSize: Ref<number>) {
  const paginaActual = ref(1)

  const total = computed(() => lista.value.length)
  const totalPaginas = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

  const pagina = computed(() => {
    const inicio = (paginaActual.value - 1) * pageSize.value
    return lista.value.slice(inicio, inicio + pageSize.value)
  })

  const rangoInicio = computed(() => (total.value === 0 ? 0 : (paginaActual.value - 1) * pageSize.value + 1))
  const rangoFin = computed(() => Math.min(paginaActual.value * pageSize.value, total.value))

  function irAlInicio() {
    paginaActual.value = 1
  }

  watch(pageSize, irAlInicio)

  watch(totalPaginas, (nuevoTotal) => {
    if (paginaActual.value > nuevoTotal) paginaActual.value = nuevoTotal
  })

  return { paginaActual, totalPaginas, pagina, rangoInicio, rangoFin, total, irAlInicio }
}
