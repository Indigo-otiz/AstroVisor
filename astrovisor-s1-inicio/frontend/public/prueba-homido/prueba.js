/* AstroVisor — experimento independiente, no experiencia VR definitiva. */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const logEl = $('log');
  const logs = [];
  const eventLine = (message) => {
    const stamp = new Date().toLocaleTimeString('es-MX', { hour12: false });
    logs.push(`[${stamp}] ${message}`);
    logEl.textContent = logs.join('\n');
    logEl.scrollTop = logEl.scrollHeight;
  };
  const browserInfo = `${navigator.userAgent}`;
  eventLine(`Prueba iniciada | ${new Date().toISOString()}`);
  eventLine(`Navegador: ${browserInfo}`);
  eventLine(`Contexto seguro: ${window.isSecureContext ? 'sí' : 'no'}`);
  eventLine(`Modo de entrada: ${'ontouchstart' in window ? 'pantalla táctil disponible' : 'mouse/teclado'}`);

  const permissionButton = $('permissionButton');
  const stereoButton = $('stereoButton');
  const exitButton = $('exitButton');
  const scene = $('testScene');
  const host = $('sceneHost');
  const status = $('orientationStatus');
  const stereoStatus = $('stereoStatus');
  const selectionStatus = $('selectionStatus');
  const angles = $('angles');
  let orientationEvents = 0;
  let lastUpdate = 0;
  let lastSample;
  let fusingAt = 0;
  let selectionCount = 0;
  let stereoActive = false;
  let stereoComponent;

  const listenOrientation = (event) => {
    if ([event.alpha, event.beta, event.gamma].every(v => v == null)) return;
    orientationEvents++;
    const now = Date.now();
    if (now - lastUpdate > 400) {
      lastUpdate = now;
      const fmt = (v) => typeof v === 'number' ? v.toFixed(1) + '°' : 'no disponible';
      angles.textContent = `Orientación recibida: α ${fmt(event.alpha)} · β ${fmt(event.beta)} · γ ${fmt(event.gamma)}`;
      status.textContent = `Sensores: recibidos ${orientationEvents} eventos de orientación. Verifica también que la cámara siga el movimiento.`;
    }
    if (orientationEvents === 1) eventLine('Se recibió el primer evento de orientación con datos.');
    if (lastSample && orientationEvents > 2 && Math.abs((event.beta ?? 0) - (lastSample.beta ?? 0)) > 8) {
      if (!window.__astroOrientationVariationLogged) {
        window.__astroOrientationVariationLogged = true;
        eventLine('Se detectó variación de ángulo beta durante la sesión (no confirma movimiento de cámara).');
      }
    }
    lastSample = { beta: event.beta };
  };
  window.addEventListener('deviceorientation', listenOrientation);
  if (!window.isSecureContext) {
    status.textContent = 'Sensores: la página no está en HTTPS (o localhost). El navegador podría bloquearlos.';
    eventLine('ADVERTENCIA: contexto no seguro; probar en HTTPS para diagnóstico físico.');
  }

  permissionButton.addEventListener('click', () => {
    // Mantener requestPermission dentro del gesto del usuario: iOS lo requiere.
    if (!window.DeviceOrientationEvent) {
      status.textContent = 'Sensores: API DeviceOrientationEvent no disponible.';
      eventLine('La API DeviceOrientationEvent no está disponible.');
      return;
    }
    if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
      window.DeviceOrientationEvent.requestPermission().then((result) => {
        eventLine(`Permiso de orientación: ${result}`);
        status.textContent = result === 'granted'
          ? 'Permiso concedido. Mueve el teléfono y observa si cambian los ángulos y la cámara.'
          : 'Permiso denegado. Utiliza los controles táctiles o el modo web 2D.';
      }).catch((error) => {
        status.textContent = 'No se pudo solicitar el permiso. Prueba HTTPS y revisa la configuración del navegador.';
        eventLine(`Error al solicitar permiso: ${error.name || 'Error'} — ${error.message || ''}`);
      });
    } else {
      status.textContent = 'Este navegador no expone una solicitud de permiso; comprueba si aparecen datos al mover el teléfono.';
      eventLine('No existe requestPermission; esperando eventos de orientación si el dispositivo los proporciona.');
    }
  });

  // La versión moderna de A-Frame no proporciona de forma garantizada Cardboard.
  // Este componente experimental superpone una representación por ojo al final del frame.
  if (!window.AFRAME) {
    stereoStatus.textContent = 'A-Frame no pudo cargarse. Revisa la conexión a Internet.';
    eventLine('ERROR: no se pudo cargar A-Frame 1.8.0.');
    return;
  }
  AFRAME.registerComponent('experimental-stereo', {
    init() {
      this.stereoCamera = new AFRAME.THREE.StereoCamera();
      this.stereoCamera.eyeSep = 0.064; // separación entre ojos ilustrativa, no calibración del visor
      this.enabledStereo = false;
      stereoComponent = this;
    },
    tock() {
      if (!this.enabledStereo || !this.el.renderer || !this.el.camera) return;
      const renderer = this.el.renderer;
      // No modificar el modo XR de A-Frame. Este experimento es vista dividida WebGL.
      if (renderer.xr && renderer.xr.isPresenting) return;
      const size = renderer.getDrawingBufferSize(new AFRAME.THREE.Vector2());
      const fullWidth = size.x, fullHeight = size.y;
      const half = Math.floor(fullWidth / 2);
      const camera = this.el.camera;
      camera.updateWorldMatrix(true, false);
      this.stereoCamera.update(camera);
      renderer.setScissorTest(true);
      renderer.setViewport(0, 0, half, fullHeight);
      renderer.setScissor(0, 0, half, fullHeight);
      renderer.clear(true, true, true);
      renderer.render(this.el.object3D, this.stereoCamera.cameraL);
      renderer.setViewport(half, 0, fullWidth - half, fullHeight);
      renderer.setScissor(half, 0, fullWidth - half, fullHeight);
      renderer.clear(true, true, true);
      renderer.render(this.el.object3D, this.stereoCamera.cameraR);
      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, fullWidth, fullHeight);
    },
  });

  // Registrar el componente después de A-Frame y antes de habilitar vista dividida.
  scene.setAttribute('experimental-stereo', '');

  const target = $('target');
  target.addEventListener('mouseenter', () => { fusingAt = performance.now(); });
  target.addEventListener('mouseleave', () => { fusingAt = 0; });
  target.addEventListener('click', () => {
    selectionCount++;
    const duration = fusingAt ? Math.round(performance.now() - fusingAt) : 0;
    const likelyGaze = duration >= 1500;
    target.setAttribute('color', selectionCount % 2 ? '#62bda1' : '#e59b3d');
    const mechanism = likelyGaze ? 'tiempo de enfoque compatible con selección por mirada' : 'selección activada; confirmar si fue por toque/mouse';
    selectionStatus.textContent = `Selecciones: ${selectionCount}. Última: ${mechanism}.`;
    eventLine(`Selección #${selectionCount} | foco ${duration} ms | ${mechanism}`);
  });
  function onSceneReady() {
    if (!stereoComponent) stereoComponent = scene.components['experimental-stereo'];
    stereoButton.disabled = !stereoComponent;
    eventLine('Escena A-Frame cargada en la página.');
    stereoStatus.textContent = stereoComponent
      ? 'Escena cargada. La vista dividida puede probarse por separado.'
      : 'Escena cargada, pero el componente estereoscópico no se inició.';
  }
  if (scene.hasLoaded) onSceneReady();
  else scene.addEventListener('loaded', onSceneReady, { once: true });
  scene.addEventListener('renderstart', () => eventLine('A-Frame comenzó el renderizado.'));

  async function exitStereo() {
    if (!stereoActive) return;
    stereoActive = false;
    if (stereoComponent) stereoComponent.enabledStereo = false;
    host.classList.remove('stereo-active');
    document.body.classList.remove('stereo-mode');
    exitButton.hidden = true;
    stereoButton.disabled = false;
    stereoStatus.textContent = 'Vista dividida desactivada. Continúa en modo 2D.';
    eventLine('Vista dividida finalizada.');
    // A-Frame ajusta canvas al contenedor al redimensionar.
    window.dispatchEvent(new Event('resize'));
  }
  stereoButton.addEventListener('click', () => {
    if (!stereoComponent || !scene.hasLoaded) return;
    stereoActive = true;
    stereoComponent.enabledStereo = true;
    host.classList.add('stereo-active');
    document.body.classList.add('stereo-mode');
    exitButton.hidden = false;
    stereoButton.disabled = true;
    stereoStatus.textContent = 'Vista dividida ACTIVADA: verifica dos imágenes y comodidad en el visor físico.';
    eventLine('Vista dividida activada (render experimental; aún sin validar ópticamente).');
    eventLine('Vista dividida en pantalla expandida por CSS; gira el teléfono a horizontal.');
    window.dispatchEvent(new Event('resize'));
  });
  exitButton.addEventListener('click', exitStereo);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') exitStereo(); });
  $('copyButton').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(logs.join('\n')); eventLine('Registro copiado al portapapeles.'); }
    catch { eventLine('No se pudo copiar automáticamente; selecciona el texto del registro.'); }
  });
  $('clearButton').addEventListener('click', () => { logs.length = 0; logEl.textContent = ''; eventLine('Registro reiniciado.'); });
})();
