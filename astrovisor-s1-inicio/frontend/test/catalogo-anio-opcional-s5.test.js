import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { useEditorCatalogo } from '../src/composables/useEditorCatalogo.js'

const semilla = JSON.parse(readFileSync(new URL('../../content/catalogo-inicial.json', import.meta.url), 'utf8'))
const respuesta = (c = semilla) => new Response(JSON.stringify(c), { headers: { ETag: `"catalogo-${c.revision}"` } })

test('S5-03: alta de libro sin año omite la propiedad anio y no serializa 0 ni NaN', async (t) => {
  let peticionBody = null
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url.endsWith('/previsualizar')) {
      return new Response('<svg xmlns="http://www.w3.org/2000/svg"/>', { headers: { 'Content-Type': 'image/svg+xml' } })
    }
    if (options?.method === 'POST') {
      peticionBody = JSON.parse(options.body)
      return new Response(JSON.stringify({ ok: true, revision: 2, respaldoPublico: 'publicado', revisionPublicada: 2 }), {
        headers: { ETag: '"catalogo-2"' },
      })
    }
    return respuesta()
  })

  const editor = useEditorCatalogo({ obtenerToken: () => 'token-test' })
  await editor.cargar()
  editor.nuevoLibro()

  editor.borrador.value.id = 'libro-sin-fecha'
  editor.borrador.value.titulo = 'Astronomía Popular'
  editor.borrador.value.autor = 'Camille Flammarion'
  editor.borrador.value.anio = '' // En blanco
  editor.borrador.value.enlacePublico = 'https://archive.org/details/astronomiepopulaire'
  editor.borrador.value.relaciones[0].seleccionada = true
  editor.borrador.value.relaciones[0].motivo = 'Lectura introductoria'

  await editor.previsualizar()
  const guardado = await editor.guardar()

  assert.equal(guardado, true, 'Debe permitir guardar sin año')
  assert.ok(peticionBody, 'Debe haber emitido la petición POST')
  assert.equal(peticionBody.id, 'libro-sin-fecha')
  assert.equal(peticionBody.titulo, 'Astronomía Popular')
  assert.equal('anio' in peticionBody, false, 'El payload NO debe incluir la clave anio')
  assert.notEqual(peticionBody.anio, 0, 'No debe serializarse como 0')
  assert.notEqual(peticionBody.anio, null, 'No debe serializarse como null')
})

test('S5-03: alta de libro con año válido incluye anio como entero', async (t) => {
  let peticionBody = null
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url.endsWith('/previsualizar')) {
      return new Response('<svg xmlns="http://www.w3.org/2000/svg"/>', { headers: { 'Content-Type': 'image/svg+xml' } })
    }
    if (options?.method === 'POST') {
      peticionBody = JSON.parse(options.body)
      return new Response(JSON.stringify({ ok: true, revision: 2, respaldoPublico: 'publicado', revisionPublicada: 2 }), {
        headers: { ETag: '"catalogo-2"' },
      })
    }
    return respuesta()
  })

  const editor = useEditorCatalogo({ obtenerToken: () => 'token-test' })
  await editor.cargar()
  editor.nuevoLibro()

  editor.borrador.value.id = 'libro-con-fecha'
  editor.borrador.value.titulo = 'Uranometria'
  editor.borrador.value.autor = 'Johann Bayer'
  editor.borrador.value.anio = 1603
  editor.borrador.value.enlacePublico = 'https://archive.org/details/uranometria'
  editor.borrador.value.relaciones[0].seleccionada = true
  editor.borrador.value.relaciones[0].motivo = 'Atlas celeste histórico'

  await editor.previsualizar()
  const guardado = await editor.guardar()

  assert.equal(guardado, true)
  assert.equal(peticionBody.anio, 1603)
  assert.equal(typeof peticionBody.anio, 'number')
})

test('S5-03: edición de libro preexistente permite limpiar el año (dejarlo en blanco) enviando null para desvincularlo', async (t) => {
  let patchBody = null
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (options?.method === 'PATCH') {
      patchBody = JSON.parse(options.body)
      return new Response(JSON.stringify({ ok: true, revision: 2, respaldoPublico: 'publicado', revisionPublicada: 2 }), {
        headers: { ETag: '"catalogo-2"' },
      })
    }
    return respuesta()
  })

  const editor = useEditorCatalogo({ obtenerToken: () => 'token-test' })
  await editor.cargar()
  editor.seleccionarLibro('star-lore') // star-lore tiene anio: 1911 originalmente
  assert.equal(editor.borrador.value.anio, 1911)

  // El usuario limpia el campo año
  editor.borrador.value.anio = ''

  const guardado = await editor.guardar()
  assert.equal(guardado, true, 'Debe permitir guardar la edición tras limpiar el año')
  assert.ok(patchBody, 'Debe haber emitido la petición PATCH')
  assert.equal(patchBody.anio, null, 'Debe enviar anio: null para eliminar el año previo en el backend')
})

test('S5-03: rechaza año inválido menor a 1 o mayor a 9999 sin emitir petición', async (t) => {
  let llamadasPost = 0
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url.endsWith('/previsualizar')) {
      return new Response('<svg xmlns="http://www.w3.org/2000/svg"/>', { headers: { 'Content-Type': 'image/svg+xml' } })
    }
    if (options?.method === 'POST') {
      llamadasPost++
      return new Response('{}', { status: 200 })
    }
    return respuesta()
  })

  const editor = useEditorCatalogo({ obtenerToken: () => 'token-test' })
  await editor.cargar()
  editor.nuevoLibro()

  editor.borrador.value.id = 'libro-invalido'
  editor.borrador.value.titulo = 'Test'
  editor.borrador.value.autor = 'Autor'
  editor.borrador.value.anio = -50
  editor.borrador.value.enlacePublico = 'https://example.org'
  editor.borrador.value.relaciones[0].seleccionada = true
  editor.borrador.value.relaciones[0].motivo = 'Motivo'

  await editor.previsualizar()
  const guardado = await editor.guardar()

  assert.equal(guardado, false)
  assert.equal(llamadasPost, 0)
  assert.match(editor.error.value, /año válido/i)
})
