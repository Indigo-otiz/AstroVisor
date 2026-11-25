<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useEditorCatalogo } from '../composables/useEditorCatalogo.js'
import { alternativaPortada } from '../services/librosDemoService.js'
import ConstellationArt from '../components/ConstellationArt.vue'

const router = useRouter()
const route = useRoute()
const { userDisplayName, username, signOut, token, invalidarSesion } = useAuth()
const esModoDemo = computed(() => route.query.modo === 'demo' || !token.value)

const tabActiva = ref('libros') // 'libros' | 'constelaciones'
const busquedaLibro = ref('')
const busquedaConstelacion = ref('')

const { catalogo, seleccion, borrador, cargando, guardando, error, mensaje, conflicto, necesitaRecarga,
  libroActual, recorridoActual, cargar, seleccionarLibro, seleccionarRecorrido, cancelarEdicion, guardar, cancelarPeticiones,
  hayBorradorPendiente, recuperarBorrador, descartarBorradorPendiente, nuevoLibro, previsualizar, previsualizacion, previsualizando, subirImagen, puedeEditarTexto, requierePreview } = useEditorCatalogo({
  obtenerToken: () => token.value,
  obtenerUsuario: () => username.value || (esModoDemo.value ? 'demo-admin' : ''),
  alExpirarSesion: () => {
    if (esModoDemo.value) return
    invalidarSesion()
    void router.replace({ name: 'admin-acceso' })
  },
  esModoDemo: () => esModoDemo.value,
})

async function handleLogout() {
  descartarBorradorPendiente()
  if (!esModoDemo.value) {
    await signOut()
  }
  router.push('/admin/acceso')
}

const nombreRecorrido = (id) => catalogo.value?.recorridos.find((r) => r.id === id)?.titulo ?? id
const constelacionesLibro = (id) => catalogo.value?.recorridos.filter((r) => r.libroRefs.some((v) => v.libroId === id)) ?? []

const librosFiltrados = computed(() => {
  const lista = catalogo.value?.libros || []
  const q = busquedaLibro.value.trim().toLowerCase()
  if (!q) return lista
  return lista.filter((l) => {
    const titulo = (l.titulo || '').toLowerCase()
    const autor = (l.autor || '').toLowerCase()
    const id = (l.id || '').toLowerCase()
    const constelaciones = constelacionesLibro(l.id).map((r) => r.titulo.toLowerCase()).join(' ')
    return titulo.includes(q) || autor.includes(q) || id.includes(q) || constelaciones.includes(q)
  })
})

const constelacionesFiltradas = computed(() => {
  const lista = catalogo.value?.recorridos || []
  const q = busquedaConstelacion.value.trim().toLowerCase()
  if (!q) return lista
  return lista.filter((r) => {
    const titulo = (r.titulo || '').toLowerCase()
    const resumen = (r.resumen || '').toLowerCase()
    const id = (r.id || '').toLowerCase()
    return titulo.includes(q) || resumen.includes(q) || id.includes(q)
  })
})

async function guardarYCentrar() {
  await guardar(); await nextTick()
  document.querySelector('#editor-resultados')?.focus()
}

async function cancelarYCentrar() {
  const anterior = seleccion.value
  cancelarEdicion(); await nextTick()
  if (anterior) document.querySelector(anterior.tipo === 'nuevo' ? '#nuevo-libro' : `[data-editar="${anterior.tipo}-${anterior.id}"]`)?.focus()
}

watch(seleccion, async (actual) => {
  if (actual) {
    if (actual.tipo === 'recorrido') {
      tabActiva.value = 'constelaciones'
    } else {
      tabActiva.value = 'libros'
    }
    await nextTick()
    document.querySelector('#editor-heading')?.focus()
  }
})

const mostrarBotonArriba = ref(false)

function handleScroll() {
  mostrarBotonArriba.value = window.scrollY > 350
}

function volverArriba() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cambiarTab(tab) {
  tabActiva.value = tab
}

