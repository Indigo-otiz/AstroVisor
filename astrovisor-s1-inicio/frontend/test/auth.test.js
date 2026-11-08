import test from 'node:test'
import assert from 'node:assert/strict'

let numero = 0
const clave = 'astrovisor_admin_session'
function storage(initial = {}) {
  const valores = new Map(Object.entries(initial))
  return { getItem: (k) => valores.get(k) ?? null, setItem: (k, v) => valores.set(k, v), removeItem: (k) => valores.delete(k) }
}
async function nuevo(initial = {}) {
  globalThis.localStorage = storage({ [clave]: JSON.stringify({ token: 'legado', user: { id: 'falso' } }) })
  globalThis.sessionStorage = storage(initial)
  return (await import(`../src/composables/useAuth.js?caso=${numero++}`)).useAuth()
}

test('login mantiene contrato HTTP y contraseña intacta sin ponerla en URL', async (t) => {
  const auth = await nuevo()
  const password = ' contraseña con espacios '
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/admin/login')
    assert.equal(options.method, 'POST')
    assert.deepEqual(JSON.parse(options.body), { usuario: 'cuenta-local', contrasena: password })
    return new Response(JSON.stringify({ ok: true, token: 'a'.repeat(64), usuario: { id: 'cuenta', usuario: 'cuenta-local', nombre: 'Equipo' } }))
  })
  await auth.signIn(' cuenta-local ', password)
  assert.equal(auth.isAuthenticated.value, true)
  assert.equal(localStorage.getItem(clave), null)
  assert.ok(sessionStorage.getItem(clave))
})

test('estado local adulterado no acredita sesión; la respuesta servidor decide', async (t) => {
  const auth = await nuevo({ [clave]: JSON.stringify({ token: 'falso', user: { id: 'falso' } }) })
  assert.equal(auth.isAuthenticated.value, false)
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/admin/sesion')
    assert.equal(options.headers.Authorization, 'Bearer falso')
    return new Response('{}', { status: 401 })
  })
  assert.equal(await auth.verificarSesion(), false)
  assert.equal(auth.token.value, null)
  assert.equal(sessionStorage.getItem(clave), null)
})

test('sesión restaurada requiere servidor y logout limpia estado incluso si falla la red', async (t) => {
  const auth = await nuevo({ [clave]: JSON.stringify({ token: 'b'.repeat(64) }) })
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ ok: true, admin: { id: 'cuenta', usuario: 'equipo', nombre: 'Equipo' } })))
  assert.equal(await auth.verificarSesion(), true)
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('sin red') })
  await auth.signOut()
  assert.equal(auth.isAuthenticated.value, false)
  assert.equal(sessionStorage.getItem(clave), null)
})

test('configuración ausente se muestra como error y no crea sesión cliente', async (t) => {
  const auth = await nuevo()
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({ error: 'Autenticación no disponible' }), { status: 503 }))
  await assert.rejects(auth.signIn('cuenta-local', 'contraseña-prueba'), /no disponible/)
  assert.equal(auth.isAuthenticated.value, false)
})

test('una verificación tardía no permite entrar después de cerrar sesión', async (t) => {
  const auth = await nuevo({ [clave]: JSON.stringify({ token: 'c'.repeat(64) }) })
  let resolver
  t.mock.method(globalThis, 'fetch', (url) => url === '/api/admin/sesion'
    ? new Promise((resolve) => { resolver = resolve }) : Promise.resolve(new Response('{}')))
  const pendiente = auth.verificarSesion()
  await auth.signOut()
  resolver(new Response(JSON.stringify({ ok: true, admin: { id: 'cuenta', usuario: 'equipo', nombre: 'Equipo' } })))
  assert.equal(await pendiente, false)
  assert.equal(auth.isAuthenticated.value, false)
})
