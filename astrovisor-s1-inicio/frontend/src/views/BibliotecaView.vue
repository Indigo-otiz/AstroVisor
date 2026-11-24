<script setup>
import { ref, computed, watch, nextTick, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { nombresConstelacion, alternativaPortada } from '../services/librosDemoService.js'
import { useLibros } from '../composables/useLibros.js'

const route = useRoute()
const id = computed(() => String(route.params.id ?? ''))
const nombre = computed(() => nombresConstelacion[id.value] ?? null)
const { libros, cargando, error, aviso, cargar, cancelar } = useLibros()
const mostrandoDetalle = computed(() => Boolean(route.params.libroId))
const libro = computed(() => mostrandoDetalle.value ? libros.value.find((l) => l.id === String(route.params.libroId)) : null)
const titulo = computed(() => cargando.value ? 'Cargando libros' : error.value ? 'No pudimos consultar los libros' : libro.value?.titulo ?? (nombre.value ? `Libros sobre ${nombre.value}` : 'Biblioteca de las estrellas'))

// Detección de origen: únicamente si proviene explícitamente del visor (?origen=visor)
// se inicializa en modo oscuro (anti-deslumbramiento). Desde menús o navegador inicia en modo claro.
const modoOscuro = ref(route.query.origen === 'visor')

watch(() => route.query.origen, (origen) => {
  modoOscuro.value = origen === 'visor'
})

watch(modoOscuro, (val) => {
  if (typeof document !== 'undefined') {
    document.body.classList.toggle('modo-oscuro-total', val)
    document.documentElement.classList.toggle('modo-oscuro-total', val)
  }
}, { immediate: true })

function alternarModoOscuro() {
  modoOscuro.value = !modoOscuro.value
}
watch(() => [route.params.id, route.params.libroId], () => cargar(id.value), { immediate: true })
watch([titulo, cargando], async ([valor]) => {
  document.title = `${valor} · AstroVisor`
  await nextTick()
  if (!cargando.value && document.activeElement === document.body) document.querySelector('#contenido h1')?.focus({ preventScroll: true })
}, { immediate: true })
onBeforeUnmount(() => {
  cancelar()
  if (typeof document !== 'undefined') {
    document.body.classList.remove('modo-oscuro-total')
    document.documentElement.classList.remove('modo-oscuro-total')
  }
})

const rutaConstelacion = computed(() => ({ name: 'constelacion', params: { id: id.value } }))
const rutaEstanteria = computed(() => ({
  name: 'biblioteca',
  params: { id: id.value },
  query: modoOscuro.value ? { origen: 'visor' } : {}
}))
</script>

<template>
  <section class="biblioteca-page" :class="{ 'modo-oscuro': modoOscuro }">
    <p v-if="aviso" class="biblioteca-aviso" role="status">{{ aviso }}</p>
    
    <div class="biblioteca-top-bar">
      <RouterLink class="public-back" :to="nombre ? (mostrandoDetalle ? rutaEstanteria : rutaConstelacion) : { name: 'explorar' }">
        ← Volver {{ mostrandoDetalle ? `a la estantería de ${nombre || 'libros'}` : nombre ? `a ${nombre}` : 'a las constelaciones' }}
      </RouterLink>

      <button
        type="button"
        class="biblioteca-theme-toggle"
        :aria-pressed="modoOscuro"
        :title="modoOscuro ? 'Cambiar a modo lectura claro' : 'Cambiar a modo nocturno oscuro'"
        @click="alternarModoOscuro"
      >
        <svg
          v-if="modoOscuro"
          class="theme-svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
        <svg
          v-else
          class="theme-svg"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
        <span>{{ modoOscuro ? 'Modo claro' : 'Modo nocturno' }}</span>
      </button>
    </div>

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
        Las fichas indican cuáles portadas son fotografías de ejemplares y cuáles forman parte de las referencias de demostración.
      </p>

      <p v-if="!libros.length" role="status">Todavía no hay libros recomendados para esta constelación. Puedes volver a su historia o consultar más tarde.</p>
      <div v-else class="biblioteca-estanteria">
        <div class="biblioteca-rejilla">
          <article v-for="item in libros" :key="item.id" class="biblioteca-tarjeta">
            <RouterLink
              class="biblioteca-portada-enlace"
              :to="{ name: 'libro', params: { id, libroId: item.id }, query: modoOscuro ? { origen: 'visor' } : {} }"
              :aria-label="`Ver información del libro ${item.titulo}`"
            >
              <img :src="item.portadaIlustrativa" :alt="alternativaPortada(item)" width="450" height="640" loading="lazy" />
            </RouterLink>
            <h2>{{ item.titulo }}</h2>
            <p class="biblioteca-autor">{{ item.autor }}</p>
            <RouterLink class="public-button biblioteca-boton" :to="{ name: 'libro', params: { id, libroId: item.id }, query: modoOscuro ? { origen: 'visor' } : {} }">
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
          <img :src="libro.portadaIlustrativa" :alt="alternativaPortada(libro)" width="450" height="640" />
          <figcaption v-if="libro.portada?.tipo === 'fotografia-ejemplar'">Fotografía de la portada del ejemplar.</figcaption>
          <figcaption v-else-if="libro.portada?.tipo === 'imagen-autorizada'">Imagen con permiso declarado. Procedencia: {{ libro.portada.procedencia }}. Permiso: {{ libro.portada.permiso }}.</figcaption>
          <figcaption v-else>Ilustración de demostración; no es la cubierta de una edición física.</figcaption>
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
            <details v-if="libro.demostracion" class="biblioteca-marc">
              <summary>Ver ejemplo de identificador MARC 21</summary>
              <p><strong>Campo 001 (simulado):</strong> {{ libro.marc21.campo001 }}</p>
              <p><strong>Campo 003 (simulado):</strong> {{ libro.marc21.campo003 }}</p>
              <p><strong>Campo 852 (ubicación y signatura):</strong> sin datos.</p>
              <p>Estos códigos solo ilustran cómo podría relacionarse AstroVisor con un catálogo. No identifican registros reales.</p>
            </details>
          </section>
          <a v-if="libro.enlacePublico" class="public-button biblioteca-boton" :href="libro.enlacePublico" target="_blank" rel="noopener noreferrer">
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

/* Barra superior con selector de modo claro/oscuro */
.biblioteca-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.2rem;
}
.biblioteca-top-bar .public-back {
  margin: 0;
}
.biblioteca-theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  border: 2px solid #b9a487;
  background: #fff8e7;
  color: #5c4400;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
}
.biblioteca-theme-toggle .theme-svg {
  display: block;
  flex-shrink: 0;
}
.biblioteca-theme-toggle:hover {
  background: #f5ecd5;
  border-color: #8c6d3b;
  transform: translateY(-1px);
}

