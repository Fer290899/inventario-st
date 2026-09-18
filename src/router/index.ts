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
          path: 'bienes/asignacion',
          name: 'AsignarBienes',
          component: () => import('../pages/AsignarBienes.vue')
        },
        {
          path: 'bienes/hojas',
          name: 'HojasBienes',
          component: () => import('../pages/HojasBienes.vue')
        },
      ]
    }
  ],
})

export default router
