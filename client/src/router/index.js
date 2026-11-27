import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '@/layouts/AppLayout.vue'
import { authRoutes } from '@/modules/auth/routes'
import { propertyRoutes } from '@/modules/properties/routes'
import { listRoutes } from '@/modules/lists/routes'
import { dealRoutes } from '@/modules/deals/routes'
import { documentRoutes } from '@/modules/documents/routes'
import { sourcingRoutes } from '@/modules/sourcing/routes'
import { billingRoutes } from '@/modules/billing/routes'
import { adminRoutes } from '@/modules/admin/routes'
import { settingsRoutes } from '@/modules/settings/routes'
import { ROLES } from '@/data/constants'
import { session, getHomeRoute } from '@/stores/session'
import { applyGuards } from './guards'

const partnerRoutes = [
  ...propertyRoutes,
  ...listRoutes,
  ...dealRoutes,
  ...documentRoutes,
  ...sourcingRoutes,
  ...billingRoutes,
]

const routes = [
  ...authRoutes,

  // Every page inside the app shares AppLayout (header + nav) and needs a signed-in user.
  {
    path: '/',
    component: AppLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'home', redirect: () => getHomeRoute(session.role) },

      // Pages for both roles: /settings
      ...settingsRoutes,

      // Partner pages: /properties, /my-lists, ...
      { path: '', meta: { role: ROLES.PARTNER }, children: partnerRoutes },

      // Admin pages: /admin, /admin/properties, ...
      { path: 'admin', meta: { role: ROLES.ADMIN }, children: adminRoutes },
    ],
  },

  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'Page not found' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

applyGuards(router)

export default router
