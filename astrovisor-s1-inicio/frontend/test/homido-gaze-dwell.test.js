import test from 'node:test'
import assert from 'node:assert/strict'
import { crearDwell, etapaDe, DWELL_MS, GRACIA_MS } from '../public/prueba-homido/js/gaze-dwell.js'
import { crearReloj } from '../test-support/reloj-mirada.mjs'

const esperar = (ms) => new Promise((r) => setTimeout(r, ms))
const A = { key: 'constelacion:orion' }
const B = { key: 'constelacion:escorpio' }

function registrar(opciones = {}) {
  const ev = []
  const d = crearDwell({
    dwellMs: 120,
    graciaMs: 40,
    onInicio: (t) => ev.push(['inicio', t.key]),
    onEtapa: (e) => ev.push(['etapa', e]),
    onConfirmar: (t) => ev.push(['confirmar', t.key]),
    onCancelar: (t) => ev.push(['cancelar', t.key]),
    ...opciones,
  })
  return { d, ev }
}

test('valores por defecto: 3000 ms y 280 ms de gracia; etapas 0/33/66/100', () => {
  assert.equal(DWELL_MS, 3000)
  assert.equal(GRACIA_MS, 280)
  assert.deepEqual([0, 0.32, 0.33, 0.65, 0.66, 0.99, 1].map(etapaDe), ['0%', '0%', '33%', '33%', '66%', '66%', '100%'])
})

test('confirma tras el tiempo de permanencia pasando por todas las etapas', () => {
  const reloj = crearReloj(), progresos = []
  const { d, ev } = registrar({ dwellMs: DWELL_MS, ahora: reloj.ahora, pedirFrame: reloj.pedirFrame, cancelarFrame: reloj.cancelarFrame,
    onProgreso: (p, e) => progresos.push([p, e]) })
  d.enfocar(A)
  reloj.frameEn(989)
  assert.ok(progresos.at(-1)[0] < 0.33)
  assert.equal(progresos.at(-1)[1], '0%')
  reloj.frameEn(990)
  assert.equal(progresos.at(-1)[1], '33%')
  reloj.frameEn(1979)
  assert.equal(progresos.at(-1)[1], '33%')
  reloj.frameEn(1980)
  assert.equal(progresos.at(-1)[1], '66%')
  reloj.frameEn(2999)
  assert.equal(ev.some(([tipo]) => tipo === 'confirmar'), false)
  reloj.frameEn(3000)
  assert.deepEqual(ev.filter(([t]) => t === 'etapa').map((e) => e[1]), ['33%', '66%', '100%'])
  assert.deepEqual([...new Set(progresos.map(([, e]) => e))], ['0%', '33%', '66%', '100%'])
  assert.deepEqual(ev.at(-1), ['confirmar', A.key])
  assert.equal(d.activo, null)
  reloj.frameEn(6000)
  assert.equal(ev.filter(([tipo]) => tipo === 'confirmar').length, 1)
  assert.equal(reloj.pendientes(), 0)
})

test('cancelación y pausa del consumidor reinician Homido sin confirmar la carga anterior', () => {
  const reloj = crearReloj()
  let permitido = true
  const { d, ev } = registrar({ dwellMs: DWELL_MS, ahora: reloj.ahora, pedirFrame: reloj.pedirFrame, cancelarFrame: reloj.cancelarFrame,
    puedeEnfocar: () => permitido })
  d.enfocar(A)
  reloj.frameEn(2999)
  permitido = false
  d.cancelar() // La escena cancela explícitamente al alternar la pausa.
  assert.equal(d.activo, null)
  assert.equal(reloj.pendientes(), 0)
  assert.equal(d.enfocar(A), false)
  reloj.frameEn(4000)
  assert.equal(ev.some(([tipo]) => tipo === 'confirmar'), false)
  permitido = true
  d.enfocar(B)
  reloj.frameEn(6999)
  assert.equal(ev.some(([tipo]) => tipo === 'confirmar'), false)
  reloj.frameEn(7000)
  assert.deepEqual(ev.filter(([tipo]) => tipo === 'confirmar'), [['confirmar', B.key]])
  assert.equal(reloj.pendientes(), 0)
})

for (const [dwellMs, tiempos, esperadas] of [
  [100, [80, 96, 112], ['66%', '100%']],
  [3000, [2400, 3000], ['66%', '100%']],
  [3000, [6000], ['100%']],
]) {
  test(`Homido con dwell ${dwellMs} y frames ${tiempos} no emite etapas retroactivas`, () => {
    const reloj = crearReloj()
    const { d, ev } = registrar({ dwellMs, ahora: reloj.ahora, pedirFrame: reloj.pedirFrame, cancelarFrame: reloj.cancelarFrame })
    d.enfocar(A)
    for (const tiempo of tiempos) reloj.frameEn(tiempo)
    assert.deepEqual(ev.filter(([tipo]) => tipo === 'etapa').map(([, e]) => e), esperadas)
    assert.deepEqual(ev.at(-1), ['confirmar', A.key])
    assert.equal(d.activo, null)
    reloj.frameEn(10000)
    assert.equal(ev.filter(([tipo]) => tipo === 'confirmar').length, 1)
    assert.equal(reloj.pendientes(), 0)
  })
}

test('retirar la mirada más allá de la gracia cancela y no confirma', async () => {
  const { d, ev } = registrar()
  d.enfocar(A)
  await esperar(30)
  d.desenfocar()
  await esperar(200)
  assert.deepEqual(ev.map((e) => e[0]).filter((t) => t !== 'etapa'), ['inicio', 'cancelar'])
})

test('volver a mirar dentro de la gracia conserva la carga', async () => {
  const { d, ev } = registrar({ graciaMs: 80 })
  d.enfocar(A)
  await esperar(30)
  d.desenfocar()
  await esperar(15)
  d.enfocar({ key: A.key }) // otro elemento, misma key (aro colisionador)
  await esperar(250)
  assert.equal(ev.filter((e) => e[0] === 'inicio').length, 1)
  assert.deepEqual(ev.at(-1), ['confirmar', A.key])
})

test('cambiar de constelación reinicia la carga de la anterior', async () => {
  const { d, ev } = registrar()
  d.enfocar(A)
  await esperar(30)
  d.enfocar(B)
  assert.deepEqual(ev.filter((e) => e[0] !== 'etapa'), [['inicio', A.key], ['cancelar', A.key], ['inicio', B.key]])
  await esperar(250)
  assert.deepEqual(ev.at(-1), ['confirmar', B.key])
})

test('puedeEnfocar=false impide iniciar (pausa o estado incorrecto)', async () => {
  const { d, ev } = registrar({ puedeEnfocar: () => false })
  assert.equal(d.enfocar(A), false)
  await esperar(50)
  assert.deepEqual(ev, [])
})

test('cancelar() explícito deja el controlador listo para un nuevo objetivo', async () => {
  const { d, ev } = registrar()
  d.enfocar(A)
  d.cancelar()
  d.enfocar(B)
  await esperar(250)
  assert.deepEqual(ev.filter((e) => ['confirmar', 'cancelar'].includes(e[0])), [['cancelar', A.key], ['confirmar', B.key]])
})
