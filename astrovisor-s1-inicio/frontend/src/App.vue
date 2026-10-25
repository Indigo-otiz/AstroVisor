<script setup>
import { computed, nextTick, watch } from 'vue'
import { useRoute } from 'vue-router'
import './public.css'
const route = useRoute()
const esPublica = computed(() => ['inicio', 'explorar', 'constelacion'].includes(route.name))
watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    document.querySelector('#contenido h1')?.focus({ preventScroll: true })
    document.title = 'AstroVisor · Historias del cielo'
  },
)
</script>
<template>
  <div class="app-shell" :class="{ 'public-shell': esPublica }">
    <a class="skip-link" href="#contenido">Saltar al contenido</a>
    <header class="site-header">
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
    <main id="contenido" class="container main-content">
      <RouterView :key="route.path" />
    </main>
    <footer class="container site-footer">
      <p>Prototipo académico · Contenido de demostración · Material de la biblioteca pendiente.</p>
    </footer>
  </div>
</template>
