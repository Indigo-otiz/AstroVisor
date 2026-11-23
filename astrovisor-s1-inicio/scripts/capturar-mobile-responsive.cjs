const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const pausa = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const perfil = await fs.mkdtemp(path.join(os.tmpdir(), 'astrovisor-mobile-'));
  const salidaDir = 'C:\\Users\\aneao\\.gemini\\antigravity\\brain\\5bcac432-61df-4746-983b-96cb5f2aee5c\\capturas';
  const chromePath = path.join(process.env.ProgramFiles, 'Google/Chrome/Application/chrome.exe');
  
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--mute-audio',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=0',
    `--user-data-dir=${perfil}`,
    'about:blank',
  ], { stdio: 'ignore', windowsHide: true });

  let socket;
  try {
    let puerto;
    for (let i = 0; i < 50; i++) {
      try {
        puerto = (await fs.readFile(path.join(perfil, 'DevToolsActivePort'), 'utf8')).split('\n')[0];
        break;
      } catch {
        await pausa(100);
      }
    }
    if (!puerto) throw new Error('Chrome no pudo iniciar DevToolsActivePort');

    const paginas = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
    const debuggerUrl = paginas.find(p => p.type === 'page').webSocketDebuggerUrl;
    socket = new WebSocket(debuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });

    let id = 1;
    function send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const curId = id++;
        const handler = (event) => {
          const data = JSON.parse(event.data);
          if (data.id === curId) {
            socket.removeEventListener('message', handler);
            if (data.error) reject(data.error);
            else resolve(data.result);
          }
        };
        socket.addEventListener('message', handler);
        socket.send(JSON.stringify({ id: curId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');

    async function setDeviceMetrics(width, height, mobile = true) {
      await send('Emulation.setDeviceMetricsOverride', {
        width,
        height,
        deviceScaleFactor: 2,
        mobile,
        screenOrientation: {
          angle: width > height ? 90 : 0,
          type: width > height ? 'landscapePrimary' : 'portraitPrimary',
        }
      });
      await send('Emulation.setTouchEmulationEnabled', { enabled: mobile });
    }

    async function navegar(url, esperaMs = 1500) {
      await send('Page.navigate', { url });
      await pausa(esperaMs);
    }

    async function capturar(nombre) {
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      await fs.writeFile(path.join(salidaDir, nombre), Buffer.from(data, 'base64'));
      console.log(`Guardada captura: ${nombre}`);
    }

    // 1. Mobile Portrait: 390 x 844 (iPhone 13/14)
    await setDeviceMetrics(390, 844, true);

    console.log('1. Portada móvil portrait...');
    await navegar('http://localhost:5174/', 1800);
    await capturar('mobile-home-portrait.png');

    console.log('2. Footer institucional logos móvil portrait...');
    await send('Runtime.evaluate', { expression: 'window.scrollTo(0, document.body.scrollHeight);' });
    await pausa(500);
    await capturar('mobile-footer-logos-portrait.png');

    console.log('3. Modal VR abierto en móvil portrait...');
    await send('Runtime.evaluate', {
      expression: `
        window.scrollTo(0, 0);
        const btn = document.getElementById('btnVRExperiencia');
        if (btn) btn.click();
      `
    });
    await pausa(600);
    await capturar('mobile-modal-vr-portrait.png');

    console.log('4. Experiencia Homido VR con indicador de giro en portrait...');
    await navegar('http://localhost:5174/prueba-homido/index.html?modo=homido', 2500);
    await capturar('mobile-homido-rotate-indicator.png');

    console.log('5. Experiencia Visor 3D con indicador de giro en portrait...');
    await navegar('http://localhost:5174/visor-3d', 3000);
    await capturar('mobile-visor3d-rotate-indicator.png');

    // 6. Mobile Landscape: 844 x 390
    await setDeviceMetrics(844, 390, true);

    console.log('6. Portada móvil landscape...');
    await navegar('http://localhost:5174/', 1800);
    await capturar('mobile-home-landscape.png');

    console.log('7. Modal VR abierto en móvil landscape...');
    await send('Runtime.evaluate', {
      expression: `
        const btn = document.getElementById('btnVRExperiencia');
        if (btn) btn.click();
      `
    });
    await pausa(600);
    await capturar('mobile-modal-vr-landscape.png');

    console.log('8. Experiencia Homido VR en landscape (indicador oculto)...');
    await navegar('http://localhost:5174/prueba-homido/index.html?modo=homido', 2500);
    await capturar('mobile-homido-landscape-clean.png');

    console.log('Completado con éxito');
  } finally {
    if (socket) socket.close();
    chrome.kill('SIGTERM');
    try {
      await fs.rm(perfil, { recursive: true, force: true });
    } catch {}
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
