import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'

export function crearReloj() {
  let tiempo = 0, siguiente = 0
  const frames = new Map(), timers = new Map()
  function avanzar(t) { assert.ok(Number.isFinite(t) && t >= tiempo); tiempo = t }
  return {
    ahora: () => tiempo,
    pedirFrame: fn => { const id = ++siguiente; frames.set(id, fn); return id },
    cancelarFrame: id => frames.delete(id),
    setTimeout: (fn, ms) => { const id = ++siguiente; timers.set(id, { fn, vence: tiempo + ms }); return id },
    clearTimeout: id => timers.delete(id),
    frameEn(t) {
      avanzar(t)
      const lote = [...frames]
      for (const [id, fn] of lote) if (frames.delete(id)) fn(tiempo)
    },
    temporizadoresEn(t) {
      avanzar(t)
      const lote = [...timers].filter(([, p]) => p.vence <= tiempo).sort((a, b) => a[1].vence - b[1].vence)
      for (const [id, p] of lote) if (timers.delete(id)) p.fn()
    },
    pendientes: () => frames.size + timers.size,
  }
}

export function controladorAislado(reloj, { usarRAF = true } = {}) {
  // shortcut: módulo actual sin imports; revisar esta carga VM cuando incorpore dependencias.
  const fuente = readFileSync(new URL('../src/services/gazeController.js', import.meta.url), 'utf8')
  // Solo adaptar exports al script VM; ejecutar intacto el cuerpo de producción con globals privados.
  return runInNewContext(`(() => {${fuente.replace(/^export /gm, '')}\n;return GazeController})()`, {
    performance: { now: reloj.ahora }, setTimeout: reloj.setTimeout, clearTimeout: reloj.clearTimeout,
    ...(usarRAF ? { requestAnimationFrame: reloj.pedirFrame, cancelAnimationFrame: reloj.cancelarFrame } : {}),
  }, { filename: 'gazeController.js' })
}
