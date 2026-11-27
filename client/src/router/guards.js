import { ROLES } from '@/data/constants'
import { session, isLoggedIn, getHomeRoute } from '@/stores/session'

const APP_NAME = 'Shell Property'

// These checks only control navigation. The backend must check the same rules on every API call.
export function applyGuards(router) {
  router.beforeEach((to) => {
    if (to.meta.requiresAuth && !isLoggedIn.value) {
      // Remember where the user wanted to go, so login can send them back there.
      const query = to.fullPath === '/' ? {} : { redirect: to.fullPath }
      const loginPage = to.meta.role === ROLES.ADMIN ? 'admin-login' : 'login'
      return { name: loginPage, query }
    }

    if (to.meta.guestOnly && isLoggedIn.value) {
      return getHomeRoute(session.role)
    }

    if (to.meta.role && to.meta.role !== session.role) {
      return getHomeRoute(session.role)
    }

    return true
  })

  router.afterEach((to) => {
    document.title = to.meta.title ? `${to.meta.title} · ${APP_NAME}` : APP_NAME
  })
}
