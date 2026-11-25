<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as THREE from 'three'
import { cargarRecorridos } from '../services/contentService.js'

const router = useRouter()
const route = useRoute()

// Referencias del DOM
const containerRef = ref(null)

// Estados reactivos de la vista
const cargando = ref(true)
const isHomidoSplit = ref(route.query.modo === 'homido')
const isFullscreen = ref(false)
const isGazePaused = ref(false)
const selectedId = ref(null)
const selectedData = ref(null)
const isAudioPlaying = ref(false)
const audioLoading = ref(false)
const audioError = ref(false)
const dwellProgress = ref(0) // 0 a 1
const isDwellConfirmed = ref(false)
const catalogoRecorridos = ref([])
const hasSensorsActive = ref(false)
const avisoGiroDescartado = ref(typeof sessionStorage !== 'undefined' && sessionStorage.getItem('astrovisor_giro_ignorado') === '1')

// Estados de vista de información (Ficha con controles de audio vs Estantería de Libros vs Detalle de Libro)
const vistaPanel = ref('ficha') // 'ficha' | 'estanteria' | 'detalle'
const vistaQuadro = ref('ficha') // 'ficha' | 'estanteria' | 'detalle'
const libroDetalle = ref(null)

// Audio
let currentAudio = null
let synthUtterance = null

// Variables de Three.js
let scene, renderer
let cameraMono, cameraLeft, cameraRight
let starsPoints
let animationFrameId
let clock = new THREE.Clock()

// Interacción táctil y sensores de movimiento (Giroscopio)
let isDragging = false
let startX = 0, startY = 0
let prevMouseX = 0, prevMouseY = 0
let lon = 90, lat = 6.3
let targetLon = 90, targetLat = 6.3

// Datos del giroscopio del celular
let hasDeviceOrientation = false
let deviceOrientationData = { alpha: 0, beta: 0, gamma: 0 }
let screenAngle = 0

// Constelaciones, Hit Meshes, Nombres 3D y Raycasting
const constellationGroups = []
const raycaster = new THREE.Raycaster()
const centerScreenVec = new THREE.Vector2(0, 0)
const mouseVec = new THREE.Vector2()

// 3D Quadro de Información (para Homido / VR)
let infoQuadroGroup = null
let canvasQuadro = null
let textureQuadro = null
const bookImageCache = new Map()

// Botones 3D asociados al Quadro
let infoQuadroMesh = null
let btnQuadroGeo = null
let btnAudioGeo = null
let btnCloseGeo = null
let quadroBtn1 = null
let quadroBtn2 = null
let quadroBtn3 = null
let quadroBtn4 = null
const bookQuadroMeshes = []

// Botones 3D de control global en el pedestal / piso (Pausar mirada, Modo Homido / 2D y Salir)
let visorControls3DGroup = null
let pause3DMesh = null
let homidoToggle3DMesh = null
let exit3DMesh = null
const interactive3DButtons = []

// Temporizadores de Mirada Dwell (3 segundos con ventana de gracia anti-temblor de 750 ms)
let dwellTarget = null
let dwellStartTime = 0
let dwellGraceTimer = null
let dwellPausedElapsed = 0
const DWELL_DURATION = 3000
const DWELL_GRACE_MS = 750

// Sesión WebXR nativa para distorsión óptica de lentes (Modo VR Real)
let xrSession = null
const isWebXRActive = ref(false)

// Retícula 3D in-scene para WebXR nativo (Modo VR con distorsión de lentes)
let reticle3DMesh = null
let reticle3DTexture = null
let reticleCanvasCtx = null

// Constantes matemáticas y cuaterniones para orientación espacial y filtrado anti-temblor
const DEG2RAD = Math.PI / 180
const zee = new THREE.Vector3(0, 0, 1)
const euler = new THREE.Euler()
const q0 = new THREE.Quaternion()
const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)) // -90° en X

// Cuaterniones filtrados para eliminar el temblor (jitter / temblor del giroscopio móvil)
const targetQuat = new THREE.Quaternion()
const smoothedQuat = new THREE.Quaternion()
let hasValidOrientation = false

function setObjectQuaternion(quaternion, alpha, beta, gamma, orient) {
  euler.set(beta, alpha, -gamma, 'YXZ')
  quaternion.setFromEuler(euler)
  quaternion.multiply(q1)
  quaternion.multiply(q0.setFromAxisAngle(zee, -orient))
}

// Catálogo base de libros: Obras reales de la Biblioteca Solón Argüello con portadas fotografiadas
const LIBROS_CATALOGO = {
  // Orión
  'cazador-de-estrellas': {
    id: 'cazador-de-estrellas',
    titulo: 'Cazador de estrellas',
    autor: 'Silvia L. Cuesy',
    portada: { tipo: 'fotografia-ejemplar', src: '/portadas-biblioteca/cazador-de-estrellas.jpg' },
    motivo: 'Lectura complementaria. Una biografía ilustrada sobre la observación de las estrellas.',
    demostracion: false,
    marc21: { campo001: 'cazador-de-estrellas', campo003: 'SOLON-ARGÜELLO' }
  },
  'el-astronomo': {
    id: 'el-astronomo',
    titulo: 'El astrónomo',
    autor: 'Walt Whitman',
    portada: { tipo: 'fotografia-ejemplar', src: '/portadas-biblioteca/el-astronomo.jpg' },
    motivo: 'Lectura complementaria. Una lectura literaria sobre la experiencia de mirar el cielo.',
    demostracion: false,
    marc21: { campo001: 'el-astronomo', campo003: 'SOLON-ARGÜELLO' }
  },
  'mi-gran-libro-del-espacio': {
    id: 'mi-gran-libro-del-espacio',
    titulo: 'Mi gran libro del espacio',
    autor: 'Catherine D. Hughes',
    portada: { tipo: 'fotografia-ejemplar', src: '/portadas-biblioteca/mi-gran-libro-del-espacio.jpg' },
    motivo: 'Lectura complementaria. Una introducción ilustrada para continuar explorando el espacio.',
    demostracion: false,
    marc21: { campo001: 'mi-gran-libro-del-espacio', campo003: 'SOLON-ARGÜELLO' }
  },
  // Osa Mayor
  'para-comprender-el-universo': {
    id: 'para-comprender-el-universo',
    titulo: 'Para comprender el Universo',
    autor: 'Philippe de La Cotardière',
    portada: { tipo: 'fotografia-ejemplar', src: '/portadas-biblioteca/para-comprender-el-universo.jpg' },
    motivo: 'Lectura complementaria. Una guía general para situar la observación del cielo en el contexto del universo.',
    demostracion: false,
    marc21: { campo001: 'para-comprender-el-universo', campo003: 'SOLON-ARGÜELLO' }
  },
  'viaje-al-espacio': {
    id: 'viaje-al-espacio',
    titulo: 'Viaje al espacio',
    autor: 'Carole Stott',
    portada: { tipo: 'fotografia-ejemplar', src: '/portadas-biblioteca/viaje-al-espacio.jpg' },
    motivo: 'Lectura complementaria. Una lectura ilustrada sobre la exploración espacial.',
    demostracion: false,
    marc21: { campo001: 'viaje-al-espacio', campo003: 'SOLON-ARGÜELLO' }
  },
  'ng-el-espacio': {
    id: 'ng-el-espacio',
    titulo: 'National Geographic: El espacio',
    autor: 'National Geographic',
    portada: { tipo: 'fotografia-ejemplar', src: '/portadas-biblioteca/ng-el-espacio.jpg' },
    motivo: 'Lectura complementaria. Un número de revista sobre nuestro lugar en el espacio.',
    demostracion: false,
    marc21: { campo001: 'ng-el-espacio', campo003: 'SOLON-ARGÜELLO' }
  },
  // Escorpio
  'esa-inmensa-galaxia': {
    id: 'esa-inmensa-galaxia',
    titulo: 'Esa inmensa galaxia',
    autor: 'Kjartan Poskitt',
    portada: { tipo: 'fotografia-ejemplar', src: '/portadas-biblioteca/esa-inmensa-galaxia.jpg' },
    motivo: 'Lectura complementaria. Una introducción a la galaxia como contexto para observar el cielo nocturno.',
    demostracion: false,
    marc21: { campo001: 'esa-inmensa-galaxia', campo003: 'SOLON-ARGÜELLO' }
  },
  'oscuro-muy-oscuro': {
    id: 'oscuro-muy-oscuro',
    titulo: 'Oscuro, muy oscuro',
    autor: 'Ruth Brown',
    portada: { tipo: 'fotografia-ejemplar', src: '/portadas-biblioteca/oscuro-muy-oscuro.jpg' },
    motivo: 'Lectura complementaria. Un relato sobre la noche y la oscuridad del firmamento.',
    demostracion: false,
    marc21: { campo001: 'oscuro-muy-oscuro', campo003: 'SOLON-ARGÜELLO' }
  },
  'por-que-la-luna': {
    id: 'por-que-la-luna',
    titulo: 'Por qué la Luna no se cae',
    autor: 'Jordi Fortuny',
    portada: { tipo: 'fotografia-ejemplar', src: '/portadas-biblioteca/por-que-la-luna.jpg' },
    motivo: 'Lectura complementaria. Respuestas claras y visuales sobre la gravedad y la mecánica celeste.',
    demostracion: false,
    marc21: { campo001: 'por-que-la-luna', campo003: 'SOLON-ARGÜELLO' }
  },
  // Can Mayor
  'cosmografia-y-astrofisica': {
    id: 'cosmografia-y-astrofisica',
    titulo: 'Cosmografía y astrofísica',
    autor: 'Manuel E. Maldonado',
    portada: { tipo: 'fotografia-ejemplar', src: '/portadas-biblioteca/cosmografia-y-astrofisica.jpg' },
    motivo: 'Lectura complementaria. Fundamentos científicos de los astros y las estrellas de fondo.',
    demostracion: false,
    marc21: { campo001: 'cosmografia-y-astrofisica', campo003: 'SOLON-ARGÜELLO' }
  },
  'el-sistema-solar-sitesa': {
    id: 'el-sistema-solar-sitesa',
    titulo: 'El Sistema Solar',
    autor: 'Giles Sparrow',
    portada: { tipo: 'fotografia-ejemplar', src: '/portadas-biblioteca/el-sistema-solar-sitesa.jpg' },
    motivo: 'Lectura complementaria. Guía visual del vecindario cósmico y los cuerpos celestes.',
    demostracion: false,
    marc21: { campo001: 'el-sistema-solar-sitesa', campo003: 'SOLON-ARGÜELLO' }
  },
  'ng-sistema-solar': {
    id: 'ng-sistema-solar',
    titulo: 'National Geographic: Sistema Solar',
    autor: 'National Geographic',
    portada: { tipo: 'fotografia-ejemplar', src: '/portadas-biblioteca/ng-sistema-solar.jpg' },
    motivo: 'Lectura complementaria. Reportaje gráfico sobre los planetas y la exploración astronómica.',
    demostracion: false,
    marc21: { campo001: 'ng-sistema-solar', campo003: 'SOLON-ARGÜELLO' }
  },
  // Boyero
  'conacyt-la-tierra': {
    id: 'conacyt-la-tierra',
    titulo: 'Conacyt: La Tierra',
    autor: 'Consejo Nacional de Ciencia y Tecnología',
    portada: { tipo: 'fotografia-ejemplar', src: '/portadas-biblioteca/conacyt-la-tierra.jpg' },
    motivo: 'Lectura complementaria. Nuestro planeta observado desde el firmamento y las estaciones del año.',
    demostracion: false,
    marc21: { campo001: 'conacyt-la-tierra', campo003: 'SOLON-ARGÜELLO' }
  },
  'el-libro-de-los-cientificos': {
    id: 'el-libro-de-los-cientificos',
    titulo: 'El libro de los científicos',
    autor: 'Equipo Editorial',
    portada: { tipo: 'fotografia-ejemplar', src: '/portadas-biblioteca/el-libro-de-los-cientificos.jpg' },
    motivo: 'Lectura complementaria. Semblanzas de quienes descifraron los movimientos estelares.',
    demostracion: false,
    marc21: { campo001: 'el-libro-de-los-cientificos', campo003: 'SOLON-ARGÜELLO' }
  },
  'ng-destino-pluton': {
    id: 'ng-destino-pluton',
    titulo: 'National Geographic: Destino Plutón',
    autor: 'National Geographic',
    portada: { tipo: 'fotografia-ejemplar', src: '/portadas-biblioteca/ng-destino-pluton.jpg' },
    motivo: 'Lectura complementaria. Crónica de la exploración de las fronteras de nuestro sistema solar.',
    demostracion: false,
    marc21: { campo001: 'ng-destino-pluton', campo003: 'SOLON-ARGÜELLO' }
  },
  // Libros clásicos adicionales / demostración
  'star-lore': {
    id: 'star-lore',
    titulo: 'Star Lore of All Ages',
    autor: 'William Tyler Olcott',
    anio: 1911,
    url: 'https://archive.org/details/starloreofallage00olco',
    portada: '/libros-demo/star-lore.svg',
    marc21: { campo001: 'DEMO-001', campo003: 'DEMO', signatura: 'Sin signatura física asignada' }
  },
  'field-stars': {
    id: 'field-stars',
    titulo: 'A Field Book of the Stars',
    autor: 'William Tyler Olcott',
    anio: 1914,
    url: 'https://archive.org/details/fieldbookofstars00olcorich',
    portada: '/libros-demo/field-stars.svg',
    marc21: { campo001: 'DEMO-002', campo003: 'DEMO', signatura: 'Sin signatura física asignada' }
  },
  'half-hours': {
    id: 'half-hours',
    titulo: 'Half-Hours with the Stars',
    autor: 'Richard A. Proctor',
    anio: 1887,
    url: 'https://www.gutenberg.org/ebooks/23300',
    portada: '/libros-demo/half-hours.svg',
    marc21: { campo001: 'DEMO-003', campo003: 'DEMO', signatura: 'Sin signatura física asignada' }
  }
}

// Función para crear relieves tridimensionales con extrusión y acabado de marca de agua integrada
function crearRelieve(THREE_LIB, datos, textura = null, { opacidad = 0.20, opacidadLateral = 0.10, marcaAgua = true } = {}) {
  const grupo = new THREE_LIB.Group()
  grupo.userData.textura = textura
  try {
    for (const capa of datos.layers) {
      if (!(capa.depth > 0) || !Number.isFinite(capa.z)) continue
      const trazar = (Tipo, puntos) => {
        if (puntos.length < 3 || !puntos.every((p) => p.length === 2 && p.every(Number.isFinite))) {
          throw new Error('Contorno de relieve inválido')
        }
        const trazo = new Tipo()
        puntos.forEach(([x, y], i) => (i ? trazo.lineTo(x, y) : trazo.moveTo(x, y)))
        trazo.closePath()
        return trazo
      }
      const formas = capa.shapes.map(({ outer, holes }) => {
        const forma = trazar(THREE_LIB.Shape, outer)
        forma.holes = holes.map((p) => trazar(THREE_LIB.Path, p))
        return forma
      })
      const geometria = new THREE_LIB.ExtrudeGeometry(formas, {
        depth: capa.depth,
        steps: 1,
        bevelEnabled: false
      })
      if (textura) {
        const posiciones = geometria.attributes.position
        const uv = geometria.attributes.uv
        for (let i = 0; i < posiciones.count; i++) {
          uv.setXY(i, posiciones.getX(i) + 0.5, (posiciones.getY(i) * datos.width) / datos.height + 0.5)
        }
      }
      const frente = new THREE_LIB.MeshStandardMaterial({
        color: textura ? '#5a7394' : '#6f88a8',
        map: textura || null,
        roughness: 0.90,
        metalness: 0.0,
        transparent: marcaAgua,
        opacity: marcaAgua ? opacidad : 1.0,
        depthWrite: !marcaAgua
      })
      const lateral = new THREE_LIB.MeshStandardMaterial({
        color: '#3d4f66',
        roughness: 0.85,
        metalness: 0.05,
        transparent: marcaAgua,
        opacity: marcaAgua ? opacidadLateral : 1.0,
        depthWrite: !marcaAgua
      })
      const malla = new THREE_LIB.Mesh(geometria, [frente, lateral])
      malla.position.z = capa.z
      grupo.add(malla)
    }
    return grupo
  } catch (error) {
    console.warn('Error al generar relieve 3D institucional:', error)
    return grupo
  }
}

