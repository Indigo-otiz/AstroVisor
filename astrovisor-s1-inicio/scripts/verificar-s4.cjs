// Regresión de navegador sobre build servido; no forma parte del producto.
// Requiere Playwright disponible por NODE_PATH (sin añadir dependencias al frontend).
const { chromium } = require('playwright')
const assert = require('node:assert/strict')
const fs = require('node:fs/promises')
const path = require('node:path')
const base = process.env.S4_URL || 'http://127.0.0.1:5194'
const out = process.env.S4_EVIDENCE_DIR ? path.resolve(process.env.S4_EVIDENCE_DIR) : path.resolve(__dirname, '../docs/evidencias/s4')
const report = { fechaUTC: new Date().toISOString(), zona: 'America/Mexico_City', origen: base,
  metodo: 'Playwright, Chrome de escritorio; viewports configurados, no hardware físico', casos: [], distribucion: [] }
const delay = ms => new Promise(r => setTimeout(r, ms))
let browser, context, page, cerrarServidor
async function caso(nombre, fn) {
  try { const detalle = await fn(); report.casos.push({ nombre, resultado: 'correcto', detalle }); console.log(`OK ${nombre}`) }
  catch (e) { report.casos.push({ nombre, resultado: 'fallo', error: e.message }); console.error(`FALLO ${nombre}: ${e.message}`) }
}
async function listo(ruta) {
  await page.goto(base + ruta)
  if (ruta.startsWith('/explorar')) await page.locator(ruta === '/explorar' ? '.constellation-grid' : '.detail-reading').waitFor()
}
async function tabHasta(locator, reverse = false) {
  for (let i = 0; i < 55; i++) {
    if (await locator.evaluate(el => el === document.activeElement)) return
    await page.keyboard.press(reverse ? 'Shift+Tab' : 'Tab')
  }
  throw new Error('El control no se alcanzó por Tab')
}
async function distribucion(ruta, width, height, proyeccion, captura) {
  await page.setViewportSize({ width, height }); await listo(ruta)
  if (proyeccion) {
    await page.getByRole('button', { name: 'Vista para proyección', exact: true }).click()
    await page.locator('.presentation-shell').waitFor()
    await page.waitForFunction(() => {
      const texto = document.querySelector('.detail-reading > section p, .constellation-card-copy p, .home-intro > p')
      return texto && parseFloat(getComputedStyle(texto).fontSize) >= 24
    })
  }
  const medidas = await page.evaluate(() => {
    const q = s => document.querySelector(s)
    const texto = q('.detail-reading > section p') || q('.constellation-card-copy p') || q('.home-intro > p')
    return { ancho: innerWidth, documento: document.documentElement.scrollWidth,
      shell: q('.app-shell').className, shellPx: getComputedStyle(q('.app-shell')).fontSize,
      padres: [texto.parentElement, texto.parentElement.parentElement, q('main')].map(el => ({clase:el.className,px:getComputedStyle(el).fontSize})),
      textoPx: parseFloat(getComputedStyle(texto).fontSize),
      botonPx: q('.presentation-toggle').getBoundingClientRect().height,
      desbordados: [...q('main').querySelectorAll('*')].filter(el => {
        const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth + 1 || r.left < -1)
      }).slice(0, 8).map(el => el.className?.baseVal ?? el.className) }
  })
  report.distribucion.push({ ruta, width, height, proyeccion, ...medidas })
  assert.ok(medidas.documento <= width + 1, `Desbordamiento ${JSON.stringify(medidas)}`)
  assert.deepEqual(medidas.desbordados, [])
  assert.ok(medidas.botonPx >= 48)
  if (proyeccion) assert.ok(medidas.textoPx >= 24)
  if (captura) await page.screenshot({ path: path.join(out, `${ruta === '/' ? 'inicio' : ruta === '/explorar' ? 'listado' : 'ficha'}-${width}-${proyeccion ? 'proyeccion' : 'habitual'}.png`), fullPage: true })
}
;(async () => {
  await fs.mkdir(out, { recursive: true })
  if (process.argv.includes('--serve')) cerrarServidor = await require('./servidor-pruebas-s4.cjs')()
  browser = await chromium.launch({ executablePath: process.env.S4_CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true })
  report.navegador = await browser.version()
  context = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  page = await context.newPage()
  const errores = []
  page.on('pageerror', e => errores.push(e.message))
  for (const [w,h] of [[360,800],[1024,768],[1280,900],[1920,1080],[2560,1440]]) {
    for (const proyeccion of [false,true]) for (const ruta of ['/','/explorar','/explorar/orion']) {
      await caso(`distribucion ${w} ${proyeccion ? 'proyeccion' : 'habitual'} ${ruta}`, () => distribucion(ruta,w,h,proyeccion,[1024,1920].includes(w) || (ruta.endsWith('orion') && [360,2560].includes(w))))
    }
  }
  for (const proyeccion of [false,true]) await caso(`teclado completo ${proyeccion}`, async () => {
    await page.setViewportSize({ width: 1280, height: 900 }); await listo('/')
    const toggle = page.getByRole('button', { name: 'Vista para proyección', exact: true })
    await tabHasta(toggle, true)
    await page.keyboard.press('Enter'); assert.equal(await toggle.getAttribute('aria-pressed'), 'true')
    await page.keyboard.press('Space'); assert.equal(await toggle.getAttribute('aria-pressed'), 'false')
    if (proyeccion) await page.keyboard.press('Enter')
    await tabHasta(page.getByRole('link', { name: 'Explorar constelaciones', exact: true }))
    await page.keyboard.press('Enter'); await page.locator('.constellation-grid').waitFor()
    assert.equal(await toggle.getAttribute('aria-pressed'), String(proyeccion))
    for (const titulo of ['Orión','Osa Mayor','Escorpio']) {
      const link = page.getByRole('link', { name: `Leer la historia de ${titulo}` })
      await tabHasta(link); await page.keyboard.press('Enter'); await page.locator('.detail-reading').waitFor()
      const escuchar = page.getByRole('button', { name: 'Escuchar', exact: true })
      await escuchar.waitFor(); await tabHasta(escuchar); await page.keyboard.press('Space')
      await page.getByRole('button', { name: 'Pausar', exact: true }).waitFor()
      await delay(500); await page.keyboard.press('Space')
      await page.getByRole('button', { name: 'Reanudar', exact: true }).waitFor()
      assert.equal(await page.evaluate(() => document.activeElement.textContent.trim()), 'Reanudar')
      await page.keyboard.press('Enter'); await page.getByRole('button', { name: 'Pausar', exact: true }).waitFor()
      await tabHasta(page.locator('summary')); await page.keyboard.press('Enter')
      assert.equal(await page.locator('details').getAttribute('open'), '')
      await tabHasta(page.getByRole('link', { name: 'Explorar otra constelación' })); await page.keyboard.press('Enter')
      await page.locator('.constellation-grid').waitFor()
      assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H1')
    }
    await page.goBack(); await page.locator('.detail-reading').waitFor(); await page.goForward(); await page.locator('.constellation-grid').waitFor()
    await page.reload(); await page.locator('.constellation-grid').waitFor()
    assert.equal(await toggle.getAttribute('aria-pressed'), 'false')
    return 'Tab/Shift+Tab/Enter/Espacio, tres audios y créditos, historial, estado y recarga'
  })
  for (const modo of [false,true]) for (const ruta of ['/','/explorar','/explorar/orion']) await caso(`texto 200 por CSS, simulacion ${modo} ${ruta}`,async()=>{
    await page.setViewportSize({width:1280,height:900});await listo(ruta)
    if(modo){await page.getByRole('button',{name:'Vista para proyección',exact:true}).click();await page.locator('.presentation-shell').waitFor()}
    await page.addStyleTag({content:'html { font-size:36px !important; }'})
    const m=await page.evaluate(()=>({ancho:innerWidth,documento:document.documentElement.scrollWidth}))
    assert.ok(m.documento<=m.ancho+1)
    await page.screenshot({path:path.join(out,`texto-200-css-${ruta==='/'?'inicio':ruta==='/explorar'?'listado':'ficha'}-${modo?'proyeccion':'habitual'}.png`),fullPage:true})
    return {metodo:'Raíz 18→36px por CSS, no zoom nativo',...m}
  })
  await caso('salto al contenido', async () => {
    await listo('/')
    const skip = page.getByRole('link', { name: 'Saltar al contenido' })
    await tabHasta(skip, true); await page.keyboard.press('Enter')
    assert.equal(await page.evaluate(() => document.activeElement.id), 'contenido')
  })
  await caso('raton y detencion de medios al salir', async () => {
    await page.addInitScript(() => {
      window.__mediosS4 = []; const AudioOriginal = window.Audio
      window.Audio = function (...args) { const media = new AudioOriginal(...args); window.__mediosS4.push(media); return media }
    })
    for (const modo of [false,true]) for (const id of ['orion','osa-mayor','escorpio']) {
      await listo('/explorar/' + id)
      if (modo) await page.getByRole('button', { name: 'Vista para proyección', exact: true }).click()
      await page.getByRole('button', { name: 'Escuchar', exact: true }).click()
      await page.getByRole('button', { name: 'Pausar', exact: true }).waitFor(); await delay(500)
      await page.getByRole('button', { name: 'Pausar', exact: true }).click()
      const posicion = await page.evaluate(() => window.__mediosS4.at(-1).currentTime)
      await page.getByRole('button', { name: 'Reanudar', exact: true }).click(); await delay(350)
      assert.ok(await page.evaluate(t => window.__mediosS4.at(-1).currentTime > t, posicion))
      await page.getByRole('link', { name: 'Explorar otra constelación' }).click(); await page.locator('.constellation-grid').waitFor()
      assert.ok(await page.evaluate(() => window.__mediosS4.every(m => m.paused && m.currentTime === 0)))
    }
    return 'Archivos WAV reales; tiempo avanza, pausa conserva, salida reinicia. No acredita escucha humana.'
  })
  await caso('API fallida y reintento', async () => {
    const ruta = '**/api/contenidos/recorridos'
    await page.route(ruta, route => route.fulfill({ status: 503, body: '{}' }))
    await page.goto(base + '/explorar'); await page.getByRole('button', { name: 'Volver a intentar' }).waitFor()
    await page.getByRole('button', { name: 'Vista para proyección', exact: true }).click()
    await page.screenshot({ path: path.join(out,'api-error-inducido.png'), fullPage:true })
    await page.unroute(ruta); await page.getByRole('button', { name: 'Volver a intentar' }).click()
    await page.locator('.constellation-grid').waitFor()
    assert.equal(await page.evaluate(() => document.activeElement.tagName), 'H1')
    return '503 inducido por intercepción Playwright, API real al reintentar'
  })
  await caso('audio ausente conserva lectura', async () => {
    await page.route('**/audio/*.wav', route => route.fulfill({ status:404,body:'' }))
    await listo('/explorar/orion'); await page.getByRole('button', { name:'Escuchar',exact:true }).click()
    await page.getByText('No pudimos reproducir el audio.', { exact:false }).waitFor()
    assert.ok(await page.locator('.detail-reading > section p').first().isVisible())
    await page.screenshot({ path:path.join(out,'audio-error-inducido.png'),fullPage:true })
    await page.unroute('**/audio/*.wav')
  })
  await caso('sin A-Frame y retorno 2D', async () => {
    const ruta = '**/aframe.min.js'
    await page.route(ruta, route => route.abort())
    await page.goto(base + '/prueba-homido/index.html')
    await page.getByRole('link',{name:'Regresar al modo web 2D'}).click(); await page.locator('.constellation-grid').waitFor()
    await page.unroute(ruta)
    return 'Motor A-Frame bloqueado intencionalmente; retorno 2D con API disponible'
  })
  for (const ancho of [360, 1024, 1920]) for (const modo of [false, true]) await caso(`integracion biblioteca y footer ${ancho} ${modo}`, async () => {
    await page.setViewportSize({ width: ancho, height: 900 }); await listo('/explorar/orion')
    if (modo) await page.getByRole('button', { name: 'Vista para proyección', exact: true }).click()
    await page.getByRole('link', { name: 'Ver libros recomendados sobre Orión', exact: true }).click()
    await page.locator('.biblioteca-rejilla').waitFor()
    assert.equal(await page.locator('.presentation-toggle').getAttribute('aria-pressed'), String(modo))
    const comprobarAncho = async () => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Biblioteca fuera del ancho')
    await comprobarAncho()
    const logos = page.locator('.institutional-footer-logos img')
    assert.equal(await logos.count(), 3)
    await page.waitForFunction(() => [...document.querySelectorAll('.institutional-footer-logos img')].every(img => img.complete && img.naturalWidth > 0))
    await page.getByRole('link', { name: 'Ver información del libro', exact: true }).first().click()
    await page.locator('.biblioteca-detalle').waitFor(); await comprobarAncho()
    assert.equal(await page.locator('.presentation-toggle').getAttribute('aria-pressed'), String(modo))
    await page.screenshot({ path: path.join(out, `biblioteca-${ancho}-${modo ? 'proyeccion' : 'habitual'}.png`), fullPage: true })
    await page.getByRole('link', { name: '← Volver a los libros sobre Orión', exact: true }).click()
    await page.locator('.biblioteca-rejilla').waitFor()
    return 'Recorrido de constelación a estantería y libro; estado conservado, sin desbordamiento y tres logos institucionales cargados'
  })
  await caso('aislamiento de presentacion y administracion protegida', async () => {
    await listo('/'); await page.getByRole('button',{name:'Vista para proyección',exact:true}).click()
    await page.getByRole('link',{name:'Homido',exact:true}).click()
    assert.equal(await page.locator('.presentation-shell').count(),0)
    await page.getByRole('link',{name:'Administración',exact:true}).click()
    assert.equal(await page.locator('.presentation-shell').count(),0)
    assert.equal(await page.getByRole('button',{name:'Vista para proyección',exact:true}).count(),0)
    const response = await context.request.get(base + '/api/admin/sesion')
    assert.equal(response.status(),401)
    return 'Sin inicio de sesión real; HTTP 401 de API real'
  })
  report.erroresPagina = errores
})().catch(e => { report.errorFatal=e.stack; console.error(e); process.exitCode=1 })
  .finally(async () => {
    await browser?.close()
    await cerrarServidor?.()
    report.correctos=report.casos.filter(x=>x.resultado==='correcto').length
    report.fallos=report.casos.filter(x=>x.resultado==='fallo').length
    await fs.mkdir(out,{recursive:true}); await fs.writeFile(path.join(out,'navegador.json'),JSON.stringify(report,null,2)+'\n')
    if (report.fallos) process.exitCode=1
    console.log(`${report.correctos} casos correctos; ${report.fallos} fallos`)
  })
