<script setup>
import { computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useRecorridos } from '../composables/useRecorridos.js'
import ConstellationArt from '../components/ConstellationArt.vue'
import ContentState from '../components/ContentState.vue'
import NarracionAudio from '../components/NarracionAudio.vue'

const route = useRoute()
const { recorridos, cargando, error, cargar } = useRecorridos()

const constelacion = computed(() => recorridos.value.find((x) => x.id === route.params.id))

const metadatosDetalle = {
  orion: {
    boveda: 'Bóveda Ecuatorial · Invierno',
    subtitulo: 'El Cazador',
    alineacion: 'Cinturón de las Tres Marías',
  },
  'osa-mayor': {
    boveda: 'Bóveda Septentrional · Circumpolar',
    subtitulo: 'Ursa Major · El Gran Carro',
    alineacion: 'Merak → Dubhe ➔ Polaris',
  },
  escorpio: {
    boveda: 'Bóveda Austral · Verano',
    subtitulo: 'El Rival de Orión',
    alineacion: 'Arco y Aguijón Estival',
  },
  'can-mayor': {
    boveda: 'Bóveda Austral · Invierno',
    subtitulo: 'Sirio y el Gran Guardián',
    alineacion: 'Extensión Austral de Orión',
  },
  boyero: {
    boveda: 'Bóveda Boreal · Primavera / Verano',
    subtitulo: 'El Pastor de las Estrellas',
    alineacion: 'Curva del Mango ➔ Arturo',
  },
}

function meta(id) {
  return metadatosDetalle[id] || {
    boveda: 'Bóveda Celeste · Nayarit',
    subtitulo: 'Figura Estelar',
    alineacion: 'Referencia visual',
  }
}

const primerLibro = computed(() => {
  if (constelacion.value && Array.isArray(constelacion.value.libros) && constelacion.value.libros.length > 0) {
    return constelacion.value.libros[0]
  }
  return null
})

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

watch(
  tituloPagina,
  (titulo) => {
    document.title = `${titulo} · AstroVisor`
  },
  { immediate: true },
)
</script>

