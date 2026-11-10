// Reproducción completa de archivo local con navegador en modo sin conexión.
const {chromium}=require('playwright')
const fs=require('node:fs/promises'),path=require('node:path'),{pathToFileURL}=require('node:url'),{createHash}=require('node:crypto')
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/evidencias/s4'),file=path.join(out,'astrovisor-respaldo-s4.webm')
;(async()=>{
 const html=path.join(root,'.qa/video/reproducir-local.html')
 await fs.mkdir(path.dirname(html),{recursive:true})
 await fs.writeFile(html,`<!doctype html><html lang="es"><meta charset="utf-8"><title>Respaldo local S4</title><style>body{margin:0;background:#111;color:white;font:18px system-ui}video{display:block;width:100%;max-height:900px}button{font:inherit;padding:10px}</style><button id="inicio">Reproducir respaldo local</button><video controls src="${pathToFileURL(file).href}"></video></html>`)
 const b=await chromium.launch({executablePath:process.env.S4_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe'})
 try{
  const ctx=await b.newContext({viewport:{width:1280,height:950}});await ctx.setOffline(true);const page=await ctx.newPage()
  await page.goto(pathToFileURL(html).href)
  await page.waitForFunction(()=>document.querySelector('video').readyState>=2)
  // Analizar los bytes del archivo evita que la política de file:// silencie
  // un MediaElementAudioSourceNode. La reproducción conserva su audio nativo.
  const bytes=await fs.readFile(file)
  const analisisPista=await page.evaluate(async data=>{
   const ac=new AudioContext({sampleRate:48000}),buffer=await ac.decodeAudioData(Uint8Array.from(atob(data),c=>c.charCodeAt(0)).buffer)
   const values=buffer.getChannelData(0);let pico=0,power=0
   for(const x of values){pico=Math.max(pico,Math.abs(x));power+=x*x}
   await ac.close();return{duracion:buffer.duration,frecuencia:buffer.sampleRate,canales:buffer.numberOfChannels,pico,rms:Math.sqrt(power/values.length)}
  },bytes.toString('base64'))
  await page.evaluate(()=>{
   const v=document.querySelector('video')
   window.__s4fin=new Promise((resolve,reject)=>{
    v.onended=()=>resolve({duracion:v.duration,ancho:v.videoWidth,alto:v.videoHeight,sinConexion:!navigator.onLine,frames:v.getVideoPlaybackQuality().totalVideoFrames,bytesAudio:v.webkitAudioDecodedByteCount,error:v.error?.message||null})
    v.onerror=()=>reject(new Error(v.error?.message||'Fallo de video'))
    document.querySelector('#inicio').onclick=async()=>{try{await v.play()}catch(e){reject(e)}}
   })
  })
  await page.locator('#inicio').click();console.log('Reproduciendo archivo local completo sin conexión HTTP')
  const progreso=setInterval(async()=>{try{console.log(await page.evaluate(()=>({tiempo:document.querySelector('video').currentTime,pausado:document.querySelector('video').paused})))}catch{}},20000)
  let result
  try{result=await page.evaluate(()=>Promise.race([window.__s4fin,new Promise((_,j)=>setTimeout(()=>j(new Error('Tiempo máximo de reproducción superado')),150000))]))}finally{clearInterval(progreso)}
  console.log('Reproducción terminada',result)
  if(!result.sinConexion||analisisPista.rms<0.001||result.bytesAudio<=0||result.frames<100||!Number.isFinite(result.duracion))throw new Error(JSON.stringify({result,analisisPista}))
  const grabacion=JSON.parse(await fs.readFile(path.join(out,'grabacion.json'),'utf8'))
  for(const [nombre,t]of [['inicio',8],['3d',(grabacion.secuencia.find(x=>x.nombre.startsWith('Escena 3D'))?.t??90000)/1000+1],['final',Math.max(0,result.duracion-1)]]){
   await page.evaluate(async t=>{const v=document.querySelector('video');v.currentTime=t;await new Promise(r=>v.addEventListener('seeked',r,{once:true}))},t)
   await page.screenshot({path:path.join(out,`video-local-${nombre}.png`)})
  }
  const report={fechaUTC:new Date().toISOString(),navegador:await b.version(),archivo:path.basename(file),bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),metodo:'Archivo file:// local en Chrome con contexto offline desde antes de abrirlo; reproducción completa a velocidad 1 con salida nativa. Análisis independiente de PCM decodificado desde los bytes del mismo archivo; sin certificar escucha humana ni reproductor del equipo de proyección.',resultado:'correcto',analisisPista,...result}
  await fs.writeFile(path.join(out,'video-local.json'),JSON.stringify(report,null,2)+'\n');console.log(report)
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1})
