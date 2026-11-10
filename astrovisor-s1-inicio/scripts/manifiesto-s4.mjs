import {readFile,writeFile,readdir,stat} from 'node:fs/promises'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
import {resolve,relative,join,extname,basename} from 'node:path'
const root=fileURLToPath(new URL('../',import.meta.url)),out=resolve(root,'docs/evidencias/s4')
const archivos=['frontend/src/App.vue','frontend/src/public.css','.gitignore','docs/GUIA-S4-EXPO.md','docs/PRUEBA-S4.md','../entregables/Sprint 4_Luis Rodriguez.md','content/AUTORIA.md','content/recorridos.json',
 'scripts/verificar-s4.cjs','scripts/verificar-zoom-s4.cjs','scripts/servidor-pruebas-s4.cjs','scripts/grabar-s4.cjs','scripts/verificar-video-s4.cjs','scripts/manifiesto-s4.mjs',
 'frontend/public/audio/orion-kokoro-v1.wav','frontend/public/audio/osa-mayor-kokoro-v1.wav','frontend/public/audio/escorpio-kokoro-v1.wav','frontend/dist/index.html']
for(const name of await readdir(resolve(root,'frontend/dist/assets')))archivos.push('frontend/dist/assets/'+name)
for(const name of await readdir(out))if(name!=='version.json'&&(await stat(join(out,name))).isFile())archivos.push('docs/evidencias/s4/'+name)
const hashes=[]
for(const archivo of archivos){
 const original=await readFile(resolve(root,archivo))
 const texto=['.vue','.css','.md','.json','.txt','.cjs','.mjs','.js','.html'].includes(extname(archivo))||basename(archivo)==='.gitignore'
 const data=texto?Buffer.from(original.toString('utf8').replace(/^\uFEFF/,'').replace(/\r\n/g,'\n'),'utf8'):original
 hashes.push({archivo:archivo.replaceAll('\\','/'),bytes:data.length,normalizacion:texto?'UTF-8 sin BOM; LF':'Binario sin normalización',sha256:createHash('sha256').update(data).digest('hex')})
}
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true}).trim()
const fecha=new Date()
const report={fechaUTC:fecha.toISOString(),fechaLocal:new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Mexico_City',dateStyle:'short',timeStyle:'medium'}).format(fecha),zona:'America/Mexico_City',rama:git('branch','--show-current'),commitBase:git('rev-parse','HEAD'),cambiosSinCommit:true,
 alcance:'Implementación y verificación técnica local S4, incluido zoom nativo 200%. No certifica proyector, red del recinto, Homido físico S4, escucha humana, ensayo o Expo, ni revisión de otro integrante.',hashes}
await writeFile(resolve(out,'version.json'),JSON.stringify(report,null,2)+'\n')
console.log(`${hashes.length} archivos registrados en ${relative(root,resolve(out,'version.json'))}`)
