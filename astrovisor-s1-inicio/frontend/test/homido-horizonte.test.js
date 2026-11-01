import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { extincion, perfilCresta, CAPAS_CRESTA, COLOR_HORIZONTE, generarEstrellas } from '../public/prueba-homido/js/cielo.js'
import { FIGURAS, radioAngularArea } from '../public/prueba-homido/js/figuras.js'

const luminancia = (hex) => { const n = parseInt(hex.slice(1), 16); return (0.2126 * (n >> 16) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255 }
const barrido = (capa) => Array.from({ length: 720 }, (_, i) => perfilCresta((i / 720) * 2 * Math.PI, capa))

test('extinción: las estrellas bajas se ven más tenues, crece de forma monótona y satura en 1', () => {
  assert.ok(extincion(0) < 0.3)
  assert.ok(extincion(0.1) < extincion(0.2) && extincion(0.2) < extincion(0.28))
  assert.equal(extincion(0.28), 1)
  assert.equal(extincion(0.9), 1)
  assert.ok(extincion(-0.05) > 0)
})

test('las colinas son bajas, irregulares y continuas (cierran el círculo sin saltos)', () => {
  for (const capa of CAPAS_CRESTA) {
    const alturas = barrido(capa)
    assert.ok(Math.max(...alturas) <= capa.max + 1e-9 && Math.max(...alturas) <= 5)
    assert.ok(Math.min(...alturas) >= 0.25 - 1e-9)
    assert.ok(Math.max(...alturas) - Math.min(...alturas) > 1.5, 'relieve visible, no una línea plana')
    assert.ok(Math.abs(perfilCresta(0, capa) - perfilCresta(2 * Math.PI, capa)) < 1e-9)
    const saltoMax = Math.max(...alturas.map((a, i) => Math.abs(a - alturas[(i + 1) % alturas.length])))
    assert.ok(saltoMax < 0.2, 'sin escalones entre muestras vecinas')
  }
})

test('perspectiva atmosférica: más lejos = más alto en la lista de radios y más claro; la cercana es la más oscura', () => {
  const r = CAPAS_CRESTA.map((c) => c.r)
  assert.deepEqual([...r].sort((a, b) => a - b), r)
  const l = CAPAS_CRESTA.map((c) => luminancia(c.color))
  assert.ok(l.every((v, i) => i === 0 || l[i - 1] < v), 'cada capa más lejana es algo más clara')
  assert.ok(l.at(-1) < 0.2, 'siguen siendo siluetas oscuras, no compiten con las estrellas')
  for (const capa of CAPAS_CRESTA) {
    assert.ok(luminancia(COLOR_HORIZONTE) > 1.8 * luminancia(capa.color), 'cada colina se recorta contra el brillo del horizonte')
    assert.ok(luminancia(capa.cima) > luminancia(capa.color) && luminancia(capa.cima) < 0.85 * luminancia(COLOR_HORIZONTE), 'la cresta iluminada sigue más oscura que el cielo')
  }
})

test('las colinas no tapan las constelaciones: su punto más bajo queda por encima del borde de la cresta más alta', () => {
  const techo = Math.max(...CAPAS_CRESTA.map((c) => Math.max(...barrido(c))))
  for (const [id, f] of Object.entries(FIGURAS)) {
    const bajo = f.direccion.el - radioAngularArea()
    assert.ok(bajo > techo + 0.5, `${id}: área de mirada baja hasta ${bajo.toFixed(1)}° y las colinas llegan a ${techo.toFixed(1)}°`)
  }
})

test('cada constelación mantiene su dirección (el cielo de fondo no depende de ellas)', () => {
  assert.equal(FIGURAS.escorpio.direccion.el, 21)
  assert.equal(generarEstrellas(10, { semilla: 5 }).length, 10)
})

test('las colinas son perceptibles: la más cercana sube lo bastante para verse en un móvil (≥ 2° de pico) y hay picos de 3° o más', () => {
  const picos = CAPAS_CRESTA.map((c) => Math.max(...barrido(c)))
  assert.ok(picos[0] >= 4, `cresta cercana: pico ${picos[0].toFixed(1)}°`)
  assert.ok(Math.min(...CAPAS_CRESTA.map((c) => Math.min(...barrido(c)))) >= 0.9, 'no hay tramos casi planos al ras del horizonte')
})

test('index.html no incluye a-sky (taparía la cúpula con degradado del horizonte)', () => {
  const html = readFileSync(new URL('../public/prueba-homido/index.html', import.meta.url), 'utf8')
  assert.ok(!/<a-sky[\s>]/.test(html))
})

test('prueba.js no asigna a variables sin declarar (p. ej. el fallo lastSample en cada evento de orientación)', () => {
  const src = readFileSync(new URL('../public/prueba-homido/prueba.js', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  const declarados = new Set([...src.matchAll(/\b(?:let|const|var|function|class)\s+([A-Za-z_$][\w$]*)/g)].map((m) => m[1]))
  for (const m of src.matchAll(/\bfunction\s*\w*\s*\(([^)]*)\)/g)) m[1].split(',').forEach((p) => declarados.add(p.trim().replace(/=.*/, '')))
  for (const m of src.matchAll(/\(([^()]*)\)\s*=>/g)) m[1].split(',').forEach((p) => declarados.add(p.trim().replace(/=.*/, '')))
  for (const m of src.matchAll(/\b(?:let|const)\s*[{\[]([^}\]]*)[}\]]/g)) m[1].split(',').forEach((p) => declarados.add(p.split(':').pop().trim()))
  const sueltas = [...src.matchAll(/(?:^|[;{}]|\n)\s*([A-Za-z_$][\w$]*)\s*=(?![=>])/g)].map((m) => m[1]).filter((n) => !declarados.has(n))
  assert.deepEqual(sueltas, [], `asignaciones a variables no declaradas: ${sueltas.join(', ')}`)
})
