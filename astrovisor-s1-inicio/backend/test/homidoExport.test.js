import test from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { inicializarCatalogo, obtenerCatalogo } from '../src/services/documentRepository.js'
import { proyectarRecorridos, proyectarLibros } from '../src/services/catalogo.js'
import { editarCatalogo } from '../src/services/catalogoEdicion.js'
import { exportarHomido, verificarPaquete } from '../src/services/homidoExport.js'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { fileURLToPath } from 'node:url'

async function entorno(t) {
  const raiz = await fs.mkdtemp(join(tmpdir(), 'astrovisor-export-'))
  t.after(() => fs.rm(raiz, { recursive: true, force: true }))
  const opciones = { directorio: join(raiz, 'datos'), destino: join(raiz, 'publico'), credenciales: join(raiz, 'identidad', 'admin.json') }
  await inicializarCatalogo({ directorio: opciones.directorio })
  return opciones
}
test('exporta snapshot público, SVG originales exactos, audio/créditos y reexportación idempotente', async t => {
  const o = await entorno(t), c = await obtenerCatalogo(o)
  const antes = await fs.readFile(join(o.directorio, 'catalogo.json'))
  const r = await exportarHomido(o)
  assert.equal(r.confirmada, true); assert.equal(r.revision, 1)
  const p = await verificarPaquete(join(o.destino, 'revisiones', '1'))
  assert.equal(p.manifiesto.revision, 1)
  assert.deepEqual(p.recorridos.map(r=>({...r,libros:r.libros.map(l=>({...l,portada:{...l.portada,src:'/libros-demo/'+l.libroId+'.svg'}})),multimedia:r.multimedia.map(a=>({...a,src:'/audio/'+a.src.split('/').at(-1)}))})),proyectarRecorridos(c))
  assert.deepEqual(p.recorridos.map(r => r.multimedia.map(m => ({...m,src:'/audio/'+m.src.split('/').at(-1)}))), proyectarRecorridos(c).map(r=>r.multimedia))
  assert.deepEqual(p.libros.map(l=>({...l,portadaIlustrativa:'/libros-demo/'+l.portadaIlustrativa.split('/').at(-1)})), proyectarLibros(c))
  for (const l of c.libros) assert.deepEqual(await fs.readFile(join(o.destino,'revisiones','1','portadas',l.id+'.svg')), await fs.readFile(new URL('../../frontend/public'+l.portadaIlustrativa, import.meta.url)))
  assert.deepEqual(await fs.readFile(join(o.directorio, 'catalogo.json')), antes)
  const puntero = await fs.readFile(join(o.destino, 'ultima.json'))
  assert.equal((await exportarHomido(o)).yaPublicada, true)
  assert.deepEqual(await fs.readFile(join(o.destino, 'ultima.json')), puntero)
})
test('libro nuevo compartido renombrado, portada generada, campos privados excluidos y sin retroceso', async t => {
  const o=await entorno(t), viejo=await obtenerCatalogo(o), c=structuredClone(viejo)
  await exportarHomido(o)
  editarCatalogo(c,{tipo:'crearLibro',datos:{id:'nuevo',titulo:'Cielo nuevo',autor:'Equipo temporal',anio:2020,enlacePublico:'https://example.org/temporal',portada:{tipo:'ilustrativa',plantilla:'guia',paleta:'verde'},relaciones:[{constelacionId:'orion',motivo:'Uno'},{constelacionId:'escorpio',motivo:'Dos'}]}})
  c.revision=2; c.libros.at(-1).titulo='Cielo revisado'; c.secreto='NO-PUBLICAR'
  await fs.writeFile(join(o.directorio,'catalogo.json'),JSON.stringify(c))
  await exportarHomido(o)
  const p=await verificarPaquete(join(o.destino,'revisiones','2'))
  assert.equal(p.recorridos.flatMap(r=>r.libros).filter(l=>l.libroId==='nuevo').length,2)
  assert.match(await fs.readFile(join(o.destino,'revisiones','2','portadas','nuevo.svg'),'utf8'),/Cielo/)
  assert.ok(!JSON.stringify(p).includes('NO-PUBLICAR'))
  await fs.writeFile(join(o.directorio,'catalogo.json'),JSON.stringify(viejo))
  await assert.rejects(exportarHomido(o),/retroceder/)
})
for (const fase of ['write','directorio','puntero','limpieza']) test(`fallo ${fase}: publicación anterior o confirmación con limpieza pendiente`,async t=>{
  const o=await entorno(t); await exportarHomido(o)
  const c=await obtenerCatalogo(o); c.revision=2
  await fs.writeFile(join(o.directorio,'catalogo.json'),JSON.stringify(c))
  const io={...fs,
    open:async(p,...a)=>{if(fase==='write'&&p.endsWith('recorridos-demo.json'))throw Object.assign(new Error('fallo controlado'),{code:'EIO'});return fs.open(p,...a)},
    rename:async(a,b)=>{if((fase==='directorio'&&b.endsWith(join('revisiones','2')))||(fase==='puntero'&&b.endsWith('ultima.json')))throw Object.assign(new Error('fallo controlado'),{code:'EACCES'});return fs.rename(a,b)},
    unlink:async p=>{if(fase==='limpieza'&&p.endsWith('exportador.lock'))throw Object.assign(new Error('fallo controlado'),{code:'EACCES'});return fs.unlink(p)},
  }
  if(fase==='limpieza'){const r=await exportarHomido({...o,io});assert.equal(r.confirmada,true);assert.equal(r.limpiezaPendiente,true)}
  else await assert.rejects(exportarHomido({...o,io}))
  const actual=JSON.parse(await fs.readFile(join(o.destino,'ultima.json')))
  assert.equal(actual.revision,fase==='limpieza'?2:1)
  await verificarPaquete(join(o.destino,'revisiones',String(actual.revision)))
  if(fase!=='limpieza') assert.equal((await exportarHomido(o)).confirmada,true)
})
test('concurrencia exclusiva y paquete corrupto o ausente se rechazan',async t=>{
  const o=await entorno(t)
  const resultados=await Promise.allSettled([exportarHomido(o),exportarHomido(o)])
  assert.equal(resultados.filter(r=>r.status==='fulfilled').length,1)
  const dir=join(o.destino,'revisiones','1')
  await fs.writeFile(join(dir,'portadas','star-lore.svg'),'corrupto')
  await assert.rejects(verificarPaquete(dir))
  await fs.unlink(join(dir,'audio','orion-kokoro-v1.wav'))
  await assert.rejects(verificarPaquete(dir))
})
test('rechaza exportar sobre runtime, credenciales o checkout y activos no autorizados',async t=>{
  const o=await entorno(t)
  for(const destino of [o.directorio,join(o.directorio,'publico'),join(o.credenciales,'..','publico'),new URL('../../publico/',import.meta.url).pathname]) await assert.rejects(exportarHomido({...o,destino}))
  const c=await obtenerCatalogo(o); c.recorridos[0].multimedia[0].src='/audio/orion.wav'
  await fs.writeFile(join(o.directorio,'catalogo.json'),JSON.stringify(c))
  await assert.rejects(exportarHomido(o))
  await assert.rejects(exportarHomido({...o,credenciales:join(o.destino,'..','.publico-control','admin.json')}))
})

