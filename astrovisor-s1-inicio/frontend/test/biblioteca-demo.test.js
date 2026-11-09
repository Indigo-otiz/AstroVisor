import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { buscarLibro, listarLibros, validarCatalogo, CONSTELACIONES_LIBROS } from '../src/services/librosDemoService.js'
const fuente = new URL('../src/data/libros-demo.json', import.meta.url)
const catalogo = JSON.parse(readFileSync(fuente, 'utf8'))

test('catálogo de demostración: ids únicos y sin existencias inventadas', () => {
  assert.equal(validarCatalogo(catalogo), true)
  assert.equal(validarCatalogo([{ id: 'libro' }]), false)
  for (const libro of catalogo) {
    assert.equal(libro.demostracion, true)
    assert.equal(libro.marc21.signatura852, null)
    assert.equal(libro.marc21.ubicacion852, null)
    assert.match(libro.marc21.campo001, /^DEMO-/)
    assert.ok(existsSync(new URL('../public' + libro.portadaIlustrativa, import.meta.url)))
  }
})
test('cada constelación presenta tres recomendaciones con información de interés', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(catalogo)))
  for (const id of CONSTELACIONES_LIBROS) {
    const libros = await listarLibros(id)
    assert.equal(libros.length, 3)
    assert.ok(libros.every((libro) => libro.motivo.length >= 20))
    assert.equal((await buscarLibro(id, libros[0].id))?.id, libros[0].id)
  }
})
test('parámetros desconocidos no muestran un libro ajeno', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(catalogo)))
  assert.deepEqual(await listarLibros('desconocida'), [])
  assert.equal(await buscarLibro('orion', 'no-existe'), null)
  assert.equal(await buscarLibro('sin-constelacion', 'star-lore'), null)
})
test('las recomendaciones remiten a enlaces públicos, no al inventario de la biblioteca', () => {
  for (const libro of catalogo) {
    assert.match(libro.enlacePublico, /^https:\/\//)
    assert.ok(!('disponibilidad' in libro))
  }
})

test('los enlaces aprobados coinciden en catálogo, contrato documental y bibliografía', () => {
  const recorridos = JSON.parse(readFileSync(new URL('../../content/recorridos.json', import.meta.url), 'utf8'))
  const bibliografia = readFileSync(new URL('../../content/BIBLIOGRAFIA.md', import.meta.url), 'utf8')
  const enlaces = {
    'star-lore': 'https://archive.org/details/starloreofallage00olco',
    'half-hours': 'https://www.gutenberg.org/ebooks/23300',
  }
  for (const libro of catalogo) {
    const referencia = recorridos.flatMap((r) => r.libros).find((r) => r.titulo === libro.titulo)
    assert.ok(referencia, libro.titulo)
    assert.equal(libro.enlacePublico, referencia.url, libro.titulo)
    assert.ok(bibliografia.includes(libro.enlacePublico), libro.titulo)
    if (enlaces[libro.id]) assert.equal(libro.enlacePublico, enlaces[libro.id], libro.titulo)
  }
})