// Generador de textura suave de halo estelar
function createSoftHaloTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  const grad = ctx.createRadialGradient(32, 32, 2, 32, 32, 30)
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.75)')
  grad.addColorStop(0.25, 'rgba(245, 200, 66, 0.35)')
  grad.addColorStop(0.65, 'rgba(123, 208, 255, 0.1)')
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(canvas)
}

// Generador de etiquetas flotantes 3D con el nombre de cada constelación (GRANDE Y MUY VISIBLE)
function createLabelSprite(text) {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  // Fondo cápsula semitransparente con marco dorado
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(16, 16, 992, 224, 112)
  ctx.fillStyle = 'rgba(6, 12, 30, 0.90)'
  ctx.fill()
  ctx.lineWidth = 8
  ctx.strokeStyle = 'rgba(245, 200, 66, 0.90)'
  ctx.stroke()
  ctx.restore()

  // Nombre de la constelación con brillo y gran tamaño
  ctx.save()
  ctx.shadowColor = 'rgba(245, 200, 66, 0.75)'
  ctx.shadowBlur = 18
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 88px "Orbitron", "Space Grotesk", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 512, 128)
  ctx.restore()

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false
  })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(88, 22, 1)
  return sprite
}

// Sonido sutil de confirmación usando Web Audio API
function playChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(587.33, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18)
    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.3)
  } catch {}
}

// Configuración de las 5 constelaciones oficiales de AstroVisor
const CONSTELACIONES_CONFIG = [
  {
    id: 'orion',
    nombre: 'Orión',
    subtitulo: 'El Cazador Cósmico · Las Tres Marías',
    temporada: 'Invierno · Visible a simple vista',
    direccion: new THREE.Vector3(0, 25, -230).normalize(),
    historia: 'En un relato de la tradición griega, Orión era un cazador que recorría la tierra. Las personas imaginaron su figura entre las estrellas: dos hombros, dos pies y un cinturón en el centro. Contar su historia ayudaba a recordar ese dibujo en el cielo. Esta es una adaptación breve de muestra; otras culturas han encontrado figuras y relatos diferentes en las mismas estrellas.',
    comoReconecerla: 'Busca tres estrellas cercanas que parecen formar una línea: representan el cinturón. Imagina después una figura alrededor de ellas.',
    libros: [
      LIBROS_CATALOGO['cazador-de-estrellas'],
      LIBROS_CATALOGO['el-astronomo'],
      LIBROS_CATALOGO['mi-gran-libro-del-espacio']
    ],
    estrellas: [
      { nombre: 'Betelgeuse', pos: [-36, 42, -210], color: 0xffaa55, size: 3.2 },
      { nombre: 'Rigel', pos: [36, -44, -210], color: 0x99ccff, size: 3.4 },
      { nombre: 'Bellatrix', pos: [30, 38, -205], color: 0xeef5ff, size: 2.6 },
      { nombre: 'Saiph', pos: [-28, -42, -208], color: 0xb0d0ff, size: 2.4 },
      { nombre: 'Alnitak', pos: [-15, 2, -210], color: 0xffffff, size: 2.7 },
      { nombre: 'Alnilam', pos: [0, 1, -210], color: 0xffffff, size: 2.8 },
      { nombre: 'Mintaka', pos: [15, 0, -210], color: 0xffffff, size: 2.7 },
      { nombre: 'Meissa', pos: [0, 62, -205], color: 0xd8eeff, size: 2.1 }
    ],
    trazos: [
      [7, 0], [7, 2], [0, 4], [2, 6], [6, 5], [5, 4], [4, 3], [6, 1], [0, 2]
    ]
  },
  {
    id: 'osa-mayor',
    nombre: 'Osa Mayor',
    subtitulo: 'El Gran Carro · Guía hacia el Norte',
    temporada: 'Todo el año · Circumpolar',
    direccion: new THREE.Vector3(130, 140, -90).normalize(),
    historia: 'Una historia de la tradición griega relaciona a la Osa Mayor con Calisto, transformada en una osa y situada en el cielo. Es una de muchas maneras de interpretar estas estrellas. Otras personas han visto en parte de la figura un carro o un cucharón. Esos dibujos compartidos permiten recordar las estrellas y pasar historias de una generación a otra. Este relato es una adaptación de muestra.',
    comoReconecerla: 'En una parte de esta constelación se distingue una figura de siete estrellas: cuatro parecen formar un recipiente y tres, un mango.',
    libros: [
      LIBROS_CATALOGO['para-comprender-el-universo'],
      LIBROS_CATALOGO['viaje-al-espacio'],
      LIBROS_CATALOGO['ng-el-espacio']
    ],
    estrellas: [
      { nombre: 'Dubhe', pos: [110, 150, -90], color: 0xffe2aa, size: 3.1 },
      { nombre: 'Merak', pos: [95, 125, -95], color: 0xffffff, size: 2.7 },
      { nombre: 'Phecda', pos: [130, 115, -85], color: 0xffffff, size: 2.6 },
      { nombre: 'Megrez', pos: [140, 140, -80], color: 0xd8eeff, size: 2.3 },
      { nombre: 'Alioth', pos: [175, 150, -70], color: 0xffffff, size: 3.0 },
      { nombre: 'Mizar', pos: [200, 160, -60], color: 0xbedeff, size: 2.8 },
      { nombre: 'Alkaid', pos: [230, 170, -45], color: 0x99ccff, size: 3.1 }
    ],
    trazos: [
      [0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]
    ]
  },
  {
    id: 'escorpio',
    nombre: 'Escorpio',
    subtitulo: 'El Escorpión Celestial · Corazón de Antares',
    temporada: 'Primavera y Verano · Hemisferio Sur/Cenit',
    direccion: new THREE.Vector3(210, 60, 50).normalize(),
    historia: 'Algunos relatos de la tradición griega cuentan que un escorpión se enfrentó a Orión. Quienes narraban la historia imaginaron a ambos entre las estrellas y convirtieron sus figuras en una forma de recordar el cielo. El arco de estrellas de Escorpio recuerda una cola curvada.',
    comoReconecerla: 'Imagina una línea larga que termina en una curva, como la cola de un escorpión. Una de sus estrellas más conocidas es Antares.',
    libros: [
      LIBROS_CATALOGO['esa-inmensa-galaxia'],
      LIBROS_CATALOGO['oscuro-muy-oscuro'],
      LIBROS_CATALOGO['por-que-la-luna']
    ],
    estrellas: [
      { nombre: 'Antares', pos: [210, 62, 50], color: 0xff4422, size: 3.7 },
      { nombre: 'Graffias', pos: [200, 95, 40], color: 0xaaccff, size: 2.6 },
      { nombre: 'Dschubba', pos: [195, 82, 45], color: 0xffffff, size: 2.8 },
      { nombre: 'Pi Sco', pos: [192, 70, 48], color: 0xffffff, size: 2.3 },
      { nombre: 'Sargas', pos: [225, 15, 60], color: 0xffddaa, size: 2.9 },
      { nombre: 'Shaula', pos: [235, 30, 55], color: 0x99ccff, size: 3.2 },
      { nombre: 'Lesath', pos: [232, 35, 52], color: 0xaaddff, size: 2.5 }
    ],
    trazos: [
      [1, 2], [2, 3], [2, 0], [0, 4], [4, 5], [5, 6]
    ]
  },
  {
    id: 'can-mayor',
    nombre: 'Can Mayor',
    subtitulo: 'El Fiel Compañero · Sirio, la joya azul',
    temporada: 'Invierno · Siguiendo el cinturón de Orión',
    direccion: new THREE.Vector3(-95, -80, -180).normalize(),
    historia: 'En la tradición clásica, el Can Mayor representa a Lélape, el perro más veloz que acompañaba al cazador Orión a través del firmamento. En su pecho brilla Sirio, una estrella tan luminosa y cercana que los pueblos antiguos la usaban para marcar las estaciones del año y la crecida de los ríos.',
    comoReconecerla: 'Ubica primero el cinturón de tres estrellas de Orión y sigue esa línea recta hacia abajo y hacia la izquierda: encontrarás a Sirio, inconfundible por su intenso brillo azulado.',
    libros: [
      LIBROS_CATALOGO['cosmografia-y-astrofisica'],
      LIBROS_CATALOGO['el-sistema-solar-sitesa'],
      LIBROS_CATALOGO['ng-sistema-solar']
    ],
    estrellas: [
      { nombre: 'Sirio', pos: [-95, -75, -180], color: 0xc8e6ff, size: 4.8 },
      { nombre: 'Mirzam', pos: [-125, -80, -170], color: 0xaaddff, size: 3.2 },
      { nombre: 'Wezen', pos: [-90, -125, -165], color: 0xffddaa, size: 3.4 },
      { nombre: 'Adhara', pos: [-110, -145, -155], color: 0xbedeff, size: 3.5 },
      { nombre: 'Aludra', pos: [-75, -140, -160], color: 0x99ccff, size: 3.0 }
    ],
    trazos: [
      [1, 0], [0, 2], [2, 4], [2, 3]
    ]
  },
  {
    id: 'boyero',
    nombre: 'Boyero',
    subtitulo: 'El Pastor Cósmico · Guardián de Arturo',
    temporada: 'Primavera y Verano · Estrella Gigante Naranja',
    direccion: new THREE.Vector3(-140, 100, 140).normalize(),
    historia: 'El Boyero es imaginado en diversas tradiciones como un pastor o campesino que guía los rebaños en el cielo nocturno y vigila a las osas que giran alrededor del polo norte celeste. Su corazón resplandece con Arturo, una estrella gigante de color anaranjado que es una de las más luminosas visibles a simple vista.',
    comoReconecerla: 'Localiza las tres estrellas que forman el mango curvo de la Osa Mayor y sigue esa curva natural por el cielo: te conducirá directamente a Arturo, brillante y de tono cálido anaranjado.',
    libros: [
      LIBROS_CATALOGO['conacyt-la-tierra'],
      LIBROS_CATALOGO['el-libro-de-los-cientificos'],
      LIBROS_CATALOGO['ng-destino-pluton']
    ],
    estrellas: [
      { nombre: 'Arturo', pos: [-140, 100, 140], color: 0xff8833, size: 3.8 },
      { nombre: 'Nekkar', pos: [-130, 155, 130], color: 0xffeedd, size: 2.4 },
      { nombre: 'Seginus', pos: [-155, 145, 135], color: 0xaaccff, size: 2.5 },
      { nombre: 'Izar', pos: [-125, 120, 145], color: 0xffaa55, size: 2.8 },
      { nombre: 'Muphrid', pos: [-155, 90, 135], color: 0xffe2aa, size: 2.4 }
    ],
    trazos: [
      [0, 4], [0, 3], [3, 1], [1, 2], [2, 0]
    ]
  }
]

// Dibujar y actualizar textura canvas del retículo 3D in-scene para WebXR
function dibujarReticle3D(progress, isConfirmed, isPaused) {
  if (!reticleCanvasCtx) return
  const ctx = reticleCanvasCtx
  ctx.clearRect(0, 0, 128, 128)

  // 1. Halo oscuro exterior
  ctx.beginPath()
  ctx.arc(64, 64, 48, 0, Math.PI * 2)
  ctx.lineWidth = 10
  ctx.strokeStyle = 'rgba(5, 8, 20, 0.65)'
  ctx.stroke()

  // 2. Anillo de referencia blanco translúcido
  ctx.beginPath()
  ctx.arc(64, 64, 42, 0, Math.PI * 2)
  ctx.lineWidth = 4
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
  ctx.stroke()

  // 3. Arco de progreso de selección dwell
  if (!isPaused || (dwellTarget && dwellTarget.action === 'toggle-gaze')) {
    if (progress > 0) {
      ctx.beginPath()
      const startAngle = -Math.PI / 2
      const endAngle = startAngle + Math.min(1, Math.max(0, progress)) * (Math.PI * 2)
      ctx.arc(64, 64, 42, startAngle, endAngle)
      ctx.lineWidth = 7
      ctx.strokeStyle = isConfirmed ? '#4ade80' : '#f5c842'
      ctx.lineCap = 'round'
      ctx.stroke()
    }
  }

  // 4. Punto central de puntería
  ctx.beginPath()
  ctx.arc(64, 64, 6, 0, Math.PI * 2)
  ctx.fillStyle = isPaused ? '#94a3b8' : (isConfirmed ? '#4ade80' : '#f5c842')
  ctx.fill()

  reticle3DTexture.needsUpdate = true
}

