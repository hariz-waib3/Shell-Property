export const documentRoutes = [
  {
    path: 'documents',
    name: 'documents',
    component: () => import('./views/DocumentsView.vue'),
    meta: { title: 'Documents', nav: 'documents' },
  },
]
