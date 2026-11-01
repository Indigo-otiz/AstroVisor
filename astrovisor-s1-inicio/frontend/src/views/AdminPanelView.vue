<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { supabase, isSupabaseConfigured } from '../services/supabaseClient.js'

const router = useRouter()
const { userDisplayName, username, signOut } = useAuth()

const isIniciando3D = ref(false)
const libroList = ref([])
const loadingLibros = ref(false)
const librosError = ref('')

function handleLogout() {
  signOut()
  router.push('/admin/acceso')
}

function handleElegir3DLigera() {
  isIniciando3D.value = true
  setTimeout(() => {
    router.push('/visor')
  }, 2200)
}

function handleCancelar3D() {
  isIniciando3D.value = false
}

// Cargar las fichas_libros desde Supabase
async function cargarLibros() {
  if (!isSupabaseConfigured) return
  loadingLibros.value = true
  librosError.value = ''
  try {
    const { data, error } = await supabase
      .from('fichas_libros')
      .select('*')
      .order('id', { ascending: true })

    if (error) {
      librosError.value = error.message
    } else {
      libroList.value = data || []
    }
  } catch (err) {
    librosError.value = err.message || 'Error de conexión'
  } finally {
    loadingLibros.value = false
  }
}

onMounted(() => {
  cargarLibros()
})
</script>

