import { ref, computed } from 'vue'

const STORAGE_KEY = 'astrovisor_admin_session'
const user = ref(null)
const token = ref(null)
const loading = ref(false)

try {
  localStorage.removeItem(STORAGE_KEY)
  const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null')
  if (typeof saved?.token === 'string' && saved.token.length <= 128) token.value = saved.token
} catch { /* Sin almacenamiento disponible, la sesión solo dura en memoria. */ }

function limpiar() {
  user.value = null
  token.value = null
  try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
}
function guardar() {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ token: token.value })) } catch {}
}
const usuarioValido = (u) => u && typeof u.id === 'string' && typeof u.usuario === 'string' && typeof u.nombre === 'string'

export function useAuth() {
  const isAuthenticated = computed(() => Boolean(user.value && token.value))
  const userDisplayName = computed(() => user.value?.nombre || user.value?.usuario || 'Administrador')
  const username = computed(() => user.value?.usuario || '')

  async function verificarSesion() {
    if (!token.value) { limpiar(); return false }
    const actual = token.value
    loading.value = true
    try {
      const respuesta = await fetch('/api/admin/sesion', { headers: { Authorization: `Bearer ${actual}` }, credentials: 'same-origin' })
      const data = await respuesta.json()
      if (token.value !== actual) return false
      if (!respuesta.ok || !data.ok || !usuarioValido(data.admin)) { limpiar(); return false }
      user.value = data.admin
      return true
    } catch { if (token.value === actual) limpiar(); return false }
    finally { loading.value = false }
  }

  async function signIn(usuario, password) {
    limpiar()
    loading.value = true
    try {
      const respuesta = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin',
        body: JSON.stringify({ usuario: usuario.trim(), contrasena: password }),
      })
      const data = await respuesta.json()
      if (!respuesta.ok || !data.ok) throw new Error(data.error || 'Usuario o contraseña incorrectos.')
      if (typeof data.token !== 'string' || !/^[a-f0-9]{64}$/.test(data.token) || !usuarioValido(data.usuario)) throw new Error('Respuesta de acceso inválida')
      token.value = data.token
      user.value = data.usuario
      guardar()
      return data
    } finally { loading.value = false }
  }

  async function signOut() {
    const anterior = token.value
    limpiar()
    if (!anterior) return
    try {
      await fetch('/api/admin/logout', { method: 'POST', headers: { Authorization: `Bearer ${anterior}` }, credentials: 'same-origin' })
    } catch { /* La sesión cliente ya fue retirada; servidor conserva su expiración. */ }
  }

  return { user, token, loading, isAuthenticated, userDisplayName, username, signIn, signOut, verificarSesion }
}
