import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { crearNarrador, audioDe } from '../public/audio/narration.js'
import { presentarAudio, AVISO_SIN_AUDIO } from '../public/prueba-homido/js/ficha-canvas.js'

const leer = (r) => readFileSync(new URL(r, import.meta.url), 'utf8')
const real = JSON.parse(leer('../../content/recorridos.json'))

class Medio extends EventTarget {
  currentTime = 0; duration = 30; paused = true; ended = false; error = null; src = ''
  play() { this.paused = false; this.dispatchEvent(new Event('playing')); return Promise.resolve() }
  pause() { this.paused = true; this.dispatchEvent(new Event('pause')) }
  load() { this.error = null; this.ended = false }
  removeAttribute() { this.src = '' }
}
function nuevo(t) {
  const n = crearNarrador({ media: new Medio(), ventana: new EventTarget(), documento: new EventTarget() })
  t.after(() => n.destruir())
  return n
}

test('la ficha solo dice «Reproduciendo» cuando el reproductor lo confirma', async (t) => {
  const n = nuevo(t)
  n.seleccionar(audioDe(real.find((r) => r.id === 'orion')))
  assert.doesNotMatch(presentarAudio(n.snapshot()).aviso, /Reproduciendo/)
  assert.equal(presentarAudio(n.snapshot()).etiqueta, 'Escuchar narración')
  await n.escuchar()
  assert.equal(presentarAudio(n.snapshot()).aviso, 'Reproduciendo narración.')
  assert.equal(presentarAudio(n.snapshot()).etiqueta, 'Pausar narración')
  n.pausar()
  assert.match(presentarAudio(n.snapshot()).aviso, /En pausa/)
  assert.equal(presentarAudio(n.snapshot()).etiqueta, 'Reanudar narración')
  n.detener() // cerrar ficha / salir
  assert.equal(n.snapshot().estado, 'listo')
  assert.doesNotMatch(presentarAudio(n.snapshot()).aviso, /Reproduciendo/)
})

test('cambiar de constelación no superpone narraciones y cada una usa su WAV', async (t) => {
  const media = new Medio()
  const n = crearNarrador({ media, ventana: new EventTarget(), documento: new EventTarget() })
  t.after(() => n.destruir())
  const vistos = []
  for (const id of ['orion', 'osa-mayor', 'escorpio']) {
    n.seleccionar(audioDe(real.find((r) => r.id === id)))
    await n.escuchar()
    vistos.push(media.src)
    assert.equal(media.paused, false)
  }
  assert.deepEqual(vistos, ['/audio/orion-kokoro-v1.wav', '/audio/osa-mayor-kokoro-v1.wav', '/audio/escorpio-kokoro-v1.wav'])
  n.seleccionar(null) // cerrar ficha
  assert.equal(media.paused, true)
  assert.equal(n.snapshot().estado, 'no-disponible')
})

test('sin audio o sin reproductor la ficha avisa y nunca afirma reproducción', () => {
  assert.equal(presentarAudio(null).aviso, AVISO_SIN_AUDIO)
  assert.equal(presentarAudio({ estado: 'reproduciendo', recurso: null }).aviso, AVISO_SIN_AUDIO)
  assert.match(presentarAudio({ estado: 'bloqueado', recurso: {}, puedeEscuchar: true }).aviso, /Activar audio/)
  assert.match(presentarAudio({ estado: 'error', recurso: {} }).aviso, /no disponible/)
})

test('contrato visor ↔ narraciones: nombres coinciden y la pausa de mirada no pausa la narración', () => {
  const visor = leer('../public/prueba-homido/prueba.js')
  const narr = leer('../public/prueba-homido/narraciones.js')
  for (const m of ['constelaciones', 'abrir', 'cerrar', 'estadoNarracion']) {
    assert.ok(visor.includes(`${m}(`) || visor.includes(`${m}:`), `el visor expone ${m}`)
    assert.ok(narr.includes(`visor()?.${m}(`), `narraciones.js usa ${m}`)
  }
  for (const e of ['astrovisor:ficha-abierta', 'astrovisor:ficha-cerrada', 'astrovisor:audio-solicitado', 'astrovisor:salida-visor']) {
    assert.ok(narr.includes(e), `narraciones.js atiende ${e}`)
    assert.ok(visor.includes(e), `el visor emite ${e}`)
  }
  assert.ok(!/addEventListener\('astrovisor:mirilla-pausa'/.test(narr), 'la pausa de mirada no controla la narración')
  assert.ok(!visor.includes('new Audio('), 'la escena no crea un segundo reproductor')
  assert.ok(visor.includes('./js/ficha-canvas.js') && !/preventDefault|cancelable/.test(visor), 'no depende de cancelar el evento')
})
