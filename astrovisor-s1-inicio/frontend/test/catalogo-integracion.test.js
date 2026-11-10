import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, dirname } from 'node:path'
import { randomBytes } from 'node:crypto'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { crearApp } from '../../backend/src/index.js'
import { inicializarCatalogo, obtenerCatalogo } from '../../backend/src/services/documentRepository.js'
import { crearConfiguracionAdmin } from '../../backend/src/services/adminCredentials.js'
import { useEditorCatalogo } from '../src/composables/useEditorCatalogo.js'
import { listarLibros } from '../src/services/librosDemoService.js'
import { cargarRecorridos } from '../src/services/contentService.js'

test('servicios Vue → Express: edición autorizada, 412, lectura pública y persistencia desde proceso nuevo', { timeout: 30000 }, async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'astrovisor-3a-http-'))
  assert.equal(dirname(dir), tmpdir())
  const datos = join(dir, 'datos'), cuenta = join(dir, 'admin.json')
  const password = randomBytes(24).toString('hex')
  const previo = { ASTROVISOR_DATA_DIR: process.env.ASTROVISOR_DATA_DIR, ASTROVISOR_ADMIN_FILE: process.env.ASTROVISOR_ADMIN_FILE }
  process.env.ASTROVISOR_DATA_DIR = datos; process.env.ASTROVISOR_ADMIN_FILE = cuenta
  const app = crearApp()
  let server, hijo
  t.after(async () => {
    try {
      if (server?.listening) await new Promise((r) => server.close(r))
      await app.locals.cerrarEscritor()
      if (hijo && hijo.exitCode === null) { const fin = once(hijo, 'exit'); hijo.send('cerrar'); await fin }
    } finally {
      for (const [k, v] of Object.entries(previo)) { if (v === undefined) delete process.env[k]; else process.env[k] = v }
      await rm(dir, { recursive: true, force: true })
    }
  })
  await inicializarCatalogo({ directorio: datos })
  const original = await obtenerCatalogo({ directorio: datos })
  await writeFile(cuenta, JSON.stringify(await crearConfiguracionAdmin('editor-temporal', 'Integración aislada', password)), { mode: 0o600 })
  await app.locals.iniciarEscritor()
  server = app.listen(0, '127.0.0.1'); await once(server, 'listening')
  let base = `http://127.0.0.1:${server.address().port}`, token
  const realFetch = globalThis.fetch, peticiones = []
  t.mock.method(globalThis, 'fetch', (ruta, opciones = {}) => {
    assert.ok(ruta.startsWith('/api/'))
    assert.ok(!ruta.includes('token=') && !ruta.includes('contrasena='))
    peticiones.push({ ruta, metodo: opciones.method, etag: opciones.headers?.['If-Match'] })
    return realFetch(base + ruta, opciones)
  })
  const login = async () => {
    const r = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ usuario: 'editor-temporal', contrasena: password }) })
    assert.equal(r.status, 200); token = (await r.json()).token
  }
  const publico = await listarLibros('orion')
  assert.equal(publico.length, 3)
  assert.deepEqual(publico.map((l) => l.portadaIlustrativa), ['/libros-demo/star-lore.svg', '/libros-demo/field-stars.svg', '/libros-demo/half-hours.svg'])
  const denegada = await fetch('/api/admin/libros/star-lore', { method: 'PATCH', headers: { 'Content-Type': 'application/json', 'If-Match': '"catalogo-1"' }, body: JSON.stringify({ anio: 1912 }) })
  assert.equal(denegada.status, 401)
  assert.equal((await obtenerCatalogo({ directorio: datos })).revision, 1)
  await login()
  const editor = useEditorCatalogo({ obtenerToken: () => token })
  await editor.cargar(); editor.seleccionarLibro('star-lore')
  editor.borrador.value.anio = 1912
  editor.borrador.value.relaciones[0].motivo = 'Motivo actualizado desde el editor conectado a Express.'
  assert.equal(await editor.guardar(), true)
  assert.equal(peticiones.find((p) => p.ruta.endsWith('/star-lore') && p.etag === '"catalogo-1"')?.etag, '"catalogo-1"')
  const actualizado = await listarLibros('orion')
  assert.equal(actualizado[0].anio, 1912)
  assert.equal(actualizado[0].motivo, 'Motivo actualizado desde el editor conectado a Express.')
  assert.equal(actualizado[0].titulo, publico[0].titulo)
  assert.equal(actualizado[0].autor, publico[0].autor)
  const otro = useEditorCatalogo({ obtenerToken: () => token }), antiguo = useEditorCatalogo({ obtenerToken: () => token })
  await otro.cargar(); await antiguo.cargar()
  otro.seleccionarRecorrido('orion'); antiguo.seleccionarRecorrido('orion')
  otro.borrador.value.resumen = 'Resumen confirmado desde Vue y leído por la API pública.'
  antiguo.borrador.value.comoReconocerla = 'Edición local que se conserva ante conflicto.'
  assert.equal(await otro.guardar(), true)
  assert.equal(await antiguo.guardar(), false)
  assert.equal(antiguo.conflicto.value, true)
  assert.equal(antiguo.borrador.value.comoReconocerla, 'Edición local que se conserva ante conflicto.')
  assert.equal((await cargarRecorridos())[0].resumen, 'Resumen confirmado desde Vue y leído por la API pública.')
  const alta = useEditorCatalogo({ obtenerToken: () => token })
  await alta.cargar(); alta.nuevoLibro()
  Object.assign(alta.borrador.value, { id: 'guia-nueva', titulo: 'Guía del cielo nocturno', autor: 'Equipo temporal', anio: 2020, enlacePublico: 'https://example.org/guia-temporal' })
  for (const r of alta.borrador.value.relaciones.slice(0, 2)) { r.seleccionada = true; r.motivo = 'Motivo de lectura temporal' }
  assert.equal(await alta.previsualizar(), true)
  assert.equal(await alta.guardar(), true)
  const guia = (await listarLibros('orion')).find((l) => l.id === 'guia-nueva')
  assert.equal(guia.portadaIlustrativa, '/api/contenidos/libros/guia-nueva/portada.svg?revision=4')
  const cubierta = await fetch(guia.portadaIlustrativa)
  assert.equal(cubierta.status, 200); const svg = await cubierta.text()
  assert.match(svg, /PORTADA ILUSTRATIVA/)
  assert.ok((await listarLibros('osa-mayor')).some((l) => l.id === 'guia-nueva'))
  alta.cancelarPeticiones()
  const persistido = await obtenerCatalogo({ directorio: datos })
  assert.equal(persistido.recorridos.flatMap((r) => r.libroRefs).filter((r) => r.libroId !== 'guia-nueva').length, 9)
  assert.deepEqual(persistido.recorridos.map((r) => r.multimedia), original.recorridos.map((r) => r.multimedia))
  await new Promise((r) => server.close(r)); await app.locals.cerrarEscritor()
  const modulo = new URL('../../backend/src/index.js', import.meta.url).href
  hijo = spawn(process.execPath, ['--input-type=module', '-e', `import{crearApp}from ${JSON.stringify(modulo)};const a=crearApp();await a.locals.iniciarEscritor();const s=a.listen(0,'127.0.0.1',()=>process.send(s.address().port));process.once('message',()=>s.close(async()=>{await a.locals.cerrarEscritor();process.exit(0)}))`], {
    env: { ...process.env, ASTROVISOR_DATA_DIR: datos, ASTROVISOR_ADMIN_FILE: cuenta }, stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
  })
  const [puerto] = await once(hijo, 'message'); base = `http://127.0.0.1:${puerto}`
  assert.equal((await listarLibros('orion'))[0].anio, 1912)
  assert.equal((await cargarRecorridos())[0].resumen, persistido.recorridos[0].resumen)
  assert.equal((await listarLibros('orion')).find((l) => l.id === 'guia-nueva').titulo, 'Guía del cielo nocturno')
  assert.equal(await (await fetch(guia.portadaIlustrativa)).text(), svg)
  let redirecciones = 0
  const expirada = useEditorCatalogo({ obtenerToken: () => token, alExpirarSesion: () => redirecciones++ })
  assert.equal(await expirada.cargar(), false)
  assert.equal(redirecciones, 1)
  assert.equal(expirada.sesionExpirada.value, true)
  await login()
  const nuevo = useEditorCatalogo({ obtenerToken: () => token })
  assert.equal(await nuevo.cargar(), true)
  const esperado = structuredClone(persistido)
  esperado.libros.find((l) => l.id === 'guia-nueva').portadaIlustrativa += '?revision=4'
  esperado.publicacionHomido = { respaldoPublico: 'pendiente', revisionPublicada: null }
  assert.deepEqual(JSON.parse(JSON.stringify(nuevo.catalogo.value)), esperado)
})
