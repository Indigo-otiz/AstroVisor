import test from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtemp, rm, readdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { once } from 'node:events'
import { randomBytes } from 'node:crypto'
import { gzipSync, deflateSync } from 'node:zlib'
import http from 'node:http'
import { setTimeout as esperar } from 'node:timers/promises'
import sharp from 'sharp'

test('JSON comprimido hostil no termina Express; health, login, escritura e imágenes siguen operables', { timeout: 30000 }, async t => {
  const raiz = await mkdtemp(join(tmpdir(), 'astrovisor-http-seguro-'))
  const env = { ...process.env }
  for (const k of Object.keys(env)) if (k.startsWith('ASTROVISOR_')) delete env[k]
  Object.assign(env, {
    ASTROVISOR_DATA_DIR: join(raiz, 'datos'), ASTROVISOR_ADMIN_FILE: join(raiz, 'identidad', 'admin.json'),
    ASTROVISOR_COVERS_DIR: join(raiz, 'imagenes'), ASTROVISOR_PUBLIC_EXPORT_DIR: join(raiz, 'publico'),
  })
  const modulo = nombre => JSON.stringify(new URL('../src/' + nombre, import.meta.url).href)
  const codigo = `
    import { once } from 'node:events';
    import { crearApp } from ${modulo('index.js')};
    import { inicializarCatalogo } from ${modulo('services/documentRepository.js')};
    import { inicializarAdmin } from ${modulo('services/adminCredentials.js')};
    const [{ password }] = await once(process, 'message');
    await inicializarCatalogo();
    await inicializarAdmin({ usuario: 'prueba-parser', nombre: 'Ensayo aislado', password });
    const app = crearApp(); await app.locals.iniciarEscritor();
    const server = app.listen(0, '127.0.0.1'); await once(server, 'listening');
    process.on('message', async mensaje => {
      if (mensaje !== 'cerrar') return;
      await new Promise(r => server.close(r)); await app.locals.cerrarEscritor(); process.exit(0);
    });
    process.send({ puerto: server.address().port });
  `
  const child = spawn(process.execPath, ['--input-type=module', '-e', codigo], { cwd: raiz, env, stdio: ['ignore', 'pipe', 'pipe', 'ipc'] })
  let logs = '', salida = null
  child.stdout.on('data', b => { logs += b })
  child.stderr.on('data', b => { logs += b })
  const terminado = once(child, 'exit').then(([code, signal]) => { salida = { code, signal }; return salida })
  t.after(async () => {
    if (!salida) { child.kill(); await terminado }
    await rm(raiz, { recursive: true, force: true })
  })
  const password = randomBytes(24).toString('hex'), listo = once(child, 'message')
  child.send({ password })
  const [{ puerto }] = await Promise.race([listo, terminado.then(() => { throw new Error('Express terminó antes de iniciar') })])
  const base = 'http://127.0.0.1:' + puerto
  const pedir = (ruta, opciones = {}) => fetch(base + ruta, { ...opciones, signal: AbortSignal.timeout(3000) })
  assert.equal((await pedir('/api/health')).status, 200)

  // El relleno llega después de un frame válido: una respuesta inicial no acredita supervivencia.
  for (const [encoding, comprimir] of [['gzip', gzipSync], ['deflate', deflateSync]]) {
    const bytes = Buffer.concat([comprimir('{"a":1}'), Buffer.from([0]), Buffer.alloc(100 * 1024, 0x58)])
    const status = await new Promise((resolve, reject) => {
      const req = http.request(base + '/api/auditoria-inexistente', { method: 'POST', agent: false,
        headers: { 'Content-Type': 'application/json', 'Content-Encoding': encoding, 'Content-Length': bytes.length } }, res => {
        res.resume(); res.once('end', () => resolve(res.statusCode))
      })
      req.once('error', reject); req.setTimeout(3000, () => req.destroy(new Error('Tiempo HTTP excedido'))); req.end(bytes)
    })
    await esperar(200)
    const health = salida ? null : await pedir('/api/health')
    t.diagnostic(JSON.stringify({ encoding, status, salida, health: health?.status ?? null, zDataError: logs.includes('Z_DATA_ERROR') }))
    assert.equal(salida, null, 'Una respuesta inicial no basta: el proceso debe permanecer activo')
    assert.equal(status, 415)
    assert.equal(health.status, 200)
    assert.equal((await health.json()).estado, 'ok')
  }
  assert.equal((await pedir('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Encoding': 'gzip' }, body: gzipSync('{}') })).status, 415)
  assert.equal((await pedir('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })).status, 400)
  assert.equal((await pedir('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contrasena: 'x'.repeat(64 * 1024) }) })).status, 413)
  const login = await pedir('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario: 'prueba-parser', contrasena: password }) })
  assert.equal(login.status, 200)
  const { token } = await login.json(), headers = { Authorization: 'Bearer ' + token }
  assert.equal((await pedir('/api/admin/catalogo')).status, 401)
  const catalogo = await pedir('/api/admin/catalogo', { headers })
  assert.equal(catalogo.status, 200)
  assert.equal(catalogo.headers.get('etag'), '"catalogo-1"')
  const json = { ...headers, 'Content-Type': 'application/json', 'If-Match': '"catalogo-1"' }
  assert.equal((await pedir('/api/admin/libros/star-lore', { method: 'PATCH', headers: json, body: '{"anio":1912}' })).status, 200)
  const actuales = { ...headers, 'If-Match': '"catalogo-2"' }
  for (const formato of ['png', 'jpeg']) {
    const bytes = await sharp({ create: { width: 20, height: 30, channels: 3, background: 'blue' } }).toFormat(formato).toBuffer()
    const r = await pedir('/api/admin/imagenes', { method: 'POST', headers: { ...actuales, 'Content-Type': 'image/' + formato }, body: bytes })
    assert.equal(r.status, 201)
    assert.equal((await r.json()).recurso.formato, formato)
  }
  const imagen = { ...actuales, 'Content-Type': 'image/png' }
  assert.equal((await pedir('/api/admin/imagenes', { method: 'POST', headers: imagen, body: '<svg/>' })).status, 400)
  assert.equal((await pedir('/api/admin/imagenes', { method: 'POST', headers: imagen, body: Buffer.alloc(2 * 1024 * 1024 + 1) })).status, 413)
  assert.equal((await pedir('/api/admin/imagenes', { method: 'POST', headers: { ...imagen, 'Content-Encoding': 'gzip' }, body: gzipSync('imagen falsa') })).status, 415)
  assert.equal((await readdir(env.ASTROVISOR_COVERS_DIR)).length, 2)
  assert.equal((await pedir('/api/admin/sesion', { headers })).status, 200)
  assert.equal((await pedir('/api/admin/logout', { method: 'POST', headers })).status, 200)
  assert.equal((await pedir('/api/admin/sesion', { headers })).status, 401)
  assert.equal((await pedir('/api/health')).status, 200)
  child.send('cerrar')
  assert.deepEqual(await terminado, { code: 0, signal: null })
  t.diagnostic('Cierre normal del proceso: salida0; JSON400/413, login200, PATCH200, PNG/JPEG201, logout200 y sesión revocada401')
  assert.ok(!logs.includes(password) && !logs.includes(token))
  assert.ok(!logs.includes('Z_DATA_ERROR'))
})
