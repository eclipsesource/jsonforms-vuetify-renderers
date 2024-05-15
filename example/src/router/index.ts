import { createRouter, createWebHashHistory } from 'vue-router';
export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/default/index.vue'),
      children: [
        {
          path: '',
          name: 'Default',
          component: () => import('../views/home'),
        },
        {
          path: 'example/:id',
          name: 'example',
          component: () => import('../views/example'),
        },
      ],
    },
  ],
});
