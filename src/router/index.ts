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
        }
      ]
    }
  ],
})

export default router
