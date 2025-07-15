import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from './MainLayout.vue'
import MainLayoutUser from './MainLayoutUser.vue'
import ManagementAdmin from './Pages/Admin/ManagementAdmin.vue'
import MainAdmin from './Pages/Admin/MainAdmin.vue'
import App from './App.vue'
import PageShop from './components/PageShop.vue'
import ProfileUser from './Pages/User/ProfileUser.vue'
import ProfileAdmin from './Pages/Admin/ProfileAdmin.vue'
import Main from './Pages/User/Main.vue'

const routes = [
  // Customer layout
  {
    path: '/',
    component: MainLayoutUser,
    children: [
      {
        path: '',
        component: Main // Main.vue (User) เป็นหน้าหลัก
      },
      {
        path: 'shop/:categoryId',
        name: 'PageShop',
        component: PageShop
      },
      {
        path: 'profile',
        component: ProfileUser
      }
    ]
  },
  // Admin layout
  {
    path: '/admin',
    component: MainLayout,
    children: [
      {
        path: '',
        component: MainAdmin
      },
      {
        path: 'management',
        component: ManagementAdmin
      },
      {
        path: 'profile',
        component: ProfileAdmin
      },
      {
        path: 'shop/:categoryId',
        name: 'AdminPageShop',
        component: PageShop
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App).use(router).mount('#app')
