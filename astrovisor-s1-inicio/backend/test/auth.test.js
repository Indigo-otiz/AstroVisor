import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { randomBytes } from 'node:crypto'
import { once } from 'node:events'
import { crearApp } from '../src/index.js'
import { crearConfiguracionAdmin } from '../src/services/adminCredentials.js'
import { crearSesion, obtenerSesion, destruirSesion, crearLimitadorLogin } from '../src/middleware/auth.js'

const password = ` ${randomBytes(24).toString('hex')} `
const configuracion = await crearConfiguracionAdmin('equipo-prueba', 'Prueba aislada', password)
async function entorno(t, configurado = true) {
  const dir = await mkdtemp(join(tmpdir(), 'astrovisor-auth-http-'))
  assert.equal(dirname(dir), tmpdir())
  const archivo = join(dir, 'admin.json')
  const anterior = process.env.ASTROVISOR_ADMIN_FILE
  process.env.ASTROVISOR_ADMIN_FILE = configurado ? archivo : ''
  if (configurado) await writeFile(archivo, JSON.stringify(configuracion), { mode: 0o600 })
  const app = crearApp()
  assert.equal(app.get('trust proxy'), false)
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const base = `http://127.0.0.1:${server.address().port}`
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve))
    if (anterior === undefined) delete process.env.ASTROVISOR_ADMIN_FILE
    else process.env.ASTROVISOR_ADMIN_FILE = anterior
    await rm(dir, { recursive: true, force: true })
  })
  const pedir = (ruta, opciones = {}) => fetch(base + ruta, opciones)
  const login = (usuario = 'equipo-prueba', contrasena = password) => pedir('/api/admin/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario, contrasena }),
  })
  return { archivo, pedir, login }
}

test('tokens opacos expiran y se invalidan sin depender del estado Vue', (t) => {
  const token = crearSesion({ id: 'fixture', usuario: 'fixture', nombre: 'Prueba', huella: 'fixture' })
  assert.match(token, /^[a-f0-9]{64}$/)
  const expira = obtenerSesion(token).expiracion
  t.mock.method(Date, 'now', () => expira)
  assert.equal(obtenerSesion(token), null)
  destruirSesion(token)
})

test('login válido, consulta de sesión, logout y rechazo posterior', async (t) => {
  const { pedir, login } = await entorno(t)
  const respuesta = await login()
  assert.equal(respuesta.status, 200)
  assert.equal(respuesta.headers.get('cache-control'), 'no-store')
  const data = await respuesta.json()
  assert.deepEqual(Object.keys(data.usuario).sort(), ['id', 'nombre', 'usuario'])
  assert.match(data.token, /^[a-f0-9]{64}$/)
  const headers = { Authorization: `Bearer ${data.token}` }
  assert.equal((await pedir('/api/admin/sesion', { headers })).status, 200)
  assert.equal((await pedir('/api/admin/logout', { method: 'POST', headers })).status, 200)
  assert.equal((await pedir('/api/admin/sesion', { headers })).status, 401)
})

test('credenciales inválidas y ausencia de token o token falso son rechazados', async (t) => {
  const { pedir, login } = await entorno(t)
  assert.equal((await login('equipo-prueba', 'incorrecta')).status, 401)
  assert.equal((await login('usuario-desconocido')).status, 401)
  assert.equal((await pedir('/api/admin/sesion')).status, 401)
  assert.equal((await pedir('/api/admin/sesion', { headers: { Authorization: 'Bearer inventado' } })).status, 401)
})

test('token expirado es rechazado por el endpoint protegido', async (t) => {
  const { pedir, login } = await entorno(t)
  const { token } = await (await login()).json()
  const expiracion = obtenerSesion(token).expiracion
  t.mock.method(Date, 'now', () => expiracion)
  assert.equal((await pedir('/api/admin/sesion', { headers: { Authorization: `Bearer ${token}` } })).status, 401)
})

