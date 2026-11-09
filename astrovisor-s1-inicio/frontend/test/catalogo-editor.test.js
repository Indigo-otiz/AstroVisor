import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { useEditorCatalogo, descartarBorradorPendiente } from '../src/composables/useEditorCatalogo.js'
import { useLibros } from '../src/composables/useLibros.js'
import { cargarCatalogoAdmin, guardarLibro } from '../src/services/catalogoAdminService.js'

const semilla = JSON.parse(readFileSync(new URL('../../content/catalogo-inicial.json', import.meta.url), 'utf8'))
const publico = JSON.parse(readFileSync(new URL('../src/data/libros-demo.json', import.meta.url), 'utf8'))
const respuesta = (c = semilla) => new Response(JSON.stringify(c), { headers: { ETag: `"catalogo-${c.revision}"` } })
const editorNuevo = (alExpirarSesion = () => {}) => useEditorCatalogo({ obtenerToken: () => 'token-aislado', alExpirarSesion })

test('editor carga catálogo, presenta relaciones y cancelar no escribe', async (t) => {
  let llamadas = 0
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    llamadas++
    assert.equal(url, '/api/admin/catalogo')
    assert.equal(options.headers.Authorization, 'Bearer token-aislado')
    return respuesta()
  })
  const e = editorNuevo()
  const carga = e.cargar()
  assert.equal(e.cargando.value, true)
  await carga
  e.seleccionarLibro('star-lore')
  assert.equal(e.borrador.value.relaciones.length, 3)
  assert.ok(!('titulo' in e.borrador.value) && !('autor' in e.borrador.value))
  e.borrador.value.anio = 1912
  e.cancelarEdicion()
  assert.equal(e.borrador.value, null)
  assert.equal(e.catalogo.value.libros[0].anio, 1911)
  assert.equal(llamadas, 1)
})

test('guardar usa If-Match exacto, espera confirmación y recarga revisión sin afirmar sincronización Homido', async (t) => {
  const actual = structuredClone(semilla)
  let escrituras = 0
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (options.method === 'PATCH') {
      escrituras++
      assert.equal(url, '/api/admin/libros/star-lore')
      assert.equal(options.headers['If-Match'], '"catalogo-1"')
      assert.equal(options.headers.Authorization, 'Bearer token-aislado')
      const datos = JSON.parse(options.body)
      assert.deepEqual(Object.keys(datos).sort(), ['anio', 'enlacePublico', 'relaciones'])
      actual.libros[0].anio = datos.anio
      actual.revision = 2
      return new Response(JSON.stringify({ ok: true, revision: 2, respaldoPublico: 'pendiente' }), { headers: { ETag: '"catalogo-2"' } })
    }
    return respuesta(actual)
  })
  const e = editorNuevo()
  await e.cargar(); e.seleccionarLibro('star-lore'); e.borrador.value.anio = 1912
  const guardado = e.guardar()
  assert.equal(e.guardando.value, true)
  assert.equal(e.mensaje.value, '')
  assert.equal(await guardado, true)
  assert.equal(escrituras, 1)
  assert.equal(e.etag.value, '"catalogo-2"')
  assert.equal(e.catalogo.value.libros[0].anio, 1912)
  assert.equal(e.borrador.value, null)
  assert.match(e.mensaje.value, /guardado confirmado/i)
  assert.match(e.mensaje.value, /Homido.*pendiente/i)
})

test('412 conserva formulario y ETag y exige recarga explícita antes de otro guardado', async (t) => {
  let escrituras = 0
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    if (options.method === 'PATCH') { escrituras++; return new Response('{}', { status: 412 }) }
    return respuesta()
  })
  const e = editorNuevo(); await e.cargar(); e.seleccionarRecorrido('orion')
  e.borrador.value.resumen = 'Edición que no se debe perder'
  assert.equal(await e.guardar(), false)
  assert.equal(e.borrador.value.resumen, 'Edición que no se debe perder')
  assert.equal(e.etag.value, '"catalogo-1"')
  assert.equal(e.conflicto.value, true)
  await e.guardar()
  assert.equal(escrituras, 1)
})

