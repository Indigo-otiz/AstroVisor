import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { listarLibros, buscarLibro, validarCatalogo } from '../src/services/librosDemoService.js'
const fixture = JSON.parse(readFileSync(new URL('../src/data/libros-demo.json', import.meta.url), 'utf8'))

test('libros se consultan en API en cada carga, con cancelación, IDs y tres portadas existentes', async (t) => {
  const signal = new AbortController().signal
  let llamadas = 0
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    llamadas++
    assert.equal(url, '/api/contenidos/libros')
    assert.equal(options.signal, signal)
    assert.equal(options.cache, 'no-store')
    const datos = structuredClone(fixture)
    datos[0].titulo = `Título consultado ${llamadas}`
    return new Response(JSON.stringify(datos))
  })
  const libros = await listarLibros('orion', { signal })
  assert.equal(llamadas, 1)
  assert.equal(libros.length, 3)
  assert.deepEqual(libros.map((l) => l.portadaIlustrativa), ['/libros-demo/star-lore.svg', '/libros-demo/field-stars.svg', '/libros-demo/half-hours.svg'])
  assert.equal(libros[0].titulo, 'Título consultado 1')
  assert.equal((await buscarLibro('orion', 'star-lore', { signal })).titulo, 'Título consultado 2')
})

test('catálogo vacío es válido y un libro inexistente no se sustituye por otro', async (t) => {
  assert.equal(validarCatalogo([]), true)
  t.mock.method(globalThis, 'fetch', async () => new Response('[]'))
  assert.deepEqual(await listarLibros('orion'), [])
  assert.equal(await buscarLibro('orion', 'ausente'), null)
})

test('fallos HTTP, red, JSON y recursos inválidos rechazan sin usar catálogo estático', async (t) => {
  for (const responder of [
    async () => new Response('{}', { status: 503 }),
    async () => { throw new Error('sin red') },
    async () => new Response('{'),
    async () => new Response(JSON.stringify([{ ...fixture[0], portadaIlustrativa: 'https://example.org/imagen.svg' }])),
    async () => new Response(JSON.stringify([fixture[0], fixture[0]])),
  ]) {
    t.mock.method(globalThis, 'fetch', responder)
    await assert.rejects(async () => listarLibros('orion'))
  }
})
