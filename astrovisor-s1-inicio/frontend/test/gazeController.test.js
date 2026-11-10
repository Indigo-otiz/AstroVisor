import test from 'node:test'
import assert from 'node:assert/strict'
import { GazeController, DEFAULT_DWELL_TIME_MS } from '../src/services/gazeController.js'
import { crearReloj, controladorAislado } from '../test-support/reloj-mirada.mjs'

test('GazeController se inicializa en reposo con 3000 ms por defecto', () => {
  const ctrl = new GazeController()
  assert.equal(ctrl.dwellTime, DEFAULT_DWELL_TIME_MS)
  assert.equal(ctrl.progress, 0)
  assert.equal(ctrl.stage, '0%')
  assert.equal(ctrl.isPaused, false)
  assert.equal(ctrl.isConfirmed, false)
})

test('GazeController avanza por las etapas 0%, 33%, 66% y confirma en 100%', () => {
  const stagesVisited = []
  let confirmedTarget = null
  let confirmaciones = 0
  const reloj = crearReloj(), Controlador = controladorAislado(reloj)

  const ctrl = new Controlador({
    onStageChange: (stage) => stagesVisited.push(stage),
    onConfirm: (target) => { confirmedTarget = target; confirmaciones++ },
  })

  const dummyTarget = { id: 'orion-target' }
  ctrl.start(dummyTarget)

  assert.equal(ctrl.dwellTime, 3000)
  reloj.frameEn(989)
  assert.ok(ctrl.progress < 0.33)
  assert.equal(ctrl.stage, '0%')
  reloj.frameEn(990)
  assert.equal(ctrl.stage, '33%')
  reloj.frameEn(1979)
  assert.equal(ctrl.stage, '33%')
  reloj.frameEn(1980)
  assert.equal(ctrl.stage, '66%')
  reloj.frameEn(2999)
  assert.equal(ctrl.stage, '66%')
  assert.equal(ctrl.isConfirmed, false)
  assert.equal(confirmaciones, 0)
  reloj.frameEn(3000)

  assert.equal(ctrl.isConfirmed, true)
  assert.equal(ctrl.stage, '100%')
  assert.equal(confirmedTarget, dummyTarget)
  assert.ok(stagesVisited.includes('0%'))
  assert.ok(stagesVisited.includes('33%'))
  assert.ok(stagesVisited.includes('66%'))
  assert.ok(stagesVisited.includes('100%'))
  assert.deepEqual(stagesVisited, ['0%', '33%', '66%', '100%'])
  assert.equal(confirmaciones, 1)
  reloj.frameEn(6000)
  assert.equal(confirmaciones, 1)
  assert.equal(reloj.pendientes(), 0)
})

test('GazeController cancela y reinicia a 0% si la mirada se desvía antes de tiempo', () => {
  let wasCancelled = false
  let confirmed = false

  const reloj = crearReloj(), Controlador = controladorAislado(reloj)
  const ctrl = new Controlador({
    onCancel: () => { wasCancelled = true },
    onConfirm: () => { confirmed = true },
  })

  ctrl.start({ id: 'target-1' })
  reloj.frameEn(2999)
  assert.ok(ctrl.progress > 0)

  ctrl.cancel()

  assert.equal(ctrl.progress, 0)
  assert.equal(ctrl.stage, '0%')
  assert.equal(wasCancelled, true)
  assert.equal(confirmed, false)
  reloj.frameEn(6000)
  assert.equal(confirmed, false)
  assert.equal(reloj.pendientes(), 0)
})

test('pausar cancela la carga; continuar y reset no reutilizan el tiempo anterior', () => {
  const reloj = crearReloj(), Controlador = controladorAislado(reloj)
  let confirmaciones = 0
  const ctrl = new Controlador({ onConfirm: () => confirmaciones++ })
  const objetivo = { id: 'orion' }
  ctrl.start(objetivo)
  reloj.frameEn(990)
  assert.equal(ctrl.stage, '33%')
  ctrl.setPaused(true)
  assert.equal(ctrl.currentTarget, null)
  assert.equal(ctrl.stage, '0%')
  assert.equal(ctrl.progress, 0)
  assert.equal(reloj.pendientes(), 0)
  ctrl.start(objetivo)
  reloj.frameEn(4000)
  assert.equal(confirmaciones, 0)
  ctrl.setPaused(false)
  ctrl.start(objetivo)
  reloj.frameEn(6999)
  assert.equal(confirmaciones, 0)
  reloj.frameEn(7000)
  assert.equal(confirmaciones, 1)
  ctrl.reset()
  assert.equal(ctrl.stage, '0%')
  assert.equal(ctrl.isConfirmed, false)
  assert.equal(ctrl.currentTarget, null)
  assert.equal(reloj.pendientes(), 0)
})