test('errores HTTP conservan edición; 401 dirige al flujo de autenticación y bloquea operaciones posteriores', async (t) => {
  for (const status of [400, 401, 404, 409, 428, 503]) {
    let expiraciones = 0, escrituras = 0
    t.mock.method(globalThis, 'fetch', async (_url, options) => {
      if (options.method === 'PATCH') { escrituras++; return new Response('{}', { status }) }
      return respuesta()
    })
    const e = editorNuevo(() => expiraciones++)
    await e.cargar(); e.seleccionarRecorrido('orion'); e.borrador.value.resumen = 'Conservar'
    assert.equal(await e.guardar(), false)
    assert.equal(e.borrador.value.resumen, 'Conservar')
    assert.ok(e.error.value.length > 10)
    assert.equal(expiraciones, status === 401 ? 1 : 0)
    if (status === 401) { await e.guardar(); await e.cargar(); assert.equal(escrituras, 1) }
  }
})

test('una recarga fallida después de persistir conserva confirmación y no repite la escritura', async (t) => {
  let lecturas = 0, escrituras = 0
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    if (options.method === 'PATCH') { escrituras++; return new Response(JSON.stringify({ ok: true, revision: 2 }), { headers: { ETag: '"catalogo-2"' } }) }
    return ++lecturas === 1 ? respuesta() : new Response('{}', { status: 503 })
  })
  const e = editorNuevo(); await e.cargar(); e.seleccionarRecorrido('orion')
  assert.equal(await e.guardar(), false)
  assert.match(e.mensaje.value, /guardado confirmado/i)
  assert.match(e.error.value, /guardado confirmado/i)
  assert.equal(e.etag.value, '"catalogo-2"')
  assert.equal(e.necesitaRecarga.value, true)
  await e.guardar(); assert.equal(escrituras, 1)
})

test('cliente no escribe sin sesión ni habilita título/autor y rechaza GET sin ETag coherente', async (t) => {
  let llamadas = 0
  t.mock.method(globalThis, 'fetch', async () => { llamadas++; return new Response(JSON.stringify(semilla)) })
  await assert.rejects(guardarLibro('star-lore', { anio: 1912 }, { token: '', etag: '"catalogo-1"' }), { status: 401 })
  await assert.rejects(guardarLibro('star-lore', { titulo: 'Otro' }, { token: 'token-aislado', etag: '"catalogo-1"' }), { status: 400 })
  assert.equal(llamadas, 0)
  await assert.rejects(cargarCatalogoAdmin({ token: 'token-aislado' }))
})

test('cancelar tras confirmación y GET fallido no permite editar catálogo viejo con revisión nueva', async (t) => {
  let lecturas = 0, escrituras = 0, disponible = false
  const actualizado = structuredClone(semilla)
  actualizado.revision = 2; actualizado.libros[0].anio = 1920
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    if (options.method === 'PATCH') {
      escrituras++
      return new Response(JSON.stringify({ ok: true, revision: 2 }), { headers: { ETag: '"catalogo-2"' } })
    }
    if (++lecturas === 1) return respuesta()
    return disponible ? respuesta(actualizado) : new Response('{}', { status: 503 })
  })
  const e = editorNuevo(); await e.cargar(); e.seleccionarLibro('star-lore'); e.borrador.value.anio = 1920
  await e.guardar(); e.cancelarEdicion()
  assert.equal(e.necesitaRecarga.value, true)
  e.seleccionarLibro('star-lore'); assert.equal(e.borrador.value, null)
  e.seleccionarRecorrido('orion'); assert.equal(e.borrador.value, null)
  await e.guardar(); assert.equal(escrituras, 1)
  await e.cargar(); assert.equal(e.necesitaRecarga.value, true)
  disponible = true; await e.cargar()
  assert.equal(e.necesitaRecarga.value, false)
  e.seleccionarLibro('star-lore'); assert.equal(e.borrador.value.anio, 1920)
})

test('cambio de constelación cancela peticiones anteriores y descarta respuestas tardías', async (t) => {
  const pendientes = []
  t.mock.method(globalThis, 'fetch', (_url, options) => new Promise((resolve) => pendientes.push({ resolve, signal: options.signal })))
  const libros = useLibros()
  const primera = libros.cargar('orion'), segunda = libros.cargar('escorpio')
  assert.equal(pendientes[0].signal.aborted, true)
  assert.equal(libros.cargando.value, true)
  pendientes[1].resolve(new Response(JSON.stringify(publico))); await segunda
  assert.equal(libros.libros.value[0].motivo, publico[0].recomendaciones.escorpio)
  pendientes[0].resolve(new Response(JSON.stringify(publico))); await primera
  assert.equal(libros.libros.value[0].motivo, publico[0].recomendaciones.escorpio)
  assert.equal(libros.error.value, '')
  libros.cancelar()
})

