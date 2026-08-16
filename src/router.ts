import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import BlogView from './views/BlogView.vue';
import PersonalView from './views/PersonalView.vue';
import MessagesView from './views/MessagesView.vue';
import AdminView from './views/AdminView.vue';

// 用 hash 路由，GitHub Pages 无需服务端重写规则
export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/blog', name: 'blog', component: BlogView },
    { path: '/personal', name: 'personal', component: PersonalView },
    { path: '/messages', name: 'messages', component: MessagesView },
    { path: '/admin', name: 'admin', component: AdminView },
  ],
});
