import { createRouter, createWebHistory } from 'vue-router'
import InicioView from '../views/InicioView.vue'
import ExplorarView from '../views/ExplorarView.vue'
import VisorView from '../views/VisorView.vue'
import AdminAccesoView from '../views/AdminAccesoView.vue'
import AdminPanelView from '../views/AdminPanelView.vue'

// Sprint 1: no hay autenticación implementada. NUNCA usar esta función
// como una supuesta garantía de seguridad. La autorización real va en Express.
function isAdminAuthenticated() {
  return false
}

const routes = [
  { path: '/', component: InicioView, name: 'inicio' },
  { path: '/explorar', component: ExplorarView, name: 'explorar' },
  { path: '/visor', component: VisorView, name: 'visor' },
  { path: '/admin/acceso', component: AdminAccesoView, name: 'admin-acceso' },
  { path: '/admin', component: AdminPanelView, name: 'admin', meta: { requiresAdmin: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach((to) => {
  if (to.meta.requiresAdmin && !isAdminAuthenticated()) {
    return { name: 'admin-acceso' }
  }
})

export default router
