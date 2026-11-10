import test from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { once } from 'node:events'
import { randomBytes } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import sharp from 'sharp'
import { crearApp } from '../src/index.js'
import { inicializarAdmin } from '../src/services/adminCredentials.js'
import { inicializarCatalogo, obtenerCatalogo, abrirEscritor, restaurarCatalogo } from '../src/services/documentRepository.js'
import { editarCatalogo } from '../src/services/catalogoEdicion.js'
import { exportarHomido, verificarPaquete, directorioExportacion } from '../src/services/homidoExport.js'

async function entorno(t) {
  const dir=await fs.mkdtemp(join(tmpdir(),'astrovisor-hibrido-')),anterior={...process.env}
  Object.assign(process.env,{ASTROVISOR_DATA_DIR:join(dir,'datos'),ASTROVISOR_ADMIN_FILE:join(dir,'identidad','admin.json'),ASTROVISOR_COVERS_DIR:join(dir,'imagenes'),ASTROVISOR_PUBLIC_EXPORT_DIR:join(dir,'publico')})
  await inicializarCatalogo();const password=randomBytes(20).toString('hex')
  await inicializarAdmin({usuario:'prueba-hibrida',nombre:'Prueba aislada',password})
  let app,server,base,token
  const iniciar=async()=>{app=crearApp();await app.locals.iniciarEscritor();server=app.listen(0,'127.0.0.1');await once(server,'listening');base='http://127.0.0.1:'+server.address().port}
  const cerrar=async()=>{if(server.listening)await new Promise(r=>server.close(r));await app.locals.cerrarEscritor()}
  await iniciar()
  const pedir=(ruta,o={})=>fetch(base+ruta,o)
  const login=await pedir('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({usuario:'prueba-hibrida',contrasena:password})});token=(await login.json()).token
  const headers=revision=>({Authorization:'Bearer '+token,'If-Match':`"catalogo-${revision}"`})
  const subir=(bytes,mime='image/png',revision=1,h=headers(revision))=>pedir('/api/admin/imagenes',{method:'POST',headers:{...h,'Content-Type':mime},body:bytes})
  const guardar=(id,datos,revision=1)=>pedir('/api/admin/libros'+(id?'/'+id:''),{method:id?'PATCH':'POST',headers:{...headers(revision),'Content-Type':'application/json'},body:JSON.stringify(datos)})
  t.after(async()=>{await cerrar();for(const k of Object.keys(process.env))if(!(k in anterior))delete process.env[k];Object.assign(process.env,anterior);await fs.rm(dir,{recursive:true,force:true})})
  return {dir,pedir,subir,guardar,cerrar,reiniciar:async()=>{await cerrar();await iniciar()},headers}
}
const derechos={procedencia:'Imagen sintética del ensayo',permiso:'Creada por el equipo para pruebas',textoAlternativo:'Rectángulo azul de prueba'}
const auto={tipo:'ilustrativa',plantilla:'cielo',paleta:'azul'}
const alta=(id,portada)=>({id,titulo:'Libro temporal',autor:'Equipo temporal',anio:2026,enlacePublico:'https://example.org/'+id,portada,relaciones:[{constelacionId:'orion',motivo:'Prueba'},{constelacionId:'escorpio',motivo:'Compartido'}]})
const sintetica=formato=>sharp({create:{width:90,height:130,channels:3,background:'#142a56'}}).toFormat(formato).toBuffer()

test('SVG estático bloquea título/autor incluso por PATCH; sustitución explícita habilita edición automática',async t=>{
  const e=await entorno(t)
  assert.equal((await e.guardar('star-lore',{titulo:'Otro título'})).status,409)
  assert.equal((await e.guardar('star-lore',{autor:'Otro autor'})).status,409)
  assert.equal((await e.guardar('star-lore',{titulo:'Otro título',autor:'Otro autor',portada:auto})).status,200)
  const c=await obtenerCatalogo();assert.equal(c.libros[0].portada.plantilla,'cielo');assert.equal(c.schemaVersion,1)
  const r=await e.pedir('/api/contenidos/libros/star-lore/portada.svg?revision=2');assert.equal(r.status,200);assert.match(await r.text(),/Otro/)
})
for(const formato of ['png','jpeg'])test(`HTTP ${formato}: preparar, asociar, servir, exportar, reemplazar y conservar paquete anterior`,async t=>{
  const e=await entorno(t),bytes=await sintetica(formato)
  const subida=await e.subir(bytes,'image/'+formato);assert.equal(subida.status,201)
  const preparado=await subida.json(),p={tipo:'imagen-autorizada',...preparado.recurso,...derechos}
  assert.equal((await obtenerCatalogo()).revision,1)
  assert.equal((await e.pedir('/api/contenidos/imagenes/'+p.recursoId)).status,404)
  assert.equal((await e.guardar('',alta('imagen-nueva',p))).status,201)
  const publico=await (await e.pedir('/api/contenidos/libros')).json(),l=publico.find(l=>l.id==='imagen-nueva')
  const imagen=await e.pedir(l.portadaIlustrativa);assert.equal(imagen.status,200);assert.match(imagen.headers.get('content-type'),new RegExp('image/'+formato))
  assert.equal(imagen.headers.get('x-content-type-options'),'nosniff')
  const normalizado=Buffer.from(await imagen.arrayBuffer());assert.equal((await sharp(normalizado).metadata()).format,formato)
  const modulo=new URL('../src/services/documentRepository.js',import.meta.url).href
  const salida=execFileSync(process.execPath,['--input-type=module','-e',`import {obtenerCatalogo} from '${modulo}';const c=await obtenerCatalogo();console.log(c.libros.at(-1).portada.sha256)`],{encoding:'utf8'})
  assert.equal(salida.trim(),p.sha256)
  assert.equal((await e.pedir(l.portadaIlustrativa,{headers:{'If-None-Match':imagen.headers.get('etag')}})).status,304)
  await exportarHomido();const raiz=process.env.ASTROVISOR_PUBLIC_EXPORT_DIR
  const paquete=await verificarPaquete(join(raiz,'revisiones','2')),exportado=paquete.libros.find(l=>l.id==='imagen-nueva')
  assert.match(exportado.portadaIlustrativa,formato==='png'?/\.png$/:/\.jpg$/)
  assert.deepEqual(await fs.readFile(join(raiz,'revisiones','2',exportado.portadaIlustrativa)),normalizado)
  assert.equal((await e.guardar('imagen-nueva',{titulo:'Título nuevo',autor:'Autor nuevo'},2)).status,200)
  const actualizado=await obtenerCatalogo();assert.equal(actualizado.libros.at(-1).portada.sha256,p.sha256)
  const otra=await (await e.subir(await sintetica('png'),'image/png',3)).json()
  assert.equal((await e.guardar('imagen-nueva',{portada:{tipo:'imagen-autorizada',...otra.recurso,...derechos}},3)).status,200)
  assert.equal((await e.guardar('imagen-nueva',{portada:auto},4)).status,200)
  assert.equal((await e.pedir(l.portadaIlustrativa)).status,409)
  await exportarHomido();await verificarPaquete(join(raiz,'revisiones','2'))
  assert.deepEqual(await fs.readFile(join(raiz,'revisiones','2',exportado.portadaIlustrativa)),normalizado)
  await e.reiniciar();assert.equal((await obtenerCatalogo()).libros.at(-1).portada.plantilla,'cielo')
  assert.equal((await e.guardar('imagen-nueva',{titulo:'Otro título'},5)).status,200)
  await assert.rejects(exportarHomido({io:{...fs,rename:async(a,b)=>{if(b.endsWith('ultima.json'))throw Object.assign(new Error('fallo controlado'),{code:'EIO'});return fs.rename(a,b)}}}))
  assert.equal(JSON.parse(await fs.readFile(join(raiz,'ultima.json'))).revision,5)
  await verificarPaquete(join(raiz,'revisiones','5'))
  await e.cerrar()
  const backups=await fs.readdir(join(process.env.ASTROVISOR_DATA_DIR,'backups'))
  const resultado=await restaurarCatalogo({respaldo:backups.find(n=>n.startsWith('catalogo-r2-')),ultimaRevision:6})
  assert.equal(resultado.confirmada,true);assert.ok(resultado.revisionPersistida>6)
  assert.equal((await obtenerCatalogo()).libros.at(-1).portada.sha256,p.sha256)
})
test('subida exige autorización/precondición y rechaza formatos, límites y revisión obsoleta',async t=>{
  const e=await entorno(t),png=await sintetica('png')
  for(const [h,status]of [[{},401],[{Authorization:e.headers(1).Authorization},428],[e.headers(8),412]]) assert.equal((await e.subir(png,'image/png',1,h)).status,status)
  assert.equal((await e.subir(Buffer.from('<svg/>'))).status,400)
  assert.equal((await e.subir(Buffer.alloc(2*1024*1024+1))).status,413)
  assert.equal((await e.subir(png,'text/html')).status,400)
  assert.equal((await obtenerCatalogo()).revision,1)
})
test('412, descriptor inválido y fallo de persistencia conservan recurso preparado y catálogo anterior',async t=>{
  const e=await entorno(t),r=await (await e.subir(await sintetica('png'))).json(),p={tipo:'imagen-autorizada',...r.recurso,...derechos}
  assert.equal((await e.guardar('',alta('nuevo',p),8)).status,412)
  assert.equal((await e.guardar('',alta('nuevo',{...p,sha256:'0'.repeat(64)}))).status,503)
  assert.equal((await e.guardar('',alta('nuevo',{...p,permiso:''}))).status,400)
  await fs.writeFile(join(process.env.ASTROVISOR_DATA_DIR,'backups'),'bloquea backup')
  assert.equal((await e.guardar('',alta('nuevo',p))).status,503)
  assert.equal((await obtenerCatalogo()).revision,1)
  assert.ok((await fs.stat(join(process.env.ASTROVISOR_COVERS_DIR,p.recursoId+'.png'))).isFile())
})
test('exportador rechaza solapamiento con imágenes usando los argumentos efectivos, incluido control hermano',async t=>{
  const e=await entorno(t),covers=process.env.ASTROVISOR_COVERS_DIR
  for(const destino of [covers,join(covers,'publico'),e.dir])await assert.rejects(directorioExportacion({destino}))
  process.env.ASTROVISOR_COVERS_DIR=join(e.dir,'.otro-control')
  await assert.rejects(directorioExportacion({destino:join(e.dir,'otro')}))
  process.env.ASTROVISOR_COVERS_DIR=covers
  await assert.rejects(directorioExportacion({directorio:covers}))
  await assert.rejects(directorioExportacion({credenciales:join(covers,'admin.json')}))
})
