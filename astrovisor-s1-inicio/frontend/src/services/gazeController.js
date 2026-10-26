/**
 * Gaze Dwell Controller — AstroVisor Sprint 2 (Karime)
 * Gestiona el tiempo de permanencia de la mirada (3000 ms),
 * el progreso circular (0%, 33%, 66%, 100%), la cancelación suave y la confirmación accesible.
 */

export const DEFAULT_DWELL_TIME_MS = 3000 // 3 segundos sin prisa, pensado para adultos mayores

export class GazeController {
  constructor(options = {}) {
    this.dwellTime = options.dwellTime ?? DEFAULT_DWELL_TIME_MS
    this.onProgress = options.onProgress ?? (() => {})
    this.onConfirm = options.onConfirm ?? (() => {})
    this.onCancel = options.onCancel ?? (() => {})
    this.onStageChange = options.onStageChange ?? (() => {})

    this.currentTarget = null
    this.startTime = null
    this.rafId = null
    this.isPaused = false
    this.progress = 0
    this.stage = '0%' // '0%', '33%', '66%', '100%'
    this.isConfirmed = false
  }

  setPaused(paused) {
    this.isPaused = Boolean(paused)
    if (this.isPaused && this.currentTarget) {
      this.cancel()
    }
  }

  togglePause() {
    this.setPaused(!this.isPaused)
    return this.isPaused
  }

  start(target) {
    if (this.isPaused || !target) return
    if (this.currentTarget === target) return // ya en curso

    this.currentTarget = target
    this.startTime = performance.now()
    this.progress = 0
    this.stage = '0%'
    this.isConfirmed = false

    this.onStageChange(this.stage, target)
    this.onProgress(0, this.stage, target)

    this._tick()
  }

  _tick() {
    if (!this.currentTarget || this.isPaused || this.isConfirmed) return

    const elapsed = performance.now() - this.startTime
    const rawProgress = Math.min(elapsed / this.dwellTime, 1.0)
    this.progress = rawProgress

    let newStage = '0%'
    if (rawProgress >= 1.0) {
      newStage = '100%'
    } else if (rawProgress >= 0.66) {
      newStage = '66%'
    } else if (rawProgress >= 0.33) {
      newStage = '33%'
    }

    if (newStage !== this.stage) {
      this.stage = newStage
      this.onStageChange(this.stage, this.currentTarget)
    }

    this.onProgress(this.progress, this.stage, this.currentTarget)

    if (rawProgress >= 1.0) {
      this._complete()
    } else {
      this.rafId = (typeof requestAnimationFrame === 'function')
        ? requestAnimationFrame(() => this._tick())
        : setTimeout(() => this._tick(), 16)
    }
  }

  _complete() {
    this.isConfirmed = true
    const target = this.currentTarget
    this.onConfirm(target)
  }

  cancel() {
    if (!this.currentTarget && this.progress === 0) return

    if (this.rafId) {
      if (typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(this.rafId)
      } else {
        clearTimeout(this.rafId)
      }
      this.rafId = null
    }

    const previousTarget = this.currentTarget
    this.currentTarget = null
    this.startTime = null
    this.progress = 0
    this.stage = '0%'
    this.isConfirmed = false

    this.onCancel(previousTarget)
    this.onStageChange('0%', null)
    this.onProgress(0, '0%', null)
  }

  reset() {
    this.cancel()
  }

  /**
   * Permite fijar un estado manualmente para revisión o capturas (ej. selector de marcos de Figma).
   */
  setManualStage(stage) {
    const validStages = {
      '0%': 0,
      '33%': 0.33,
      '66%': 0.66,
      '100%': 1.0,
    }
    if (!(stage in validStages)) return

    this.cancel()
    this.stage = stage
    this.progress = validStages[stage]
    this.onStageChange(this.stage, null)
    this.onProgress(this.progress, this.stage, null)
    if (stage === '100%') {
      this.isConfirmed = true
    }
  }
}
