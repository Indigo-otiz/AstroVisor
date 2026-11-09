<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useEditorCatalogo } from '../composables/useEditorCatalogo.js'
import { alternativaPortada } from '../services/librosDemoService.js'

const router = useRouter()
const { userDisplayName, username, signOut, token, invalidarSesion } = useAuth()

const isIniciando3D = ref(false)
const { catalogo, seleccion, borrador, cargando, guardando, error, mensaje, conflicto, necesitaRecarga,
  libroActual, recorridoActual, cargar, seleccionarLibro, seleccionarRecorrido, cancelarEdicion, guardar, cancelarPeticiones,
  hayBorradorPendiente, recuperarBorrador, descartarBorradorPendiente, nuevoLibro, previsualizar, previsualizacion, previsualizando,subirImagen,puedeEditarTexto,requierePreview } = useEditorCatalogo({
  obtenerToken: () => token.value,
  obtenerUsuario: () => username.value,
  alExpirarSesion: () => { invalidarSesion(); void router.replace({ name: 'admin-acceso' }) },
})

async function handleLogout() {
  descartarBorradorPendiente()
  await signOut()
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

const nombreRecorrido = (id) => catalogo.value?.recorridos.find((r) => r.id === id)?.titulo ?? id
const constelacionesLibro = (id) => catalogo.value?.recorridos.filter((r) => r.libroRefs.some((v) => v.libroId === id)) ?? []
async function guardarYCentrar() {
  await guardar(); await nextTick()
  document.querySelector('#editor-resultados')?.focus()
}
async function cancelarYCentrar() {
  const anterior = seleccion.value
  cancelarEdicion(); await nextTick()
  if (anterior) document.querySelector(anterior.tipo === 'nuevo' ? '#nuevo-libro' : `[data-editar="${anterior.tipo}-${anterior.id}"]`)?.focus()
}
watch(seleccion, async (actual) => { if (actual) { await nextTick(); document.querySelector('#editor-heading')?.focus() } })
onMounted(cargar)
onBeforeUnmount(cancelarPeticiones)
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
      <section class="books-section" aria-labelledby="catalogo-heading" :aria-busy="cargando || guardando">
        <div class="books-header">
          <div class="books-title-group">
            <h2 id="catalogo-heading" class="experiences-title">Libros y Bibliografía</h2>
            <span class="badge-postergado">Edición documental</span>
          </div>
          <button type="button" class="btn-refresh" @click="cargar()" :disabled="cargando || guardando">
            {{ cargando ? 'Cargando...' : borrador ? 'Recargar catálogo y descartar edición' : 'Actualizar catálogo' }}
          </button>
        </div>
        <p class="admin-note">
          Edita una ficha a la vez. Las referencias son de demostración; no representan préstamos ni disponibilidad de ejemplares.
        </p>
        <button id="nuevo-libro" type="button" class="btn-refresh" :disabled="!catalogo || cargando || guardando || Boolean(borrador) || necesitaRecarga" @click="nuevoLibro">Registrar libro de demostración</button>
        <div v-if="hayBorradorPendiente" role="status" class="admin-note">
          <p>Hay una edición pendiente de la sesión anterior, solo en memoria de esta pestaña. Puedes recuperarla después de consultar el catálogo. Se pierde al recargar o cerrar la pestaña.</p>
          <button type="button" class="btn-refresh" :disabled="!catalogo || cargando || guardando || Boolean(borrador)" @click="recuperarBorrador">Recuperar borrador</button>
          <button type="button" class="btn-refresh" @click="descartarBorradorPendiente">Descartar borrador pendiente</button>
        </div>

        <div id="editor-resultados" tabindex="-1">
          <p v-if="error" class="alert" role="alert">{{ error }}</p>
          <p v-if="mensaje" class="admin-note" role="status">{{ mensaje }}</p>
        </div>
        <p v-if="cargando" role="status">Consultando el catálogo…</p>
        <p v-if="catalogo" class="admin-note">Revisión consultada: {{ catalogo.revision }}.
          <template v-if="catalogo.publicacionHomido?.respaldoPublico === 'publicado' && catalogo.publicacionHomido.revisionPublicada === catalogo.revision">Respaldo Homido publicado para esta revisión.</template>
          <template v-else>Respaldo Homido pendiente de sincronización. <span v-if="catalogo.publicacionHomido?.revisionPublicada">Copia publicada: revisión {{ catalogo.publicacionHomido.revisionPublicada }}.</span></template>
          La exportación se ejecuta por separado en el servidor, no desde este panel.
        </p>
        <p v-if="borrador" class="admin-note">Termina o cancela esta edición antes de seleccionar otra ficha.</p>
        <p v-if="necesitaRecarga" class="admin-note" role="status">El guardado ya está confirmado. Actualiza el catálogo antes de iniciar otra edición; no repitas la escritura.</p>
        <div v-if="catalogo?.libros.length" class="books-grid">
          <article v-for="libro in catalogo.libros" :key="libro.id" class="book-card">
            <img class="book-cover" :src="libro.portadaIlustrativa" :alt="alternativaPortada(libro)" width="112" height="160" />
            <div class="book-pill-id">{{ libro.id }}</div>
            <h3 class="book-title">{{ libro.titulo }}</h3>
            <p class="book-author">Por: <strong>{{ libro.autor }}</strong></p>
            <p class="book-desc">Relacionada con: {{ constelacionesLibro(libro.id).map((r) => r.titulo).join(', ') }}</p>
            <p v-if="libro.demostracion" class="book-desc">Referencia de demostración. {{ libro.portada?.tipo === 'imagen-autorizada' ? 'Imagen con permiso declarado.' : libro.portada?.plantilla ? 'Portada automática.' : 'SVG ilustrativo heredado.' }}</p>
            <button type="button" class="btn-refresh" :data-editar="`libro-${libro.id}`" :disabled="cargando || guardando || Boolean(borrador) || necesitaRecarga" @click="seleccionarLibro(libro.id)">Editar {{ libro.titulo }}</button>
          </article>
        </div>

        <div v-else-if="catalogo && !cargando" class="empty-books-box">
          <p>No hay libros en el catálogo consultado.</p>
        </div>
        <section v-if="catalogo" class="catalogo-constelaciones" aria-labelledby="constelaciones-editor">
          <h3 id="constelaciones-editor">Constelaciones</h3>
          <ul><li v-for="r in catalogo.recorridos" :key="r.id">
            <button type="button" class="btn-refresh" :data-editar="`recorrido-${r.id}`" :disabled="cargando || guardando || Boolean(borrador) || necesitaRecarga" @click="seleccionarRecorrido(r.id)">Editar información de {{ r.titulo }}</button>
          </li></ul>
        </section>
        <form v-if="borrador" class="catalogo-formulario" @submit.prevent="guardarYCentrar">
          <h3 id="editor-heading" tabindex="-1">{{ seleccion.tipo === 'nuevo' ? 'Registrar libro de demostración' : `Editar ${libroActual?.titulo ?? recorridoActual?.titulo}` }}</h3>
          <fieldset :disabled="guardando || cargando">
            <legend>{{ seleccion.tipo !== 'recorrido' ? 'Información bibliográfica y motivos de lectura' : 'Información de la constelación' }}</legend>
            <template v-if="seleccion.tipo === 'nuevo'">
              <p class="admin-note">Referencia de demostración: no registra un ejemplar institucional. La exportación Homido se realiza por separado.</p>
              <label for="nuevo-id">ID estable (minúsculas, números y guiones)</label>
              <input id="nuevo-id" v-model="borrador.id" required maxlength="100" pattern="[a-z0-9]+(-[a-z0-9]+)*" aria-describedby="id-ayuda" />
              <p id="id-ayuda" class="admin-note">Debe ser único. Se usará en el enlace del libro y no podrá editarse después.</p>
              <label for="nuevo-titulo">Título</label>
              <input id="nuevo-titulo" v-model="borrador.titulo" required maxlength="200" />
              <label for="nuevo-autor">Autor</label>
              <input id="nuevo-autor" v-model="borrador.autor" required maxlength="200" />
            </template>
            <template v-else-if="libroActual">
              <p id="restriccion-portadas" class="admin-note">El SVG heredado contiene texto fijo. Para cambiar título o autor, sustituye explícitamente la portada. Homido navega por ID.</p>
              <label for="editor-titulo">Título</label>
              <input id="editor-titulo" v-model="borrador.titulo" :readonly="!puedeEditarTexto" required maxlength="200" aria-describedby="restriccion-portadas" />
              <label for="editor-autor">Autor</label>
              <input id="editor-autor" v-model="borrador.autor" :readonly="!puedeEditarTexto" required maxlength="200" aria-describedby="restriccion-portadas" />
            </template>
            <template v-if="seleccion.tipo !== 'recorrido'">
              <label for="tipo-portada">Tipo de portada</label>
              <select id="tipo-portada" v-model="borrador.tipoPortada">
                <option v-if="libroActual && !libroActual.portada" value="heredada">Conservar SVG heredado</option>
                <option value="ilustrativa">Ilustrativa automática</option>
                <option value="imagen-autorizada">Imagen propia autorizada (PNG/JPEG)</option>
              </select>
              <template v-if="borrador.tipoPortada === 'ilustrativa'">
              <label for="nueva-plantilla">Plantilla ilustrativa</label>
              <select id="nueva-plantilla" v-model="borrador.portada.plantilla"><option value="cielo">Cielo — constelación abierta</option><option value="guia">Guía — recorrido de estrellas</option><option value="relatos">Relatos — trama estelar</option></select>
              <label for="nueva-paleta">Paleta de la portada</label>
              <select id="nueva-paleta" v-model="borrador.portada.paleta"><option value="azul">Azul noche</option><option value="verde">Verde profundo</option><option value="violeta">Violeta</option></select>
              <p class="admin-note">Se admiten letras latinas básicas y Latin-1 (incluidos acentos del español), números y puntuación común. La previsualización comprueba el ajuste: no recorta texto para hacerlo caber.</p>
              <button type="button" class="btn-refresh" :disabled="previsualizando || conflicto" @click="previsualizar">{{ previsualizando ? 'Generando portada…' : 'Previsualizar portada' }}</button>
              </template>
              <template v-if="borrador.tipoPortada === 'imagen-autorizada'">
                <p id="imagen-ayuda" class="admin-note">PNG/JPEG hasta 2 MiB, máximo 4096 px por lado y 8 millones de píxeles. Preparar una imagen no guarda el libro. Si cambias título o autor, revisa la correspondencia de la imagen.</p>
                <label for="archivo-portada">Preparar o reemplazar imagen</label>
                <input id="archivo-portada" type="file" accept="image/png,image/jpeg" :disabled="previsualizando || conflicto" aria-describedby="imagen-ayuda" @change="subirImagen($event.target.files?.[0])" />
                <p v-if="previsualizando" role="status">Preparando imagen…</p>
                <label for="imagen-procedencia">Procedencia de la imagen</label><textarea id="imagen-procedencia" v-model="borrador.portada.procedencia" required maxlength="1000" rows="2"></textarea>
                <label for="imagen-permiso">Permiso o autorización de uso</label><textarea id="imagen-permiso" v-model="borrador.portada.permiso" required maxlength="1000" rows="2"></textarea>
                <label for="imagen-alternativa">Texto alternativo</label><input id="imagen-alternativa" v-model="borrador.portada.textoAlternativo" required maxlength="1000" />
              </template>
              <figure v-if="previsualizacion" class="portada-preview"><img :src="previsualizacion" :alt="borrador.tipoPortada === 'imagen-autorizada' ? borrador.portada.textoAlternativo || 'Previsualización de imagen preparada' : `Previsualización ilustrativa de ${borrador.titulo}`" width="225" height="320" /><figcaption>{{ borrador.tipoPortada === 'imagen-autorizada' ? 'Imagen preparada; asociación pendiente de guardar.' : 'Portada ilustrativa, no original.' }}</figcaption></figure>
            </template>
            <template v-if="libroActual || seleccion.tipo === 'nuevo'">
              <label for="editor-anio">Año de publicación</label>
              <input id="editor-anio" v-model.number="borrador.anio" type="number" min="1" max="9999" :required="seleccion.tipo === 'nuevo' || libroActual?.anio !== undefined" />
              <label for="editor-enlace">Enlace público de la obra (HTTPS)</label>
              <input id="editor-enlace" v-model="borrador.enlacePublico" type="url" required maxlength="2048" pattern="https://.+" />
              <div v-for="relacion in borrador.relaciones" :key="relacion.constelacionId" class="catalogo-motivo">
                <label v-if="seleccion.tipo === 'nuevo'" class="catalogo-check"><input v-model="relacion.seleccionada" type="checkbox" /> Asociar con {{ nombreRecorrido(relacion.constelacionId) }}</label>
                <template v-if="seleccion.tipo !== 'nuevo' || relacion.seleccionada">
                <label :for="`motivo-${relacion.constelacionId}`">Motivo de lectura para {{ nombreRecorrido(relacion.constelacionId) }}</label>
                <textarea :id="`motivo-${relacion.constelacionId}`" v-model="relacion.motivo" required maxlength="1000" rows="3"></textarea>
                </template>
              </div>
            </template>
            <template v-else>
              <label for="editor-resumen">Resumen</label>
              <textarea id="editor-resumen" v-model="borrador.resumen" required maxlength="1000" rows="4"></textarea>
              <label for="editor-reconocer">Cómo reconocerla</label>
              <textarea id="editor-reconocer" v-model="borrador.comoReconocerla" required maxlength="12000" rows="5"></textarea>
              <p class="admin-note">Esta edición conserva la historia, la narración y sus atribuciones.</p>
            </template>
            <p v-if="conflicto || necesitaRecarga" class="admin-note">Tu formulario se conserva. Puedes copiar tu edición antes de usar «Recargar catálogo y descartar edición».</p>
            <div class="catalogo-acciones">
              <button type="submit" class="btn-refresh" :disabled="conflicto || necesitaRecarga || previsualizando || (requierePreview && !previsualizacion) || (borrador.tipoPortada === 'imagen-autorizada' && !borrador.portada.recursoId)">{{ guardando ? 'Guardando…' : seleccion.tipo === 'nuevo' ? 'Confirmar registro' : 'Guardar cambios' }}</button>
              <button type="button" class="btn-refresh" @click="cancelarYCentrar">Cancelar edición</button>
            </div>
          </fieldset>
        </form>
      </section>
    </main>
  </div>
</template>

<style scoped>
.books-grid { grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr)); }
.book-cover { display: block; object-fit: contain; max-width: 100%; margin-bottom: 1rem; }
.books-section .btn-refresh { min-height: 48px; white-space: normal; }
.books-section .btn-refresh:disabled { opacity: .65; cursor: default; }
.books-section .admin-note { margin-top: .75rem; }
.books-section :focus-visible { outline: 3px solid #173868; outline-offset: 3px; }
.catalogo-constelaciones, .catalogo-formulario { margin-top: 2rem; }
.catalogo-constelaciones ul { display: flex; flex-wrap: wrap; gap: .75rem; padding: 0; list-style: none; }
.catalogo-formulario fieldset { min-width: 0; padding: 1.25rem; border: 1px solid #cbd5e1; border-radius: .8rem; background: #fff; }
.catalogo-formulario legend { padding: 0 .5rem; font-weight: 700; }
.catalogo-formulario label { display: block; margin: 1rem 0 .4rem; font-weight: 600; }
.catalogo-formulario input, .catalogo-formulario textarea, .catalogo-formulario select { display: block; width: 100%; max-width: 100%; min-height: 48px; box-sizing: border-box; padding: .7rem; border: 1px solid #64748b; border-radius: .4rem; font: inherit; color: #0f1f38; background: #fff; }
.catalogo-formulario .catalogo-check { display: flex; align-items: center; gap: .75rem; min-height: 48px; }
.catalogo-formulario input[type="checkbox"] { width: 24px; min-height: 24px; height: 24px; flex-shrink: 0; }
.portada-preview { margin: 1.5rem 0; max-width: 26rem; }
.portada-preview img { display: block; max-width: 100%; height: auto; }
.catalogo-formulario input[readonly] { background: #f1f5f9; }
.catalogo-formulario textarea { resize: vertical; line-height: 1.5; }
.catalogo-acciones { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.5rem; }
@media (max-width: 640px) {
  .admin-topbar, .topbar-left, .topbar-right { flex-wrap: wrap; }
}
</style>
