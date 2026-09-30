import { createRouter, createWebHistory } from 'vue-router'

import EmptyLayout from '@/layout/EmptyLayout.vue'
import MainLayout from '@/layout/MainLayout.vue'
import { motivoSinPermiso, type Permiso } from '@/config/permisos'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: EmptyLayout,
      redirect: '/login',
      children: [
        {
          path: 'login',
          name: 'Login',
          component: () => import('../pages/Login.vue')
        }
      ]
    },
    {
      path: '/dashboard',
      component: MainLayout,
      redirect: '/dashboard/home',
      meta: { requiereSesion: true },
      children: [
        {
          path: 'home',
          name: 'Home',
          component: () => import('../pages/Dashboard.vue')
        },
        {
          path: 'bienes',
          name: 'Bienes',
          component: () => import('../pages/Bienes.vue')
        },
        {
          path: 'bienes/hojas',
          name: 'HojasBienes',
          component: () => import('../pages/HojasBienes.vue')
        },
        {
          path: 'bienes/tipos-bien',
          name: 'TiposBien',
          component: () => import('../pages/AgregarTipoBien.vue'),
          meta: { permiso: 'tipos:gestionar' satisfies Permiso }
        },
        {
          path: 'bienes/:id',
          name: 'DetalleBien',
          component: () => import('../pages/DetalleBien.vue'),
          meta: { title: 'Detalle del bien' }
        },
        {
          path: 'mantenimiento',
          name: 'Mantenimiento',
          component: () => import('../pages/Mantenimiento.vue')
        },
        {
          path: 'administracion',
          name: 'Administracion',
          component: () => import('../pages/Administracion.vue'),
          meta: { permiso: 'admin:gestionar' satisfies Permiso }
        }
      ]
    },
    {
      // Cualquier ruta que no exista, esté o no dentro de una sesión: sin esto, una URL inválida
      // se queda en blanco (ningún registro coincide y el router no renderiza nada).
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../pages/NotFound.vue')
    }
  ],
})

// La autorización real vivirá en el servidor; este guard solo ordena la experiencia de uso.
router.beforeEach((to) => {
  const { estaAutenticado, can, rol, refrescarSesion } = useAuth()

  if (!refrescarSesion()) {
    useToast().error('Tu cuenta ya no tiene acceso al sistema.')
    return { name: 'Login' }
  }

  if (to.matched.some((registro) => registro.meta.requiereSesion) && !estaAutenticado.value) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.name === 'Login' && estaAutenticado.value) {
    return { path: '/dashboard/home' }
  }

  const permiso = to.matched.map((registro) => registro.meta.permiso as Permiso | undefined).find(Boolean)
  if (permiso && !can(permiso)) {
    useToast().error(motivoSinPermiso(permiso, rol.value))
    return { path: '/dashboard/home' }
  }
})

export default router
