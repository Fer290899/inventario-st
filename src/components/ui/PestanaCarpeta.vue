<template>
  <section :aria-labelledby="id">
    <div class="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <component
        :is="`h${nivel}`"
        :id="id"
        class="m-0 rounded-t-lg bg-manila-200 px-5 pb-[9px] pt-2.5 text-[15px] font-semibold text-slate-900"
      >
        {{ titulo }}
      </component>
      <div v-if="$slots.acciones" class="pb-1">
        <slot name="acciones" />
      </div>
    </div>
    <div class="rounded-b rounded-tr border border-t-2 border-slate-200 border-t-manila-200 bg-white">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    titulo: string
    /** Id del encabezado; el panel lo referencia con aria-labelledby. */
    id: string
    /** Nivel del encabezado (h2 por defecto). */
    nivel?: 2 | 3
  }>(),
  { nivel: 2 },
)
</script>
