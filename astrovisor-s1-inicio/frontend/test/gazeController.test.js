import test from 'node:test'
import assert from 'node:assert/strict'
import { GazeController, DEFAULT_DWELL_TIME_MS } from '../src/services/gazeController.js'

test('GazeController se inicializa en reposo con 3000 ms por defecto', () => {
  const ctrl = new GazeController()
  assert.equal(ctrl.dwellTime, DEFAULT_DWELL_TIME_MS)
  assert.equal(ctrl.progress, 0)
  assert.equal(ctrl.stage, '0%')
  assert.equal(ctrl.isPaused, false)
  assert.equal(ctrl.isConfirmed, false)
})

test('GazeController avanza por las etapas 0%, 33%, 66% y confirma en 100%', async () => {
  const stagesVisited = []
  let confirmedTarget = null

  const ctrl = new GazeController({
    dwellTime: 100, // corto para pruebas rápidas
    onStageChange: (stage) => stagesVisited.push(stage),
    onConfirm: (target) => { confirmedTarget = target },
  })

  const dummyTarget = { id: 'orion-target' }
  ctrl.start(dummyTarget)

  // Esperar tiempo suficiente para completar dwell
  await new Promise((resolve) => setTimeout(resolve, 150))

  assert.equal(ctrl.isConfirmed, true)
  assert.equal(ctrl.stage, '100%')
  assert.equal(confirmedTarget, dummyTarget)
  assert.ok(stagesVisited.includes('0%'))
  assert.ok(stagesVisited.includes('33%'))
  assert.ok(stagesVisited.includes('66%'))
  assert.ok(stagesVisited.includes('100%'))
})

test('GazeController cancela y reinicia a 0% si la mirada se desvía antes de tiempo', async () => {
  let wasCancelled = false
  let confirmed = false

  const ctrl = new GazeController({
    dwellTime: 200,
    onCancel: () => { wasCancelled = true },
    onConfirm: () => { confirmed = true },
  })

  ctrl.start({ id: 'target-1' })
  await new Promise((resolve) => setTimeout(resolve, 50))
  assert.ok(ctrl.progress > 0)

  ctrl.cancel()

  assert.equal(ctrl.progress, 0)
  assert.equal(ctrl.stage, '0%')
  assert.equal(wasCancelled, true)
  assert.equal(confirmed, false)
})

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