async function registrarLibroDirecto() {
  tabActiva.value = 'libros'
  nuevoLibro()
  await nextTick()
  const formHeading = document.getElementById('editor-heading')
  if (formHeading) {
    formHeading.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const inputId = document.getElementById('nuevo-id')
  if (inputId) {
    inputId.focus()
  }
}

function handleSeleccionarLibro(id) {
  tabActiva.value = 'libros'
  seleccionarLibro(id)
}

function handleSeleccionarRecorrido(id) {
  tabActiva.value = 'constelaciones'
  seleccionarRecorrido(id)
}

onMounted(() => {
  cargar()
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  cancelarPeticiones()
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="admin-dashboard-wrapper">
    <!-- BARRA SUPERIOR DEL PANEL -->
    <header class="admin-topbar">
      <div class="topbar-left">
        <RouterLink to="/" class="topbar-brand">
          <svg class="topbar-star" viewBox="0 0 24 24" fill="none">
            <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" fill="#38bdf8" />
          </svg>
          <span>AstroVisor</span>
        </RouterLink>
        <span class="admin-badge-portal">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="badge-lock">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          Administración
        </span>
      </div>

      <nav class="topbar-right">
        <RouterLink to="/explorar" class="btn-preview-public" title="Ver catálogo público de constelaciones">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon-sm">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>Vista pública</span>
        </RouterLink>
        <button type="button" class="btn-logout" @click="handleLogout">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="logout-icon">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>{{ esModoDemo ? 'Salir de demo' : 'Cerrar sesión' }}</span>
        </button>
      </nav>
    </header>

    <!-- AVISO DE MODO DEMOSTRACIÓN -->
    <aside v-if="esModoDemo" class="admin-demo-alert-bar" aria-label="Aviso de demostración" role="status">
      <div class="container demo-alert-content">
        <div class="demo-alert-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="demo-icon-mini" aria-hidden="true">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
          <span>Modo Demostración</span>
        </div>
        <p class="demo-alert-text">
          Estás navegando en vista previa interactiva. Los cambios se mantienen en tu navegador y no alteran la base de datos de la biblioteca.
        </p>
        <RouterLink to="/admin/acceso" class="demo-alert-exit">Acceso oficial</RouterLink>
      </div>
    </aside>

    <!-- BANNER HERO CÓSMICO CON PROFUNDIDAD Y ACENTOS CÁLIDOS -->
    <section class="admin-hero-banner">
      <div class="banner-nebula-glow" aria-hidden="true"></div>
      <div class="banner-warm-accent" aria-hidden="true"></div>
      <svg class="banner-decor-svg" viewBox="0 0 1100 200" preserveAspectRatio="none" aria-hidden="true">
        <circle cx="160" cy="45" r="1.5" fill="#bae6fd" opacity="0.6" />
        <circle cx="430" cy="120" r="1.5" fill="#bae6fd" opacity="0.4" />
        <circle cx="710" cy="40" r="2" fill="#bae6fd" opacity="0.7" />
        <circle cx="880" cy="130" r="1.5" fill="#bae6fd" opacity="0.5" />
        <circle cx="1020" cy="50" r="1.5" fill="#bae6fd" opacity="0.4" />
        <g stroke="#38bdf8" stroke-width="1.2" opacity="0.3" fill="none">
          <polyline points="910,105 950,70 990,90 1040,55" />
          <circle cx="910" cy="105" r="3" fill="#38bdf8" />
          <circle cx="950" cy="70" r="3" fill="#38bdf8" />
          <circle cx="990" cy="90" r="3" fill="#38bdf8" />
          <circle cx="1040" cy="55" r="3" fill="#38bdf8" />
        </g>
      </svg>

      <div class="banner-content container">
        <h1 class="welcome-heading">
          Gestión de Biblioteca y Constelaciones
        </h1>
        <p class="hero-subheading">
          Catálogo digital de libros astronómicos y recorridos del cielo nocturno.
        </p>
      </div>
    </section>

    <!-- BARRA DE PESTAÑAS (CAMBIO DE PANTALLA INMEDIATO) -->
    <nav class="admin-quick-nav" aria-label="Vistas del panel de administración">
      <div class="quick-nav-inner container">
        <div class="view-tabs-group" role="tablist">
          <button
            type="button"
            role="tab"
            :aria-selected="tabActiva === 'libros'"
            class="view-tab-btn"
            :class="{ active: tabActiva === 'libros' }"
            @click="cambiarTab('libros')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tab-icon-svg">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            <span>Editar libros</span>
            <span v-if="catalogo?.libros" class="tab-count-badge">{{ catalogo.libros.length }}</span>
          </button>

          <button
            type="button"
            role="tab"
            :aria-selected="tabActiva === 'constelaciones'"
            class="view-tab-btn"
            :class="{ active: tabActiva === 'constelaciones' }"
            @click="cambiarTab('constelaciones')"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="tab-icon-svg">
              <circle cx="12" cy="12" r="2" />
              <circle cx="6" cy="6" r="1.5" />
              <circle cx="18" cy="7" r="1.5" />
              <circle cx="17" cy="17" r="1.5" />
              <circle cx="7" cy="16" r="1.5" />
              <path d="M6 6l6 6m0 0l6-5m-6 5l5 5m-5-5l-5 4" opacity="0.5" />
            </svg>
            <span>Constelaciones</span>
            <span v-if="catalogo?.recorridos" class="tab-count-badge">{{ catalogo.recorridos.length }}</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- CUERPO PRINCIPAL DEL PANEL -->
    <main class="container admin-body">
      <!-- MENSAJES Y NOTIFICACIONES GLOBALES -->
      <div id="editor-resultados" tabindex="-1">
        <p v-if="error" class="alert-box-error" role="alert">{{ error }}</p>
        <div v-if="mensaje" class="alert-box-success" role="status">
          <svg class="success-icon-check" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="success-msg-text">{{ mensaje }}</span>
          <button type="button" class="btn-dismiss-msg" @click="mensaje = ''" title="Cerrar aviso" aria-label="Cerrar aviso">✕</button>
        </div>
      </div>

      <div v-if="cargando" class="loading-state-box" role="status">
        <div class="loading-spinner-mini"></div>
        <span>Consultando el catálogo actualizado…</span>
      </div>

      <!-- ======================================================== -->
      <!-- PANTALLA 1: EDITAR LOS LIBROS                            -->
      <!-- ======================================================== -->
      <section
        v-show="tabActiva === 'libros'"
        class="admin-tab-screen"
        aria-labelledby="libros-screen-title"
      >
        <div class="screen-header">
          <div class="screen-title-group">
            <h2 id="libros-screen-title" class="screen-main-title">Editar los libros</h2>
            <span class="badge-screen-pill">{{ catalogo?.libros?.length || 0 }} libros en acervo</span>
          </div>
        </div>

        <p class="section-guidance-text">
          Selecciona un libro para modificar sus datos bibliográficos, portada o motivos de lectura vinculados a cada constelación.
        </p>

        <!-- BARRA DE BÚSQUEDA Y ACCIONES DE LIBROS (INCLUYE REGISTRAR LIBRO AQUÍ) -->
        <div class="screen-toolbar">
          <div class="search-box-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon-svg" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              v-model="busquedaLibro"
              type="search"
              placeholder="Buscar libro por título, autor o constelación…"
              class="search-text-input"
              aria-label="Buscar libro"
            />
            <button
              v-if="busquedaLibro"
              type="button"
              class="btn-clear-search"
              @click="busquedaLibro = ''"
              title="Borrar búsqueda"
            >
              ✕
            </button>
          </div>

          <div class="toolbar-actions-group">
            <button
              type="button"
              class="btn-primary-action"
              :disabled="!catalogo || cargando || guardando || Boolean(borrador) || necesitaRecarga"
              @click="registrarLibroDirecto"
              title="Abrir formulario para registrar un nuevo libro"
            >
              <span>Registrar libro</span>
            </button>
            <button
              type="button"
              class="btn-secondary-refresh"
              @click="cargar()"
              :disabled="cargando || guardando"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="refresh-icon-mini">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              <span>{{ cargando ? 'Cargando...' : borrador ? 'Recargar y descartar' : 'Actualizar' }}</span>
            </button>
          </div>
        </div>

        <div v-if="busquedaLibro" class="search-results-indicator">
          Mostrando {{ librosFiltrados.length }} de {{ catalogo?.libros?.length || 0 }} libros
        </div>

        <div v-if="hayBorradorPendiente" role="status" class="draft-notice-card">
          <p>Hay una edición pendiente de la sesión anterior en la memoria de esta pestaña.</p>
          <div class="draft-notice-actions">
            <button type="button" class="btn-draft-action" :disabled="!catalogo || cargando || guardando || Boolean(borrador)" @click="recuperarBorrador">
              Recuperar borrador
            </button>
            <button type="button" class="btn-draft-action secondary" @click="descartarBorradorPendiente">
              Descartar borrador
            </button>
          </div>
        </div>

        <!-- FORMULARIO DE EDICIÓN / REGISTRO DE LIBRO -->
        <form
          v-if="borrador && seleccion?.tipo !== 'recorrido'"
          class="editor-card-container"
          @submit.prevent="guardarYCentrar"
        >
          <div class="editor-card-header">
            <h3 id="editor-heading" tabindex="-1">
              {{ seleccion.tipo === 'nuevo' ? 'Registrar nuevo libro' : `Editar: ${libroActual?.titulo || ''}` }}
            </h3>
            <button type="button" class="btn-close-editor" @click="cancelarYCentrar" title="Cerrar edición">✕</button>
          </div>

          <fieldset :disabled="guardando || cargando" class="editor-fieldset">
            <template v-if="seleccion.tipo === 'nuevo'">
              <div class="field-item">
                <label for="nuevo-id">Identificador único (minúsculas, números y guiones)</label>
                <input id="nuevo-id" v-model="borrador.id" required maxlength="100" pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="ej. estrellas-noche" class="form-input" />
              </div>
              <div class="field-grid-2">
                <div class="field-item">
                  <label for="nuevo-titulo">Título del libro</label>
                  <input id="nuevo-titulo" v-model="borrador.titulo" required maxlength="200" placeholder="Título completo de la obra" class="form-input" />
                </div>
                <div class="field-item">
                  <label for="nuevo-autor">Autor(a)</label>
                  <input id="nuevo-autor" v-model="borrador.autor" required maxlength="200" placeholder="Nombre del autor o autora" class="form-input" />
                </div>
              </div>
            </template>

            <template v-else-if="libroActual">
              <div class="field-grid-2">
                <div class="field-item">
                  <label for="editor-titulo">Título</label>
                  <input id="editor-titulo" v-model="borrador.titulo" :readonly="!puedeEditarTexto" required maxlength="200" class="form-input" />
                </div>
                <div class="field-item">
                  <label for="editor-autor">Autor(a)</label>
                  <input id="editor-autor" v-model="borrador.autor" :readonly="!puedeEditarTexto" required maxlength="200" class="form-input" />
                </div>
              </div>
            </template>

            <!-- TIPO DE PORTADA -->
            <div class="field-item">
              <label for="tipo-portada">Tipo de portada</label>
              <select id="tipo-portada" v-model="borrador.tipoPortada" class="form-select">
                <option v-if="libroActual && !libroActual.portada" value="heredada">Conservar SVG ilustrativo actual</option>
                <option v-if="libroActual?.portada?.tipo === 'fotografia-ejemplar'" value="fotografia-ejemplar">Conservar fotografía del ejemplar</option>
                <option value="ilustrativa">Ilustrativa automática</option>
                <option value="imagen-autorizada">Subir imagen propia autorizada (PNG/JPEG)</option>
              </select>
            </div>

            <template v-if="borrador.tipoPortada === 'ilustrativa'">
              <div class="field-grid-2">
                <div class="field-item">
                  <label for="nueva-plantilla">Diseño de plantilla</label>
                  <select id="nueva-plantilla" v-model="borrador.portada.plantilla" class="form-select">
                    <option value="cielo">Cielo — constelación abierta</option>
                    <option value="guia">Guía — recorrido de estrellas</option>
                    <option value="relatos">Relatos — trama estelar</option>
                  </select>
                </div>
                <div class="field-item">
                  <label for="nueva-paleta">Paleta cromática</label>
                  <select id="nueva-paleta" v-model="borrador.portada.paleta" class="form-select">
                    <option value="azul">Azul noche</option>
                    <option value="verde">Verde profundo</option>
                    <option value="violeta">Violeta</option>
                  </select>
                </div>
              </div>
              <button type="button" class="btn-subaction" :disabled="previsualizando || conflicto" @click="previsualizar">
                {{ previsualizando ? 'Generando portada…' : 'Previsualizar portada' }}
              </button>
            </template>

            <template v-if="borrador.tipoPortada === 'imagen-autorizada'">
              <div class="field-item">
                <label for="archivo-portada">Seleccionar imagen (PNG o JPG hasta 2 MB)</label>
                <input id="archivo-portada" type="file" accept="image/png,image/jpeg" :disabled="previsualizando || conflicto" class="form-input-file" @change="subirImagen($event.target.files?.[0])" />
              </div>
              <div class="field-grid-2">
                <div class="field-item">
                  <label for="imagen-procedencia">Procedencia de la imagen</label>
                  <textarea id="imagen-procedencia" v-model="borrador.portada.procedencia" required maxlength="1000" rows="2" class="form-textarea"></textarea>
                </div>
                <div class="field-item">
                  <label for="imagen-permiso">Permiso de uso</label>
                  <textarea id="imagen-permiso" v-model="borrador.portada.permiso" required maxlength="1000" rows="2" class="form-textarea"></textarea>
                </div>
              </div>
              <div class="field-item">
                <label for="imagen-alternativa">Texto alternativo (accesibilidad)</label>
                <input id="imagen-alternativa" v-model="borrador.portada.textoAlternativo" required maxlength="1000" class="form-input" />
              </div>
            </template>

            <figure v-if="previsualizacion" class="portada-preview-box">
              <img :src="previsualizacion" :alt="borrador.tipoPortada === 'imagen-autorizada' ? borrador.portada.textoAlternativo || 'Previsualización de imagen preparada' : `Previsualización ilustrativa de ${borrador.titulo}`" width="160" height="230" />
              <figcaption>Previsualización de la portada</figcaption>
            </figure>

            <div class="field-grid-2">
              <div class="field-item">
                <label for="editor-anio">Año de publicación (opcional)</label>
                <input id="editor-anio" v-model.number="borrador.anio" type="number" min="1" max="9999" class="form-input" />
              </div>
              <div class="field-item">
                <label for="editor-enlace">Enlace público de la obra (HTTPS)</label>
                <input id="editor-enlace" v-model="borrador.enlacePublico" type="url" :required="borrador.tipoPortada !== 'fotografia-ejemplar'" maxlength="2048" pattern="https://.+" class="form-input" />
              </div>
            </div>

            <!-- RELACIONES CON CONSTELACIONES -->
            <div class="relations-container">
              <h4 class="relations-title">Asociación y motivos de lectura con constelaciones</h4>
              <div v-for="relacion in borrador.relaciones" :key="relacion.constelacionId" class="relation-card">
                <label v-if="seleccion.tipo === 'nuevo'" class="relation-checkbox-label">
                  <input v-model="relacion.seleccionada" type="checkbox" class="relation-check" />
                  <span>Asociar con <strong>{{ nombreRecorrido(relacion.constelacionId) }}</strong></span>
                </label>
                <template v-if="seleccion.tipo !== 'nuevo' || relacion.seleccionada">
                  <label :for="`motivo-${relacion.constelacionId}`" class="relation-label">
                    Motivo para <strong>{{ nombreRecorrido(relacion.constelacionId) }}</strong>
                  </label>
                  <textarea :id="`motivo-${relacion.constelacionId}`" v-model="relacion.motivo" required maxlength="1000" rows="2" class="form-textarea"></textarea>
                </template>
              </div>
            </div>

            <div class="form-actions-bar">
              <button
                type="submit"
                class="btn-save-confirm"
                :disabled="conflicto || necesitaRecarga || previsualizando || (requierePreview && !previsualizacion) || (borrador.tipoPortada === 'imagen-autorizada' && !borrador.portada.recursoId)"
              >
                {{ guardando ? 'Guardando…' : seleccion.tipo === 'nuevo' ? 'Confirmar registro' : 'Guardar cambios' }}
              </button>
              <button type="button" class="btn-cancel-edit" @click="cancelarYCentrar">
                Cancelar edición
              </button>
            </div>
          </fieldset>
        </form>

        <!-- CUADRÍCULA DE TARJETAS DE LIBROS (18 LIBROS COMPLETOS) -->
        <div v-if="librosFiltrados.length" class="cards-grid-admin">
          <article v-for="libro in librosFiltrados" :key="libro.id" class="card-item-admin">
            <div class="card-book-media">
              <img class="book-cover-img" :src="libro.portadaIlustrativa" :alt="alternativaPortada(libro)" width="120" height="170" loading="lazy" />
            </div>
            <div class="card-body-admin">
              <div class="card-id-pill">{{ libro.id }}</div>
              <h3 class="card-title-text">{{ libro.titulo }}</h3>
              <p class="card-meta-author">Por <strong>{{ libro.autor }}</strong></p>
              <p class="card-meta-connections">
                Vinculado a: <span>{{ constelacionesLibro(libro.id).map((r) => r.titulo).join(', ') || 'Sin vínculo' }}</span>
              </p>
              <div class="card-footer-action">
                <button
                  type="button"
                  class="btn-card-edit"
                  :data-editar="`libro-${libro.id}`"
                  :disabled="cargando || guardando || Boolean(borrador) || necesitaRecarga"
                  @click="handleSeleccionarLibro(libro.id)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="edit-btn-icon">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  <span>Editar</span>
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-else-if="catalogo && !cargando" class="empty-state-card">
          <p v-if="busquedaLibro">No se encontraron libros que coincidan con «{{ busquedaLibro }}».</p>
          <p v-else>No hay libros registrados en el catálogo consultado.</p>
        </div>
      </section>

      <!-- ======================================================== -->
      <!-- PANTALLA 2: CONSTELACIONES                               -->
      <!-- ======================================================== -->
      <section
        v-show="tabActiva === 'constelaciones'"
        class="admin-tab-screen"
        aria-labelledby="constelaciones-screen-title"
      >
        <div class="screen-header">
          <div class="screen-title-group">
            <h2 id="constelaciones-screen-title" class="screen-main-title">Constelaciones</h2>
            <span class="badge-screen-pill">{{ catalogo?.recorridos?.length || 0 }} figuras estelares</span>
          </div>
        </div>

        <p class="section-guidance-text">
          Edita los textos de ayuda, descripción y método de reconocimiento de cada constelación visible en las experiencias 2D y 3D.
        </p>

        <!-- BARRA DE BÚSQUEDA Y ACCIONES DE CONSTELACIONES -->
        <div class="screen-toolbar">
          <div class="search-box-wrapper">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="search-icon-svg" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              v-model="busquedaConstelacion"
              type="search"
              placeholder="Buscar constelación por nombre o descripción…"
              class="search-text-input"
              aria-label="Buscar constelación"
            />
            <button
              v-if="busquedaConstelacion"
              type="button"
              class="btn-clear-search"
              @click="busquedaConstelacion = ''"
              title="Borrar búsqueda"
            >
              ✕
            </button>
          </div>

          <div class="toolbar-actions-group">
            <button
              type="button"
              class="btn-secondary-refresh"
              @click="cargar()"
              :disabled="cargando || guardando"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="refresh-icon-mini">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              <span>{{ cargando ? 'Cargando...' : borrador ? 'Recargar y descartar' : 'Actualizar' }}</span>
            </button>
          </div>
        </div>

        <div v-if="busquedaConstelacion" class="search-results-indicator">
          Mostrando {{ constelacionesFiltradas.length }} de {{ catalogo?.recorridos?.length || 0 }} constelaciones
        </div>

        <!-- FORMULARIO DE EDICIÓN DE CONSTELACIÓN -->
        <form
          v-if="borrador && seleccion?.tipo === 'recorrido'"
          class="editor-card-container"
          @submit.prevent="guardarYCentrar"
        >
          <div class="editor-card-header">
            <h3 id="editor-heading" tabindex="-1">
              Editar constelación: {{ recorridoActual?.titulo || '' }}
            </h3>
            <button type="button" class="btn-close-editor" @click="cancelarYCentrar" title="Cerrar edición">✕</button>
          </div>

          <fieldset :disabled="guardando || cargando" class="editor-fieldset">
            <div class="field-item">
              <label for="editor-resumen">Resumen introductorio</label>
              <textarea id="editor-resumen" v-model="borrador.resumen" required maxlength="1000" rows="3" class="form-textarea"></textarea>
            </div>
            <div class="field-item">
              <label for="editor-reconocer">Cómo reconocerla en el firmamento</label>
              <textarea id="editor-reconocer" v-model="borrador.comoReconocerla" required maxlength="12000" rows="5" class="form-textarea"></textarea>
            </div>
            <p class="form-disclaimer-note">
              La narración y el audio conservan la autoría y los permisos declarados para la demostración.
            </p>

            <div class="form-actions-bar">
              <button
                type="submit"
                class="btn-save-confirm"
                :disabled="conflicto || necesitaRecarga"
              >
                {{ guardando ? 'Guardando…' : 'Guardar cambios' }}
              </button>
              <button type="button" class="btn-cancel-edit" @click="cancelarYCentrar">
                Cancelar edición
              </button>
            </div>
          </fieldset>
        </form>

        <!-- CUADRÍCULA DE TARJETAS DE CONSTELACIONES CON ARTE CELESTE RESPLANDECIENTE -->
        <div v-if="constelacionesFiltradas.length" class="cards-grid-admin">
          <article v-for="r in constelacionesFiltradas" :key="r.id" class="card-item-admin constellation-card-item">
            <!-- Ventana celestial idéntica a la vista pública del cliente -->
            <div class="card-constellation-media">
              <ConstellationArt :id="r.id" />
            </div>

            <div class="card-body-admin">
              <div class="card-id-pill">{{ r.id }}</div>
              <h3 class="card-title-text">{{ r.titulo }}</h3>
              <p class="card-meta-connections">
                Libros vinculados: <span>{{ (r.libroRefs || []).length }}</span>
              </p>
              <p class="card-desc-text">{{ r.resumen }}</p>

              <div class="card-footer-action">
                <button
                  type="button"
                  class="btn-card-edit"
                  :data-editar="`recorrido-${r.id}`"
                  :disabled="cargando || guardando || Boolean(borrador) || necesitaRecarga"
                  @click="handleSeleccionarRecorrido(r.id)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="edit-btn-icon">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                  <span>Editar</span>
                </button>
              </div>
            </div>
          </article>
        </div>

        <div v-else-if="catalogo && !cargando" class="empty-state-card">
          <p v-if="busquedaConstelacion">No se encontraron constelaciones que coincidan con «{{ busquedaConstelacion }}».</p>
          <p v-else>No hay constelaciones registradas en el catálogo consultado.</p>
        </div>
      </section>
    </main>

    <!-- BOTÓN FLOTANTE VOLVER ARRIBA -->
    <button
      v-if="mostrarBotonArriba"
      type="button"
      class="btn-volver-arriba"
      @click="volverArriba"
      aria-label="Volver al inicio del panel"
      title="Volver arriba"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="icono-arriba">
        <polyline points="18 15 12 9 6 15" />
      </svg>
      <span>Subir</span>
    </button>
  </div>
</template>

<style scoped>
/* CONTENEDOR GENERAL */
.admin-dashboard-wrapper {
  background: #f4f6fb;
  min-height: 100vh;
  width: 100%;
  font-family: system-ui, -apple-system, sans-serif;
  color: #15243c;
}

/* TOPBAR */
.admin-topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.85rem 2rem;
  background: #081124;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.topbar-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 1.25rem;
  font-weight: 750;
  color: #f8fafc;
  text-decoration: none;
}

.topbar-star {
  width: 22px;
  height: 22px;
}

.admin-badge-portal {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: rgba(56, 189, 248, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.32);
  color: #7dd3fc;
  font-size: 0.76rem;
  font-weight: 650;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
}

.badge-lock {
  width: 13px;
  height: 13px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.btn-preview-public {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  border-radius: 0.45rem;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: #cbd5e1;
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-preview-public:hover {
  background: rgba(56, 189, 248, 0.15);
  border-color: rgba(56, 189, 248, 0.4);
  color: #ffffff;
}

.btn-icon-sm {
  width: 15px;
  height: 15px;
}

.btn-logout {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.85rem;
  background: transparent;
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #fca5a5;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 0.45rem;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #ffffff;
}

.logout-icon {
  width: 15px;
  height: 15px;
}

/* HERO BANNER AZUL CÓSMICO PROFUNDO CON DESTELLOS Y CALIDEZ */
.admin-hero-banner {
  background: radial-gradient(circle at 50% 25%, #0e1c3e 0%, #060b18 100%);
  color: #ffffff;
  padding: 2.2rem 0 2.5rem;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.banner-nebula-glow {
  position: absolute;
  top: -40px;
  right: 12%;
  width: 360px;
  height: 220px;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.18) 0%, transparent 70%);
  pointer-events: none;
}

.banner-warm-accent {
  position: absolute;
  bottom: -30px;
  left: 8%;
  width: 280px;
  height: 160px;
  background: radial-gradient(circle, rgba(202, 160, 101, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.banner-decor-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.banner-content {
  position: relative;
  z-index: 2;
  max-width: 1100px;
  margin-inline: auto;
  padding-inline: 1.5rem;
}

.welcome-heading {
  font-family: Georgia, serif;
  font-size: 2.1rem;
  font-weight: 700;
  margin: 0 0 0.4rem;
  color: #ffffff;
  letter-spacing: -0.015em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.hero-subheading {
  font-size: 0.98rem;
  color: #94a3b8;
  margin: 0;
  max-width: 650px;
  line-height: 1.45;
}

.status-live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 6px #22c55e;
}

/* SUBNAV DE PESTAÑAS (PANTALLAS) */
.admin-quick-nav {
  position: sticky;
  top: 0;
  z-index: 80;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 4px 14px rgba(11, 21, 43, 0.05);
  padding: 0.65rem 0;
}

.quick-nav-inner {
  max-width: 1100px;
  margin-inline: auto;
  padding-inline: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.view-tabs-group {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #edf2f7;
  padding: 0.28rem;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
}

.view-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 1.15rem;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 650;
  color: #475569;
  background: transparent;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.18s ease;
  min-height: 38px;
}

.view-tab-btn:hover {
  color: #0f203b;
}

.view-tab-btn.active {
  background: #0f203b;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(15, 32, 59, 0.25);
}

.tab-icon-svg {
  width: 17px;
  height: 17px;
}

.tab-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 0.4rem;
  border-radius: 9999px;
  font-size: 0.72rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.22);
  color: #ffffff;
}

.view-tab-btn:not(.active) .tab-count-badge {
  background: #cbd5e1;
  color: #1e293b;
}

/* TOOLBAR CON BÚSQUEDA Y ACCIONES */
.screen-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.3rem;
  background: #ffffff;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(15, 31, 56, 0.03);
}

.search-box-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 260px;
}

.search-icon-svg {
  position: absolute;
  left: 0.85rem;
  width: 16px;
  height: 16px;
  color: #64748b;
  pointer-events: none;
}

.search-text-input {
  width: 100%;
  padding: 0.55rem 2.2rem 0.55rem 2.4rem;
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-family: inherit;
  font-size: 0.88rem;
  color: #0f1f38;
  transition: all 0.15s ease;
}

.search-text-input:focus {
  outline: none;
  background: #ffffff;
  border-color: #173868;
  box-shadow: 0 0 0 3px rgba(23, 56, 104, 0.12);
}

.btn-clear-search {
  position: absolute;
  right: 0.6rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 50%;
}

.btn-clear-search:hover {
  color: #0f1f38;
}

.toolbar-actions-group {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.btn-primary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.52rem 1.15rem;
  font-family: inherit;
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
  background: #173f75;
  border: 1px solid #102a50;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.18s ease;
  min-height: 38px;
  box-shadow: 0 2px 6px rgba(23, 63, 117, 0.25);
  white-space: nowrap;
}

.btn-primary-action:hover:not(:disabled) {
  background: #0f2b54;
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(23, 63, 117, 0.35);
}

.btn-primary-action:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.search-results-indicator {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
  margin-top: -0.6rem;
  margin-bottom: 1.2rem;
  padding-left: 0.2rem;
}

/* CUERPO PRINCIPAL */
.admin-body {
  max-width: 1100px;
  margin-inline: auto;
  padding: 1.8rem 1.5rem 4rem;
}

.admin-tab-screen {
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.screen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 0.4rem;
}

.screen-title-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.screen-main-title {
  font-family: Georgia, serif;
  font-size: 1.85rem;
  color: #0b152b;
  margin: 0;
}

.badge-screen-pill {
  background: #e0e9f6;
  color: #173868;
  font-size: 0.78rem;
  font-weight: 650;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  border: 1px solid #cbdbee;
}

.section-guidance-text {
  font-size: 0.92rem;
  color: #475569;
  margin: 0 0 1.2rem;
  max-width: 780px;
}

.btn-secondary-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.48rem 0.85rem;
  background: #ffffff;
  color: #334155;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-secondary-refresh:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f1f38;
}

.refresh-icon-mini {
  width: 14px;
  height: 14px;
}

/* ALERTAS Y MENSAJES */
.alert-box-error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #f87171;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.88rem;
  margin-bottom: 1.2rem;
}

.alert-box-success {
  background: #f0fdf4;
  color: #14532d;
  border: 1px solid #bbf7d0;
  padding: 0.75rem 1rem;
  border-radius: 0.6rem;
  font-size: 0.92rem;
  font-weight: 550;
  margin-bottom: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  box-shadow: 0 2px 8px rgba(22, 101, 52, 0.08);
}

.success-icon-check {
  width: 20px;
  height: 20px;
  color: #16a34a;
  flex-shrink: 0;
}

.success-msg-text {
  flex: 1;
}

.btn-dismiss-msg {
  background: none;
  border: none;
  color: #166534;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.15s ease;
}

.btn-dismiss-msg:hover {
  opacity: 1;
}

.loading-state-box {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1rem;
  background: #e2e8f0;
  border-radius: 0.5rem;
  color: #334155;
  font-size: 0.88rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
}

.loading-spinner-mini {
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e1;
  border-top-color: #173868;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* CUADRÍCULA DE TARJETAS MODERNA Y ELEGANTE */
.cards-grid-admin {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 1.35rem;
}

.card-item-admin {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.95rem;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(15, 31, 56, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease;
}

.card-item-admin:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(15, 31, 56, 0.1);
  border-color: #cbd5e1;
}

/* MEDIA DE LIBRO */
.card-book-media {
  background: radial-gradient(circle at 50% 50%, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.4rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 190px;
  border-bottom: 1px solid #e2e8f0;
}

.book-cover-img {
  display: block;
  max-height: 160px;
  width: auto;
  object-fit: contain;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.18), 0 2px 6px rgba(15, 23, 42, 0.1);
  border-radius: 0.35rem;
  transition: transform 0.2s ease;
}

.card-item-admin:hover .book-cover-img {
  transform: scale(1.03);
}

/* MEDIA DE CONSTELACIÓN (ARTE CELESTE IDÉNTICO A VISTA PÚBLICA) */
.card-constellation-media {
  position: relative;
  height: 190px;
  width: 100%;
  background: radial-gradient(circle at 50% 45%, #0e1b3d 0%, #060b18 100%);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.card-constellation-media :deep(.constellation-art) {
  width: 100%;
  height: 100%;
  color: #38bdf8;
  transition: transform 0.35s ease;
}

.card-item-admin:hover .card-constellation-media :deep(.constellation-art) {
  transform: scale(1.05);
}

.card-constellation-media :deep(.constellation-art polyline) {
  stroke: #38bdf8 !important;
  stroke-width: 2.2px !important;
  opacity: 1 !important;
  filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.85));
}

.card-constellation-media :deep(.constellation-art circle) {
  fill: #ffffff !important;
  stroke: #38bdf8 !important;
  stroke-width: 1.5px !important;
  opacity: 1 !important;
  filter: drop-shadow(0 0 6px rgba(56, 189, 248, 0.9));
}

.card-constellation-media :deep(.constellation-art g[opacity=".25"] circle) {
  fill: rgba(255, 255, 255, 0.5) !important;
  stroke: none !important;
  filter: none !important;
}

/* CUERPO DE TARJETA */
.card-body-admin {
  padding: 1.25rem 1.2rem;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.card-id-pill {
  align-self: flex-start;
  background: #f1f5f9;
  color: #475569;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  margin-bottom: 0.5rem;
}

.card-title-text {
  font-family: Georgia, serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #0f1f38;
  margin: 0 0 0.3rem;
  line-height: 1.3;
}

.card-meta-author {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0 0 0.5rem;
}

.card-meta-author strong {
  color: #1e293b;
}

.card-meta-connections {
  font-size: 0.82rem;
  color: #475569;
  margin: 0 0 0.8rem;
  line-height: 1.4;
}

.card-meta-connections span {
  font-weight: 600;
  color: #173868;
}

.card-desc-text {
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.45;
  margin: 0 0 1rem;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer-action {
  margin-top: auto;
  padding-top: 0.8rem;
  border-top: 1px solid #f1f5f9;
}

/* BOTÓN DE EDITAR SENCILLO ("Editar") */
.btn-card-edit {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.6rem 0.9rem;
  background: #1e293b;
  color: #ffffff;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  font-size: 0.88rem;
  font-weight: 650;
  cursor: pointer;
  transition: all 0.18s ease;
}

.btn-card-edit:hover:not(:disabled) {
  background: #0f172a;
  border-color: #475569;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25);
}

.btn-card-edit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

.edit-btn-icon {
  width: 15px;
  height: 15px;
}

/* FORMULARIO DE EDICIÓN CARD CONTENEDOR */
.editor-card-container {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 1rem;
  padding: 1.5rem 1.6rem;
  box-shadow: 0 12px 32px rgba(15, 31, 56, 0.08);
  margin-bottom: 2rem;
  animation: fadeIn 0.2s ease;
}

.editor-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.9rem;
  margin-bottom: 1.2rem;
}

.editor-card-header h3 {
  font-family: Georgia, serif;
  font-size: 1.35rem;
  color: #0f1f38;
  margin: 0;
}

.btn-close-editor {
  background: transparent;
  border: none;
  font-size: 1.25rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.35rem;
}

.btn-close-editor:hover {
  background: #f1f5f9;
  color: #0f1f38;
}

.editor-fieldset {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.field-item label {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e293b;
}

.field-grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-family: inherit;
  color: #0f1f38;
  background: #ffffff;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #173868;
  box-shadow: 0 0 0 3px rgba(23, 56, 104, 0.15);
}

.form-input-file {
  padding: 0.5rem 0;
  font-size: 0.85rem;
}

.form-textarea {
  resize: vertical;
  line-height: 1.5;
}

.btn-subaction {
  align-self: flex-start;
  padding: 0.45rem 0.9rem;
  background: #edf2f7;
  color: #173868;
  border: 1px solid #cbd5e1;
  border-radius: 0.4rem;
  font-size: 0.82rem;
  font-weight: 650;
  cursor: pointer;
}

.btn-subaction:hover:not(:disabled) {
  background: #e2e8f0;
}

.portada-preview-box {
  margin: 0.8rem 0;
  padding: 0.8rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  max-width: 200px;
}

.portada-preview-box img {
  border-radius: 0.25rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.portada-preview-box figcaption {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.4rem;
  text-align: center;
}

.relations-container {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.relations-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #0f1f38;
  margin: 0 0 0.25rem;
}

.relation-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px dashed #cbd5e1;
}

.relation-card:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.relation-checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  cursor: pointer;
}

.relation-check {
  width: 17px;
  height: 17px;
}

.relation-label {
  font-size: 0.8rem;
  color: #475569;
}

.form-disclaimer-note {
  font-size: 0.8rem;
  color: #64748b;
  margin: 0;
}

.form-actions-bar {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.btn-save-confirm {
  padding: 0.65rem 1.4rem;
  background: #1e293b;
  color: #ffffff;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-save-confirm:hover:not(:disabled) {
  background: #0f172a;
  border-color: #475569;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
}

.btn-save-confirm:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.btn-cancel-edit {
  padding: 0.65rem 1.2rem;
  background: #ffffff;
  color: #475569;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancel-edit:hover {
  background: #f1f5f9;
  color: #0f1f38;
}

.empty-state-card {
  padding: 3rem 1.5rem;
  background: #ffffff;
  border: 2px dashed #cbd5e1;
  border-radius: 0.85rem;
  text-align: center;
  color: #64748b;
}

/* BOTÓN FLOTANTE VOLVER ARRIBA */
.btn-volver-arriba {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 95;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1rem;
  background: #0f203b;
  color: #ffffff;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  box-shadow: 0 4px 16px rgba(15, 31, 56, 0.3);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-volver-arriba:hover {
  background: #173868;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(15, 31, 56, 0.4);
}

.icono-arriba {
  width: 16px;
  height: 16px;
}

@media (max-width: 640px) {
  .admin-topbar {
    padding: 0.8rem 1rem;
  }
  .screen-toolbar {
    flex-direction: column;
    align-items: stretch;
  }
  .toolbar-actions-group {
    width: 100%;
    justify-content: space-between;
  }
  .btn-primary-action {
    flex: 1;
  }
}
</style>