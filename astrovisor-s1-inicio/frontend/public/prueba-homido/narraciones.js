import { audioDe, crearNarrador } from '../audio/narration.js'

const $ = (id) => document.getElementById(id)
const narrador = crearNarrador()
const scene = $('testScene')
let historias = []
let actual = null
let objetivoAnterior = null
let ficha3D, titulo3D, resumen3D, estado3D
const acciones3D = new Map()
const objetivos = new Map()
let cargando = false
let ultimaVista = ''
let ultimaMirada = null

if (window.AFRAME) {
  window.AFRAME.registerComponent('rearmar-mirada', {
    init() { this.direccion = new window.AFRAME.THREE.Vector3() },
    tick() {
      if (!ultimaMirada || !scene.camera) return
      scene.camera.getWorldDirection(this.direccion)
      if (this.direccion.angleTo(ultimaMirada) >= 0.06) ultimaMirada = null
    },
  })
  scene.setAttribute('rearmar-mirada', '')
}

// Texto como textura local: conserva acentos sin depender de fuentes MSDF externas.
if (window.AFRAME) window.AFRAME.registerComponent('copia-legible', {
  schema: { value: { default: '' }, width: { default: 2.8 }, color: { default: '#ffffff' } },
  init() {
    this.canvas = document.createElement('canvas')
    this.texture = new window.AFRAME.THREE.CanvasTexture(this.canvas)
    this.texture.colorSpace = window.AFRAME.THREE.SRGBColorSpace
    this.material = new window.AFRAME.THREE.MeshBasicMaterial({ map: this.texture, transparent: true, depthWrite: false })
    this.mesh = new window.AFRAME.THREE.Mesh(new window.AFRAME.THREE.PlaneGeometry(1, 1), this.material)
    this.el.setObject3D('mesh', this.mesh)
  },
  update() {
    const ctx = this.canvas.getContext('2d')
    this.canvas.width = 1024
    ctx.font = '42px Arial, sans-serif'
    const lineas = []
    for (const parrafo of this.data.value.split('\n')) {
      let linea = ''
      for (const palabra of parrafo.split(' ')) {
        const siguiente = linea ? `${linea} ${palabra}` : palabra
        if (ctx.measureText(siguiente).width > 980 && linea) { lineas.push(linea); linea = palabra }
        else linea = siguiente
      }
      lineas.push(linea)
    }
    this.canvas.height = Math.max(64, lineas.length * 54 + 10)
    ctx.font = '42px Arial, sans-serif'
    ctx.fillStyle = this.data.color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    lineas.forEach((linea, i) => ctx.fillText(linea, 512, 32 + i * 54))
    this.mesh.scale.set(this.data.width, this.data.width * this.canvas.height / 1024, 1)
    this.texture.needsUpdate = true
  },
  remove() { this.mesh.geometry.dispose(); this.material.dispose(); this.texture.dispose(); this.el.removeObject3D('mesh') },
})

function entidad(tag, atributos, padre) {
  const el = document.createElement(tag)
  for (const [clave, valor] of Object.entries(atributos)) el.setAttribute(clave, valor)
  padre.append(el)
  return el
}
function texto(padre, value, position, width = 2.8, color = '#fff4cf') {
  return entidad('a-entity', { position, 'copia-legible': { value, width, color } }, padre)
}
function interactivo(el, activo) {
  el.classList.toggle('selectable', activo)
  el.setAttribute('visible', activo)
}
function refrescarRayos() { $('gazeCursor')?.components?.raycaster?.refreshObjects() }
function disponible(obj) { return audioDe(obj) }

function actualizarControles(estado) {
  const clave = `${actual?.id}:${estado.estado}:${estado.mensaje}:${estado.activacion}`
  if (clave === ultimaVista) return
  ultimaVista = clave
  $('listenStory').hidden = !estado.recurso
  $('listenStory').disabled = !estado.puedeEscuchar && !estado.puedePausar && !estado.puedeReanudar
  $('listenStory').textContent = estado.puedePausar ? 'Pausar' : estado.puedeReanudar ? 'Reanudar' : 'Escuchar'
  $('storyAudioStatus').textContent = estado.mensaje
  if (estado.activacion) $('audioPreparation').textContent = estado.activacion
  if (estado.estado === 'bloqueado') $('audioPreparation').textContent = estado.mensaje
  const posibilidades = { escuchar: estado.puedeEscuchar, pausar: estado.puedePausar, reanudar: estado.puedeReanudar, cerrar: true, salir: true }
  for (const [clave, el] of acciones3D) interactivo(el, !!actual && posibilidades[clave])
  const mensajeBreve = {
    'no-disponible': 'Audio no disponible. Lee la historia en web 2D.',
    listo: 'Selecciona Escuchar para comenzar.', cargando: 'Cargando narración…',
    reproduciendo: 'Reproduciendo narración.', pausado: 'En pausa. Reanudar continúa la historia.',
    finalizado: 'Finalizó. Puedes escucharla de nuevo.',
    bloqueado: 'Audio bloqueado. Retira el visor y toca Activar audio.',
    error: 'Audio no disponible. Intenta Escuchar de nuevo o lee en 2D.',
  }
  if (estado3D) estado3D.setAttribute('copia-legible', 'value', mensajeBreve[estado.estado] ?? estado.mensaje)
  window.dispatchEvent(new CustomEvent('astrovisor:narracion', { detail: { state: estado.estado, title: actual?.titulo } }))
  refrescarRayos()
}
narrador.observar(actualizarControles)

