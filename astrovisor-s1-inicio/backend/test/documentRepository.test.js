import test from 'node:test'
import assert from 'node:assert/strict'
import { obtenerRecorridos } from '../src/services/documentRepository.js'

test('el repositorio documental devuelve recorridos de demostración', async () => {
  const recorridos = await obtenerRecorridos()
  assert.ok(Array.isArray(recorridos))
  assert.ok(recorridos.length >= 1)
  assert.ok(recorridos.every(x => typeof x.id === 'string' && typeof x.titulo === 'string'))
  assert.ok(recorridos.every(x => x.demostracion === true))
})
