<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useRecorridos } from '../composables/useRecorridos.js'
import ConstellationArt from '../components/ConstellationArt.vue'
import ContentState from '../components/ContentState.vue'

const { recorridos, cargando, error, cargar } = useRecorridos()
const filtroActivo = ref('todas')

const metadatosConstelacion = {
  orion: {
    temporada: 'invierno',
    epoca: 'Invierno',
    subtitulo: 'El Cazador',
  },
  'osa-mayor': {
    temporada: 'circumpolar',
    epoca: 'Circumpolar (Todo el año)',
    subtitulo: 'El Gran Carro',
  },
  escorpio: {
    temporada: 'verano',
    epoca: 'Verano',
    subtitulo: 'El Rival de Orión',
  },
  'can-mayor': {
    temporada: 'invierno',
    epoca: 'Invierno',
    subtitulo: 'Sirio y el Gran Guardián',
  },
  boyero: {
    temporada: 'verano',
    epoca: 'Primavera / Verano',
    subtitulo: 'El Pastor de las Estrellas',
  },
}

function obtenerEpoca(id) {
  return metadatosConstelacion[id]?.epoca || 'Firmamento Visible'
}

function obtenerSubtitulo(id) {
  return metadatosConstelacion[id]?.subtitulo || ''
}

const constelacionesFiltradas = computed(() => {
  if (filtroActivo === 'todas' || filtroActivo.value === 'todas') return recorridos.value
  return recorridos.value.filter((r) => {
    const meta = metadatosConstelacion[r.id]
    return meta && meta.temporada === filtroActivo.value
  })
})

function totalLibros(recorrido) {
  return Array.isArray(recorrido?.libros) ? recorrido.libros.length : 0
}
</script>

