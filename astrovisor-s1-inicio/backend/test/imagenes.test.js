import test from 'node:test'
import assert from 'node:assert/strict'
import * as fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sharp from 'sharp'
import { prepararImagen, leerImagen, validarImagenes } from '../src/services/imageResources.js'

async function entorno(t) {
  const raiz = await fs.mkdtemp(join(tmpdir(), 'astrovisor-imagen-'))
  const keys = ['ASTROVISOR_COVERS_DIR','ASTROVISOR_DATA_DIR','ASTROVISOR_ADMIN_FILE','ASTROVISOR_PUBLIC_EXPORT_DIR']
  const anterior = Object.fromEntries(keys.map(k=>[k,process.env[k]]))
  Object.assign(process.env,{ASTROVISOR_COVERS_DIR:join(raiz,'imagenes'),ASTROVISOR_DATA_DIR:join(raiz,'datos'),ASTROVISOR_ADMIN_FILE:join(raiz,'identidad','admin.json'),ASTROVISOR_PUBLIC_EXPORT_DIR:join(raiz,'publico')})
  t.after(async()=>{for(const [k,v] of Object.entries(anterior)){if(v===undefined)delete process.env[k];else process.env[k]=v}await fs.rm(raiz,{recursive:true,force:true})})
  return raiz
}
for(const formato of ['png','jpeg']) test(`normaliza ${formato}, elimina metadatos y confirma recurso íntegro sin catálogo`,async t=>{
  await entorno(t)
  const entrada=await sharp({create:{width:80,height:120,channels:3,background:'#142a56'}}).withMetadata({exif:{IFD0:{Artist:'Dato privado de prueba'}}}).toFormat(formato).toBuffer()
  const r=await prepararImagen(entrada,'image/'+formato)
  assert.match(r.recursoId,/^[a-f0-9-]{36}$/); assert.equal(r.formato,formato)
  const bytes=await leerImagen(r),meta=await sharp(bytes).metadata()
  assert.equal(meta.width,80);assert.equal(meta.height,120);assert.equal(meta.exif,undefined);assert.equal(meta.icc,undefined)
  assert.equal(bytes.length,r.bytes);assert.notDeepEqual(bytes,entrada)
  await assert.rejects(fs.stat(join(process.env.ASTROVISOR_DATA_DIR,'catalogo.json')))
  await validarImagenes({libros:[{portada:{...r,tipo:'imagen-autorizada'}}]})
  await fs.writeFile(join(process.env.ASTROVISOR_COVERS_DIR,r.recursoId+(formato==='jpeg'?'.jpg':'.png')),'corrupto')
  await assert.rejects(leerImagen(r))
})
test('rechaza SVG/HTML, corrupción, MIME falso, exceso de bytes/píxeles/dimensiones y rutas privadas',async t=>{
  await entorno(t)
  const png=await sharp({create:{width:10,height:10,channels:3,background:'red'}}).png().toBuffer()
  for(const [bytes,mime] of [[Buffer.from('<svg/>'),'image/png'],[Buffer.from('<html/>'),'image/jpeg'],[png.subarray(0,40),'image/png'],[png,'image/jpeg'],[Buffer.alloc(2*1024*1024+1),'image/png']]) await assert.rejects(prepararImagen(bytes,mime))
  for(const [w,h] of [[4097,1],[3000,3000]]){
    const bytes=await sharp({create:{width:w,height:h,channels:3,background:'red'}}).png().toBuffer()
    await assert.rejects(prepararImagen(bytes,'image/png'))
  }
  await assert.rejects(leerImagen({recursoId:'../../secreto',formato:'png',sha256:'a'.repeat(64),bytes:1,ancho:1,alto:1}))
  process.env.ASTROVISOR_COVERS_DIR=process.env.ASTROVISOR_DATA_DIR
  await assert.rejects(prepararImagen(png,'image/png'))
})
test('archivo enlazado o recurso inexistente no puede asociarse',async t=>{
  await entorno(t)
  const bytes=await sharp({create:{width:10,height:10,channels:3,background:'red'}}).png().toBuffer(),r=await prepararImagen(bytes,'image/png')
  const p=join(process.env.ASTROVISOR_COVERS_DIR,r.recursoId+'.png')
  await fs.link(p,join(process.env.ASTROVISOR_COVERS_DIR,'otra-copia'))
  await assert.rejects(leerImagen(r));await fs.unlink(p);await assert.rejects(leerImagen(r))
})
test('un directorio de imágenes enlazado no recibe archivos ni se utiliza para leer',async t=>{
  const raiz=await entorno(t),real=join(raiz,'real'),enlace=join(raiz,'enlace')
  await fs.mkdir(real);await fs.symlink(real,enlace,process.platform==='win32'?'junction':'dir')
  process.env.ASTROVISOR_COVERS_DIR=enlace
  const bytes=await sharp({create:{width:10,height:10,channels:3,background:'blue'}}).png().toBuffer()
  await assert.rejects(prepararImagen(bytes,'image/png'))
  assert.deepEqual(await fs.readdir(real),[])
})
