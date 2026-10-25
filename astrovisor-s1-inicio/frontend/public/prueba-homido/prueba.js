/* AstroVisor — Sprint 2: Selección por mirada y retroalimentación accesible (Karime) */
(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const logEl = $('log');
  const logs = [];
  const eventLine = (message) => {
    const stamp = new Date().toLocaleTimeString('es-MX', { hour12: false });
    logs.push(`[${stamp}] ${message}`);
    if (logEl) {
      logEl.textContent = logs.join('\n');
      logEl.scrollTop = logEl.scrollHeight;
    }
  };

  const browserInfo = `${navigator.userAgent}`;
  eventLine(`Prueba iniciada | Sprint 2: Selección por mirada (Karime) | ${new Date().toISOString()}`);
  eventLine(`Navegador: ${browserInfo}`);
  eventLine(`Contexto seguro: ${window.isSecureContext ? 'sí' : 'no'}`);
  eventLine(`Modo de entrada: ${'ontouchstart' in window ? 'pantalla táctil disponible' : 'mouse/teclado'}`);

  const permissionButton = $('permissionButton');
  const stereoButton = $('stereoButton');
  const exitButton = $('exitButton');
  const pauseButton = $('pauseButton');
  const scene = $('testScene');
  const host = $('sceneHost');
  const status = $('orientationStatus');
  const stereoStatus = $('stereoStatus');
  const selectionStatus = $('selectionStatus');
  const angles = $('angles');
  const target = $('target');
  const progressRing = $('progressRing');
  const centerDot = $('centerDot');

  let orientationEvents = 0;
  let lastUpdate = 0;
  let lastSample;
  let selectionCount = 0;
  let stereoActive = false;
  let stereoComponent;
  let isPaused = false;

  // Parámetros de permanencia (Sprint 2 - Karime: 3 segundos sin prisa)
  const DWELL_TIME_MS = 3000;
  let gazeStartTime = null;
  let gazeRaf = null;
  let currentStage = '0%';
  let isTargetHovered = false;

  // Retroalimentación auditiva accesible (Web Audio API)
  function playConfirmationSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // Re 5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.16); // La 5

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (_) {
      // Audio no admitido sin interacción previa
    }
  }

  // Actualización geométrica del anillo en A-Frame (de 0° a -360° en sentido horario)
  function setRingProgress(progress, color = '#F5B301') {
    if (!progressRing) return;
    const p = Math.max(0.001, Math.min(1.0, progress));
    const angle = -(p * 360);
    progressRing.setAttribute('geometry', `primitive: ring; radiusInner: 0.018; radiusOuter: 0.028; thetaStart: 90; thetaLength: ${angle}`);
    progressRing.setAttribute('material', `color: ${color}; shader: flat; side: double; opacity: 0.95`);
  }

  function startGaze() {
    if (isPaused || isTargetHovered) return;
    isTargetHovered = true;
    gazeStartTime = performance.now();
    currentStage = '0%';
    setRingProgress(0.01, '#F5B301');
    if (centerDot) centerDot.setAttribute('material', 'color: #ffffff');
    eventLine('Mirada enfocada en el objetivo — iniciando temporizador de 3.0 s');

    function tick() {
      if (!isTargetHovered || isPaused) return;

      const elapsed = performance.now() - gazeStartTime;
      const progress = Math.min(elapsed / DWELL_TIME_MS, 1.0);

      let stage = '0%';
      if (progress >= 1.0) stage = '100%';
      else if (progress >= 0.66) stage = '66%';
      else if (progress >= 0.33) stage = '33%';

      if (stage !== currentStage) {
        currentStage = stage;
        eventLine(`Progreso de mirada: ${stage} (${Math.round(elapsed)} ms)`);
      }

      setRingProgress(progress, '#F5B301');
      selectionStatus.textContent = `Enfocando objetivo: etapa ${stage} (${Math.round(progress * 100)} %)...`;

      if (progress >= 1.0) {
        completeGazeSelection();
      } else {
        gazeRaf = requestAnimationFrame(tick);
      }
    }

    gazeRaf = requestAnimationFrame(tick);
  }

  function cancelGaze() {
    if (!isTargetHovered) return;
    isTargetHovered = false;
    if (gazeRaf) {
      cancelAnimationFrame(gazeRaf);
      gazeRaf = null;
    }
    const elapsed = gazeStartTime ? Math.round(performance.now() - gazeStartTime) : 0;
    eventLine(`Mirada retirada a los ${elapsed} ms — reinicio suave a 0 %`);
    selectionStatus.textContent = 'Mirada retirada antes de completar los 3 s. Retícula en 0 %.';
    currentStage = '0%';
    setRingProgress(0.01, '#F5B301');
    if (centerDot) centerDot.setAttribute('material', 'color: #ffffff');
  }

  function completeGazeSelection() {
    if (gazeRaf) cancelAnimationFrame(gazeRaf);
    gazeRaf = null;
    isTargetHovered = false;

    selectionCount++;
    // Confirmación visual en verde de éxito (#1E7B3A)
    setRingProgress(1.0, '#1E7B3A');
    if (centerDot) centerDot.setAttribute('material', 'color: #1E7B3A');

    // Cambiar color del objetivo (verde menta #62bda1 alternando con naranja #e59b3d)
    const nextColor = selectionCount % 2 ? '#62bda1' : '#e59b3d';
    target.setAttribute('color', nextColor);

    playConfirmationSound();
    selectionStatus.textContent = `✓ Selección #${selectionCount} confirmada por mirada (3.0 s continuos).`;
    eventLine(`✓ Selección #${selectionCount} COMPLETADA al 100% por permanencia (3000 ms).`);

    // Regresar la mirilla a reposo suavemente tras mostrar confirmación
    setTimeout(() => {
      setRingProgress(0.01, '#F5B301');
      if (centerDot) centerDot.setAttribute('material', 'color: #ffffff');
    }, 450);
  }

  // Eventos sobre el objetivo central
  target.addEventListener('mouseenter', startGaze);
  target.addEventListener('mouseleave', cancelGaze);

  // Soporte directo con clic/toque (accesibilidad 2D sin visor)
  target.addEventListener('click', () => {
    selectionCount++;
    target.setAttribute('color', selectionCount % 2 ? '#62bda1' : '#e59b3d');
    playConfirmationSound();
    selectionStatus.textContent = `Selección #${selectionCount} activada por clic/toque directo.`;
    eventLine(`Selección #${selectionCount} activada por entrada táctil o mouse.`);
  });

  // Botón Pausa de la mirilla
  if (pauseButton) {
    pauseButton.addEventListener('click', () => {
      isPaused = !isPaused;
      if (isPaused) {
        cancelGaze();
        pauseButton.textContent = 'Reanudar mirilla';
        pauseButton.style.background = '#e59b3d';
        pauseButton.style.color = '#fff';
        selectionStatus.textContent = 'Mirilla en PAUSA: permanencia desactivada para descanso visual.';
        eventLine('Mirilla pausada por el usuario.');
      } else {
        pauseButton.textContent = 'Pausar mirilla';
        pauseButton.style.background = '';
        pauseButton.style.color = '';
        selectionStatus.textContent = 'Mirilla reanudada: apunta al círculo durante 3 s para seleccionarlo.';
        eventLine('Mirilla reanudada.');
      }
    });
  }

  // Sensores de orientación física
  const listenOrientation = (event) => {
    if ([event.alpha, event.beta, event.gamma].every((v) => v == null)) return;
    orientationEvents++;
    const now = Date.now();
    if (now - lastUpdate > 400) {
      lastUpdate = now;
      const fmt = (v) => (typeof v === 'number' ? v.toFixed(1) + '°' : 'no disponible');
      angles.textContent = `Orientación recibida: α ${fmt(event.alpha)} · β ${fmt(event.beta)} · γ ${fmt(event.gamma)}`;
      status.textContent = `Sensores: recibidos ${orientationEvents} eventos de orientación.`;
    }
    if (orientationEvents === 1) eventLine('Se recibió el primer evento de orientación con datos.');
    if (lastSample && orientationEvents > 2 && Math.abs((event.beta ?? 0) - (lastSample.beta ?? 0)) > 8) {
      if (!window.__astroOrientationVariationLogged) {
        window.__astroOrientationVariationLogged = true;
        eventLine('Se detectó variación de ángulo beta durante la sesión.');
      }
    }
    lastSample = { beta: event.beta };
  };
  window.addEventListener('deviceorientation', listenOrientation);

  if (!window.isSecureContext) {
    status.textContent = 'Sensores: la página no está en HTTPS. El navegador móvil podría bloquearlos.';
    eventLine('ADVERTENCIA: contexto no seguro; usar HTTPS para sensores móviles.');
  }

  permissionButton.addEventListener('click', () => {
    if (!window.DeviceOrientationEvent) {
      status.textContent = 'Sensores: API DeviceOrientationEvent no disponible.';
      eventLine('La API DeviceOrientationEvent no está disponible.');
      return;
    }
    if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
      window.DeviceOrientationEvent.requestPermission()
        .then((result) => {
          eventLine(`Permiso de orientación: ${result}`);
          status.textContent = result === 'granted'
            ? 'Permiso concedido. Mueve el teléfono y observa si cambian los ángulos y la cámara.'
            : 'Permiso denegado. Utiliza los controles táctiles o el modo web 2D.';
        })
        .catch((error) => {
          status.textContent = 'No se pudo solicitar el permiso. Prueba HTTPS y revisa la configuración del navegador.';
          eventLine(`Error al solicitar permiso: ${error.name || 'Error'} — ${error.message || ''}`);
        });
    } else {
      status.textContent = 'Este navegador no requiere solicitud de permiso; mueve el teléfono para orientar.';
      eventLine('No existe requestPermission; esperando eventos de orientación directos.');
    }
  });

  // A-Frame Estereoscópico
  if (!window.AFRAME) {
    stereoStatus.textContent = 'A-Frame no pudo cargarse. Revisa la conexión a Internet.';
    eventLine('ERROR: no se pudo cargar A-Frame 1.8.0.');
    return;
  }

  AFRAME.registerComponent('experimental-stereo', {
    init() {
      this.stereoCamera = new AFRAME.THREE.StereoCamera();
      this.stereoCamera.eyeSep = 0.064;
      this.enabledStereo = false;
      stereoComponent = this;
    },
    tock() {
      if (!this.enabledStereo || !this.el.renderer || !this.el.camera) return;
      const renderer = this.el.renderer;
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

  scene.setAttribute('experimental-stereo', '');

  function onSceneReady() {
    if (!stereoComponent) stereoComponent = scene.components['experimental-stereo'];
    stereoButton.disabled = !stereoComponent;
    eventLine('Escena A-Frame cargada.');
    stereoStatus.textContent = stereoComponent
      ? 'Escena cargada. La vista dividida puede probarse por separado.'
      : 'Escena cargada, pero el componente estereoscópico no se inició.';
  }
  if (scene.hasLoaded) onSceneReady();
  else scene.addEventListener('loaded', onSceneReady, { once: true });

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
    stereoStatus.textContent = 'Vista dividida ACTIVADA: gira el teléfono a horizontal.';
    eventLine('Vista dividida activada.');
    window.dispatchEvent(new Event('resize'));
  });

  exitButton.addEventListener('click', exitStereo);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') exitStereo();
  });

  $('copyButton').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(logs.join('\n'));
      eventLine('Registro copiado al portapapeles.');
    } catch {
      eventLine('No se pudo copiar automáticamente.');
    }
  });

  $('clearButton').addEventListener('click', () => {
    logs.length = 0;
    logEl.textContent = '';
    eventLine('Registro reiniciado.');
  });
})();