// Generador de textura para botones 3D (Escala compacta, nítida y perfectamente proporcionada)
function createButtonCanvasTexture(texto, isPrimary = false, isAccent = false, isAudioPill = false, isCloseIcon = false, isSubtle = false) {
  const canvas = document.createElement('canvas')
  canvas.width = isAudioPill || isCloseIcon ? 256 : 640
  canvas.height = isAudioPill || isCloseIcon ? 256 : 160
  const ctx = canvas.getContext('2d')

  ctx.beginPath()
  if (isCloseIcon) {
    ctx.roundRect(14, 14, 228, 228, 52)
    ctx.fillStyle = 'rgba(127, 29, 29, 0.92)'
    ctx.fill()
    ctx.lineWidth = 10
    ctx.strokeStyle = '#ef4444'
    ctx.stroke()

    ctx.fillStyle = '#fecaca'
    ctx.font = 'bold 124px "Space Grotesk", "Segoe UI Symbol", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(texto, 128, 134)
  } else if (isAudioPill) {
    // Botón circular nítido de alto contraste, visible bajo cualquier ángulo
    ctx.arc(128, 128, 114, 0, Math.PI * 2)
    ctx.fillStyle = '#172554' // Azul marino cósmico sólido y nítido
    ctx.fill()
    ctx.lineWidth = 10
    ctx.strokeStyle = '#38bdf8' // Borde celeste brillante
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 106px "Space Grotesk", "Segoe UI Symbol", "Apple Color Emoji", sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(texto, 128, 134)
  } else if (isSubtle) {
    ctx.roundRect(8, 8, 624, 144, 34)
    ctx.fillStyle = isAccent
      ? 'rgba(74, 24, 38, 0.74)'
      : isPrimary
        ? 'rgba(120, 74, 12, 0.76)'
        : 'rgba(13, 18, 39, 0.74)'
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = isAccent
      ? 'rgba(248, 113, 113, 0.55)'
      : isPrimary
        ? 'rgba(245, 200, 66, 0.72)'
        : 'rgba(148, 197, 248, 0.45)'
    ctx.stroke()

    ctx.fillStyle = '#e2e8f0'
    let fSize = 48
    ctx.font = `600 ${fSize}px "Space Grotesk", "Segoe UI Symbol", "Apple Color Emoji", sans-serif`
    while (ctx.measureText(texto).width > 560 && fSize > 28) {
      fSize -= 2
      ctx.font = `600 ${fSize}px "Space Grotesk", "Segoe UI Symbol", "Apple Color Emoji", sans-serif`
    }
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(texto, 320, 80)
  } else {
    ctx.roundRect(8, 8, 624, 144, 28)
    ctx.fillStyle = isAccent
      ? 'rgba(74, 32, 48, 0.96)'
      : isPrimary
        ? 'rgba(27, 42, 90, 0.96)'
        : 'rgba(15, 23, 42, 0.96)'
    ctx.fill()
    ctx.lineWidth = 6
    ctx.strokeStyle = isAccent
      ? '#ef4444'
      : isPrimary
        ? '#f5c842'
        : 'rgba(255, 255, 255, 0.85)'
    ctx.stroke()

    ctx.fillStyle = '#ffffff'
    let fSize = 52
    ctx.font = `bold ${fSize}px "Space Grotesk", "Segoe UI Symbol", "Apple Color Emoji", sans-serif`
    while (ctx.measureText(texto).width > 560 && fSize > 28) {
      fSize -= 2
      ctx.font = `bold ${fSize}px "Space Grotesk", "Segoe UI Symbol", "Apple Color Emoji", sans-serif`
    }
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(texto, 320, 80)
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.needsUpdate = true
  return texture
}

// Pintar el lienzo del 3D Quadro (CENTRADO EN CONTROLES DE AUDIO, SIN PARED DE TEXTO)
function renderQuadroTexture(data, mode = 'ficha') {
  if (!canvasQuadro || !textureQuadro || !data) return
  const ctx = canvasQuadro.getContext('2d')
  const w = canvasQuadro.width
  const h = canvasQuadro.height

  ctx.clearRect(0, 0, w, h)
  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'

  // Fondo cápsula con marco dorado
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(20, 20, w - 40, h - 40, 48)
  ctx.fillStyle = 'rgba(6, 12, 30, 0.96)'
  ctx.fill()
  ctx.lineWidth = 8
  ctx.strokeStyle = '#f5c842'
  ctx.stroke()
  ctx.restore()

  if (mode === 'ficha') {
    // 1. VISTA FICHA: Compacta en contenido (solo nombre, estado de audio y controles)
    ctx.textAlign = 'center'
    ctx.textBaseline = 'alphabetic'

    // Nombre de la constelación
    ctx.fillStyle = '#ffffff'
    let nameFontSize = 124
    ctx.font = `bold ${nameFontSize}px "Orbitron", "Space Grotesk", sans-serif`
    while (ctx.measureText(data.nombre).width > w - 180 && nameFontSize > 60) {
      nameFontSize -= 4
      ctx.font = `bold ${nameFontSize}px "Orbitron", "Space Grotesk", sans-serif`
    }
    ctx.fillText(data.nombre, w / 2, 185)

    // Estado de la narración (limpio, sin texto amarillo ni onda)
    ctx.fillStyle = '#cbd5e1'
    ctx.font = 'bold 52px "Space Grotesk", sans-serif'
    const estadoAudioTxt = isAudioPlaying.value
      ? 'Reproduciendo narración'
      : 'Narración en pausa'
    ctx.fillText(estadoAudioTxt, w / 2, 275)

    // Línea divisoria sutil
    ctx.strokeStyle = 'rgba(245, 200, 66, 0.38)'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(120, 325)
    ctx.lineTo(w - 120, 325)
    ctx.stroke()

    // Caja contenedora para los botones interactivos de audio (⏸/▶ y ↺)
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(140, 370, w - 280, 490, 36)
    ctx.fillStyle = 'rgba(10, 18, 42, 0.60)'
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = 'rgba(125, 179, 232, 0.40)'
    ctx.stroke()
    ctx.restore()
  } else if (mode === 'estanteria') {
    // 2. VISTA ESTANTERÍA: Muestra los 3 libros como portadas sobre una repisa de madera
    ctx.textAlign = 'left'
    ctx.fillStyle = '#f5c842'
    ctx.font = 'bold 42px "Space Grotesk", sans-serif'
    ctx.fillText('LA BIBLIOTECA DE LAS ESTRELLAS · SOLÓN ARGÜELLO', 80, 95)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 84px "Orbitron", "Space Grotesk", sans-serif'
    ctx.fillText(`Estantería de Libros: ${data.nombre}`, 80, 180)

    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 44px "Space Grotesk", sans-serif'
    ctx.fillText('Enfoca o toca directamente cualquiera de los libros para ver su información', 80, 240)

    // Línea divisoria dorada
    ctx.strokeStyle = 'rgba(245, 200, 66, 0.4)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(80, 265)
    ctx.lineTo(w - 80, 265)
    ctx.stroke()

    // Repisa de madera en la parte inferior
    ctx.fillStyle = '#aa8559'
    ctx.fillRect(80, 890, w - 160, 24)
    ctx.fillStyle = '#7a5a36'
    ctx.fillRect(80, 914, w - 160, 10)

    // 3 Libros colocados de pie sobre la repisa
    const libros = data.libros || []
    const bookWidth = 360
    const bookHeight = 560
    const startX = 100
    const gap = 60

    libros.slice(0, 3).forEach((libro, i) => {
      const bx = startX + i * (bookWidth + gap)
      const by = 320

      // Si tiene fotografía de portada, dibujarla directamente en la cubierta
      const fotoSrc = libro.portada?.src || (libro.portada?.tipo === 'fotografia-ejemplar' ? `/portadas-biblioteca/${libro.id}.jpg` : (typeof libro.portada === 'string' && libro.portada.startsWith('/') ? libro.portada : null))
      if (fotoSrc) {
        let img = bookImageCache.get(fotoSrc)
        if (!img) {
          img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            textureQuadro.needsUpdate = true
            renderQuadroTexture(selectedData.value, vistaQuadro.value)
          }
          img.src = fotoSrc
          bookImageCache.set(fotoSrc, img)
        }
        if (img.complete && img.naturalWidth > 0) {
          ctx.save()
          ctx.beginPath()
          ctx.roundRect(bx, by, bookWidth, bookHeight, 18)
          ctx.clip()
          ctx.drawImage(img, bx, by, bookWidth, bookHeight)
          ctx.restore()

          // Borde dorado elegante
          ctx.beginPath()
          ctx.roundRect(bx, by, bookWidth, bookHeight, 18)
          ctx.lineWidth = 6
          ctx.strokeStyle = '#f5c842'
          ctx.stroke()

          // Distintivo inferior "✦ Toca o enfoca para leer ✦"
          ctx.save()
          ctx.beginPath()
          ctx.roundRect(bx + 20, by + bookHeight - 56, bookWidth - 40, 42, 21)
          ctx.fillStyle = 'rgba(10, 18, 42, 0.88)'
          ctx.fill()
          ctx.lineWidth = 2
          ctx.strokeStyle = '#f5c842'
          ctx.stroke()
          ctx.fillStyle = '#f5c842'
          ctx.font = 'bold 26px "Space Grotesk", sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText('✦ Toca o enfoca para leer ✦', bx + bookWidth / 2, by + bookHeight - 27)
          ctx.restore()
          return
        }
      }

      // Cuerpo del libro con sombra si la foto aún está cargando o es ilustrativo
      ctx.save()
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)'
      ctx.shadowBlur = 20
      ctx.shadowOffsetY = 10

      ctx.beginPath()
      ctx.roundRect(bx, by, bookWidth, bookHeight, 18)
      // Gradiente temático para cada libro
      const grad = ctx.createLinearGradient(bx, by, bx + bookWidth, by + bookHeight)
      if (i === 0) { grad.addColorStop(0, '#122b50'); grad.addColorStop(1, '#254d78'); }
      else if (i === 1) { grad.addColorStop(0, '#173f3c'); grad.addColorStop(1, '#347065'); }
      else { grad.addColorStop(0, '#4d263b'); grad.addColorStop(1, '#7e4456'); }

      ctx.fillStyle = grad
      ctx.fill()
      ctx.lineWidth = 6
      ctx.strokeStyle = '#e5cc9c'
      ctx.stroke()
      ctx.restore()

      // Contenido de la cubierta del libro (el libro es el botón interactivo)
      ctx.textAlign = 'center'
      ctx.fillStyle = '#f5c842'
      ctx.font = 'bold 26px "Space Grotesk", sans-serif'
      ctx.fillText('✦ COLECCIÓN SOLÓN ARGÜELLO ✦', bx + bookWidth / 2, by + 65)

      ctx.fillStyle = '#ffffff'
      ctx.font = '40px Georgia, serif'
      ctx.fillText('✦  ✧  ✦', bx + bookWidth / 2, by + 130)

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 42px Georgia, serif'
      // Ajuste de título
      const titleWords = libro.titulo.split(' ')
      let tLine = ''
      let ty = by + 230
      for (const tw of titleWords) {
        const test = tLine ? `${tLine} ${tw}` : tw
        if (ctx.measureText(test).width > bookWidth - 40 && tLine) {
          ctx.fillText(tLine, bx + bookWidth / 2, ty)
          tLine = tw
          ty += 50
        } else {
          tLine = test
        }
      }
      ctx.fillText(tLine, bx + bookWidth / 2, ty)

      ctx.fillStyle = '#cbd5e1'
      ctx.font = '32px "Space Grotesk", sans-serif'
      ctx.fillText(libro.autor, bx + bookWidth / 2, by + 440)
      ctx.font = '28px "Space Grotesk", sans-serif'
      ctx.fillText(`(${libro.anio || 'Edición histórica'})`, bx + bookWidth / 2, by + 480)

      // Indicador integrado en la base del libro
      ctx.save()
      ctx.beginPath()
      ctx.roundRect(bx + 24, by + 504, bookWidth - 48, 44, 22)
      ctx.fillStyle = 'rgba(245, 200, 66, 0.16)'
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = '#f5c842'
      ctx.stroke()
      ctx.restore()

      ctx.fillStyle = '#f5c842'
      ctx.font = 'bold 26px "Space Grotesk", sans-serif'
      ctx.fillText('✦ Toca o enfoca para leer ✦', bx + bookWidth / 2, by + 533)
    })
  } else if (mode === 'detalle' && libroDetalle.value) {
    // 3. VISTA DETALLE DEL LIBRO SELECCIONADO
    const libro = libroDetalle.value
    ctx.textAlign = 'left'
    ctx.textBaseline = 'alphabetic'

    ctx.fillStyle = '#f5c842'
    ctx.font = 'bold 44px "Space Grotesk", sans-serif'
    ctx.fillText('LA BIBLIOTECA DE LAS ESTRELLAS · FICHA DE LECTURA', 90, 95)

    ctx.fillStyle = '#ffffff'
    let tSize = 92
    ctx.font = `bold ${tSize}px "Orbitron", "Space Grotesk", sans-serif`
    while (ctx.measureText(`"${libro.titulo}"`).width > w - 220 && tSize > 54) {
      tSize -= 4
      ctx.font = `bold ${tSize}px "Orbitron", "Space Grotesk", sans-serif`
    }
    ctx.fillText(`"${libro.titulo}"`, 90, 185)

    ctx.fillStyle = '#cbd5e1'
    ctx.font = 'bold 54px "Space Grotesk", sans-serif'
    ctx.fillText(`${libro.autor} (${libro.anio || 'Edición histórica'})`, 90, 245)

    // Línea divisoria dorada
    ctx.strokeStyle = 'rgba(245, 200, 66, 0.45)'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(90, 275)
    ctx.lineTo(w - 90, 275)
    ctx.stroke()

    // Caja "¿Por qué leerlo?"
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(90, 315, w - 180, 350, 30)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = 'rgba(245, 200, 66, 0.6)'
    ctx.stroke()
    ctx.restore()

    ctx.fillStyle = '#f5c842'
    ctx.font = 'bold 50px "Space Grotesk", sans-serif'
    ctx.fillText('¿POR QUÉ LEERLO?', 130, 385)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 52px "Space Grotesk", sans-serif'
    const maxWidth = w - 260
    const words = (libro.motivo || 'Obra clásica de divulgación y observación astronómica.').split(' ')
    let line = ''
    let y = 460
    for (const wd of words) {
      const test = line ? `${line} ${wd}` : wd
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, 130, y)
        line = wd
        y += 66
      } else {
        line = test
      }
    }
    ctx.fillText(line, 130, y)

    // Caja de Identificación de Catálogo
    ctx.save()
    ctx.beginPath()
    ctx.roundRect(90, 690, w - 180, 235, 28)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
    ctx.fill()
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'
    ctx.stroke()
    ctx.restore()

    ctx.fillStyle = '#f5c842'
    ctx.font = 'bold 38px "Space Grotesk", sans-serif'
    const esReal = libro.demostracion === false || libro.portada?.tipo === 'fotografia-ejemplar'
    ctx.fillText(esReal ? 'EJEMPLAR FÍSICO · BIBLIOTECA PÚBLICA CENTRAL ESTATAL SOLÓN ARGÜELLO' : 'REFERENCIA DOCUMENTAL · BIBLIOTECA SOLÓN ARGÜELLO', 130, 745)

    ctx.fillStyle = '#cbd5e1'
    ctx.font = '42px "Space Grotesk", sans-serif'
    ctx.fillText(esReal ? 'Ejemplar físico perteneciente a la colección disponible en la biblioteca.' : 'Ejemplar disponible para lectura libre en Internet en Project Gutenberg / Archive.org.', 130, 805)

    ctx.fillStyle = '#94a3b8'
    ctx.font = '36px "Space Grotesk", sans-serif'
    const idTxt = libro.marc21?.campo001 ? `Identificador: ${libro.marc21.campo001}` : `Identificador del ejemplar: ${libro.id}`
    ctx.fillText(idTxt, 130, 865)
    ctx.fillText(idTxt, 130, 865)
  }

  ctx.textAlign = 'left'
  ctx.textBaseline = 'alphabetic'
  textureQuadro.needsUpdate = true
}

// Orientar un plano 3D para que mire siempre al observador en (0,0,0) con lectura correcta (sin invertir ni espejar)
function orientPlaneFacingOrigin(object, position) {
  object.position.copy(position)
  const dir = position.clone().normalize()
  const worldUp = new THREE.Vector3(0, 1, 0)
  let right = new THREE.Vector3().crossVectors(dir, worldUp).normalize()
  if (right.lengthSq() < 0.001) {
    right = new THREE.Vector3(1, 0, 0)
  }
  const up = new THREE.Vector3().crossVectors(right, dir).normalize()
  const normal = dir.clone().negate()

  const rotMatrix = new THREE.Matrix4()
  rotMatrix.makeBasis(right, up, normal)
  object.quaternion.setFromRotationMatrix(rotMatrix)
}

