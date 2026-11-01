import test from 'node:test'
import assert from 'node:assert/strict'
import { leerParametros, aBusqueda, OPCIONES } from '../public/prueba-homido/js/diagnostico.js'

test('sin ?diag=1 el modo está desactivado aunque haya otros parámetros', () => {
  assert.equal(leerParametros('').activo, false)
  assert.equal(leerParametros('?off=estrellas&aa=0&dpr=1').activo, false)
  assert.equal(leerParametros('?diag=0').activo, false)
})

test('?diag=1 lee opciones apagadas, antialiasing y tope de DPR; ignora valores inválidos', () => {
  const c = leerParametros('?diag=1&off=parpadeo,resplandor,xx&aa=0&dpr=1.5')
  assert.equal(c.activo, true)
  assert.deepEqual([...c.apagado], ['parpadeo', 'resplandor'])
  assert.equal(c.aa, false)
  assert.equal(c.dpr, 1.5)
  const d = leerParametros('?diag=1&dpr=abc')
  assert.equal(d.aa, true)
  assert.equal(d.dpr, null)
  assert.equal(d.apagado.size, 0)
})

test('la configuración se reproduce: aBusqueda ∘ leerParametros es la identidad', () => {
  const c = leerParametros('?diag=1&off=' + Object.keys(OPCIONES).slice(0, 3).join(',') + '&aa=0&dpr=2')
  assert.deepEqual(leerParametros(aBusqueda(c)), c)
  assert.equal(aBusqueda(leerParametros('?diag=1')), '?diag=1')
})
