export const listRoutes = [
  {
    path: 'my-lists',
    name: 'my-lists',
    component: () => import('./views/MyListsView.vue'),
    meta: { title: 'My Lists', nav: 'my-lists' },
  },
]
