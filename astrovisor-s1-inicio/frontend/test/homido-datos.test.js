import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { cargarDatos, validarRecorridos, adaptarLibro, adaptarAudio, resumirParaVisor, historiaParaVisor } from '../public/prueba-homido/js/datos.js'

const leer = (ruta) => JSON.parse(readFileSync(new URL(ruta, import.meta.url), 'utf8'))
const demo = leer('../public/prueba-homido/data/recorridos-demo.json')
const respuesta = (cuerpo, ok = true) => ({ ok, status: ok ? 200 : 500, json: async () => cuerpo })

test('el respaldo local cumple el contrato y trae las constelaciones', () => {
  assert.deepEqual(validarRecorridos(demo).map((f) => f.id), ['orion', 'osa-mayor', 'escorpio', 'can-mayor', 'boyero'])
  assert.ok(demo.every((f) => f.demostracion === true))
})

test('el respaldo local mantiene los mismos ids que content/recorridos.json', () => {
  const real = leer('../../content/recorridos.json')
  assert.deepEqual(demo.map((f) => f.id), real.map((f) => f.id))
})

test('cargarDatos usa la API cuando responde bien', async () => {
  const r = await cargarDatos({ fetchFn: async () => respuesta(demo) })
  assert.equal(r.fuente, 'api')
})

test('cargarDatos cae al respaldo local si la API falla, devuelve basura o HTML', async () => {
  for (const api of [
    async () => { throw new Error('red caída') },
    async () => respuesta({}, false),
    async () => ({ ok: true, status: 200, json: async () => { throw new SyntaxError('no es JSON') } }),
    async () => respuesta([{ id: 'x' }]),
  ]) {
    const r = await cargarDatos({ fetchFn: async (url, o) => (url.includes('/api/') ? api(url, o) : respuesta(demo)) })
    assert.equal(r.fuente, 'local')
    assert.equal(r.datos.length, demo.length)
    assert.ok(r.motivo)
  }
})

test('cargarDatos falla si API y respaldo fallan', async () => {
  await assert.rejects(cargarDatos({ fetchFn: async () => { throw new Error('sin red') } }))
})

test('validarRecorridos rechaza ids repetidos y campos vacíos', () => {
  assert.throws(() => validarRecorridos([demo[0], demo[0]]))
  assert.throws(() => validarRecorridos([{ ...demo[0], historia: ' ' }]))
  assert.throws(() => validarRecorridos([]))
})

test('adaptarLibro/adaptarAudio no inventan recursos', () => {
  assert.equal(adaptarLibro({ libros: [], multimedia: [] }), null)
  assert.equal(adaptarAudio({ libros: [], multimedia: [] }), null)
  assert.deepEqual(adaptarLibro(demo[0]), { titulo: 'Star Lore of All Ages', autor: 'William Tyler Olcott' })
  assert.deepEqual(adaptarLibro({ libros: [{ titulo: ' Atlas ', autor: 'A. B.' }] }), { titulo: 'Atlas', autor: 'A. B.' })
  assert.equal(adaptarAudio({ multimedia: [{ tipo: 'video', url: 'x' }] }), null)
  // Contrato real de Luis: multimedia[].src con metadatos completos (la misma regla que audioDe).
  assert.equal(adaptarAudio({ multimedia: [{ tipo: 'audio', url: '/a.mp3' }] }), null)
  const real = JSON.parse(readFileSync(new URL('../../content/recorridos.json', import.meta.url), 'utf8'))
  for (const [id, wav] of [['orion', '/audio/orion-kokoro-v1.wav'], ['osa-mayor', '/audio/osa-mayor-kokoro-v1.wav'], ['escorpio', '/audio/escorpio-kokoro-v1.wav']]) {
    assert.equal(adaptarAudio(real.find((r) => r.id === id)).src, wav)
  }
})

test('resumirParaVisor corta por oraciones y nunca modifica el texto original', () => {
  const texto = 'Primera oración corta. Segunda oración un poco más larga que la primera. Tercera.'
  assert.equal(resumirParaVisor(texto, 200), texto)
  assert.equal(resumirParaVisor(texto, 30), 'Primera oración corta.')
  assert.ok(resumirParaVisor('a'.repeat(50) + ' ' + 'b'.repeat(50), 60).endsWith('…'))
  const antes = demo[0].historia
  historiaParaVisor(demo[0], 100)
  assert.equal(demo[0].historia, antes)
  assert.equal(historiaParaVisor({ ...demo[0], historiaVisor: 'Breve.' }, 100), 'Breve.')
})
