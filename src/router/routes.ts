import type { RouteRecordRaw } from 'vue-router';
import 'src/types/router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('src/layouts/WorkspaceLayout.vue'),
    meta: { private: true },
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('src/pages/BoardPage.vue'),
        meta: { heading: 'Чек-лист', crumb: 'Список' },
      },
      {
        path: 'options',
        name: 'options',
        component: () => import('src/pages/ProfilePage.vue'),
        meta: { heading: 'Параметры', crumb: 'Параметры' },
      },
    ],
  },
  {
    path: '/auth',
    component: () => import('src/layouts/GuestLayout.vue'),
    meta: { publicOnly: true },
    children: [
      {
        path: '',
        name: 'auth',
        component: () => import('src/pages/SignInPage.vue'),
        meta: { heading: 'Авторизация', crumb: 'Авторизация' },
      },
    ],
  },
  {
    path: '/lost',
    name: 'lost',
    component: () => import('src/pages/MissingPage.vue'),
    meta: { heading: 'Не найдено', crumb: '404' },
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/lost',
  },
];

export default routes;
