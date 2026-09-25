<template>
  <optgroup v-if="opcionesParaProgramar.tecnicos.length > 0" label="Técnicos">
    <option v-for="tecnico in opcionesParaProgramar.tecnicos" :key="tecnico.id" :value="tecnico.nombre">{{ tecnico.nombre }}</option>
  </optgroup>
  <optgroup label="Proveedores y otros">
    <option v-for="proveedor in opcionesParaProgramar.proveedores" :key="proveedor" :value="proveedor">{{ proveedor }}</option>
  </optgroup>
</template>

<script setup lang="ts">
import { useTecnicosData } from '@/composables/useTecnicosData'

const { opcionesParaProgramar } = useTecnicosData()
</script>