// Actualizar los botones 3D asociados al Quadro según la vista actual
function actualizarBotones3DQuadro() {
  if (!infoQuadroGroup) return

  if (vistaQuadro.value === 'ficha') {
    // 1. Vista Ficha: Tarjeta compacta en contenido y altura, con controles de audio y 2 botones debajo
    if (infoQuadroMesh) infoQuadroMesh.scale.set(0.78, 0.56, 1)
    bookQuadroMeshes.forEach((bm) => { bm.visible = false })
    // Controles de Audio DENTRO de la caja de sonido (Y = -4.5)
    if (quadroBtn1) {
      const txt = isAudioPlaying.value ? '⏸' : '▶'
      quadroBtn1.geometry = btnAudioGeo || quadroBtn1.geometry
      quadroBtn1.material.map = createButtonCanvasTexture(txt, true, false, true)
      quadroBtn1.userData.action = 'toggle-audio'
      quadroBtn1.position.set(-9.5, -4.5, 1.2)
      quadroBtn1.scale.set(0.92, 0.92, 1)
      quadroBtn1.visible = true
    }
    if (quadroBtn2) {
      quadroBtn2.geometry = btnAudioGeo || quadroBtn2.geometry
      quadroBtn2.material.map = createButtonCanvasTexture('↺', false, false, true)
      quadroBtn2.userData.action = 'repeat-audio'
      quadroBtn2.position.set(9.5, -4.5, 1.2)
      quadroBtn2.scale.set(0.92, 0.92, 1)
      quadroBtn2.visible = true
    }
    // Única Fila Inferior (Debajo del Quadro): Solo botón de libros centrado; cerrar (✕) en esquina superior derecha
    if (quadroBtn3) {
      quadroBtn3.geometry = btnQuadroGeo || quadroBtn3.geometry
      quadroBtn3.material.map = createButtonCanvasTexture('Ver libros recomendados', true, false)
      quadroBtn3.userData.action = 'open-shelf'
      quadroBtn3.position.set(0, -22.2, 0.6)
      quadroBtn3.scale.set(1, 1, 1)
      quadroBtn3.visible = true
    }
    if (quadroBtn4) {
      quadroBtn4.geometry = btnCloseGeo || quadroBtn4.geometry
      quadroBtn4.material.map = createButtonCanvasTexture('✕', false, true, false, true)
      quadroBtn4.userData.action = 'close-card'
      quadroBtn4.position.set(36.5, 11.5, 1.2)
      quadroBtn4.scale.set(1, 1, 1)
      quadroBtn4.renderOrder = 10
      quadroBtn4.material.depthTest = false
      quadroBtn4.visible = true
    }
  } else if (vistaQuadro.value === 'estanteria') {
    if (infoQuadroMesh) infoQuadroMesh.scale.set(1, 1, 1)
    // 2. Vista Estantería: Los libros mismos son los botones interactivos
    // Ocultar los botones inferiores de libro 1, 2 y 3
    if (quadroBtn1) quadroBtn1.visible = false
    if (quadroBtn2) quadroBtn2.visible = false
    if (quadroBtn3) quadroBtn3.visible = false

    // Activar las mallas interactivas directas sobre los libros de la repisa
    const librosDisp = selectedData.value?.libros || []
    bookQuadroMeshes.forEach((bm, idx) => {
      bm.visible = !!librosDisp[idx]
    })

    // Botón único centrado y proporcionado para volver a la constelación / ficha de audio
    if (quadroBtn4) {
      quadroBtn4.geometry = btnQuadroGeo || quadroBtn4.geometry
      quadroBtn4.material.map = createButtonCanvasTexture('Volver a la constelación', false, false)
      quadroBtn4.userData.action = 'back-constellation'
      quadroBtn4.position.set(0, -35, 0.6)
      quadroBtn4.scale.set(1, 1, 1)
      quadroBtn4.renderOrder = 5
      quadroBtn4.material.depthTest = true
      quadroBtn4.visible = true
    }
  } else if (vistaQuadro.value === 'detalle') {
    if (infoQuadroMesh) infoQuadroMesh.scale.set(1, 1, 1)
    // 3. Vista Detalle: Volver a la estantería, consultar en 2D y cerrar (✕) en esquina
    bookQuadroMeshes.forEach((bm) => { bm.visible = false })
    if (quadroBtn1) {
      quadroBtn1.geometry = btnQuadroGeo || quadroBtn1.geometry
      quadroBtn1.material.map = createButtonCanvasTexture('Volver a los libros', true, false)
      quadroBtn1.userData.action = 'back-shelf'
      quadroBtn1.position.set(-18, -35, 0.6)
      quadroBtn1.scale.set(1, 1, 1)
      quadroBtn1.visible = true
    }
    if (quadroBtn2) {
      quadroBtn2.geometry = btnCloseGeo || quadroBtn2.geometry
      quadroBtn2.material.map = createButtonCanvasTexture('✕', false, true, false, true)
      quadroBtn2.userData.action = 'close-card'
      quadroBtn2.position.set(47.5, 23.0, 1.2)
      quadroBtn2.scale.set(1, 1, 1)
      quadroBtn2.visible = true
    }
    if (quadroBtn3) {
      quadroBtn3.geometry = btnQuadroGeo || quadroBtn3.geometry
      quadroBtn3.material.map = createButtonCanvasTexture('Consultar en 2D', false, false)
      quadroBtn3.userData.action = 'consultar-libro-2d'
      quadroBtn3.position.set(18, -35, 0.6)
      quadroBtn3.scale.set(1, 1, 1)
      quadroBtn3.visible = true
    }
    if (quadroBtn4) quadroBtn4.visible = false
  }
}

// Inicializar la escena Three.js
function initThree() {
  if (!containerRef.value) return
  const width = window.innerWidth
  const height = window.innerHeight

  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0x050814, 0.0012)

  // Iluminación para relieves 3D institucionales y materiales de escena
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.4)
  scene.add(ambientLight)
  const dirLight = new THREE.DirectionalLight(0xfff5e6, 1.8)
  dirLight.position.set(0, 20, 20)
  scene.add(dirLight)

  // Cámaras
  cameraMono = new THREE.PerspectiveCamera(65, width / height, 0.1, 2000)
  cameraMono.position.set(0, 0, 0.1)
  cameraMono.lookAt(0, 5, 45)
  scene.add(cameraMono)

  // Retícula 3D in-scene para sesiones WebXR nativas (renderizada directamente en ambos ojos por la GPU)
  const reticleCanvas = document.createElement('canvas')
  reticleCanvas.width = 128
  reticleCanvas.height = 128
  reticleCanvasCtx = reticleCanvas.getContext('2d')
  reticle3DTexture = new THREE.CanvasTexture(reticleCanvas)

  const reticleGeo = new THREE.PlaneGeometry(0.075, 0.075)
  const reticleMat = new THREE.MeshBasicMaterial({
    map: reticle3DTexture,
    transparent: true,
    depthTest: false,
    depthWrite: false
  })
  reticle3DMesh = new THREE.Mesh(reticleGeo, reticleMat)
  reticle3DMesh.position.set(0, 0, -1.2)
  reticle3DMesh.renderOrder = 9999
  reticle3DMesh.visible = false
  cameraMono.add(reticle3DMesh)

  cameraLeft = new THREE.PerspectiveCamera(65, width / 2 / height, 0.1, 2000)
  cameraLeft.position.set(-0.35, 0, 0.1)
  cameraLeft.lookAt(0, 5, 45)

  cameraRight = new THREE.PerspectiveCamera(65, width / 2 / height, 0.1, 2000)
  cameraRight.position.set(0.35, 0, 0.1)
  cameraRight.lookAt(0, 5, 45)

  // WebGL Renderer de alto rendimiento con WebXR nativo para soporte de visor VR
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setSize(width, height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.autoClear = false
  renderer.xr.enabled = true
  containerRef.value.appendChild(renderer.domElement)

  // 1. Campo de estrellas de fondo (3,400 puntos estelares naturales)
  const starCount = 3400
  const starGeo = new THREE.BufferGeometry()
  const starPositions = new Float32Array(starCount * 3)
  const starColors = new Float32Array(starCount * 3)

  const colWhite = new THREE.Color(0xdce7f5)
  const colWarm = new THREE.Color(0xf6e5ba)
  const colBlue = new THREE.Color(0x9fc4f0)
  const colFaint = new THREE.Color(0x60728f)

  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = 450 + Math.random() * 250

    starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    starPositions[i * 3 + 2] = r * Math.cos(phi)

    const roll = Math.random()
    let c = colFaint
    if (roll > 0.86) c = colWarm
    else if (roll > 0.55) c = colWhite
    else if (roll > 0.3) c = colBlue

    const dim = 0.35 + Math.random() * 0.45
    starColors[i * 3] = c.r * dim
    starColors[i * 3 + 1] = c.g * dim
    starColors[i * 3 + 2] = c.b * dim
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

  const starMat = new THREE.PointsMaterial({
    size: 1.25,
    vertexColors: true,
    transparent: true,
    opacity: 0.82,
    fog: false
  })
  starsPoints = new THREE.Points(starGeo, starMat)
  scene.add(starsPoints)

  // 2. Construcción de Constelaciones con Figuras y Nombres 3D Prominentes, Nítidos y Luminosos
  const haloTex = createSoftHaloTexture()
  const sphereGeo = new THREE.SphereGeometry(1.35, 16, 16)

  CONSTELACIONES_CONFIG.forEach((cData) => {
    const group = new THREE.Group()
    group.userData = { ...cData, isConstellation: true }

    // Segmentos de líneas celestes destacadas y visibles
    const linePositions = []
    cData.trazos.forEach((pair) => {
      const p1 = cData.estrellas[pair[0]].pos
      const p2 = cData.estrellas[pair[1]].pos
      linePositions.push(p1[0], p1[1], p1[2], p2[0], p2[1], p2[2])
    })
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6ba3ff,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
      fog: false,
      linewidth: 3
    })
    const lineMesh = new THREE.LineSegments(lineGeo, lineMat)
    lineMesh.renderOrder = 100
    group.add(lineMesh)
    group.userData.lineMesh = lineMesh

    // Estrellas con Mesh + Sprite Halo nítidas, destacadas y con mayor presencia estelar
    const starMeshes = []
    cData.estrellas.forEach((s) => {
      const sMat = new THREE.MeshBasicMaterial({ color: s.color, depthWrite: false })
      const sMesh = new THREE.Mesh(sphereGeo, sMat)
      sMesh.position.set(s.pos[0], s.pos[1], s.pos[2])
      const starBase = s.size * 1.05
      sMesh.scale.setScalar(starBase)
      sMesh.userData = { parentConstellation: cData.id, starName: s.nombre, baseSize: starBase }
      sMesh.renderOrder = 5
      group.add(sMesh)
      starMeshes.push(sMesh)

      const spMat = new THREE.SpriteMaterial({
        map: haloTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        fog: false,
        opacity: 0.28
      })
      const sprite = new THREE.Sprite(spMat)
      sprite.scale.set(2.4, 2.4, 1)
      sMesh.add(sprite)
      sMesh.userData.sprite = sprite
    })

    // Hit Sphere amplia e invisible para selección al toque y mirada (con tolerancia ampliada a 75 unidades)
    const hitGeo = new THREE.SphereGeometry(75, 8, 8)
    const hitMat = new THREE.MeshBasicMaterial({ visible: false, transparent: true, opacity: 0 })
    const hitMesh = new THREE.Mesh(hitGeo, hitMat)
    const centerPos = new THREE.Vector3().copy(cData.direccion).multiplyScalar(210)
    hitMesh.position.copy(centerPos)
    hitMesh.userData = { isHitTarget: true, constellationId: cData.id }
    group.add(hitMesh)
    group.userData.hitMesh = hitMesh

    // Etiqueta flotante con el nombre de la constelación (Ampliada y elevada)
    const labelSprite = createLabelSprite(cData.nombre)
    labelSprite.scale.set(105, 26, 1)
    labelSprite.position.copy(centerPos)
    labelSprite.position.y += 38
    group.add(labelSprite)
    group.userData.labelSprite = labelSprite

    group.userData.starMeshes = starMeshes
    scene.add(group)
    constellationGroups.push(group)
  })

  // 3. Crear 3D Quadro de Información Emergente Proporcionado y Nítido (para Pantalla y VR)
  canvasQuadro = document.createElement('canvas')
  canvasQuadro.width = 1400
  canvasQuadro.height = 960
  textureQuadro = new THREE.CanvasTexture(canvasQuadro)

  infoQuadroGroup = new THREE.Group()
  infoQuadroGroup.visible = false

  const quadroGeo = new THREE.PlaneGeometry(108, 58.5)
  const quadroMat = new THREE.MeshBasicMaterial({
    map: textureQuadro,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  })
  infoQuadroMesh = new THREE.Mesh(quadroGeo, quadroMat)
  infoQuadroMesh.renderOrder = 1
  infoQuadroGroup.add(infoQuadroMesh)

  // Botones 3D interactivos:
  btnQuadroGeo = new THREE.PlaneGeometry(31, 8.8)
  btnAudioGeo = new THREE.PlaneGeometry(12.5, 12.5)
  btnCloseGeo = new THREE.PlaneGeometry(6.8, 6.8)

  quadroBtn1 = new THREE.Mesh(btnAudioGeo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide }))
  quadroBtn1.renderOrder = 10
  quadroBtn1.userData = { is3DButton: true, action: 'toggle-audio' }
  infoQuadroGroup.add(quadroBtn1)
  interactive3DButtons.push(quadroBtn1)

  quadroBtn2 = new THREE.Mesh(btnAudioGeo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide }))
  quadroBtn2.renderOrder = 10
  quadroBtn2.userData = { is3DButton: true, action: 'repeat-audio' }
  infoQuadroGroup.add(quadroBtn2)
  interactive3DButtons.push(quadroBtn2)

  quadroBtn3 = new THREE.Mesh(btnQuadroGeo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide }))
  quadroBtn3.renderOrder = 5
  quadroBtn3.userData = { is3DButton: true, action: 'open-shelf' }
  infoQuadroGroup.add(quadroBtn3)
  interactive3DButtons.push(quadroBtn3)

  quadroBtn4 = new THREE.Mesh(btnQuadroGeo, new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide }))
  quadroBtn4.renderOrder = 5
  quadroBtn4.userData = { is3DButton: true, action: 'close-card' }
  infoQuadroGroup.add(quadroBtn4)
  interactive3DButtons.push(quadroBtn4)

  // Mallas interactivas directas sobre los 3 libros en la estantería 3D
  const bookMeshGeo = new THREE.PlaneGeometry(28, 40)
  const bookXPositions = [-28, 0, 28]
  for (let i = 0; i < 3; i++) {
    const bMesh = new THREE.Mesh(
      bookMeshGeo,
      new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        colorWrite: false,
        side: THREE.DoubleSide
      })
    )
    bMesh.position.set(bookXPositions[i], -2.5, 0.6)
    bMesh.userData = { is3DButton: true, action: `book-${i}` }
    bMesh.visible = false
    infoQuadroGroup.add(bMesh)
    interactive3DButtons.push(bMesh)
    bookQuadroMeshes.push(bMesh)
  }

  actualizarBotones3DQuadro()
  scene.add(infoQuadroGroup)

  // 4. Crear Botones 3D de control global (Pausar mirada, Modo 2D/Homido y Salir)
  // Ubicados centrados directamente debajo de los emblemas institucionales en Z = +43 y Y = -10.5
  visorControls3DGroup = new THREE.Group()
  const posControls = new THREE.Vector3(0, -10.5, 43)
  orientPlaneFacingOrigin(visorControls3DGroup, posControls)

  const btnPedestalGeo = new THREE.PlaneGeometry(10.2, 3.0)

  // Botón 3D: Solo mirar / Reanudar (Izquierda)
  const pauseTex = createButtonCanvasTexture('Solo mirar', false, false, false, false, true)
  pause3DMesh = new THREE.Mesh(btnPedestalGeo, new THREE.MeshBasicMaterial({ map: pauseTex, transparent: true, depthWrite: false, side: THREE.DoubleSide }))
  pause3DMesh.position.set(isHomidoSplit.value ? -6.0 : -11.2, 0, 0)
  pause3DMesh.userData = { is3DButton: true, action: 'toggle-gaze' }
  visorControls3DGroup.add(pause3DMesh)
  interactive3DButtons.push(pause3DMesh)

  // Botón 3D: Entrar a Visor VR (Centro, oculto dentro de VR para no mostrar Salir a 2D)
  const isSplit = isHomidoSplit.value
  const homidoTex = createButtonCanvasTexture('Visor VR', false, false, false, false, true)
  homidoToggle3DMesh = new THREE.Mesh(btnPedestalGeo, new THREE.MeshBasicMaterial({ map: homidoTex, transparent: true, depthWrite: false, side: THREE.DoubleSide }))
  homidoToggle3DMesh.position.set(0, 0, 0)
  homidoToggle3DMesh.visible = !isSplit
  homidoToggle3DMesh.userData = { is3DButton: true, action: 'toggle-homido' }
  visorControls3DGroup.add(homidoToggle3DMesh)
  interactive3DButtons.push(homidoToggle3DMesh)

  // Botón 3D: Salir al menú principal (Derecha)
  const exitTex = createButtonCanvasTexture('Salir', false, false, false, false, true)
  exit3DMesh = new THREE.Mesh(btnPedestalGeo, new THREE.MeshBasicMaterial({ map: exitTex, transparent: true, depthWrite: false, side: THREE.DoubleSide }))
  exit3DMesh.position.set(isSplit ? 6.0 : 11.2, 0, 0)
  exit3DMesh.userData = { is3DButton: true, action: 'exit' }
  visorControls3DGroup.add(exit3DMesh)
  interactive3DButtons.push(exit3DMesh)

  scene.add(visorControls3DGroup)

  // 5. Crear Emblemas Institucionales en Relieve 3D auténtico detrás del observador
  initInstitutionalLogos3D()

  // Event Listeners para interacción y sensores
  const dom = renderer.domElement
  dom.addEventListener('pointerdown', onPointerDown)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp)
  window.addEventListener('resize', onWindowResize)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  document.addEventListener('webkitfullscreenchange', onFullscreenChange)

  // Activar sensores de movimiento si están disponibles
  activarSensoresGiroscopio()

  renderer.setAnimationLoop(animate)
}

