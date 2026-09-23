import { createRouter, createWebHistory } from 'vue-router'

import EmptyLayout from '@/layout/EmptyLayout.vue'
import MainLayout from '@/layout/MainLayout.vue'


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
          component: () => import('../pages/AgregarTipoBien.vue')
        },
        {
          path: 'mantenimiento',
          name: 'Mantenimiento',
          component: () => import('../pages/Mantenimiento.vue')
        },
        {
          path: 'administracion',
          name: 'Administracion',
          component: () => import('../pages/Administracion.vue')
        }
      ]
    }
  ],
})

export default router
