/* Construcción de entidades A-Frame a partir de datos. La lógica de selección vive en prueba.js. */
import { describirFigura, RADIO_AREA, ESCALA } from './figuras.js'

export const COLOR_PROGRESO = '#F5B301'
export const COLOR_CONFIRMADO = '#1E7B3A'

const COLOR_LINEA = '#9FB4D0' // gris azulado neutro: las líneas son una guía, no el protagonista
const OPACIDAD = { linea: 0.38, estrella: 0.9, rotulo: 0.65 } // reposo: discreto pero legible
const OPACIDAD_ACTIVA = { linea: 0.8, estrella: 1, rotulo: 1 } // al enfocar: brillo suave
const ESCALA_ACTIVA = 1.25 // las estrellas crecen un poco al enfocar

/** Textura compartida de estrella: núcleo brillante y borde suave (mismo aspecto que las estrellas del fondo). */
function texturaEstrella(doc) {
  const id = 'tex-estrella'
  if (doc.getElementById(id)) return `#${id}`
  const lienzo = doc.createElement('canvas')
  lienzo.id = id
  lienzo.width = lienzo.height = 64
  const ctx = lienzo.getContext('2d')
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.16, 'rgba(255,255,255,0.95)')
  g.addColorStop(0.34, 'rgba(255,255,255,0.4)')
  g.addColorStop(0.6, 'rgba(255,255,255,0.1)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 64, 64)
  doc.querySelector('a-assets').appendChild(lienzo)
  return `#${id}`
}

const PX_POR_METRO = 400
const FAMILIA = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif'

/** Etiqueta de texto como textura de canvas (más nítida y predecible que a-text; no necesita fuentes externas). */
let contadorEtiquetas = 0

export function vincularEtiqueta(el, texto, { ancho, alto, color = '#FFFFFF', fondo = null } = {}) {
  const canvas = document.createElement('canvas')
  canvas.id = `etiqueta-${++contadorEtiquetas}` // A-Frame cachea la textura por el texto de `src`: debe ser único
  document.querySelector('a-assets').appendChild(canvas)
  canvas.width = Math.round(ancho * PX_POR_METRO)
  canvas.height = Math.round(alto * PX_POR_METRO)
  const ctx = canvas.getContext('2d')
  function actualizar(nuevo) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (fondo) { ctx.fillStyle = fondo; ctx.fillRect(0, 0, canvas.width, canvas.height) }
    let px = Math.round(canvas.height * 0.62)
    ctx.font = `bold ${px}px ${FAMILIA}`
    const maxAncho = canvas.width * 0.94
    if (ctx.measureText(nuevo).width > maxAncho) {
      px = Math.floor(px * (maxAncho / ctx.measureText(nuevo).width))
      ctx.font = `bold ${px}px ${FAMILIA}`
    }
    ctx.fillStyle = color
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(nuevo, canvas.width / 2, canvas.height / 2)
    const mesh = el.getObject3D && el.getObject3D('mesh')
    if (mesh && mesh.material && mesh.material.map) mesh.material.map.needsUpdate = true
  }
  actualizar(texto)
  el.setAttribute('width', ancho)
  el.setAttribute('height', alto)
  el.setAttribute('material', { shader: 'flat', transparent: true, src: `#${canvas.id}` })
  return { actualizar }
}

function crear(doc, etiqueta, atributos = {}, padre = null) {
  const el = doc.createElement(etiqueta)
  for (const [clave, valor] of Object.entries(atributos)) el.setAttribute(clave, valor)
  if (padre) padre.appendChild(el)
  return el
}

/** Anillo de progreso oculto en reposo; sus radios se guardan para `actualizarAnillo`. */
export function crearAnillo(doc, padre, { id, rin, rout, x = 0, y = 0, z = 0.03 }) {
  return crear(doc, 'a-ring', {
    id,
    visible: 'false',
    position: `${x} ${y} ${z}`,
    'data-rin': rin,
    'data-rout': rout,
    geometry: `primitive: ring; radiusInner: ${rin}; radiusOuter: ${rout}; thetaStart: 90; thetaLength: 0.001`,
    material: `color: ${COLOR_PROGRESO}; shader: flat; side: double; opacity: 0.95`,
  }, padre)
}

