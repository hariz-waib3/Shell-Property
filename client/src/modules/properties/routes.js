export const propertyRoutes = [
  {
    path: 'properties',
    name: 'properties',
    component: () => import('./views/PropertyListView.vue'),
    meta: { title: 'Properties', nav: 'properties' },
  },
  {
    path: 'properties/:id(\\d+)',
    name: 'property-detail',
    component: () => import('./views/PropertyDetailView.vue'),
    props: (route) => ({ id: Number(route.params.id) }),
    meta: { title: 'Property details', nav: 'properties' },
  },
]
