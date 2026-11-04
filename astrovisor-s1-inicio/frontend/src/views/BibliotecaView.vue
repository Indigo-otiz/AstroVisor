<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useRecorridos } from '../composables/useRecorridos.js'
import ContentState from '../components/ContentState.vue'
import BookCover from '../components/BookCover.vue'
import { librosDeEstanteria, datosLocalizacion } from '../services/biblioteca.js'
import '../biblioteca.css'

const route = useRoute()
const { recorridos, cargando, error, cargar } = useRecorridos()
const constelacion = computed(() => recorridos.value.find((r) => r.id === route.params.id))
const libros = computed(() => librosDeEstanteria(recorridos.value, route.params.id))
const libroSeleccionado = ref('')
watch(() => route.params.id, () => { libroSeleccionado.value = '' })
const libroActual = computed(() => libros.value.find((l) => l.id === libroSeleccionado.value) || libros.value[0] || null)
const localizacion = computed(() => datosLocalizacion(libroActual.value))
const volverA = computed(() => constelacion.value ? `/explorar/${constelacion.value.id}` : '/explorar')

async function elegirLibro(id) {
  libroSeleccionado.value = id
  await nextTick()
  document.getElementById('biblioteca-detalle')?.focus({ preventScroll: false })
}
</script>

<template>
  <section class="biblioteca-pagina">
    <RouterLink class="public-back" :to="volverA">← Volver a {{ constelacion ? constelacion.titulo : 'las constelaciones' }}</RouterLink>
    <header class="biblioteca-intro">
      <p class="biblioteca-sobretitulo">DEL CIELO A LOS LIBROS</p>
      <h1 tabindex="-1">La biblioteca de las estrellas</h1>
      <p v-if="constelacion">¿Te gustaría seguir descubriendo {{ constelacion.titulo }}? Comienza por la lectura destacada y explora otros libros sobre el cielo.</p>
      <p v-else>Descubre historias del cielo a través de una pequeña selección de libros.</p>
    </header>
    <div class="biblioteca-aviso" role="note">
      <strong>Material de demostración.</strong> Son libros reales de acceso público en Internet, pero no se ha confirmado que la biblioteca tenga ejemplares físicos. Las cubiertas son ilustraciones, no fotografías de las ediciones originales.
    </div>
    <ContentState v-if="cargando || error" :cargando="cargando" :error="error" @reintentar="cargar" />
    <div v-else-if="!libros.length" class="biblioteca-vacio" role="status">
      <h2>Aún no hay libros recomendados</h2>
      <p>Regresa a las constelaciones para continuar explorando sus historias.</p>
    </div>
    <template v-else>
      <section class="biblioteca-estanteria" aria-labelledby="estanteria-titulo">
        <h2 id="estanteria-titulo">Elige un libro de la estantería</h2>
        <p>Selecciona una portada para conocer la lectura y cómo consultarla.</p>
        <div class="biblioteca-repisa">
          <article v-for="libro in libros" :key="libro.id" class="biblioteca-ejemplar">
            <button type="button" class="biblioteca-seleccionar"
              :aria-pressed="libroActual?.id === libro.id" @click="elegirLibro(libro.id)">
              <span v-if="constelacion && libro.constelacionId === constelacion.id" class="biblioteca-recomendado">Recomendado para {{ constelacion.titulo }}</span>
              <BookCover :libro="libro" />
              <span class="biblioteca-titulo-tarjeta">{{ libro.titulo }}</span>
              <span class="biblioteca-autor-tarjeta">{{ libro.autor }}</span>
              <span class="biblioteca-boton-texto">Ver información del libro</span>
            </button>
          </article>
        </div>
      </section>

      <article v-if="libroActual" id="biblioteca-detalle" tabindex="-1" class="biblioteca-detalle" aria-labelledby="detalle-titulo">
        <p class="biblioteca-sobretitulo">ACERCA DE ESTA LECTURA</p>
        <h2 id="detalle-titulo">{{ libroActual.titulo }}</h2>
        <p class="biblioteca-autor-detalle">Por {{ libroActual.autor }}<span v-if="libroActual.anio"> · {{ libroActual.anio }}</span></p>
        <p>Una lectura relacionada con {{ libroActual.constelacionTitulo }} y las historias del cielo.</p>
        <section class="biblioteca-localizar" aria-labelledby="biblioteca-localizar-titulo">
          <h3 id="biblioteca-localizar-titulo">¿Dónde puedo encontrarlo?</h3>
          <template v-if="localizacion.confirmado">
            <p><strong>Ubicación:</strong> {{ localizacion.ubicacion || 'No indicada' }}</p>
            <p><strong>Signatura:</strong> {{ localizacion.signatura || 'No indicada' }}</p>
            <p><strong>Número de control MARC 21 (001/003):</strong> {{ localizacion.numeroControl || 'No indicado' }}</p>
          </template>
          <template v-else>
            <p><strong>En la biblioteca:</strong> ubicación y existencia sin confirmar.</p>
            <p><strong>Signatura e identificador MARC 21:</strong> todavía no proporcionados.</p>
            <p>Puedes mostrar este título y el nombre del autor al personal para preguntar si disponen de un ejemplar.</p>
          </template>
        </section>
        <p v-if="libroActual.aclaracion" class="biblioteca-aclaracion">{{ libroActual.aclaracion }}</p>
        <p v-if="libroActual.licencia" class="biblioteca-derechos">Referencia: {{ libroActual.licencia }}</p>
        <a v-if="libroActual.url" class="public-button biblioteca-consultar" :href="libroActual.url" target="_blank" rel="noopener noreferrer">Consultar la obra en línea (abre otra pestaña)</a>
        <p><RouterLink class="public-text-link" :to="volverA">Volver a la constelación</RouterLink></p>
      </article>
    </template>
  </section>
</template>
