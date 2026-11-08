import test from 'node:test'
import assert from 'node:assert/strict'
import { crearEstado } from '../public/prueba-homido/js/visor-estado.js'
import { FIGURAS, CAJA, RADIO_AREA, DISTANCIA, ALTURA_OJOS, posicionEnEsfera, separacionAngular, radioAngularArea, describirFigura, proyectar, diametroDeMagnitud, colorDeIndice, frenteDeCamara } from '../public/prueba-homido/js/figuras.js'

test('flujo recorrido → ficha → recorrido → otra constelación', () => {
  const e = crearEstado()
  assert.equal(e.permitido('volver'), false)
  assert.equal(e.abrirFicha('orion'), true)
  assert.equal(e.abrirFicha('escorpio'), false, 'no se abre otra ficha encima')
  assert.equal(e.fichaId, 'orion')
  assert.equal(e.volver(), true)
  assert.equal(e.fichaId, null)
  assert.equal(e.abrirFicha('escorpio'), true)
  assert.equal(e.fichaId, 'escorpio')
})

test('acciones permitidas según el modo', () => {
  const e = crearEstado()
  assert.equal(e.permitido('constelacion'), true)
  assert.equal(e.permitido('audio'), false)
  e.abrirFicha('orion')
  assert.equal(e.permitido('constelacion'), false)
  assert.equal(e.permitido('volver'), true)
  assert.equal(e.permitido('audio'), true)
  for (const accion of ['libros', 'libro', 'volver-ficha', 'volver-libros', 'consultar-libro']) assert.equal(e.permitido(accion), true, accion)
  assert.equal(e.permitido('pausa'), true)
  assert.equal(e.permitido('salir'), true)
})

test('la pausa bloquea la mirada pero no Pausa, Salir ni el clic', () => {
  const e = crearEstado()
  assert.equal(e.alternarPausa(), true)
  assert.equal(e.permitido('constelacion', 'mirada'), false)
  assert.equal(e.permitido('constelacion', 'clic'), true)
  assert.equal(e.permitido('pausa', 'mirada'), true)
  assert.equal(e.permitido('salir', 'mirada'), true)
  e.abrirFicha('orion')
  e.alternarPausa()
  assert.equal(e.pausado, false)
  assert.equal(e.permitido('volver', 'mirada'), true)
})

test('hay figuras para las tres constelaciones y tienen formas distintas', () => {
  assert.deepEqual(Object.keys(FIGURAS).sort(), ['escorpio', 'orion', 'osa-mayor'])
  assert.deepEqual(Object.values(FIGURAS).map((f) => f.estrellas.length).sort((a, b) => a - b), [7, 8, 15])
})

test('catálogo: datos astronómicos completos y razonables, y trazos con índices válidos', () => {
  for (const f of Object.values(FIGURAS)) {
    for (const e of f.estrellas) {
      assert.ok(e.ra >= 0 && e.ra < 360 && e.dec >= -90 && e.dec <= 90, e.nombre)
      assert.ok(Number.isFinite(e.mag) && e.mag > -2 && e.mag < 6, e.nombre)
      assert.ok(Number.isFinite(e.bv) && e.bv > -0.6 && e.bv < 2.2, e.nombre)
    }
    for (const t of f.trazos) assert.ok(t.length >= 2 && t.every((i) => Number.isInteger(i) && i >= 0 && i < f.estrellas.length))
  }
})

test('catálogo: las estrellas conocidas tienen sus valores característicos (SIMBAD)', () => {
  const por = (id, n) => FIGURAS[id].estrellas.find((e) => e.nombre === n)
  assert.ok(por('orion', 'Rigel').mag < 0.2 && por('orion', 'Rigel').bv < 0.2) // la más brillante y azulada
  assert.ok(por('orion', 'Betelgeuse').bv > 1.5) // roja
  assert.ok(por('escorpio', 'Antares').bv > 1.5 && por('escorpio', 'Antares').mag < 1) // roja y brillante
  const orion = FIGURAS.orion.estrellas
  assert.equal(orion.reduce((m, e) => (e.mag < m.mag ? e : m)).nombre, 'Rigel')
  assert.equal(FIGURAS['osa-mayor'].estrellas.reduce((m, e) => (e.mag < m.mag ? e : m)).nombre, 'Alioth')
  assert.equal(FIGURAS['osa-mayor'].estrellas.length, 7) // el Carro
})

test('orientación como en un atlas (norte arriba, este a la izquierda)', () => {
  const pos = (id) => {
    const p = proyectar(FIGURAS[id].estrellas)
    return (n) => p[FIGURAS[id].estrellas.findIndex((e) => e.nombre === n)]
  }
  const o = pos('orion')
  assert.ok(o('Betelgeuse')[0] < o('Bellatrix')[0], 'Betelgeuse al este (izquierda) de Bellatrix')
  assert.ok(o('Betelgeuse')[1] > o('Rigel')[1], 'hombro por encima del pie')
  assert.ok(o('Mintaka')[1] > o('Alnitak')[1], 'Mintaka (norte) más alta que Alnitak en el cinturón')
  const u = pos('osa-mayor')
  assert.ok(u('Dubhe')[0] > u('Alkaid')[0], 'recipiente a la derecha, mango a la izquierda')
  assert.ok(u('Dubhe')[1] > u('Merak')[1])
  const s = pos('escorpio')
  assert.ok(s('Graffias')[0] > s('Antares')[0] && s('Antares')[0] > s('Shaula')[0], 'pinzas a la derecha, cola a la izquierda')
  assert.ok(s('Sargas')[1] < s('Antares')[1], 'la cola se curva hacia abajo (sur)')
})

