import { ref, computed } from 'vue'

const STORAGE_KEY = 'astrovisor_admin_session'

// Estado reactivo global
const user = ref(null)
const token = ref(null)
const loading = ref(true)

// Restaurar sesión guardada en localStorage al arrancar
function initAuth() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      user.value = parsed.user || parsed
      token.value = parsed.token || null
    }
  } catch (err) {
    console.error('[AstroVisor Auth] Error al leer sesión guardada:', err)
    localStorage.removeItem(STORAGE_KEY)
  } finally {
    loading.value = false
  }
}

initAuth()

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(user.value))
  const userDisplayName = computed(() => user.value?.nombre || user.value?.usuario || 'Administrador')
  const username = computed(() => user.value?.usuario || '')
  const isSupabaseConfigured = ref(true)

  /**
   * Inicia sesión autenticando y verificando credenciales en el servidor Express
   */
  async function signIn(userIdentifier, password) {
    loading.value = true
    try {
      const cleanUser = userIdentifier.trim()
      const cleanPass = password.trim()

      const respuesta = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: cleanUser,
          contrasena: cleanPass,
        }),
      })

      const data = await respuesta.json()

      if (!respuesta.ok || !data.ok) {
        throw new Error(data.error || 'Usuario o contraseña incorrectos.')
      }

      // Guardar token y usuario devueltos por Express
      user.value = data.usuario
      token.value = data.token

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          user: data.usuario,
          token: data.token,
        })
      )

      return data
    } finally {
      loading.value = false
    }
  }

  /**
   * Cierra sesión notificando al servidor Express e invalidando el token
   */
  async function signOut() {
    if (token.value) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.value}`,
          },
        })
      } catch (err) {
        console.warn('[AstroVisor Auth] Falló notificación de logout al servidor:', err)
      }
    }

    user.value = null
    token.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    userDisplayName,
    username,
    isSupabaseConfigured,
    signIn,
    signOut,
  }
}
