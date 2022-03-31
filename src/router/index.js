import { createRouter, createWebHashHistory } from 'vue-router';
const main = () => import('../views/Main.vue');
const details = () => import('../views/Details.vue');


const routes = [
    { path: '/', redirect: '/main' },
    {
        path: '/main',
        name: 'main',
        component: main,
    },
    {
        path: '/details',
        name: 'details',
        component: details,
    },
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes: routes,
});
