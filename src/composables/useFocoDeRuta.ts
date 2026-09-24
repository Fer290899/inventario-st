import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { esFocoVista, type FocoVista } from './useAlertasData'

/**
 * Lee `?foco=` de la URL (lo envían las alertas y las tarjetas del dashboard) y lo mantiene sincronizado
 * cuando solo cambia el query; la página lo compone con su búsqueda y filtros.
 */
export function useFocoDeRuta(permitidos: FocoVista[]) {
  const route = useRoute()
  const router = useRouter()
  const foco = ref<FocoVista | null>(null)

  function leer() {
    const valor = route.query.foco
    foco.value = esFocoVista(valor) && permitidos.includes(valor) ? valor : null
  }

  leer()
  watch(() => route.query.foco, leer)

  function limpiar() {
    foco.value = null
    router.replace({ query: {} })
  }

  return { foco, limpiar }
}