/* === MODO OSCURO INTEGRADO (Nocturno / Anti-Deslumbramiento) === */
.biblioteca-page.modo-oscuro {
  color: #f1f5f9;
}
.biblioteca-page.modo-oscuro h1,
.biblioteca-page.modo-oscuro .biblioteca-intro h1 {
  color: #f8fafc;
}
.biblioteca-page.modo-oscuro .biblioteca-eyebrow {
  color: #f5b301;
}
.biblioteca-page.modo-oscuro .biblioteca-intro p:last-child {
  color: #94a3b8;
}
.biblioteca-page.modo-oscuro .biblioteca-theme-toggle {
  background: #0f1a36;
  border-color: #38bdf8;
  color: #bae6fd;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
}
.biblioteca-page.modo-oscuro .biblioteca-theme-toggle:hover {
  background: #182852;
  border-color: #7dd3fc;
}
.biblioteca-page.modo-oscuro .biblioteca-aviso {
  background: #0f1c3d;
  color: #dbeafe;
  border-color: #3b82f6;
}
.biblioteca-page.modo-oscuro .biblioteca-estanteria {
  background: #0b1530;
  border-color: #1e3a6d;
  box-shadow: inset 0 -15px #070d1e, 0 8px 24px rgba(0, 0, 0, 0.45);
}
.biblioteca-page.modo-oscuro .biblioteca-tarjeta {
  background: #111d3d;
  border-bottom-color: #233e75;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.55);
}
.biblioteca-page.modo-oscuro .biblioteca-tarjeta h2 {
  color: #f8fafc;
}
.biblioteca-page.modo-oscuro .biblioteca-autor {
  color: #94a3b8;
}
.biblioteca-page.modo-oscuro .biblioteca-buscar {
  background: #0d1733;
  border-color: #1e3a6d;
  color: #cbd5e1;
}
.biblioteca-page.modo-oscuro .biblioteca-buscar h2 {
  color: #f8fafc;
}
.biblioteca-page.modo-oscuro .biblioteca-buscar p {
  color: #cbd5e1;
}
.biblioteca-page.modo-oscuro .biblioteca-buscar strong {
  color: #f8fafc;
}
.biblioteca-page.modo-oscuro .biblioteca-marc summary {
  color: #38bdf8;
}
.biblioteca-page.modo-oscuro .biblioteca-otro {
  color: #38bdf8;
}
.biblioteca-page.modo-oscuro .public-back {
  color: #38bdf8;
}
.biblioteca-page.modo-oscuro .biblioteca-detalle-portada figcaption {
  color: #94a3b8;
}
.biblioteca-page.modo-oscuro .biblioteca-detalle-info p {
  color: #e2e8f0;
}
.biblioteca-page.modo-oscuro .biblioteca-detalle-info strong {
  color: #f8fafc;
}
</style>