/** progreso 0..1; 0 oculta el anillo. */
export function actualizarAnillo(anillo, progreso, color = COLOR_PROGRESO) {
  if (!anillo) return
  const rin = Number(anillo.getAttribute('data-rin'))
  const rout = Number(anillo.getAttribute('data-rout'))
  if (progreso <= 0) {
    anillo.setAttribute('visible', 'false')
    anillo.setAttribute('geometry', `primitive: ring; radiusInner: ${rin}; radiusOuter: ${rout}; thetaStart: 90; thetaLength: 0.001`)
    return
  }
  const p = Math.min(1, Math.max(0.002, progreso))
  anillo.setAttribute('visible', 'true')
  anillo.setAttribute('geometry', `primitive: ring; radiusInner: ${rin}; radiusOuter: ${rout}; thetaStart: 90; thetaLength: ${-(p * 360)}`)
  anillo.setAttribute('material', `color: ${color}; shader: flat; side: double; opacity: 0.95`)
}

/** Una constelación seleccionable: estrellas pequeñas, líneas sutiles, rótulo discreto y área de mirada invisible.
    Devuelve el elemento y `resaltar(activo)` (brillo suave al enfocar). Sin lógica por id. */
export function crearConstelacion(doc, { ficha, figura, pos }) {
  const { estrellas, segmentos } = describirFigura(figura)
  const grupo = crear(doc, 'a-entity', {
    class: 'constelacion',
    'data-id': ficha.id,
    position: `${pos.x} ${pos.y} ${pos.z}`,
    rotation: `${pos.rotX} ${pos.rotY} 0`,
    scale: `${ESCALA} ${ESCALA} ${ESCALA}`,
  })

  const lineas = segmentos.map((s) => crear(doc, 'a-entity', {
    position: `${s.x} ${s.y} 0`,
    rotation: `0 0 ${s.rotZ}`,
    geometry: `primitive: cylinder; radius: 0.007; height: ${s.largo}; segmentsRadial: 4`,
    material: `shader: flat; color: ${COLOR_LINEA}; opacity: ${OPACIDAD.linea}; transparent: true`,
  }, grupo))

  // Cada estrella es un sprite suave: tamaño según su magnitud real y color según su índice B−V
  const textura = texturaEstrella(doc)
  const puntos = estrellas.map((e) => crear(doc, 'a-plane', {
    position: `${e.x} ${e.y} 0.02`,
    width: e.diametro,
    height: e.diametro,
    material: `shader: flat; src: ${textura}; color: ${e.color}; transparent: true; blending: additive; depthWrite: false; opacity: ${OPACIDAD.estrella}`,
  }, grupo))

  const rotulo = crear(doc, 'a-plane', { position: '0 -0.82 0.02' }, grupo)
  vincularEtiqueta(rotulo, ficha.titulo, { ancho: 1.5, alto: 0.26 })
  rotulo.setAttribute('material', 'opacity', OPACIDAD.rotulo)
  rotulo.setAttribute('material', 'depthWrite', false) // el fondo transparente no debe tapar las estrellas de atrás

  const idAnillo = `ring-${ficha.id}`
  crear(doc, 'a-circle', {
    'data-action': 'constelacion',
    'data-id': ficha.id,
    'data-ring': idAnillo,
    radius: RADIO_AREA,
    position: '0 0 -0.04',
    material: 'shader: flat; opacity: 0.001; transparent: true; depthWrite: false', // invisible: no debe tapar el fondo
  }, grupo)
  // Aro fino: solo aparece mientras la mirada se mantiene (progreso)
  crearAnillo(doc, grupo, { id: idAnillo, rin: RADIO_AREA - 0.05, rout: RADIO_AREA })

  function resaltar(activo) {
    const o = activo ? OPACIDAD_ACTIVA : OPACIDAD
    lineas.forEach((l) => l.setAttribute('material', 'opacity', o.linea))
    puntos.forEach((p) => {
      p.setAttribute('material', 'opacity', o.estrella)
      const k = activo ? ESCALA_ACTIVA : 1
      p.setAttribute('scale', `${k} ${k} 1`)
    })
    rotulo.setAttribute('material', 'opacity', o.rotulo)
  }
  return { el: grupo, resaltar }
}