<template>
  <section class="max-w-7xl mx-auto py-2" aria-labelledby="constelacion-titulo">
    <!-- Migas / Retorno y badge en cabecera compacta -->
    <header v-if="constelacion && !cargando && !error" class="ficha-compact-header">
      <div class="ficha-compact-topbar">
        <RouterLink class="public-back" to="/explorar">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5m6-6-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Volver a las constelaciones
        </RouterLink>

        <div class="ficha-compact-badge">
          <span class="ficha-compact-badge-dot"></span>
          <span>{{ meta(constelacion.id).boveda }}</span>
        </div>
      </div>

      <h1 id="constelacion-titulo" tabindex="-1" class="ficha-compact-title">
        {{ constelacion.titulo }}
        <span v-if="meta(constelacion.id).subtitulo" class="ficha-compact-subtitle">
          ({{ meta(constelacion.id).subtitulo }})
        </span>
      </h1>
      <p class="ficha-compact-desc">
        {{ constelacion.resumen }}
      </p>
    </header>

    <!-- Contenido Principal -->
    <template v-if="constelacion && !cargando && !error">
      <!-- Disposición Principal a Dos Columnas -->
      <div class="ficha-editorial-layout">
        <!-- COLUMNA IZQUIERDA: Visualización Celeste & Reproductor de Audio -->
        <section class="flex flex-col gap-5">
          <!-- Bóveda de Observación Simulada -->
          <div class="boveda-editorial-box">
            <!-- Cabecera de la ventana celeste -->
            <div class="boveda-editorial-header">
              <div class="boveda-editorial-badge">
                <span class="w-2 h-2 rounded-full bg-[#f5b301] shadow-[0_0_8px_#f5b301]"></span>
                <span>Bóveda de Observación Simulada</span>
              </div>
            </div>

            <!-- Canvas/SVG de la constelación -->
            <div class="boveda-editorial-sky">
              <ConstellationArt :id="constelacion.id" />
            </div>

            <!-- Pie del visor con acceso a 3D / VR -->
            <div class="boveda-editorial-footer">
              <p class="boveda-footer-note">
                Una forma de imaginar {{ constelacion.titulo }}. Esquema ilustrativo sin escala.
              </p>
              <RouterLink to="/visor-3d" class="boveda-vr-btn">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h4.5l2.5-3 2.5 3H21c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-14 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm10 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                </svg>
                <span>Ver en 3D inmersivo</span>
              </RouterLink>
            </div>
          </div>

          <!-- Reproductor de Audio: Narración Oral de la Tradición Oral -->
          <div class="ficha-card-parchment">
            <NarracionAudio :key="constelacion.id" :constelacion="constelacion" />
          </div>

          <!-- Grabado y Archivo Histórico -->
          <div class="ficha-card-white">
            <div class="flex items-center justify-between pb-3 mb-3 border-b border-[#dedbd3]">
              <span class="font-serif italic text-base text-[#0b1530]">Atlas Coelestis Novum</span>
              <span class="font-sans text-[11px] bg-[#f6f3ec] px-2 py-0.5 rounded text-[#76767e] uppercase tracking-wider">
                Litografía de archivo
              </span>
            </div>
            <p class="font-sans text-xs text-[#45464d] leading-relaxed">
              Representación gráfica clásica conservada en los fondos documentales sobre astronomía y cosmogonía náutica.
            </p>
          </div>
        </section>

        <!-- COLUMNA DERECHA: Relato, Reconocimiento y Libros de Biblioteca -->
        <section class="flex flex-col gap-5">
          <!-- Relato y Tradición Celeste -->
          <article class="ficha-card-parchment" aria-labelledby="historia">
            <div class="ficha-section-eyebrow">
              <svg class="w-4 h-4 text-[#d49e1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
              </svg>
              <span>Memoria &amp; Cosmogonía</span>
            </div>
            <h2 id="historia" class="ficha-section-title">Una historia entre las estrellas</h2>
            <p class="ficha-section-text">
              {{ constelacion.historia }}
            </p>
          </article>

          <!-- Cómo Reconocer su Figura -->
          <article class="ficha-card-white" aria-labelledby="reconocer">
            <div class="ficha-section-eyebrow">
              <svg class="w-4 h-4 text-[#1f4e8c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <span>Observación en la Noche</span>
            </div>
            <h2 id="reconocer" class="ficha-section-title">Reconoce su figura</h2>
            <p class="ficha-section-text">
              {{ constelacion.comoReconocerla }}
            </p>
          </article>

          <!-- Acervo Físico y Recomendación en Biblioteca -->
          <section class="ficha-card-white relative overflow-hidden" aria-labelledby="invitacion-lectura-titulo">
            <div class="ficha-section-eyebrow">
              <svg class="w-4 h-4 text-[#8c5b00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"/>
              </svg>
              <span>Tu viaje continúa en los libros</span>
            </div>
            <h2 id="invitacion-lectura-titulo" class="ficha-section-title">
              ¿Te gustaría conocer más sobre {{ constelacion.titulo }}?
            </h2>

            <div v-if="primerLibro" class="ficha-book-highlight">
              <div class="ficha-book-icon">
                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>
                </svg>
              </div>
              <div class="ficha-book-details">
                <h4>{{ primerLibro.titulo }}</h4>
                <p class="ficha-book-author">Por {{ primerLibro.autor }} <span v-if="primerLibro.anio">({{ primerLibro.anio }})</span></p>
                <span class="ficha-book-sala">Sala de Consulta General</span>
              </div>
            </div>

            <p class="font-sans text-xs text-[#45464d] bg-[#f6f3ec] p-3 rounded-lg mt-3 mb-4">
              Disponible para consulta y lectura en la <strong>Sala de Consulta General</strong> de la Biblioteca Pública Central Estatal Solón Argüello en la ciudad de Tepic, Nayarit.
            </p>

            <div class="flex flex-col sm:flex-row gap-3">
              <RouterLink
                class="portal-button primary w-full text-center"
                :to="{ name: 'biblioteca', params: { id: constelacion.id } }"
              >
                Ver libros recomendados sobre {{ constelacion.titulo }}
              </RouterLink>
            </div>
            <p class="invitacion-nota text-xs text-[#76767e] mt-2">
              Consulta la disponibilidad de títulos en el módulo de atención de la biblioteca.
            </p>
          </section>

          <!-- Botón adicional para volver a explorar -->
          <div>
            <RouterLink class="portal-button outline w-full text-center" to="/explorar">
              Explorar otra constelación
              <svg viewBox="0 0 24 24" aria-hidden="true" class="button-icon"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </RouterLink>
          </div>
        </section>
      </div>
    </template>

    <template v-else>
      <div class="py-12">
        <h1 class="state-title text-center" tabindex="-1">{{ tituloEstado }}</h1>
        <ContentState :cargando="cargando" :error="error" detalle @reintentar="cargar" />
      </div>
    </template>
  </section>
</template>
