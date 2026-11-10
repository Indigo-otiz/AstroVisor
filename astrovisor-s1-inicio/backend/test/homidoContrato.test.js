import test from 'node:test'
import assert from 'node:assert/strict'
import { leerSemilla } from '../src/services/documentRepository.js'
import { proyectarRecorridos } from '../src/services/catalogo.js'
import { editarCatalogo } from '../src/services/catalogoEdicion.js'

test('Homido proyecta nueve relaciones por ID y conserva la bibliografía heredada y las portadas', async () => {
  const c = await leerSemilla(), salida = proyectarRecorridos(c)
  assert.equal(salida.flatMap(r => r.libros).length, 9)
  for (const r of salida) {
    assert.equal(r.revisionCatalogo, 1)
    for (const l of r.libros) {
      const ref = c.recorridos.find(x => x.id === r.id).libroRefs.find(x => x.libroId === l.libroId)
      const libro = c.libros.find(x => x.id === l.libroId)
      assert.ok(ref && libro); assert.equal(l.constelacionId, r.id)
      assert.equal(l.motivo, ref.motivo); assert.equal(l.titulo, libro.titulo); assert.equal(l.autor, libro.autor)
      assert.equal(l.url, libro.enlacePublico); assert.equal(l.anio, libro.anio)
      assert.equal(l.referenciaHeredada, ref.referencia !== undefined)
      if (ref.referencia) for (const [k,v] of Object.entries(ref.referencia)) assert.deepEqual(l[k], v)
      assert.equal(l.portada.src, libro.portadaIlustrativa)
    }
  }
})
test('libro nuevo compartido y título actualizado conservan IDs, audio y campos privados sin exponerlos', async () => {
  const c = await leerSemilla(), originales = structuredClone(c.recorridos.map(r => r.multimedia))
  editarCatalogo(c, { tipo: 'crearLibro', datos: { id: 'aaa-nuevo', titulo: 'Libro nuevo', autor: 'Equipo temporal', anio: 2020, enlacePublico: 'https://example.org/libro-temporal', portada: { tipo: 'ilustrativa', plantilla: 'cielo', paleta: 'azul' }, relaciones: [{ constelacionId: 'orion', motivo: 'Primero' }, { constelacionId: 'escorpio', motivo: 'Segundo' }] } })
  c.revision = 2; c.libros[0].titulo = 'Título revisado'
  c.recorridos[0].administracion = { secreto: 'PRIVADO-NO-PUBLICAR' }
  c.recorridos[0].libroRefs[0].referencia.administracion = 'PRIVADO-NO-PUBLICAR'
  c.libros.at(-1).administracion = 'PRIVADO-NO-PUBLICAR'
  const salida = proyectarRecorridos(c)
  assert.equal(salida.flatMap(r => r.libros).length, 11)
  assert.equal(salida.flatMap(r => r.libros).filter(l => l.libroId === 'star-lore').length, 3)
  assert.ok(salida.flatMap(r => r.libros).filter(l => l.libroId === 'star-lore').every(l => l.titulo === 'Título revisado'))
  for (const id of ['orion', 'escorpio']) {
    const l = salida.find(r => r.id === id).libros.find(l => l.libroId === 'aaa-nuevo')
    assert.equal(l.referenciaHeredada, false)
    assert.deepEqual(l.portada, { tipo: 'ilustrativa', origen: 'plantilla', plantilla: 'cielo', paleta: 'azul' })
    assert.ok(!JSON.stringify(l.portada).includes('/api/'))
  }
  assert.deepEqual(salida.map(r => r.multimedia), originales)
  assert.ok(!JSON.stringify(salida).includes('PRIVADO-NO-PUBLICAR'))
  assert.equal(c.recorridos[0].administracion.secreto, 'PRIVADO-NO-PUBLICAR')
})
