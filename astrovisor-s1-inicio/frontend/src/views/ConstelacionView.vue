<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useRecorridos } from '../composables/useRecorridos.js'
import ConstellationArt from '../components/ConstellationArt.vue'
import ContentState from '../components/ContentState.vue'
const route = useRoute()
const { recorridos, cargando, error, cargar } = useRecorridos()
const constelacion = computed(() => recorridos.value.find((x) => x.id === route.params.id))
</script>
<template>
  <section>
    <RouterLink class="public-back" to="/explorar"
      ><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5m6-6-6 6 6 6" /></svg>Volver a
      las constelaciones</RouterLink
    >
    <template v-if="constelacion && !cargando && !error">
      <div class="detail-heading">
        <h1 tabindex="-1">{{ constelacion.titulo }}</h1>
        <p>{{ constelacion.resumen }}</p>
      </div>
      <div class="constellation-detail">
        <figure class="detail-sky">
          <ConstellationArt :id="constelacion.id" />
          <figcaption>
            Una forma de imaginar {{ constelacion.titulo }}.<br />Esquema ilustrativo, sin escala.
          </figcaption>
        </figure>
        <div class="detail-reading">
          <section aria-labelledby="historia">
            <h2 id="historia">Una historia entre las estrellas</h2>
            <p>{{ constelacion.historia }}</p>
          </section>
          <section aria-labelledby="reconocer">
            <h2 id="reconocer">Reconoce su figura</h2>
            <p>{{ constelacion.comoReconocerla }}</p>
          </section>
          <RouterLink class="public-button" to="/explorar"
            >Explorar otra constelación
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg
          ></RouterLink>
        </div>
      </div>
    </template>
    <template v-else
      ><h1 class="state-title" tabindex="-1">Historia de una constelación</h1>
      <ContentState :cargando="cargando" :error="error" detalle @reintentar="cargar"
    /></template>
    <p class="public-demo">
      Relato adaptado de muestra. Contenido provisional hasta recibir material autorizado de la
      biblioteca.
    </p>
  </section>
</template>
