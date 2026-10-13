// Smoke real en Chrome mediante CDP, sin agregar un framework de pruebas.
// Requiere npm run dev en otra terminal. Los artefactos se guardan en test-results.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const base = 'http://127.0.0.1:5173';
assert.equal((await fetch(`${base}/api/health`)).status, 200, 'Proxy /api/health');
const catalog = await (await fetch(`${base}/api/planets`)).json();
assert.ok(catalog.length >= 3, 'Catálogo recibido por proxy');
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
assert.ok(existsSync(chromePath), 'Configura CHROME_PATH si Chrome está instalado en otra ruta');
const output = resolve('test-results');
mkdirSync(output, {recursive: true});
const child = spawn(chromePath, ['--headless=new', '--no-first-run', '--no-default-browser-check',
  '--remote-debugging-port=9223', `--user-data-dir=${resolve(output, `chrome-${Date.now()}`)}`,
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], {windowsHide:true, stdio:'ignore'});
let socket;
try {
  let tabs;
  for (let i=0; i<80; i++) {
    try { tabs = await (await fetch('http://127.0.0.1:9223/json')).json(); if(tabs.some(t=>t.type==='page')) break; } catch {}
    await delay(100);
  }
  assert.ok(tabs, 'Chrome debe ofrecer su protocolo de depuración');
  const tab = tabs.find(t=>t.type==='page');
  socket = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((yes,no)=>{socket.addEventListener('open',yes,{once:true});socket.addEventListener('error',no,{once:true});});
  let sequence=0;
  const pending = new Map();
  const exceptions=[];
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    if(message.method==='Runtime.exceptionThrown') exceptions.push(message.params.exceptionDetails.text);
    if(message.id && pending.has(message.id)) {
      const {yes,no,timer}=pending.get(message.id); clearTimeout(timer); pending.delete(message.id);
      message.error ? no(new Error(JSON.stringify(message.error))) : yes(message.result);
    }
  });
  const send=(method,params={})=>new Promise((yes,no)=>{
    const id=++sequence;
    const timer=setTimeout(()=>{pending.delete(id);no(new Error(`CDP timeout: ${method}`));},15000);
    pending.set(id,{yes,no,timer}); socket.send(JSON.stringify({id,method,params}));
  });
  const evaluate=async expression=>{
    const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const waitFor=async expression=>{
    for(let i=0;i<100;i++){if(await evaluate(expression)) return; await delay(100);}
    throw new Error(`No se cumplió: ${expression}`);
  };
  const screenshot=async name=>{
    const capture=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
    writeFileSync(resolve(output,name),Buffer.from(capture.data,'base64'));
  };
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1080,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:base});
  await waitFor("document.querySelector('.planet-details h2')?.textContent === 'Tierra'");
  await waitFor("document.querySelector('canvas')?.width > 0 && !document.querySelector('.scene-error')");
  await delay(500);
  await screenshot('desktop.png');
  await evaluate("[...document.querySelectorAll('.planet-selector button')].find(b=>b.textContent==='Marte').click()");
  await waitFor("document.querySelector('.planet-details h2')?.textContent === 'Marte' && document.querySelector('canvas')?.getAttribute('aria-label')?.includes('Marte')");
  assert.equal(await evaluate("document.querySelectorAll('canvas').length"),1,'Un solo canvas después de seleccionar');
  await evaluate("document.querySelector('[aria-label=Acercar]').click(); document.querySelector('[aria-label=Alejar]').click(); [...document.querySelectorAll('.scene-controls button')].find(b=>b.textContent==='Girar').click(); [...document.querySelectorAll('.scene-controls button')].find(b=>b.textContent==='Auto rotación').click()");
  assert.equal(await evaluate("!![...document.querySelectorAll('.scene-controls button')].find(b=>b.textContent==='Pausar' && b.getAttribute('aria-pressed')==='true')"),true);
  await evaluate("[...document.querySelectorAll('.scene-controls button')].find(b=>b.textContent==='Pausar').click(); [...document.querySelectorAll('.scene-controls button')].find(b=>b.textContent==='Restablecer').click()");
  for(let i=0;i<9;i++) {
    await evaluate(`[...document.querySelectorAll('.planet-selector button')][${i%3}].click()`);
    await delay(80);
    assert.equal(await evaluate("document.querySelectorAll('canvas').length"),1);
  }
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await delay(300);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'),true,'Móvil sin desbordamiento horizontal');
  assert.equal(await evaluate("document.querySelector('.planet-details').getBoundingClientRect().top >= document.querySelector('.visual-side').getBoundingClientRect().bottom - 1"),true,'Ficha debajo de escena');
  await screenshot('mobile.png');
  await send('Emulation.setDeviceMetricsOverride',{width:320,height:720,deviceScaleFactor:1,mobile:true});
  await delay(200);
  assert.equal(await evaluate('document.documentElement.scrollWidth <= window.innerWidth'),true,'Móvil de 320px sin desbordamiento');
  await screenshot('mobile-small.png');
  await send('Network.setBlockedURLs',{urls:['*://127.0.0.1:5173/api/planets*']});
  await send('Page.reload');
  await waitFor("!!document.querySelector('.status-panel[role=alert]')");
  await screenshot('api-error.png');
  await send('Network.setBlockedURLs',{urls:[]});
  await evaluate("document.querySelector('.status-panel button').click()");
  await waitFor("document.querySelector('.planet-details h2')?.textContent === 'Tierra'");
  assert.deepEqual(exceptions,[],'Sin excepciones JavaScript en el navegador');
  console.log('Smoke OK: proxy, WebGL, selección, controles, 9 cambios, móvil 390/320px, fallo de petición y reintento.');
  console.log('Capturas: test-results/desktop.png, mobile.png, api-error.png');
  await send('Browser.close');
} finally { socket?.close(); if(child.exitCode===null) child.kill(); }