test('sin configuración y con flags de pruebas no existe cuenta demo funcional', async (t) => {
  const { login } = await entorno(t, false)
  assert.equal((await login()).status, 503)
  assert.equal((await login('admin', 'admin123')).status, 503)
})

test('cambiar o retirar configuración revoca sesiones existentes', async (t) => {
  const { archivo, pedir, login } = await entorno(t)
  const { token } = await (await login()).json()
  const config = JSON.parse(await readFile(archivo, 'utf8'))
  config.admin.nombre = 'Configuración rotada'
  await writeFile(archivo, JSON.stringify(config))
  const headers = { Authorization: `Bearer ${token}` }
  assert.equal((await pedir('/api/admin/sesion', { headers })).status, 401)
  const otro = await (await login()).json()
  await rm(archivo)
  assert.equal((await pedir('/api/admin/sesion', { headers: { Authorization: `Bearer ${otro.token}` } })).status, 503)
})

test('integración rechaza JSON corrupto y configuración inválida, y no recupera sesiones revocadas', async (t) => {
  const { archivo, pedir, login } = await entorno(t)
  const { token } = await (await login()).json()
  const headers = { Authorization: `Bearer ${token}` }
  const invalida = structuredClone(configuracion)
  invalida.admin.scrypt.hash = 'hash-invalido'
  for (const [indice, contenido] of ['{', JSON.stringify(invalida)].entries()) {
    await writeFile(archivo, contenido)
    assert.equal((await login()).status, 503)
    assert.equal((await pedir('/api/admin/sesion', { headers })).status, indice === 0 ? 503 : 401)
  }
  await writeFile(archivo, JSON.stringify(configuracion))
  assert.equal((await pedir('/api/admin/sesion', { headers })).status, 401)
  assert.equal((await login()).status, 200)
})

test('límite de intentos precede a la derivación de contraseñas', () => {
  let ahora = 0, permitidos = 0, estado, retry
  const limitar = crearLimitadorLogin({ ahora: () => ahora })
  const req = { ip: '127.0.0.1' }
  const res = { set(k, v) { retry = v; return this }, status(v) { estado = v; return this }, json() {} }
  for (let i = 0; i < 6; i++) limitar(req, res, () => permitidos++)
  assert.equal(permitidos, 5)
  assert.equal(estado, 429)
  assert.equal(Number(retry), 900)
  ahora = 900000
  limitar(req, res, () => permitidos++)
  assert.equal(permitidos, 6)
})

test('HTTP limita login repetido y no ofrece escrituras administrativas', async (t) => {
  const { pedir, login } = await entorno(t)
  const { token } = await (await login()).json()
  assert.equal((await pedir('/api/admin/libros', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })).status, 404)
  for (let i = 0; i < 4; i++) await pedir('/api/admin/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json',
      'X-Forwarded-For': `192.0.2.${i + 1}`, 'X-Real-IP': `192.0.2.${i + 1}`,
      Forwarded: `for=192.0.2.${i + 1}` }, body: '{}',
  })
  const respuesta = await login()
  assert.equal(respuesta.status, 429)
  assert.ok(Number(respuesta.headers.get('retry-after')) > 0)
})

test('contraseñas, hashes, tokens y cuerpos inválidos no aparecen en logs', async (t) => {
  const logs = []
  t.mock.method(console, 'log', (...args) => logs.push(args.join(' ')))
  t.mock.method(console, 'error', (...args) => logs.push(args.join(' ')))
  const { pedir, login } = await entorno(t)
  const { token } = await (await login()).json()
  await pedir(`/api/admin/login?contrasena=${encodeURIComponent(password)}`, { method: 'POST' })
  await pedir(`/api/admin/sesion?token=${token}`)
  await pedir('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: `{"contrasena":"${password}"` })
  assert.ok(!logs.join('\n').includes(password))
  assert.ok(!logs.join('\n').includes(token))
  assert.ok(!logs.join('\n').includes(configuracion.admin.scrypt.hash))
})
