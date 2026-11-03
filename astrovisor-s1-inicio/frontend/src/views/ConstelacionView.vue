<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRecorridos } from '../composables/useRecorridos.js'
import ConstellationArt from '../components/ConstellationArt.vue'
import ContentState from '../components/ContentState.vue'
import NarracionAudio from '../components/NarracionAudio.vue'
const route = useRoute()
const { recorridos, cargando, error, cargar } = useRecorridos()
const constelacion = computed(() => recorridos.value.find((x) => x.id === route.params.id))
const tituloEstado = computed(() => {
  if (cargando.value) return 'Cargando constelación…'
  if (error.value) return 'No pudimos cargar la constelación'
  return 'Constelación no encontrada'
})
const tituloPagina = computed(() =>
  !cargando.value && !error.value && constelacion.value
    ? constelacion.value.titulo
    : tituloEstado.value,
)
watch(tituloPagina, (titulo) => { document.title = `${titulo} · AstroVisor` }, { immediate: true })
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
          <NarracionAudio :key="constelacion.id" :constelacion="constelacion" />
          <section v-if="constelacion.libros && constelacion.libros.length > 0" aria-labelledby="libro-referencia" class="constelacion-libros">
            <h2 id="libro-referencia">Referencia bibliográfica</h2>
            <article v-for="(libro, idx) in constelacion.libros" :key="idx" class="libro-ficha">
              <p v-if="libro.etiqueta" class="libro-etiqueta">{{ libro.etiqueta }}</p>
              <h3 class="libro-titulo">{{ libro.titulo }}</h3>
              <p class="libro-autor">Por: <strong>{{ libro.autor }}</strong><span v-if="libro.anio"> ({{ libro.anio }})</span></p>
              <p v-if="libro.aclaracion" class="libro-aclaracion">{{ libro.aclaracion }}</p>
              <p v-if="libro.url" class="libro-enlace-contenedor">
                <a :href="libro.url" target="_blank" rel="noopener noreferrer" class="libro-enlace">
                  <span>Consultar libro en línea (acceso público)</span>
                  <svg viewBox="0 0 24 24" aria-hidden="true" class="libro-enlace-icono"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6m4-3h6v6m-11 5L21 3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
                </a>
              </p>
            </article>
          </section>
          <RouterLink class="public-button" to="/explorar"
            >Explorar otra constelación
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg
          ></RouterLink>
        </div>
      </div>
    </template>
    <template v-else
      ><h1 class="state-title" tabindex="-1">{{ tituloEstado }}</h1>
      <ContentState :cargando="cargando" :error="error" detalle @reintentar="cargar"
    /></template>
    <p class="public-demo">
      Relato adaptado de muestra. Contenido provisional hasta recibir material autorizado de la
      biblioteca.
    </p>
  </section>
</template>
