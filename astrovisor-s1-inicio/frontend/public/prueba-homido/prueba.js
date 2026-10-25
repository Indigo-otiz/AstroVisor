/* AstroVisor — Sprint 2: Controles de selección por mirada y retroalimentación accesible (Karime)
   Fiel al sistema visual y especificaciones del PDF 'Spring 1_ Rendon Vazquez.pdf'.
*/

(function () {
  'use strict';

  const CIRCUMFERENCE = 175.93;
  const DWELL_TIME_MS = 3000; // 3 segundos sin prisa (especificado para adultos mayores)

  // Datos documentales de muestra para las constelaciones (Figma Karime - Págs. 4, 13, 18)
  const CONSTELLATION_INFO = {
    orion: {
      titulo: 'Orión',
      historia: 'Orión parece una figura con dos hombros, dos pies y tres estrellas alineadas en el centro que forman su cinturón. Para encontrarla en el cielo nocturno, busca primero esas tres estrellas juntas.',
      libro: 'Libro de muestra 1 — Guía visual de constelaciones y mitología celeste',
    },
    osamayor: {
      titulo: 'Osa Mayor',
      historia: 'La Osa Mayor es reconocida por su forma de cacerola con cuatro estrellas principales y un mango curvado de tres estrellas. Es una de las guías más confiables para ubicar el norte.',
      libro: 'Libro de muestra 2 — El gran atlas del cielo boreal para principiantes',
    },
    cruz: {
      titulo: 'Cruz del Sur',
      historia: 'La Cruz del Sur está compuesta por cuatro estrellas en cruz y una quinta pequeña a la derecha. Es la constelación más emblemática del hemisferio austral y sirve de brújula natural.',
      libro: 'Libro de muestra 3 — Estrellas y navegación del hemisferio sur',
    },
  };

  const $ = (id) => document.getElementById(id);
  const logEl = $('log');
  const logs = [];

  const eventLine = (msg) => {
    const stamp = new Date().toLocaleTimeString('es-MX', { hour12: false });
    logs.push(`[${stamp}] ${msg}`);
    if (logEl) {
      logEl.textContent = logs.join('\n');
      logEl.scrollTop = logEl.scrollHeight;
    }
  };

  eventLine(`Sesión iniciada | Sprint 2: Selección por mirada (Karime) | ${new Date().toISOString()}`);

  // Elementos de la interfaz
  const progressCircle = $('progressCircle');
  const reticleDot = $('reticleDot');
  const reticleBadge = $('reticleBadge');
  const reticleContainer = $('reticleContainer');
  const confirmPulseRing = $('confirmPulseRing');
  const pauseVisorBtn = $('pauseVisorBtn');
  const pauseIcon = $('pauseIcon');
  const pauseText = $('pauseText');
  const infoModal = $('infoModal');
  const modalTitle = $('modalTitle');
  const modalStory = $('modalStory');
  const modalBook = $('modalBook');
  const closeInfoBtn = $('closeInfoBtn');
  const permissionButton = $('permissionButton');
  const stereoButton = $('stereoButton');
  const exitButton = $('exitButton');
  const scene = $('testScene');
  const host = $('sceneHost');
  const status = $('orientationStatus');
  const stereoStatus = $('stereoStatus');
  const selectionStatus = $('selectionStatus');
  const angles = $('angles');

  // Estado del temporizador de mirada
  let currentTargetEl = null;
  let gazeStartTime = null;
  let gazeRaf = null;
  let isPaused = false;
  let isManualOverride = false;
  let isModalOpen = false;
  let currentStage = '0%';
  let stereoActive = false;
  let stereoComponent = null;
  let orientationEvents = 0;
  let lastUpdate = 0;
  let selectionCount = 0;

  // Emisión de tono sonoro accesible al confirmar mirada (Web Audio API)
  function playConfirmationChime() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.16); // A5

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (_) {
      // Audio no permitido por política del navegador sin gesto
    }
  }

  // Actualiza la visualización de la retícula SVG y sus porcentajes
  function setReticleVisual(progressRatio, stageLabel, confirmed = false) {
    const p = Math.max(0, Math.min(1, progressRatio));
    const offset = CIRCUMFERENCE * (1 - p);
    if (progressCircle) {
      progressCircle.style.strokeDashoffset = offset;
      progressCircle.setAttribute('stroke', confirmed ? '#1E7B3A' : '#F5B301');
    }
    if (reticleDot) {
      reticleDot.setAttribute('fill', confirmed ? '#1E7B3A' : '#FFFFFF');
    }
    if (reticleBadge) {
      reticleBadge.textContent = isPaused ? 'Pausa' : stageLabel;
    }
    if (reticleContainer) {
      reticleContainer.classList.toggle('stage-active', p > 0 && p < 1);
      reticleContainer.classList.toggle('stage-confirmed', confirmed);
      reticleContainer.classList.toggle('is-paused', isPaused);
    }
    if (confirmPulseRing) {
      confirmPulseRing.style.opacity = confirmed ? '1' : '0';
    }
  }

  // Lógica central del Gaze Dwell (3 segundos continuos)
  function startGaze(targetEl) {
    if (isPaused || isManualOverride || isModalOpen || !targetEl) return;
    if (currentTargetEl === targetEl) return;

    currentTargetEl = targetEl;
    gazeStartTime = performance.now();
    currentStage = '0%';
    setReticleVisual(0, '0%', false);

    const targetKey = targetEl.getAttribute('data-target') || targetEl.id || 'objetivo';
    eventLine(`Mirada iniciada sobre [${targetKey}] — temporizador de 3 s`);

    function tick() {
      if (!currentTargetEl || isPaused || isManualOverride || isModalOpen) return;

      const elapsed = performance.now() - gazeStartTime;
      const progress = Math.min(elapsed / DWELL_TIME_MS, 1.0);

      let stage = '0%';
      if (progress >= 1.0) stage = '100%';
      else if (progress >= 0.66) stage = '66%';
      else if (progress >= 0.33) stage = '33%';

      if (stage !== currentStage) {
        currentStage = stage;
        eventLine(`Progreso de permanencia: ${stage} (${Math.round(elapsed)} ms)`);
      }

      setReticleVisual(progress, stage, progress >= 1.0);

      if (progress >= 1.0) {
        completeSelection(currentTargetEl);
      } else {
        gazeRaf = requestAnimationFrame(tick);
      }
    }

    gazeRaf = requestAnimationFrame(tick);
  }

  function cancelGaze() {
    if (isManualOverride || (!currentTargetEl && currentStage === '0%')) return;
    if (gazeRaf) {
      cancelAnimationFrame(gazeRaf);
      gazeRaf = null;
    }
    if (currentTargetEl) {
      const targetKey = currentTargetEl.getAttribute('data-target') || 'objetivo';
      eventLine(`Mirada retirada de [${targetKey}]. Reinicio suave a 0 %`);
    }
    currentTargetEl = null;
    gazeStartTime = null;
    currentStage = '0%';
    setReticleVisual(0, '0%', false);
  }

  function completeSelection(targetEl) {
    if (gazeRaf) cancelAnimationFrame(gazeRaf);
    gazeRaf = null;

    selectionCount++;
    const targetKey = targetEl.getAttribute('data-target') || 'orion';
    eventLine(`✓ Selección confirmada al 100 % en [${targetKey}]. Emitiendo retroalimentación sonora y visual.`);
    selectionStatus.textContent = `Selecciones: ${selectionCount}. Última: ${targetKey.toUpperCase()} (confirmada a los 3.0 s por permanencia).`;

    playConfirmationChime();
    setReticleVisual(1, '100%', true);

    // Abrir ficha informativa tras breve pausa visual de confirmación (350 ms)
    setTimeout(() => {
      openInfoModal(targetKey);
    }, 380);
  }

  function openInfoModal(constellationKey) {
    const info = CONSTELLATION_INFO[constellationKey] || CONSTELLATION_INFO.orion;
    modalTitle.textContent = info.titulo;
    modalStory.textContent = info.historia;
    modalBook.textContent = info.libro;
    infoModal.hidden = false;
    isModalOpen = true;
    eventLine(`Panel de información abierto para: ${info.titulo}`);
  }

  function closeInfoModal() {
    infoModal.hidden = true;
    isModalOpen = false;
    cancelGaze();
    eventLine('Panel informativo cerrado. Retorno a Visor: 0 %');
  }

  if (closeInfoBtn) {
    closeInfoBtn.addEventListener('click', closeInfoModal);
  }

  // Botón Pausar / Continuar mirada
  if (pauseVisorBtn) {
    pauseVisorBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      if (isPaused) {
        cancelGaze();
        pauseIcon.textContent = '▶';
        pauseText.textContent = 'Continuar';
        pauseVisorBtn.classList.remove('pause-btn');
        pauseVisorBtn.classList.add('secondary');
        selectionStatus.textContent = 'Retícula en PAUSA: detección de mirada desactivada para descanso visual.';
        eventLine('Visor pausado.');
      } else {
        pauseIcon.textContent = '⏸';
        pauseText.textContent = 'Pausa';
        pauseVisorBtn.classList.add('pause-btn');
        pauseVisorBtn.classList.remove('secondary');
        selectionStatus.textContent = 'Visor activo: mira una constelación durante 3 s para seleccionarla.';
        eventLine('Visor reanudado.');
      }
      setReticleVisual(0, isPaused ? 'Pausa' : '0%', false);
    });
  }

  // Interacción en la escena A-Frame mediante raycaster y eventos de cursor
  const selectableEls = document.querySelectorAll('.selectable');
  selectableEls.forEach((el) => {
    // Al entrar el cursor/raycaster en el objetivo
    el.addEventListener('mouseenter', () => {
      startGaze(el);
    });
    // Al salir
    el.addEventListener('mouseleave', () => {
      cancelGaze();
    });
    // Soporte directo por clic / toque para usuarios sin visor (accesibilidad 2D)
    el.addEventListener('click', () => {
      completeSelection(el);
    });
  });

  // Conexión del raycaster central de la cámara
  const gazeRaycaster = $('gazeRaycaster');
  if (gazeRaycaster) {
    gazeRaycaster.addEventListener('raycaster-intersection', (evt) => {
      const intersected = evt.detail.els && evt.detail.els[0];
      if (intersected && intersected.classList.contains('selectable')) {
        startGaze(intersected);
      }
    });
    gazeRaycaster.addEventListener('raycaster-intersection-cleared', () => {
      cancelGaze();
    });
  }

  // Barra de Selector de Marcos AstroVisor (Figma Karime - Pág. 10 y 17)
  const marcoButtons = {
    marco0Btn: { progress: 0, stage: '0%', modal: false, confirmed: false },
    marco33Btn: { progress: 0.33, stage: '33%', modal: false, confirmed: false },
    marco66Btn: { progress: 0.66, stage: '66%', modal: false, confirmed: false },
    marco100Btn: { progress: 1.0, stage: '100%', modal: false, confirmed: true },
    marcoInfoBtn: { progress: 1.0, stage: '100%', modal: true, confirmed: true },
  };

  function clearMarcoActive() {
    document.querySelectorAll('.marcos-bar button').forEach((b) => b.classList.remove('active'));
  }

  Object.entries(marcoButtons).forEach(([btnId, config]) => {
    const btn = $(btnId);
    if (!btn) return;
    btn.addEventListener('click', () => {
      clearMarcoActive();
      btn.classList.add('active');
      isManualOverride = true;
      if (gazeRaf) cancelAnimationFrame(gazeRaf);

      setReticleVisual(config.progress, config.stage, config.confirmed);
      if (config.modal) {
        openInfoModal('orion');
      } else {
        infoModal.hidden = true;
        isModalOpen = false;
      }
      eventLine(`Marco fijado manualmente: [${config.stage}] para revisión visual.`);
    });
  });

  const marcoDynamicBtn = $('marcoDynamicBtn');
  if (marcoDynamicBtn) {
    marcoDynamicBtn.addEventListener('click', () => {
      clearMarcoActive();
      marcoDynamicBtn.classList.add('active');
      isManualOverride = false;
      infoModal.hidden = true;
      isModalOpen = false;
      cancelGaze();
      eventLine('Modo interactivo dinámico de 3 s restablecido.');
    });
  }

  // Sensores de orientación física (giroscopio para celular con HTTPS)
  const listenOrientation = (event) => {
    if ([event.alpha, event.beta, event.gamma].every((v) => v == null)) return;
    orientationEvents++;
    const now = Date.now();
    if (now - lastUpdate > 350) {
      lastUpdate = now;
      const fmt = (v) => (typeof v === 'number' ? v.toFixed(1) + '°' : 'N/D');
      if (angles) {
        angles.textContent = `Ángulos de orientación: α ${fmt(event.alpha)} · β ${fmt(event.beta)} · γ ${fmt(event.gamma)}`;
      }
      if (status) {
        status.textContent = `Sensores: ${orientationEvents} muestras recibidas. Mueve el teléfono para explorar el cielo.`;
      }
    }
  };
  window.addEventListener('deviceorientation', listenOrientation);

  if (permissionButton) {
    permissionButton.addEventListener('click', () => {
      if (!window.DeviceOrientationEvent) {
        status.textContent = 'Sensores: API DeviceOrientationEvent no disponible en este dispositivo.';
        return;
      }
      if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
        window.DeviceOrientationEvent.requestPermission()
          .then((res) => {
            eventLine(`Permiso de orientación: ${res}`);
            status.textContent = res === 'granted'
              ? 'Permiso de sensores concedido. Mueve tu dispositivo para orientar la vista.'
              : 'Permiso denegado. Puedes usar la pantalla táctil o modo web 2D.';
          })
          .catch((err) => {
            eventLine(`Error de permiso: ${err.message}`);
          });
      } else {
        status.textContent = 'Sensores activos sin requerir solicitud previa.';
      }
    });
  }

  // Componente de Vista Dividida Estereoscópica Experimental (Homido)
  if (window.AFRAME) {
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
  }

  function onSceneReady() {
    if (!stereoComponent && scene.components) {
      stereoComponent = scene.components['experimental-stereo'];
    }
    if (stereoButton) stereoButton.disabled = !stereoComponent;
    if (stereoStatus) {
      stereoStatus.textContent = 'Escena 3D lista. Compatible con modo 2D y vista dividida Homido.';
    }
  }

  if (scene.hasLoaded) onSceneReady();
  else scene.addEventListener('loaded', onSceneReady, { once: true });

  // Control de activación de vista dividida
  function exitStereo() {
    if (!stereoActive) return;
    stereoActive = false;
    if (stereoComponent) stereoComponent.enabledStereo = false;
    host.classList.remove('stereo-active');
    document.body.classList.remove('stereo-mode');
    exitButton.hidden = true;
    stereoButton.disabled = false;
    stereoStatus.textContent = 'Vista dividida desactivada. Continuando en modo web 2D.';
    eventLine('Vista dividida desactivada.');
    window.dispatchEvent(new Event('resize'));
  }

  if (stereoButton) {
    stereoButton.addEventListener('click', () => {
      if (!stereoComponent || !scene.hasLoaded) return;
      stereoActive = true;
      stereoComponent.enabledStereo = true;
      host.classList.add('stereo-active');
      document.body.classList.add('stereo-mode');
      exitButton.hidden = false;
      stereoButton.disabled = true;
      stereoStatus.textContent = 'Vista dividida ACTIVA para Homido. Gira el teléfono a horizontal.';
      eventLine('Vista dividida activada.');
      window.dispatchEvent(new Event('resize'));
    });
  }

  if (exitButton) exitButton.addEventListener('click', exitStereo);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isModalOpen) closeInfoModal();
      else exitStereo();
    }
  });

  // Copia y limpieza de registro
  $('copyButton').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(logs.join('\n'));
      eventLine('Registro de auditoría copiado.');
    } catch (_) {
      eventLine('Copia no permitida automáticamente.');
    }
  });

  $('clearButton').addEventListener('click', () => {
    logs.length = 0;
    logEl.textContent = '';
    eventLine('Registro reiniciado.');
  });
})();
