<script setup>
import { computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { nombresConstelacion } from '../services/librosDemoService.js'
import { useLibros } from '../composables/useLibros.js'

const route = useRoute()
const id = computed(() => String(route.params.id ?? ''))
const nombre = computed(() => nombresConstelacion[id.value] ?? null)
const { libros, cargando, error, aviso, cargar, cancelar } = useLibros()
const mostrandoDetalle = computed(() => Boolean(route.params.libroId))
const libro = computed(() => mostrandoDetalle.value ? libros.value.find((l) => l.id === String(route.params.libroId)) : null)
const titulo = computed(() => cargando.value ? 'Cargando libros' : error.value ? 'No pudimos consultar los libros' : libro.value?.titulo ?? (nombre.value ? `Libros sobre ${nombre.value}` : 'Biblioteca de las estrellas'))
watch(() => [route.params.id, route.params.libroId], () => cargar(id.value), { immediate: true })
watch([titulo, cargando], async ([valor]) => {
  document.title = `${valor} · AstroVisor`
  await nextTick()
  if (!cargando.value && document.activeElement === document.body) document.querySelector('#contenido h1')?.focus({ preventScroll: true })
}, { immediate: true })
onBeforeUnmount(cancelar)

const rutaConstelacion = computed(() => ({ name: 'constelacion', params: { id: id.value } }))
const rutaEstanteria = computed(() => ({ name: 'biblioteca', params: { id: id.value } }))
</script>

<template>
  <section class="biblioteca-page">
    <p v-if="aviso" class="biblioteca-aviso" role="status">{{ aviso }}</p>
    <RouterLink class="public-back" :to="nombre ? rutaConstelacion : { name: 'explorar' }">
      ← Volver {{ nombre ? `a ${nombre}` : 'a las constelaciones' }}
    </RouterLink>

    <div v-if="cargando" class="public-state" role="status" aria-live="polite">
      <h1 tabindex="-1">Cargando libros…</h1>
      <p>Estamos consultando las recomendaciones de lectura.</p>
    </div>
    <div v-else-if="error" class="public-state" role="alert">
      <h1 tabindex="-1">No pudimos consultar los libros</h1>
      <p>{{ error }}</p>
      <button class="public-button" type="button" @click="cargar(id)">Volver a intentar</button>
    </div>
    <template v-else-if="nombre && !mostrandoDetalle">
      <div class="biblioteca-intro">
        <p class="biblioteca-eyebrow">Una historia lleva a otra</p>
        <h1 tabindex="-1">La biblioteca de las estrellas</h1>
        <p>¿Te gustaría conocer más sobre {{ nombre }}? Elige un libro y descubre por qué podría interesarte.</p>
      </div>
      <p class="biblioteca-aviso" role="note">
        <strong>Libros de demostración.</strong> Son referencias de lectura pública. No hemos confirmado que la biblioteca tenga ejemplares de estos títulos. Las imágenes son portadas ilustrativas, no las originales.
      </p>

      <p v-if="!libros.length" role="status">Todavía no hay libros recomendados para esta constelación. Puedes volver a su historia o consultar más tarde.</p>
      <div v-else class="biblioteca-estanteria">
        <div class="biblioteca-rejilla">
          <article v-for="item in libros" :key="item.id" class="biblioteca-tarjeta">
            <RouterLink
              class="biblioteca-portada-enlace"
              :to="{ name: 'libro', params: { id, libroId: item.id } }"
              :aria-label="`Ver información del libro ${item.titulo}`"
            >
              <img :src="item.portadaIlustrativa" :alt="`Portada ilustrativa, no original: ${item.titulo}`" width="450" height="640" loading="lazy" />
            </RouterLink>
            <h2>{{ item.titulo }}</h2>
            <p class="biblioteca-autor">{{ item.autor }}</p>
            <RouterLink class="public-button biblioteca-boton" :to="{ name: 'libro', params: { id, libroId: item.id } }">
              Ver información del libro
            </RouterLink>
          </article>
        </div>
      </div>
      <RouterLink class="biblioteca-otro" :to="rutaConstelacion">← Volver a la historia de {{ nombre }}</RouterLink>
    </template>

    <template v-else-if="nombre && libro">
      <RouterLink class="biblioteca-otro" :to="rutaEstanteria">← Volver a los libros sobre {{ nombre }}</RouterLink>
      <h1 tabindex="-1">{{ libro.titulo }}</h1>
      <div class="biblioteca-detalle">
        <figure class="biblioteca-detalle-portada">
          <img :src="libro.portadaIlustrativa" :alt="`Portada ilustrativa, no original: ${libro.titulo}`" width="450" height="640" />
          <figcaption>Ilustración de demostración; no es la cubierta de una edición física.</figcaption>
        </figure>
        <div class="biblioteca-detalle-info">
          <p class="biblioteca-autor"><strong>Autor:</strong> {{ libro.autor }} <span v-if="libro.anio">· {{ libro.anio }}</span></p>
          <section aria-labelledby="motivo-lectura">
            <h2 id="motivo-lectura">¿Por qué leerlo?</h2>
            <p>{{ libro.motivo }}</p>
          </section>
          <section aria-labelledby="encontrar-libro" class="biblioteca-buscar">
            <h2 id="encontrar-libro">¿Dónde encontrarlo?</h2>
            <p><strong>Ubicación y signatura:</strong> todavía no contamos con datos de la biblioteca.</p>
            <p>No podemos confirmar la disponibilidad de un ejemplar físico. Si te interesa este título, consulta al personal de la biblioteca.</p>
            <details class="biblioteca-marc">
              <summary>Ver ejemplo de identificador MARC 21</summary>
              <p><strong>Campo 001 (simulado):</strong> {{ libro.marc21.campo001 }}</p>
              <p><strong>Campo 003 (simulado):</strong> {{ libro.marc21.campo003 }}</p>
              <p><strong>Campo 852 (ubicación y signatura):</strong> sin datos.</p>
              <p>Estos códigos solo ilustran cómo podría relacionarse AstroVisor con un catálogo. No identifican registros reales.</p>
            </details>
          </section>
          <a class="public-button biblioteca-boton" :href="libro.enlacePublico" target="_blank" rel="noopener noreferrer">
            Consultar obra en línea (sitio externo)
          </a>
        </div>
      </div>
      <RouterLink class="biblioteca-otro" :to="rutaEstanteria">← Elegir otro libro</RouterLink>
    </template>

    <template v-else>
      <h1 tabindex="-1">No encontramos esa lectura</h1>
      <p>Elige una constelación para explorar sus libros recomendados.</p>
      <RouterLink class="public-button" to="/explorar">Explorar constelaciones</RouterLink>
    </template>
  </section>
</template>

<style scoped>
.biblioteca-page { padding-bottom: 1.5rem; }
.biblioteca-intro { max-width: 58rem; margin-bottom: 1.6rem; }
.biblioteca-intro p:last-child { color: var(--muted); font-size: 1.16rem; max-width: 58ch; }
.biblioteca-eyebrow { color: #715000; font-weight: 700; letter-spacing: .04em; margin-bottom: .4rem; }
.biblioteca-aviso { color: #303f50; background: #fff8e7; border: 2px solid #d9ae48; border-radius: 14px; padding: 1rem 1.2rem; line-height: 1.55; margin-bottom: 1.8rem; }
.biblioteca-estanteria { padding: 1.5rem 1.25rem 2rem; background: #ede0ca; border: 3px solid #b9a487; border-radius: 20px; box-shadow: inset 0 -15px #dbc9a9; }
.biblioteca-rejilla { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 1.5rem; align-items: stretch; }
.biblioteca-tarjeta { display: flex; flex-direction: column; align-items: center; min-width: 0; padding: 1.2rem; border-radius: 14px; background: #fffdf8; border-bottom: 12px solid #b39b79; box-shadow: 0 6px 12px #40372619; }
.biblioteca-portada-enlace { width: min(100%, 190px); display: block; margin-bottom: 1rem; border-radius: 4px; }
.biblioteca-portada-enlace img { display: block; width: 100%; height: auto; border-radius: 4px; box-shadow: 5px 8px 14px #0b153044; }
.biblioteca-tarjeta h2 { font-family: Georgia, 'Times New Roman', serif; font-size: 1.25rem; line-height: 1.3; margin: 0; text-align: center; }
.biblioteca-autor { color: var(--muted); line-height: 1.45; margin: .6rem 0 1rem; text-align: center; }
.biblioteca-boton { width: 100%; text-align: center; min-height: 56px; margin-top: auto; }
.biblioteca-tarjeta .biblioteca-boton { font-size: .98rem; padding: .7rem .8rem; }
.biblioteca-otro { display: inline-flex; align-items: center; min-height: 52px; margin: 1.2rem 0; color: var(--blue); font-weight: 700; }
.biblioteca-detalle { display: grid; grid-template-columns: minmax(200px, .7fr) minmax(0, 1.5fr); gap: clamp(1.5rem, 5vw, 3rem); align-items: start; }
.biblioteca-detalle-portada { margin: 0; max-width: 340px; }
.biblioteca-detalle-portada img { width: 100%; height: auto; border-radius: 7px; box-shadow: 8px 10px 20px #0b153033; display: block; }
.biblioteca-detalle-portada figcaption { margin-top: .8rem; font-size: .9rem; color: var(--muted); }
.biblioteca-detalle-info { font-size: 1.06rem; }
.biblioteca-detalle-info .biblioteca-autor { text-align: left; }
.biblioteca-detalle-info section { margin: 1.5rem 0; }
.biblioteca-detalle-info h2 { margin-bottom: .5rem; }
.biblioteca-detalle-info p { max-width: 62ch; }
.biblioteca-buscar { padding: 1.1rem 1.3rem; border: 1px solid #d6d6cd; background: #fff; border-radius: 14px; }
.biblioteca-marc { margin-top: 1rem; font-size: .93rem; }
.biblioteca-marc summary { color: var(--blue); font-weight: 700; cursor: pointer; min-height: 48px; padding: .55rem 0; }
.biblioteca-marc summary:focus-visible { outline: 3px solid var(--blue); outline-offset: 3px; }
@media (max-width: 840px) { .biblioteca-rejilla { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (max-width: 580px) {
  .biblioteca-rejilla, .biblioteca-detalle { grid-template-columns: 1fr; }
  .biblioteca-estanteria { padding: .9rem; }
  .biblioteca-tarjeta { padding: 1.25rem .9rem; }
  .biblioteca-portada-enlace { max-width: 220px; }
  .biblioteca-detalle-portada { width: min(72%, 280px); }
}
</style>
