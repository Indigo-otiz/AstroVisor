import * as fs from 'node:fs/promises'
import { join, dirname, basename, relative, isAbsolute, sep } from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { rutaPrivada } from './privateStorage.js'

export const MAX_IMAGEN = 2 * 1024 * 1024
const maxPixeles = 8_000_000
const hash = b => createHash('sha256').update(b).digest('hex')
const fallo = (status = 400) => Object.assign(new Error(status === 400 ? 'Imagen o metadatos de portada inválidos' : 'Almacenamiento de imágenes no disponible'), { status })
const dentro = (a,b) => { const r=relative(a,b); return r==='' || (!isAbsolute(r)&&r!=='..'&&!r.startsWith('..'+sep)) }
let procesando = 0

export function descriptorValido(p) {
  return p && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(p.recursoId)
    && ['png','jpeg'].includes(p.formato) && /^[a-f0-9]{64}$/.test(p.sha256)
    && Number.isSafeInteger(p.bytes) && p.bytes > 0 && p.bytes <= MAX_IMAGEN
    && [p.ancho,p.alto].every(n=>Number.isSafeInteger(n)&&n>0&&n<=4096) && p.ancho*p.alto<=maxPixeles
}
async function realFuturo(p) {
  try{return await fs.realpath(p)}catch(e){if(e.code!=='ENOENT'||dirname(p)===p)throw e;return join(await realFuturo(dirname(p)),basename(p))}
}
export async function directorioImagenes({directorio=process.env.ASTROVISOR_DATA_DIR,credenciales=process.env.ASTROVISOR_ADMIN_FILE,destino=process.env.ASTROVISOR_PUBLIC_EXPORT_DIR}={}) {
  const ruta=await rutaPrivada(process.env.ASTROVISOR_COVERS_DIR),real=await realFuturo(ruta)
  const admin=credenciales
  if(typeof admin!=='string'||!isAbsolute(admin))throw fallo(503)
  const privadas=[await rutaPrivada(directorio),await rutaPrivada(dirname(admin))]
  if(destino){const p=await rutaPrivada(destino);privadas.push(p,join(dirname(p),'.'+basename(p)+'-control'))}
  for(const p of privadas){const r=await realFuturo(p);if(dentro(real,r)||dentro(r,real))throw fallo(503)}
  return ruta
}
export async function leerImagen(p) {
  if(!descriptorValido(p))throw fallo()
  try {
    const raiz=await directorioImagenes(),ruta=join(raiz,p.recursoId+(p.formato==='png'?'.png':'.jpg'))
    const dir=await fs.lstat(raiz),s=await fs.lstat(ruta)
    if(!dir.isDirectory()||dir.isSymbolicLink()||!s.isFile()||s.isSymbolicLink()||s.nlink!==1||s.size!==p.bytes||await fs.realpath(ruta)!==ruta)throw fallo(503)
    const b=await fs.readFile(ruta)
    if(hash(b)!==p.sha256)throw fallo(503)
    const m=await sharp(b,{limitInputPixels:maxPixeles,failOn:'warning'}).metadata()
    if(m.format!==p.formato||m.width!==p.ancho||m.height!==p.alto)throw fallo(503)
    return b
  }catch{throw fallo(503)}
}
export async function validarImagenes(catalogo) {
  for(const l of catalogo.libros)if(l.portada?.tipo==='imagen-autorizada')await leerImagen(l.portada)
}
export async function prepararImagen(entrada,mime) {
  if(!Buffer.isBuffer(entrada)||!entrada.length||entrada.length>MAX_IMAGEN)throw fallo()
  const formato=entrada.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))?'png':entrada[0]===255&&entrada[1]===216&&entrada[2]===255?'jpeg':null
  if(!formato||mime!=='image/'+formato)throw fallo()
  if(procesando>=2)throw fallo(503)
  procesando++
  let bytes,info
  try {
    const imagen=sharp(entrada,{limitInputPixels:maxPixeles,failOn:'warning',sequentialRead:true})
    const m=await imagen.metadata()
    if(m.format!==formato||!m.width||!m.height||m.width>4096||m.height>4096||(m.pages??1)!==1)throw fallo()
    // Reencode completo: no copiar EXIF/ICC/comentarios ni aceptar una cabecera sin decodificar píxeles.
    const normalizado=await imagen.rotate().toFormat(formato).toBuffer({resolveWithObject:true})
    bytes=normalizado.data;info=normalizado.info
    if(bytes.length>MAX_IMAGEN)throw fallo()
  }catch{throw fallo()}finally{procesando--}
  const recurso={recursoId:randomUUID(),formato,sha256:hash(bytes),bytes:bytes.length,ancho:info.width,alto:info.height}
  let temporal,confirmada=false
  try {
    const raiz=await directorioImagenes();await fs.mkdir(raiz,{recursive:true,mode:0o700});await directorioImagenes()
    if((await fs.lstat(raiz)).isSymbolicLink())throw fallo(503)
    const destino=join(raiz,recurso.recursoId+(formato==='png'?'.png':'.jpg'))
    temporal=join(raiz,randomUUID()+'.tmp');const h=await fs.open(temporal,'wx',0o600)
    try{await h.writeFile(bytes);await h.sync()}finally{await h.close()}
    await fs.link(temporal,destino);confirmada=true
    // Retirar el temporal antes de verificar nlink=1. Si falla, conservar recurso y comunicar intervención.
    await fs.unlink(temporal);temporal=null
    await leerImagen(recurso)
    return recurso
  }catch{throw Object.assign(fallo(503),{recursoPreparado:confirmada})}
  finally{if(temporal)await fs.unlink(temporal).catch(()=>{})}
}
