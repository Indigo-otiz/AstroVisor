<template>
  <section class="visor-landing">
    <p class="eyebrow">Experiencia inmersiva · Sprint 2 (Karime)</p>
    <h1>Modo Visor Homido</h1>
    <p class="lead">
      Selección de constelaciones mediante la mirada con retícula accesible, permanencia visual de 3 segundos sin prisa y confirmación inmediata.
    </p>

    <!-- Demostración interactiva de la retícula de Karime -->
    <div class="reticle-interactive-demo" aria-labelledby="demo-title">
      <h2 id="demo-title">Controles de la Retícula de Mirada</h2>
      <p class="demo-subtitle">
        Pasa el cursor o mantén presionado sobre la esfera de prueba durante 3 segundos para ver cómo se llena el anillo amarillo acento (<code>#F5B301</code>).
      </p>

      <div class="demo-stage-box">
        <div
          class="test-target-ball"
          :class="{ 'is-focused': isHovering, 'is-selected': isTargetSelected }"
          @mouseenter="startTargetGaze"
          @mouseleave="cancelTargetGaze"
          @click="toggleDirectSelect"
          role="button"
          tabindex="0"
          @keydown.enter="toggleDirectSelect"
          @keydown.space.prevent="toggleDirectSelect"
          aria-label="Objetivo de prueba interactivo de mirada"
        >
          <GazeReticle
            :progress="gazeProgress"
            :stage="gazeStage"
            :is-confirmed="isTargetSelected"
            :is-paused="isDemoPaused"
            :show-badge="true"
          />
        </div>

        <div class="demo-feedback">
          <p class="status-indicator">
            <strong>Estado:</strong> {{ demoStatusMessage }}
          </p>
          <div class="demo-actions">
            <button
              type="button"
              class="button secondary"
              @click="toggleDemoPause"
            >
              {{ isDemoPaused ? '▶ Reanudar permanencia' : '⏸ Pausar mirilla' }}
            </button>
            <button
              type="button"
              class="button secondary"
              @click="resetDemo"
            >
              ↺ Reiniciar (0 %)
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Acceso a la experiencia inmersiva completa -->
    <div class="notice">
      <h2>Lanzar experiencia en el visor</h2>
      <p>
        Accede a la bóveda celeste en 3D con las constelaciones de Orión, Osa Mayor y Cruz del Sur, equipada con vista dividida estéreo para el visor Homido y soporte de giroscopio en teléfonos móviles.
      </p>
      <div class="launch-actions">
        <a class="button" href="/prueba-homido/index.html">
          👓 Abrir visor Homido (Escena 3D)
        </a>
        <RouterLink class="button secondary" to="/explorar">
          Continuar en modo web 2D
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import GazeReticle from '../components/GazeReticle.vue'
import { GazeController } from '../services/gazeController.js'

const isHovering = ref(false)
const isTargetSelected = ref(false)
const isDemoPaused = ref(false)
const gazeProgress = ref(0)
const gazeStage = ref('0%')

const gazeCtrl = new GazeController({
  dwellTime: 3000,
  onProgress: (p, stage) => {
    gazeProgress.value = p
    gazeStage.value = stage
  },
  onConfirm: () => {
    isTargetSelected.value = true
    gazeProgress.value = 1.0
    gazeStage.value = '100%'
  },
  onCancel: () => {
    gazeProgress.value = 0
    gazeStage.value = '0%'
  },
  onStageChange: (stage) => {
    gazeStage.value = stage
  },
})

function startTargetGaze() {
  if (isTargetSelected.value || isDemoPaused.value) return
  isHovering.value = true
  gazeCtrl.start({ id: 'demo-target' })
}

function cancelTargetGaze() {
  isHovering.value = false
  if (!isTargetSelected.value) {
    gazeCtrl.cancel()
  }
}

function toggleDirectSelect() {
  if (isTargetSelected.value) {
    resetDemo()
  } else {
    isTargetSelected.value = true
    gazeCtrl.setManualStage('100%')
  }
}

function toggleDemoPause() {
  isDemoPaused.value = gazeCtrl.togglePause()
}

function resetDemo() {
  isTargetSelected.value = false
  isHovering.value = false
  gazeCtrl.reset()
}

const demoStatusMessage = computed(() => {
  if (isDemoPaused.value) return 'Retícula en PAUSA (detección suspendida)'
  if (isTargetSelected.value) return '¡Selección confirmada al 100%! (Retroalimentación visual activa)'
  if (gazeProgress.value > 0) return `Mirada fija detectada: progreso ${Math.round(gazeProgress.value * 100)} % (etapa ${gazeStage.value})`
  return 'En reposo (0 %). Enfoca el círculo para iniciar permanencia de 3 s.'
})
</script>

<style scoped>
.visor-landing {
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem 0 3rem;
}

.eyebrow {
  color: #F5B301;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.lead {
  font-size: 1.2rem;
  color: #4A5565;
  margin-bottom: 2rem;
}

.reticle-interactive-demo {
  background: #0B1530;
  color: #FFFFFF;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 2px solid #F5B301;
  box-shadow: 0 8px 30px rgba(11, 21, 48, 0.4);
}

.reticle-interactive-demo h2 {
  color: #FFFFFF;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.demo-subtitle {
  color: #C9CED6;
  font-size: 1.05rem;
  margin-bottom: 1.5rem;
}

.demo-stage-box {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  background: rgba(255, 255, 255, 0.04);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.test-target-ball {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: #1B2A5A;
  border: 3px dashed #FFF4CF;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.22s ease;
  user-select: none;
}

.test-target-ball:hover, .test-target-ball:focus-visible {
  border-color: #F5B301;
  transform: scale(1.05);
  outline: none;
}

.test-target-ball.is-selected {
  background: #143525;
  border: 3px solid #1E7B3A;
}

.demo-feedback {
  flex: 1;
  min-width: 260px;
}

.status-indicator {
  font-size: 1.1rem;
  line-height: 1.5;
  color: #FFF4CF;
  margin-bottom: 1.25rem;
}

.demo-actions {
  display: flex;
  gap: 0.85rem;
  flex-wrap: wrap;
}

.launch-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.2rem;
}
</style>
