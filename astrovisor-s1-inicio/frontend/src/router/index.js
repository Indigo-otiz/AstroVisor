import { createRouter, createWebHistory } from 'vue-router'
import InicioView from '../views/InicioView.vue'
import ExplorarView from '../views/ExplorarView.vue'
import ConstelacionView from '../views/ConstelacionView.vue'
import BibliotecaView from '../views/BibliotecaView.vue'
import VisorView from '../views/VisorView.vue'
import AdminAccesoView from '../views/AdminAccesoView.vue'
import AdminPanelView from '../views/AdminPanelView.vue'
import { useAuth } from '../composables/useAuth.js'

const routes = [
  { path: '/', component: InicioView, name: 'inicio' },
  { path: '/explorar', component: ExplorarView, name: 'explorar' },
  { path: '/explorar/:id', component: ConstelacionView, name: 'constelacion' },
  { path: '/explorar/:id/libros', component: BibliotecaView, name: 'biblioteca' },
  { path: '/explorar/:id/libros/:libroId', component: BibliotecaView, name: 'libro' },
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

router.beforeEach(async (to) => {
  if (to.meta.requiresAdmin) {
    const isAuthenticated = await useAuth().verificarSesion()
    if (!isAuthenticated) {
      return { name: 'admin-acceso' }
    }
  }
})

export default router