<template>
  <section class="max-w-7xl mx-auto py-4" aria-labelledby="explorar-title">
    <!-- Migaja / Retorno al inicio -->
    <RouterLink class="public-back" to="/">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5m6-6-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Volver al inicio
    </RouterLink>

    <!-- Encabezado Editorial -->
    <header class="pt-2 pb-6">
      <h1 id="explorar-title" tabindex="-1" class="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#0b1530] font-normal tracking-tight mt-1">
        Constelaciones e historias del cielo
      </h1>
      <p class="font-serif text-lg text-[#45464d] pt-2 max-w-3xl leading-relaxed">
        Elige una figura estelar para contemplar su geometría en la noche, escuchar sus relatos ancestrales y consultar las obras disponibles en el acervo de la Biblioteca Central Estatal Solón Argüello.
      </p>

      <!-- Barra de filtros estacionales -->
      <div class="filtros-temporada" role="toolbar" aria-label="Filtros de constelaciones por temporada">
        <button
          class="filtro-btn"
          :class="{ activo: filtroActivo === 'todas' }"
          type="button"
          @click="filtroActivo = 'todas'"
        >
          Todas las constelaciones ({{ recorridos.length }})
        </button>
        <button
          class="filtro-btn"
          :class="{ activo: filtroActivo === 'invierno' }"
          type="button"
          @click="filtroActivo = 'invierno'"
        >
          Cielo de Invierno
        </button>
        <button
          class="filtro-btn"
          :class="{ activo: filtroActivo === 'circumpolar' }"
          type="button"
          @click="filtroActivo = 'circumpolar'"
        >
          Circumpolares (Todo el año)
        </button>
        <button
          class="filtro-btn"
          :class="{ activo: filtroActivo === 'verano' }"
          type="button"
          @click="filtroActivo = 'verano'"
        >
          Cielo de Verano / Zodíaco
        </button>
      </div>
    </header>

    <!-- Estado de carga / error -->
    <ContentState
      v-if="cargando || error || !recorridos.length"
      :cargando="cargando"
      :error="error"
      @reintentar="cargar"
    />

    <!-- Cuadrícula de tarjetas de constelaciones -->
    <div v-else class="catalogo-editorial-grid">
      <article
        v-for="recorrido in constelacionesFiltradas"
        :key="recorrido.id"
        class="catalogo-editorial-card group"
      >
        <!-- Ventana celeste con arte estelar interactiva (acceso directo) -->
        <RouterLink
          class="catalogo-sky-thumb"
          :to="`/explorar/${recorrido.id}`"
          :aria-label="`Explorar constelación ${recorrido.titulo}`"
        >
          <ConstellationArt :id="recorrido.id" />
        </RouterLink>

        <!-- Contenido editorial -->
        <div class="catalogo-card-body">
          <div>
            <span class="catalogo-card-season">
              {{ obtenerEpoca(recorrido.id) }}
            </span>
            <h2 class="catalogo-card-title">
              <RouterLink
                class="catalogo-card-title-link"
                :to="`/explorar/${recorrido.id}`"
              >
                {{ recorrido.titulo }}
              </RouterLink>
            </h2>
            <p v-if="obtenerSubtitulo(recorrido.id)" class="catalogo-card-subtitle">
              ({{ obtenerSubtitulo(recorrido.id) }})
            </p>
            <p class="catalogo-card-desc">
              {{ recorrido.resumen }}
            </p>
          </div>

          <div>
            <div v-if="totalLibros(recorrido) > 0" class="catalogo-card-audio-pill text-[#535e6c]">
              <svg class="w-4 h-4 text-[#1f4e8c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
              <span>{{ totalLibros(recorrido) }} libro en acervo Solón Argüello</span>
            </div>

            <RouterLink
              class="catalogo-card-link"
              :to="`/explorar/${recorrido.id}`"
            >
              <span>Explorar relato y estrellas</span>
              <span>&rarr;</span>
            </RouterLink>
          </div>
        </div>
      </article>
    </div>

    <!-- Experiencia VR Callout Banner -->
    <section class="vr-callout-banner">
      <div class="vr-callout-content">
        <div class="vr-callout-badge">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h4.5l2.5-3 2.5 3H21c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-14 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm10 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
          </svg>
          <span>Visualización Inmersiva Disponible</span>
        </div>
        <h3>¿Prefieres contemplar estas constelaciones en 360 grados?</h3>
        <p>
          Accede al Modo Homido directamente con tu visor móvil o explora desde el navegador para experimentar la posición del cielo en 3D calculada para Nayarit.
        </p>
      </div>

      <div class="vr-callout-actions">
        <RouterLink class="portal-button primary" to="/visor-3d">
          <span class="btn-main">Experiencia 3D Mejorada</span>
        </RouterLink>
        <a class="portal-button homido" href="/prueba-homido/index.html?modo=homido">
          <span class="btn-main">Bóveda VR Homido</span>
        </a>
      </div>
    </section>

    <!-- Logos institucionales -->
    <section class="logos-institucionales-section">
      <h3 class="logos-institucionales-title">Instituciones Colaboradoras</h3>
      <p class="logos-institucionales-desc">
        Divulgación científica y patrimonio astronómico en vinculación con bibliotecas públicas e institutos tecnológicos.
      </p>
      <div class="logos-institucionales-grid">
        <div class="logos-institucionales-item">
          <img
            src="/Nayarit_CECAN_Convivencia_Horizontal.png"
            alt="Gobierno del Estado de Nayarit y Consejo Estatal para la Cultura y las Artes de Nayarit (CECAN)"
            loading="lazy"
          />
        </div>
        <div class="logos-institucionales-item">
          <img
            src="/institucional/biblioteca-solon-arguello.png"
            alt="Biblioteca Pública Central Estatal Solón Argüello"
            loading="lazy"
          />
        </div>
        <div class="logos-institucionales-item">
          <img
            src="/Logo%20TecNMs.png"
            alt="Tecnológico Nacional de México"
            loading="lazy"
          />
        </div>
        <div class="logos-institucionales-item">
          <img
            src="/ITTepic_logo.jpg"
            alt="Instituto Tecnológico de Tepic"
            loading="lazy"
          />
        </div>
      </div>
    </section>
  </section>
</template>
