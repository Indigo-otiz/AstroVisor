import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, readFile, rm, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomBytes, createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { once } from 'node:events'
import { spawn } from 'node:child_process'
import { crearApp } from '../src/index.js'
import { crearConfiguracionAdmin } from '../src/services/adminCredentials.js'
import { inicializarCatalogo, obtenerCatalogo } from '../src/services/documentRepository.js'

const password = randomBytes(24).toString('hex')
const config = await crearConfiguracionAdmin('editor-aislado', 'Prueba documental', password)
const altaDinamica = { id: 'cielo-nuevo', titulo: 'Historias del cielo', autor: 'Equipo de prueba', anio: 2020,
  enlacePublico: 'https://example.org/obra-temporal', portada: { tipo: 'ilustrativa', plantilla: 'guia', paleta: 'verde' },
  relaciones: [{ constelacionId: 'orion', motivo: 'Lectura de prueba' }, { constelacionId: 'escorpio', motivo: 'Otra lectura de prueba' }] }
async function activosPublicos() {
  const archivos = []
  for (const nombre of ['public', 'dist']) {
    const raiz = fileURLToPath(new URL(`../../frontend/${nombre}/`, import.meta.url))
    let entradas
    try { entradas = await readdir(raiz, { recursive: true, withFileTypes: true }) }
    catch (e) { if (e.code === 'ENOENT') continue; throw e }
    for (const e of entradas.filter((e) => e.isFile())) {
      const ruta = join(e.parentPath, e.name)
      archivos.push([ruta, createHash('sha256').update(await readFile(ruta)).digest('hex')])
    }
  }
  return archivos.sort(([a], [b]) => a.localeCompare(b))
}
async function entorno(t, preparar) {
  const dir = await mkdtemp(join(tmpdir(), 'astrovisor-s4-admin-'))
  const previo = { ASTROVISOR_DATA_DIR: process.env.ASTROVISOR_DATA_DIR, ASTROVISOR_ADMIN_FILE: process.env.ASTROVISOR_ADMIN_FILE }
  const datos = join(dir, 'datos')
  await inicializarCatalogo({ directorio: datos })
  if (preparar) await preparar(datos)
  const credenciales = join(dir, 'admin.json')
  await writeFile(credenciales, JSON.stringify(config), { mode: 0o600 })
  process.env.ASTROVISOR_DATA_DIR = datos
  process.env.ASTROVISOR_ADMIN_FILE = credenciales
  const app = crearApp(), server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const base = `http://127.0.0.1:${server.address().port}`
  const pedir = (ruta, options) => fetch(base + ruta, options)
  t.after(async () => {
    if (server.listening) await new Promise((r) => server.close(r))
    await app.locals.cerrarEscritor?.()
    for (const [k, v] of Object.entries(previo)) { if (v === undefined) delete process.env[k]; else process.env[k] = v }
    await rm(dir, { recursive: true, force: true })
  })
  const sesion = await pedir('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario: 'editor-aislado', contrasena: password }) })
  assert.equal(sesion.status, 200)
  const { token } = await sesion.json()
  const headers = { Authorization: `Bearer ${token}` }
  const guardar = (ruta, body, etag = '"catalogo-1"', method = 'PATCH') => pedir(ruta, {
    method, headers: { ...headers, 'Content-Type': 'application/json', ...(etag === null ? {} : { 'If-Match': etag }) },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  })
  return { datos, pedir, headers, guardar, app, server }
}

test('alta dinámica, previsualización, revalidación y revisión obsoleta sin modificar SVG iniciales', async (t) => {
  const activos = await activosPublicos()
  const { datos, pedir, headers, guardar } = await entorno(t)
  const original = await obtenerCatalogo({ directorio: datos })
  const preview = await guardar('/api/admin/portadas/previsualizar', { titulo: altaDinamica.titulo, autor: altaDinamica.autor, portada: altaDinamica.portada }, '"catalogo-1"', 'POST')
  assert.equal(preview.status, 200); const svg = await preview.text()
  assert.equal((await obtenerCatalogo({ directorio: datos })).revision, 1)
  const r = await guardar('/api/admin/libros', altaDinamica, '"catalogo-1"', 'POST')
  assert.equal(r.status, 201); assert.equal(r.headers.get('etag'), '"catalogo-2"')
  const c = await obtenerCatalogo({ directorio: datos })
  assert.deepEqual(c.libros.slice(0, 3), original.libros)
  for (let i = 0; i < 3; i++) {
    assert.deepEqual(c.recorridos[i].multimedia, original.recorridos[i].multimedia)
    assert.deepEqual(c.recorridos[i].libroRefs.slice(0, 3), original.recorridos[i].libroRefs)
  }
  const publico = await (await pedir('/api/contenidos/libros')).json()
  const libro = publico.find((l) => l.id === altaDinamica.id)
  assert.equal(Object.keys(libro.recomendaciones).length, 2)
  assert.equal(libro.portadaIlustrativa, '/api/contenidos/libros/cielo-nuevo/portada.svg?revision=2')
  const portada = await pedir(libro.portadaIlustrativa)
  assert.equal(portada.status, 200); assert.equal(await portada.text(), svg)
  assert.match(portada.headers.get('content-type'), /image\/svg\+xml/)
  assert.equal(portada.headers.get('x-content-type-options'), 'nosniff')
  assert.equal((await pedir(libro.portadaIlustrativa, { headers: { 'If-None-Match': portada.headers.get('etag') } })).status, 304)
  const admin = await (await pedir('/api/admin/catalogo', { headers })).json()
  assert.equal(admin.libros.at(-1).portadaIlustrativa, libro.portadaIlustrativa)
  assert.deepEqual(await activosPublicos(), activos)
  await guardar('/api/admin/recorridos/orion', { resumen: 'Revisión siguiente' }, '"catalogo-2"')
  assert.equal((await pedir(libro.portadaIlustrativa, { headers: { 'If-None-Match': portada.headers.get('etag') } })).status, 409)
  for (const [ruta, status] of [['cielo-nuevo/portada.svg', 400], ['ausente/portada.svg?revision=3', 404], ['INVALIDO/portada.svg?revision=3', 400], ['cielo-nuevo/portada.svg?revision=3&archivo=x', 400]]) {
    assert.equal((await pedir('/api/contenidos/libros/' + ruta)).status, status)
  }
})

test('alta y preview rechazan sesión, revisión, parámetros y relaciones inválidas sin guardar', async (t) => {
  const { datos, pedir, guardar } = await entorno(t)
  for (const ruta of ['/api/admin/libros', '/api/admin/portadas/previsualizar']) {
    assert.equal((await pedir(ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(altaDinamica) })).status, 401)
    assert.equal((await guardar(ruta, altaDinamica, null, 'POST')).status, 428)
    assert.equal((await guardar(ruta, altaDinamica, '"catalogo-9"', 'POST')).status, 412)
  }
  for (const cambio of [{ id: '../x' }, { titulo: '<svg onload="x">' }, { portada: { ...altaDinamica.portada, paleta: 'rojo' } }, { portada: { ...altaDinamica.portada, src: '/privado' } }, { relaciones: [{ constelacionId: 'ausente', motivo: 'No' }] }]) {
    assert.equal((await guardar('/api/admin/libros', { ...altaDinamica, ...cambio }, '"catalogo-1"', 'POST')).status, 400)
  }
  for (const titulo of ['\u01c4'.repeat(10), 'W'.repeat(200), '<svg']) {
    const d = { titulo, autor: altaDinamica.autor, portada: altaDinamica.portada }
    assert.equal((await guardar('/api/admin/portadas/previsualizar', d, '"catalogo-1"', 'POST')).status, 400)
    assert.equal((await guardar('/api/admin/libros', { ...altaDinamica, titulo }, '"catalogo-1"', 'POST')).status, 400)
  }
  assert.equal((await obtenerCatalogo({ directorio: datos })).revision, 1)
  assert.equal((await guardar('/api/admin/libros', altaDinamica, '"catalogo-1"', 'POST')).status, 201)
  assert.equal((await guardar('/api/admin/libros', altaDinamica, '"catalogo-1"', 'POST')).status, 412)
  assert.equal((await guardar('/api/admin/libros', altaDinamica, '"catalogo-2"', 'POST')).status, 409)
})

