/* AstroVisor — Sprint 2: Selección por mirada accesible (Karime)
   - Retícula y permanencia de 3 segundos sin prisa (#F5B301).
   - Anillo de carga sobre el punto de la constelación.
   - Ficha de información accesible con diseño oficial de Karime (Págs. 13-15 y 18).
   - Integrada 100% DENTRO DE LA ESCENA 3D en alta definición sobre lienzo accesible.
   - Botón "Escuchar", ficha de biblioteca "Dato de muestra" y "← Volver al recorrido" operable por mirada o toque.
   - Controles 3D DENTRO DE LA INMERSIÓN: [|| Pausa] y [Salir] (Págs. 11-12) operables por mirada o toque.
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
  eventLine(`Prueba iniciada | S2: Controles 3D y ficha dentro de la inmersión | ${new Date().toISOString()}`);
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
  const gazeCursor = $('gazeCursor');

  // Controles 3D dentro de la inmersión (Págs. 11-12)
  const pauseBtn3D = $('pauseBtn3D');
  const pauseBtn3DInner = $('pauseBtn3DInner');
  const pauseProgressRing = $('pauseProgressRing');
  const pause3DText = $('pause3DText');

  const exitBtn3D = $('exitBtn3D');
  const exitBtn3DInner = $('exitBtn3DInner');
  const exitProgressRing = $('exitProgressRing');

  // Elementos de la escena 3D
  const targetContainer = $('targetContainer');
  const target = $('target');
  const targetProgressRing = $('targetProgressRing');
  const infoPanel3D = $('infoPanel3D');
  const cardPlane = $('cardPlane');
  const returnBtn3D = $('returnBtn3D');
  const returnProgressRing = $('returnProgressRing');
  const audioBtn3D = $('audioBtn3D');
  const reticleRing = $('reticleRing');
  const centerDot = $('centerDot');
  const cardCanvas = $('cardCanvas');

  // Constantes visuales
  const TARGET_BASE_COLOR = '#e59b3d';
  const CONFIRM_COLOR = '#1E7B3A'; // Verde de éxito según WCAG AAA
  const DWELL_TIME_MS = 3000;      // 3 segundos sin prisa (para adultos mayores)

  let orientationEvents = 0;
  let lastUpdate = 0;
  let lastSample;
  let selectionCount = 0;
  let stereoActive = false;
  let stereoComponent;
  let isPaused = false;
  let isModalOpen = false;
  let audioNoticeActive = false;

  // Evita que se autodispare el punto al cargar la página antes de que el usuario empiece a interactuar
  let userReady = false;
  setTimeout(() => { userReady = true; }, 1000);
  window.addEventListener('mousemove', () => { userReady = true; }, { once: true });
  window.addEventListener('touchstart', () => { userReady = true; }, { once: true });

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

      gain.gain.setValueAtTime(0.14, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (_) {}
  }

  // Utilidades de dibujo para la tarjeta accesible en alta resolución (1400x1100 px)
  function roundRect(ctx, x, y, width, height, radius, fill, stroke, strokeWidth = 1) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke && strokeWidth > 0) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();
    }
  }

  function renderWrappedText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, y);
    return y + lineHeight;
  }

  // Dibuja la tarjeta blanca de Karime con tipografía y acentos 100% nítidos en el canvas 3D
  function drawConstellationCard(showNotice = false) {
    if (!cardCanvas) return;
    const ctx = cardCanvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, cardCanvas.width, cardCanvas.height);
    ctx.save();

    // Fondo: tarjeta blanca con esquinas redondeadas y borde sutil
    roundRect(ctx, 40, 40, 1320, 1020, 32, '#FFFFFF', '#D0D5DD', 4);

    // 1. Cabecera: Etiqueta "Dato de muestra"
    roundRect(ctx, 80, 80, 220, 46, 10, '#EEECFA', '#C9B8FF', 2);
    ctx.fillStyle = '#4A3F99';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Dato de muestra', 80 + 110, 80 + 23);

    // Botón X para cerrar en la esquina superior derecha
    ctx.fillStyle = '#667085';
    ctx.font = 'bold 36px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('×', 1310, 100);

    // 2. Título de la Constelación y subtítulo
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#1B2430';
    ctx.font = 'bold 54px system-ui, -apple-system, sans-serif';
    ctx.fillText('Orión', 80, 190);

    ctx.fillStyle = '#4A5565';
    ctx.font = '24px system-ui, -apple-system, sans-serif';
    ctx.fillText('Historia y significado accesible', 80, 230);

    // 3. Párrafo de historia (con todos los acentos bien legibles)
    ctx.fillStyle = '#2D3748';
    ctx.font = '27px system-ui, -apple-system, sans-serif';
    const story = 'Orión parece una figura con dos hombros, dos pies y tres estrellas alineadas en el centro que forman su cinturón. Para encontrarla, busca primero esas tres estrellas juntas en el cielo nocturno.';
    renderWrappedText(ctx, story, 80, 285, 1220, 42);

    // 4. Botón "▶ Escuchar"
    roundRect(ctx, 80, 415, 210, 58, 12, '#1F4E8C', null, 0);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('▶  Escuchar', 80 + 105, 415 + 29);

    // Aviso informativo accesible si se pulsa "Escuchar"
    if (showNotice) {
      roundRect(ctx, 310, 415, 780, 58, 8, '#FFF9E6', '#F5B301', 2);
      ctx.fillStyle = '#614700';
      ctx.font = '21px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText('ℹ️  La narración aún no está disponible. Puedes leer el texto.', 330, 415 + 30);
    }

    // 5. Caja de Recomendación en biblioteca (Págs. 13-15 de Karime)
    roundRect(ctx, 80, 500, 1240, 310, 16, '#FAF7F0', '#E2DCD0', 2);

    ctx.fillStyle = '#4A5565';
    ctx.font = 'bold 24px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Si te interesa saber más, tenemos este libro en la biblioteca:', 110, 545);

    // Ficha blanca del libro
    roundRect(ctx, 110, 575, 1180, 145, 12, '#FFFFFF', '#C9CED6', 2);

    // Icono de libro
    ctx.font = '54px system-ui, -apple-system, sans-serif';
    ctx.fillText('📖', 140, 665);

    // Etiqueta mini "Dato de muestra"
    roundRect(ctx, 230, 595, 160, 30, 6, '#EEECFA', '#C9B8FF', 1.5);
    ctx.fillStyle = '#4A3F99';
    ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Dato de muestra', 230 + 80, 595 + 16);

    // Título del libro
    ctx.fillStyle = '#1F4E8C';
    ctx.font = 'bold 28px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Libro de muestra 1 — Guía de constelaciones', 230, 668);

    // Autor
    ctx.fillStyle = '#718096';
    ctx.font = '22px system-ui, -apple-system, sans-serif';
    ctx.fillText('Autor de muestra', 230, 702);

    // Instrucción para el mostrador
    ctx.fillStyle = '#1E7B3A';
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.fillText('Pídelo en persona en el mostrador de la biblioteca.', 110, 785);

    // 6. Botón "← Volver al recorrido"
    roundRect(ctx, 420, 840, 560, 80, 16, '#1F4E8C', null, 0);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('←  Volver al recorrido', 420 + 280, 840 + 40);

    ctx.restore();

    // Notificar a Three.js / WebGL que la textura del plano se actualizó
    if (cardPlane) {
      const mesh = cardPlane.getObject3D('mesh');
      if (mesh && mesh.material && mesh.material.map) {
        mesh.material.map.needsUpdate = true;
      }
    }
  }

  // Inicializar tarjeta en el canvas
  drawConstellationCard(false);
  if (scene) {
    if (scene.hasLoaded) drawConstellationCard(false);
    else scene.addEventListener('loaded', () => drawConstellationCard(false), { once: true });
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
    if (!userReady) return;
    const action = el.getAttribute('data-action') || 'target';

    // Si está pausado, solo permite interactuar con el botón de Pausa (para reanudar)
    if (isPaused && action !== 'pause') return;
    if (activeTarget === el) return;

    if (gazeRaf) {
      cancelAnimationFrame(gazeRaf);
      gazeRaf = null;
    }

    activeTarget = el;
    if (action === 'target') {
      activeRing = targetProgressRing;
      activeRadii = { inner: 0.50, outer: 0.70 };
      eventLine('Mirada fija sobre Orión — iniciando carga de 3 s');
    } else if (action === 'return') {
      activeRing = returnProgressRing;
      activeRadii = { inner: 0.10, outer: 0.16 };
      eventLine('Mirada fija sobre [Volver al recorrido] — iniciando carga de 3 s');
    } else if (action === 'pause') {
      activeRing = pauseProgressRing;
      activeRadii = { inner: 0.08, outer: 0.12 };
      eventLine(`Mirada fija sobre [${isPaused ? 'Reanudar' : 'Pausa'} 3D] — iniciando carga de 3 s`);
    } else if (action === 'exit') {
      activeRing = exitProgressRing;
      activeRadii = { inner: 0.08, outer: 0.12 };
      eventLine('Mirada fija sobre [Salir 3D] — iniciando carga de 3 s');
    } else if (action === 'audio') {
      activeRing = null;
    }

    gazeStartTime = performance.now();
    currentStage = '0%';
    if (activeRing) {
      setRingProgress(activeRing, 0.002, '#F5B301', activeRadii.inner, activeRadii.outer);
    }

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

      if (activeRing) {
        setRingProgress(activeRing, progress, '#F5B301', activeRadii.inner, activeRadii.outer);
      }
      selectionStatus.textContent = `Enfocando ${action}: etapa ${stage} (${Math.round(progress * 100)} %)...`;

      if (progress >= 1.0) {
        completeGazeSelection(activeTarget, action);
      } else {
        gazeRaf = requestAnimationFrame(tick);
      }
    }

    gazeRaf = requestAnimationFrame(tick);
  }

  function cancelGaze() {
    if (gazeRaf) {
      cancelAnimationFrame(gazeRaf);
      gazeRaf = null;
    }
    if (!activeTarget) return;

    const elapsed = gazeStartTime ? Math.round(performance.now() - gazeStartTime) : 0;
    eventLine(`Mirada retirada a los ${elapsed} ms — carga reiniciada a 0 %`);
    selectionStatus.textContent = isModalOpen
      ? 'Ficha 3D de Orión abierta. Enfoca "← Volver al recorrido" o pulsa sobre él.'
      : isPaused
        ? 'Mirilla en PAUSA. Enfoca [▶ Reanudar] para continuar.'
        : 'Mirada retirada. Anillo reiniciado a 0 %.';
    currentStage = '0%';

    setRingProgress(targetProgressRing, 0, '#F5B301', 0.50, 0.70);
    setRingProgress(returnProgressRing, 0, '#F5B301', 0.10, 0.16);
    setRingProgress(pauseProgressRing, 0, '#F5B301', 0.08, 0.12);
    setRingProgress(exitProgressRing, 0, '#F5B301', 0.08, 0.12);
    target.setAttribute('color', TARGET_BASE_COLOR);

    activeTarget = null;
    activeRing = null;
  }

  function completeGazeSelection(el, action) {
    if (gazeRaf) cancelAnimationFrame(gazeRaf);
    gazeRaf = null;

    if (activeRing) {
      setRingProgress(activeRing, 1.0, CONFIRM_COLOR, activeRadii.inner, activeRadii.outer);
    }
    playConfirmationSound();

    if (action === 'target') {
      selectionCount++;
      target.setAttribute('color', CONFIRM_COLOR);
      selectionStatus.textContent = `✔ Selección #${selectionCount} COMPLETADA: abriendo información de Orión en el visor 3D...`;
      eventLine(`✔ Selección #${selectionCount} completada: abriendo ficha 3D de Orión.`);

      activeTarget = null;
      activeRing = null;

      setTimeout(() => {
        openConstellationInfo3D();
        setRingProgress(targetProgressRing, 0, '#F5B301', 0.50, 0.70);
        target.setAttribute('color', TARGET_BASE_COLOR);
      }, 100);
    } else if (action === 'return') {
      selectionStatus.textContent = '✔ Volviendo al cielo nocturno...';
      eventLine('✔ Cerrando ficha 3D y volviendo a las constelaciones.');

      activeTarget = null;
      activeRing = null;

      setTimeout(() => {
        closeConstellationInfo3D();
        setRingProgress(returnProgressRing, 0, '#F5B301', 0.10, 0.16);
      }, 100);
    } else if (action === 'pause') {
      activeTarget = null;
      activeRing = null;
      setTimeout(() => {
        setRingProgress(pauseProgressRing, 0, '#F5B301', 0.08, 0.12);
        togglePause();
      }, 120);
    } else if (action === 'exit') {
      selectionStatus.textContent = '✔ Saliendo del visor inmersivo...';
      eventLine('✔ Saliendo del visor inmersivo hacia el modo web 2D (/explorar).');
      activeTarget = null;
      activeRing = null;
      setTimeout(() => {
        if (stereoActive) exitStereo();
        window.location.href = '/explorar';
      }, 300);
    } else if (action === 'audio') {
      audioNoticeActive = !audioNoticeActive;
      drawConstellationCard(audioNoticeActive);
      activeTarget = null;
      activeRing = null;
    }
  }

  function openConstellationInfo3D() {
    isModalOpen = true;
    if (infoPanel3D) infoPanel3D.setAttribute('visible', 'true');
    if (targetContainer) targetContainer.setAttribute('visible', 'false');
    drawConstellationCard(audioNoticeActive);

    // Refrescar raycaster para que detecte de inmediato a returnBtn3D
    if (gazeCursor && gazeCursor.components && gazeCursor.components.raycaster) {
      gazeCursor.components.raycaster.refreshObjects();
    }

    selectionStatus.textContent = 'Ficha 3D abierta. Enfoca "← Volver al recorrido" durante 3 s o tócalo para regresar.';
    eventLine('Ficha accesible 3D de Orión abierta dentro de la escena.');
  }

  function closeConstellationInfo3D() {
    isModalOpen = false;
    if (infoPanel3D) infoPanel3D.setAttribute('visible', 'false');
    if (targetContainer) targetContainer.setAttribute('visible', 'true');
    cancelGaze();

    if (gazeCursor && gazeCursor.components && gazeCursor.components.raycaster) {
      gazeCursor.components.raycaster.refreshObjects();
    }

    selectionStatus.textContent = 'De vuelta en el cielo nocturno. Enfoca el punto de nuevo durante 3 s para abrir su información.';
    eventLine('Regresando a las constelaciones (Visor: 0 %).');
  }

  function handleSelectableClick(el) {
    userReady = true;
    const action = el.getAttribute('data-action') || 'target';
    if (action === 'target' && !isModalOpen) {
      selectionCount++;
      playConfirmationSound();
      openConstellationInfo3D();
    } else if (action === 'return' && isModalOpen) {
      playConfirmationSound();
      closeConstellationInfo3D();
    } else if (action === 'pause') {
      playConfirmationSound();
      togglePause();
    } else if (action === 'exit') {
      playConfirmationSound();
      if (stereoActive) exitStereo();
      window.location.href = '/explorar';
    } else if (action === 'audio' && isModalOpen) {
      playConfirmationSound();
      audioNoticeActive = !audioNoticeActive;
      drawConstellationCard(audioNoticeActive);
      eventLine('Botón Escuchar pulsado en la tarjeta 3D.');
    }
  }

  // Conectar eventos sobre todos los objetos seleccionables (.selectable)
  function bindSelectableElements() {
    const selectableEls = document.querySelectorAll('.selectable');
    selectableEls.forEach((el) => {
      // Eventos estándar de A-Frame cursor
      el.addEventListener('mouseenter', () => startGaze(el));
      el.addEventListener('mouseleave', cancelGaze);
      // Eventos directos del raycaster para máxima fiabilidad en WebGL
      el.addEventListener('raycaster-intersected', () => startGaze(el));
      el.addEventListener('raycaster-intersected-cleared', cancelGaze);
      // Eventos de clic / toque táctil
      el.addEventListener('click', () => handleSelectableClick(el));
    });
  }

  if (scene) {
    if (scene.hasLoaded) bindSelectableElements();
    else scene.addEventListener('loaded', bindSelectableElements, { once: true });
  }

  // Lógica sincronizada para Pausar / Reanudar mirilla (Panel y botones 3D dentro del visor)
  function togglePause() {
    isPaused = !isPaused;
    if (isPaused) {
      cancelGaze();
      if (pauseButton) {
        pauseButton.textContent = 'Reanudar mirilla';
        pauseButton.style.background = '#e59b3d';
        pauseButton.style.color = '#fff';
      }
      if (pause3DText) {
        pause3DText.setAttribute('value', '>  Reanudar');
      }
      if (pauseBtn3DInner) {
        pauseBtn3DInner.setAttribute('color', '#E59B3D');
      }
      selectionStatus.textContent = 'Mirilla en PAUSA: permanencia desactivada para descanso visual.';
      eventLine('Mirilla pausada para descanso visual.');
    } else {
      if (pauseButton) {
        pauseButton.textContent = 'Pausar mirilla';
        pauseButton.style.background = '';
        pauseButton.style.color = '';
      }
      if (pause3DText) {
        pause3DText.setAttribute('value', '||  Pausa');
      }
      if (pauseBtn3DInner) {
        pauseBtn3DInner.setAttribute('color', '#1F4E8C');
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
    userReady = true;
    const now = Date.now();
    if (now - lastUpdate > 400) {
      lastUpdate = now;
      const fmt = (v) => (typeof v === 'number' ? v.toFixed(1) + '°' : 'N/D');
      angles.textContent = `Orientación recibida: α ${fmt(event.alpha)} · β ${fmt(event.beta)} · γ ${fmt(event.gamma)}`;
      status.textContent = `Sensores: recibidos ${orientationEvents} eventos. Mueve el teléfono para orientar.`;
    }
    if (orientationEvents === 1) eventLine('Se recibió el primer evento de orientación con datos.');
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
    drawConstellationCard(audioNoticeActive);
    bindSelectableElements();
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
      if (isModalOpen) closeConstellationInfo3D();
      else if (stereoActive) exitStereo();
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