test('relojes de controladores aislados no comparten tiempo ni modifican temporizadores globales', () => {
  const referencias = [globalThis.performance, globalThis.setTimeout, globalThis.clearTimeout, globalThis.requestAnimationFrame, globalThis.cancelAnimationFrame]
  const uno = crearReloj(), dos = crearReloj()
  const Primero = controladorAislado(uno), Segundo = controladorAislado(dos)
  let confirmaciones = 0
  const a = new Primero({ onConfirm: () => confirmaciones++ }), b = new Segundo({ onConfirm: () => confirmaciones++ })
  a.start({ id: 'uno' }); b.start({ id: 'dos' })
  uno.frameEn(3000)
  assert.equal(confirmaciones, 1)
  assert.equal(b.progress, 0)
  dos.frameEn(1000)
  assert.equal(b.stage, '33%')
  assert.equal(b.isConfirmed, false)
  b.cancel()
  assert.equal(dos.pendientes(), 0)
  assert.deepEqual([globalThis.performance, globalThis.setTimeout, globalThis.clearTimeout, globalThis.requestAnimationFrame, globalThis.cancelAnimationFrame], referencias)
})

for (const [dwellTime, tiempos, esperadas] of [
  [3000, [980, 1000, 1960, 2000, 2980, 3000], ['0%', '33%', '66%', '100%']],
  [100, [80, 96, 112], ['0%', '66%', '100%']],
  [3000, [2400, 3000], ['0%', '66%', '100%']],
  [3000, [6000], ['0%', '100%']],
]) {
  test(`salto de reloj con dwell ${dwellTime} y ticks ${tiempos}: muestra estado actual sin eventos retroactivos`, () => {
    const reloj = crearReloj(), Controlador = controladorAislado(reloj, { usarRAF: false })
    const etapas = []
    let confirmaciones = 0
    const ctrl = new Controlador({ dwellTime, onStageChange: s => etapas.push(s), onConfirm: () => confirmaciones++ })
    ctrl.start({ id: 'orion' })
    for (const tiempo of tiempos) reloj.temporizadoresEn(tiempo)
    assert.deepEqual(etapas, esperadas)
    assert.equal(ctrl.progress, 1)
    assert.equal(ctrl.isConfirmed, true)
    assert.equal(confirmaciones, 1)
    reloj.temporizadoresEn(10000)
    assert.equal(confirmaciones, 1)
    assert.equal(reloj.pendientes(), 0)
  })
}

test('GazeController pausa y no inicia mirada mientras esté pausado', () => {
  const ctrl = new GazeController()
  ctrl.setPaused(true)
  assert.equal(ctrl.isPaused, true)

  ctrl.start({ id: 'target-1' })
  assert.equal(ctrl.currentTarget, null)
  assert.equal(ctrl.progress, 0)

  ctrl.setPaused(false)
  assert.equal(ctrl.isPaused, false)
})

test('GazeController permite fijar estados manuales para revisión (0%, 33%, 66%, 100%)', () => {
  const ctrl = new GazeController()

  ctrl.setManualStage('33%')
  assert.equal(ctrl.stage, '33%')
  assert.equal(ctrl.progress, 0.33)

  ctrl.setManualStage('66%')
  assert.equal(ctrl.stage, '66%')
  assert.equal(ctrl.progress, 0.66)

  ctrl.setManualStage('100%')
  assert.equal(ctrl.stage, '100%')
  assert.equal(ctrl.progress, 1.0)
  assert.equal(ctrl.isConfirmed, true)

  ctrl.setManualStage('0%')
  assert.equal(ctrl.stage, '0%')
  assert.equal(ctrl.progress, 0)
})
