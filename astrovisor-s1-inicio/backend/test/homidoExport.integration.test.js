import test from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomBytes, createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { inicializarCatalogo, obtenerCatalogo } from '../src/services/documentRepository.js'
import { crearConfiguracionAdmin } from '../src/services/adminCredentials.js'
import { exportarHomido } from '../src/services/homidoExport.js'

test('HTTP: guardado confirmado, exportación fallida, recuperación sin PATCH, reinicio y estático independiente', { timeout: 30000 }, async t => {
  const raiz=await fs.mkdtemp(join(tmpdir(),'astrovisor-4b-http-'))
  const o={directorio:join(raiz,'datos'),destino:join(raiz,'publico'),credenciales:join(raiz,'identidad','admin.json')}
  await inicializarCatalogo(o);await fs.mkdir(join(raiz,'identidad'))
  const password=randomBytes(24).toString('hex')
  await fs.writeFile(o.credenciales,JSON.stringify(await crearConfiguracionAdmin('prueba-export','Prueba aislada',password)),{mode:0o600})
  const env={...process.env,ASTROVISOR_DATA_DIR:o.directorio,ASTROVISOR_ADMIN_FILE:o.credenciales,ASTROVISOR_PUBLIC_EXPORT_DIR:o.destino}
  const hijos=[]
  t.after(async()=>{for(const c of hijos)if(c.exitCode===null){const fin=once(c,'exit');c.send('cerrar');await fin}await fs.rm(raiz,{recursive:true,force:true})})
  async function iniciar(estatico=false){
    const modulo=new URL(estatico?'../../scripts/servir-homido-dev.mjs':'../src/index.js',import.meta.url).href
    const script=estatico?`import{crearServidorExportaciones}from ${JSON.stringify(modulo)};const s=await crearServidorExportaciones();s.listen(0,'127.0.0.1',()=>process.send(s.address().port));process.once('message',()=>s.close(()=>process.exit(0)));`
      :`import{crearApp}from ${JSON.stringify(modulo)};const a=crearApp();await a.locals.iniciarEscritor();const s=a.listen(0,'127.0.0.1',()=>process.send(s.address().port));process.once('message',()=>s.close(async()=>{await a.locals.cerrarEscritor();process.exit(0)}));`
    const c=spawn(process.execPath,['--input-type=module','-e',script],{env,stdio:['ignore','pipe','pipe','ipc']});hijos.push(c)
    const [puerto]=await once(c,'message');return {c,base:`http://127.0.0.1:${puerto}`}
  }
  await exportarHomido(o)
  let api=await iniciar();const estatico=await iniciar(true)
  const pedir=(ruta,opts)=>fetch(api.base+ruta,opts)
  const login=await pedir('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({usuario:'prueba-export',contrasena:password})})
  assert.equal(login.status,200);const token=(await login.json()).token
  const headers={Authorization:`Bearer ${token}`}
  const admin=await pedir('/api/admin/catalogo',{headers});const c=await admin.json()
  assert.equal(c.publicacionHomido.respaldoPublico,'publicado')
  const guardado=await pedir('/api/admin/recorridos/orion',{method:'PATCH',headers:{...headers,'Content-Type':'application/json','If-Match':admin.headers.get('etag')},body:JSON.stringify({resumen:'Resumen temporal confirmado antes de exportar.'})})
  assert.equal(guardado.status,200);const resultado=await guardado.json()
  assert.equal(resultado.revision,2);assert.equal(resultado.respaldoPublico,'pendiente');assert.equal(resultado.revisionPublicada,1)
  assert.equal((await (await pedir('/api/contenidos/recorridos')).json())[0].resumen,'Resumen temporal confirmado antes de exportar.')
  await assert.rejects(exportarHomido({...o,io:{...fs,rename:async()=>{throw Object.assign(new Error('fallo controlado'),{code:'EIO'})}}}))
  assert.equal((await obtenerCatalogo(o)).revision,2)
  assert.equal((await (await fetch(estatico.base+'/ultima.json')).json()).revision,1)
  const pendiente=await (await pedir('/api/admin/catalogo',{headers})).json()
  assert.equal(pendiente.revision,2)
  assert.deepEqual(pendiente.publicacionHomido,{respaldoPublico:'pendiente',revisionPublicada:1})
  const fin=once(api.c,'exit');api.c.send('cerrar');await fin
  assert.equal((await exportarHomido(o)).revision,2,'se recupera sin repetir PATCH')
  const p=await (await fetch(estatico.base+'/ultima.json')).json()
  assert.equal(p.revision,2)
  const manifiesto=await (await fetch(estatico.base+'/'+p.manifiesto)).json()
  for(const f of manifiesto.archivos){const r=await fetch(`${estatico.base}/revisiones/2/${f.ruta}`);assert.equal(r.status,200);const bytes=Buffer.from(await r.arrayBuffer());assert.equal(bytes.length,f.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256);assert.equal(r.headers.get('x-content-type-options'),'nosniff')}
  for(const ruta of ['/catalogo.json','/backups/copia.json','/exportador.lock','/revisiones/2/../catalogo.json'])assert.equal((await fetch(estatico.base+ruta)).status,404)
  api=await iniciar();assert.equal((await (await pedir('/api/contenidos/recorridos')).json())[0].revisionCatalogo,2)
  const sesion=await pedir('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({usuario:'prueba-export',contrasena:password})})
  const nuevoToken=(await sesion.json()).token
  const publicado=await (await pedir('/api/admin/catalogo',{headers:{Authorization:`Bearer ${nuevoToken}`}})).json()
  assert.equal(publicado.revision,2)
  assert.deepEqual(publicado.publicacionHomido,{respaldoPublico:'publicado',revisionPublicada:2})
  // Una publicación dañada nunca se anuncia como íntegra desde el panel.
  await fs.unlink(join(o.destino,'revisiones','2','audio','orion-kokoro-v1.wav'))
  const estado=await (await pedir('/api/admin/catalogo',{headers:{Authorization:`Bearer ${nuevoToken}`}})).json()
  assert.equal(estado.publicacionHomido.respaldoPublico,'pendiente');assert.equal(estado.publicacionHomido.estadoPublicacionNoVerificado,true)
})