test('dos procesos: un exportador activo conserva su bloqueo y el segundo falla cerrado; CLI idempotente',async t=>{
  const o=await entorno(t)
  const modulo=new URL('../src/services/homidoExport.js',import.meta.url).href
  const script=`import * as fs from 'node:fs/promises';import {exportarHomido} from ${JSON.stringify(modulo)};const o=JSON.parse(process.env.PRUEBA_EXPORT);const io={...fs,open:async(...a)=>{const h=await fs.open(...a);if(a[0].endsWith('exportador.lock')){const sync=h.sync.bind(h);h.sync=async()=>{await sync();process.send('bloqueado');await new Promise(r=>process.once('message',r))}}return h}};await exportarHomido({...o,io});process.disconnect();`
  // Pausa después de adquirir el lock, antes de leer la instantánea.
  const child=spawn(process.execPath,['--input-type=module','-e',script],{env:{...process.env,PRUEBA_EXPORT:JSON.stringify(o)},stdio:['ignore','pipe','pipe','ipc']})
  t.after(()=>{if(child.exitCode===null)child.kill()})
  await once(child,'message')
  const env={...process.env,ASTROVISOR_DATA_DIR:o.directorio,ASTROVISOR_ADMIN_FILE:o.credenciales,ASTROVISOR_PUBLIC_EXPORT_DIR:o.destino}
  const ejecutar=async()=>{const c=spawn(process.execPath,[fileURLToPath(new URL('../../scripts/exportar-homido.mjs',import.meta.url))],{env,stdio:['ignore','pipe','pipe']});let salida='',error='';c.stdout.on('data',b=>salida+=b);c.stderr.on('data',b=>error+=b);const [code]=await once(c,'exit');return {code,salida,error}}
  assert.equal((await ejecutar()).code,1)
  const lock=join(o.destino,'..','.publico-control','exportador.lock')
  assert.equal(JSON.parse(await fs.readFile(lock)).pid,child.pid)
  child.send('continuar');assert.equal((await once(child,'exit'))[0],0)
  const r=await ejecutar();assert.equal(r.code,0,r.error);assert.equal(JSON.parse(r.salida).yaPublicada,true)
})

test('error de operación y limpieza mantiene no confirmada y la revisión anterior',async t=>{
  const o=await entorno(t);await exportarHomido(o)
  const c=await obtenerCatalogo(o);c.revision=2;await fs.writeFile(join(o.directorio,'catalogo.json'),JSON.stringify(c))
  const io={...fs,rename:async()=>{throw Object.assign(new Error('operacion'),{code:'EIO'})},unlink:async()=>{throw Object.assign(new Error('limpieza'),{code:'EACCES'})}}
  await assert.rejects(exportarHomido({...o,io}),e=>e.message==='operacion'&&!e.confirmada&&e.limpiezaPendiente)
  assert.equal(JSON.parse(await fs.readFile(join(o.destino,'ultima.json'))).revision,1)
})
