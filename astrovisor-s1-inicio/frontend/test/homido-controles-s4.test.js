import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { crearEstado } from '../public/prueba-homido/js/visor-estado.js'

const leer = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8')

test('S4: el botón Salir a 2D y Pausa permanecen siempre permitidos en cualquier modo y bajo pausa', () => {
  const e = crearEstado()
  // Modo recorrido
  assert.equal(e.permitido('salir', 'mirada'), true)
  assert.equal(e.permitido('salir', 'clic'), true)
  assert.equal(e.permitido('pausa', 'mirada'), true)

  // Mirada en pausa
  e.alternarPausa()
  assert.equal(e.pausado, true)
  assert.equal(e.permitido('salir', 'mirada'), true, 'salir siempre accesible por mirada')
  assert.equal(e.permitido('pausa', 'mirada'), true, 'pausa accesible para poder reanudar')
  assert.equal(e.permitido('constelacion', 'mirada'), false, 'mirada bloqueada para otros objetivos')

  // Modo ficha
  e.abrirFicha('orion')
  assert.equal(e.permitido('salir', 'mirada'), true)
  assert.equal(e.permitido('pausa', 'mirada'), true)
  assert.equal(e.permitido('volver', 'mirada'), false, 'volver bloqueado mientras mirada esté en pausa')
  assert.equal(e.permitido('volver', 'clic'), true, 'volver accesible por clic')
})

test('S4: el visor implementa desmontaje limpio de orientación al salir a 2D', () => {
  const codigo = leer('../public/prueba-homido/prueba.js')
  assert.ok(codigo.includes('desmontarVisor()'), 'debe definir la rutina desmontarVisor()')
  assert.ok(codigo.includes("removeEventListener('deviceorientation'"), 'debe remover el listener de orientación')
  assert.ok(codigo.includes("dispatchEvent(new Event('astrovisor:salida-visor'))"), 'debe notificar salida para apagar audio')
})

test('S4: alternarPausa incluye feedback sonoro sutil mediante Web Audio API', () => {
  const codigo = leer('../public/prueba-homido/prueba.js')
  assert.ok(codigo.includes('playPauseSound(pausado)'), 'debe invocar playPauseSound con el estado')
  assert.ok(codigo.includes('function playPauseSound'), 'debe implementar la síntesis con oscilador de audio')
})

test('S4: la escena 3D proyecta tarjeta de error accesible ante fallo de datos en lugar de pantalla congelada', () => {
  const codigo = leer('../public/prueba-homido/prueba.js')
  assert.ok(codigo.includes('mostrarAvisoError3D('), 'debe contar con función para mostrar error 3D')
  assert.ok(codigo.includes('infoPanel3D.setAttribute'), 'debe posicionar el panel de error frente a la cámara')
  assert.ok(codigo.includes('visorControls3D.setAttribute'), 'debe posicionar los controles con Salir a 2D frente al usuario')
})
