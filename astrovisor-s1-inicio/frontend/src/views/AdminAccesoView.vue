<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { signIn, isAuthenticated, userDisplayName, loading, isSupabaseConfigured } = useAuth()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)

async function handleSubmit() {
  errorMessage.value = ''

  if (!username.value || !password.value) {
    errorMessage.value = 'Por favor completa todos los campos.'
    return
  }

  isSubmitting.value = true
  try {
    await signIn(username.value, password.value)
    router.push('/admin')
  } catch (err) {
    console.error('Error al iniciar sesión:', err)
    if (err.message?.includes('Invalid login credentials') || err.message?.includes('incorrectos')) {
      errorMessage.value = 'Usuario o contraseña incorrectos.'
    } else {
      errorMessage.value = err.message || 'No fue posible iniciar sesión. Verifica la conexión.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="login-page-container">
    <!-- Mitad Izquierda: Fondo Azul Noche con Ilustración -->
    <div class="login-hero-side">
      <svg class="sky-background-svg" viewBox="0 0 600 700" preserveAspectRatio="none" aria-hidden="true">
        <circle cx="50" cy="80" r="1.5" fill="#ffffff" opacity="0.4" />
        <circle cx="120" cy="200" r="2" fill="#ffffff" opacity="0.6" />
        <circle cx="280" cy="110" r="1.5" fill="#ffffff" opacity="0.5" />
        <circle cx="450" cy="90" r="2" fill="#ffffff" opacity="0.7" />
        <circle cx="520" cy="240" r="1.5" fill="#ffffff" opacity="0.3" />
        <circle cx="220" cy="350" r="1" fill="#ffffff" opacity="0.4" />
        <circle cx="380" cy="480" r="1.5" fill="#ffffff" opacity="0.5" />

        <!-- Constelación trazada -->
        <g stroke="#ffffff" stroke-width="1.2" opacity="0.35" fill="none">
          <polyline points="380,180 430,120 480,150 530,110 560,140" />
          <circle cx="380" cy="180" r="3.5" fill="#ffffff" />
          <circle cx="430" cy="120" r="3.5" fill="#ffffff" />
          <circle cx="480" cy="150" r="3.5" fill="#ffffff" />
          <circle cx="530" cy="110" r="3.5" fill="#ffffff" />
          <circle cx="560" cy="140" r="3.5" fill="#ffffff" />
        </g>

        <!-- Planeta con anillos -->
        <ellipse cx="490" cy="620" rx="140" ry="40" fill="none" stroke="#ffffff" stroke-width="1" opacity="0.2" transform="rotate(-20 490 620)" />
        <circle cx="490" cy="620" r="48" fill="#5a5e78" opacity="0.8" />
        <ellipse cx="490" cy="620" rx="85" ry="22" fill="none" stroke="#c0c4dc" stroke-width="3" opacity="0.6" transform="rotate(-20 490 620)" />
      </svg>

      <!-- Tarjeta informativa con borde amarillo -->
      <div class="brand-hero-card">
        <div class="brand-badge-row">
          <span class="brand-name">
            <svg class="star-icon" viewBox="0 0 24 24" fill="none" stroke="#f6ad55" stroke-width="2.5">
              <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" fill="#f6ad55" />
            </svg>
            AstroVisor
          </span>
          <span class="admin-pill">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="lock-mini">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            Administración
          </span>
        </div>

        <div class="hero-callout">
          <div class="yellow-accent-bar"></div>
          <div>
            <h1 class="hero-title">Panel del personal</h1>
            <p class="hero-subtitle">Prepara el recorrido de AstroVisor para el visor Homido.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Mitad Derecha: Fondo Crema con Tarjeta de Acceso -->
    <div class="login-form-side">
      <div class="login-card-floating">
        <div class="lock-icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.4" class="lock-svg">
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
        </div>

        <h2 class="card-title">Acceso del personal</h2>
        <p class="card-subtitle">Solo para personal autorizado de la biblioteca.</p>

        <div v-if="!isSupabaseConfigured" class="env-notice">
          <small>⚠️ Configura tu <strong>SUPABASE_PUBLISHABLE_KEY</strong> en <code>frontend/.env</code></small>
        </div>

        <div v-if="isAuthenticated" class="active-session-box">
          <p>Sesión activa como: <strong>{{ userDisplayName }}</strong></p>
          <RouterLink to="/admin" class="btn-submit">Ir al Panel</RouterLink>
        </div>

        <form v-else @submit.prevent="handleSubmit" class="auth-form" novalidate>
          <div v-if="errorMessage" class="error-banner" role="alert">
            {{ errorMessage }}
          </div>

          <div class="field-group">
            <label for="admin-user">Usuario</label>
            <input
              id="admin-user"
              v-model="username"
              type="text"
              required
              autocomplete="username"
              placeholder="admin o root"
              :disabled="isSubmitting"
              class="styled-input"
            />
          </div>

          <div class="field-group">
            <label for="admin-password">Contraseña</label>
            <div class="password-wrapper">
              <input
                id="admin-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                :disabled="isSubmitting"
                class="styled-input with-toggle"
              />
              <button
                type="button"
                class="toggle-pass-btn"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'Ocultar' : 'Mostrar contraseña' }}
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="btn-submit"
            :disabled="isSubmitting || !isSupabaseConfigured"
          >
            <span v-if="isSubmitting">Verificando...</span>
            <span v-else>Entrar</span>
          </button>

          <div class="return-link-container">
            <RouterLink to="/" class="return-link">Volver al sitio público</RouterLink>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
