import assert from 'node:assert/strict'
import test from 'node:test'
import * as THREE from 'three'
import { FIGURAS } from '../public/prueba-homido/js/figuras.js'
import { PAISAJE } from '../public/prueba-homido/js/cielo.js'
import { LIMITES_ESTANTERIA } from '../public/prueba-homido/js/estanteria-3d.js'
import {
  anclajePanel, escalaPanel, alturasPanel, crearPruebaVisibilidad, crearCierreFueraDeVista, LIMITES_CONTROLES,
} from '../public/prueba-homido/js/panel-espacial.js'

test('la ficha y la estantería comparten la base fija y reservan espacio sobre el terreno', () => {
  const limitesFicha = { x: 0, y: -0.67, ancho: 2.74, alto: 1.29 }
  for (const { direccion } of Object.values(FIGURAS)) {
    const anclaje = anclajePanel(direccion)
    const escalaLibre = escalaPanel(80, 16 / 9)
    const escalaEstereo = escalaPanel(80, 0.43)
    assert.ok(escalaEstereo < escalaLibre)
    for (const escala of [escalaLibre, escalaEstereo]) {
      const ficha = alturasPanel(anclaje.y, escala, limitesFicha)
      const libros = alturasPanel(anclaje.y, escala, LIMITES_ESTANTERIA)
      assert.equal(ficha.controles, libros.controles)
      assert.ok(ficha.controles - LIMITES_CONTROLES.alto / 2 * escala > PAISAJE.relieve + 0.45)
      for (const [centro, limites] of [[ficha.panel, limitesFicha], [libros.panel, LIMITES_ESTANTERIA]]) {
        assert.ok(Math.abs(centro + (limites.y - limites.alto / 2) * escala - anclaje.y) < 1e-9)
      }
    }
  }
})

test('la visibilidad cuenta un borde en un solo ojo y excluye un panel detrás de la cámara', () => {
  const visible = crearPruebaVisibilidad(THREE)
  const izquierdo = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  const derecho = new THREE.PerspectiveCamera(40, 1, 0.1, 100)
  izquierdo.position.x = -0.032
  derecho.position.x = 0.032
  izquierdo.updateMatrixWorld()
  derecho.updateMatrixWorld()
  const panel = new THREE.Object3D()
  panel.position.set(1.44, 0, -3.4)
  const limites = { x: 0, y: 0, ancho: 0.4, alto: 1 }
  assert.equal(visible(izquierdo, panel, limites), false)
  assert.equal(visible(derecho, panel, limites), true)
  panel.position.x += 0.2
  assert.equal(visible(derecho, panel, limites), false)
  panel.position.set(0, 0, 3.4)
  assert.equal(visible(derecho, panel, limites), false)
})

test('el cierre exige haber visto el panel y permanecer fuera de vista sin interrupción', () => {
  const cierre = crearCierreFueraDeVista(320)
  assert.equal(cierre.debeCerrar(false, 0), false)
  assert.equal(cierre.debeCerrar(false, 400), false)
  assert.equal(cierre.debeCerrar(true, 410), false)
  assert.equal(cierre.debeCerrar(false, 420), false)
  assert.equal(cierre.debeCerrar(true, 730), false)
  assert.equal(cierre.debeCerrar(false, 740), false)
  assert.equal(cierre.debeCerrar(false, 1059), false)
  assert.equal(cierre.debeCerrar(false, 1060), true)
  cierre.reiniciar()
  assert.equal(cierre.debeCerrar(false, 1500), false)
})
