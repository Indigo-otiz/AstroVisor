import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { useEditorCatalogo, descartarBorradorPendiente } from '../src/composables/useEditorCatalogo.js'
import { esLibroValido } from '../src/services/librosDemoService.js'

const semilla = JSON.parse(readFileSync(new URL('../../content/catalogo-inicial.json', import.meta.url)))
const respuesta = c => new Response(JSON.stringify(c), { headers: { ETag: `"catalogo-${c.revision}"` } })
function preparar(e) {
  e.nuevoLibro()
  Object.assign(e.borrador.value, { id: 'cielo-nuevo', titulo: 'Historias del cielo', autor: 'Equipo temporal', anio: 2020, enlacePublico: 'https://example.org/obra' })
  for (const r of e.borrador.value.relaciones.slice(0, 2)) { r.seleccionada = true; r.motivo = 'Motivo temporal' }
}
test('alta usa POST/If-Match, preview sin escritura, varias relaciones y recarga confirmada', async t => {
  const c = structuredClone(semilla); let post = 0
  t.mock.method(globalThis, 'fetch', async (url, o) => {
    if (url.endsWith('/previsualizar')) {
      assert.equal(o.headers['If-Match'], '"catalogo-1"'); assert.equal(o.headers.Authorization, 'Bearer temporal')
      return new Response('<svg xmlns="http://www.w3.org/2000/svg"/>', { headers: { 'Content-Type': 'image/svg+xml' } })
    }
    if (o.method === 'POST') {
      post++; assert.equal(url, '/api/admin/libros'); assert.equal(o.headers['If-Match'], '"catalogo-1"')
      const d = JSON.parse(o.body); assert.equal(d.relaciones.length, 2)
      assert.ok(!('portadaIlustrativa' in d)); assert.equal(d.portada.plantilla, 'cielo')
      c.revision = 2
      return new Response(JSON.stringify({ ok: true, revision: 2, respaldoPublico: 'pendiente' }), { headers: { ETag: '"catalogo-2"' } })
    }
    return respuesta(c)
  })
  const e = useEditorCatalogo({ obtenerToken: () => 'temporal' }); await e.cargar(); preparar(e)
  assert.equal(await e.previsualizar(), true); assert.match(e.previsualizacion.value, /^blob:/); assert.equal(post, 0)
  assert.equal(await e.guardar(), true); assert.equal(post, 1); assert.equal(e.borrador.value, null)
  assert.match(e.mensaje.value, /Homido.*pendiente/)
})
test('cancelar alta no escribe y cambio de título invalida preview anterior', async t => {
  let post = 0
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (url.endsWith('/previsualizar')) return new Response('<svg/>', { headers: { 'Content-Type': 'image/svg+xml' } })
    if (url.endsWith('/libros')) post++
    return respuesta(semilla)
  })
  const e = useEditorCatalogo({ obtenerToken: () => 'temporal' }); await e.cargar(); preparar(e)
  await e.previsualizar(); e.borrador.value.titulo = 'Título cambiado'
  assert.equal(e.previsualizacion.value, '')
  e.cancelarEdicion(); assert.equal(post, 0); assert.equal(e.borrador.value, null)
})
for (const status of [401, 412]) test(`alta ${status} conserva borrador y recuperación compara revisión`, async t => {
  descartarBorradorPendiente(); let caducada = false
  t.mock.method(globalThis, 'fetch', async (url, o) => {
    if (url.endsWith('/previsualizar')) return new Response('<svg/>', { headers: { 'Content-Type': 'image/svg+xml' } })
    if (o.method === 'POST') return new Response('{}', { status })
    return respuesta(semilla)
  })
  const opciones = { obtenerToken: () => 'temporal', obtenerUsuario: () => 'equipo', alExpirarSesion: () => { caducada = true } }
  const e = useEditorCatalogo(opciones); await e.cargar(); preparar(e); await e.previsualizar(); await e.guardar()
  assert.equal(e.borrador.value.titulo, 'Historias del cielo')
  assert.equal(e.conflicto.value, status === 412)
  if (caducada) {
    e.cancelarPeticiones(); const nuevo = useEditorCatalogo(opciones); await nuevo.cargar()
    assert.equal(nuevo.recuperarBorrador(), true); assert.equal(nuevo.seleccion.value.tipo, 'nuevo')
    assert.equal(nuevo.borrador.value.id, 'cielo-nuevo'); assert.equal(nuevo.previsualizacion.value, '')
  }
  descartarBorradorPendiente()
})
test('validador público acepta solo URL de portada dinámica de mismo ID y revisión válida', () => {
  const libro = { ...semilla.libros[0], id: 'cielo-nuevo', portadaIlustrativa: '/api/contenidos/libros/cielo-nuevo/portada.svg?revision=2' }
  assert.equal(esLibroValido(libro), true)
  for (const ruta of ['/api/contenidos/libros/otro/portada.svg?revision=2', '/api/contenidos/libros/cielo-nuevo/portada.svg?revision=0', 'https://evil.org/x.svg']) assert.equal(esLibroValido({ ...libro, portadaIlustrativa: ruta }), false)
})

test('preview tardío tras cambio de plantilla no habilita guardar ni reaparece tras cancelar', async t => {
  let resolver, signal, escrituras = 0
  t.mock.method(globalThis, 'fetch', async (url, o) => {
    if (url.endsWith('/previsualizar')) { signal = o.signal; return new Promise(r => { resolver = r }) }
    if (url.endsWith('/libros')) escrituras++
    return respuesta(semilla)
  })
  const e = useEditorCatalogo({ obtenerToken: () => 'temporal' }); await e.cargar(); preparar(e)
  assert.equal(await e.guardar(), false)
  const p = e.previsualizar(); e.borrador.value.portada.plantilla = 'relatos'
  assert.equal(signal.aborted, true)
  resolver(new Response('<svg/>', { headers: { 'Content-Type': 'image/svg+xml' } })); await p
  assert.equal(e.previsualizacion.value, '')
  assert.equal(await e.guardar(), false); assert.equal(escrituras, 0)
  e.cancelarEdicion(); e.cancelarPeticiones()
})

test('alta confirmada con GET fallido no reintenta ni permite duplicar tras cancelar', async t => {
  let lecturas = 0, altas = 0
  t.mock.method(globalThis, 'fetch', async (url, o) => {
    if (url.endsWith('/previsualizar')) return new Response('<svg/>', { headers: { 'Content-Type': 'image/svg+xml' } })
    if (o.method === 'POST') {
      altas++
      return new Response(JSON.stringify({ ok: true, revision: 2 }), { headers: { ETag: '"catalogo-2"' } })
    }
    return ++lecturas === 1 ? respuesta(semilla) : new Response('{}', { status: 503 })
  })
  const e = useEditorCatalogo({ obtenerToken: () => 'temporal' }); await e.cargar(); preparar(e)
  await e.previsualizar(); await e.guardar()
  assert.match(e.mensaje.value, /Guardado confirmado/)
  assert.equal(e.etag.value, '"catalogo-2"')
  assert.equal(e.necesitaRecarga.value, true)
  await e.guardar(); assert.equal(altas, 1)
  e.cancelarEdicion(); e.nuevoLibro()
  assert.equal(e.borrador.value, null)
  assert.equal(e.necesitaRecarga.value, true)
  e.cancelarPeticiones()
})