function colocarFicha() {
  if (!ficha3D || !scene.camera) return
  // Fijar frente a la mirada al abrir, luego dejar en el mundo para poder mirar sus botones.
  const THREE = window.AFRAME.THREE
  const posicion = new THREE.Vector3(), rotacion = new THREE.Quaternion()
  scene.camera.getWorldPosition(posicion)
  scene.camera.getWorldQuaternion(rotacion)
  posicion.add(new THREE.Vector3(0, 0, -2.8).applyQuaternion(rotacion))
  ficha3D.object3D.position.copy(posicion)
  ficha3D.object3D.quaternion.copy(rotacion)
}
function abrir(historia, origen = 'dom') {
  objetivoAnterior = document.querySelector(`[data-historia="${historia.id}"]`)
  actual = historia
  $('storyTitle').textContent = historia.titulo
  $('storyText').textContent = historia.historia
  $('storyCard').hidden = false
  const audio = disponible(historia)
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
  for (const el of objetivos.values()) el.classList.remove('selectable')
  $('target').classList.remove('selectable')
  if (ficha3D) {
    titulo3D.setAttribute('copia-legible', 'value', historia.titulo)
    resumen3D.setAttribute('copia-legible', 'value', historia.resumen)
    colocarFicha()
    ficha3D.setAttribute('visible', true)
    ficha3D.querySelector('[data-bloqueador]').classList.add('selectable')
  }
  narrador.seleccionar(audio)
  if (origen === 'dom') $('storyTitle').focus()
}
function cerrar({ devolverFoco = false } = {}) {
  actual = null
  narrador.seleccionar(null)
  $('storyCard').hidden = true
  if (ficha3D) {
    ficha3D.setAttribute('visible', false)
    ficha3D.querySelectorAll('.selectable').forEach((el) => el.classList.remove('selectable'))
  }
  for (const el of objetivos.values()) el.classList.add('selectable')
  $('target').classList.add('selectable')
  refrescarRayos()
  if (devolverFoco) objetivoAnterior?.focus()
}
function crearEscena() {
  if (!window.AFRAME || !scene.hasLoaded || ficha3D) return
  ficha3D = $('narrationCard3D')
  const fondo = entidad('a-plane', { width: 3.4, height: 2.35, color: '#142033', material: 'shader: flat; side: double', 'data-bloqueador': '', position: '0 0 -0.03' }, ficha3D)
  fondo.addEventListener('click', (event) => event.stopPropagation())
  titulo3D = texto(ficha3D, '', '0 0.88 0', 3)
  resumen3D = texto(ficha3D, '', '0 0.48 0', 2.9, '#ffffff')
  texto(ficha3D, 'Demostración · Lectura completa en web 2D', '0 0.15 0', 2.7)
  estado3D = texto(ficha3D, '', '0 -0.14 0', 2.9, '#f5e4c0')
  for (const [clave, etiqueta, posicion, accion] of [
    ['escuchar', 'Escuchar', '-0.94 -0.5 0.02', () => narrador.escuchar()],
    ['pausar', 'Pausar', '0 -0.5 0.02', () => narrador.pausar()],
    ['reanudar', 'Reanudar', '0.94 -0.5 0.02', () => narrador.reanudar()],
    ['cerrar', 'Cerrar ficha', '-0.68 -0.97 0.02', () => cerrar()],
    ['salir', 'Salir del visor', '0.68 -0.97 0.02', () => window.dispatchEvent(new Event('astrovisor:solicitar-salida'))],
  ]) {
    const boton = entidad('a-plane', { width: clave === 'cerrar' || clave === 'salir' ? 1.25 : 0.86, height: 0.36, position: posicion, color: '#285994', material: 'shader: flat', 'data-accion-audio': clave }, ficha3D)
    texto(boton, etiqueta, '0 0 0.01', clave === 'cerrar' || clave === 'salir' ? 1.8 : 1.9, '#ffffff')
    boton.addEventListener('click', (event) => {
      event.stopPropagation()
      if (!actual || !boton.classList.contains('selectable')) return
      if (event.detail?.cursorEl && scene.camera) {
        const direccion = scene.camera.getWorldDirection(new window.AFRAME.THREE.Vector3())
        // Al finalizar no volver a escuchar solo porque reaparezca el botón bajo la misma mirada.
        if (ultimaMirada && direccion.angleTo(ultimaMirada) < 0.06) return
        ultimaMirada = direccion
      }
      accion()
    })
    acciones3D.set(clave, boton)
  }
  construirObjetivos()
  ultimaVista = '' // Una ficha HTML puede haberse abierto antes de cargar A-Frame.
  if (actual) abrir(actual, 'escena')
  else actualizarControles(narrador.snapshot())
}
function construirObjetivos() {
  if (!ficha3D) return
  $('constellationTargets').replaceChildren()
  objetivos.clear()
  const puntos = {
    orion: [[-.33,.3],[.3,.3],[-.18,0],[0,-.02],[.18,-.04],[-.33,-.4],[.3,-.4]],
    'osa-mayor': [[-.55,.25],[-.2,.2],[.1,.05],[.35,.12],[.58,-.1],[.3,-.3],[.1,.05]],
    escorpio: [[-.4,.35],[-.2,.12],[0,-.1],[.05,-.4],[.3,-.5],[.5,-.3]],
  }
  historias.forEach((historia, index) => {
    const grupo = entidad('a-entity', { position: `${(index - 1) * 2.7} 1.8 -5.5` }, $('constellationTargets'))
    const superficie = entidad('a-plane', { width: 2, height: 1.9, color: '#172d4b', material: 'shader: flat', class: actual ? '' : 'selectable', 'data-constelacion-3d': historia.id }, grupo)
    superficie.addEventListener('click', () => { if (!actual && superficie.classList.contains('selectable')) abrir(historia, 'mirada') })
    texto(grupo, historia.titulo, '0 -0.68 0.03', 3.2)
    const vertices = puntos[historia.id] ?? puntos.orion
    vertices.forEach(([x, y], i) => {
      entidad('a-sphere', { position: `${x} ${y + .12} .05`, radius: .045, color: '#fff4cf', material: 'shader: flat' }, grupo)
      if (i) {
        const anterior = vertices[i - 1]
        entidad('a-entity', { line: { start: `${anterior[0]} ${anterior[1] + .12} .04`, end: `${x} ${y + .12} .04`, color: '#b5c7dd' } }, grupo)
      }
    })
    objetivos.set(historia.id, superficie)
  })
  refrescarRayos()
}

