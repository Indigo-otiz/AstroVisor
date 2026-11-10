// Zoom nativo: abrir Chrome y elegir 200 % desde sus controles reales.
// El archivo .qa/zoom-control.json permite ordenar "verificar" o "cerrar".
// No cambia font-size, CSS zoom, escala de página ni métricas de dispositivo.
const {chromium}=require('playwright')
const fs=require('node:fs/promises'),path=require('node:path'),assert=require('node:assert/strict')
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/evidencias/s4'),control=path.join(root,'.qa/zoom-control.json')
const pausa=ms=>new Promise(r=>setTimeout(r,ms))
let browser,cerrar
;(async()=>{
 await fs.mkdir(path.dirname(control),{recursive:true});await fs.mkdir(out,{recursive:true})
 await fs.writeFile(control,JSON.stringify({accion:'esperar'}))
 cerrar=await require('./servidor-pruebas-s4.cjs')()
 browser=await chromium.launch({executablePath:process.env.S4_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:false,args:['--window-size=1440,1000']})
 const context=await browser.newContext({viewport:null}),page=await context.newPage(),cdp=await context.newCDPSession(page)
 await page.goto('http://127.0.0.1:5194/');await page.locator('.public-home').waitFor()
 const baseline=await page.evaluate(()=>({dpr:devicePixelRatio,ancho:innerWidth,alto:innerHeight,anchoExterior:outerWidth}))
 console.log('LISTO: ajusta zoom nativo en la ventana AstroVisor a 200 %; después accion verificar en .qa/zoom-control.json')
 const report={fechaUTC:new Date().toISOString(),zona:'America/Mexico_City',navegador:await browser.version(),metodo:'Chrome con viewport nativo (sin emulación). Zoom desde controles reales del navegador; DPR relativo al inicial y capturas. Sin CSS zoom/font-size ni cambio de métricas de dispositivo.',baseline,casos:[]}
 const fin=Date.now()+300000
 while(Date.now()<fin){
  const {accion}=JSON.parse(await fs.readFile(control,'utf8'))
  if(accion==='cerrar')return
  if(accion!=='verificar'){await pausa(500);continue}
  const zoom=await page.evaluate(dpr=>devicePixelRatio/dpr,baseline.dpr)
  assert.ok(Math.abs(zoom-2)<0.01,`Zoom relativo observado ${zoom}; se requiere 2`)
  for(const modo of [false,true])for(const [ruta,nombre]of [['/','inicio'],['/explorar','listado'],['/explorar/orion','ficha']]){
   await page.goto('http://127.0.0.1:5194'+ruta)
   await page.locator(ruta==='/'?'.public-home':ruta==='/explorar'?'.constellation-grid':'.detail-reading').waitFor()
   if(modo){await page.getByRole('button',{name:'Vista para proyección',exact:true}).click();await page.locator('.presentation-shell').waitFor()}
   await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))))
   const medidas=await page.evaluate(()=>({dpr:devicePixelRatio,ancho:innerWidth,alto:innerHeight,documento:document.documentElement.scrollWidth,
    fuera:[...document.querySelector('main').querySelectorAll('*')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.left < -1 || r.right>innerWidth+1)}).map(el=>el.tagName+':'+el.className)}))
   assert.ok(medidas.documento<=medidas.ancho+1);assert.deepEqual(medidas.fuera,[])
   assert.ok(Math.abs(medidas.dpr/baseline.dpr-2)<0.01)
   if(nombre==='ficha'){
    const escuchar=page.getByRole('button',{name:'Escuchar',exact:true});await escuchar.waitFor()
    // Alcanzar audio desde el foco actual únicamente con Tab; no se fuerza foco.
    for(let i=0;i<45&&!(await escuchar.evaluate(el=>document.activeElement===el));i++)await page.keyboard.press('Tab')
    assert.ok(await escuchar.evaluate(el=>document.activeElement===el));await page.keyboard.press('Enter')
    await page.getByRole('button',{name:'Pausar',exact:true}).waitFor();await page.keyboard.press('Space')
    await page.getByRole('button',{name:'Reanudar',exact:true}).waitFor();await page.keyboard.press('Enter')
    await page.getByRole('button',{name:'Pausar',exact:true}).waitFor();await page.keyboard.press('Space')
    await page.keyboard.press('Tab');assert.ok(await page.locator('summary').evaluate(el=>document.activeElement===el))
    await page.keyboard.press('Enter');assert.equal(await page.locator('details').getAttribute('open'),'')
   }
   // Sin clip/fullPage: con zoom nativo, el recorte de Playwright puede usar
   // coordenadas previas al zoom. Capturar la superficie visible conserva ancho.
   const capturar=async sufijo=>{
    const shot=await cdp.send('Page.captureScreenshot',{format:'png',fromSurface:true})
    const bytes=Buffer.from(shot.data,'base64'),anchoPNG=bytes.readUInt32BE(16)
    assert.ok(Math.abs(anchoPNG-medidas.ancho*medidas.dpr)<8,`Ancho de captura ${anchoPNG} no corresponde al viewport nativo`)
    await fs.writeFile(path.join(out,`zoom-200-${nombre}-${modo?'proyeccion':'habitual'}${sufijo}.png`),bytes)
   }
   if(nombre==='ficha')await capturar('-controles')
   await page.evaluate(()=>scrollTo(0,0));await capturar('')
   report.casos.push({ruta,proyeccion:modo,resultado:'correcto',...medidas});console.log(`OK zoom nativo 200 % ${ruta} ${modo?'proyeccion':'habitual'}`)
  }
  report.resultado='correcto';await fs.writeFile(path.join(out,'zoom-nativo.json'),JSON.stringify(report,null,2)+'\n');console.log('VERIFICADO 6/6');return
 }
 console.log('PENDIENTE: no se recibió orden de verificar; se cierra la sesión de prueba')
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{await browser?.close();await cerrar?.()})
