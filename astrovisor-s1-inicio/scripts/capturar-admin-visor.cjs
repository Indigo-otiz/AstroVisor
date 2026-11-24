const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');

const pausa = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const perfil = await fs.mkdtemp(path.join(os.tmpdir(), 'astrovisor-captura-admin-'));
  const salidaDir = 'C:\\Users\\aneao\\.gemini\\antigravity\\brain\\5bcac432-61df-4746-983b-96cb5f2aee5c\\capturas';
  await fs.mkdir(salidaDir, { recursive: true });
  const chromePath = path.join(process.env.ProgramFiles, 'Google/Chrome/Application/chrome.exe');
  
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--mute-audio',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=0',
    '--window-size=1280,900',
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

    await send('Page.addScriptToEvaluateOnNewDocument', {
      source: `
        const origFetch = window.fetch;
        window.fetch = function(url, options) {
          if (typeof url === 'string' && url.includes('/api/admin/login')) {
            return Promise.resolve(new Response(JSON.stringify({
              ok: true,
              token: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              usuario: { id: '73b54746-6a61-4127-9734-f9da0747bda5', usuario: 'Indigo', nombre: 'Indigo' }
            }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
          }
          if (typeof url === 'string' && url.includes('/api/admin/sesion')) {
            return Promise.resolve(new Response(JSON.stringify({
              ok: true,
              admin: { id: '73b54746-6a61-4127-9734-f9da0747bda5', usuario: 'Indigo', nombre: 'Indigo' }
            }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
          }
          return origFetch.apply(this, arguments);
        };
      `
    });

    async function navegar(url, esperaMs = 1500) {
      await send('Page.navigate', { url });
      await pausa(esperaMs);
    }

    async function capturar(nombre) {
      const { data } = await send('Page.captureScreenshot', { format: 'png' });
      await fs.writeFile(path.join(salidaDir, nombre), Buffer.from(data, 'base64'));
      console.log(`Guardada captura: ${nombre}`);
    }

    // 1. VisorView con textos concisos de instrucciones y seguridad
    console.log('Navegando a /visor...');
    await navegar('http://localhost:5173/visor', 2500);
    // Scroll hacia las tarjetas de instrucciones
    await send('Runtime.evaluate', {
      expression: `window.scrollTo(0, 650);`
    });
    await pausa(800);
    await capturar('visor-instrucciones-concisas.png');

    // 2. Acceso Administrativo y Login
    console.log('Navegando a /admin/acceso...');
    await navegar('http://localhost:5173/admin/acceso', 1500);
    // Escribir credenciales y login
    await send('Runtime.evaluate', {
      expression: `
        const u = document.getElementById('admin-user');
        const c = document.getElementById('admin-password');
        const form = document.querySelector('form.auth-form');
        if (u && c && form) {
          u.value = 'Indigo';
          u.dispatchEvent(new Event('input', { bubbles: true }));
          c.value = 'cualquier-clave';
          c.dispatchEvent(new Event('input', { bubbles: true }));
          const btn = form.querySelector('button[type="submit"]') || form.querySelector('.btn-submit');
          if (btn) btn.click();
          else form.dispatchEvent(new Event('submit', { bubbles: true }));
        }
      `
    });
    await pausa(2500);

    // 3. Admin Panel - Vista inicial con subnav pegajoso
    console.log('Capturando panel admin con barra rápida...');
    await capturar('admin-panel-subnav.png');

    // 4. Admin Panel - Scroll abajo para ver botón flotante "Subir"
    console.log('Haciendo scroll en admin...');
    await send('Runtime.evaluate', {
      expression: `window.scrollTo({ top: 800, behavior: 'instant' });`
    });
    await pausa(600);
    await capturar('admin-panel-scroll-flotante.png');

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
