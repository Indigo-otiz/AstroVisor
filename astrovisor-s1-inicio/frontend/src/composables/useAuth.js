import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured } from '../services/supabaseClient.js'

const STORAGE_KEY = 'astrovisor_admin_session'

// Estado reactivo global
const user = ref(null)
const loading = ref(true)

// Restaurar sesión guardada en localStorage al arrancar
function initAuth() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      user.value = JSON.parse(saved)
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

  /**
   * Inicia sesión validando contra la tabla 'admin' en Supabase
   */
  async function signIn(userIdentifier, password) {
    if (!isSupabaseConfigured) {
      throw new Error(
        'Supabase no está configurado. Por favor ingresa tus claves en frontend/.env'
      )
    }

    loading.value = true
    try {
      const cleanUser = userIdentifier.trim()
      const cleanPass = password.trim()

      const { data, error } = await supabase
        .from('admin')
        .select('id, usuario, nombre, creado_en')
        .eq('usuario', cleanUser)
        .eq('contrasena', cleanPass)
        .maybeSingle()

      if (error) {
        throw new Error(`Error en base de datos: ${error.message}`)
      }

      if (!data) {
        throw new Error('Usuario o contraseña incorrectos.')
      }

      // Guardar sesión
      user.value = data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

      return data
    } finally {
      loading.value = false
    }
  }

  /**
   * Cierra sesión
   */
  function signOut() {
    user.value = null
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    user,
    loading,
    isAuthenticated,
    userDisplayName,
    username,
    isSupabaseConfigured,
    signIn,
    signOut,
  }
}
