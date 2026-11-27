// Partner and admin sign in, forgot password and sign up. The sign-in pages share LoginShowcaseView.
export const authRoutes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/LoginShowcaseView.vue'),
    props: { portal: 'partner' },
    meta: { guestOnly: true, title: 'Partner sign in' },
  },
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('./views/LoginShowcaseView.vue'),
    props: { portal: 'admin' },
    meta: { guestOnly: true, title: 'Admin sign in' },
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: () => import('./views/LoginShowcaseView.vue'),
    props: { portal: 'partner', mode: 'forgot' },
    meta: { guestOnly: true, title: 'Reset password' },
  },
  {
    path: '/admin/forgot-password',
    name: 'admin-forgot-password',
    component: () => import('./views/LoginShowcaseView.vue'),
    props: { portal: 'admin', mode: 'forgot' },
    meta: { guestOnly: true, title: 'Reset password' },
  },
  {
    path: '/sign-up',
    name: 'sign-up',
    component: () => import('./views/SignUpView.vue'),
    meta: { guestOnly: true, title: 'Create partner account' },
  },
]
