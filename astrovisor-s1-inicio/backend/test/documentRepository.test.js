import test from 'node:test'
import assert from 'node:assert/strict'
import { obtenerRecorridos } from '../src/services/documentRepository.js'

test('el repositorio documental devuelve recorridos de demostración', async () => {
  const recorridos = await obtenerRecorridos()
  assert.ok(Array.isArray(recorridos))
  assert.ok(recorridos.length >= 1)
  assert.ok(recorridos.every(x => typeof x.id === 'string' && typeof x.titulo === 'string'))
  assert.ok(recorridos.every(x => x.demostracion === true))
  assert.equal(new Set(recorridos.map(x => x.id)).size, recorridos.length)
  assert.deepEqual(recorridos.map(x => x.id), ['orion', 'osa-mayor', 'escorpio'])
  for (const recorrido of recorridos) {
    for (const campo of ['titulo', 'resumen', 'historia', 'comoReconocerla']) {
      assert.equal(typeof recorrido[campo], 'string')
      assert.ok(recorrido[campo].trim().length > 0, `${recorrido.id}: falta ${campo}`)
    }
    assert.ok(Array.isArray(recorrido.libros))
    assert.ok(Array.isArray(recorrido.multimedia))
  }
})
