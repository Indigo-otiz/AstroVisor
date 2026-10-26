/* AstroVisor — Sprint 2: Selección por mirada accesible (Karime)
   - Retícula y permanencia de 3 segundos sin prisa (#F5B301).
   - Anillo de carga sobre el punto de la constelación.
   - Al completar los 3 s, se abre la ficha de información de la constelación con libro recomendado (Pág. 18 de Karime).
   - Botón "Volver al recorrido" para regresar a las constelaciones en 0 %.
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
  eventLine(`Prueba iniciada | S2: Selección por mirada e información de constelación | ${new Date().toISOString()}`);
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
  const target = $('target');
  const targetProgressRing = $('targetProgressRing');
  const reticleRing = $('reticleRing');
  const centerDot = $('centerDot');
  const constellationInfoModal = $('constellationInfoModal');
  const returnToSkyBtn = $('returnToSkyBtn');

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
  let isModalOpen = false;

  // Estado del temporizador de mirada
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

  // Actualiza el anillo de carga amarillo (#F5B301) sobre el punto de la constelación
  function setTargetRingProgress(progress, ringColor = '#F5B301') {
    if (!targetProgressRing) return;
    if (progress <= 0) {
      targetProgressRing.setAttribute('visible', 'false');
      targetProgressRing.setAttribute('geometry', 'primitive: ring; radiusInner: 0.50; radiusOuter: 0.70; thetaStart: 90; thetaLength: 0.001');
      return;
    }
    targetProgressRing.setAttribute('visible', 'true');
    const p = Math.min(1.0, Math.max(0.002, progress));
    const angle = -(p * 360); // sentido horario desde arriba (thetaStart=90)
    targetProgressRing.setAttribute('geometry', `primitive: ring; radiusInner: 0.50; radiusOuter: 0.70; thetaStart: 90; thetaLength: ${angle}`);
    targetProgressRing.setAttribute('material', `color: ${ringColor}; shader: flat; side: double; opacity: 0.95`);
  }

  function startGaze() {
    if (isPaused || isTargetHovered || isModalOpen) return;
    isTargetHovered = true;
    gazeStartTime = performance.now();
    currentStage = '0%';
    setTargetRingProgress(0.002, '#F5B301');
    target.setAttribute('color', TARGET_BASE_COLOR);

    eventLine('Mirada fija sobre Orión — iniciando carga de permanencia (3.0 s)');

    function tick() {
      if (!isTargetHovered || isPaused || isModalOpen) return;

      const elapsed = performance.now() - gazeStartTime;
      const progress = Math.min(elapsed / DWELL_TIME_MS, 1.0);

      let stage = '0%';
      if (progress >= 1.0) stage = '100%';
      else if (progress >= 0.66) stage = '66%';
      else if (progress >= 0.33) stage = '33%';

      if (stage !== currentStage) {
        currentStage = stage;
        eventLine(`Carga de Orión: ${stage} (${Math.round(elapsed)} ms)`);
      }

      setTargetRingProgress(progress, '#F5B301');
      selectionStatus.textContent = `Enfocando Orión: etapa ${stage} (${Math.round(progress * 100)} %)...`;

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
    eventLine(`Mirada retirada a los ${elapsed} ms — carga reiniciada a 0 %`);
    selectionStatus.textContent = 'Mirada retirada. El anillo amarillo se reinició a 0 %.';
    currentStage = '0%';
    setTargetRingProgress(0, '#F5B301');
    target.setAttribute('color', TARGET_BASE_COLOR);
    if (reticleRing) reticleRing.setAttribute('material', 'color: #ffffff');
    if (centerDot) centerDot.setAttribute('material', 'color: #ffffff');
  }

  function completeGazeSelection() {
    if (gazeRaf) cancelAnimationFrame(gazeRaf);
    gazeRaf = null;
    isTargetHovered = false;

    selectionCount++;
    // Confirmación visual en verde de éxito (#1E7B3A)
    setTargetRingProgress(1.0, CONFIRM_COLOR);
    target.setAttribute('color', CONFIRM_COLOR);
    if (reticleRing) reticleRing.setAttribute('material', `color: ${CONFIRM_COLOR}`);
    if (centerDot) centerDot.setAttribute('material', `color: ${CONFIRM_COLOR}`);

    playConfirmationSound();
    selectionStatus.textContent = `✓ Selección #${selectionCount} COMPLETADA: abriendo información de Orión...`;
    eventLine(`✓ Selección #${selectionCount} de Orión completada al 100% por permanencia (3000 ms).`);

    // Abre la ficha informativa tras 450 ms de mostrar la confirmación
    setTimeout(() => {
      openConstellationInfo();
      setTargetRingProgress(0, '#F5B301');
      target.setAttribute('color', TARGET_BASE_COLOR);
      if (reticleRing) reticleRing.setAttribute('material', 'color: #ffffff');
      if (centerDot) centerDot.setAttribute('material', 'color: #ffffff');
    }, 450);
  }

  function openConstellationInfo() {
    isModalOpen = true;
    if (constellationInfoModal) {
      constellationInfoModal.classList.add('is-open');
    }
    eventLine('Ficha de información de Orión abierta.');
  }

  function closeConstellationInfo() {
    isModalOpen = false;
    if (constellationInfoModal) {
      constellationInfoModal.classList.remove('is-open');
    }
    cancelGaze();
    selectionStatus.textContent = 'De vuelta en el cielo nocturno. Apunta a Orión durante 3 s para volver a abrir su información.';
    eventLine('Regresando a las constelaciones (Visor: 0 %).');
  }

  // Botón "Volver al recorrido" dentro de la ficha de información
  if (returnToSkyBtn) {
    returnToSkyBtn.addEventListener('click', closeConstellationInfo);
  }

  // Eventos sobre el punto objetivo
  target.addEventListener('mouseenter', startGaze);
  target.addEventListener('mouseleave', cancelGaze);

  // Soporte directo por clic o toque en el punto (accesibilidad en pantalla 2D)
  target.addEventListener('click', () => {
    completeGazeSelection();
  });

  // Botón Pausar mirilla
  function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
      cancelGaze();
      if (pauseButton) {
        pauseButton.textContent = 'Reanudar mirilla';
        pauseButton.style.background = '#e59b3d';
        pauseButton.style.color = '#fff';
      }
      selectionStatus.textContent = 'Mirilla en PAUSA: permanencia desactivada para descanso visual.';
      eventLine('Mirilla pausada.');
    } else {
      if (pauseButton) {
        pauseButton.textContent = 'Pausar mirilla';
        pauseButton.style.background = '';
        pauseButton.style.color = '';
      }
      selectionStatus.textContent = 'Mirilla activa: enfoca el punto durante 3 s para abrir su información.';
      eventLine('Mirilla reanudada.');
    }
  }

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
    if (event.key === 'Escape') {
      if (isModalOpen) closeConstellationInfo();
      else exitStereo();
    }
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
