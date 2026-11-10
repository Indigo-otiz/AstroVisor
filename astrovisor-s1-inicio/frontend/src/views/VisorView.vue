<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  document.title = 'Modo Homido · AstroVisor'
})
</script>

<template>
  <section class="visor-page">
    <RouterLink class="public-back" to="/explorar">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5m6-6-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
      Volver a las constelaciones
    </RouterLink>

    <div class="visor-intro">
      <p class="visor-eyebrow">Experiencia inmersiva 3D · Realidad Virtual</p>
      <h1 tabindex="-1">Historias del cielo en el visor Homido</h1>
      <p class="visor-lead">
        Recorre la bóveda celeste en 360 grados, descubre constelaciones mediante la mirada y escucha relatos mitológicos narrados con voz natural. Diseñado especialmente para una observación cómoda y pausada.
      </p>
    </div>

    <!-- TARJETA HERO ESTELAR CON LLAMADO A LA ACCIÓN PRINCIPAL -->
    <div class="visor-hero-card">
      <div class="visor-hero-sky" aria-hidden="true">
        <svg class="visor-hero-svg" viewBox="0 0 800 320" preserveAspectRatio="none">
          <circle cx="120" cy="50" r="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="280" cy="180" r="1.5" fill="#ffffff" opacity="0.4" />
          <circle cx="450" cy="80" r="2" fill="#ffffff" opacity="0.7" />
          <circle cx="620" cy="210" r="1.5" fill="#ffffff" opacity="0.5" />
          <circle cx="710" cy="60" r="1.5" fill="#ffffff" opacity="0.6" />
          <circle cx="200" cy="260" r="1.5" fill="#ffffff" opacity="0.3" />
          <circle cx="530" cy="270" r="1.5" fill="#ffffff" opacity="0.4" />
          <!-- Trazos sutiles de constelación -->
          <g stroke="#ffffff" stroke-width="1.2" opacity="0.3" fill="none">
            <polyline points="450,80 500,120 560,95 620,140" />
            <circle cx="450" cy="80" r="3" fill="#f5b301" />
            <circle cx="500" cy="120" r="3" fill="#ffffff" />
            <circle cx="560" cy="95" r="3" fill="#ffffff" />
            <circle cx="620" cy="140" r="3" fill="#f5b301" />
          </g>
        </svg>
      </div>

      <div class="visor-hero-content">
        <span class="visor-badge-gold">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="visor-badge-icon">
            <rect x="2" y="6" width="20" height="12" rx="4" />
            <circle cx="8" cy="12" r="2.5" />
            <circle cx="16" cy="12" r="2.5" />
            <path d="M11 12h2" />
          </svg>
          Visor Homido y Smartphone
        </span>

        <h2 class="visor-hero-title">Inicia la experiencia inmersiva</h2>
        <p class="visor-hero-desc">
          Coloca tu teléfono en posición horizontal, activa el audio y explora Orión, Osa Mayor y Escorpio como si estuvieras bajo el cielo nocturno.
        </p>

        <div class="visor-hero-actions">
          <a class="public-button visor-btn-primary" href="/prueba-homido/index.html">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" class="btn-icon">
              <path d="M5 3l14 9-14 9V3z" fill="currentColor" />
            </svg>
            Abrir historias en el visor
          </a>
          <RouterLink class="visor-btn-secondary" to="/explorar">
            Continuar en modo web 2D
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- CÓMO USAR EL VISOR: PASOS ACCESIBLES PARA ADULTOS MAYORES -->
    <section class="visor-guide-section" aria-labelledby="guia-pasos">
      <h2 id="guia-pasos" class="visor-section-title">Cómo funciona la experiencia</h2>
      <p class="visor-section-desc">Sigue estos sencillos pasos para disfrutar de la actividad de forma cómoda y segura:</p>

      <div class="visor-steps-grid">
        <div class="visor-step-card">
          <div class="step-num">1</div>
          <div class="step-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1f4e8c" stroke-width="2" class="step-svg">
              <rect x="5" y="2" width="14" height="20" rx="3" />
              <line x1="12" y1="18" x2="12.01" y2="18" stroke-width="2.5" />
              <path d="M9 6h6" />
            </svg>
          </div>
          <h3>Prepara tu teléfono</h3>
          <p>Abre el visor en tu celular. Antes de colocarte las gafas, toca <strong>«Activar audio»</strong> y autoriza los sensores de movimiento.</p>
        </div>

        <div class="visor-step-card">
          <div class="step-num">2</div>
          <div class="step-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1f4e8c" stroke-width="2" class="step-svg">
              <rect x="2" y="6" width="20" height="12" rx="4" />
              <circle cx="8" cy="12" r="3" />
              <circle cx="16" cy="12" r="3" />
              <path d="M11 12h2" />
            </svg>
          </div>
          <h3>Ajusta el visor Homido</h3>
          <p>Toca <strong>«Probar vista dividida»</strong>, coloca el teléfono horizontalmente dentro del visor y ajusta las correas con calma.</p>
        </div>

        <div class="visor-step-card">
          <div class="step-num">3</div>
          <div class="step-icon-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="#1f4e8c" stroke-width="2" class="step-svg">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" fill="#f5b301" stroke="none" />
              <line x1="12" y1="2" x2="12" y2="6" />
              <line x1="12" y1="18" x2="12" y2="22" />
              <line x1="2" y1="12" x2="6" y2="12" />
              <line x1="18" y1="12" x2="22" y2="12" />
            </svg>
          </div>
          <h3>Navega con tu mirada</h3>
          <p>Mueve suavemente la cabeza. Mantén la mirilla fija durante <strong>3 segundos</strong> sobre una constelación para abrir su historia.</p>
        </div>
      </div>
    </section>

    <!-- CONTROLES Y SEGURIDAD -->
    <div class="visor-features-grid">
      <div class="visor-feature-box">
        <div class="feature-header">
          <span class="feature-icon pause">⏸</span>
          <h3>Pausar mirada en cualquier momento</h3>
        </div>
        <p>
          Si deseas contemplar el cielo sin que la mirilla seleccione botones accidentalmente, enfoca el botón <strong>«Pausar mirada»</strong>. Escucharás un tono suave de confirmación. Tu narración de voz seguirá reproduciéndose sin cortes.
        </p>
      </div>

      <div class="visor-feature-box">
        <div class="feature-header">
          <span class="feature-icon exit">↩</span>
          <h3>Regreso seguro a 2D</h3>
        </div>
        <p>
          Si en algún momento sientes mareo, incomodidad o cansancio visual, enfoca el botón <strong>«Salir a 2D»</strong>. La experiencia liberará los sensores del celular, detendrá el sonido y te regresará a la lectura normal en pantalla.
        </p>
      </div>
    </div>

    <!-- AVISO DE SALUD Y PRECAUCIÓN -->
    <div class="visor-caution-card" role="note">
      <div class="caution-icon-box">
        <svg viewBox="0 0 24 24" fill="none" stroke="#b07800" stroke-width="2" class="caution-svg">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" stroke-width="2.5" />
          <circle cx="12" cy="16" r="1" fill="#b07800" />
        </svg>
      </div>
      <div class="caution-content">
        <h3>Recomendaciones para una exploración agradable</h3>
        <p>
          Te sugerimos realizar la experiencia en una silla cómoda y con espacio despejado alrededor. Si sientes fatiga visual, retira el visor unos minutos. Todas las historias y figuras astronómicas también se pueden disfrutar y leer en modo web convencional sin necesidad de visor.
        </p>
      </div>
    </div>

    <p class="public-demo">
      Demostración tecnológica académica para visores Homido. Las figuras son esquemas didácticos adaptados; el material definitivo de la biblioteca está en proceso.
    </p>
  </section>
