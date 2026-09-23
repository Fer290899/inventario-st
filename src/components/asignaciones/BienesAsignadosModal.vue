<template>
  <BaseModal v-model:open="open" :title="titulo" :subtitle="`${persona} · ${bienes.length} ${bienes.length === 1 ? 'bien' : 'bienes'}`" size="md">
    <template #icon>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    </template>

    <!-- Tabla informativa con alto máximo y scroll -->
    <div class="max-h-[420px] overflow-auto rounded-xl border border-slate-200">
      <table class="w-full text-left text-sm">
        <thead class="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
          <tr>
            <th class="whitespace-nowrap px-4 py-3">Nombre</th>
            <th class="whitespace-nowrap px-4 py-3">Modelo</th>
            <th class="whitespace-nowrap px-4 py-3">Marca</th>
            <th class="whitespace-nowrap px-4 py-3">Número de serie</th>
            <th class="whitespace-nowrap px-4 py-3">Número de inventario</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="bien in bienes" :key="bien.id">
            <td class="whitespace-nowrap px-4 py-2.5 font-medium text-slate-800">{{ bien.nombre }}</td>
            <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ bien.modelo }}</td>
            <td class="whitespace-nowrap px-4 py-2.5 text-slate-600">{{ bien.marca }}</td>
            <td class="whitespace-nowrap px-4 py-2.5 font-mono text-xs tabular-nums text-slate-600">{{ bien.numeroSerie }}</td>
            <td class="whitespace-nowrap px-4 py-2.5 font-mono text-xs tabular-nums text-slate-600">{{ bien.numeroInventario }}</td>
          </tr>

          <tr v-if="bienes.length === 0">
            <td colspan="5">
              <EmptyState mensaje="No hay bienes registrados en este movimiento." />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <AppButton variant="secondary" @click="open = false">Cerrar</AppButton>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import type { BienSnapshot } from '@/composables/useBienesData'
import AppButton from '@/components/ui/AppButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import EmptyState from '@/components/ui/EmptyState.vue'

withDefaults(
  defineProps<{
    persona: string
    bienes: BienSnapshot[]
    titulo?: string
  }>(),
  { titulo: 'Bienes asignados' },
)

const open = defineModel<boolean>('open', { required: true })
</script>
