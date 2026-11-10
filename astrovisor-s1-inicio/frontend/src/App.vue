<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import './public.css'
const route = useRoute()
const esPublica = computed(() => ['inicio', 'explorar', 'constelacion', 'biblioteca', 'libro', 'visor'].includes(route.name))
const esAdmin = computed(() => ['admin', 'admin-acceso'].includes(route.name))
const presentacion = ref(false)
const titulos = {
  inicio: 'Inicio',
  explorar: 'Constelaciones e historias del cielo',
  biblioteca: 'La biblioteca de las estrellas',
  libro: 'Información de libro',
  visor: 'Modo Homido',
  'admin-acceso': 'Acceso administrativo',
  admin: 'Panel de administración',
}
watch(
  () => route.fullPath,
  async () => {
    // La ficha resuelve su propio título al terminar la consulta documental.
    if (route.name !== 'constelacion' && route.name !== 'biblioteca' && route.name !== 'libro') {
      document.title = `${titulos[route.name] ?? 'Historias del cielo'} · AstroVisor`
    }
    await nextTick()
    document.querySelector('#contenido h1')?.focus({ preventScroll: true })
  },
  { immediate: true },
)
</script>
<template>
  <div class="app-shell" :class="{ 'public-shell': esPublica, 'admin-shell': esAdmin, 'presentation-shell': esPublica && presentacion }">
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

    <div v-if="esPublica" class="container presentation-tools">
      <p id="presentation-help">Texto más grande para compartir las historias en una pantalla.</p>
      <button
        class="presentation-toggle"
        type="button"
        aria-describedby="presentation-help"
        :aria-pressed="presentacion"
        @click="presentacion = !presentacion"
      >Vista para proyección <span aria-hidden="true">{{ presentacion ? 'Activada' : 'Desactivada' }}</span></button>
    </div>

    <!-- Contenido principal -->
    <main id="contenido" tabindex="-1" :class="esAdmin ? 'admin-main' : 'container main-content'">
      <RouterView :key="route.path" />
    </main>

    <!-- Footer general: solo en vistas públicas -->
    <footer v-if="!esAdmin" class="container site-footer institutional-footer">
      <ul class="institutional-footer-logos" aria-label="Instituciones">
        <li><img class="institutional-logo-library" src="/institucional/biblioteca-solon-arguello.png" width="1000" height="430" alt="Biblioteca Pública Central Estatal Solón Argüello" /></li>
        <li><img class="institutional-logo-tecnm" src="/Logo%20TecNMs.png" width="961" height="428" alt="Tecnológico Nacional de México" /></li>
        <li><img class="institutional-logo-tepic" src="/ITTepic_logo.jpg" width="225" height="225" alt="Instituto Tecnológico de Tepic" /></li>
      </ul>
      <p>Prototipo académico · Contenido de demostración.</p>
    </footer>
  </div>
</template>
