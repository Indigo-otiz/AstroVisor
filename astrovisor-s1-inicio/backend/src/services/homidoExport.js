import * as fs from 'node:fs/promises'
import { join, dirname, basename, resolve, relative, isAbsolute, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { randomUUID, createHash } from 'node:crypto'
import { hostname } from 'node:os'
import { obtenerCatalogo } from './documentRepository.js'
import { proyectarRecorridos, proyectarLibros } from './catalogo.js'
import { generarPortada } from './portadas.js'
import { rutaPrivada } from './privateStorage.js'
import { leerImagen, directorioImagenes } from './imageResources.js'
import { validarPuntero, validarManifiesto, validarReferenciasPaquete } from '../../../frontend/public/prueba-homido/js/paquete-publico.js'

const publico = fileURLToPath(new URL('../../../frontend/public/', import.meta.url))
const hash = b => createHash('sha256').update(b).digest('hex')
const json = x => Buffer.from(JSON.stringify(x, null, 2)+'\n')
const fallo = mensaje => new Error(mensaje)
const dentro = (a,b) => { const r=relative(a,b); return r==='' || (!isAbsolute(r) && r!=='..' && !r.startsWith('..'+sep)) }
async function realFuturo(p) {
  try { return await fs.realpath(p) } catch(e) { if(e.code!=='ENOENT'||dirname(p)===p)throw e; return join(await realFuturo(dirname(p)),basename(p)) }
}
export async function directorioExportacion({ destino=process.env.ASTROVISOR_PUBLIC_EXPORT_DIR, directorio=process.env.ASTROVISOR_DATA_DIR, credenciales=process.env.ASTROVISOR_ADMIN_FILE }={}) {
  if(typeof credenciales!=='string'||!isAbsolute(credenciales))throw fallo('Configura ASTROVISOR_ADMIN_FILE absoluto en un directorio privado separado')
  const salida=await rutaPrivada(destino), datos=await rutaPrivada(directorio), identidad=await rutaPrivada(dirname(credenciales))
  const real=await realFuturo(salida), control=await realFuturo(join(dirname(salida),'.'+basename(salida)+'-control'))
  for(const privada of [datos,identidad]) {
    const p=await realFuturo(privada)
    if([real,control].some(r=>dentro(p,r)||dentro(r,p)))throw fallo('Exportaciones y directorios privados deben estar separados')
  }
  if(process.env.ASTROVISOR_COVERS_DIR)await directorioImagenes({directorio,credenciales,destino})
  return salida
}
async function regular(p,io) {
  const s=await io.lstat(p)
  if(!s.isFile()||s.isSymbolicLink()||s.nlink!==1)throw fallo('Archivo público no regular')
}
async function directorioReal(p,io) { const s=await io.lstat(p); if(!s.isDirectory()||s.isSymbolicLink())throw fallo('Directorio no permitido') }
async function leerRegular(p,io) { await regular(p,io); return io.readFile(p) }
async function escribir(p,b,io) { const h=await io.open(p,'wx',0o644);try{await h.writeFile(b);await h.sync()}finally{await h.close()} }
async function syncDir(p,io) {
  let h
  try { h=await io.open(p,'r');await h.sync();return true }
  catch(e){if(process.platform==='win32'&&['EPERM','EISDIR','EINVAL','ENOTSUP'].includes(e.code))return false;throw e}
  finally{await h?.close()}
}
async function leerPuntero(raiz,io) {
  try{return validarPuntero(JSON.parse(await leerRegular(join(raiz,'ultima.json'),io)))}catch(e){if(e.code==='ENOENT')return null;throw e}
}
export async function verificarPaquete(dir,{io=fs}={}) {
  await directorioReal(dir,io)
  const manifiesto=validarManifiesto(JSON.parse(await leerRegular(join(dir,'manifiesto.json'),io)))
  const contenido=new Map()
  for(const f of manifiesto.archivos) {
    if(f.ruta.includes('/'))await directorioReal(join(dir,f.ruta.split('/')[0]),io)
    const b=await leerRegular(join(dir,f.ruta),io)
    if(b.length!==f.bytes||hash(b)!==f.sha256)throw fallo('Integridad de paquete inválida')
    contenido.set(f.ruta,b)
  }
  const entradas=await io.readdir(dir,{recursive:true,withFileTypes:true})
  const esperados=new Set(['manifiesto.json',...manifiesto.archivos.map(f=>f.ruta)])
  for(const e of entradas) {
    if(e.isSymbolicLink())throw fallo('Enlace no permitido en paquete')
    if(e.isFile()&&!esperados.has(relative(dir,join(e.parentPath,e.name)).split(sep).join('/')))throw fallo('Archivo no declarado en paquete')
  }
  const recorridos=JSON.parse(contenido.get(manifiesto.datos)),libros=JSON.parse(contenido.get(manifiesto.libros))
  validarReferenciasPaquete(recorridos,libros,manifiesto)
  return {manifiesto,recorridos,libros}
}
const svgPermitidos=new Set(['star-lore','field-stars','half-hours'].map(id=>`/libros-demo/${id}.svg`))
const audiosPermitidos=new Set(['orion','osa-mayor','escorpio'].map(id=>`/audio/${id}-kokoro-v1.wav`))
async function preparar(c,io) {
  const archivos=new Map(),recorridos=proyectarRecorridos(c),libros=proyectarLibros(c)
  const copiar=async src=>{
    const ruta=join(publico,src.slice(1))
    if(await io.realpath(ruta)!==ruta)throw fallo('Activo enlazado no permitido')
    return leerRegular(ruta,io)
  }
  for(const l of c.libros) {
    let bytes
    if(l.portada?.tipo==='imagen-autorizada')bytes=await leerImagen(l.portada)
    else if(l.portada?.plantilla)bytes=Buffer.from(generarPortada(l))
    else {if(!svgPermitidos.has(l.portadaIlustrativa))throw fallo('Portada estática no autorizada');bytes=await copiar(l.portadaIlustrativa)}
    archivos.set(`portadas/${l.id}.${l.portada?.tipo==='imagen-autorizada'?(l.portada.formato==='png'?'png':'jpg'):'svg'}`,bytes)
  }
  for(const r of recorridos) {
    for(const l of r.libros){const ficha=c.libros.find(x=>x.id===l.libroId);l.portada={...l.portada,src:`portadas/${l.libroId}.${ficha.portada?.tipo==='imagen-autorizada'?(ficha.portada.formato==='png'?'png':'jpg'):'svg'}`}}
    for(const a of r.multimedia) {
      if(!audiosPermitidos.has(a.src))throw fallo('Audio no autorizado para exportación')
      const ruta='audio/'+basename(a.src)
      if(!archivos.has(ruta))archivos.set(ruta,await copiar(a.src))
      a.src=ruta
    }
  }
  for(const l of libros){const ficha=c.libros.find(x=>x.id===l.id);l.portadaIlustrativa=`portadas/${l.id}.${ficha.portada?.tipo==='imagen-autorizada'?(ficha.portada.formato==='png'?'png':'jpg'):'svg'}`}
  archivos.set('recorridos-demo.json',json(recorridos));archivos.set('libros.json',json(libros))
  return archivos
}
export async function exportarHomido({ directorio=process.env.ASTROVISOR_DATA_DIR,destino=process.env.ASTROVISOR_PUBLIC_EXPORT_DIR,credenciales=process.env.ASTROVISOR_ADMIN_FILE,io=fs }={}) {
  const raiz=await directorioExportacion({directorio,destino,credenciales})
  await io.mkdir(raiz,{recursive:true});await directorioReal(raiz,io)
  const control=join(dirname(raiz),'.'+basename(raiz)+'-control')
  await io.mkdir(control,{recursive:true,mode:0o700});await directorioReal(control,io)
  const lock=join(control,'exportador.lock'),nonce=randomUUID()
  try{await escribir(lock,json({pid:process.pid,host:hostname(),nonce}),io)}catch{throw fallo('Exportación ocupada o bloqueo pendiente; no se retira automáticamente')}
  let staging,temporal,confirmada=false,resultado,error,limpiezaPendiente=false,durabilidadPendiente=false
  try {
    const c=await obtenerCatalogo({directorio}),n=c.revision
    const anterior=await leerPuntero(raiz,io)
    if(anterior?.revision>n)throw fallo('No se permite retroceder el puntero de publicación')
    const archivos=await preparar(c,io)
    const revisiones=join(raiz,'revisiones');await io.mkdir(revisiones,{recursive:true});await directorioReal(revisiones,io)
    const dir=join(revisiones,String(n))
    let m
    try {
      const p=await verificarPaquete(dir,{io});m=p.manifiesto
      if(m.revision!==n||m.archivos.length!==archivos.size||m.archivos.some(f=>!archivos.has(f.ruta)||hash(archivos.get(f.ruta))!==f.sha256))throw fallo('Revisión existente distinta; no se sobrescribe')
    }catch(e){if(e.code!=='ENOENT')throw e;try{await io.lstat(dir);throw fallo('Paquete existente incompleto; requiere intervención')}catch(x){if(x.code!=='ENOENT')throw x}}
    if(!m) {
      staging=join(control,'staging-'+nonce);await io.mkdir(staging)
      for(const d of ['portadas','audio'])await io.mkdir(join(staging,d))
      for(const [ruta,b] of archivos){await io.mkdir(dirname(join(staging,ruta)),{recursive:true});await escribir(join(staging,ruta),b,io)}
      m={schemaVersion:1,revision:n,fecha:new Date().toISOString(),datos:'recorridos-demo.json',libros:'libros.json',archivos:[...archivos].map(([ruta,b])=>({ruta,sha256:hash(b),bytes:b.length}))}
      await escribir(join(staging,'manifiesto.json'),json(m),io)
      await verificarPaquete(staging,{io})
      for(const d of ['portadas','audio',''])if(!await syncDir(join(staging,d),io))durabilidadPendiente=true
      await io.rename(staging,dir);staging=null
      if(!await syncDir(revisiones,io))durabilidadPendiente=true
    }
    const manifiestoBytes=await leerRegular(join(dir,'manifiesto.json'),io)
    if(anterior?.revision===n) {
      if(anterior.sha256!==hash(manifiestoBytes))throw fallo('Puntero y manifiesto no coinciden')
      confirmada=true;resultado={revision:n,yaPublicada:true}
    } else {
      temporal=join(control,'ultima-'+nonce+'.tmp')
      await escribir(temporal,json({schemaVersion:1,revision:n,manifiesto:`revisiones/${n}/manifiesto.json`,sha256:hash(manifiestoBytes)}),io)
      await io.rename(temporal,join(raiz,'ultima.json'));temporal=null;confirmada=true;resultado={revision:n,yaPublicada:false}
      try{if(!await syncDir(raiz,io))durabilidadPendiente=true}catch{durabilidadPendiente=true}
    }
  }catch(e){error=e}
  finally {
    if(staging)try{if(!dentro(control,staging)||staging===control)throw fallo('Limpieza fuera de control');await directorioReal(staging,io);await io.rm(staging,{recursive:true,force:true})}catch{limpiezaPendiente=true}
    if(temporal)try{await io.unlink(temporal)}catch{limpiezaPendiente=true}
    try{if(JSON.parse(await leerRegular(lock,io)).nonce!==nonce)throw fallo('Bloqueo ajeno');await io.unlink(lock)}catch{limpiezaPendiente=true}
  }
  if(error){error.confirmada=false;error.limpiezaPendiente=limpiezaPendiente;throw error}
  return {...resultado,confirmada,limpiezaPendiente,durabilidadPendiente}
}

export async function estadoPublicacion(revision) {
  if(!process.env.ASTROVISOR_PUBLIC_EXPORT_DIR)return {respaldoPublico:'pendiente',revisionPublicada:null}
  const consulta=(async()=>{
    const raiz=await directorioExportacion(),p=await leerPuntero(raiz,fs)
    if(!p)return {respaldoPublico:'pendiente',revisionPublicada:null}
    const b=await leerRegular(join(raiz,p.manifiesto),fs)
    if(hash(b)!==p.sha256||validarManifiesto(JSON.parse(b)).revision!==p.revision)throw fallo('Estado no verificable')
    await verificarPaquete(dirname(join(raiz,p.manifiesto)))
    return {respaldoPublico:p.revision===revision?'publicado':'pendiente',revisionPublicada:p.revision}
  })()
  let timer
  try{return await Promise.race([consulta,new Promise((_,reject)=>{timer=setTimeout(()=>reject(fallo('Timeout')),500)})])}
  catch{return {respaldoPublico:'pendiente',revisionPublicada:null,estadoPublicacionNoVerificado:true}}
  finally{clearTimeout(timer)}
}
