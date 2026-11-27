export const dealRoutes = [
  {
    path: 'my-deals',
    name: 'my-deals',
    component: () => import('./views/MyDealsView.vue'),
    meta: { title: 'My Deals', nav: 'my-deals' },
  },
]
