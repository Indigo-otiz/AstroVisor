import { ALTURA_OJOS, posicionEnEsfera } from './figuras.js'

const DISTANCIA_PANEL = 3.4
const ESCALA_MAXIMA = 0.65
const MARGEN_CONTROLES = 0.12
const ANCHO_CONTROLES = 3.78
const ALTO_CONTROLES = 0.5

export const LIMITES_CONTROLES = { x: 0, y: 0, ancho: ANCHO_CONTROLES, alto: ALTO_CONTROLES }

/** El borde inferior queda fijo. La ficha crece desde ese punto hacia el rótulo. */
export function anclajePanel({ az, el }) {
  const elevacion = Math.max(0, el - 21) * Math.PI / 180
  const altura = ALTURA_OJOS - 0.5 + DISTANCIA_PANEL * Math.tan(elevacion)
  return posicionEnEsfera(az, 0, DISTANCIA_PANEL, altura)
}

export function escalaPanel(fov, aspecto) {
  const anchoVisible = 2 * DISTANCIA_PANEL * Math.tan(fov * Math.PI / 360) * aspecto
  return Math.min(ESCALA_MAXIMA, anchoVisible * 0.91 / ANCHO_CONTROLES)
}

export function alturasPanel(altura, escala, limites) {
  return {
    panel: altura - (limites.y - limites.alto / 2) * escala,
    controles: altura - (ALTO_CONTROLES / 2 + MARGEN_CONTROLES) * escala,
  }
}

/** Compara el rectángulo visible en coordenadas locales con la proyección del ojo. */
export function crearPruebaVisibilidad({ Box3, Frustum, Matrix4 }) {
  const caja = new Box3()
  const matriz = new Matrix4()
  const vista = new Matrix4()
  const frustum = new Frustum()
  return (camera, objeto, { x, y, ancho, alto, zMin = 0, zMax = 0.05 }) => {
    objeto.updateWorldMatrix(true, false)
    caja.min.set(x - ancho / 2, y - alto / 2, zMin)
    caja.max.set(x + ancho / 2, y + alto / 2, zMax)
    vista.copy(camera.matrixWorld).invert()
    matriz.copy(camera.projectionMatrix).multiply(vista).multiply(objeto.matrixWorld)
    return frustum.setFromProjectionMatrix(matriz).intersectsBox(caja)
  }
}

export function crearCierreFueraDeVista(gracia = 320) {
  let estuvoVisible = false
  let fueraDesde = null
  return {
    reiniciar() {
      estuvoVisible = false
      fueraDesde = null
    },
    debeCerrar(visible, tiempo) {
      if (visible) {
        estuvoVisible = true
        fueraDesde = null
        return false
      }
      if (!estuvoVisible) return false
      fueraDesde ??= tiempo
      return tiempo - fueraDesde >= gracia
    },
  }
}
