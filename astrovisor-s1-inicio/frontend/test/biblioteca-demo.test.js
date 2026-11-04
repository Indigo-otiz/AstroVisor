import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { buscarLibro, listarLibros, validarCatalogo, CONSTELACIONES_LIBROS } from '../src/services/librosDemoService.js'
const fuente = new URL('../src/data/libros-demo.json', import.meta.url)
const catalogo = JSON.parse(readFileSync(fuente, 'utf8'))

test('catálogo de demostración: ids únicos y sin existencias inventadas', () => {
  assert.equal(validarCatalogo(), true)
  assert.equal(validarCatalogo([{ id: 'libro' }]), false)
  for (const libro of catalogo) {
    assert.equal(libro.demostracion, true)
    assert.equal(libro.marc21.signatura852, null)
    assert.equal(libro.marc21.ubicacion852, null)
    assert.match(libro.marc21.campo001, /^DEMO-/)
    assert.ok(existsSync(new URL('../public' + libro.portadaIlustrativa, import.meta.url)))
  }
})
test('cada constelación presenta tres recomendaciones con información de interés', () => {
  for (const id of CONSTELACIONES_LIBROS) {
    const libros = listarLibros(id)
    assert.equal(libros.length, 3)
    assert.ok(libros.every((libro) => libro.motivo.length >= 20))
    assert.equal(buscarLibro(id, libros[0].id)?.id, libros[0].id)
  }
})
test('parámetros desconocidos no muestran un libro ajeno', () => {
  assert.deepEqual(listarLibros('desconocida'), [])
  assert.equal(buscarLibro('orion', 'no-existe'), null)
  assert.equal(buscarLibro('sin-constelacion', 'star-lore'), null)
})
test('las recomendaciones remiten a enlaces públicos, no al inventario de la biblioteca', () => {
  for (const libro of catalogo) {
    assert.match(libro.enlacePublico, /^https:\/\//)
    assert.ok(!('disponibilidad' in libro))
  }
})
