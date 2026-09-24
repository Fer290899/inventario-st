<template>
  <img v-if="imagen" :src="imagen" :width="tamano" :height="tamano" :alt="`Código QR: ${valor}`" data-doc="qr" class="block" />
  <span v-else :style="{ width: `${tamano}px`, height: `${tamano}px` }" class="block rounded bg-slate-100"></span>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import QRCode from 'qrcode'

const props = withDefaults(
  defineProps<{
    valor: string
    /** Lado en píxeles */
    tamano?: number
  }>(),
  { tamano: 96 },
)

// Generar un QR es asíncrono y se repite (vista previa e impresión): se reutilizan los ya calculados.
const cache = new Map<string, string>()
const imagen = ref('')

watch(
  () => props.valor,
  async (valor) => {
    const guardado = cache.get(valor)
    if (guardado) {
      imagen.value = guardado
      return
    }
    // Se genera al doble del tamaño visible para que no se pixele al imprimir.
    const url = await QRCode.toDataURL(valor, { margin: 0, errorCorrectionLevel: 'M', width: props.tamano * 4 })
    cache.set(valor, url)
    if (valor === props.valor) imagen.value = url
  },
  { immediate: true },
)
</script>