function onFullscreenChange() {
  isFullscreen.value = Boolean(document.fullscreenElement || document.webkitFullscreenElement)
  onWindowResize()
}

// Activar sensores de movimiento (DeviceOrientation / Giroscopio) con soporte universal iOS/Android
// Se utiliza un único listener para evitar conflictos y oscilaciones de señal
async function activarSensoresGiroscopio() {
  if (typeof window.DeviceOrientationEvent !== 'undefined' && typeof window.DeviceOrientationEvent.requestPermission === 'function') {
    try {
      const response = await window.DeviceOrientationEvent.requestPermission()
      if (response === 'granted') {
        window.removeEventListener('deviceorientation', handleDeviceOrientation, true)
        window.addEventListener('deviceorientation', handleDeviceOrientation, true)
        hasSensorsActive.value = true
      }
    } catch (err) {
      console.warn('Permiso de sensores en espera de gesto:', err)
    }
  } else if ('DeviceOrientationEvent' in window) {
    window.removeEventListener('deviceorientation', handleDeviceOrientation, true)
    window.addEventListener('deviceorientation', handleDeviceOrientation, true)
    hasSensorsActive.value = true
  }
}

function handleDeviceOrientation(e) {
  if (e.alpha === null || e.beta === null || e.gamma === null) return
  hasDeviceOrientation = true
  hasSensorsActive.value = true

  const alpha = e.alpha * DEG2RAD
  const beta = e.beta * DEG2RAD
  const gamma = e.gamma * DEG2RAD
  const orient = (window.screen?.orientation?.angle ?? window.orientation ?? 0) * DEG2RAD

  setObjectQuaternion(targetQuat, alpha, beta, gamma, orient)

  if (!hasValidOrientation) {
    smoothedQuat.copy(targetQuat)
    if (cameraMono) cameraMono.quaternion.copy(targetQuat)
    if (cameraLeft) cameraLeft.quaternion.copy(targetQuat)
    if (cameraRight) cameraRight.quaternion.copy(targetQuat)
    hasValidOrientation = true
  }
}

// Emblemas Institucionales 3D auténticos detrás del observador (ITT y Solón Argüello) con acabado de marca de agua
async function initInstitutionalLogos3D() {
  const logosGroup = new THREE.Group()
  // Colocados detrás del observador en Z = +45, rotados 180° en Y para mirar directamente hacia la cámara
  logosGroup.position.set(0, 5, 45)
  logosGroup.rotation.set(0, Math.PI, 0)

  const textureLoader = new THREE.TextureLoader()

  // 1. Relieve 3D auténtico Instituto Tecnológico de Tepic (Izquierda)
  try {
    const resTepic = await fetch('/prueba-homido/logos/tepic.json')
    if (resTepic.ok) {
      const tepicData = await resTepic.json()
      textureLoader.load('/ITTepic_logo.jpg', (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace
        const relieveTepic = crearRelieve(THREE, tepicData, tex, { opacidad: 0.20, opacidadLateral: 0.10, marcaAgua: true })
        if (relieveTepic) {
          relieveTepic.scale.setScalar(13)
          relieveTepic.position.set(-11, 0, 0)
          relieveTepic.rotation.set(0, 0.25, 0)
          logosGroup.add(relieveTepic)
        }
      })
    }
  } catch (e) {
    console.warn('Fallback para logo ITT:', e)
  }

  // 2. Relieve 3D auténtico Biblioteca Pública Central Solón Argüello (Derecha)
  try {
    const resBib = await fetch('/prueba-homido/logos/biblioteca.json')
    if (resBib.ok) {
      const bibData = await resBib.json()
      const relieveBib = crearRelieve(THREE, bibData, null, { opacidad: 0.20, opacidadLateral: 0.10, marcaAgua: true })
      if (relieveBib) {
        relieveBib.scale.setScalar(24)
        relieveBib.position.set(11, 0, 0)
        relieveBib.rotation.set(0, -0.25, 0)
        logosGroup.add(relieveBib)
      }
    }
  } catch (e) {
    console.warn('Fallback para logo Biblioteca:', e)
  }

  // Luz puntual dedicada muy suave para realzar los relieves 3D traseros integrados al fondo cósmico
  const logoLight = new THREE.PointLight(0x8fa9cc, 0.35, 70, 1)
  logoLight.position.set(0, 6, 12)
  logosGroup.add(logoLight)

  scene.add(logosGroup)
}

// Control táctil / ratón
function onPointerDown(e) {
  if (!hasDeviceOrientation) {
    activarSensoresGiroscopio()
  }

  isDragging = true
  startX = e.clientX
  startY = e.clientY
  prevMouseX = e.clientX
  prevMouseY = e.clientY
}

function onPointerMove(e) {
  if (!isDragging) return
  const dx = e.clientX - prevMouseX
  const dy = e.clientY - prevMouseY
  prevMouseX = e.clientX
  prevMouseY = e.clientY

  targetLon -= dx * 0.16
  targetLat += dy * 0.16
  targetLat = Math.max(-85, Math.min(85, targetLat))
}

function onPointerUp(e) {
  if (!isDragging) return
  const dist = Math.hypot(e.clientX - startX, e.clientY - startY)
  isDragging = false
  if (e.target !== renderer.domElement) return

  if (dist < 8) {
    const rect = renderer.domElement.getBoundingClientRect()
    mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    const activeCam = isHomidoSplit.value
      ? mouseVec.x < 0 ? cameraLeft : cameraRight
      : cameraMono

    if (isHomidoSplit.value) {
      if (mouseVec.x < 0) mouseVec.x = (mouseVec.x + 0.5) * 2
      else mouseVec.x = (mouseVec.x - 0.5) * 2
    }

    raycaster.setFromCamera(mouseVec, activeCam)

    // Comprobar botones 3D activos primero
    const activeButtons = interactive3DButtons.filter((b) => {
      if (!b.visible) return false
      if (b.parent && !b.parent.visible) return false
      return true
    })
    const btnIntersects = raycaster.intersectObjects(activeButtons, false)
    if (btnIntersects.length > 0) {
      handle3DButtonAction(btnIntersects[0].object.userData.action)
      return
    }

    // Comprobar constelaciones
    const hitCandidates = []
    constellationGroups.forEach((g) => {
      hitCandidates.push(g.userData.hitMesh)
      g.userData.starMeshes.forEach((sm) => hitCandidates.push(sm))
    })

    const intersects = raycaster.intersectObjects(hitCandidates, false)
    if (intersects.length > 0) {
      const hitObj = intersects[0].object
      const cId = hitObj.userData.constellationId || hitObj.userData.parentConstellation
      if (cId) {
        if (selectedId.value === cId) {
          resetSelection()
        } else {
          seleccionarConstelacion(cId)
        }
        return
      }
    } else {
      if (selectedId.value) resetSelection()
    }
  }
}

function onWindowResize() {
  if (!renderer) return
  const width = window.innerWidth
  const height = window.innerHeight

  cameraMono.aspect = width / height
  cameraMono.updateProjectionMatrix()

  cameraLeft.aspect = width / 2 / height
  cameraLeft.updateProjectionMatrix()

  cameraRight.aspect = width / 2 / height
  cameraRight.updateProjectionMatrix()

  renderer.setSize(width, height)
}

// Bucle de renderizado continuo sincronizado con WebXR o display
function animate() {
  const delta = clock.getDelta()

  // Rotación cósmica pasiva
  if (starsPoints) {
    starsPoints.rotation.y += 0.00007
  }

  // 1. Orientación de cámara: giro por giroscopio del celular (con filtro anti-temblor) o arrastre táctil
  // En modo WebXR nativo, la orientación la calcula directamente el runtime de WebXR desde la pose del visor
  if (renderer.xr.isPresenting) {
    const xrCam = renderer.xr.getCamera()
    cameraMono.position.copy(xrCam.position)
    cameraMono.quaternion.copy(xrCam.quaternion)
    cameraMono.updateMatrixWorld(true)

    if (reticle3DMesh) {
      reticle3DMesh.visible = true
      dibujarReticle3D(dwellProgress.value, isDwellConfirmed.value, isGazePaused.value)
    }
  } else {
    if (reticle3DMesh) {
      reticle3DMesh.visible = false
    }

    if (hasDeviceOrientation && hasValidOrientation) {
    // Tomar siempre el arco más corto para evitar giros de 360 grados
    if (smoothedQuat.dot(targetQuat) < 0) {
      targetQuat.x = -targetQuat.x
      targetQuat.y = -targetQuat.y
      targetQuat.z = -targetQuat.z
      targetQuat.w = -targetQuat.w
    }

    const angleDiff = smoothedQuat.angleTo(targetQuat)

    // Filtro de banda muerta (Deadband):
    // Si la diferencia angular es menor a 0.0035 rad (~0.2°), es micro-ruido del sensor en reposo -> NO mover la cámara
    if (angleDiff > 0.0035) {
      // Slerp adaptativo: suave en reposo, ágil al girar la cabeza
      const slerpFactor = Math.min(0.28, Math.max(0.12, angleDiff * 1.2))
      smoothedQuat.slerp(targetQuat, slerpFactor)
    }

    cameraMono.quaternion.copy(smoothedQuat)
    cameraLeft.quaternion.copy(smoothedQuat)
    cameraRight.quaternion.copy(smoothedQuat)
  } else {
    // Si no hay sensores activos, se orienta con el arrastre del mouse/dedo
    lon = THREE.MathUtils.lerp(lon, targetLon, 0.08)
    lat = THREE.MathUtils.lerp(lat, targetLat, 0.08)

    const phi = THREE.MathUtils.degToRad(90 - lat)
    const theta = THREE.MathUtils.degToRad(lon)

    const targetDir = new THREE.Vector3()
    targetDir.x = 500 * Math.sin(phi) * Math.cos(theta)
    targetDir.y = 500 * Math.cos(phi)
    targetDir.z = 500 * Math.sin(phi) * Math.sin(theta)

    cameraMono.lookAt(targetDir)
    cameraLeft.lookAt(targetDir)
    cameraRight.lookAt(targetDir)
  }
}

  // 2. Chequeo de Mirada Gaze Dwell (3 segundos con confirmación)
  checkGazeDwell(delta)

  // 3. Efecto de Aislamiento, Resalte y Visibilidad de Nombres de Constelaciones
  constellationGroups.forEach((group) => {
    const isThisSelected = selectedId.value === group.userData.id
    const hasSelection = selectedId.value !== null

    // Nombres de constelación: se muestran al explorar y se ocultan todos si se selecciona una
    if (group.userData.labelSprite) {
      group.userData.labelSprite.visible = !hasSelection
    }

    let targetLineOpacity = 0.88
    let targetStarScale = 1.0
    let targetGlowOpacity = 0.28
    let targetColor = 0x6ba3ff

    if (hasSelection) {
      if (isThisSelected) {
        targetLineOpacity = 1.0
        targetStarScale = 1.25
        targetGlowOpacity = 0.45
        targetColor = 0xf5c842
      } else {
        targetLineOpacity = 0.25
        targetStarScale = 0.85
        targetGlowOpacity = 0.08
        targetColor = 0x223652
      }
    }

    const lineMesh = group.userData.lineMesh
    lineMesh.material.opacity = THREE.MathUtils.lerp(lineMesh.material.opacity, targetLineOpacity, 0.08)
    lineMesh.material.color.lerp(new THREE.Color(targetColor), 0.08)

    group.userData.starMeshes.forEach((sm) => {
      const bSize = sm.userData.baseSize
      const curScale = sm.scale.x / bSize
      const nScale = THREE.MathUtils.lerp(curScale, targetStarScale, 0.08)
      sm.scale.setScalar(bSize * nScale)

      if (sm.userData.sprite) {
        sm.userData.sprite.material.opacity = THREE.MathUtils.lerp(
          sm.userData.sprite.material.opacity,
          targetGlowOpacity,
          0.08
        )
      }
    })
  })

  // 4. Renderizado final
  renderer.clear()
  if (renderer.xr.isPresenting) {
    // Sesión WebXR activa: Three.js renderiza con la cámara estéreo y la distorsión de barril del visor
    renderer.render(scene, cameraMono)
  } else if (isHomidoSplit.value) {
    const w = window.innerWidth
    const h = window.innerHeight

    renderer.setViewport(0, 0, w / 2, h)
    renderer.setScissor(0, 0, w / 2, h)
    renderer.setScissorTest(true)
    renderer.render(scene, cameraLeft)

    renderer.setViewport(w / 2, 0, w / 2, h)
    renderer.setScissor(w / 2, 0, w / 2, h)
    renderer.setScissorTest(true)
    renderer.render(scene, cameraRight)

    renderer.setScissorTest(false)
  } else {
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight)
    renderer.render(scene, cameraMono)
  }
}

// Selección por mirada continua (Gaze Dwell)
function checkGazeDwell(delta) {
  if (renderer.xr.isPresenting) {
    const xrCam = renderer.xr.getCamera()
    const camOrigin = new THREE.Vector3()
    xrCam.getWorldPosition(camOrigin)
    const camDir = new THREE.Vector3(0, 0, -1)
    camDir.applyQuaternion(xrCam.quaternion).normalize()
    raycaster.set(camOrigin, camDir)
  } else {
    const activeCam = isHomidoSplit.value ? cameraLeft : cameraMono
    raycaster.setFromCamera(centerScreenVec, activeCam)
  }

  // 1. Comprobar Botones 3D en escena primero
  const activeButtons = interactive3DButtons.filter((b) => {
    if (!b.visible) return false
    if (b.parent && !b.parent.visible) return false
    return true
  })
  const btnIntersects = raycaster.intersectObjects(activeButtons, false)

  if (btnIntersects.length > 0) {
    const btnObj = btnIntersects[0].object
    const action = btnObj.userData.action

    if (isGazePaused.value && action !== 'toggle-gaze') {
      dwellProgress.value = 0
      return
    }

    handleDwellTarget({ type: 'button', action, mesh: btnObj })
    return
  }

  // 2. Si la mirada está pausada, no seleccionar constelaciones
  if (isGazePaused.value) {
    dwellProgress.value = 0
    dwellTarget = null
    return
  }

  // 3. Comprobar Constelaciones
  const hitCandidates = []
  constellationGroups.forEach((g) => {
    hitCandidates.push(g.userData.hitMesh)
    g.userData.starMeshes.forEach((sm) => hitCandidates.push(sm))
  })

  const intersects = raycaster.intersectObjects(hitCandidates, false)
  if (intersects.length > 0) {
    const hitObj = intersects[0].object
    const cId = hitObj.userData.constellationId || hitObj.userData.parentConstellation

    if (cId && cId !== selectedId.value) {
      handleDwellTarget({ type: 'constellation', id: cId, mesh: hitObj })
      return
    }
  }

  // Período de gracia generoso (750ms) con retención de progreso para evitar reinicios por micro-temblor
  if (dwellTarget && !dwellGraceTimer) {
    dwellPausedElapsed = performance.now() - dwellStartTime
    dwellGraceTimer = setTimeout(() => {
      dwellTarget = null
      dwellProgress.value = 0
      dwellPausedElapsed = 0
      dwellGraceTimer = null
    }, DWELL_GRACE_MS)
  }
}