async function cargar() {
  if (cargando) return
  cargando = true
  $('storiesStatus').textContent = 'Cargando historias…'
  $('retryStories').hidden = true
  try {
    const respuesta = await fetch('/api/contenidos/recorridos', { credentials: 'same-origin' })
    if (!respuesta.ok) throw new Error('HTTP')
    const datos = await respuesta.json()
    const ids = ['orion', 'osa-mayor', 'escorpio']
    if (!Array.isArray(datos)) throw new Error('Documento')
    historias = ids.map((id) => datos.find((x) => x?.id === id))
    if (historias.some((x) => !x || !['titulo', 'resumen', 'historia'].every((campo) => typeof x[campo] === 'string' && x[campo].trim()) || !Array.isArray(x.multimedia))) throw new Error('Historias')
    $('storyChoices').replaceChildren()
    historias.forEach((historia) => {
      const boton = document.createElement('button')
      boton.type = 'button'; boton.textContent = historia.titulo; boton.dataset.historia = historia.id
      boton.addEventListener('click', () => abrir(historia))
      $('storyChoices').append(boton)
    })
    const conAudio = historias.some(disponible)
    $('activateAudio').disabled = !conAudio
    $('audioPreparation').textContent = conAudio ? 'Toca Activar audio antes de usar el visor.' : 'Audio no disponible. Las historias se pueden leer.'
    $('storiesStatus').textContent = 'Puedes elegir con estos botones o con la mirada en la escena.'
    construirObjetivos()
  } catch {
    historias = []
    $('storiesStatus').textContent = 'No pudimos cargar las historias. Vuelve a intentar o regresa al modo web 2D.'
    $('audioPreparation').textContent = 'Las narraciones no están disponibles.'
    $('activateAudio').disabled = true
    $('retryStories').hidden = false
  } finally { cargando = false }
}
$('activateAudio').addEventListener('click', () => {
  if (!disponible(actual)) {
    const primera = historias.find(disponible)
    if (!primera) return
    narrador.seleccionar(disponible(primera))
  }
  narrador.activar()
})
$('listenStory').addEventListener('click', () => {
  const estado = narrador.snapshot()
  if (estado.puedePausar) narrador.pausar()
  else if (estado.puedeReanudar) narrador.reanudar()
  else narrador.escuchar()
})
$('closeStory').addEventListener('click', () => cerrar({ devolverFoco: true }))
$('retryStories').addEventListener('click', cargar)
window.addEventListener('astrovisor:salida-visor', () => cerrar())
scene.addEventListener('exit-vr', () => cerrar())
scene.addEventListener('loaded', crearEscena, { once: true })
if (scene.hasLoaded) crearEscena()
cargar()
