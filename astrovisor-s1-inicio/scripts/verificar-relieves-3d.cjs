// Build servido + Chrome real; sin dependencias de automatización adicionales.
// Ejecutar después de npm run build: node scripts/verificar-relieves-3d.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const servir = require('./servidor-pruebas-s4.cjs');
const pausa = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const cerrar = await servir();
  const perfil = await fs.mkdtemp(path.join(os.tmpdir(), 'astrovisor-relieves-'));
  const salida = path.resolve(__dirname, '../docs/evidencias-relieves-3d');
  const chrome = spawn(path.join(process.env.ProgramFiles, 'Google/Chrome/Application/chrome.exe'), [
    '--headless=new', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0',
    '--enable-unsafe-swiftshader', '--disable-background-media-suspend', `--user-data-dir=${perfil}`, 'about:blank',
  ], { stdio: 'ignore', windowsHide: true });
  let socket;
  try {
    let puerto;
    for (let i = 0; i < 100; i++) {
      try { puerto = (await fs.readFile(path.join(perfil, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; }
      catch { await pausa(100); }
    }
    assert.ok(puerto, 'Chrome debe iniciar');
    const paginas = await (await fetch(`http://127.0.0.1:${puerto}/json/list`)).json();
    socket = new WebSocket(paginas.find(p => p.type === 'page').webSocketDebuggerUrl);
    await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
    let id = 0;
    const pendientes = new Map();
    const errores = [];
    socket.onmessage = ({ data }) => {
      const mensaje = JSON.parse(data);
      if (mensaje.method === 'Runtime.exceptionThrown') errores.push(mensaje.params.exceptionDetails);
      const promesa = pendientes.get(mensaje.id);
      if (promesa) {
        pendientes.delete(mensaje.id);
        clearTimeout(promesa.timer);
        mensaje.error ? promesa.reject(new Error(JSON.stringify(mensaje.error))) : promesa.resolve(mensaje.result);
      }
    };
    const enviar = (method, params = {}) => new Promise((resolve, reject) => {
      const numero = ++id;
      const timer = setTimeout(() => { pendientes.delete(numero); reject(new Error(`Timeout: ${method}`)); }, 15000);
      pendientes.set(numero, { resolve, reject, timer });
      socket.send(JSON.stringify({ id: numero, method, params }));
    });
    const evaluar = async (funcion, ...args) => {
      const r = await enviar('Runtime.evaluate', {
        expression: `(${funcion})(${args.map(a => JSON.stringify(a)).join(',')})`,
        returnByValue: true, awaitPromise: true, userGesture: true,
      });
      if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails));
      return r.result.value;
    };
    const esperar = async funcion => {
      for (let i = 0; i < 100; i++) { if (await evaluar(funcion)) return; await pausa(100); }
      throw new Error('La escena no alcanzó el estado esperado');
    };
    await enviar('Runtime.enable');
    await enviar('Page.enable');
    await enviar('Emulation.setFocusEmulationEnabled', { enabled: true });
    await enviar('Page.addScriptToEvaluateOnNewDocument', { source: `
      window.__mediosRelieve = []; const AudioOriginal = window.Audio;
      window.Audio = function (...args) { const medio = new AudioOriginal(...args); window.__mediosRelieve.push(medio); return medio; };
    ` });
    await fs.mkdir(salida, { recursive: true });
    const captura = async nombre => {
      await pausa(300);
      const r = await enviar('Page.captureScreenshot', { format: 'png' });
      await fs.writeFile(path.join(salida, `${nombre}.png`), Buffer.from(r.data, 'base64'));
    };
    const abrir = async (modo, ancho, alto) => {
      await enviar('Emulation.setDeviceMetricsOverride', { width: ancho, height: alto, deviceScaleFactor: 1, mobile: false });
      await enviar('Page.navigate', { url: `http://127.0.0.1:5194/prueba-homido/index.html?modo=${modo}` });
      await enviar('Page.bringToFront');
      await esperar(() => document.querySelectorAll('[relieve-institucional]').length === 2 &&
        [...document.querySelectorAll('[relieve-institucional]')].every(e => e.getObject3D('relieve')) &&
        document.querySelector('#constelaciones')?.children.length > 0 && !!window.astrovisorVisor);
    };
    const orientar = async (yaw, pitch) => evaluar((y, p) => {
      const controles = document.querySelector('#cameraRig').components['look-controls'];
      controles.yawObject.rotation.y = y;
      controles.pitchObject.rotation.x = p;
    }, yaw, pitch);

    await abrir('pantalla', 1440, 900);
    await captura('01-entrada-pantalla');
    const geometria = await evaluar(async () => {
      const THREE = AFRAME.THREE;
      const { crearRelieve, liberarRelieve } = await import('./js/logos-3d.js');
      const textura = new THREE.Texture();
      const grupo = crearRelieve(THREE, { width: 1, height: 1, layers: [{ color: '#ffffff', z: 0, depth: 0.1, shapes: [{
        outer: [[-0.5,-0.5],[0.5,-0.5],[0.5,0.5],[-0.5,0.5]],
        holes: [[[-0.2,-0.2],[-0.2,0.2],[0.2,0.2],[0.2,-0.2]]],
      }] }] }, textura);
      grupo.updateMatrixWorld(true);
      const caja = new THREE.Box3().setFromObject(grupo);
      const ray = new THREE.Raycaster(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1));
      const hueco = ray.intersectObject(grupo, true).length;
      ray.ray.origin.x = 0.4;
      const superficie = ray.intersectObject(grupo, true).length;
      let liberados = 0;
      const frenteTexturado = grupo.children[0].material[0].map === textura;
      textura.addEventListener('dispose', () => liberados++);
      grupo.children[0].geometry.addEventListener('dispose', () => liberados++);
      grupo.children[0].material.forEach(m => m.addEventListener('dispose', () => liberados++));
      liberarRelieve(grupo);
      return { profundidad: caja.max.z - caja.min.z, hueco, superficie, liberados, frenteTexturado };
    });
    assert.ok(Math.abs(geometria.profundidad - 0.1) < 1e-6);
    assert.equal(geometria.hueco, 0, 'Los huecos deben atravesar el relieve');
    assert.ok(geometria.superficie > 0);
    assert.equal(geometria.frenteTexturado, true, 'El frente debe conservar los colores de la fuente');
    assert.equal(geometria.liberados, 4);

    await orientar(Math.PI, 0.12);
    await captura('02-relieves-pantalla');
    await orientar(Math.PI - 0.42, 0.1);
    await captura('03-relieve-oblicuo');
    const recursos = await evaluar(() => [...document.querySelectorAll('[relieve-institucional]')].map(el => {
      const grupo = el.getObject3D('relieve');
      const caja = new AFRAME.THREE.Box3().setFromObject(grupo);
      return { id: el.id, capas: grupo.children.length,
        triangulos: grupo.children.reduce((n, m) => n + m.geometry.attributes.position.count / 3, 0),
        dimensiones: caja.getSize(new AFRAME.THREE.Vector3()).toArray() };
    }));
    assert.ok(recursos.every(r => r.triangulos > 0 && r.triangulos < 60000));

    // Fallo de carga real, retirada durante carga y liberación del componente.
    const ciclo = await evaluar(async () => {
      const scene = document.querySelector('a-scene');
      const fallo = document.createElement('a-entity');
      const error = new Promise(r => fallo.addEventListener('relieve-error', r, { once: true }));
      fallo.setAttribute('relieve-institucional', 'src: ./logos/no-existe.json');
      scene.append(fallo);
      await error;
      const falloAislado = !fallo.getObject3D('relieve') && !!scene.camera &&
        [...document.querySelectorAll('#institutionalLogos3D [relieve-institucional]')].every(e => e.getObject3D('relieve'));
      fallo.remove();
      const fetchOriginal = window.fetch;
      let resolver;
      window.fetch = (url, opciones) => url === './carga-retrasada' ? new Promise(r => { resolver = r; }) : fetchOriginal(url, opciones);
      const tardio = document.createElement('a-entity');
      const iniciado = new Promise(r => tardio.addEventListener('componentinitialized', e => {
        if (e.detail.name === 'relieve-institucional') r();
      }));
      tardio.setAttribute('relieve-institucional', 'src: ./carga-retrasada');
      scene.append(tardio);
      await iniciado;
      tardio.removeAttribute('relieve-institucional');
      window.fetch = fetchOriginal;
      resolver({ ok: true, json: async () => ({ layers: [] }) });
      await new Promise(r => setTimeout(r, 50));
      const cancelado = !tardio.getObject3D('relieve');
      tardio.remove();
      return { falloAislado, cancelado };
    });
    assert.deepEqual(ciclo, { falloAislado: true, cancelado: true });

    await evaluar(() => {
      const logos = document.querySelector('#institutionalLogos3D');
      window.__flujoRelieve = { antes: logos.object3D.matrixWorld.toArray(), estadosAudio: [] };
      window.__observarRelieve = e => window.__flujoRelieve.estadosAudio.push(e.detail.state);
      window.addEventListener('astrovisor:narracion', window.__observarRelieve);
      document.querySelector('#storyChoices button').click();
      window.__flujoRelieve.ficha = document.querySelector('#infoPanel3D').getAttribute('visible');
      document.querySelector('#activateAudio').click();
    });
    await pausa(300);
    await evaluar(() => document.querySelector('#listenStory').click());
    for (let i = 0; i < 50; i++) {
      if (await evaluar(() => window.__flujoRelieve.estadosAudio.includes('reproduciendo'))) break;
      await pausa(100);
    }
    const flujo = await evaluar(() => {
      const { antes, estadosAudio, ficha } = window.__flujoRelieve;
      const logos = document.querySelector('#institutionalLogos3D');
      document.querySelector('#listenStory').click();
      const pausada = estadosAudio.at(-1) === 'pausado';
      const medios = window.__mediosRelieve.map(m => ({ src: m.src, readyState: m.readyState,
        networkState: m.networkState, paused: m.paused, error: m.error?.code, tiempo: m.currentTime }));
      window.astrovisorVisor.cerrar();
      const cerrada = !document.querySelector('#infoPanel3D').getAttribute('visible');
      window.removeEventListener('astrovisor:narracion', window.__observarRelieve);
      return { ficha, cerrada, reprodujo: estadosAudio.includes('reproduciendo'), pausada, estadosAudio,
        mensajeAudio: document.querySelector('#storyAudioStatus').textContent, medios,
        fijos: JSON.stringify(antes) === JSON.stringify(logos.object3D.matrixWorld.toArray()) };
    });
    assert.ok(flujo.ficha && flujo.cerrada && flujo.reprodujo && flujo.pausada && flujo.fijos, JSON.stringify(flujo));

    await abrir('homido', 844, 390);
    await evaluar(() => document.querySelector('#vrOverlayBtn').click());
    await orientar(Math.PI, 0.12);
    await captura('04-relieves-estereo');
    const ojos = await evaluar(() => {
      const scene = document.querySelector('a-scene');
      const stereo = scene.components['experimental-stereo'];
      scene.camera.updateMatrixWorld(true);
      stereo.stereoCamera.update(scene.camera);
      return [stereo.stereoCamera.cameraL, stereo.stereoCamera.cameraR].map(camera =>
        [...document.querySelectorAll('#institutionalLogos3D [relieve-institucional]')].map(el => {
          const grupo = el.getObject3D('relieve');
          grupo.updateWorldMatrix(true, true);
          let maxX = 0, maxY = 0;
          grupo.traverse(mesh => {
            const puntos = mesh.geometry?.attributes.position;
            if (!puntos) return;
            for (let i = 0; i < puntos.count; i++) {
              const p = new AFRAME.THREE.Vector3().fromBufferAttribute(puntos, i).applyMatrix4(mesh.matrixWorld).project(camera);
              maxX = Math.max(maxX, Math.abs(p.x)); maxY = Math.max(maxY, Math.abs(p.y));
            }
          });
          return { id: el.id, maxX, maxY };
        }));
    });
    assert.ok(ojos.flat().every(o => o.maxX < 1 && o.maxY < 1), JSON.stringify(ojos));
    assert.equal(await evaluar(() => document.querySelector('a-scene').components['experimental-stereo'].enabledStereo), true);
    await evaluar(() => document.querySelector('#directExitBtn').click());
    await esperar(() => location.pathname === '/');
    assert.deepEqual(errores, []);
    const navegador = await enviar('Browser.getVersion');
    const informe = { geometria, recursos, ciclo, flujo, ojos, errores, salida: 'Inicio',
      fechaUTC: new Date().toISOString(), navegador: navegador.product,
      entorno: 'Chrome headless; pantalla y estéreo simulado; sin visor físico' };
    await fs.writeFile(path.join(salida, 'resultados.json'), JSON.stringify(informe, null, 2) + '\n');
    console.log(JSON.stringify(informe, null, 2));
  } finally {
    socket?.close();
    chrome.kill();
    await cerrar();
    // El perfil es temporal; Chrome puede conservar un bloqueo al cerrar en Windows.
    try { await fs.rm(perfil, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 }); } catch {}
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