for (const cambiaRevision of [false, true]) {
  test(`401 recupera borrador en memoria con token nuevo y revisión ${cambiaRevision ? 'cambiada bloqueada' : 'igual'}`, async (t) => {
    descartarBorradorPendiente()
    let token = 'viejo', expirada = false, escrituras = 0
    const actual = structuredClone(semilla)
    t.mock.method(globalThis, 'fetch', async (_url, options) => {
      if (options.method === 'PATCH') {
        escrituras++
        if (options.headers.Authorization === 'Bearer viejo') return new Response('{}', { status: 401 })
        assert.equal(options.headers.Authorization, 'Bearer nuevo')
        assert.equal(options.headers['If-Match'], '"catalogo-1"')
        assert.equal(JSON.parse(options.body).anio, 1920)
        actual.revision = 2; actual.libros[0].anio = 1920
        return new Response(JSON.stringify({ ok: true, revision: 2 }), { headers: { ETag: '"catalogo-2"' } })
      }
      return respuesta(actual)
    })
    const e = useEditorCatalogo({ obtenerToken: () => token, obtenerUsuario: () => 'editor', alExpirarSesion: () => { token = null; expirada = true } })
    await e.cargar(); e.seleccionarLibro('star-lore'); e.borrador.value.anio = 1920
    await e.guardar(); assert.equal(expirada, true)
    await e.guardar(); assert.equal(escrituras, 1)
    e.cancelarPeticiones()
    token = 'nuevo'; if (cambiaRevision) actual.revision = 2
    const nuevo = useEditorCatalogo({ obtenerToken: () => token, obtenerUsuario: () => 'editor' })
    assert.equal(nuevo.recuperarBorrador(), false)
    await nuevo.cargar()
    assert.equal(nuevo.hayBorradorPendiente.value, true)
    assert.equal(nuevo.borrador.value, null)
    assert.equal(nuevo.recuperarBorrador(), true)
    assert.equal(nuevo.borrador.value.anio, 1920)
    assert.equal(nuevo.conflicto.value, cambiaRevision)
    assert.equal(escrituras, 1)
    await nuevo.guardar()
    assert.equal(escrituras, cambiaRevision ? 1 : 2)
    descartarBorradorPendiente()
  })
}

test('borrador pendiente no se ofrece a otra identidad y puede descartarse sin escribir', async (t) => {
  descartarBorradorPendiente()
  let escrituras = 0
  t.mock.method(globalThis, 'fetch', async (_url, o) => {
    if (o.method === 'PATCH') { escrituras++; return new Response('{}', { status: 401 }) }
    return respuesta()
  })
  const e = useEditorCatalogo({ obtenerToken: () => 'viejo', obtenerUsuario: () => 'uno' })
  await e.cargar(); e.seleccionarRecorrido('orion'); e.borrador.value.resumen = 'Borrador privado temporal'
  await e.guardar(); e.cancelarPeticiones()
  const otro = useEditorCatalogo({ obtenerToken: () => 'nuevo', obtenerUsuario: () => 'otro' })
  await otro.cargar()
  assert.equal(otro.recuperarBorrador(), false)
  assert.equal(otro.borrador.value, null)
  assert.equal(otro.hayBorradorPendiente.value, false)
  assert.equal(escrituras, 1)
})

test('401 al recargar después de PATCH confirmado no ofrece repetir la edición persistida', async (t) => {
  descartarBorradorPendiente()
  let lecturas = 0
  t.mock.method(globalThis, 'fetch', async (_url, o) => {
    if (o.method === 'PATCH') return new Response(JSON.stringify({ ok: true, revision: 2 }), { headers: { ETag: '"catalogo-2"' } })
    return ++lecturas === 1 ? respuesta() : new Response('{}', { status: 401 })
  })
  const e = useEditorCatalogo({ obtenerToken: () => 'temporal', obtenerUsuario: () => 'editor' })
  await e.cargar(); e.seleccionarRecorrido('orion'); await e.guardar()
  assert.equal(e.sesionExpirada.value, true)
  assert.equal(e.hayBorradorPendiente.value, false)
  assert.match(e.mensaje.value, /Guardado confirmado/)
})
