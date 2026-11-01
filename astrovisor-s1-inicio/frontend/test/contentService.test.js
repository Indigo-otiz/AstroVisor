import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { cargarRecorridos } from '../src/services/contentService.js'
import { audioDe } from '../public/audio/narration.js'

const datos = JSON.parse(
  await readFile(new URL('../../content/recorridos.json', import.meta.url), 'utf8'),
)

test('consume el contrato documental real y transmite la cancelación', async (t) => {
  const controller = new AbortController()
  const fetchMock = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, '/api/contenidos/recorridos')
    assert.equal(options.signal, controller.signal)
    assert.equal(options.credentials, 'same-origin')
    return new Response(JSON.stringify(datos))
  })
  assert.deepEqual(await cargarRecorridos({ signal: controller.signal }), datos)
  assert.equal(fetchMock.mock.callCount(), 1)
})

for (const [nombre, respuesta] of [
  ['HTTP fallido', () => new Response('{}', { status: 500 })],
  [
    'red interrumpida',
    () => {
      throw new TypeError('offline')
    },
  ],
  ['JSON inválido', () => new Response('{')],
  ['objeto sin arreglo', () => new Response('{}')],
  ['historia ausente', () => new Response(JSON.stringify([{ ...datos[0], historia: '' }]))],
  ['IDs repetidos', () => new Response(JSON.stringify([datos[0], datos[0]]))],
  ['ID incompatible', () => new Response(JSON.stringify([{ ...datos[0], id: '../otro' }]))],
]) {
  test(`rechaza ${nombre} para mostrar un error recuperable`, async (t) => {
    t.mock.method(globalThis, 'fetch', respuesta)
    await assert.rejects(cargarRecorridos())
  })
}

test('distingue una lista vacía de un fallo', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => new Response('[]'))
  assert.deepEqual(await cargarRecorridos(), [])
})

test('una solicitud nueva se recupera de una respuesta fallida', async (t) => {
  let intentos = 0
  t.mock.method(globalThis, 'fetch', async () =>
    ++intentos === 1 ? new Response('{}', { status: 503 }) : new Response(JSON.stringify(datos)),
  )
  await assert.rejects(cargarRecorridos())
  assert.deepEqual(await cargarRecorridos(), datos)
})

test('metadatos de audio inválidos no invalidan una historia legible', async (t) => {
  const conAudioInvalido = [{ ...datos[0], multimedia: [{ tipo: 'audio', src: 'https://externo/invalido.wav' }] }]
  t.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify(conAudioInvalido)))
  const historias = await cargarRecorridos()
  assert.equal(historias[0].historia, datos[0].historia)
  assert.equal(audioDe(historias[0]), null)
})
