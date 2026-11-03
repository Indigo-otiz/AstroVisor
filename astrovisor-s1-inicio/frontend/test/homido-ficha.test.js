import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { calcularLayout, dibujarFicha, zonaAMundo, ajustarLineas, CANVAS, PLANO_ANCHO, PLANO_ALTO, AVISO_SIN_AUDIO, BIBLIO_PENDIENTE } from '../public/prueba-homido/js/ficha-canvas.js'

const demo = JSON.parse(readFileSync(new URL('../public/prueba-homido/data/recorridos-demo.json', import.meta.url), 'utf8'))

// Contexto 2D falso: mide ~0.5 em por carácter y registra lo que se dibuja
function ctxFalso() {
  const dibujado = []
  const ctx = {
    font: '',
    measureText(t) {
      const px = Number(/(\d+)px/.exec(this.font)?.[1] ?? 16)
      return { width: t.length * px * 0.5 }
    },
    clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, quadraticCurveTo() {}, closePath() {}, fill() {}, stroke() {},
    fillText(t) { dibujado.push(t) },
  }
  return { ctx, dibujado }
}

const dentro = (r) => r.x >= 0 && r.y >= 0 && r.x + r.w <= CANVAS.ancho && r.y + r.h <= CANVAS.alto
const solapan = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h

test('ajustarLineas respeta el ancho máximo', () => {
  const { ctx } = ctxFalso()
  ctx.font = '30px x'
  const lineas = ajustarLineas(ctx, 'uno dos tres cuatro cinco seis siete ocho nueve diez', 150)
  assert.ok(lineas.length > 1)
  assert.ok(lineas.every((l) => ctx.measureText(l).width <= 150 || !l.includes(' ')))
  assert.equal(lineas.join(' '), 'uno dos tres cuatro cinco seis siete ocho nueve diez')
})

test('cada constelación dibuja su propio título y resumen, y ninguno de otra', () => {
  for (const ficha of demo) {
    const { ctx, dibujado } = ctxFalso()
    dibujarFicha(ctx, calcularLayout(ctx, ficha))
    assert.ok(dibujado.includes(ficha.titulo))
    assert.ok(dibujado.join(' ').includes(ficha.resumen.split(' ').slice(0, 3).join(' ')))
    for (const otra of demo.filter((f) => f.id !== ficha.id)) assert.ok(!dibujado.includes(otra.titulo))
    assert.ok(dibujado.includes('Dato de muestra'))
  }
})

test('el layout cabe en el lienzo, sin desbordar ni superponer zonas', () => {
  for (const ficha of demo) {
    const { ctx } = ctxFalso()
    const l = calcularLayout(ctx, ficha, { aviso: AVISO_SIN_AUDIO })
    assert.equal(l.desborda, false, ficha.id)
    assert.ok(dentro(l.zonas.audio) && dentro(l.zonas.volver))
    assert.equal(solapan(l.zonas.audio, l.zonas.volver), false)
    for (const it of l.items) if (it.rect) assert.ok(dentro(it.rect), `${ficha.id}: caja fuera del lienzo`)
  }
})

test('un texto muy largo se resume para el visor (sin reducir la tipografía) y sigue cabiendo', () => {
  const { ctx } = ctxFalso()
  const larga = { ...demo[0], historia: 'Una oración de relleno bastante larga para la prueba. '.repeat(40) }
  const l = calcularLayout(ctx, larga)
  assert.equal(l.desborda, false)
  assert.ok(l.maxHistoria <= 360)
  assert.ok(larga.historia.length > 360, 'el texto completo no se altera')
  const fuentes = l.items.filter((i) => i.k === 'texto').map((i) => Number(/(\d+)px/.exec(i.font)[1]))
  assert.ok(Math.min(...fuentes) >= 24)
})

test('sin libros muestra estado pendiente honesto, sin atribuir libros a la biblioteca', () => {
  const { ctx, dibujado } = ctxFalso()
  dibujarFicha(ctx, calcularLayout(ctx, { ...demo[1], libros: [] }))
  const texto = dibujado.join(' ')
  assert.ok(texto.includes('Referencia bibliográfica'))
  assert.ok(texto.includes(BIBLIO_PENDIENTE.split(' ').slice(0, 4).join(' ')))
  assert.ok(!/biblioteca|mostrador|Libro de muestra/i.test(texto))
})

test('con libro verificado lo muestra desde los datos', () => {
  const { ctx, dibujado } = ctxFalso()
  dibujarFicha(ctx, calcularLayout(ctx, { ...demo[0], libros: [{ titulo: 'Atlas del cielo', autor: 'Autora X' }] }))
  const texto = dibujado.join(' ')
  assert.ok(texto.includes('Atlas del cielo') && texto.includes('Autora X'))
})

test('el aviso de audio aparece solo cuando se indica', () => {
  const a = ctxFalso()
  dibujarFicha(a.ctx, calcularLayout(a.ctx, demo[0]))
  assert.ok(!a.dibujado.join(' ').includes('narración aún no'))
  const b = ctxFalso()
  dibujarFicha(b.ctx, calcularLayout(b.ctx, demo[0], { aviso: AVISO_SIN_AUDIO }))
  assert.ok(b.dibujado.join(' ').includes('narración aún no'))
})

test('las zonas de mirada salen del mismo layout: el centro del botón dibujado coincide', () => {
  const { ctx } = ctxFalso()
  const l = calcularLayout(ctx, demo[2])
  for (const zona of Object.values(l.zonas)) {
    const boton = l.items.find((i) => i.k === 'boton' && i.rect === zona)
    assert.ok(boton, 'cada zona corresponde a un botón dibujado')
  }
  const m = zonaAMundo({ x: 0, y: 0, w: CANVAS.ancho, h: CANVAS.alto })
  assert.ok(Math.abs(m.x) < 1e-9 && Math.abs(m.y) < 1e-9)
  assert.ok(Math.abs(m.ancho - PLANO_ANCHO) < 1e-9 && Math.abs(m.alto - PLANO_ALTO) < 1e-9)
  const esq = zonaAMundo({ x: 0, y: 0, w: 100, h: 100 })
  assert.ok(esq.x < 0 && esq.y > 0, 'arriba-izquierda del lienzo = x negativa, y positiva')
})
