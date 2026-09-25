<template>
  <div class="space-y-6 p-4 sm:p-6">
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div v-for="rol in ROLES" :key="rol" class="rounded-xl border border-slate-200 p-4" data-doc="tarjeta-rol">
        <div class="flex items-center justify-between gap-2">
          <span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold" :class="ESTILO_ROL[rol]">{{ rol }}</span>
          <span class="text-xs tabular-nums text-slate-500" data-doc="cuentas-por-rol">{{ activasPorRol[rol] }} {{ activasPorRol[rol] === 1 ? 'cuenta activa' : 'cuentas activas' }}</span>
        </div>
        <p class="mt-2 text-sm text-slate-600">{{ DESCRIPCION_ROL[rol] }}</p>
      </div>
    </div>

    <div class="overflow-auto rounded-xl border border-slate-200">
      <table class="w-full text-left text-sm" data-doc="matriz-permisos">
        <thead class="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 shadow-[0_1px_0_0] shadow-slate-200">
          <tr>
            <th class="px-4 py-3">Permiso</th>
            <th v-for="rol in ROLES" :key="rol" class="whitespace-nowrap px-4 py-3 text-center">{{ rol }}</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="grupo in GRUPOS_PERMISO" :key="grupo.titulo">
            <tr class="bg-slate-50/60">
              <th :colspan="ROLES.length + 1" class="px-4 py-2 text-xs font-semibold text-slate-500">{{ grupo.titulo }}</th>
            </tr>
            <tr v-for="permiso in grupo.permisos" :key="permiso" class="border-t border-slate-100" :data-doc="`permiso-${permiso}`">
              <td class="px-4 py-2.5 text-slate-700">{{ etiqueta(permiso) }}</td>
              <td v-for="rol in ROLES" :key="rol" class="px-4 py-2.5 text-center">
                <template v-if="rolTienePermiso(rol, permiso)">
                  <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" role="img" aria-label="Sí">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </template>
                <span v-else class="text-slate-300" role="img" aria-label="No">—</span>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <p class="text-xs text-slate-500">
      Consultar, imprimir y exportar están abiertos a todos los roles. El rol Técnico solo ve y concluye los mantenimientos asignados a él. Los roles son fijos: se asignan desde Cuentas de acceso (Técnico, al crear el acceso de un técnico).
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ACCION_DE_PERMISO, DESCRIPCION_ROL, GRUPOS_PERMISO, ROLES, rolTienePermiso, type Permiso, type Rol } from '@/config/permisos'
import { useCuentasData } from '@/composables/useCuentasData'

const { cuentas } = useCuentasData()

const ESTILO_ROL: Record<Rol, string> = {
  Administrador: 'bg-violet-50 text-violet-700',
  Capturista: 'bg-blue-50 text-blue-700',
  Técnico: 'bg-amber-50 text-amber-700',
  Consulta: 'bg-slate-100 text-slate-600',
}

const activasPorRol = computed<Record<Rol, number>>(() => {
  const cuenta: Record<Rol, number> = { Administrador: 0, Capturista: 0, Técnico: 0, Consulta: 0 }
  for (const item of cuentas.value) if (item.activo) cuenta[item.rol] += 1
  return cuenta
})

function etiqueta(permiso: Permiso): string {
  const accion = ACCION_DE_PERMISO[permiso]
  return accion.charAt(0).toUpperCase() + accion.slice(1)
}
</script>
