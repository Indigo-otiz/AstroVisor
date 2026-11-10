import test from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { once } from 'node:events'
import { inicializarCatalogo } from '../../backend/src/services/documentRepository.js'
import { exportarHomido } from '../../backend/src/services/homidoExport.js'
import { crearServidorExportaciones } from '../../scripts/servir-homido-dev.mjs'
import { cargarDatos } from '../public/prueba-homido/js/datos.js'
import { audioDe } from '../public/audio/narration.js'
import { cargarRespaldoPublicado } from '../public/prueba-homido/js/respaldo-publicado.js'
import { listarLibros } from '../src/services/librosDemoService.js'
const legacy=JSON.parse(await fs.readFile(new URL('../public/prueba-homido/data/recorridos-demo.json',import.meta.url)))
async function entorno(t){
  const raiz=await fs.mkdtemp(join(tmpdir(),'astrovisor-lector-'))
  const o={directorio:join(raiz,'datos'),destino:join(raiz,'exportados'),credenciales:join(raiz,'identidad','admin.json')}
  await inicializarCatalogo({directorio:o.directorio});await exportarHomido(o)
  const server=await crearServidorExportaciones(o);server.listen(0,'127.0.0.1');await once(server,'listening')
  t.after(async()=>{await new Promise(r=>server.close(r));await fs.rm(raiz,{recursive:true,force:true})})
  return {...o,base:`http://127.0.0.1:${server.address().port}`}
}
test('sin API: fija revisión pública, verifica JSON/SVG/audio y usa bytes verificados sin mezclar fuentes',async t=>{
  const o=await entorno(t)
  const r=await cargarDatos({urlApi:o.base+'/api-caida',urlExportacion:o.base+'/ultima.json',urlRespaldo:o.base+'/historico-ausente'})
  assert.equal(r.fuente,'publicado');assert.equal(r.revision,1);assert.ok(r.fecha)
  assert.match(r.aviso,/copia publicada/i)
  const audio=audioDe(r.datos[0]);assert.ok(audio.src.startsWith('blob:'))
  assert.ok(r.libros.every(l=>l.portadaIlustrativa.startsWith('blob:')))
  assert.equal((await fetch(audio.src)).status,200)
  assert.equal(audioDe({multimedia:[{...audio}]}),null,'un blob no registrado no se acepta desde JSON arbitrario')
  r.liberar();await assert.rejects(fetch(audio.src))
})

test('API 503: ficha 2D anuncia la misma revisión publicada y libera sus portadas',async t=>{
  const o=await entorno(t), real=globalThis.fetch
  t.mock.method(globalThis,'fetch',(url,opts)=>url==='/api/contenidos/libros'?Promise.resolve(new Response('',{status:503})):real(typeof url==='string'&&url.startsWith('http://localhost/respaldo-homido/')?o.base+new URL(url).pathname.slice('/respaldo-homido'.length):url,opts))
  let carga
  const libros=await listarLibros('escorpio',{alUsarRespaldo:r=>{carga=r}})
  assert.equal(libros.length,3);assert.equal(carga.revision,1);assert.match(carga.aviso,/desactualizada/)
  assert.equal((await real(libros[0].portadaIlustrativa)).status,200)
  carga.liberar();await assert.rejects(real(libros[0].portadaIlustrativa))
})

test('lector fija manifiesto una sola vez, rechaza hashes/rutas arbitrarias y respeta cancelación',async t=>{
  const o=await entorno(t), peticiones=[]
  const fn=(url,opts)=>{peticiones.push(url);return fetch(url,opts)}
  const r=await cargarRespaldoPublicado({fetchFn:fn,urlExportacion:o.base+'/ultima.json'})
  assert.equal(peticiones.filter(u=>u.endsWith('/ultima.json')).length,1)
  assert.ok(peticiones.slice(1).every(u=>u.includes('/revisiones/1/')));r.liberar()
  for(const alterar of [p=>({...p,sha256:'0'.repeat(64)}),p=>({...p,manifiesto:'../identidad/admin.json'})]){
    const mal=async(url,opts)=>url.endsWith('/ultima.json')?new Response(JSON.stringify(alterar(await (await fetch(url,opts)).json()))):fetch(url,opts)
    await assert.rejects(cargarRespaldoPublicado({fetchFn:mal,urlExportacion:o.base+'/ultima.json'}))
  }
  const control=new AbortController();control.abort()
  await assert.rejects(cargarRespaldoPublicado({signal:control.signal,urlExportacion:o.base+'/ultima.json'}))
})

test('Atrás con BFCache conserva recursos; salida definitiva los revoca',async t=>{
  const o=await entorno(t), real=globalThis.fetch, ventana=new EventTarget()
  const anterior=globalThis.window;globalThis.window=ventana
  t.after(()=>{if(anterior===undefined)delete globalThis.window;else globalThis.window=anterior})
  t.mock.method(globalThis,'fetch',(url,opts)=>url==='/api/contenidos/recorridos'?Promise.resolve(new Response('',{status:503})):real(typeof url==='string'&&url.startsWith('http://localhost/respaldo-homido/')?o.base+new URL(url).pathname.slice('/respaldo-homido'.length):url,opts))
  const {cargarDatosCompartidos}=await import('../public/prueba-homido/js/datos.js?bfcache')
  const r=await cargarDatosCompartidos(), src=r.libros[0].portadaIlustrativa
  const evento=new Event('pagehide');Object.defineProperty(evento,'persisted',{value:true});ventana.dispatchEvent(evento)
  assert.equal(await cargarDatosCompartidos(),r);assert.equal((await real(src)).status,200)
  const salida=new Event('pagehide');Object.defineProperty(salida,'persisted',{value:false});ventana.dispatchEvent(salida)
  await assert.rejects(real(src))
})
test('archivo corrupto/incompleto rechaza todo el paquete y diferencia histórico sin revisión; ausencia total falla',async t=>{
  const o=await entorno(t)
  await fs.writeFile(join(o.destino,'revisiones','1','portadas','star-lore.svg'),'alterado')
  const fn=(url,opts)=>url.endsWith('/historico')?Promise.resolve(new Response(JSON.stringify(legacy))):fetch(url,opts)
  const r=await cargarDatos({fetchFn:fn,urlApi:o.base+'/api-caida',urlExportacion:o.base+'/ultima.json',urlRespaldo:o.base+'/historico'})
  assert.equal(r.fuente,'local');assert.equal(r.revision,null);assert.match(r.aviso,/no se afirma/)
  await assert.rejects(cargarDatos({urlApi:o.base+'/api-caida',urlExportacion:o.base+'/ultima.json',urlRespaldo:o.base+'/sin-historico'}))
})
