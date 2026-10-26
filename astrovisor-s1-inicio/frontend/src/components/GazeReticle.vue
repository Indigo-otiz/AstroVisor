<template>
  <div
    class="gaze-reticle-container"
    :class="{
      'is-active': progress > 0 && progress < 1,
      'is-confirmed': isConfirmed || progress >= 1,
      'is-paused': isPaused,
    }"
    role="progressbar"
    :aria-valuenow="Math.round(progress * 100)"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-label="ariaStatusLabel"
  >
    <svg
      class="gaze-reticle-svg"
      viewBox="0 0 72 72"
      width="72"
      height="72"
      aria-hidden="true"
    >
      <!-- Halo oscuro exterior para contraste universal contra estrellas y fondos claros -->
      <circle
        cx="36"
        cy="36"
        r="32"
        fill="none"
        stroke="#0B1530"
        stroke-width="5"
        opacity="0.65"
      />

      <!-- Pista base del anillo -->
      <circle
        cx="36"
        cy="36"
        r="28"
        fill="none"
        stroke="#FFFFFF"
        stroke-width="3"
        opacity="0.35"
      />

      <!-- Anillo de progreso amarillo acento #F5B301 -->
      <circle
        class="progress-ring"
        cx="36"
        cy="36"
        r="28"
        fill="none"
        :stroke="progressRingColor"
        stroke-width="4.5"
        stroke-linecap="round"
        stroke-dasharray="175.93"
        :stroke-dashoffset="dashOffset"
        transform="rotate(-90 36 36)"
      />

      <!-- Anillo de confirmación al 100% -->
      <circle
        v-if="isConfirmed || progress >= 1"
        class="confirm-pulse-ring"
        cx="36"
        cy="36"
        r="33"
        fill="none"
        stroke="#1E7B3A"
        stroke-width="3"
      />

      <!-- Mirilla central: núcleo blanco con halo oscuro -->
      <circle
        cx="36"
        cy="36"
        r="6"
        fill="#0B1530"
      />
      <circle
        cx="36"
        cy="36"
        r="4.2"
        :fill="(isConfirmed || progress >= 1) ? '#1E7B3A' : '#FFFFFF'"
      />
    </svg>

    <!-- Indicador de etapa para apoyo de accesibilidad y revisión (0%, 33%, 66%, 100%) -->
    <span v-if="showBadge" class="gaze-stage-badge">
      {{ isPaused ? 'Pausa' : displayStage }}
    </span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  progress: {
    type: Number,
    default: 0,
  },
  stage: {
    type: String,
    default: '0%',
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  isPaused: {
    type: Boolean,
    default: false,
  },
  showBadge: {
    type: Boolean,
    default: false,
  },
})

const CIRCUMFERENCE = 175.93

const dashOffset = computed(() => {
  const p = Math.max(0, Math.min(1, props.progress))
  return CIRCUMFERENCE * (1 - p)
})

const displayStage = computed(() => {
  if (props.stage) return props.stage
  const pct = Math.round(props.progress * 100)
  if (pct >= 100) return '100%'
  if (pct >= 66) return '66%'
  if (pct >= 33) return '33%'
  return '0%'
})

const progressRingColor = computed(() => {
  if (props.isConfirmed || props.progress >= 1) return '#1E7B3A'
  return '#F5B301' // Color de acento según diseño de Karime
})

const ariaStatusLabel = computed(() => {
  if (props.isPaused) return 'Retícula en pausa'
  if (props.isConfirmed || props.progress >= 1) return 'Selección completada al 100%'
  return `Progreso de selección por mirada: ${Math.round(props.progress * 100)} %`
})
</script>

<style scoped>
.gaze-reticle-container {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  user-select: none;
  position: relative;
  transition: transform 0.18s ease-out;
}

.gaze-reticle-svg {
  display: block;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.45));
}

.progress-ring {
  transition: stroke-dashoffset 0.06s linear, stroke 0.2s ease;
}

.is-active .gaze-reticle-svg {
  transform: scale(1.05);
}

.is-confirmed .gaze-reticle-svg {
  animation: confirm-pop 0.35s ease-out;
}

@keyframes confirm-pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.22); }
  100% { transform: scale(1); }
}

.confirm-pulse-ring {
  animation: pulse-ring 0.6s ease-out infinite;
}

@keyframes pulse-ring {
  0% { opacity: 0.9; transform: scale(0.95); transform-origin: center; }
  100% { opacity: 0; transform: scale(1.25); transform-origin: center; }
}

.gaze-stage-badge {
  margin-top: 4px;
  background: rgba(11, 21, 48, 0.88);
  color: #F5B301;
  font-family: 'Atkinson Hyperlegible', sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 12px;
  border: 1px solid #F5B301;
  letter-spacing: 0.5px;
}

.is-paused {
  opacity: 0.55;
}
</style>
