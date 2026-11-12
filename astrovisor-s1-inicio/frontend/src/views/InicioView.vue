<script setup>
import ConstellationArt from '../components/ConstellationArt.vue'
</script>

<template>
  <!-- Cabecera de bienvenida -->
  <section class="public-home" aria-labelledby="home-title">
    <div class="home-intro">
      <h1 id="home-title" tabindex="-1">Cada estrella,<br />una historia.</h1>
      <p class="home-lead">
        AstroVisor es una plataforma web educativa diseñada para acercar el cielo nocturno y sus relatos culturales a personas adultas mayores y visitantes de la biblioteca.
      </p>
      <p class="home-access">
        Diseñado con tipografía legible, alto contraste, audio narrado y opciones de visualización autónomas.
      </p>
    </div>
    <div class="home-sky" aria-hidden="true">
      <ConstellationArt id="orion" />
      <span>Orión</span>
      <p>Un cielo de historias por descubrir</p>
    </div>
  </section>

  <!-- Tres accesos principales -->
  <section class="portal-section" aria-labelledby="portal-heading">
    <div class="portal-header">
      <h2 id="portal-heading">Formas de explorar AstroVisor</h2>
      <p>Elige la experiencia adecuada según tu dispositivo y preferencia. No necesitas registrarte ni crear cuentas para explorar.</p>
    </div>

    <div class="portal-cards">
      <!-- Tarjeta 1: Web Educativa -->
      <article class="portal-card" aria-labelledby="card-web-title">
        <div class="portal-card-badge">Computadora o Proyector</div>
        <h3 id="card-web-title">Experiencia Web Educativa</h3>
        <p class="portal-card-desc">
          Recorrido astronómico convencional en pantalla 2D. Conoce las constelaciones, escucha narraciones, lee historias con texto ampliado y consulta libros recomendados.
        </p>
        <ul class="portal-card-features">
          <li>Operable con teclado y ratón</li>
          <li>Vista para proyección disponible</li>
          <li>Lectura y transcripciones completas</li>
        </ul>
        <div class="portal-card-actions">
          <RouterLink class="portal-button primary" to="/explorar">
            Explorar en pantalla
            <svg viewBox="0 0 24 24" aria-hidden="true" class="button-icon"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </RouterLink>
        </div>
      </article>

      <!-- Tarjeta 2: Experiencia VR (Dos acciones directas) -->
      <article class="portal-card portal-card-vr" aria-labelledby="card-vr-title">
        <div class="portal-card-badge accent">Entorno 3D e Inmersión</div>
        <h3 id="card-vr-title">Experiencia Inmersiva 3D</h3>
        <p class="portal-card-desc">
          Observa las estrellas en un entorno tridimensional de 360 grados. El cielo permanece visible mientras escuchas la narración de cada constelación.
        </p>
        <p class="portal-card-note">Selecciona una modalidad para entrar directamente a la escena:</p>
        <div class="portal-card-actions vr-actions">
          <a class="portal-button secondary" href="/prueba-homido/index.html?modo=libre">
            <span class="btn-main">Pantalla completa · mouse o dedo</span>
            <span class="btn-sub">Recorrido 3D monoscópico sin visor</span>
          </a>
          <a class="portal-button homido" href="/prueba-homido/index.html?modo=homido">
            <span class="btn-main">Visor Homido · pantalla dividida</span>
            <span class="btn-sub">Estereoscopía y selección por mirada (3 s)</span>
          </a>
        </div>
      </article>

      <!-- Tarjeta 3: Administración -->
      <article class="portal-card" aria-labelledby="card-admin-title">
        <div class="portal-card-badge muted">Gestión y Catálogo</div>
        <h3 id="card-admin-title">Administración</h3>
        <p class="portal-card-desc">
          Panel exclusivo para el personal bibliotecario y docente. Permite gestionar libros, vincularlos con constelaciones y consultar el catálogo documental persistente.
        </p>
        <ul class="portal-card-features">
          <li>Acceso mediante credenciales seguras</li>
          <li>Registro de libros con año opcional</li>
          <li>Protección de contratos y auditoría</li>
        </ul>
        <div class="portal-card-actions">
          <RouterLink class="portal-button outline" to="/admin">
            Abrir administración
            <svg viewBox="0 0 24 24" aria-hidden="true" class="button-icon"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </RouterLink>
        </div>
      </article>
    </div>
  </section>

  <!-- Sección de Manuales en Video (S5-05) -->
  <section class="portal-manuals" aria-labelledby="manuals-heading">
    <div class="portal-header">
      <h2 id="manuals-heading">Manuales de uso y exploración</h2>
      <p>Guías pedagógicas diseñadas para facilitar el uso autónomo de cada área de la aplicación.</p>
    </div>

    <div class="manuals-grid">
      <!-- Manual 1: Web -->
      <article class="manual-item" aria-labelledby="manual-web-title">
        <div class="manual-badge-status" role="status">
          <span class="badge-dot"></span>
          Guion preparado · Pendiente de grabación
        </div>
        <h3 id="manual-web-title">1. Cómo usar la web educativa</h3>
        <p class="manual-desc">
          Recorrido paso a paso por la computadora y la proyección en pantalla grande: cómo navegar entre constelaciones, escuchar narraciones y consultar libros recomendados.
        </p>
        <details class="manual-details">
          <summary>Ver guion técnico y transcripción accesible</summary>
          <div class="manual-transcript">
            <ol>
              <li><strong>Inicio:</strong> Abre AstroVisor y pulsa «Explorar en pantalla» para acceder al catálogo público.</li>
              <li><strong>Constelaciones:</strong> Selecciona Orión, Osa Mayor o Escorpio para ver su figura ilustrada y su relato mitológico.</li>
              <li><strong>Audio:</strong> Pulsa «Escuchar narración» para oír la voz de Kokoro. Puedes pausar o consultar la transcripción textual completa.</li>
              <li><strong>Vista para proyección:</strong> Pulsa el botón superior para agrandar los textos a 24 px si estás usando un proyector o pantalla de televisión.</li>
              <li><strong>Libros:</strong> Consulta las recomendaciones al pie de cada ficha para acercarte a la biblioteca y solicitar lecturas afines.</li>
            </ol>
          </div>
        </details>
      </article>

      <!-- Manual 2: VR -->
      <article class="manual-item" aria-labelledby="manual-vr-title">
        <div class="manual-badge-status" role="status">
          <span class="badge-dot"></span>
          Guion preparado · Pendiente de grabación
        </div>
        <h3 id="manual-vr-title">2. Cómo explorar en VR (Libre y Homido)</h3>
        <p class="manual-desc">
          Instrucciones para navegar en 3D: interacción con mouse o dedo en modo libre, colocación en el visor Homido, selección por mirada durante 3 segundos y botones de bienestar.
        </p>
        <details class="manual-details">
          <summary>Ver guion técnico y transcripción accesible</summary>
          <div class="manual-transcript">
            <ol>
              <li><strong>Modo Libre (mouse/dedo):</strong> Selecciona «Pantalla completa · mouse o dedo». Arrastra con el cursor o desliza la pantalla táctil para recorrer las estrellas.</li>
              <li><strong>Modo Homido (pantalla dividida):</strong> Selecciona «Visor Homido». El sistema activa automáticamente la doble cámara para cada ojo. Coloca el teléfono dentro del visor.</li>
              <li><strong>Selección por mirada:</strong> Centra el aro blanco en Orión, Osa Mayor o Escorpio durante 3 segundos. El aro amarillo indicará el progreso hasta abrir la ficha.</li>
              <li><strong>Cielo visible y audio:</strong> La constelación seguirá iluminada de fondo mientras escuchas el relato. Pulsa «Pausar» o «Repetir» en cualquier momento.</li>
              <li><strong>Pausa de mirada y salida:</strong> Usa el botón «Pausar mirada» si deseas contemplar las estrellas sin activar fichas. El botón «Salir» detiene el audio y vuelve a la web con seguridad.</li>
            </ol>
          </div>
        </details>
      </article>

      <!-- Manual 3: Administración -->
      <article class="manual-item" aria-labelledby="manual-admin-title">
        <div class="manual-badge-status" role="status">
          <span class="badge-dot"></span>
          Guion preparado · Pendiente de grabación
        </div>
        <h3 id="manual-admin-title">3. Cómo administrar el catálogo</h3>
        <p class="manual-desc">
          Procedimiento para el personal de la biblioteca: acceso seguro, consulta del inventario persistente, alta de libros con año opcional y asignación de portadas ilustrativas.
        </p>
        <details class="manual-details">
          <summary>Ver guion técnico y transcripción accesible</summary>
          <div class="manual-transcript">
            <ol>
              <li><strong>Acceso:</strong> Pulsa «Abrir administración» e introduce las credenciales autorizadas en el formulario protegido.</li>
              <li><strong>Consulta:</strong> Visualiza la lista de libros y constelaciones asociadas en el repositorio documental persistente.</li>
              <li><strong>Alta de libro:</strong> Completa título, autor, constelación relacionada, motivo y enlace público HTTPS. El campo año es opcional.</li>
              <li><strong>Portadas:</strong> El sistema genera automáticamente una portada armónica en formato SVG o permite asociar una imagen autorizada.</li>
              <li><strong>Publicación:</strong> Guarda los cambios con control de concurrencia para que se sincronicen de inmediato con el catálogo público.</li>
            </ol>
          </div>
        </details>
      </article>
    </div>
  </section>

  <!-- Sección de Créditos e Identidad Institucional (S5-06) -->
  <section class="portal-credits" aria-labelledby="credits-heading">
    <div class="credits-box">
      <h2 id="credits-heading" class="credits-title">AstroVisor — Proyecto Académico</h2>
      <p class="credits-team">
        Desarrollado por el <strong>Equipo 8</strong> de la materia <strong>Taller de Full Stack</strong>:
      </p>
      <ul class="team-list">
        <li><strong>Karime Rendón Vázquez</strong> — UX/UI, Accesibilidad y Coordinación de Manuales</li>
        <li><strong>Luis Alberto Rodríguez</strong> — Experiencia 3D, Sensores e Interacción VR</li>
        <li><strong>Carlos Martínez Orozco</strong> — Backend, Arquitectura Web y Catálogo Bibliográfico</li>
        <li><strong>Índigo Andre Ortiz Vega</strong> — Persistencia Documental, Integración y QA Transversal</li>
      </ul>
      <div class="credits-affiliations">
        <p>
          En vinculación con la <strong>Biblioteca Pública Central Estatal Solón Argüello</strong> y el <strong>Instituto Tecnológico de Tepic (TecNM)</strong>.
        </p>
        <div class="credits-institutions-logos">
          <img
            class="credits-logo-cecan"
            src="/Nayarit_CECAN_Convivencia_Horizontal.png"
            width="11479"
            height="1968"
            alt="Gobierno del Estado de Nayarit y Consejo Estatal para la Cultura y las Artes de Nayarit (CECAN)"
          />
        </div>
        <p class="credits-disclaimer">
          <em>Nota de trazabilidad institucional:</em> Se incorpora el logotipo oficial horizontal de CECAN y Gobierno del Estado, clasificado como dependencia externa pendiente de autorización formal definitiva de uso. Todo el contenido actual es de carácter demostrativo.
        </p>
      </div>
    </div>
  </section>
</template>
