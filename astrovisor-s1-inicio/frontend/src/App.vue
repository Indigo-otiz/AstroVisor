<script setup>
import { computed, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import './public.css'
const route = useRoute()
const esPublica = computed(() => ['inicio', 'explorar', 'constelacion'].includes(route.name))
const esAdmin = computed(() => ['admin', 'admin-acceso'].includes(route.name))
const titulos = {
  inicio: 'Inicio',
  explorar: 'Constelaciones e historias del cielo',
  visor: 'Modo Homido',
  'admin-acceso': 'Acceso administrativo',
  admin: 'Panel de administración',
}
watch(
  () => route.fullPath,
  async () => {
    // La ficha resuelve su propio título al terminar la consulta documental.
    if (route.name !== 'constelacion') {
      document.title = `${titulos[route.name] ?? 'Historias del cielo'} · AstroVisor`
    }
    await nextTick()
    document.querySelector('#contenido h1')?.focus({ preventScroll: true })
  },
  { immediate: true },
)
</script>
<template>
  <div class="app-shell" :class="{ 'public-shell': esPublica, 'admin-shell': esAdmin }">
    <a class="skip-link" href="#contenido">Saltar al contenido</a>

    <!-- Header general: solo se muestra en vistas públicas, no en administración -->
    <header v-if="!esAdmin" class="site-header">
      <div class="container header-content">
        <RouterLink class="brand" to="/"
          ><svg v-if="esPublica" class="brand-star" viewBox="0 0 32 32" aria-hidden="true">
            <path d="m16 2 4 10 10 4-10 4-4 10-4-10-10-4 10-4Z" fill="currentColor" /></svg
          >AstroVisor</RouterLink
        >
        <nav aria-label="Navegación principal" class="nav-links">
          <RouterLink to="/" exact-active-class="nav-current">Inicio</RouterLink>
          <RouterLink to="/explorar" :class="{ 'nav-current': route.name === 'constelacion' }"
            >Explorar</RouterLink
          >
          <RouterLink to="/visor">Homido</RouterLink>
          <RouterLink to="/admin/acceso">Administración</RouterLink>
        </nav>
      </div>
    </header>

    <!-- Contenido principal -->
    <main id="contenido" :class="esAdmin ? 'admin-main' : 'container main-content'">
      <RouterView :key="route.path" />
    </main>

    <!-- Footer general: solo en vistas públicas -->
    <footer v-if="!esAdmin" class="container site-footer">
      <p>Prototipo académico · Contenido de demostración · Material de la biblioteca pendiente.</p>
    </footer>
  </div>
</template>
