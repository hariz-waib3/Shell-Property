export const sourcingRoutes = [
  {
    path: 'sourcing-request',
    name: 'sourcing-request',
    component: () => import('./views/SourcingRequestView.vue'),
    meta: { title: 'General Enquiry', nav: 'sourcing-request' },
  },
]