function handleDwellTarget(target) {
  const isSameTarget =
    dwellTarget &&
    dwellTarget.type === target.type &&
    (target.type === 'constellation' ? dwellTarget.id === target.id : dwellTarget.action === target.action)

  if (dwellGraceTimer) {
    clearTimeout(dwellGraceTimer)
    dwellGraceTimer = null
    if (isSameTarget && dwellPausedElapsed > 0) {
      // Reanudar suavemente exactamente donde se quedó el progreso sin reiniciar a 0
      dwellStartTime = performance.now() - dwellPausedElapsed
      dwellPausedElapsed = 0
    }
  }

  if (!isSameTarget) {
    dwellTarget = target
    dwellStartTime = performance.now()
    dwellPausedElapsed = 0
  }

  const elapsed = performance.now() - dwellStartTime
  dwellProgress.value = Math.min(1, elapsed / DWELL_DURATION)

  if (dwellProgress.value >= 1 && !isDwellConfirmed.value) {
    isDwellConfirmed.value = true
    playChime()

    if (target.type === 'constellation') {
      seleccionarConstelacion(target.id)
    } else if (target.type === 'button') {
      handle3DButtonAction(target.action)
    }

    setTimeout(() => {
      isDwellConfirmed.value = false
      dwellProgress.value = 0
      dwellTarget = null
      dwellPausedElapsed = 0
    }, 800)
  }
}

function handle3DButtonAction(action) {
  if (action === 'toggle-gaze') {
    toggleGazePause()
  } else if (action === 'toggle-homido') {
    toggleHomido()
  } else if (action === 'exit') {
    salir()
  } else if (action === 'close-card') {
    resetSelection()
  } else if (action === 'toggle-audio') {
    toggleAudio()
    renderQuadroTexture(selectedData.value, vistaQuadro.value)
    actualizarBotones3DQuadro()
  } else if (action === 'repeat-audio') {
    repetirAudio()
    renderQuadroTexture(selectedData.value, vistaQuadro.value)
    actualizarBotones3DQuadro()
  } else if (action === 'open-shelf') {
    vistaQuadro.value = 'estanteria'
    renderQuadroTexture(selectedData.value, 'estanteria')
    actualizarBotones3DQuadro()
  } else if (action === 'book-0') {
    if (selectedData.value?.libros?.[0]) {
      libroDetalle.value = selectedData.value.libros[0]
      vistaQuadro.value = 'detalle'
      renderQuadroTexture(selectedData.value, 'detalle')
      actualizarBotones3DQuadro()
    }
  } else if (action === 'book-1') {
    if (selectedData.value?.libros?.[1]) {
      libroDetalle.value = selectedData.value.libros[1]
      vistaQuadro.value = 'detalle'
      renderQuadroTexture(selectedData.value, 'detalle')
      actualizarBotones3DQuadro()
    }
  } else if (action === 'book-2') {
    if (selectedData.value?.libros?.[2]) {
      libroDetalle.value = selectedData.value.libros[2]
      vistaQuadro.value = 'detalle'
      renderQuadroTexture(selectedData.value, 'detalle')
      actualizarBotones3DQuadro()
    }
  } else if (action === 'back-shelf') {
    vistaQuadro.value = 'estanteria'
    renderQuadroTexture(selectedData.value, 'estanteria')
    actualizarBotones3DQuadro()
  } else if (action === 'back-constellation') {
    vistaQuadro.value = 'ficha'
    renderQuadroTexture(selectedData.value, 'ficha')
    actualizarBotones3DQuadro()
  } else if (action === 'consultar-libro-2d') {
    if (selectedId.value && libroDetalle.value?.id) {
      detenerAudio()
      router.push({
        name: 'libro',
        params: { id: selectedId.value, libroId: libroDetalle.value.id },
        query: { origen: 'visor' }
      })
    }
  }
}

// Seleccionar constelación y abrir HUD / 3D Quadro con datos reales
function seleccionarConstelacion(id) {
  selectedId.value = id
  const cfg = CONSTELACIONES_CONFIG.find((c) => c.id === id)
  if (!cfg) return

  const dynamicRecorrido = catalogoRecorridos.value.find((r) => r.id === id)

  // Priorizar libros con fotografía del ejemplar real de la biblioteca
  let librosLista = cfg.libros
  if (dynamicRecorrido?.libros && dynamicRecorrido.libros.length > 0) {
    const ordenados = [...dynamicRecorrido.libros].sort((a, b) => {
      const aFoto = a.portada?.tipo === 'fotografia-ejemplar' || a.demostracion === false
      const bFoto = b.portada?.tipo === 'fotografia-ejemplar' || b.demostracion === false
      return Number(bFoto) - Number(aFoto)
    })
    librosLista = ordenados.map((l) => ({
      ...l,
      id: l.libroId || l.id,
      titulo: l.titulo,
      autor: l.autor || 'Autor sin confirmar',
      anio: l.anio,
      motivo: l.motivo || l.aclaracion || 'Lectura recomendada de astronomía y mitología.',
      portada: l.portada || { tipo: 'fotografia-ejemplar', src: `/portadas-biblioteca/${l.libroId || l.id}.jpg` },
      portadaIlustrativa: l.portada?.src || `/portadas-biblioteca/${l.libroId || l.id}.jpg`,
      demostracion: l.demostracion ?? false,
      marc21: l.marc21 || { campo001: l.libroId || l.id, campo003: 'SOLON-ARGÜELLO', signatura: 'Acervo Biblioteca Estatal' }
    }))
  }

  selectedData.value = {
    id,
    nombre: dynamicRecorrido?.titulo || cfg.nombre,
    subtitulo: cfg.subtitulo,
    temporada: cfg.temporada,
    historia: dynamicRecorrido?.historia || cfg.historia,
    resumen: dynamicRecorrido?.resumen || cfg.subtitulo,
    comoReconecerla: dynamicRecorrido?.comoReconecerla || cfg.comoReconecerla,
    libros: librosLista,
    multimedia: dynamicRecorrido?.multimedia || []
  }

  vistaPanel.value = 'ficha'
  vistaQuadro.value = 'ficha'
  libroDetalle.value = null

  // 1. Posicionar el 3D Quadro flotante: perfectamente centrado a la vista
  // y nivelado con el horizonte para una lectura recta y cómoda sin inclinación ni ladeo
  if (infoQuadroGroup) {
    renderQuadroTexture(selectedData.value, 'ficha')
    actualizarBotones3DQuadro()

    const dir = cfg.direccion.clone().normalize()
    const worldUp = new THREE.Vector3(0, 1, 0)
    let rightVec = new THREE.Vector3().crossVectors(dir, worldUp).normalize()
    if (rightVec.lengthSq() < 0.01) {
      rightVec = new THREE.Vector3(1, 0, 0)
    }

    // Centrado exactamente con el azimut de la constelación (sin desplazamiento lateral).
    // Escala legible (0.64) y descenso angular (~19.5°) para dejar toda la constelación libre y visible arriba.
    const pitchAngle = -0.34
    const cardDir = dir.clone().applyAxisAngle(rightVec, pitchAngle).normalize()
    const distance = 110
    const quadroPos = cardDir.multiplyScalar(distance)

    orientPlaneFacingOrigin(infoQuadroGroup, quadroPos)
    infoQuadroGroup.scale.setScalar(0.64)
    infoQuadroGroup.visible = true

    // Colocar los botones globales (Solo mirar, Visor VR y Salir) debajo del menú sin solaparse con estantería/detalle
    if (visorControls3DGroup) {
      const controlsPitch = pitchAngle - 0.31
      const controlsDir = dir.clone().applyAxisAngle(rightVec, controlsPitch).normalize()
      const controlsPos = controlsDir.multiplyScalar(distance)
      orientPlaneFacingOrigin(visorControls3DGroup, controlsPos)
      visorControls3DGroup.scale.setScalar(1.35)
    }

    // Si no está activo el giroscopio del dispositivo, orientar suavemente la cámara al centro de la experiencia
    if (!hasDeviceOrientation) {
      const viewDir = dir.clone().applyAxisAngle(rightVec, pitchAngle * 0.45).normalize()
      const destLat = Math.asin(Math.max(-1, Math.min(1, viewDir.y))) * (180 / Math.PI)
      let destLon = Math.atan2(viewDir.z, viewDir.x) * (180 / Math.PI)
      while (destLon - lon > 180) destLon -= 360
      while (destLon - lon < -180) destLon += 360
      targetLon = destLon
      targetLat = THREE.MathUtils.clamp(destLat, -85, 85)
    }
  }

  // 2. Iniciar audio narrativo real
  reproducirAudioNarracion(id, selectedData.value)
}

function resetSelection() {
  selectedId.value = null
  selectedData.value = null
  vistaPanel.value = 'ficha'
  vistaQuadro.value = 'ficha'
  libroDetalle.value = null
  bookQuadroMeshes.forEach((bm) => { bm.visible = false })
  detenerAudio()

  if (infoQuadroGroup) {
    infoQuadroGroup.visible = false
  }
  if (visorControls3DGroup) {
    const posControls = new THREE.Vector3(0, -10.5, 43)
    orientPlaneFacingOrigin(visorControls3DGroup, posControls)
    visorControls3DGroup.scale.setScalar(1)
  }
}

// Reproducción de audio con limpieza estricta (evita segundo audio al cerrar)
function reproducirAudioNarracion(id, data) {
  detenerAudio()
  audioLoading.value = true
  audioError.value = false

  const audioItem = data.multimedia?.find((m) => m.tipo === 'audio')
  const audioSrc = audioItem?.src || `/audio/${id}-kokoro-v1.wav`

  currentAudio = new Audio(audioSrc)
  currentAudio.preload = 'auto'

  currentAudio.oncanplaythrough = () => {
    if (selectedId.value !== id) return
    audioLoading.value = false
    currentAudio.play().then(() => {
      isAudioPlaying.value = true
      renderQuadroTexture(selectedData.value, vistaQuadro.value)
      actualizarBotones3DQuadro()
    }).catch(() => {
      isAudioPlaying.value = false
    })
  }

  currentAudio.onplay = () => {
    if (selectedId.value === id) {
      isAudioPlaying.value = true
      renderQuadroTexture(selectedData.value, vistaQuadro.value)
      actualizarBotones3DQuadro()
    }
  }
  currentAudio.onpause = () => {
    isAudioPlaying.value = false
    renderQuadroTexture(selectedData.value, vistaQuadro.value)
    actualizarBotones3DQuadro()
  }
  currentAudio.onended = () => {
    isAudioPlaying.value = false
    renderQuadroTexture(selectedData.value, vistaQuadro.value)
    actualizarBotones3DQuadro()
  }

  currentAudio.onerror = () => {
    if (selectedId.value !== id) return
    audioLoading.value = false
    audioError.value = true

    if ('speechSynthesis' in window && data.historia) {
      window.speechSynthesis.cancel()
      synthUtterance = new SpeechSynthesisUtterance(data.historia)
      synthUtterance.lang = 'es-MX'
      synthUtterance.rate = 0.92
      synthUtterance.onstart = () => {
        if (selectedId.value === id) {
          isAudioPlaying.value = true
          renderQuadroTexture(selectedData.value, vistaQuadro.value)
          actualizarBotones3DQuadro()
        }
      }
      synthUtterance.onend = () => {
        isAudioPlaying.value = false
        renderQuadroTexture(selectedData.value, vistaQuadro.value)
        actualizarBotones3DQuadro()
      }
      synthUtterance.onerror = () => {
        isAudioPlaying.value = false
        renderQuadroTexture(selectedData.value, vistaQuadro.value)
        actualizarBotones3DQuadro()
      }
      window.speechSynthesis.speak(synthUtterance)
    }
  }
}

function toggleAudio() {
  if (currentAudio) {
    if (isAudioPlaying.value) {
      currentAudio.pause()
    } else {
      currentAudio.play().catch(() => {})
    }
  } else if ('speechSynthesis' in window && synthUtterance) {
    if (window.speechSynthesis.speaking) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume()
        isAudioPlaying.value = true
      } else {
        window.speechSynthesis.pause()
        isAudioPlaying.value = false
      }
    }
  }
}

function repetirAudio() {
  if (currentAudio) {
    currentAudio.currentTime = 0
    currentAudio.play().then(() => {
      isAudioPlaying.value = true
      renderQuadroTexture(selectedData.value, vistaQuadro.value)
      actualizarBotones3DQuadro()
    }).catch(() => {})
  } else if ('speechSynthesis' in window && selectedData.value?.historia) {
    window.speechSynthesis.cancel()
    reproducirAudioNarracion(selectedId.value, selectedData.value)
  }
}

function detenerAudio() {
  if (currentAudio) {
    currentAudio.oncanplaythrough = null
    currentAudio.onplay = null
    currentAudio.onpause = null
    currentAudio.onended = null
    currentAudio.onerror = null
    currentAudio.pause()
    currentAudio.src = ''
    currentAudio = null
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  synthUtterance = null
  isAudioPlaying.value = false
  audioLoading.value = false
}

// Navegación entre constelaciones
function navegarConstelacion(offset) {
  const currentIndex = CONSTELACIONES_CONFIG.findIndex((c) => c.id === selectedId.value)
  if (currentIndex === -1) return
  let nextIndex = (currentIndex + offset + CONSTELACIONES_CONFIG.length) % CONSTELACIONES_CONFIG.length
  seleccionarConstelacion(CONSTELACIONES_CONFIG[nextIndex].id)
}

// Ver detalle de un libro en el HUD 2D
function abrirDetalleLibro(libro) {
  libroDetalle.value = libro
  vistaPanel.value = 'detalle'
}

// Sincronizar el botón del pedestal 3D según el visor VR o 360° activo
function actualizarPedestal3D() {
  const isSplit = isHomidoSplit.value
  if (homidoToggle3DMesh) {
    homidoToggle3DMesh.visible = !isSplit
    if (!isSplit) {
      homidoToggle3DMesh.material.map = createButtonCanvasTexture('Visor VR', false, false, false, false, true)
      homidoToggle3DMesh.material.needsUpdate = true
    }
  }
  if (pause3DMesh) {
    pause3DMesh.position.set(isSplit ? -6.0 : -11.2, 0, 0)
  }
  if (exit3DMesh) {
    exit3DMesh.position.set(isSplit ? 6.0 : 11.2, 0, 0)
  }
}

// Controles de visor y modo inmersivo Homido VR (con WebXR nativo para distorsión de barril óptica)
async function activarModoVRCompleto() {
  // 1. Permiso directo de sensores en el gesto del usuario (imprescindible en iOS / Safari)
  await activarSensoresGiroscopio()

  // 2. Desbloqueo auditivo inmediato
  playChime()

  // 3. Comprobar e iniciar sesión nativa de WebXR (Modo VR Real con distorsión de barril de lentes)
  if (navigator.xr && renderer && renderer.xr) {
    try {
      const isSupported = await navigator.xr.isSessionSupported('immersive-vr')
      if (isSupported) {
        if (!xrSession) {
          const sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor'] }
          const wrapperEl = document.querySelector('.visor-3d-wrapper')
          if (wrapperEl) {
            sessionInit.optionalFeatures.push('dom-overlay')
            sessionInit.domOverlay = { root: wrapperEl }
          }
          const session = await navigator.xr.requestSession('immersive-vr', sessionInit)
          xrSession = session
          isWebXRActive.value = true
          isHomidoSplit.value = true
          await renderer.xr.setSession(session)

          session.addEventListener('end', () => {
            xrSession = null
            isWebXRActive.value = false
            salirModoVR()
          })
          actualizarPedestal3D()
          onWindowResize()
          return
        }
      }
    } catch (err) {
      console.warn('WebXR no disponible o rechazado por usuario, activando fallback estereoscópico:', err)
    }
  }

  // 4. Fallback: Activar vista estereoscópica dividida Homido manual (para navegadores sin WebXR)
  isHomidoSplit.value = true
  if (route.query.modo !== 'homido') {
    router.replace({ query: { ...route.query, modo: 'homido' } })
  }
  actualizarPedestal3D()

  // 5. Pantalla completa nativa del dispositivo a nivel de documento completo
  const docEl = document.documentElement
  if (!document.fullscreenElement) {
    try {
      if (docEl.requestFullscreen) {
        await docEl.requestFullscreen()
      } else if (docEl.webkitRequestFullscreen) {
        await docEl.webkitRequestFullscreen()
      }
    } catch (_) {}
  }

  // 6. Bloqueo de orientación horizontal en el teléfono
  try {
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('landscape')
    }
  } catch (_) {}

  // 7. Wake Lock para evitar apagado de pantalla mientras se usa el visor Homido
  try {
    if (navigator.wakeLock && navigator.wakeLock.request) {
      await navigator.wakeLock.request('screen')
    }
  } catch (_) {}

  onWindowResize()
}

