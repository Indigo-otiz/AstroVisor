import test from 'node:test'
import assert from 'node:assert/strict'
import { generarPortada } from '../src/services/portadas.js'

const libro = { titulo: 'Historias del cielo', autor: 'Ana Pérez & Luis Ochoa', portada: { tipo: 'ilustrativa', plantilla: 'cielo', paleta: 'azul' } }
test('portada controlada: tres composiciones y paletas, proporción, texto y aviso ilustrativo', () => {
  const salidas = ['cielo', 'guia', 'relatos'].map((plantilla) => generarPortada({ ...libro, portada: { ...libro.portada, plantilla } }))
  assert.equal(new Set(salidas).size, 3)
  for (const svg of salidas) {
    assert.match(svg, /viewBox="0 0 450 640"/)
    assert.match(svg, /Ana Pérez &amp;/)
    assert.match(svg, /PORTADA ILUSTRATIVA/)
    assert.doesNotMatch(svg, /<script|<foreignObject|href=|<image|url\(https?:/i)
  }
})
test('escape de comillas y ampersand sin interpolación de atributos', () => {
  const svg = generarPortada({ ...libro, titulo: 'Cielo "azul" & estrellas', autor: "O'Connor" })
  assert.match(svg, /&quot;/); assert.match(svg, /&amp;/); assert.match(svg, /O&apos;Connor/)
})
test('markup, controles y caracteres no representables se rechazan', () => {
  for (const titulo of ['<script>alert(1)</script>', '<svg', 'A\u0000B', 'Cielo\nnocturno', '🌠', '\u01c4'.repeat(10), '\u0301']) {
    assert.throws(() => generarPortada({ ...libro, titulo }), { status: 400 })
  }
})
test('textos largos se ajustan o se rechazan sin recorte silencioso', () => {
  assert.match(generarPortada({ ...libro, titulo: 'Historias y estrellas del cielo nocturno' }), /Historias/)
  for (const datos of [{ titulo: 'W'.repeat(200) }, { autor: 'W'.repeat(200) }]) assert.throws(() => generarPortada({ ...libro, ...datos }), /cabe/)
})
test('lista cerrada de plantilla, paleta y parámetros sin rutas ni SVG arbitrario', () => {
  for (const cambio of [{ plantilla: '../../x' }, { paleta: '#fff' }, { plantilla: 'constructor' }, { plantilla: { toString: null } }, { paleta: [] }, { src: '/privado' }, { svg: '<svg/>' }, { tipo: 'original-autorizada' }]) {
    assert.throws(() => generarPortada({ ...libro, portada: { ...libro.portada, ...cambio } }), { status: 400 })
  }
})