test('las figuras caben dentro del área de mirada con la misma escala angular', () => {
  for (const f of Object.values(FIGURAS)) {
    const { estrellas, segmentos } = describirFigura(f)
    assert.equal(estrellas.length, f.estrellas.length)
    for (const e of estrellas) assert.ok(Math.hypot(e.x, e.y) + e.diametro / 2 < RADIO_AREA, e.nombre)
    assert.ok(segmentos.length >= f.estrellas.length - 1 && segmentos.every((s) => s.largo > 0))
  }
  const alto = (id) => { const ys = describirFigura(FIGURAS[id]).estrellas.map((e) => e.y); return Math.max(...ys) - Math.min(...ys) }
  assert.ok(alto('orion') < alto('escorpio') * 1.2 && alto('orion') > 0.5) // tamaños relativos coherentes, no todas iguales a la caja
  assert.ok(CAJA.alto > 0)
})

test('tamaño y color de las estrellas varían de forma natural con la magnitud y el color', () => {
  assert.ok(diametroDeMagnitud(0.13) > diametroDeMagnitud(1.8) && diametroDeMagnitud(1.8) > diametroDeMagnitud(3.6))
  assert.ok(diametroDeMagnitud(0.13) / diametroDeMagnitud(3.6) < 4, 'sin exageraciones')
  assert.ok(diametroDeMagnitud(9) > 0)
  assert.notEqual(colorDeIndice(1.85), colorDeIndice(-0.03))
  assert.ok(new Set(FIGURAS.escorpio.estrellas.map((e) => describirFigura(FIGURAS.escorpio).estrellas.find((x) => x.nombre === e.nombre).diametro)).size > 5, 'muchos tamaños distintos')
})

test('las constelaciones están repartidas en direcciones distintas y sus áreas de mirada no se traslapan', () => {
  const dirs = Object.values(FIGURAS).map((f) => f.direccion)
  assert.ok(dirs.every((d) => d && typeof d.az === 'number' && typeof d.el === 'number'))
  const minimo = 2 * radioAngularArea() + 10 // margen de 10° entre áreas
  for (let i = 0; i < dirs.length; i++) {
    for (let j = i + 1; j < dirs.length; j++) assert.ok(separacionAngular(dirs[i], dirs[j]) >= minimo, `${i}-${j}`)
  }
  assert.ok(new Set(dirs.map((d) => d.el)).size === dirs.length, 'distintas elevaciones, no una fila de menú')
})

test('al menos una constelación es visible en la vista inicial (campo de ±40° del frente)', () => {
  const visibles = Object.values(FIGURAS).filter((f) => Math.abs(f.direccion.az) < 40 && f.direccion.el < 40)
  assert.ok(visibles.length >= 1)
})

test('posicionEnEsfera: distancia constante, hacia el frente y encarando al observador', () => {
  const c = posicionEnEsfera(0, 0)
  assert.ok(Math.abs(c.x) < 1e-9 && Math.abs(c.z + DISTANCIA) < 1e-9 && c.y === ALTURA_OJOS)
  for (const [az, el] of [[-70, 25], [12, 34], [100, 16]]) {
    const p = posicionEnEsfera(az, el)
    assert.ok(Math.abs(Math.hypot(p.x, p.y - ALTURA_OJOS, p.z) - DISTANCIA) < 1e-9)
    assert.equal(p.rotY, -az)
    assert.equal(p.rotX, el)
  }
  assert.ok(posicionEnEsfera(40, 0).x > 0 && posicionEnEsfera(-40, 0).x < 0)
  assert.ok(posicionEnEsfera(0, 30).y > ALTURA_OJOS)
})

test('la ficha aparece frente a la dirección de la cámara', () => {
  const recto = frenteDeCamara(0, -1, 3)
  assert.ok(Math.abs(recto.x) < 1e-9 && Math.abs(recto.z + 3) < 1e-9 && Math.abs(recto.rotY) < 1e-9)
  const izq = frenteDeCamara(-1, 0, 3)
  assert.ok(Math.abs(izq.x + 3) < 1e-9 && Math.abs(izq.z) < 1e-9 && Math.abs(izq.rotY - 90) < 1e-9)
  // mirando a la constelación de la derecha (azimut +40°) la ficha queda sobre ese mismo punto del arco
  const a = posicionEnEsfera(40, 0, 3)
  const f = frenteDeCamara(a.x / 3, a.z / 3, 3)
  assert.ok(Math.abs(f.x - a.x) < 1e-9 && Math.abs(f.z - a.z) < 1e-9 && Math.abs(f.rotY - a.rotY) < 1e-9)
})
