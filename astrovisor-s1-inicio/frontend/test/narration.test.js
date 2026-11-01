import test from 'node:test'
import assert from 'node:assert/strict'
import { audioDe, crearNarrador } from '../public/audio/narration.js'

class Medio extends EventTarget {
  currentTime = 0; duration = 30; paused = true; ended = false; error = null; src = ''
  play() { this.paused = false; this.dispatchEvent(new Event('playing')); return Promise.resolve() }
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')) }
  load() { this.error = null; this.ended = false }
  removeAttribute() { this.src = '' }
}
const recurso = { tipo: 'audio', src: '/audio/orion.wav', transcripcion: 'Historia', autorTexto: 'Autor', voz: 'Voz sintética', procedencia: 'Guion', permiso: 'Demo autorizada' }
function preparar(t) {
  const media = new Medio(), ventana = new EventTarget(), documento = new EventTarget()
  const narrador = crearNarrador({ media, ventana, documento })
  narrador.seleccionar(recurso)
  t.after(() => narrador.destruir())
  return { media, narrador, ventana, documento }
}
test('el audio opcional inválido no sustituye el relato ni habilita una URL externa', () => {
  assert.equal(audioDe({ multimedia: [] }), null)
  for (const src of ['https://otro/audio.wav', '/audio/../orion.wav', '/audio/orion.js']) {
    assert.equal(audioDe({ multimedia: [{ ...recurso, src }] }), null)
  }
  assert.equal(audioDe({ multimedia: [{ ...recurso, permiso: '' }] }), null)
  assert.deepEqual(audioDe({ multimedia: [recurso] }), recurso)
})
test('pausa conserva posición y reanudar continúa; finalizar permite repetir', async (t) => {
  const { media, narrador } = preparar(t)
  await narrador.escuchar()
  media.currentTime = 8
  narrador.pausar()
  assert.equal(narrador.snapshot().estado, 'pausado')
  assert.equal(media.currentTime, 8)
  await narrador.reanudar()
  assert.equal(media.currentTime, 8)
  assert.equal(narrador.snapshot().estado, 'reproduciendo')
  media.ended = true; media.dispatchEvent(new Event('ended'))
  assert.equal(narrador.snapshot().estado, 'finalizado')
  await narrador.escuchar()
  assert.equal(media.currentTime, 0)
})
test('rechazo por gesto ofrece recuperación sin anunciar reproducción', async (t) => {
  const { media, narrador } = preparar(t)
  media.play = () => Promise.reject(new DOMException('gesto', 'NotAllowedError'))
  assert.equal(await narrador.escuchar(), false)
  assert.equal(narrador.snapshot().estado, 'bloqueado')
  assert.equal(narrador.snapshot().puedeEscuchar, true)
  media.play = Medio.prototype.play
  assert.equal(await narrador.activar(), true)
  assert.equal(media.paused, true)
  assert.equal(media.currentTime, 0)
  assert.equal(narrador.snapshot().estado, 'listo')
  await narrador.escuchar()
  assert.equal(narrador.snapshot().estado, 'reproduciendo')
})
test('fallo del medio conserva lectura y permite intentar de nuevo', async (t) => {
  const { media, narrador } = preparar(t)
  await narrador.escuchar()
  media.error = { code: 4 }; media.dispatchEvent(new Event('error'))
  assert.equal(narrador.snapshot().estado, 'error')
  await narrador.escuchar()
  assert.equal(narrador.snapshot().estado, 'reproduciendo')
})
for (const accion of ['detener', 'seleccionar', 'destruir', 'pausar']) {
  test(`un play tardío no deja sonido después de ${accion}`, async (t) => {
    const { media, narrador } = preparar(t)
    let resolver
    media.play = () => new Promise((r) => { resolver = r })
    const pendiente = narrador.escuchar()
    narrador[accion](accion === 'seleccionar' ? { ...recurso, src: '/audio/escorpio.wav' } : undefined)
    media.paused = false
    media.dispatchEvent(new Event('playing'))
    resolver()
    await pendiente
    assert.equal(media.paused, true)
    assert.notEqual(narrador.snapshot().estado, 'reproduciendo')
  })
}
test('resolver el play anterior no pausa la narración nueva', async (t) => {
  const { media, narrador } = preparar(t)
  let resolver
  media.play = () => new Promise((r) => { resolver = r })
  const anterior = narrador.escuchar()
  narrador.seleccionar({ ...recurso, src: '/audio/escorpio.wav' })
  media.play = Medio.prototype.play
  await narrador.escuchar()
  resolver(); await anterior
  assert.equal(media.src, '/audio/escorpio.wav')
  assert.equal(media.paused, false)
  assert.equal(narrador.snapshot().estado, 'reproduciendo')
})
test('ocultar pausa; pagehide reinicia y destruir retira observadores y listeners', async (t) => {
  const { media, narrador, ventana, documento } = preparar(t)
  await narrador.escuchar(); media.currentTime = 12
  documento.hidden = true; documento.dispatchEvent(new Event('visibilitychange'))
  assert.equal(narrador.snapshot().estado, 'pausado')
  assert.equal(media.currentTime, 12)
  ventana.dispatchEvent(new Event('pagehide'))
  assert.equal(media.currentTime, 0)
  let llamadas = 0
  narrador.observar(() => llamadas++)
  narrador.destruir()
  const antes = llamadas
  ventana.dispatchEvent(new Event('pagehide')); media.dispatchEvent(new Event('timeupdate'))
  assert.equal(llamadas, antes)
})
