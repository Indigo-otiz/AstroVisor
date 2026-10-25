<script setup>
import { useRecorridos } from '../composables/useRecorridos.js'
import ConstellationArt from '../components/ConstellationArt.vue'
import ContentState from '../components/ContentState.vue'
const { recorridos, cargando, error, cargar } = useRecorridos()
</script>

<template>
  <section aria-labelledby="explorar-title">
    <RouterLink class="public-back" to="/"
      ><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5m6-6-6 6 6 6" /></svg>Volver al
      inicio</RouterLink
    >
    <div class="public-page-intro">
      <h1 id="explorar-title" tabindex="-1">Constelaciones e historias del cielo</h1>
      <p>
        Las estrellas forman figuras. Las personas les damos historias.<br class="desktop-break" />
        Elige una constelación y descubre la suya.
      </p>
    </div>
    <ContentState
      v-if="cargando || error || !recorridos.length"
      :cargando="cargando"
      :error="error"
      @reintentar="cargar"
    />
    <div v-else class="constellation-grid">
      <article v-for="recorrido in recorridos" :key="recorrido.id" class="constellation-card">
        <div class="constellation-card-sky"><ConstellationArt :id="recorrido.id" /></div>
        <div class="constellation-card-copy">
          <h2>{{ recorrido.titulo }}</h2>
          <p>{{ recorrido.resumen }}</p>
          <RouterLink
            class="public-text-link"
            :to="`/explorar/${recorrido.id}`"
            :aria-label="`Leer la historia de ${recorrido.titulo}`"
            >Leer su historia
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg
          ></RouterLink>
        </div>
      </article>
    </div>
    <p class="public-demo">
      Estás explorando contenido de demostración. Las figuras son esquemas ilustrativos; el material
      autorizado de la biblioteca está pendiente.
    </p>
  </section>
</template>
