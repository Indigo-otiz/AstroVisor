// Ensayo aislado: imágenes sintéticas, identidad efímera, sin datos institucionales.
import assert from 'node:assert/strict'
import * as fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve, dirname } from 'node:path'
import { randomBytes } from 'node:crypto'
import { once } from 'node:events'
import { createServer } from 'vite'
import sharp from 'sharp'
import { inicializarCatalogo, obtenerCatalogo } from '../backend/src/services/documentRepository.js'
import { inicializarAdmin } from '../backend/src/services/adminCredentials.js'
import { crearApp } from '../backend/src/index.js'
import { exportarHomido } from '../backend/src/services/homidoExport.js'
import { crearServidorExportaciones } from './servir-homido-dev.mjs'

const {chromium}=await import(process.env.ASTROVISOR_PLAYWRIGHT_MODULE||'playwright')
const temporal=await fs.mkdtemp(join(tmpdir(),'astrovisor-5d-browser-'))
const claves=['ASTROVISOR_DATA_DIR','ASTROVISOR_ADMIN_FILE','ASTROVISOR_COVERS_DIR','ASTROVISOR_PUBLIC_EXPORT_DIR','ASTROVISOR_EXPORT_ORIGIN']
const previo=Object.fromEntries(claves.map(k=>[k,process.env[k]]))
Object.assign(process.env,{ASTROVISOR_DATA_DIR:join(temporal,'datos'),ASTROVISOR_ADMIN_FILE:join(temporal,'identidad','admin.json'),ASTROVISOR_COVERS_DIR:join(temporal,'imagenes'),ASTROVISOR_PUBLIC_EXPORT_DIR:join(temporal,'publico')})
delete process.env.ASTROVISOR_EXPORT_ORIGIN
const password=randomBytes(20).toString('hex'),usuario='ensayo-portadas'
const salida=resolve('docs/evidencias-s4-5d')
const modo=process.argv[2]??'completo'
assert.ok(['formulario','panel','completo','completo-1','completo-2'].includes(modo),'Modo de ensayo no permitido')
let api,vite,browser,app,estatico,page,apiUrl
const errores=[],medidas=[],red=[],consola=[],pendientes=new Map(),inicio=Date.now()
let paso='inicio'
async function ejecutar(){try{
  await fs.mkdir(salida,{recursive:true});await inicializarCatalogo();await inicializarAdmin({usuario,nombre:'Ensayo temporal',password})
  app=crearApp();await app.locals.iniciarEscritor();api=app.listen(0,'127.0.0.1');await once(api,'listening')
  apiUrl='http://127.0.0.1:'+api.address().port
  estatico=await crearServidorExportaciones();estatico.listen(0,'127.0.0.1');await once(estatico,'listening')
  vite=await createServer({root:resolve('frontend'),configFile:resolve('frontend/vite.config.js'),server:{host:'127.0.0.1',port:0,open:false,proxy:{'/api':{target:apiUrl},'/respaldo-homido':{target:'http://127.0.0.1:'+estatico.address().port,rewrite:r=>r.replace(/^\/respaldo-homido/,'')}}}})
  await vite.listen();const base='http://127.0.0.1:'+vite.httpServer.address().port
  browser=await chromium.launch({channel:'chrome',headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']})
  page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>errores.push(e.message))
  // Evidencia pasiva: no registra cuerpos, cabeceras, contraseñas o tokens ni espera antes de las acciones.
  page.on('request',r=>{if(new URL(r.url()).pathname.startsWith('/api/')){const e={ms:Date.now()-inicio,metodo:r.method(),ruta:new URL(r.url()).pathname};pendientes.set(r,e);red.push({...e,evento:'solicitud'})}})
  page.on('response',r=>{if(pendientes.has(r.request()))red.push({...pendientes.get(r.request()),evento:'respuesta',estado:r.status(),respuestaMs:Date.now()-inicio})})
  page.on('requestfinished',r=>pendientes.delete(r));page.on('requestfailed',r=>{if(pendientes.has(r))red.push({...pendientes.get(r),evento:'fallo'});pendientes.delete(r)})
  page.on('console',m=>consola.push({ms:Date.now()-inicio,tipo:m.type(),texto:m.text().replaceAll(password,'[omitido]').slice(0,1000)}))
  await page.addInitScript(()=>{
    window.__eventos5d=[]
    const registrar=e=>{const b=document.querySelector('#nuevo-libro');window.__eventos5d.push({ms:Date.now(),evento:e.type,activo:document.activeElement?.id??'',destino:e.target?.id??'',disabled:b?.disabled??null,formulario:!!document.querySelector('#nuevo-id')})}
    document.addEventListener('focusin',registrar,true)
    document.addEventListener('keydown',e=>{if(e.key==='Enter')registrar(e)},true)
  })
  paso='login'
  await page.goto(base+'/admin/acceso')
  await page.locator('input[autocomplete="username"]').fill(usuario)
  await page.locator('input[type="password"]').fill(password)
  await page.locator('button[type="submit"]').click();await page.waitForURL('**/admin')
  await page.locator('#nuevo-libro').waitFor()
  const clickNuevo=async()=>{paso='abrir-alta';const boton=page.locator('#nuevo-libro:enabled');await boton.waitFor();await boton.press('Enter');await page.locator('#nuevo-id').waitFor()}
  const registrar=async(datos)=>{
    const resultado={modo,chrome:browser.version(),ms:Date.now()-inicio,...datos,errores,red,consola,pendientes:[...pendientes.values()],browserConectado:browser.isConnected(),eventos:await page.evaluate(()=>window.__eventos5d??[])}
    assert.equal(errores.length,0)
    await fs.writeFile(join(salida,`estabilidad-${modo}.json`),JSON.stringify(resultado,null,2)+'\n')
    console.log(JSON.stringify({modo,ms:resultado.ms,...datos,errores}))
  }
  if(modo==='formulario'){
    for(let i=0;i<5;i++){
      await clickNuevo();assert.equal(await page.locator('#nuevo-id').count(),1)
      await page.getByRole('button',{name:'Cancelar edición',exact:true}).click()
      await page.waitForFunction(()=>document.activeElement?.id==='nuevo-libro'&&!document.querySelector('#nuevo-id'))
    }
    assert.equal((await obtenerCatalogo()).revision,1)
    assert.equal(red.filter(e=>e.evento==='solicitud'&&['POST','PATCH'].includes(e.metodo)&&e.ruta!=='/api/admin/login').length,0)
    await registrar({aperturas:5,cancelaciones:5,revision:1,health:(await fetch(apiUrl+'/api/health')).status})
    return
  }
  const guardarConfirmado=async(revision)=>{
    paso='guardar-'+revision
    await page.locator('form button[type="submit"]').click()
    await page.getByRole('status').filter({hasText:'Guardado confirmado'}).waitFor()
    await page.waitForFunction(()=>!document.querySelector('#nuevo-libro')?.disabled&&document.activeElement?.id==='editor-resultados')
    assert.equal((await obtenerCatalogo()).revision,revision)
  }
  const llenar=async(id,formato)=>{
    await clickNuevo();await page.locator('#nuevo-id').fill(id);await page.locator('#nuevo-titulo').fill('Cielo de prueba '+formato);await page.locator('#nuevo-autor').fill('Equipo temporal')
    await page.locator('#tipo-portada').selectOption('imagen-autorizada')
    const buffer=await sharp({create:{width:180,height:260,channels:3,background:formato==='png'?'#142a56':'#22463f'}}).toFormat(formato).toBuffer()
    await page.locator('#archivo-portada').setInputFiles({name:'sintetica.'+(formato==='png'?'png':'jpg'),mimeType:'image/'+formato,buffer})
    await page.locator('.portada-preview img').waitFor();await page.locator('.portada-preview img').evaluate(i=>i.decode())
    await page.locator('#imagen-procedencia').fill('Imagen sintética creada para el ensayo')
    await page.locator('#imagen-permiso').fill('Uso autorizado exclusivamente en esta prueba')
    await page.locator('#imagen-alternativa').fill('Rectángulo de color para ensayo')
    await page.locator('#editor-anio').fill('2026');await page.locator('#editor-enlace').fill('https://example.org/'+id)
    for(const index of [0,2])await page.locator('.catalogo-check input').nth(index).check()
    await page.locator('#motivo-orion').fill('Prueba desde Orión');await page.locator('#motivo-escorpio').fill('Prueba compartida')
  }
  await llenar('aa-imagen-png','png')
  assert.equal((await obtenerCatalogo()).revision,1)
  for(const ancho of [1280,360]){
    await page.setViewportSize({width:ancho,height:900})
    const m=await page.evaluate(()=>({innerWidth,clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,sinEtiqueta:[...document.querySelectorAll('form input,form select,form textarea')].filter(e=>!e.labels?.length&&!e.getAttribute('aria-label')).length}))
    medidas.push(m);assert.ok(m.scrollWidth<=m.clientWidth+1);assert.equal(m.sinEtiqueta,0)
    await page.locator('.catalogo-formulario').screenshot({path:join(salida,`panel-${ancho}.png`)})
  }
  await page.locator('#imagen-alternativa').focus();await page.keyboard.press('Tab');assert.ok(await page.evaluate(()=>document.activeElement!==document.body))
  await guardarConfirmado(2)
  await page.locator('#nuevo-libro').waitFor();await llenar('ab-imagen-jpeg','jpeg')
  await guardarConfirmado(3)
  await page.locator('[data-editar="libro-star-lore"]').click();assert.equal(await page.locator('#editor-titulo').getAttribute('readonly'),'')
  await page.locator('#tipo-portada').selectOption('ilustrativa');await page.locator('#editor-titulo').fill('Cielo revisado')
  await page.getByRole('button',{name:'Previsualizar portada',exact:true}).click();await page.locator('.portada-preview img').waitFor()
  await page.getByRole('button',{name:'Cancelar edición',exact:true}).click();assert.equal((await obtenerCatalogo()).revision,3)
  // Alta automática y transiciones confirmadas, además de las imágenes del recorrido original.
  await clickNuevo()
  await page.locator('#nuevo-id').fill('zz-automatica');await page.locator('#nuevo-titulo').fill('Cielo automático');await page.locator('#nuevo-autor').fill('Equipo temporal')
  await page.locator('#editor-anio').fill('2026');await page.locator('#editor-enlace').fill('https://example.org/zz-automatica')
  await page.locator('.catalogo-check input').first().check();await page.locator('#motivo-orion').fill('Ensayo automático')
  await page.getByRole('button',{name:'Previsualizar portada',exact:true}).click();await page.locator('.portada-preview img').evaluate(i=>i.decode())
  assert.equal((await obtenerCatalogo()).revision,3);await guardarConfirmado(4)
  await page.locator('[data-editar="libro-zz-automatica"]').click();await page.locator('#editor-titulo').fill('Cielo estable')
  await page.getByRole('button',{name:'Previsualizar portada',exact:true}).click();await page.locator('.portada-preview img').evaluate(i=>i.decode());await guardarConfirmado(5)
  await page.locator('[data-editar="libro-zz-automatica"]').click();await page.locator('#tipo-portada').selectOption('imagen-autorizada')
  const reemplazo=await sharp({create:{width:180,height:260,channels:3,background:'#22463f'}}).png().toBuffer()
  await page.locator('#archivo-portada').setInputFiles({name:'sintetica.png',mimeType:'image/png',buffer:reemplazo});await page.locator('.portada-preview img').evaluate(i=>i.decode())
  await page.locator('#imagen-procedencia').fill('Imagen sintética del ensayo');await page.locator('#imagen-permiso').fill('Uso exclusivo de prueba');await page.locator('#imagen-alternativa').fill('Rectángulo de prueba')
  await guardarConfirmado(6);assert.equal((await obtenerCatalogo()).libros.find(l=>l.id==='zz-automatica').portada.tipo,'imagen-autorizada')
  await page.locator('[data-editar="libro-zz-automatica"]').click();await page.locator('#tipo-portada').selectOption('ilustrativa')
  await page.getByRole('button',{name:'Previsualizar portada',exact:true}).click();await page.locator('.portada-preview img').evaluate(i=>i.decode());await guardarConfirmado(7)
  assert.equal((await obtenerCatalogo()).libros.find(l=>l.id==='zz-automatica').portada.tipo,'ilustrativa')
  await page.locator('[data-editar="libro-zz-automatica"]').click();await page.locator('#editor-titulo').fill('Borrador no confirmado')
  await page.getByRole('button',{name:'Previsualizar portada',exact:true}).click();await page.locator('.portada-preview img').evaluate(i=>i.decode())
  const loginExterno=await fetch(apiUrl+'/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({usuario,contrasena:password})})
  assert.equal(loginExterno.status,200);const {token}=await loginExterno.json()
  assert.equal((await fetch(apiUrl+'/api/admin/libros/zz-automatica',{method:'PATCH',headers:{Authorization:'Bearer '+token,'If-Match':'"catalogo-7"','Content-Type':'application/json'},body:'{"anio":2025}'})).status,200)
  await page.locator('form button[type="submit"]').click()
  await page.getByRole('alert').filter({hasText:'Otra sesión'}).waitFor()
  assert.equal(await page.locator('#editor-titulo').inputValue(),'Borrador no confirmado')
  assert.ok(red.some(e=>e.evento==='respuesta'&&e.estado===412));assert.equal((await obtenerCatalogo()).revision,8)
  assert.equal((await obtenerCatalogo()).libros.find(l=>l.id==='zz-automatica').titulo,'Cielo estable')
  const transiciones={automatica:4,edicion:5,sustitucion:6,retornoAutomatica:7,conflicto:412,revision:8}
  if(modo==='panel'){await registrar({transiciones,health:(await fetch(apiUrl+'/api/health')).status});return}
  paso='exportar'
  await exportarHomido()
  const publica=await browser.newPage({viewport:{width:360,height:900}});publica.on('pageerror',e=>errores.push(e.message))
  for(const id of ['aa-imagen-png','ab-imagen-jpeg']){
    await publica.goto(base+'/explorar/orion/libros/'+id);await publica.locator('.biblioteca-detalle img').evaluate(i=>i.decode())
    assert.equal(await publica.locator('.biblioteca-detalle img').getAttribute('alt'),'Rectángulo de color para ensayo')
    assert.match(await publica.locator('figcaption').innerText(),/permiso declarado/)
  }
  await publica.screenshot({path:join(salida,'ficha-jpeg-360.png'),fullPage:true})
  await publica.goto(base+'/explorar/orion/libros/zz-automatica');await publica.locator('.biblioteca-detalle img').evaluate(i=>i.decode())
  assert.equal(await publica.locator('h1').innerText(),'Cielo estable')
  const visor=await browser.newPage({viewport:{width:1280,height:900}});visor.on('pageerror',e=>errores.push(e.message))
  const cubiertas=async()=>{
    await visor.waitForFunction(()=>Boolean(window.AstroVisorHomido)&&document.querySelector('[data-action="constelacion"][data-id="orion"]'))
    await visor.evaluate(()=>{window.AstroVisorHomido.abrirFicha('orion');document.querySelector('[data-action="libros"]').dispatchEvent(new MouseEvent('click'))})
    await visor.waitForFunction(()=>['aa-imagen-png','ab-imagen-jpeg'].every(id=>{const i=document.getElementById('cubierta-vr-'+id);return i?.tagName==='IMG'&&i.complete&&i.naturalWidth>0}))
    return visor.evaluate(()=>['aa-imagen-png','ab-imagen-jpeg'].map(id=>{const i=document.getElementById('cubierta-vr-'+id);return{id,width:i.naturalWidth,blob:i.src.startsWith('blob:')}}))
  }
  await visor.goto(base+'/prueba-homido/index.html?diag=1&aa=0')
  const online=await cubiertas();assert.ok(online.every(i=>!i.blob))
  paso='paquete-sin-express'
  await new Promise(r=>api.close(r));api=undefined;await app.locals.cerrarEscritor();app=undefined
  await assert.rejects(fetch(apiUrl+'/api/health',{signal:AbortSignal.timeout(3000)}))
  const lector=await publica.evaluate(async()=>{
    const {cargarDatos}=await import('/prueba-homido/js/datos.js')
    const r=await cargarDatos({urlApi:'/api-inexistente'})
    const tipos=await Promise.all(r.libros.filter(l=>l.portada?.tipo==='imagen-autorizada').map(async l=>(await fetch(l.portadaIlustrativa)).headers.get('content-type')))
    const revision=r.revision;r.liberar();return{tipos,revision}
  })
  assert.deepEqual(lector.tipos.sort(),['image/jpeg','image/png']);assert.equal(lector.revision,8)
  await visor.route('**/api/contenidos/**',r=>r.fulfill({status:503,body:'No disponible en ensayo'}))
  await visor.reload();const respaldo=await cubiertas();assert.ok(respaldo.every(i=>i.blob))
  const homido={online,respaldo,renderizado:'WebGL software, sin dispositivo físico'}
  assert.equal(errores.length,0)
  await fs.writeFile(join(salida,'resultados.json'),JSON.stringify({chrome:browser.version(),medidas,lector,homido,errores,revision:(await obtenerCatalogo()).revision},null,2)+'\n')
  await registrar({medidas,lector,homido,transiciones,expressDetenido:true})
}catch(error){
  const estado=page&&!page.isClosed()?await page.evaluate(()=>({ruta:location.pathname,activo:document.activeElement?.id??'',botonDeshabilitado:document.querySelector('#nuevo-libro')?.disabled,formulario:!!document.querySelector('#nuevo-id'),eventos:window.__eventos5d??[],alertas:[...document.querySelectorAll('[role="alert"]')].map(e=>e.textContent)})).catch(()=>null):null
  const health=apiUrl?await fetch(apiUrl+'/api/health',{signal:AbortSignal.timeout(3000)}).then(r=>r.status).catch(()=>null):null
  const evidencia={paso,ms:Date.now()-inicio,error:error.name,estado,health,browserConectado:browser?.isConnected()??false,apiEscuchando:api?.listening??false,pendientes:[...pendientes.values()],red,consola,errores,pid:process.pid}
  await fs.writeFile(join(salida,'timeout-diagnostico.json'),JSON.stringify(evidencia,null,2)+'\n')
  if(page&&!page.isClosed())await page.screenshot({path:join(salida,'timeout-estado.png'),fullPage:true}).catch(()=>{})
  throw error
}finally{
  await browser?.close();await vite?.close();if(api)await new Promise(r=>api.close(r));if(app)await app.locals.cerrarEscritor();if(estatico)await new Promise(r=>estatico.close(r))
  for(const[k,v]of Object.entries(previo)){if(v===undefined)delete process.env[k];else process.env[k]=v}
  assert.equal(dirname(temporal),resolve(tmpdir()));await fs.rm(temporal,{recursive:true,force:true})
}}
await ejecutar()
