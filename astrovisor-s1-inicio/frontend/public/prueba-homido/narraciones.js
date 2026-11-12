import { audioDe, crearNarrador } from '../audio/narration.js'
import { cargarDatosCompartidos } from './js/datos.js'

const $ = (id) => document.getElementById(id)
const narrador = crearNarrador()
let historias = [], actual = null, anterior = null, ultimaVista = '', cargando = false
const visor = () => window.astrovisorVisor
function controlarAudio() {
  if (!actual) return
  const estado = narrador.snapshot()
  if (estado.puedePausar) narrador.pausar()
  else if (estado.puedeReanudar) narrador.reanudar()
  else if (estado.puedeEscuchar) narrador.escuchar()
}
function actualizar(estado) {
  const clave = `${actual?.id}:${estado.estado}:${estado.mensaje}:${estado.activacion}`
  if (clave === ultimaVista) return
  ultimaVista = clave
  $('listenStory').hidden = !estado.recurso
  $('listenStory').disabled = !estado.puedeEscuchar && !estado.puedePausar && !estado.puedeReanudar
  $('listenStory').textContent = estado.puedePausar ? 'Pausar' : estado.puedeReanudar ? 'Reanudar' : 'Escuchar'
  $('storyAudioStatus').textContent = estado.mensaje
  if (estado.activacion) $('audioPreparation').textContent = estado.activacion
  if (estado.estado === 'bloqueado') $('audioPreparation').textContent = estado.mensaje
  visor()?.estadoNarracion(estado)
  window.dispatchEvent(new CustomEvent('astrovisor:narracion', { detail: { state: estado.estado, title: actual?.titulo } }))
}
narrador.observar(actualizar)
function abrir(historia, desdeVisor = false) {
  anterior = document.querySelector(`[data-historia="${historia.id}"]`)
  actual = historia
  $('storyTitle').textContent = historia.titulo
  $('storyText').textContent = historia.historia
  $('storyCard').hidden = false
  const audio = audioDe(historia)
  $('storyOrigin').textContent = audio ? `${audio.voz} · Contenido de demostración.` : 'Contenido de demostración. Puedes leer esta historia sin sonido.'
  $('storyTranscript').hidden = !audio
  $('storyTranscript').open = false
  $('transcriptText').textContent = audio?.transcripcion ?? ''
  $('storyCredits').replaceChildren()
  if (audio) {
    for (const [etiqueta, campo] of [['Texto', 'autorTexto'], ['Procedencia', 'procedencia'], ['Voz', 'voz'], ['Permiso', 'permiso']]) {
      const dt = document.createElement('dt'), dd = document.createElement('dd')
      dt.textContent = etiqueta; dd.textContent = audio[campo]
      $('storyCredits').append(dt, dd)
    }
  }
  narrador.seleccionar(audio)
  if (!desdeVisor) { visor()?.abrir(historia); $('storyTitle').focus() }
}
function cerrar({ desdeVisor = false, foco = false } = {}) {
  actual = null
  narrador.seleccionar(null)
  $('storyCard').hidden = true
  if (!desdeVisor) visor()?.cerrar()
  if (foco) anterior?.focus()
}
async function cargar() {
  if (cargando) return
  cargando = true
  $('storiesStatus').textContent = 'Cargando historias…'
  $('retryStories').hidden = true
  try {
    const params = new URLSearchParams(window.location.search)
    if (params.get('error') === '1' || params.get('simularError') === '1') throw new Error('Fallo simulado')
    const datos = (await cargarDatosCompartidos()).datos
    if (!Array.isArray(datos)) throw new Error('Documento')
    historias = ['orion', 'osa-mayor', 'escorpio'].map((id) => datos.find((x) => x?.id === id))
    if (historias.some((x) => !x || !['titulo', 'resumen', 'historia'].every((campo) => typeof x[campo] === 'string' && x[campo].trim()) || !Array.isArray(x.multimedia))) throw new Error('Historias')
    $('storyChoices').replaceChildren()
    historias.forEach((historia) => {
      const boton = document.createElement('button')
      boton.type = 'button'; boton.textContent = historia.titulo; boton.dataset.historia = historia.id
      boton.addEventListener('click', () => abrir(historia))
      $('storyChoices').append(boton)
    })
    const conAudio = historias.some(audioDe)
    $('activateAudio').disabled = !conAudio
    $('audioPreparation').textContent = conAudio ? 'Toca Activar audio antes de usar el visor.' : 'Audio no disponible. Las historias se pueden leer.'
    $('storiesStatus').textContent = 'Elige con estos botones o mantén la mirada durante 3 segundos en la escena.'
    visor()?.constelaciones(historias)
  } catch {
    historias = []
    $('storiesStatus').textContent = 'No pudimos cargar las historias. Vuelve a intentar o regresa al modo web 2D.'
    $('audioPreparation').textContent = 'Las narraciones no están disponibles.'
    $('activateAudio').disabled = true
    $('retryStories').hidden = false
  } finally { cargando = false }
}
$('activateAudio').addEventListener('click', () => {
  if (!audioDe(actual)) {
    const primera = historias.find(audioDe)
    if (!primera) return
    narrador.seleccionar(audioDe(primera))
  }
  narrador.activar()
})
$('listenStory').addEventListener('click', controlarAudio)
$('closeStory').addEventListener('click', () => cerrar({ foco: true }))
$('retryStories').addEventListener('click', cargar)
window.addEventListener('astrovisor:ficha-abierta', (event) => {
  if (actual !== event.detail) abrir(event.detail, true)
})
window.addEventListener('astrovisor:ficha-cerrada', () => cerrar({ desdeVisor: true }))
window.addEventListener('astrovisor:audio-solicitado', controlarAudio)
window.addEventListener('astrovisor:audio-repetir', () => {
  if (!actual) return;
  narrador.escuchar();
});
// La pausa de la mirada ('astrovisor:mirilla-pausa') NO pausa la narración: se controla solo con Pausar/Reanudar de la ficha.
window.addEventListener('astrovisor:salida-visor', () => cerrar({ desdeVisor: true }))
$('testScene').addEventListener('exit-vr', () => cerrar())
$('testScene').addEventListener('loaded', () => {
  visor()?.constelaciones(historias)
  if (actual) { visor()?.abrir(actual); visor()?.estadoNarracion(narrador.snapshot()) }
}, { once: true })
cargar()
