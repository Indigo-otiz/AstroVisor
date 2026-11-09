import { createServer } from 'node:http'
import { readFile, realpath, lstat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { directorioExportacion } from '../backend/src/services/homidoExport.js'
export async function crearServidorExportaciones(opciones={}) {
  const raiz=await directorioExportacion(opciones)
  return createServer(async(req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff')
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return}
    try{
      const nombre=decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)
      if(!/^(ultima\.json|revisiones\/[1-9][0-9]*\/(manifiesto\.json|recorridos-demo\.json|libros\.json|portadas\/[a-z0-9-]+\.svg|audio\/[a-z0-9-]+\.(wav|mp3|ogg|m4a)))$/.test(nombre))throw new Error()
      const archivo=join(raiz,nombre),s=await lstat(archivo)
      if(!s.isFile()||s.isSymbolicLink()||s.nlink!==1||await realpath(archivo)!==archivo)throw new Error()
      const tipo=nombre.endsWith('.svg')?'image/svg+xml':nombre.endsWith('.wav')?'audio/wav':nombre.endsWith('.mp3')?'audio/mpeg':nombre.endsWith('.ogg')?'audio/ogg':nombre.endsWith('.m4a')?'audio/mp4':'application/json'
      res.setHeader('Content-Type',tipo);res.setHeader('Cache-Control',nombre==='ultima.json'?'no-store':'no-cache')
      res.setHeader('Content-Security-Policy',"default-src 'none'; sandbox")
      const b=await readFile(archivo);res.setHeader('Content-Length',b.length);res.writeHead(200);res.end(req.method==='HEAD'?undefined:b)
    }catch{res.writeHead(404);res.end('Recurso público no disponible')}
  })
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
  if(typeof process.loadEnvFile==='function')try{process.loadEnvFile()}catch{}
  try{if(process.argv.length!==2)throw new Error();const puerto=Number(process.env.ASTROVISOR_EXPORT_PORT??3002);if(!Number.isInteger(puerto)||puerto<1||puerto>65535)throw new Error();const s=await crearServidorExportaciones();s.listen(puerto,'127.0.0.1',()=>console.log(`Respaldo público de desarrollo: http://127.0.0.1:${puerto}`));for(const sig of ['SIGINT','SIGTERM'])process.once(sig,()=>s.close(()=>process.exit(0)))}catch{console.error('No se pudo servir el directorio público configurado. Revisa las rutas separadas y el puerto local.');process.exitCode=1}
}