test('GET administrativo exige sesión y devuelve revisión; PATCH persiste y API pública refleja cambio', async (t) => {
  const { datos, pedir, headers, guardar } = await entorno(t)
  assert.equal((await pedir('/api/admin/catalogo')).status, 401)
  const get = await pedir('/api/admin/catalogo', { headers })
  assert.equal(get.status, 200)
  assert.equal(get.headers.get('etag'), '"catalogo-1"')
  const original = await get.json()
  const r = await guardar('/api/admin/libros/star-lore', { titulo: 'Título revisado' })
  assert.equal(r.status, 200)
  assert.equal(r.headers.get('etag'), '"catalogo-2"')
  assert.equal((await r.json()).revision, 2)
  const c = await obtenerCatalogo({ directorio: datos })
  assert.deepEqual(c.recorridos, original.recorridos)
  assert.equal(c.libros[0].titulo, 'Título revisado')
  assert.equal((await (await pedir('/api/contenidos/libros')).json())[0].titulo, 'Título revisado')
  const salida = JSON.stringify(await (await pedir('/api/admin/catalogo', { headers })).json())
  for (const privado of [password, config.admin.scrypt.hash, datos, 'escritor.lock']) assert.ok(!salida.includes(privado))
})

test('escritura rechazada sin token y precondiciones ausentes, inválidas u obsoletas', async (t) => {
  const { pedir, guardar, datos } = await entorno(t)
  for (const [ruta, method] of [['/api/admin/libros', 'POST'], ['/api/admin/libros/star-lore', 'PATCH'], ['/api/admin/recorridos/orion', 'PATCH']]) {
    assert.equal((await pedir(ruta, { method, headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 401)
  }
  assert.equal((await guardar('/api/admin/libros/star-lore', { titulo: 'Sin condición' }, null)).status, 428)
  assert.equal((await guardar('/api/admin/libros/star-lore', { titulo: 'Mal' }, '*')).status, 400)
  assert.equal((await guardar('/api/admin/libros/star-lore', { titulo: 'Viejo' }, '"catalogo-9"')).status, 412)
  assert.equal((await obtenerCatalogo({ directorio: datos })).revision, 1)
})

test('dos PATCH con If-Match igual solo confirman uno', async (t) => {
  const { guardar } = await entorno(t)
  const respuestas = await Promise.all(['Uno', 'Dos'].map((titulo) => guardar('/api/admin/libros/star-lore', { titulo })))
  assert.deepEqual(respuestas.map((r) => r.status).sort(), [200, 412])
})

test('campos prohibidos, prototipos, relaciones rotas y datos malformados no avanzan revisión', async (t) => {
  const { guardar, datos } = await entorno(t)
  const casos = [
    { id: 'otro' }, { revision: 7 }, { demostracion: false }, { marc21: {} },
    { titulo: 'x'.repeat(201) }, { titulo: '<script>alert(1)</script>' }, { enlacePublico: 'javascript:alert(1)' },
    { portadaIlustrativa: '/etc/passwd' }, { relaciones: [{ constelacionId: 'ausente', motivo: 'Lectura' }] },
    '{"__proto__":{"admin":true}}', '[]', '{',
    '{"titulo":' + '{"x":'.repeat(8000) + '"texto"' + '}'.repeat(8000) + '}',
  ]
  for (const body of casos) assert.equal((await guardar('/api/admin/libros/star-lore', body)).status, 400)
  assert.equal((await obtenerCatalogo({ directorio: datos })).revision, 1)
  assert.equal({}.admin, undefined)
  assert.equal((await guardar('/api/admin/libros/ausente', { titulo: 'Inexistente' })).status, 404)
  assert.equal((await guardar('/api/admin/libros/star-lore', { enlacePublico: 'https://www.gutenberg.org/ebooks/23300' })).status, 409)
  assert.equal((await guardar('/api/admin/libros/star-lore', { relaciones: [
    { constelacionId: 'orion', motivo: 'Uno' }, { constelacionId: 'orion', motivo: 'Dos' },
  ] })).status, 409)
})

test('edición de resumen conserva audio y nueve vínculos; historia distinta con audio produce 409', async (t) => {
  const { guardar, datos } = await entorno(t)
  const antes = await obtenerCatalogo({ directorio: datos })
  assert.equal((await guardar('/api/admin/recorridos/orion', { historia: 'Narración distinta' })).status, 409)
  assert.equal((await guardar('/api/admin/recorridos/orion', { multimedia: [] })).status, 400)
  assert.equal((await guardar('/api/admin/recorridos/orion', { resumen: 'Resumen revisado' })).status, 200)
  const despues = await obtenerCatalogo({ directorio: datos })
  assert.deepEqual(despues.recorridos[0].multimedia, antes.recorridos[0].multimedia)
  assert.deepEqual(despues.recorridos.map((r) => r.libroRefs), antes.recorridos.map((r) => r.libroRefs))
  assert.deepEqual(despues.libros, antes.libros)
})

test('POST rechaza duplicados y portada inexistente; no reutiliza portada de otro ID', async (t) => {
  const { guardar } = await entorno(t)
  const base = { id: 'star-lore', titulo: 'Obra', autor: 'Autor', enlacePublico: 'https://example.org/obra', portadaIlustrativa: '/libros-demo/star-lore.svg', relaciones: [{ constelacionId: 'orion', motivo: 'Lectura' }] }
  assert.equal((await guardar('/api/admin/libros', base, '"catalogo-1"', 'POST')).status, 409)
  assert.equal((await guardar('/api/admin/libros', { ...base, id: 'nuevo', portadaIlustrativa: '/libros-demo/nuevo.svg' }, '"catalogo-1"', 'POST')).status, 409)
  assert.equal((await guardar('/api/admin/libros', { ...base, id: 'nuevo' }, '"catalogo-1"', 'POST')).status, 400)
})

test('POST con portada existente del mismo ID crea registro demo y relación en una transacción', async (t) => {
  let libro
  const { guardar, datos } = await entorno(t, async (directorio) => {
    const c = await obtenerCatalogo({ directorio })
    libro = c.libros.pop()
    for (const r of c.recorridos) r.libroRefs = r.libroRefs.filter((ref) => ref.libroId !== libro.id)
    await writeFile(join(directorio, 'catalogo.json'), JSON.stringify(c))
  })
  const { marc21, demostracion, ...campos } = libro
  const r = await guardar('/api/admin/libros', { ...campos, relaciones: [{ constelacionId: 'orion', motivo: 'Nueva recomendación' }] }, '"catalogo-1"', 'POST')
  assert.equal(r.status, 201)
  const c = await obtenerCatalogo({ directorio: datos })
  assert.equal(c.libros.length, 3)
  assert.equal(c.libros[2].id, 'half-hours')
  assert.equal(c.libros[2].demostracion, true)
  assert.equal(c.libros[2].marc21.ubicacion852, null)
  assert.equal(c.recorridos[0].libroRefs.at(-1).libroId, 'half-hours')
})

test('respaldo no disponible y catálogo corrupto producen 503 y no éxito de escritura', async (t) => {
  const { guardar, datos, pedir, headers } = await entorno(t)
  await writeFile(join(datos, 'backups'), 'obstáculo')
  const antes = await readFile(join(datos, 'catalogo.json'), 'utf8')
  const r = await guardar('/api/admin/libros/star-lore', { titulo: 'No confirmado' })
  assert.equal(r.status, 503)
  assert.ok(!(await r.text()).includes(datos))
  assert.equal(await readFile(join(datos, 'catalogo.json'), 'utf8'), antes)
  await writeFile(join(datos, 'catalogo.json'), '{')
  assert.equal((await pedir('/api/admin/catalogo', { headers })).status, 503)
  assert.equal((await guardar('/api/admin/libros/star-lore', { titulo: 'No confirmado' })).status, 503)
})

test('proceso nuevo adquiere escritor y sirve por HTTP el cambio confirmado previamente', { timeout: 15000 }, async (t) => {
  const { guardar, datos, app, server } = await entorno(t)
  assert.equal((await guardar('/api/admin/libros/star-lore', { titulo: 'Persistido entre procesos' })).status, 200)
  await new Promise((r) => server.close(r))
  await app.locals.cerrarEscritor()
  const modulo = new URL('../src/index.js', import.meta.url).href
  const hijo = spawn(process.execPath, ['--input-type=module', '-e', `
    import {crearApp} from '${modulo}';const app=crearApp();await app.locals.iniciarEscritor();
    const server=app.listen(0,'127.0.0.1',()=>console.log(server.address().port));
    process.stdin.once('data',()=>server.close(async()=>{await app.locals.cerrarEscritor();process.exit(0)}));
  `], { env: { ...process.env, ASTROVISOR_DATA_DIR: datos }, stdio: ['pipe', 'pipe', 'pipe'] })
  t.after(() => { if (hijo.exitCode === null) hijo.kill() })
  const [salida] = await once(hijo.stdout, 'data')
  const puerto = Number(salida.toString().trim())
  assert.ok(puerto > 0)
  const libros = await (await fetch(`http://127.0.0.1:${puerto}/api/contenidos/libros`)).json()
  assert.equal(libros[0].titulo, 'Persistido entre procesos')
  const fin = once(hijo, 'exit')
  hijo.stdin.end('cerrar')
  assert.equal((await fin)[0], 0)
})

test('actualizar motivos por libro o recorrido conserva nueve relaciones y metadatos de referencia', async (t) => {
  const { guardar, datos } = await entorno(t)
  const antes = await obtenerCatalogo({ directorio: datos })
  assert.equal((await guardar('/api/admin/libros/star-lore', { relaciones: [{ constelacionId: 'orion', motivo: 'Motivo revisado' }] })).status, 200)
  assert.equal((await guardar('/api/admin/recorridos/orion', { libroRefs: [{ libroId: 'half-hours', motivo: 'Otra lectura' }] }, '"catalogo-2"')).status, 200)
  const despues = await obtenerCatalogo({ directorio: datos })
  assert.equal(despues.recorridos.flatMap((r) => r.libroRefs).length, 9)
  assert.deepEqual(despues.recorridos[0].libroRefs[0].referencia, antes.recorridos[0].libroRefs[0].referencia)
  assert.equal(despues.recorridos[0].libroRefs[0].motivo, 'Motivo revisado')
  assert.equal(despues.recorridos[0].libroRefs.find((r) => r.libroId === 'half-hours').motivo, 'Otra lectura')
})
