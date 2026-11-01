import test from 'node:test'
import assert from 'node:assert/strict'
import { generarEstrellas, generarResplandor, NORMAL_BANDA } from '../public/prueba-homido/js/cielo.js'
import { vistasOjos } from '../public/prueba-homido/js/estereo.js'

test('generarEstrellas: cantidad exacta, vectores unitarios, solo sobre el horizonte y determinista', () => {
  const a = generarEstrellas(400)
  assert.equal(a.length, 400)
  for (const [x, y, z] of a) {
    assert.ok(Math.abs(Math.hypot(x, y, z) - 1) < 1e-9)
    assert.ok(y >= -0.05 - 1e-9)
  }
  assert.deepEqual(generarEstrellas(50, { semilla: 3 }), generarEstrellas(50, { semilla: 3 }))
  assert.notDeepEqual(generarEstrellas(50, { semilla: 3 }), generarEstrellas(50, { semilla: 4 }))
})

const lat = (d) => Math.abs(d[0] * NORMAL_BANDA[0] + d[1] * NORMAL_BANDA[1] + d[2] * NORMAL_BANDA[2])
const media = (a) => a.reduce((x, y) => x + y, 0) / a.length

test('el campo de estrellas cubre el cielo y no solo la banda', () => {
  const a = generarEstrellas(600)
  const arriba = a.filter((d) => d[1] > 0.5).length
  assert.ok(arriba > 30 && arriba < 600)
})

test('la banda es una franja suave: gaussiana, mucho más estrecha que el cielo libre y sin borde duro', () => {
  const enBanda = generarEstrellas(3000, { banda: 1 }).map(lat)
  const libre = generarEstrellas(3000, { banda: 0 }).map(lat)
  assert.ok(media(enBanda) < 0.2 && media(libre) > 0.35)
  assert.ok(enBanda.some((v) => v > 0.35), 'hay estrellas dispersas a los lados (sin corte brusco)')
  assert.ok(enBanda.filter((v) => v < 0.06).length > enBanda.filter((v) => v > 0.2).length, 'más densa en el centro')
})

test('el resplandor de la banda es más ancho que las estrellas de la banda', () => {
  const h = generarResplandor(200)
  assert.equal(h.length, 200)
  assert.ok(media(h.map(lat)) > media(generarEstrellas(2000, { banda: 1 }).map(lat)))
  assert.ok(h.every((d) => d[1] >= -0.05 - 1e-9))
})

test('vistasOjos: dos mitades completas en píxeles CSS, independientes de la densidad de píxeles', () => {
  const v = vistasOjos(844, 390)
  assert.deepEqual(v.izquierdo, { x: 0, y: 0, ancho: 422, alto: 390 })
  assert.deepEqual(v.derecho, { x: 422, y: 0, ancho: 422, alto: 390 })
  assert.ok(Math.abs(v.aspecto - 422 / 390) < 1e-12)
  const impar = vistasOjos(845, 390)
  assert.equal(impar.izquierdo.ancho + impar.derecho.ancho, 845)
  assert.equal(impar.derecho.x, impar.izquierdo.ancho)
})
