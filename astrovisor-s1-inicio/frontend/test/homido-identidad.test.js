import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { proyectarRecorridos } from '../../backend/src/services/catalogo.js'
import { extraerLibros, ajustarTextoCubierta, calcularDetalleLibro } from '../public/prueba-homido/js/estanteria-3d.js'
import { rutaLibro2D } from '../public/prueba-homido/js/ruta-libro-2d.js'
import { cargarDatos } from '../public/prueba-homido/js/datos.js'
const c = JSON.parse(readFileSync(new URL('../../content/catalogo-inicial.json', import.meta.url)))
const legacy = JSON.parse(readFileSync(new URL('../public/prueba-homido/data/recorridos-demo.json', import.meta.url)))
const respuesta = d => ({ ok: true, json: async () => d })

test('ruta 2D usa ID real aunque título coincida con otro o cambie', () => {
  const l = { libroId: 'nuevo-libro', constelacionId: 'orion', titulo: 'Star Lore of All Ages' }
  assert.equal(rutaLibro2D(l), '/explorar/orion/libros/nuevo-libro')
  assert.equal(rutaLibro2D({ ...l, titulo: 'Otro título' }), rutaLibro2D(l))
  assert.equal(rutaLibro2D({ titulo: l.titulo, constelacionId: 'orion' }), '/explorar/orion/libros')
  assert.equal(rutaLibro2D({ ...l, libroId: '../x' }), '/explorar/orion/libros')
  assert.equal(rutaLibro2D({ ...l, constelacionId: '../x' }), '/explorar')
})
test('extrae por identidad, prioriza origen y ordena por ID con límite tres independiente del orden de entrada', () => {
  const datos = proyectarRecorridos(c)
  const nuevo = { libroId: 'aaa-nuevo', constelacionId: 'orion', titulo: 'Libro nuevo', autor: 'Equipo', demostracion: true, motivo: 'Nuevo' }
  datos[0].libros.push(nuevo, { ...nuevo })
  const libros = extraerLibros(datos, 'orion')
  assert.deepEqual(libros.map(l => l.libroId), ['aaa-nuevo','field-stars','half-hours'])
  assert.equal(new Set(libros.map(l => l.libroId)).size, 3)
  assert.ok(libros.every(l => l.constelacionId === 'orion'))
  assert.deepEqual(extraerLibros([...datos].reverse().map(r=>({ ...r, libros: [...r.libros].reverse() })), 'orion').map(l=>[l.libroId,l.constelacionId]), libros.map(l=>[l.libroId,l.constelacionId]))
})
test('API caída usa respaldo antiguo con IDs por firma bibliográfica y aviso de copia no actualizada', async () => {
  const antes = JSON.stringify(legacy)
  const r = await cargarDatos({ fetchFn: async url => { if (url.includes('/api/')) throw new Error('sin API'); return respuesta(legacy) } })
  assert.equal(r.fuente, 'local'); assert.match(r.aviso, /no.*actualizad/i)
  assert.equal(r.revision, null)
  assert.deepEqual(extraerLibros(r.datos).map(l=>l.libroId).sort(), ['field-stars','half-hours','star-lore'])
  assert.equal(JSON.stringify(legacy), antes)
  const desconocido = structuredClone(legacy); desconocido[0].libros[0].url = 'https://example.org/desconocido'
  const d = await cargarDatos({ fetchFn: async url => { if (url.includes('/api/')) throw new Error('sin API'); return respuesta(desconocido) } })
  assert.ok(!extraerLibros(d.datos).some(l=>l.constelacionId === 'orion'))
})
test('API con ID inválido no se identifica por título y cae al respaldo indicado', async () => {
  for (const cambiar of [d => { d[0].libros[0].libroId = '../x' }, d => { delete d[0].libros[0].libroId }, d => { d[0].libros.push({...d[0].libros[0]}) }]) {
    const datos = proyectarRecorridos(c); cambiar(datos)
    const r = await cargarDatos({ fetchFn: async url => respuesta(url.includes('/api/') ? datos : legacy) })
    assert.equal(r.fuente, 'local')
  }
})

test('firma heredada repetida en la misma constelación se considera ambigua y no inventa un enlace', async () => {
  const ambiguo = structuredClone(legacy)
  ambiguo[0].libros.push({ ...ambiguo[0].libros[0], titulo: 'Otra entrada sin identidad verificable' })
  const r = await cargarDatos({ fetchFn: async url => {
    if (url.includes('/api/')) return { ok: false, status: 503 }
    return respuesta(ambiguo)
  } })
  assert.equal(r.fuente, 'local')
  assert.ok(r.datos[0].libros.every(l => !Object.hasOwn(l, 'libroId')))
  assert.ok(!extraerLibros(r.datos).some(l => l.constelacionId === 'orion'))
  assert.equal(rutaLibro2D(r.datos[0].libros[0]), '/explorar/orion/libros')
  assert.equal(r.datos[0].libros.length, 2)
  assert.equal(ambiguo[0].libros.length, 2)
})

test('título nuevo válido muy ancho se ajusta sin recortar letras ni líneas del canvas', () => {
  const ctx = { font: '', measureText(t) { return { width: t.length * Number(/(\d+)px/.exec(this.font)[1]) * 1.1 } } }
  const fuentes = [49,44,39,34,29,24].map(n=>`bold ${n}px Georgia,serif`)
  const titulo = 'W'.repeat(12)
  const r = ajustarTextoCubierta(ctx, titulo, 398, 4, fuentes)
  assert.equal(r.lineas.join(''), titulo)
  ctx.font = r.font; assert.ok(r.lineas.every(l=>ctx.measureText(l).width <= 398))
  assert.notEqual(r.font, fuentes[0])
  const original = ajustarTextoCubierta(ctx, 'Star Lore', 398, 4, fuentes)
  assert.equal(original.font, fuentes[0])
})

test('detalle de título y autor largos deja libres los controles y conserva texto completo', () => {
  const ctx = { font: '', measureText(t) { return { width: t.length * Number(/(\d+)px/.exec(this.font)[1]) * .9 } } }
  const libro = { titulo: Array(4).fill('W'.repeat(12)).join(' '), autor: Array(3).fill('W'.repeat(17)).join(' ') }
  const layout = calcularDetalleLibro(ctx, libro)
  assert.equal(layout.desborda, false)
  const titulo = layout.items.find(i => i.k === 'texto' && i.lineas.join(' ') === libro.titulo)
  const autor = layout.items.find(i => i.k === 'texto' && i.lineas.join(' ') === libro.autor)
  assert.ok(titulo && autor)
})
