/* AstroVisor — Sprint 2: Selección por mirada accesible (Karime)
   - Retícula y permanencia de 3 segundos sin prisa (#F5B301).
   - Anillo de carga sobre el punto fijo central.
   - Controles accesibles en escena: [ || Pausa ] y [ Salir 2D ] activables con la mirada o con clic/toque.
   - Cancelación suave al retirar la vista y confirmación visual (#1E7B3A) + sonora.
*/
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
  eventLine(`Prueba iniciada | S2: Selección por mirada y controles de salida (Karime) | ${new Date().toISOString()}`);
  eventLine(`Navegador: ${browserInfo}`);
  eventLine(`Contexto seguro: ${window.isSecureContext ? 'sí' : 'no'}`);

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

  // Elementos 3D interactivos
  const target = $('target');
  const targetProgressRing = $('targetProgressRing');
  const pauseBtn3D = $('pauseBtn3D');
  const pauseProgressRing = $('pauseProgressRing');
  const pause3DLabel = $('pause3DLabel');
  const exitBtn3D = $('exitBtn3D');
  const exitProgressRing = $('exitProgressRing');
  const reticleRing = $('reticleRing');
  const centerDot = $('centerDot');

  // Constantes visuales
  const TARGET_BASE_COLOR = '#e59b3d';
  const CONFIRM_COLOR = '#1E7B3A'; // Verde de éxito según WCAG
  const DWELL_TIME_MS = 3000;      // 3 segundos sin prisa (para adultos mayores)

  let orientationEvents = 0;
  let lastUpdate = 0;
  let lastSample;
  let selectionCount = 0;
  let stereoActive = false;
  let stereoComponent;
  let isPaused = false;

  // Estado del temporizador de mirada
  let activeTarget = null;
  let activeRing = null;
  let activeRadii = { inner: 0.50, outer: 0.70 };
  let gazeStartTime = null;
  let gazeRaf = null;
  let currentStage = '0%';

  // Retroalimentación auditiva accesible (Web Audio API)
  function playConfirmationSound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.16);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (_) {}
  }

  // Actualiza el anillo de carga amarillo (#F5B301) sobre cualquier objeto enfocado
  function setRingProgress(ringEl, progress, color = '#F5B301', rInner = 0.50, rOuter = 0.70) {
    if (!ringEl) return;
    if (progress <= 0) {
      ringEl.setAttribute('visible', 'false');
      ringEl.setAttribute('geometry', `primitive: ring; radiusInner: ${rInner}; radiusOuter: ${rOuter}; thetaStart: 90; thetaLength: 0.001`);
      return;
    }
    ringEl.setAttribute('visible', 'true');
    const p = Math.min(1.0, Math.max(0.002, progress));
    const angle = -(p * 360);
    ringEl.setAttribute('geometry', `primitive: ring; radiusInner: ${rInner}; radiusOuter: ${rOuter}; thetaStart: 90; thetaLength: ${angle}`);
    ringEl.setAttribute('material', `color: ${color}; shader: flat; side: double; opacity: 0.95`);
  }

  function startGaze(el) {
    const action = el.getAttribute('data-action') || 'target';
    // Si está pausado, solo permitimos mirar el botón de Pausa para reanudar
    if (isPaused && action !== 'pause') return;
    if (activeTarget) return;

    activeTarget = el;
    if (action === 'target') {
      activeRing = targetProgressRing;
      activeRadii = { inner: 0.50, outer: 0.70 };
      eventLine('Mirada fija sobre el punto central — iniciando carga de 3 s');
    } else if (action === 'pause') {
      activeRing = pauseProgressRing;
      activeRadii = { inner: 0.11, outer: 0.17 };
      eventLine('Mirada fija sobre botón [Pausa] — iniciando carga de 3 s');
    } else if (action === 'exit') {
      activeRing = exitProgressRing;
      activeRadii = { inner: 0.11, outer: 0.17 };
      eventLine('Mirada fija sobre botón [Salir 2D] — iniciando carga de 3 s');
    }

    gazeStartTime = performance.now();
    currentStage = '0%';
    setRingProgress(activeRing, 0.002, '#F5B301', activeRadii.inner, activeRadii.outer);

    function tick() {
      if (!activeTarget) return;

      const elapsed = performance.now() - gazeStartTime;
      const progress = Math.min(elapsed / DWELL_TIME_MS, 1.0);

      let stage = '0%';
      if (progress >= 1.0) stage = '100%';
      else if (progress >= 0.66) stage = '66%';
      else if (progress >= 0.33) stage = '33%';

      if (stage !== currentStage) {
        currentStage = stage;
        eventLine(`Carga ${action}: ${stage} (${Math.round(elapsed)} ms)`);
      }

      setRingProgress(activeRing, progress, '#F5B301', activeRadii.inner, activeRadii.outer);
      const nombreAccion = action === 'target' ? 'punto fijo' : (action === 'pause' ? 'botón Pausa' : 'botón Salir a 2D');
      selectionStatus.textContent = `Enfocando ${nombreAccion}: etapa ${stage} (${Math.round(progress * 100)} %)...`;

      if (progress >= 1.0) {
        completeGazeSelection(activeTarget, action);
      } else {
        gazeRaf = requestAnimationFrame(tick);
      }
    }

    gazeRaf = requestAnimationFrame(tick);
  }

  function cancelGaze() {
    if (!activeTarget) return;
    if (gazeRaf) {
      cancelAnimationFrame(gazeRaf);
      gazeRaf = null;
    }
    const elapsed = gazeStartTime ? Math.round(performance.now() - gazeStartTime) : 0;
    eventLine(`Mirada retirada a los ${elapsed} ms — carga reiniciada a 0 %`);
    selectionStatus.textContent = 'Mirada retirada. Anillo reiniciado a 0 %.';
    currentStage = '0%';

    // Oculta todos los anillos
    setRingProgress(targetProgressRing, 0, '#F5B301', 0.50, 0.70);
    if (pauseProgressRing) setRingProgress(pauseProgressRing, 0, '#F5B301', 0.11, 0.17);
    if (exitProgressRing) setRingProgress(exitProgressRing, 0, '#F5B301', 0.11, 0.17);

    target.setAttribute('color', TARGET_BASE_COLOR);
    activeTarget = null;
    activeRing = null;
  }

  function completeGazeSelection(el, action) {
    if (gazeRaf) cancelAnimationFrame(gazeRaf);
    gazeRaf = null;

    setRingProgress(activeRing, 1.0, CONFIRM_COLOR, activeRadii.inner, activeRadii.outer);
    playConfirmationSound();

    if (action === 'target') {
      selectionCount++;
      target.setAttribute('color', CONFIRM_COLOR);
      selectionStatus.textContent = `✓ Selección #${selectionCount} COMPLETADA: punto fijo confirmado a los 3.0 s.`;
      eventLine(`✓ Selección #${selectionCount} completada en el punto fijo.`);

      setTimeout(() => {
        setRingProgress(targetProgressRing, 0, '#F5B301', 0.50, 0.70);
        target.setAttribute('color', TARGET_BASE_COLOR);
        activeTarget = null;
      }, 600);
    } else if (action === 'pause') {
      selectionStatus.textContent = '✓ Control Pausa confirmado con la mirada.';
      eventLine('✓ Control Pausa activado por mirada.');

      setTimeout(() => {
        setRingProgress(pauseProgressRing, 0, '#F5B301', 0.11, 0.17);
        activeTarget = null;
        togglePause();
      }, 400);
    } else if (action === 'exit') {
      selectionStatus.textContent = '✓ Salida confirmada por mirada. Regresando al modo web 2D...';
      eventLine('✓ Salida a 2D confirmada por mirada.');

      setTimeout(() => {
        window.location.href = '/explorar';
      }, 500);
    }
  }

  function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
      cancelGaze();
      if (pauseButton) {
        pauseButton.textContent = 'Reanudar mirilla';
        pauseButton.style.background = '#e59b3d';
        pauseButton.style.color = '#fff';
      }
      if (pause3DLabel) {
        pause3DLabel.setAttribute('value', '▶ Seguir');
      }
      selectionStatus.textContent = 'Mirilla en PAUSA: permanencia desactivada para descanso visual.';
      eventLine('Mirilla pausada.');
    } else {
      if (pauseButton) {
        pauseButton.textContent = 'Pausar mirilla';
        pauseButton.style.background = '';
        pauseButton.style.color = '';
      }
      if (pause3DLabel) {
        pause3DLabel.setAttribute('value', '|| Pausa');
      }
      selectionStatus.textContent = 'Mirilla activa: enfoca el punto o un botón durante 3 s para seleccionarlo.';
      eventLine('Mirilla reanudada.');
    }
  }

  // Conectar eventos sobre todos los objetos seleccionables (.selectable)
  const selectableEls = document.querySelectorAll('.selectable');
  selectableEls.forEach((el) => {
    el.addEventListener('mouseenter', () => startGaze(el));
    el.addEventListener('mouseleave', cancelGaze);
    el.addEventListener('click', () => {
      const action = el.getAttribute('data-action') || 'target';
      if (action === 'target') {
        selectionCount++;
        target.setAttribute('color', CONFIRM_COLOR);
        playConfirmationSound();
        selectionStatus.textContent = `Selección #${selectionCount} por clic/toque directo.`;
        setTimeout(() => target.setAttribute('color', TARGET_BASE_COLOR), 500);
      } else if (action === 'pause') {
        togglePause();
      } else if (action === 'exit') {
        window.location.href = '/explorar';
      }
    });
  });

  // Botón Pausar mirilla de la interfaz 2D
  if (pauseButton) {
    pauseButton.addEventListener('click', togglePause);
  }

  // Sensores de orientación física (móvil)
  const listenOrientation = (event) => {
    if ([event.alpha, event.beta, event.gamma].every((v) => v == null)) return;
    orientationEvents++;
    const now = Date.now();
    if (now - lastUpdate > 400) {
      lastUpdate = now;
      const fmt = (v) => (typeof v === 'number' ? v.toFixed(1) + '°' : 'N/D');
      angles.textContent = `Orientación recibida: α ${fmt(event.alpha)} · β ${fmt(event.beta)} · γ ${fmt(event.gamma)}`;
      status.textContent = `Sensores: recibidos ${orientationEvents} eventos. Mueve el teléfono para orientar.`;
    }
    if (orientationEvents === 1) eventLine('Se recibió el primer evento de orientación con datos.');
    if (lastSample && orientationEvents > 2 && Math.abs((event.beta ?? 0) - (lastSample.beta ?? 0)) > 8) {
      if (!window.__astroOrientationVariationLogged) {
        window.__astroOrientationVariationLogged = true;
        eventLine('Variación de ángulo detectada.');
      }
    }
    lastSample = { beta: event.beta };
  };
  window.addEventListener('deviceorientation', listenOrientation);

  permissionButton.addEventListener('click', () => {
    if (!window.DeviceOrientationEvent) {
      status.textContent = 'Sensores: API no disponible.';
      eventLine('DeviceOrientationEvent no disponible.');
      return;
    }
    if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
      window.DeviceOrientationEvent.requestPermission()
        .then((result) => {
          eventLine(`Permiso de orientación: ${result}`);
          status.textContent = result === 'granted'
            ? 'Permiso concedido. Mueve el teléfono para enfocar el punto.'
            : 'Permiso denegado. Puedes usar la pantalla táctil o el mouse.';
        })
        .catch((error) => {
          status.textContent = 'Error al pedir permiso. Revisa la configuración del navegador.';
          eventLine(`Error de permiso: ${error.message || ''}`);
        });
    } else {
      status.textContent = 'Este navegador no requiere solicitud previa; mueve el teléfono para orientar.';
      eventLine('Esperando eventos de orientación directos.');
    }
  });

  // A-Frame Estereoscópico
  if (!window.AFRAME) {
    stereoStatus.textContent = 'A-Frame no pudo cargarse.';
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
    stereoStatus.textContent = stereoComponent
      ? 'Escena lista. Compatible con 2D y vista dividida Homido.'
      : 'Escena cargada sin componente estéreo.';
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
    stereoStatus.textContent = 'Vista dividida desactivada. Continuando en modo 2D.';
    eventLine('Vista dividida desactivada.');
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