async function salirModoVR() {
  if (reticle3DMesh) {
    reticle3DMesh.visible = false
  }
  if (xrSession) {
    try {
      await xrSession.end()
    } catch (_) {}
    xrSession = null
  }
  isWebXRActive.value = false
  isHomidoSplit.value = false
  if (route.query.modo === 'homido') {
    const q = { ...route.query }
    delete q.modo
    router.replace({ query: q })
  }
  actualizarPedestal3D()
  if (screen.orientation && screen.orientation.unlock) {
    try { screen.orientation.unlock() } catch (_) {}
  }
  if (document.fullscreenElement) {
    try { document.exitFullscreen() } catch (_) {}
  }
  onWindowResize()
}

async function toggleHomido() {
  if (!isHomidoSplit.value) {
    await activarModoVRCompleto()
  } else {
    salirModoVR()
  }
}

function toggleGazePause() {
  isGazePaused.value = !isGazePaused.value
  dwellProgress.value = 0

  if (pause3DMesh) {
    const texto = isGazePaused.value ? 'Reanudar' : 'Solo mirar'
    pause3DMesh.material.map = createButtonCanvasTexture(texto, isGazePaused.value, false, false, false, true)
    pause3DMesh.material.needsUpdate = true
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {})
    isFullscreen.value = true
  } else {
    if (document.exitFullscreen) document.exitFullscreen()
    isFullscreen.value = false
  }
}

// Salir de la experiencia: regresa directamente al Menú Principal (InicioView)
function salir() {
  detenerAudio()
  router.push('/')
}

// Ciclo de vida de Vue
onMounted(async () => {
  document.title = 'AstroVisor · Experiencia 3D'
  try {
    const apiData = await cargarRecorridos()
    if (Array.isArray(apiData) && apiData.length > 0) {
      catalogoRecorridos.value = apiData
    } else {
      throw new Error('Sin datos en API')
    }
  } catch (err) {
    try {
      const resp = await fetch('/prueba-homido/data/recorridos-demo.json')
      if (resp.ok) {
        catalogoRecorridos.value = await resp.json()
      }
    } catch (e2) {
      console.warn('Usando catálogo local de reserva para 3D:', e2)
    }
  }
  await nextTick()
  initThree()
  actualizarPedestal3D()
  cargando.value = false
})

onBeforeUnmount(() => {
  if (renderer) {
    renderer.setAnimationLoop(null)
  }
  cancelAnimationFrame(animationFrameId)
  detenerAudio()

  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', onPointerUp)
  window.removeEventListener('resize', onWindowResize)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', onFullscreenChange)
  window.removeEventListener('deviceorientation', handleDeviceOrientation, true)
  salirModoVR()

  if (renderer && renderer.domElement) {
    renderer.domElement.removeEventListener('pointerdown', onPointerDown)
    renderer.dispose()
  }

  if (reticle3DMesh) {
    if (reticle3DMesh.geometry) reticle3DMesh.geometry.dispose()
    if (reticle3DMesh.material) reticle3DMesh.material.dispose()
  }
  if (reticle3DTexture) {
    reticle3DTexture.dispose()
  }
})
</script>

<template>
  <div class="visor-3d-wrapper">
    <!-- Aviso elegante de rotación de dispositivo para smartphone en modo vertical -->
    <aside
      id="orientacionAviso"
      class="orientacion-aviso"
      :class="{ 'descartado': avisoGiroDescartado }"
      role="status"
      aria-live="polite"
    >
      <div class="orientacion-card">
        <div class="orientacion-icon-wrapper" aria-hidden="true">
          <svg class="phone-rotate-svg" viewBox="0 0 48 48" fill="none">
            <rect class="phone-body" x="14" y="6" width="20" height="36" rx="4" stroke="#38bdf8" stroke-width="2.5" fill="rgba(56, 189, 248, 0.12)"/>
            <circle class="phone-home" cx="24" cy="36" r="1.5" fill="#38bdf8"/>
            <path class="phone-notch" d="M20 10h8" stroke="#38bdf8" stroke-width="2" stroke-linecap="round"/>
            <path class="phone-rotate-arrow" d="M37 14a15 15 0 0 1 3 13m-3-13l3 3m-3-3l-3 3" stroke="#f5b301" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="orientacion-texto">
          <strong class="orientacion-titulo">Gira tu dispositivo</strong>
          <p class="orientacion-desc">Coloca tu pantalla en horizontal para disfrutar la inmersión 360°</p>
        </div>
        <button
          type="button"
          class="orientacion-btn-descartar"
          id="btnDescartarGiro"
          aria-label="Continuar en vertical"
          @click="avisoGiroDescartado = true; sessionStorage.setItem('astrovisor_giro_ignorado', '1')"
        >
          &times;
        </button>
      </div>
    </aside>

    <!-- WebGL Canvas Container: 100% de la ventana -->
    <div ref="containerRef" class="webgl-canvas-container" :class="{ 'cursor-grab': !isDragging, 'cursor-grabbing': isDragging }"></div>

    <!-- Retícula Central Única (Modo 360° estándar en pantalla) -->
    <div
      v-if="!isHomidoSplit"
      class="vr-reticle"
      :class="{
        'is-active': dwellProgress > 0 && dwellProgress < 1,
        'is-confirmed': isDwellConfirmed || dwellProgress >= 1,
        'is-paused': isGazePaused,
      }"
      aria-hidden="true"
    >
      <svg class="reticle-svg" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="26" fill="none" stroke="#050814" stroke-width="4.5" opacity="0.6" />
        <circle cx="32" cy="32" r="23" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.4" />
        <circle
          v-if="!isGazePaused || (dwellTarget && dwellTarget.action === 'toggle-gaze')"
          class="reticle-progress"
          cx="32"
          cy="32"
          r="23"
          fill="none"
          :stroke="isDwellConfirmed ? '#4ade80' : '#f5c842'"
          stroke-width="3.5"
          stroke-linecap="round"
          stroke-dasharray="144.5"
          :stroke-dashoffset="144.5 * (1 - dwellProgress)"
          transform="rotate(-90 32 32)"
        />
        <circle cx="32" cy="32" r="3" :fill="isGazePaused ? '#94a3b8' : (isDwellConfirmed ? '#4ade80' : '#f5c842')" />
      </svg>
    </div>

    <!-- Controles y Retículas Duales para Modo Homido (Exactamente 1 mirilla por ojo: 25% y 75%) -->
    <template v-else>
      <!-- Retícula Ojo Izquierdo -->
      <div
        class="vr-reticle reticle-left"
        :class="{
          'is-active': dwellProgress > 0 && dwellProgress < 1,
          'is-confirmed': isDwellConfirmed || dwellProgress >= 1,
          'is-paused': isGazePaused,
        }"
        aria-hidden="true"
      >
        <svg class="reticle-svg" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="26" fill="none" stroke="#050814" stroke-width="4.5" opacity="0.6" />
          <circle cx="32" cy="32" r="23" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.4" />
          <circle
            v-if="!isGazePaused || (dwellTarget && dwellTarget.action === 'toggle-gaze')"
            class="reticle-progress"
            cx="32"
            cy="32"
            r="23"
            fill="none"
            :stroke="isDwellConfirmed ? '#4ade80' : '#f5c842'"
            stroke-width="3.5"
            stroke-linecap="round"
            stroke-dasharray="144.5"
            :stroke-dashoffset="144.5 * (1 - dwellProgress)"
            transform="rotate(-90 32 32)"
          />
          <circle cx="32" cy="32" r="3" :fill="isGazePaused ? '#94a3b8' : (isDwellConfirmed ? '#4ade80' : '#f5c842')" />
        </svg>
      </div>

      <!-- Retícula Ojo Derecho -->
      <div
        class="vr-reticle reticle-right"
        :class="{
          'is-active': dwellProgress > 0 && dwellProgress < 1,
          'is-confirmed': isDwellConfirmed || dwellProgress >= 1,
          'is-paused': isGazePaused,
        }"
        aria-hidden="true"
      >
        <svg class="reticle-svg" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="26" fill="none" stroke="#050814" stroke-width="4.5" opacity="0.6" />
          <circle cx="32" cy="32" r="23" fill="none" stroke="#ffffff" stroke-width="2" opacity="0.4" />
          <circle
            v-if="!isGazePaused || (dwellTarget && dwellTarget.action === 'toggle-gaze')"
            class="reticle-progress"
            cx="32"
            cy="32"
            r="23"
            fill="none"
            :stroke="isDwellConfirmed ? '#4ade80' : '#f5c842'"
            stroke-width="3.5"
            stroke-linecap="round"
            stroke-dasharray="144.5"
            :stroke-dashoffset="144.5 * (1 - dwellProgress)"
            transform="rotate(-90 32 32)"
          />
          <circle cx="32" cy="32" r="3" :fill="isGazePaused ? '#94a3b8' : (isDwellConfirmed ? '#4ade80' : '#f5c842')" />
        </svg>
      </div>

      <!-- Navegación estéreo para ambos ojos: Salir al Menú Principal -->
      <div class="homido-dual-nav left-eye-nav">
        <button
          type="button"
          class="homido-exit-pill exit-home"
          @click="salir"
          aria-label="Salir al menú principal"
        >
          Salir
        </button>
      </div>

      <div class="homido-dual-nav right-eye-nav">
        <button
          type="button"
          class="homido-exit-pill exit-home"
          @click="salir"
          aria-label="Salir al menú principal"
        >
          Salir
        </button>
      </div>

      <!-- Divisor central sutil entre ojos para visor móvil -->
      <div class="homido-divider" aria-hidden="true"></div>

      <!-- Botón inferior central: Activar pantalla completa, sensores y audio (ocultable al activarse) -->
      <button
        v-if="!isFullscreen || !hasSensorsActive"
        type="button"
        class="btn-activar-inmersion"
        @click="activarModoVRCompleto"
      >
        Activar pantalla completa, sensores y audio
      </button>
    </template>

    <!-- Barra Superior de Navegación (Solo en Modo 360° estándar; se oculta en Homido) -->
    <header v-if="!isHomidoSplit" class="hud-top-bar">
      <div class="brand-group">
        <button type="button" class="btn-back" @click="salir" aria-label="Salir" title="Salir">
          Salir
        </button>

        <div class="brand-title">
          <span class="live-dot" :class="{ 'paused': isGazePaused }"></span>
          <h1 class="brand-heading">AstroVisor</h1>
        </div>
      </div>

      <!-- Emblemas institucionales oficiales centrados en la cabecera -->
      <div class="hud-logos-strip" aria-label="Instituciones participantes">
        <img src="/Nayarit_CECAN_Convivencia_Horizontal_LetrasBlancas.png" alt="Gobierno del Estado de Nayarit y CECAN" class="hud-logo-img cecan" />
        <span class="hud-logo-sep" aria-hidden="true"></span>
        <img src="/institucional/biblioteca-solon-arguello.png" alt="Biblioteca Solón Argüello" class="hud-logo-img" />
        <span class="hud-logo-sep" aria-hidden="true"></span>
        <img src="/ITTepic_logo.jpg" alt="IT Tepic" class="hud-logo-img circular" />
      </div>

      <!-- Acciones de control superior -->
      <div class="top-controls">
        <button
          type="button"
          class="control-pill"
          :class="{ 'active': isGazePaused }"
          @click="toggleGazePause"
          :title="isGazePaused ? 'Volver a seleccionar constelaciones con la mirada' : 'Mirar el cielo sin abrir constelaciones'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pill-icon">
            <rect v-if="!isGazePaused" x="6" y="4" width="4" height="16" />
            <rect v-if="!isGazePaused" x="14" y="4" width="4" height="16" />
            <polygon v-else points="5 3 19 12 5 21 5 3" fill="currentColor" />
          </svg>
          <span>{{ isGazePaused ? 'Reanudar' : 'Solo mirar' }}</span>
        </button>

        <button
          type="button"
          class="control-pill"
          :class="{ 'active': isHomidoSplit }"
          @click="toggleHomido"
          title="Entrar a Visor VR"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="pill-icon">
            <rect x="2" y="6" width="20" height="12" rx="4" />
            <circle cx="8" cy="12" r="2.5" />
            <circle cx="16" cy="12" r="2.5" />
            <path d="M11 12h2" />
          </svg>
          <span>Visor VR</span>
        </button>

        <button
          type="button"
          class="control-pill icon-only"
          @click="toggleFullscreen"
          :title="isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path v-if="!isFullscreen" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            <path v-else d="M8 4v4H4m0 0l5-5m7 5h4V4m0 0l-5 5M8 20v-4H4m0 0l5 5m7-5h4v4m0 0l-5-5" />
          </svg>
        </button>
      </div>
    </header>

    <!-- Selector Rápido Inferior de Constelaciones (NO aparece en modo Homido) -->
    <nav v-if="!isHomidoSplit" class="hud-bottom-bar" aria-label="Constelaciones rápidas">
      <span class="bottom-label">Constelaciones:</span>
      <div class="selector-pills">
        <button
          v-for="c in CONSTELACIONES_CONFIG"
          :key="c.id"
          type="button"
          class="pill-choice"
          :class="{ 'selected': selectedId === c.id }"
          @click="seleccionarConstelacion(c.id)"
        >
          {{ c.nombre }}
        </button>
        <button
          v-if="selectedId"
          type="button"
          class="pill-choice reset"
          @click="resetSelection"
        >
          Restablecer
        </button>
      </div>
    </nav>
  </div>
</template>

<style scoped>
.visor-3d-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #050814;
  font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #ffffff;
  user-select: none;
  -webkit-user-select: none;
}

.webgl-canvas-container {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.cursor-grab {
  cursor: grab;
}

.cursor-grabbing {
  cursor: grabbing;
}

/* Retícula Central con Gaze Dwell (Nítida y siempre al frente) */
.vr-reticle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 52px;
  height: 52px;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 100;
  transition: transform 0.2s ease;
}

