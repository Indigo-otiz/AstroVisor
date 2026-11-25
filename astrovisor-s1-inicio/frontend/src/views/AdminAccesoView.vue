<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { hayBorradorPendiente, descartarBorradorPendiente } from '../composables/useEditorCatalogo.js'

const router = useRouter()
const { signIn, signOut, isAuthenticated, userDisplayName, loading, verificarSesion } = useAuth()
onMounted(verificarSesion)

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const isSubmitting = ref(false)

async function handleLogout() {
  descartarBorradorPendiente()
  await signOut()
}

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
    <!-- Fondo atmosférico difuminado -->
    <div class="login-bg-image" aria-hidden="true"></div>
    <div class="login-bg-overlay" aria-hidden="true"></div>

    <!-- Tarjeta compacta centrada -->
    <main class="login-card-floating">
      <div class="login-brand-mini">
        <span class="brand-name-mini">
          <svg class="star-icon-mini" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z" fill="#caa065" />
          </svg>
          AstroVisor
        </span>
        <span class="admin-pill-mini">Administración</span>
      </div>

      <h1 class="card-title">Acceso del personal</h1>
      <p class="card-subtitle">Personal autorizado de la biblioteca.</p>

      <div v-if="isAuthenticated" class="active-session-box">
        <p>Sesión activa: <strong>{{ userDisplayName }}</strong></p>
        <div class="active-session-actions">
          <RouterLink to="/admin" class="btn-submit">Ir al panel</RouterLink>
          <button type="button" class="btn-demo-access" @click="handleLogout">
            Cerrar sesión
          </button>
        </div>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="auth-form" novalidate>
        <p v-if="hayBorradorPendiente" class="env-notice" role="status">
          Tu sesión terminó. Hay un borrador en memoria de esta pestaña; inicia sesión con la misma cuenta para recuperarlo.
        </p>
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
            placeholder="Usuario"
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
              {{ showPassword ? 'Ocultar' : 'Mostrar' }}
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="btn-submit"
          :disabled="isSubmitting || loading"
        >
          <span v-if="isSubmitting">Verificando...</span>
          <span v-else>Entrar</span>
        </button>
      </form>

      <div class="login-card-footer">
        <RouterLink :to="{ path: '/admin', query: { modo: 'demo' } }" class="btn-demo-access" title="Explorar el panel en modo demostración">
          Modo demo
        </RouterLink>
        <RouterLink to="/" class="return-link">Volver al inicio</RouterLink>
      </div>
    </main>
  </div>
</template>
