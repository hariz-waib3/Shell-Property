export const billingRoutes = [
  {
    path: 'billing',
    name: 'billing',
    component: () => import('./views/BillingView.vue'),
    meta: { title: 'Plan & Billing', nav: 'billing' },
  },
]