.vr-reticle.reticle-left {
  left: 25%;
}

.vr-reticle.reticle-right {
  left: 75%;
}

.reticle-svg {
  width: 100%;
  height: 100%;
}

.reticle-progress {
  transition: stroke-dashoffset 0.05s linear;
}

.vr-reticle.is-active {
  transform: translate(-50%, -50%) scale(1.18);
}

.vr-reticle.is-confirmed {
  transform: translate(-50%, -50%) scale(1.35);
  filter: drop-shadow(0 0 10px rgba(74, 222, 128, 0.9));
}

.vr-reticle.is-paused {
  opacity: 0.6;
}

/* Divisor central sutil para modo Homido Estéreo */
.homido-divider {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 100%;
  background: #000000;
  z-index: 40;
  pointer-events: none;
}

/* Navegación estéreo en Modo Homido VR (Visible independientemente en ambos ojos) */
.homido-dual-nav {
  position: absolute;
  top: 16px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  z-index: 100;
  pointer-events: auto;
}

.left-eye-nav {
  left: 16px;
}

.right-eye-nav {
  left: calc(50% + 16px);
}

.homido-exit-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 9px 18px;
  background: rgba(11, 21, 48, 0.76);
  border: 1.5px solid rgba(255, 255, 255, 0.22);
  border-radius: 9999px;
  color: #e2e8f0;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 650;
  cursor: pointer;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.38);
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.24s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.24s ease,
              background 0.24s ease,
              color 0.24s ease;
}

.homido-exit-pill:hover,
.homido-exit-pill:focus-visible {
  transform: translateY(-2px);
  background: rgba(16, 30, 66, 0.9);
  border-color: rgba(56, 189, 248, 0.65);
  color: #ffffff;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.5), 0 0 22px rgba(56, 189, 248, 0.3);
  outline: none;
}

.homido-exit-pill.exit-home {
  border-color: rgba(255, 255, 255, 0.22);
  color: #e2e8f0;
  background: rgba(11, 21, 48, 0.76);
}

.homido-exit-pill.exit-home:hover,
.homido-exit-pill.exit-home:focus-visible {
  transform: translateY(-2px);
  background: rgba(16, 30, 66, 0.9);
  border-color: rgba(56, 189, 248, 0.65);
  color: #ffffff;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.5), 0 0 22px rgba(56, 189, 248, 0.3);
}

/* Botón inferior central: Activar pantalla completa, sensores y audio (Fiel a Imagen 3) */
.btn-activar-inmersion {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  padding: 12px 30px;
  background: rgba(10, 20, 45, 0.92);
  border: 2px solid #f5c842;
  border-radius: 9999px;
  color: #ffffff;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.6), 0 0 16px rgba(245, 200, 66, 0.35);
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
}

.btn-activar-inmersion:hover {
  transform: translateX(-50%) scale(1.03);
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.75), 0 0 24px rgba(245, 200, 66, 0.55);
}

/* Sugerencia de activar sensores */
.sensors-hint-overlay {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(13, 18, 39, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  padding: 0.5rem 1.2rem;
  font-size: 0.75rem;
  color: #cbd5e1;
  z-index: 30;
  cursor: pointer;
  pointer-events: auto;
}

/* Barra superior HUD en modo 360° */
.hud-top-bar {
  position: absolute;
  top: 1.25rem;
  left: 1.5rem;
  right: 1.5rem;
  z-index: 30;
  display: flex;
  justify-content: space-between;
  align-items: center;
  pointer-events: none;
}

.brand-group {
  display: flex;
  align-items: center;
  gap: 1rem;
  pointer-events: auto;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 9px 18px;
  background: rgba(11, 21, 48, 0.76);
  border: 1.5px solid rgba(255, 255, 255, 0.22);
  border-radius: 9999px;
  color: #e2e8f0;
  font-size: 0.92rem;
  font-weight: 650;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.38);
  cursor: pointer;
  transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.24s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.24s ease,
              background 0.24s ease,
              color 0.24s ease;
}

.btn-back:hover,
.btn-back:focus-visible {
  transform: translateY(-2px);
  background: rgba(16, 30, 66, 0.9);
  border-color: rgba(56, 189, 248, 0.65);
  color: #ffffff;
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.5), 0 0 22px rgba(56, 189, 248, 0.3);
  outline: none;
}

.brand-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #38bdf8;
  box-shadow: 0 0 8px #38bdf8;
  animation: pulseDot 2s infinite ease-in-out;
}

.live-dot.paused {
  background-color: #94a3b8;
  box-shadow: none;
  animation: none;
}

@keyframes pulseDot {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.4); opacity: 0.5; }
}

.brand-heading {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: #ffffff;
}

.hud-logos-strip {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 1rem;
  background: rgba(13, 18, 39, 0.82);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 9999px;
  pointer-events: auto;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.hud-logo-img {
  height: 22px;
  width: auto;
  opacity: 0.92;
}

.hud-logo-img.cecan {
  height: 18px;
}

.hud-logo-img.circular {
  border-radius: 50%;
}

.hud-logo-sep {
  width: 1px;
  height: 14px;
  background: rgba(255, 255, 255, 0.22);
}

.top-controls {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  pointer-events: auto;
}

.control-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.9rem;
  background: rgba(13, 18, 39, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 9999px;
  color: #cbd5e1;
  font-size: 0.8rem;
  font-weight: 600;
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-pill .pill-icon {
  width: 1rem;
  height: 1rem;
  color: #f5c842;
}

.control-pill:hover {
  color: #ffffff;
  border-color: rgba(245, 200, 66, 0.6);
}

.control-pill.active {
  background: rgba(245, 200, 66, 0.2);
  border-color: #f5c842;
  color: #ffffff;
  box-shadow: 0 0 12px rgba(245, 200, 66, 0.3);
}

.control-pill.icon-only {
  padding: 0.55rem;
}

.control-pill.icon-only svg {
  width: 1.05rem;
  height: 1.05rem;
}

/* Ficha HUD Flotante: Elegante, limpia y sin pared de texto */
.constellation-hud-card {
  position: absolute;
  top: 5rem;
  right: 1.5rem;
  width: 92vw;
  max-width: 480px;
  max-height: calc(100vh - 8rem);
  overflow-y: auto;
  background: rgba(10, 16, 36, 0.94);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 2px solid rgba(245, 200, 66, 0.45);
  border-radius: 1.35rem;
  padding: 1.5rem;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.8), 0 0 40px rgba(245, 200, 66, 0.15);
  z-index: 35;
  pointer-events: auto;
}

.hud-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.2rem;
}

.hud-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(122, 21, 43, 0.55);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  border-radius: 9999px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #ffffff;
  margin-bottom: 0.45rem;
}

.hud-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.85rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
  line-height: 1.15;
}

.hud-subtitle {
  font-size: 1.05rem;
  color: #94a3b8;
  margin-top: 0.25rem;
  font-weight: 500;
}

.btn-close-hud {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 0.4rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-hud svg {
  width: 1.4rem;
  height: 1.4rem;
}

.btn-close-hud:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

/* Tarjeta de Controles de Audio */
.hud-audio-card {
  background: rgba(0, 0, 0, 0.45);
  border: 1.5px solid rgba(245, 200, 66, 0.35);
  border-radius: 1rem;
  padding: 1.25rem;
  margin-bottom: 1.2rem;
}

.audio-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.audio-status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.audio-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #94a3b8;
}

.audio-dot.playing {
  background-color: #4ade80;
  box-shadow: 0 0 10px #4ade80;
}

.audio-card-status {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
}

.audio-lead-text {
  font-size: 0.96rem;
  color: #cbd5e1;
  line-height: 1.45;
  margin-bottom: 1.1rem;
}

.audio-buttons-row {
  display: flex;
  gap: 0.8rem;
}

.btn-audio-main {
  flex: 1.2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: #f5c842;
  color: #050814;
  border: none;
  border-radius: 0.65rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(245, 200, 66, 0.35);
}

.btn-audio-main:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 200, 66, 0.5);
}

.btn-audio-main .btn-icon {
  width: 1.2rem;
  height: 1.2rem;
}

.btn-audio-secondary {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.75rem 0.9rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.65rem;
  color: #ffffff;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-audio-secondary:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: #ffffff;
}

.btn-audio-secondary .btn-icon {
  width: 1.1rem;
  height: 1.1rem;
}

.sound-waves {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  height: 16px;
}

.sound-waves .bar {
  width: 3.5px;
  height: 16px;
  background-color: #4ade80;
  border-radius: 2px;
  animation: soundWave 1.2s ease-in-out infinite alternate;
}

@keyframes soundWave {
  0% { height: 4px; }
  100% { height: 18px; }
}

/* Tarjeta de invitación a la estantería */
.hud-shelf-invite {
  padding: 1.2rem;
  background: rgba(245, 200, 66, 0.08);
  border: 1.5px solid rgba(245, 200, 66, 0.45);
  border-radius: 1rem;
  margin-bottom: 1.2rem;
}

.invite-badge {
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #bae6fd;
}

.invite-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0.35rem 0 0.25rem;
}

.invite-desc {
  font-size: 0.92rem;
  color: #cbd5e1;
  margin-bottom: 0.95rem;
  line-height: 1.4;
}

.btn-shelf-action {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 0.8rem 1rem;
  background: #1f4e8c;
  color: #ffffff;
  border: 1px solid rgba(245, 200, 66, 0.4);
  border-radius: 0.65rem;
  font-size: 0.98rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-shelf-action:hover {
  background: #2563eb;
  border-color: #f5c842;
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.4);
}

.btn-shelf-action .shelf-icon {
  width: 1.2rem;
  height: 1.2rem;
  color: #f5c842;
}

/* Estantería Virtual de Libros (Estilo repisa de madera tradicional) */
.bookshelf-shelf {
  background: #ede0ca;
  border: 3px solid #b9a487;
  border-radius: 16px;
  padding: 1.25rem 0.85rem 1.6rem;
  box-shadow: inset 0 -16px #dbc9a9, 0 8px 24px rgba(0, 0, 0, 0.6);
  margin-bottom: 1.2rem;
  color: #1a202c;
}

.bookshelf-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
  align-items: end;
}

.bookshelf-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: transform 0.25s ease, background 0.25s ease;
  padding: 0.5rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
}

.bookshelf-item:hover,
.bookshelf-item:focus-visible {
  transform: translateY(-8px);
  background: rgba(245, 200, 66, 0.06);
  outline: none;
}

.bookshelf-book-wrap {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
}

.bookshelf-book-cover {
  width: 100%;
  max-width: 105px;
  height: auto;
  border-radius: 4px;
  box-shadow: 4px 8px 16px rgba(11, 21, 48, 0.45);
  border: 1px solid rgba(0, 0, 0, 0.15);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.bookshelf-item:hover .bookshelf-book-cover,
.bookshelf-item:focus-visible .bookshelf-book-cover {
  transform: scale(1.04);
  box-shadow: 0 10px 24px rgba(245, 200, 66, 0.4);
}

.bookshelf-item-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.88rem;
  font-weight: 700;
  color: #1a202c;
  text-align: center;
  margin-top: 0.6rem;
  line-height: 1.25;
}

.bookshelf-item-author {
  font-size: 0.75rem;
  color: #4a5568;
  text-align: center;
  margin-top: 0.2rem;
}

.bookshelf-click-hint {
  margin-top: 0.5rem;
  font-size: 0.72rem;
  color: #1f4e8c;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  transition: color 0.2s ease;
}

.bookshelf-item:hover .bookshelf-click-hint,
.bookshelf-item:focus-visible .bookshelf-click-hint {
  color: #0b1530;
}

.bookshelf-wood-plank {
  height: 14px;
  background: #9c7b50;
  border-radius: 4px;
  margin-top: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.btn-back-constellation {
  width: 100%;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.65rem;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-back-constellation:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: #f5c842;
}

/* Vista Detalle de Libro */
.book-detail-wrapper {
  margin-bottom: 1.2rem;
}

.book-detail-card {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.book-detail-media {
  display: flex;
  justify-content: center;
}

.detail-large-cover {
  width: 135px;
  height: 195px;
  object-fit: cover;
  border-radius: 0.6rem;
  border: 2px solid rgba(245, 200, 66, 0.5);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.7);
}

.detail-section {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 0.75rem;
  padding: 0.9rem 1.1rem;
  margin-bottom: 0.85rem;
}

.detail-heading {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #bae6fd;
  letter-spacing: 0.03em;
  margin-bottom: 0.6rem;
}

.detail-text {
  font-size: 1.48rem;
  line-height: 1.65;
  color: #f1f5f9;
}

.catalog-disclaimer {
  font-size: 1.12rem;
  color: #94a3b8;
  margin-bottom: 0.8rem;
  line-height: 1.5;
}

.marc-row {
  display: flex;
  justify-content: space-between;
  font-size: 1.15rem;
  padding: 0.5rem 0;
  border-top: 1px dashed rgba(255, 255, 255, 0.15);
}

.marc-tag {
  color: #94a3b8;
  font-weight: 600;
}

.marc-val {
  color: #ffffff;
  font-family: monospace;
  font-weight: 700;
}

.btn-open-online {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1rem 1.4rem;
  background: #f5c842;
  color: #050814;
  border: none;
  border-radius: 0.75rem;
  font-size: 1.18rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 4px 16px rgba(245, 200, 66, 0.4);
}

.btn-open-online:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 22px rgba(245, 200, 66, 0.6);
}

.detail-footer-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn-detail-back {
  flex: 1;
  padding: 0.75rem;
  background: #1f4e8c;
  border: 1px solid rgba(245, 200, 66, 0.4);
  border-radius: 0.65rem;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-detail-back:hover {
  background: #2563eb;
}

.btn-detail-back.secondary {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.btn-detail-back.secondary:hover {
  background: rgba(255, 255, 255, 0.16);
}

/* Navegación al pie de la ficha */
.hud-nav-footer {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.btn-nav-step {
  flex: 1;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 0.65rem;
  color: #cbd5e1;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-nav-step:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.btn-nav-step.primary {
  background: rgba(122, 21, 43, 0.45);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
}

.btn-nav-step.primary:hover {
  background: #7a152b;
  color: #ffffff;
}

/* Transición animada para la ficha */
.hud-fade-enter-active,
.hud-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.hud-fade-enter-from,
.hud-fade-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.96);
}

/* Barra inferior flotante */
.hud-bottom-bar {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1.2rem;
  background: rgba(13, 18, 39, 0.88);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 9999px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  z-index: 30;
  max-width: 95vw;
  overflow-x: auto;
  pointer-events: auto;
}

.bottom-label {
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: #bae6fd;
  white-space: nowrap;
}

.selector-pills {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.pill-choice {
  padding: 0.45rem 0.95rem;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 9999px;
  color: #cbd5e1;
  font-size: 0.88rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.pill-choice:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.pill-choice.selected {
  background: #f5c842;
  color: #050814;
  font-weight: 700;
  box-shadow: 0 0 12px rgba(245, 200, 66, 0.5);
}

.pill-choice.reset {
  color: #94a3b8;
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.pill-choice.reset:hover {
  color: #ffffff;
  border-color: #ffffff;
}

@media (max-width: 768px) {
  .hud-logos-strip {
    display: flex;
    gap: 0.4rem;
    padding: 0.2rem 0.5rem;
  }
  .hud-logo-img {
    height: 16px;
  }
}

@media (max-width: 640px) {
  .hud-logos-strip {
    display: none;
  }
  .constellation-hud-card {
    top: auto;
    bottom: 5.5rem;
    right: 4%;
    left: 4%;
    width: 92%;
    max-height: 60vh;
  }
  .bottom-label {
    display: none;
  }
  .btn-back-text {
    display: none;
  }
}
</style>
