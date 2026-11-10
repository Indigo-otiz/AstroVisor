// Captura real de navegador. La pista de voz se reconstruye de los WAV S3
// con los tiempos de playing/pause observados; no graba micrófono ni sistema.
const {chromium}=require('playwright')
const fs=require('node:fs/promises'),path=require('node:path')
const {spawnSync}=require('node:child_process')
const root=path.resolve(__dirname,'..'),out=path.join(root,'docs/evidencias/s4')
const base='http://127.0.0.1:5194',tmp=path.join(root,'.qa/video')
const delay=ms=>new Promise(r=>setTimeout(r,ms))
const report={fechaUTC:new Date().toISOString(),metodo:'Video de frames reales de Chrome con Playwright; voz editada de WAV originales S3 alineada a eventos de reproducción. Sin captura de hardware, micrófono o audio del sistema.',secuencia:[],audio:[]}
let browser,context,cerrar
async function paso(nombre){report.secuencia.push({nombre,t:Date.now()-report.inicio});console.log(nombre)}
function wavPCM(samples,rate){const b=Buffer.alloc(44+samples.length*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(samples.length*2,40);for(let i=0;i<samples.length;i++)b.writeInt16LE(Math.max(-32768,Math.min(32767,samples[i])),44+i*2);return b}
;(async()=>{
 await fs.mkdir(tmp,{recursive:true});await fs.mkdir(out,{recursive:true});cerrar=await require('./servidor-pruebas-s4.cjs')()
 browser=await chromium.launch({executablePath:process.env.S4_CHROME||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--enable-unsafe-swiftshader']})
 report.navegador=await browser.version()
 context=await browser.newContext({viewport:{width:1280,height:900},recordVideo:{dir:tmp,size:{width:1280,height:900}},reducedMotion:'reduce'})
 await context.exposeFunction('__registrarAudioS4',e=>report.audio.push(e))
 await context.addInitScript(()=>{
  const Original=window.Audio
  window.Audio=function(...args){const m=new Original(...args);for(const event of ['playing','pause','ended','emptied'])m.addEventListener(event,()=>window.__registrarAudioS4({event,src:m.currentSrc||m.src,posicion:m.currentTime,t:Date.now()}));return m}
 })
 report.inicio=Date.now();const page=await context.newPage();page.setDefaultTimeout(15000)
 await page.goto(base);await page.locator('.public-home').waitFor();await paso('Inicio público y contenido de demostración');await delay(1500)
 await page.getByRole('button',{name:'Vista para proyección',exact:true}).click();await page.locator('.presentation-shell').waitFor();await paso('Activar vista para proyección');await delay(1500)
 await page.getByRole('link',{name:'Explorar constelaciones',exact:true}).click();await page.locator('.constellation-grid').waitFor();await paso('Listado de las tres constelaciones');await delay(1500)
 for(const titulo of ['Orión','Osa Mayor','Escorpio']){
  await page.getByRole('link',{name:`Leer la historia de ${titulo}`}).click();await page.locator('.detail-reading').waitFor()
  await page.locator('.detail-heading').scrollIntoViewIfNeeded();await paso(`Leer ${titulo}`);await delay(1500)
  await page.getByRole('button',{name:'Escuchar',exact:true}).click();await page.getByRole('button',{name:'Pausar',exact:true}).waitFor();await paso(`Narración ${titulo}`)
  if(titulo==='Orión'){
   await delay(3000);await page.getByRole('button',{name:'Pausar',exact:true}).click();await paso('Pausar y conservar posición');await delay(1500)
   await page.getByRole('button',{name:'Reanudar',exact:true}).click();await paso('Reanudar Orión')
  }
  await page.waitForFunction(()=>document.querySelector('.narracion-estado')?.textContent.includes('finalizada'),null,{timeout:35000})
  await page.locator('summary').click();await paso(`Transcripción y créditos ${titulo}`);await delay(1500)
  await page.getByRole('link',{name:'Explorar otra constelación'}).click();await page.locator('.constellation-grid').waitFor();await delay(800)
 }
 await page.getByRole('link',{name:'Homido',exact:true}).click();await paso('Preparación Homido y ruta 2D');await delay(1500)
 await page.getByRole('link',{name:'Abrir historias en el visor'}).click();await page.waitForFunction(()=>window.AFRAME&&document.querySelector('a-scene')?.hasLoaded,null,{timeout:40000})
 await page.locator('#activateAudio:not([disabled])').click();await delay(500)
 await page.locator('#storyChoices button').filter({hasText:'Orión'}).click()
 await page.locator('#sceneHost').scrollIntoViewIfNeeded();await paso('Escena 3D y ficha de Orión en escritorio, sin visor físico');await delay(2500)
 // Controles HTML equivalentes al mismo controlador 3D: no se simula sensor ni mirada.
 await page.locator('#listenStory').click();await paso('Escuchar en la experiencia del visor');await delay(2500)
 await page.locator('#listenStory').click();await paso('Pausar en visor');await delay(1200)
 await page.locator('#listenStory').click();await paso('Reanudar en visor');await delay(2000)
 await page.locator('#sceneHost').scrollIntoViewIfNeeded();await delay(1500)
 await page.locator('#closeStory').click();await paso('Cerrar ficha y detener sonido')
 await page.locator('#stereoButton:not([disabled])').click();await paso('Vista dividida experimental en escritorio');await delay(3000)
 await page.keyboard.press('Escape');await delay(500)
 await page.getByRole('link',{name:'Regresar al modo web 2D'}).click();await page.locator('.constellation-grid').waitFor();await paso('Regreso al recorrido web 2D');await delay(2000)
 const video=page.video();report.fin=Date.now();await context.close();context=null
 await video.saveAs(path.join(tmp,'recorrido-real-sin-pista.webm'))
 // PCM mono para la edición: un segmento por playing hasta pause/ended/emptied.
 const duracion=(report.fin-report.inicio)/1000+1,rate=24000,samples=new Int32Array(Math.ceil(duracion*rate));const fuentes=new Map()
 for(let i=0;i<report.audio.length;i++){
  const e=report.audio[i];if(e.event!=='playing'||!e.src.endsWith('.wav'))continue
  let end=report.audio.slice(i+1).find(x=>x.event!=='playing')?.t??report.fin
  const filename=path.basename(new URL(e.src).pathname)
  if(!fuentes.has(filename))fuentes.set(filename,await fs.readFile(path.join(root,'frontend/public/audio',filename)))
  const b=fuentes.get(filename);let data=12,bytes=0
  while(data+8<=b.length){const n=b.readUInt32LE(data+4);if(b.toString('ascii',data,data+4)==='data'){bytes=n;data+=8;break}data+=8+n+(n%2)}
  const inicio=Math.max(0,Math.round((e.t-report.inicio)/1000*rate)),offset=Math.round(e.posicion*rate),n=Math.max(0,Math.min(Math.round((end-e.t)/1000*rate),bytes/2-offset,samples.length-inicio))
  for(let j=0;j<n;j++)samples[inicio+j]+=b.readInt16LE(data+(offset+j)*2)
 }
 await fs.writeFile(path.join(tmp,'voz-editada.wav'),wavPCM(samples,rate))
 report.duracionPlaneada=duracion;await fs.writeFile(path.join(out,'grabacion.json'),JSON.stringify(report,null,2)+'\n')
 console.log('CAPTURA COMPLETA; codificando WebM audiovisual con MediaRecorder')
 const mux=await browser.newPage({viewport:{width:1280,height:900}})
 await mux.goto(base)
 const raw=await fs.readFile(path.join(tmp,'recorrido-real-sin-pista.webm')),audio=await fs.readFile(path.join(tmp,'voz-editada.wav'))
 await mux.evaluate(async({v,a})=>{
  function blob(s,type){const b=atob(s);return new Blob([Uint8Array.from(b,c=>c.charCodeAt(0))],{type})}
  const video=document.createElement('video');video.src=URL.createObjectURL(blob(v,'video/webm'));video.playsInline=true;video.controls=true;document.body.replaceChildren(video)
  await new Promise((r,j)=>{video.onloadeddata=r;video.onerror=j})
  const ac=new AudioContext({sampleRate:48000});await ac.resume();const decoded=await ac.decodeAudioData(await blob(a,'audio/wav').arrayBuffer())
  const dest=ac.createMediaStreamDestination(),src=ac.createBufferSource();src.buffer=decoded;src.connect(dest)
  await video.play();video.pause();video.currentTime=0
  const stream=new MediaStream([...video.captureStream().getVideoTracks(),...dest.stream.getAudioTracks()])
  const rec=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8,opus',videoBitsPerSecond:1400000,audioBitsPerSecond:96000}),parts=[]
  rec.ondataavailable=e=>{if(e.data.size)parts.push(e.data)}
  window.__s4done=new Promise((r,j)=>{rec.onstop=async()=>{const data=new Uint8Array(await new Blob(parts,{type:'video/webm'}).arrayBuffer());let str='';for(let i=0;i<data.length;i+=32768)str+=String.fromCharCode(...data.subarray(i,i+32768));r(btoa(str))};rec.onerror=j})
  video.onended=()=>{src.stop();rec.stop()};rec.start(1000);await video.play();src.start()
 },{v:raw.toString('base64'),a:audio.toString('base64')})
 const final=await mux.evaluate(()=>window.__s4done)
 await fs.writeFile(path.join(out,'astrovisor-respaldo-s4.webm'),Buffer.from(final,'base64'))
 // Añadir índice y duración sin recodificar las pistas capturadas.
 const ffmpeg=process.env.S4_FFMPEG||path.join(root,'.qa/browsers/ffmpeg-1011/ffmpeg-win64.exe')
 const indexado=path.join(tmp,'respaldo-indexado.webm')
 const remux=spawnSync(ffmpeg,['-hide_banner','-i',path.join(out,'astrovisor-respaldo-s4.webm'),'-map','0','-c','copy','-y',indexado],{windowsHide:true,encoding:'utf8'})
 if(remux.status!==0)throw new Error('No se pudo indexar el video: '+(remux.error?.message||remux.stderr))
 await fs.copyFile(indexado,path.join(out,'astrovisor-respaldo-s4.webm'))
 report.codificacion='WebM VP8 + Opus, indexado con FFmpeg sin recodificar';report.completo=true
 await fs.writeFile(path.join(out,'grabacion.json'),JSON.stringify(report,null,2)+'\n')
 console.log('VIDEO GUARDADO')
})().catch(async e=>{report.error=e.stack;await fs.mkdir(out,{recursive:true});await fs.writeFile(path.join(out,'grabacion.json'),JSON.stringify(report,null,2)+'\n');console.error(e);process.exitCode=1})
 .finally(async()=>{await context?.close();await browser?.close();await cerrar?.()})
