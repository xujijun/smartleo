import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory('/smartleo/'),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue')
    },
    {
      path: '/letters',
      name: 'letters',
      component: () => import('@/views/LettersView.vue')
    },
    {
      path: '/hanzi',
      name: 'hanzi',
      component: () => import('@/views/HanziView.vue')
    }
  ],
  scrollBehavior() {
    return { top: 0 };
  }
});

export default router;
