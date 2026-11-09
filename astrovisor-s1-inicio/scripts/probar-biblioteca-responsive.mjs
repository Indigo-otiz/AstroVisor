// Ejecutar con Playwright instalado externamente; no requiere cuentas ni almacenamiento real.
import assert from 'node:assert/strict'
import * as fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve, join, dirname } from 'node:path'
import { once } from 'node:events'
import { createServer } from 'vite'
import { inicializarCatalogo, obtenerCatalogo } from '../backend/src/services/documentRepository.js'
import { editarCatalogo } from '../backend/src/services/catalogoEdicion.js'

const { chromium } = await import(process.env.ASTROVISOR_PLAYWRIGHT_MODULE || 'playwright')
const etapa = process.env.ASTROVISOR_RESPONSIVE_ETAPA || 'despues'
assert.ok(['antes', 'despues'].includes(etapa))
const salida = resolve('docs/evidencias-s4-5b')
const temporal = await fs.mkdtemp(join(tmpdir(), 'astrovisor-responsive-'))
const variables = ['ASTROVISOR_DATA_DIR', 'ASTROVISOR_ADMIN_FILE', 'ASTROVISOR_PUBLIC_EXPORT_DIR', 'ASTROVISOR_EXPORT_ORIGIN']
const anteriores = Object.fromEntries(variables.map(k => [k, process.env[k]]))
process.env.ASTROVISOR_DATA_DIR = join(temporal, 'datos')
process.env.ASTROVISOR_ADMIN_FILE = join(temporal, 'identidad', 'inexistente.json')
process.env.ASTROVISOR_PUBLIC_EXPORT_DIR = join(temporal, 'publico')
delete process.env.ASTROVISOR_EXPORT_ORIGIN
let api, vite, browser
const medidas = [], fallos = [], erroresJS = []
const comprobar = (condicion, mensaje) => { if (!condicion) fallos.push(mensaje) }
try {
  await fs.mkdir(salida, { recursive: true })
  await inicializarCatalogo()
  const catalogo = await obtenerCatalogo()
  const nuevos = [
    { id: 'aa-aceptacion', titulo: 'Cielo de aceptacion', autor: 'Equipo temporal' },
    { id: 'nuevo-' + 'cielo'.repeat(12), titulo: 'W'.repeat(12), autor: 'W'.repeat(17) },
  ]
  for (const libro of nuevos) editarCatalogo(catalogo, { tipo: 'crearLibro', datos: {
    ...libro, anio: 2026, enlacePublico: 'https://example.org/responsive/' + libro.id,
    portada: { tipo: 'ilustrativa', plantilla: 'cielo', paleta: 'azul' },
    relaciones: [{ constelacionId: 'orion', motivo: 'Lectura' + 'demostrativa'.repeat(20) }],
  } })
  catalogo.revision = 2
  await fs.writeFile(join(process.env.ASTROVISOR_DATA_DIR, 'catalogo.json'), JSON.stringify(catalogo))
  const { crearApp } = await import('../backend/src/index.js')
  api = crearApp().listen(0, '127.0.0.1'); await once(api, 'listening')
  vite = await createServer({ root: resolve('frontend'), configFile: resolve('frontend/vite.config.js'),
    server: { host: '127.0.0.1', port: 0, open: false, proxy: { '/api': { target: `http://127.0.0.1:${api.address().port}` } } } })
  await vite.listen()
  const base = `http://127.0.0.1:${vite.httpServer.address().port}`
  browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext()
  // Comprueba activación del enlace, sin consultar servicios bibliográficos externos.
  await context.route('https://**/*', ruta => ruta.fulfill({ contentType: 'text/html', body: '<p>Destino de prueba</p>' }))
  const page = await context.newPage()
  page.on('pageerror', e => erroresJS.push(e.message))
  async function medir(caso) {
    const valor = await page.evaluate(() => {
      const selectores = ['#contenido', '.brand', '.biblioteca-page', '.biblioteca-detalle', '.biblioteca-detalle-portada', '.biblioteca-detalle-info', '.biblioteca-buscar', '.biblioteca-marc', '.biblioteca-boton']
      const elementos = selectores.flatMap(selector => {
        const e = document.querySelector(selector); if (!e) return []
        const r = e.getBoundingClientRect(), s = getComputedStyle(e)
        return [{ selector, x: r.x, derecha: r.right, ancho: r.width, alto: r.height, clientWidth: e.clientWidth, scrollWidth: e.scrollWidth, minWidth: s.minWidth, grid: s.gridTemplateColumns, fontSize: s.fontSize, color: s.color, fondo: s.backgroundColor, overflowWrap: s.overflowWrap }]
      })
      return { innerWidth, clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth,
        visualViewport: visualViewport ? { width: visualViewport.width, height: visualViewport.height, scale: visualViewport.scale, offsetLeft: visualViewport.offsetLeft } : null,
        elementos, exceden: [...document.querySelectorAll('main *,header *,footer *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).map(e => ({ tag: e.tagName, clase: e.className, derecha: e.getBoundingClientRect().right })) }
    })
    medidas.push({ ...caso, ...valor })
    comprobar(valor.scrollWidth <= valor.clientWidth + 1, `Desbordamiento ${JSON.stringify(caso)}: ${valor.scrollWidth}/${valor.clientWidth}`)
    return valor
  }
  for (const ancho of [320, 360, 375, 768, 1280]) for (const zoom of [1, 2]) {
    await page.setViewportSize({ width: ancho, height: 900 })
    for (const libro of catalogo.libros) {
      await page.goto(`${base}/explorar/orion/libros/${libro.id}`)
      await page.getByRole('heading', { name: libro.titulo, exact: true }).waitFor()
      await page.locator('.biblioteca-detalle img').evaluate(i => i.decode())
      await page.evaluate(z => { document.body.style.zoom = String(z) }, zoom)
      await page.locator('.biblioteca-marc summary').click()
      await medir({ ancho, zoom, libro: libro.id })
      const imagen = await page.locator('.biblioteca-detalle img').evaluate(i => ({ natural: i.naturalWidth / i.naturalHeight, actual: i.getBoundingClientRect().width / i.getBoundingClientRect().height }))
      comprobar(Math.abs(imagen.natural - imagen.actual) < .01, `Proporción portada ${libro.id}`)
      comprobar((await page.locator('.biblioteca-page').innerText()).includes(libro.marc21.campo001), `MARC completo ${libro.id}`)
      comprobar((await page.locator('.biblioteca-autor').innerText()).includes(libro.autor), `Autor completo ${libro.id}`)
      comprobar(await page.locator('.biblioteca-boton').isVisible(), `Enlace visible ${libro.id}`)
      if (libro.id === 'aa-aceptacion' && [360, 1280].includes(ancho) && zoom === 2) await page.screenshot({ path: join(salida, `${etapa}-${ancho}-css-200.png`), fullPage: true })
    }
    for (const ruta of ['/', '/explorar', '/explorar/orion', '/explorar/orion/libros']) {
      await page.goto(base + ruta); await page.locator('#contenido h1').waitFor()
      if (ruta === '/explorar') await page.locator('.constellation-card').first().waitFor()
      if (ruta === '/explorar/orion') await page.locator('.constellation-detail').waitFor()
      if (ruta.endsWith('/libros')) await page.locator('.biblioteca-tarjeta').first().waitFor()
      await page.evaluate(z => { document.body.style.zoom = String(z) }, zoom)
      await medir({ ancho, zoom, ruta })
    }
  }
  await page.setViewportSize({ width: 360, height: 900 })
  await page.goto(base + '/explorar/orion/libros')
  const abrir = page.getByRole('link', { name: 'Ver información del libro Cielo de aceptacion', exact: true })
  await abrir.focus(); await page.keyboard.press('Enter'); await page.waitForURL('**/libros/aa-aceptacion')
  await page.waitForFunction(() => document.activeElement === document.querySelector('#contenido h1') && document.activeElement?.textContent === 'Cielo de aceptacion')
  await page.evaluate(() => { document.body.style.zoom = '2' })
  const summary = page.locator('.biblioteca-marc summary')
  await summary.focus(); await page.keyboard.press('Enter'); comprobar(await page.locator('.biblioteca-marc').getAttribute('open') !== null, 'Enter abre MARC')
  await page.keyboard.press('Tab'); comprobar(await page.evaluate(() => document.activeElement.matches('.biblioteca-boton')), 'Tab al enlace externo')
  const foco = await page.evaluate(() => ({ estilo: getComputedStyle(document.activeElement).outlineStyle, ancho: getComputedStyle(document.activeElement).outlineWidth }))
  comprobar(foco.estilo !== 'none' && parseFloat(foco.ancho) > 0, 'Foco visible')
  const popup = context.waitForEvent('page'); await page.keyboard.press('Enter'); const destino = await popup; await destino.waitForLoadState(); await destino.close()
  await page.bringToFront(); await page.keyboard.press('Shift+Tab'); comprobar(await page.evaluate(() => document.activeElement.tagName === 'SUMMARY'), 'Shift+Tab regresa a MARC')
  const volver = page.getByRole('link', { name: '← Volver a los libros sobre Orión', exact: true })
  await volver.focus(); await page.keyboard.press('Enter'); await page.waitForURL('**/orion/libros')
  await page.waitForFunction(() => document.activeElement === document.querySelector('#contenido h1'))
  await page.goBack(); await page.getByRole('heading', { name: 'Cielo de aceptacion', exact: true }).waitFor()
  await page.waitForFunction(() => document.activeElement === document.querySelector('#contenido h1'))
  comprobar(erroresJS.length === 0, 'Sin errores JavaScript: ' + erroresJS.join(';'))
  await fs.writeFile(join(salida, `${etapa}-mediciones.json`), JSON.stringify({ chrome: browser.version(), medidas, foco, erroresJS, fallos }, null, 2) + '\n')
  console.log(JSON.stringify({ casos: medidas.length, fallos, foco, erroresJS }, null, 2))
  assert.equal(fallos.length, 0, 'Regresión responsive/accesible: ' + fallos.join('; '))
} finally {
  await browser?.close(); await vite?.close()
  if (api) await new Promise(r => api.close(r))
  for (const [k, v] of Object.entries(anteriores)) { if (v === undefined) delete process.env[k]; else process.env[k] = v }
  assert.equal(dirname(temporal), resolve(tmpdir()))
  await fs.rm(temporal, { recursive: true, force: true })
}