</template>

<style scoped>
.visor-page {
  padding-bottom: 24px;
}

.visor-intro {
  margin: 16px 0 32px;
}

.visor-eyebrow {
  color: #b07800;
  font-weight: 700;
  font-size: 0.9444rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin: 0 0 8px;
}

.visor-lead {
  font-size: 1.2222rem;
  line-height: 1.6;
  color: var(--muted);
  max-width: 68ch;
  margin: 0;
}

/* HERO CARD INMERSIVO */
.visor-hero-card {
  position: relative;
  background: linear-gradient(135deg, #0b1530 0%, #15274d 60%, #1b3a6b 100%);
  color: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 36px rgba(11, 21, 48, 0.2);
  margin-bottom: 48px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.visor-hero-sky {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.visor-hero-svg {
  width: 100%;
  height: 100%;
}

.visor-hero-content {
  position: relative;
  padding: 44px 40px;
  max-width: 720px;
  z-index: 1;
}

.visor-badge-gold {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(245, 179, 1, 0.15);
  border: 1px solid rgba(245, 179, 1, 0.45);
  color: #ffd666;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 0.9444rem;
  font-weight: 650;
  margin-bottom: 18px;
}

.visor-badge-icon {
  width: 18px;
  height: 18px;
}

.visor-hero-title {
  color: #ffffff;
  font: 700 clamp(1.7rem, 3.5vw, 2.4rem)/1.2 Georgia, serif;
  margin: 0 0 14px;
}

.visor-hero-desc {
  font-size: 1.15rem;
  line-height: 1.6;
  color: #dbe4f0;
  margin: 0 0 28px;
}

.visor-hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}

.visor-btn-primary {
  background: #f5b301 !important;
  color: #0b1530 !important;
  font-weight: 750 !important;
  border-radius: 14px !important;
  padding: 14px 28px !important;
  box-shadow: 0 4px 14px rgba(245, 179, 1, 0.35);
  transition: transform 0.15s ease, background 0.15s ease;
}

.visor-btn-primary:hover {
  background: #ffc226 !important;
  transform: translateY(-1px);
}

.btn-icon {
  width: 20px;
  height: 20px;
}

.visor-btn-secondary {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  padding: 13px 22px;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 650;
  min-height: 52px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s ease;
}

.visor-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

/* PASOS GUÍA */
.visor-guide-section {
  margin-bottom: 40px;
}

.visor-section-title {
  font: 700 1.8889rem/1.25 Georgia, serif;
  color: var(--night);
  margin: 0 0 8px;
}

.visor-section-desc {
  color: var(--muted);
  font-size: 1.1111rem;
  margin: 0 0 24px;
}

.visor-steps-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px;
}

.visor-step-card {
  background: #ffffff;
  border: 1px solid #dedbd3;
  border-radius: 20px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 4px 14px rgba(11, 21, 48, 0.04);
}

.step-num {
  position: absolute;
  top: 18px;
  right: 20px;
  font-size: 1.7rem;
  font-family: Georgia, serif;
  font-weight: 700;
  color: #dcd7ce;
}

.step-icon-wrap {
  width: 48px;
  height: 48px;
  background: #eef3f9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.step-svg {
  width: 26px;
  height: 26px;
}

.visor-step-card h3 {
  font: 700 1.25rem/1.3 Georgia, serif;
  color: var(--night);
  margin: 0 0 10px;
}

.visor-step-card p {
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.55;
  margin: 0;
}

/* CARACTERÍSTICAS Y CONTROLES */
.visor-features-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.visor-feature-box {
  background: #ffffff;
  border: 1px solid #dedbd3;
  border-radius: 18px;
  padding: 24px;
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.feature-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
}

.feature-icon.pause {
  background: #fef3c7;
  color: #92400e;
}

.feature-icon.exit {
  background: #f1f5f9;
  color: #334155;
}

.visor-feature-box h3 {
  font: 700 1.18rem/1.3 Georgia, serif;
  color: var(--night);
  margin: 0;
}

.visor-feature-box p {
  color: var(--muted);
  font-size: 1rem;
  line-height: 1.55;
  margin: 0;
}

/* AVISO DE PRECAUCIÓN */
.visor-caution-card {
  display: flex;
  gap: 18px;
  background: #fffbf0;
  border: 1.5px solid #f5b301;
  border-radius: 18px;
  padding: 24px;
  margin-bottom: 28px;
  align-items: flex-start;
}

.caution-icon-box {
  flex-shrink: 0;
  margin-top: 2px;
}

.caution-svg {
  width: 28px;
  height: 28px;
}

.caution-content h3 {
  font: 700 1.15rem/1.3 Georgia, serif;
  color: #614700;
  margin: 0 0 6px;
}

.caution-content p {
  color: #785900;
  font-size: 1rem;
  line-height: 1.55;
  margin: 0;
}

@media (max-width: 860px) {
  .visor-steps-grid {
    grid-template-columns: 1fr;
  }
  .visor-features-grid {
    grid-template-columns: 1fr;
  }
  .visor-hero-content {
    padding: 32px 24px;
  }
}
</style>
