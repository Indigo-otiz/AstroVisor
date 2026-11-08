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
          <section class="invitacion-lectura" aria-labelledby="invitacion-lectura-titulo">
            <p class="invitacion-lectura-etiqueta">Tu viaje por las estrellas continúa en los libros</p>
            <h2 id="invitacion-lectura-titulo">¿Te gustaría conocer más sobre {{ constelacion.titulo }}?</h2>
            <p>Descubre tres lecturas recomendadas y explora una estantería digital creada para disfrutar con calma.</p>
            <RouterLink class="public-button" :to="{ name: 'biblioteca', params: { id: constelacion.id } }">
              Ver libros recomendados sobre {{ constelacion.titulo }}
            </RouterLink>
            <p class="invitacion-nota">Las portadas y los datos de catálogo son de demostración; los ejemplares físicos no se han confirmado.</p>
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

<style scoped>
.invitacion-lectura { padding: 1.4rem; background: #fff6df; border: 2px solid #d0a348; border-radius: 18px; }
.invitacion-lectura .invitacion-lectura-etiqueta { color: #775000; font-weight: 700; font-size: .93rem; margin-bottom: .6rem; }
.invitacion-lectura h2 { font-family: Georgia, 'Times New Roman', serif; margin-bottom: .7rem; }
.invitacion-lectura p { margin-bottom: 1rem; }
.invitacion-lectura .public-button { width: 100%; min-height: 58px; text-align: center; }
.invitacion-lectura .invitacion-nota { font-size: .86rem; color: #4d515d; margin-top: .9rem; margin-bottom: 0; }
</style>
