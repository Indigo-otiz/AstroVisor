import { createRouter, createWebHistory } from 'vue-router'
import InicioView from '../views/InicioView.vue'
import ExplorarView from '../views/ExplorarView.vue'
import ConstelacionView from '../views/ConstelacionView.vue'
import VisorView from '../views/VisorView.vue'
import AdminAccesoView from '../views/AdminAccesoView.vue'
import AdminPanelView from '../views/AdminPanelView.vue'

function checkAdminAuth() {
  try {
    const session = localStorage.getItem('astrovisor_admin_session')
    return Boolean(session && JSON.parse(session)?.id)
  } catch {
    return false
  }
}

const routes = [
  { path: '/', component: InicioView, name: 'inicio' },
  { path: '/explorar', component: ExplorarView, name: 'explorar' },
  { path: '/explorar/:id', component: ConstelacionView, name: 'constelacion' },
  { path: '/visor', component: VisorView, name: 'visor' },
  { path: '/admin/acceso', component: AdminAccesoView, name: 'admin-acceso' },
  { path: '/admin', component: AdminPanelView, name: 'admin', meta: { requiresAdmin: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
})

router.beforeEach((to) => {
  if (to.meta.requiresAdmin) {
    const isAuthenticated = checkAdminAuth()
    if (!isAuthenticated) {
      return { name: 'admin-acceso' }
    }
  }
})

export default router