<template>
  <div class="admin-dashboard-wrapper">
    <!-- PANTALLA DE TRANSICIÓN: INICIANDO 3D LIGERA (Imagen 4) -->
    <div v-if="isIniciando3D" class="loading-overlay">
      <div class="loading-card">
        <div class="constellation-spinner">
          <svg viewBox="0 0 140 140" class="spinner-svg" aria-hidden="true">
            <polygon
              points="70,22 118,57 99,112 41,112 22,57"
              fill="none"
              stroke="#94a3b8"
              stroke-width="2.5"
            />
            <circle cx="70" cy="22" r="6" fill="#e69d13" class="pulse-node-1" />
            <circle cx="118" cy="57" r="6" fill="#e69d13" class="pulse-node-2" />
            <circle cx="99" cy="112" r="5" fill="#94a3b8" />
            <circle cx="41" cy="112" r="5" fill="#94a3b8" />
            <circle cx="22" cy="57" r="5" fill="#94a3b8" />
          </svg>
        </div>

        <h2 class="loading-title">Iniciando 3D ligera...</h2>
        <p class="loading-subtitle">Esto puede tardar unos segundos.</p>

        <button type="button" class="btn-cancelar-transicion" @click="handleCancelar3D">
          Cancelar
        </button>
      </div>
    </div>

    <!-- BARRA SUPERIOR BLANCA DEL PANEL (ÚNICO MENÚ SUPERIOR) -->
    <header class="admin-topbar">
      <div class="topbar-left">
        <RouterLink to="/" class="topbar-brand">
          <svg class="topbar-star" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" fill="#f6ad55" />
          </svg>
          <span>AstroVisor</span>
        </RouterLink>
        <span class="admin-badge-gold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="badge-lock">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Administración
        </span>
      </div>

      <nav class="topbar-right">
        <div class="tab-experiencias">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tab-icon">
            <rect x="2" y="6" width="20" height="12" rx="4" />
            <circle cx="8" cy="12" r="3" />
            <circle cx="16" cy="12" r="3" />
            <path d="M11 12h2" />
          </svg>
          <span>Experiencias</span>
        </div>
        <button type="button" class="btn-logout" @click="handleLogout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="logout-icon">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Cerrar sesión</span>
        </button>
      </nav>
    </header>

    <!-- BANNER HERO AZUL NOCHE -->
    <section class="admin-hero-banner">
      <svg class="banner-decor-svg" viewBox="0 0 1100 220" preserveAspectRatio="none" aria-hidden="true">
        <circle cx="200" cy="40" r="1.5" fill="#ffffff" opacity="0.5" />
        <circle cx="480" cy="130" r="1.5" fill="#ffffff" opacity="0.4" />
        <circle cx="750" cy="70" r="2" fill="#ffffff" opacity="0.6" />
        <circle cx="860" cy="160" r="1.5" fill="#ffffff" opacity="0.5" />
        <circle cx="1020" cy="50" r="1.5" fill="#ffffff" opacity="0.4" />

        <!-- Planeta y constelación -->
        <circle cx="780" cy="100" r="28" fill="#475569" opacity="0.45" />
        <ellipse cx="780" cy="100" rx="46" ry="12" fill="none" stroke="#94a3b8" stroke-width="2" opacity="0.4" transform="rotate(-15 780 100)" />
        <g stroke="#ffffff" stroke-width="1.2" opacity="0.3" fill="none">
          <polyline points="950,110 990,75 1030,95 1070,60" />
          <circle cx="950" cy="110" r="3" fill="#ffffff" />
          <circle cx="990" cy="75" r="3" fill="#ffffff" />
          <circle cx="1030" cy="95" r="3" fill="#ffffff" />
          <circle cx="1070" cy="60" r="3" fill="#ffffff" />
        </g>
      </svg>

      <div class="banner-content container">
        <h1 class="welcome-heading">
          Hola, {{ userDisplayName || username || 'Ana' }}
        </h1>
        <p class="welcome-subheading">Elige la versión para el visor de hoy.</p>
      </div>
    </section>

    <!-- CUERPO PRINCIPAL -->
    <main class="container admin-body">
      <!-- CÓMO USAR -->
      <section class="how-to-use-section">
        <h2 class="section-title">Cómo usar</h2>

        <div class="steps-row">
          <div class="step-card">
            <div class="step-number-badge">1</div>
            <div class="step-icon-box">
              <svg viewBox="0 0 60 50" class="step-svg">
                <rect x="6" y="6" width="48" height="34" rx="4" fill="#ffffff" stroke="#173868" stroke-width="2.5" />
                <polyline points="14,30 24,18 34,26 44,14" fill="none" stroke="#173868" stroke-width="2.5" />
                <circle cx="44" cy="14" r="3.5" fill="#f6ad55" />
                <path d="M30 25l8 12-4 2-8-12z" fill="#f6ad55" opacity="0.8" />
              </svg>
            </div>
            <h3 class="step-title">Elige la versión</h3>
            <p class="step-desc">Escoge 2D, 3D ligera o 3D mejor.</p>
          </div>

          <div class="step-connector">
            <span class="connector-line"></span>
            <span class="connector-diamond"></span>
          </div>

          <div class="step-card">
            <div class="step-number-badge">2</div>
            <div class="step-icon-box">
              <svg viewBox="0 0 60 50" class="step-svg">
                <rect x="10" y="16" width="40" height="26" rx="5" fill="#ffffff" stroke="#173868" stroke-width="2.5" />
                <circle cx="23" cy="29" r="6" fill="#173868" />
                <circle cx="37" cy="29" r="6" fill="#173868" />
                <path d="M30 4v10m-4-4l4 4 4-4" fill="none" stroke="#173868" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <h3 class="step-title">Coloca el celular en el visor</h3>
            <p class="step-desc">Ajusta las correas con cuidado.</p>
          </div>

          <div class="step-connector">
            <span class="connector-line"></span>
            <span class="connector-diamond"></span>
          </div>

          <div class="step-card">
            <div class="step-number-badge">3</div>
            <div class="step-icon-box">
              <svg viewBox="0 0 60 50" class="step-svg">
                <rect x="10" y="12" width="40" height="26" rx="5" fill="#ffffff" stroke="#173868" stroke-width="2.5" />
                <circle cx="23" cy="25" r="6" fill="#173868" />
                <circle cx="37" cy="25" r="6" fill="#173868" />
                <circle cx="44" cy="34" r="8" fill="#16a34a" />
                <path d="M40 34l3 3 6-6" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <h3 class="step-title">Mira si funciona</h3>
            <p class="step-desc">Si no funciona, prueba con otra.</p>
          </div>
        </div>
      </section>

      <!-- EXPERIENCIAS DISPONIBLES -->
      <section class="experiences-section">
        <nav class="breadcrumb-nav" aria-label="Ruta de navegación">
          <span>Administración</span> &rsaquo; <strong>Experiencias</strong>
        </nav>

        <h2 class="experiences-title">Experiencias disponibles</h2>

        <div class="experiences-grid">
          <!-- 2D -->
          <div class="exp-card">
            <div class="exp-preview-screen">
              <svg viewBox="0 0 160 100" class="screen-svg">
                <rect x="15" y="10" width="130" height="80" rx="8" fill="#0f1f38" stroke="#ffffff" stroke-width="2" />
                <line x1="80" y1="90" x2="80" y2="98" stroke="#ffffff" stroke-width="3" />
                <line x1="60" y1="98" x2="100" y2="98" stroke="#ffffff" stroke-width="3" />
                <polyline points="35,60 55,30 80,45 105,25 125,50" fill="none" stroke="#ffffff" stroke-width="1.8" />
                <circle cx="35" cy="60" r="3.5" fill="#ffffff" />
                <circle cx="55" cy="30" r="3.5" fill="#ffffff" />
                <circle cx="80" cy="45" r="3.5" fill="#ffffff" />
                <circle cx="105" cy="25" r="3.5" fill="#ffffff" />
                <circle cx="125" cy="50" r="3.5" fill="#ffffff" />
              </svg>
            </div>

            <div class="exp-info">
              <h3 class="exp-name">2D</h3>
              <p class="exp-tagline">Recorrido en pantalla</p>
              <p class="exp-details">Para computadora y pantalla grande. No necesita visor.</p>

              <div class="badge-wrapper">
                <span class="status-badge available">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="badge-check">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Disponible
                </span>
              </div>

              <RouterLink to="/explorar" class="btn-action outline">Ver recorrido 2D</RouterLink>
            </div>
          </div>

          <!-- 3D ligera -->
          <div class="exp-card">
            <div class="exp-preview-screen">
              <svg viewBox="0 0 160 100" class="screen-svg">
                <rect x="15" y="15" width="130" height="70" rx="14" fill="#0f1f38" stroke="#c4b5fd" stroke-width="2" />
                <circle cx="50" cy="50" r="22" fill="#1e293b" stroke="#ffffff" stroke-width="1.5" />
                <polyline points="40,58 50,42 60,52" fill="none" stroke="#ffffff" stroke-width="1.5" />
                <circle cx="40" cy="58" r="2.5" fill="#ffffff" />
                <circle cx="50" cy="42" r="2.5" fill="#f6ad55" />
                <circle cx="60" cy="52" r="2.5" fill="#ffffff" />
                <circle cx="110" cy="50" r="22" fill="#1e293b" stroke="#ffffff" stroke-width="1.5" />
                <polyline points="100,58 110,42 120,52" fill="none" stroke="#ffffff" stroke-width="1.5" />
                <circle cx="100" cy="58" r="2.5" fill="#ffffff" />
                <circle cx="110" cy="42" r="2.5" fill="#f6ad55" />
                <circle cx="120" cy="52" r="2.5" fill="#ffffff" />
              </svg>
            </div>

            <div class="exp-info">
              <h3 class="exp-name">3D ligera</h3>
              <p class="exp-tagline">Versión de menor demanda</p>
              <p class="exp-details">Para celulares sencillos. Más fluida.</p>

              <div class="badge-wrapper">
                <span class="status-badge available">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="badge-check">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Disponible
                </span>
              </div>

              <button type="button" class="btn-action solid" @click="handleElegir3DLigera">
                Elegir esta versión
              </button>
            </div>
          </div>

          <!-- 3D mejor -->
          <div class="exp-card">
            <div class="exp-preview-screen">
              <svg viewBox="0 0 160 100" class="screen-svg">
                <rect x="15" y="15" width="130" height="70" rx="14" fill="#0f1f38" stroke="#94a3b8" stroke-width="2" />
                <circle cx="50" cy="50" r="22" fill="#1e293b" stroke="#ffffff" stroke-width="1.5" />
                <circle cx="110" cy="50" r="22" fill="#1e293b" stroke="#ffffff" stroke-width="1.5" />
                <circle cx="50" cy="50" r="14" fill="none" stroke="#60a5fa" stroke-width="1" stroke-dasharray="2,2" />
                <circle cx="110" cy="50" r="14" fill="none" stroke="#60a5fa" stroke-width="1" stroke-dasharray="2,2" />
                <circle cx="48" cy="48" r="3" fill="#f6ad55" />
                <circle cx="108" cy="48" r="3" fill="#f6ad55" />
              </svg>
            </div>

            <div class="exp-info">
              <h3 class="exp-name">3D mejor</h3>
              <p class="exp-tagline">Versión de mayor detalle</p>
              <p class="exp-details">Para celulares potentes. Más detalle y mejor imagen.</p>

              <div class="badge-wrapper">
                <span class="status-badge prep">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="badge-check">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  En preparación
                </span>
              </div>

              <button type="button" class="btn-action disabled" disabled>
                No disponible aún
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- SECCIÓN LIBROS -->
      <section class="books-section">
        <div class="books-header">
          <h2 class="experiences-title">Libros</h2>
          <button type="button" class="btn-refresh" @click="cargarLibros" :disabled="loadingLibros">
            {{ loadingLibros ? 'Cargando...' : 'Actualizar libros' }}
          </button>
        </div>

        <div v-if="librosError" class="alert">
          {{ librosError }}
        </div>

        <div v-else-if="libroList.length > 0" class="books-grid">
          <article v-for="libro in libroList" :key="libro.id" class="book-card">
            <div class="book-pill-id">{{ libro.id }}</div>
            <h3 class="book-title">{{ libro.titulo }}</h3>
            <p class="book-author">Por: <strong>{{ libro.autor || 'Autor no especificado' }}</strong></p>
            <p class="book-desc">{{ libro.descripcion || 'Sin descripción' }}</p>
            <div v-if="libro.mensaje_prestamo" class="loan-message">
              <span>{{ libro.mensaje_prestamo }}</span>
            </div>
          </article>
        </div>

        <div v-else class="empty-books-box">
          <p>No hay libros registrados aún en la tabla <code>fichas_libros</code>.</p>
        </div>
      </section>
    </main>
  </div>
</template>
