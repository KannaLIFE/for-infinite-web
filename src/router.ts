import { createRouter, createWebHashHistory } from 'vue-router';
import HomeView from './views/HomeView.vue';
import BlogView from './views/BlogView.vue';
import PersonalView from './views/PersonalView.vue';
import MessagesView from './views/MessagesView.vue';
import AdminView from './views/AdminView.vue';
import FriendsView from './views/FriendsView.vue';
import ProjectsView from './views/ProjectsView.vue';
import GalleryView from './views/GalleryView.vue';
import TechView from './views/TechView.vue';
import AchievementsView from './views/AchievementsView.vue';
import TestimonialsView from './views/TestimonialsView.vue';
import CertificatesView from './views/CertificatesView.vue';
import AffiliationsView from './views/AffiliationsView.vue';
import ServicesView from './views/ServicesView.vue';

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/blog', name: 'blog', component: BlogView },
    { path: '/personal', name: 'personal', component: PersonalView },
    { path: '/messages', name: 'messages', component: MessagesView },
    { path: '/admin', name: 'admin', component: AdminView },
    { path: '/friends', name: 'friends', component: FriendsView },
    { path: '/projects', name: 'projects', component: ProjectsView },
    { path: '/gallery', name: 'gallery', component: GalleryView },
    { path: '/tech', name: 'tech', component: TechView },
    { path: '/achievements', name: 'achievements', component: AchievementsView },
    { path: '/testimonials', name: 'testimonials', component: TestimonialsView },
    { path: '/certificates', name: 'certificates', component: CertificatesView },
    { path: '/affiliations', name: 'affiliations', component: AffiliationsView },
    { path: '/services', name: 'services', component: ServicesView },
  ],
});
