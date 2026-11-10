/* Definición VISUAL de las constelaciones (no forma parte del contrato JSON compartido).
   Las estrellas (posiciones y magnitudes reales) están en js/catalogo-estelar.js; aquí solo se decide la
   dirección en la que se ve cada una y su aspecto. Para agregar una constelación: datos en el catálogo,
   un objeto aquí y un registro con el mismo id en el JSON. */
import { CATALOGO } from './catalogo-estelar.js'

export const FIGURAS = {
  orion: { ...CATALOGO.orion, direccion: { az: -70, el: 25 } }, // grados: azimut (0 = frente, + a la derecha) y elevación
  'osa-mayor': { ...CATALOGO['osa-mayor'], direccion: { az: 12, el: 34 } },
  escorpio: { ...CATALOGO.escorpio, direccion: { az: 100, el: 21 } },
}

export const CAJA = { ancho: 1.8, alto: 1.1 } // tamaño local máximo de una figura
export const GRADOS_EN_CAJA = 24 // grados de cielo que ocupan 1.1 unidades locales: misma escala para las tres
export const RADIO_AREA = 1.0 // radio local del área de mirada
export const ESCALA = 5.2 // las figuras viven en una esfera lejana: escala local → metros
export const DISTANCIA = 18 // m: lejos, para que no haya paralaje molesto en la vista dividida
export const ALTURA_OJOS = 1.6 // m

/** Proyección tangencial (gnomónica) de ascensión recta/declinación a un plano; norte arriba, este a la izquierda,
    como en un atlas visto desde el hemisferio norte. Devuelve grados en [x, y] centrados en la caja envolvente. */
export function proyectar(estrellas) {
  const r = Math.PI / 180
  const ra0 = estrellas.reduce((a, s) => a + s.ra, 0) / estrellas.length
  const dec0 = estrellas.reduce((a, s) => a + s.dec, 0) / estrellas.length
  const pts = estrellas.map((s) => {
    const dra = (s.ra - ra0) * r
    const cosc = Math.sin(dec0 * r) * Math.sin(s.dec * r) + Math.cos(dec0 * r) * Math.cos(s.dec * r) * Math.cos(dra)
    const xi = (Math.cos(s.dec * r) * Math.sin(dra)) / cosc
    const eta = (Math.cos(dec0 * r) * Math.sin(s.dec * r) - Math.sin(dec0 * r) * Math.cos(s.dec * r) * Math.cos(dra)) / cosc
    return [(-xi) / r, eta / r] // este (ra creciente) a la izquierda
  })
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2
  const cy = (Math.min(...ys) + Math.max(...ys)) / 2
  return pts.map(([x, y]) => [x - cx, y - cy])
}

/** Diámetro local de la estrella según su magnitud: las brillantes se ven más grandes, sin exagerar. */
export function diametroDeMagnitud(mag) {
  return 0.07 + 0.055 * Math.min(Math.max(3.8 - mag, 0), 3.8)
}

/** Color aproximado por índice B−V: azuladas (calientes) → blancas → anaranjadas (frías). */
export function colorDeIndice(bv) {
  if (bv < -0.1) return '#BCD0FF'
  if (bv < 0.3) return '#E8EFFF'
  if (bv < 0.8) return '#FFF3DA'
  if (bv < 1.3) return '#FFD6A2'
  return '#FFB68A'
}

/** Datos puros para dibujar: estrellas (posición, tamaño y color) y segmentos finos en el plano local XY. */
export function describirFigura(figura) {
  const k = CAJA.alto / GRADOS_EN_CAJA // unidades locales por grado de cielo
  const pts = proyectar(figura.estrellas).map(([x, y]) => [x * k, y * k])
  const estrellas = figura.estrellas.map((s, i) => ({
    x: pts[i][0],
    y: pts[i][1],
    diametro: diametroDeMagnitud(s.mag),
    color: colorDeIndice(s.bv),
    mag: s.mag,
    nombre: s.nombre,
  }))
  const segmentos = []
  for (const trazo of figura.trazos) {
    for (let i = 0; i < trazo.length - 1; i++) {
      const [x1, y1] = pts[trazo[i]]
      const [x2, y2] = pts[trazo[i + 1]]
      const dx = x2 - x1
      const dy = y2 - y1
      segmentos.push({
        x: (x1 + x2) / 2,
        y: (y1 + y2) / 2,
        largo: Math.hypot(dx, dy),
        rotZ: (Math.atan2(dy, dx) * 180) / Math.PI - 90, // el cilindro apunta en Y
      })
    }
  }
  return { estrellas, segmentos }
}

/** Posición sobre la esfera celeste (az 0 = frente, + derecha; el + arriba) y giros para encarar al observador. */
export function posicionEnEsfera(azGrados, elGrados, distancia = DISTANCIA, alturaOjos = ALTURA_OJOS) {
  const az = (azGrados * Math.PI) / 180
  const el = (elGrados * Math.PI) / 180
  return {
    x: distancia * Math.sin(az) * Math.cos(el),
    y: alturaOjos + distancia * Math.sin(el),
    z: -distancia * Math.cos(az) * Math.cos(el),
    rotX: elGrados, // con el orden de rotación YXZ de A-Frame, la normal apunta al observador
    rotY: -azGrados,
  }
}

/** Ángulo (grados) entre dos direcciones {az, el}. */
export function separacionAngular(a, b) {
  const v = ({ az, el }) => {
    const [A, E] = [(az * Math.PI) / 180, (el * Math.PI) / 180]
    return [Math.sin(A) * Math.cos(E), Math.sin(E), -Math.cos(A) * Math.cos(E)]
  }
  const [p, q] = [v(a), v(b)]
  const dot = Math.min(1, Math.max(-1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2]))
  return (Math.acos(dot) * 180) / Math.PI
}

/** Radio angular (grados) del área de mirada de una constelación. */
export function radioAngularArea() {
  return (Math.atan((RADIO_AREA * ESCALA) / DISTANCIA) * 180) / Math.PI
}

/** Punto a `distancia` m frente a una cámara que mira hacia (dirX, dirZ) y giro Y para encararla. */
export function frenteDeCamara(dirX, dirZ, distancia) {
  const psi = Math.atan2(-dirX, -dirZ) // 0 = mirando hacia -Z
  return { x: -Math.sin(psi) * distancia, z: -Math.cos(psi) * distancia, rotY: (psi * 180) / Math.PI }
}
