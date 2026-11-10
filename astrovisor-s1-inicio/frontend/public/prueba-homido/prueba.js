/* AstroVisor — Sprint 3: recorrido Homido con tres constelaciones y ficha dinámica.
   - Constelaciones generadas desde datos (js/datos.js + js/figuras.js); ficha única (js/ficha-canvas.js).
   - Selección por mirada de 3 s con anillo #F5B301, confirmación verde, cancelación y gracia (js/gaze-dwell.js).
   - Pausa (de la MIRADA) y Salir a 2D siempre disponibles, también con la ficha abierta.
   - Clic/toque equivalen a la selección por mirada para pruebas fuera del visor.
   - Audio: el reproductor ES el de Luis (audio/narration.js, vía narraciones.js). Contrato: window.astrovisorVisor y eventos
     astrovisor:ficha-abierta/-cerrada/audio-solicitado/salida-visor (ver docs/PRUEBA-S3-HOMIDO.md).
*/
import { cargarDatos, adaptarAudio } from './js/datos.js';
import { FIGURAS, posicionEnEsfera, frenteDeCamara } from './js/figuras.js';
import { crearConstelacion, crearAnillo, actualizarAnillo, vincularEtiqueta, COLOR_CONFIRMADO } from './js/escena-constelaciones.js';
import { crearDwell } from './js/gaze-dwell.js';
import { crearEstado } from './js/visor-estado.js';
import { registrarCielo } from './js/cielo.js';
import { vistasOjos } from './js/estereo.js';
import { leerParametros, iniciarDiagnostico } from './js/diagnostico.js';
import { calcularLayout, dibujarFicha, zonaAMundo, presentarAudio, PLANO_ALTO } from './js/ficha-canvas.js';
import { crearEstanteria3D, extraerLibros, calcularDetalleLibro } from './js/estanteria-3d.js';
import { rutaLibro2D } from './js/ruta-libro-2d.js';

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

  eventLine(`Prueba iniciada | Recorrido de tres constelaciones | ${new Date().toISOString()}`);
  eventLine(`Navegador: ${navigator.userAgent}`);
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

  const constelacionesEl = $('constelaciones');
  const visorControls3D = $('visorControls3D');
  const pauseBtn3D = $('pauseBtn3D');
  const exitBtn3D = $('exitBtn3D');
  const infoPanel3D = $('infoPanel3D');
  const estanteriaEl = $('estanteria3D');
  const cardPlane = $('cardPlane');
  const cardCanvas = $('cardCanvas');

  const etiquetaPausa = vincularEtiqueta($('pause3DLabel'), 'Pausar mirada', { ancho: 1.2, alto: 0.3 });
  vincularEtiqueta($('exit3DLabel'), 'Salir a 2D', { ancho: 1.2, alto: 0.3 });

  const estado = crearEstado();
  const fichas = new Map(); // id -> ficha del JSON
  const constelaciones = new Map(); // id -> { el, resaltar }
  let selectionCount = 0;
  let orientationEvents = 0;
  let lastUpdate = 0;
  let stereoActive = false;
  let stereoComponent;
  let narracion = null; // último estado REAL del reproductor (narraciones.js); null = sin reproductor/audio
  let sincronizando = false; // true mientras narraciones.js nos abre/cierra la ficha (no se le devuelve el evento)
  let layoutActual = null;
  let vistaLectura = 'ficha'; // ficha | estanteria | detalle; modo de visor continúa en 'ficha'
  let libroSeleccionado = null;
  let estanteria = null;
  let userReady = false; // evita autodisparos mientras la persona acomoda el visor

  // Geometría de la escena (m): la ficha termina en y=0.9 y los controles quedan debajo, sin tocarla
  const FICHA_BASE_Y = 0.9;
  const POS_CONTROLES = { recorrido: '0 0.45 -3.5' };
  const POS_CONTROLES_Y = 0.45;

  // --- Retroalimentación auditiva (Web Audio) ---
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

  function playPauseSound(pausado) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      if (pausado) {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(311.13, ctx.currentTime + 0.14);
      } else {
        osc.frequency.setValueAtTime(311.13, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.14);
      }
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (_) {}
  }

  // --- Objetivos de mirada: cada elemento con data-action; elementos con la misma acción+id comparten carga ---
  function objetivoDe(el) {
    const accion = el.getAttribute('data-action');
    if (!accion) return null;
    const id = el.getAttribute('data-id') || '';
    const ringId = el.getAttribute('data-ring');
    return { key: `${accion}:${id}`, accion, id, el, anillo: ringId ? $(ringId) : null };
  }

  function nombreDe(t) {
    if (t.accion === 'constelacion') return fichas.get(t.id)?.titulo || t.id;
    return { volver: '← Volver al recorrido', audio: 'Escuchar narración', libros: 'Ver libros recomendados', libro: 'Abrir libro', 'volver-ficha': 'Volver a la constelación', 'volver-libros': 'Volver a los libros', 'consultar-libro': 'Consultar libro en 2D', pausa: estado.pausado ? 'Reanudar mirada' : 'Pausar mirada', salir: 'Salir a 2D' }[t.accion] || t.accion;
  }

  function mensajeEnReposo() {
    if (estado.pausado) return 'Mirada en PAUSA. Enfoca "Reanudar mirada" para continuar, o "Salir a 2D" para salir.';
    if (estado.modo === 'ficha' && vistaLectura === 'estanteria') return 'Biblioteca de las estrellas: mira una portada 3 segundos o vuelve a la constelación.';
    if (estado.modo === 'ficha' && vistaLectura === 'detalle') return 'Libro seleccionado: consulta en 2D o vuelve a los libros con la mirada.';
    if (estado.modo === 'ficha') return `Ficha de ${fichas.get(estado.fichaId)?.titulo ?? ''} abierta. Enfoca "← Volver al recorrido" durante 3 s o tócalo.`;
    return 'Mirada activa: enfoca una constelación o un botón durante 3 s para seleccionarlo.';
  }

  /** La selección de libros comparte la mirada existente, pero solo enfoca la vista activa. */
  function objetivoEnVista(t) {
    if (t.accion === 'pausa' || t.accion === 'salir') return true;
    if (t.accion === 'constelacion') return estado.modo === 'recorrido';
    if (['audio', 'volver', 'libros'].includes(t.accion)) return vistaLectura === 'ficha';
    if (['libro', 'volver-ficha'].includes(t.accion)) return vistaLectura === 'estanteria';
    if (['consultar-libro', 'volver-libros'].includes(t.accion)) return vistaLectura === 'detalle';
    return false;
  }

  const dwell = crearDwell({
    puedeEnfocar: (t) => userReady && estado.permitido(t.accion, 'mirada') && objetivoEnVista(t),
    onInicio: (t) => {
      eventLine(`Mirada fija sobre [${nombreDe(t)}] — iniciando carga de 3 s`);
      if (t.accion === 'constelacion') constelaciones.get(t.id)?.resaltar(true);
    },
    onEtapa: (etapa, t, ms) => eventLine(`Carga ${t.accion}: ${etapa} (${Math.round(ms)} ms)`),
    onProgreso: (p, etapa, t) => {
      actualizarAnillo(t.anillo, p);
      selectionStatus.textContent = `Enfocando ${nombreDe(t)}: etapa ${etapa} (${Math.round(p * 100)} %)...`;
    },
    onCancelar: (t, ms) => {
      eventLine(`Mirada retirada a los ${ms} ms — carga reiniciada a 0 %`);
      actualizarAnillo(t.anillo, 0);
      if (t.accion === 'constelacion') constelaciones.get(t.id)?.resaltar(false);
      selectionStatus.textContent = mensajeEnReposo();
    },
    onConfirmar: (t) => {
      actualizarAnillo(t.anillo, 1, COLOR_CONFIRMADO);
      playConfirmationSound();
      setTimeout(() => {
        ejecutar(t, 'mirada');
        actualizarAnillo(t.anillo, 0);
      }, 100);
    },
  });

  // --- Acciones (las mismas para mirada y para clic/toque) ---
  function ejecutar(t, via) {
    if (!estado.permitido(t.accion, via) || !objetivoEnVista(t)) return;
    if (t.accion === 'constelacion') abrirFicha(t.id);
    else if (t.accion === 'volver') cerrarFicha();
    else if (t.accion === 'audio') pedirAudio();
    else if (t.accion === 'pausa') alternarPausa();
    else if (t.accion === 'libros') abrirEstanteria();
    else if (t.accion === 'libro') abrirDetalleLibro(t.id);
    else if (t.accion === 'volver-ficha') volverAFicha();
    else if (t.accion === 'volver-libros') volverAEstanteria();
    else if (t.accion === 'consultar-libro') consultarLibro2D();
    else if (t.accion === 'salir') salir();
  }

  /** Muestra/oculta un grupo y solo hace "selectable" lo visible, para que el raycaster no vea objetos ocultos. */
  function activarGrupo(grupo, activo) {
    grupo.setAttribute('visible', activo ? 'true' : 'false');
    grupo.querySelectorAll('[data-action]').forEach((el) => el.classList.toggle('selectable', activo));
  }

  function refrescarRaycaster() {
    const rc = gazeCursor && gazeCursor.components && gazeCursor.components.raycaster;
    if (rc) rc.refreshObjects();
    // La retícula puede quedar ya sobre un objetivo sin generar un evento nuevo
    setTimeout(comprobarFoco, 250);
  }

  function comprobarFoco() {
    if (!userReady || estado.pausado || dwell.activo) return;
    const rc = gazeCursor && gazeCursor.components && gazeCursor.components.raycaster;
    const els = rc && rc.intersectedEls;
    if (!els) return;
    for (const el of els) {
      const t = el && el.getAttribute && objetivoDe(el);
      if (t && el.classList.contains('selectable') && dwell.enfocar(t)) break;
    }
  }

  function actualizarTextura() {
    const mesh = cardPlane && cardPlane.getObject3D('mesh');
    if (mesh && mesh.material && mesh.material.map) {
      mesh.material.map.needsUpdate = true;
    } else if (cardPlane) {
      cardPlane.setAttribute('material', 'shader: flat; src: #cardCanvas; transparent: true');
    }
  }

  /** Reutiliza un único canvas para ficha de constelación y detalle de libro. */
  function pintarLayout(layout) {
    layoutActual = layout;
    dibujarFicha(cardCanvas.getContext('2d'), layout);
    actualizarTextura();
    infoPanel3D.querySelectorAll('[id^="zona-"][data-action]').forEach((zona) => {
      zona.classList.remove('selectable');
      zona.setAttribute('visible', 'false');
    });
    for (const [nombre, rect] of Object.entries(layout.zonas)) colocarZona(nombre, rect);
  }

  function pintarFicha(ficha) {
    if (vistaLectura !== 'ficha' || !ficha) return;
    const ctx = cardCanvas.getContext('2d');
    const audio = presentarAudio(narracion);
    const layout = calcularLayout(ctx, ficha, { aviso: audio.aviso, etiquetaAudio: audio.etiqueta });
    if (layout.desborda) eventLine('Aviso: el contenido de ' + ficha.id + ' no cabe completo en la ficha.');
    pintarLayout(layout);
  }

  function colocarZona(nombre, rect) {
    const accion = nombre; // 'audio' | 'volver'
    let zona = $(`zona-${accion}`);
    const m = zonaAMundo(rect);
    const rout = m.alto * 0.44;
    const rin = m.alto * 0.3;
    const xAnillo = -m.ancho / 2 + m.alto / 2;
    if (!zona) {
      zona = document.createElement('a-plane');
      zona.setAttribute('id', `zona-${accion}`);
      zona.setAttribute('data-action', accion);
      zona.setAttribute('data-ring', `zona-anillo-${accion}`);
      zona.setAttribute('material', 'shader: flat; opacity: 0.001; transparent: true');
      infoPanel3D.appendChild(zona);
      crearAnillo(document, zona, { id: `zona-anillo-${accion}`, rin, rout, x: xAnillo, z: 0.02 });
      ligar(zona);
      zona.classList.toggle('selectable', estado.modo === 'ficha');
    }
    zona.setAttribute('visible', 'true');
    zona.classList.add('selectable');
    zona.setAttribute('position', `${m.x} ${m.y} 0.05`);
    zona.setAttribute('width', m.ancho);
    zona.setAttribute('height', m.alto);
    const anillo = $(`zona-anillo-${accion}`);
    anillo.setAttribute('data-rin', rin);
    anillo.setAttribute('data-rout', rout);
    anillo.setAttribute('position', `${xAnillo} 0 0.02`);
  }

  function frenteAlFrente(distancia) {
    const camara = scene.camera;
    if (!camara) return frenteDeCamara(0, -1, distancia);
    const dir = new AFRAME.THREE.Vector3();
    camara.getWorldDirection(dir);
    return frenteDeCamara(dir.x, dir.z, distancia);
  }

  function abrirFicha(id) {
    const ficha = fichas.get(id);
    if (!ficha || !estado.abrirFicha(id)) return;
    vistaLectura = 'ficha';
    libroSeleccionado = null;
    activarGrupo(estanteriaEl, false);
    dwell.cancelar();
    constelaciones.forEach((c) => c.resaltar(false));
    if (!sincronizando) narracion = null; // hasta que el reproductor confirme el audio de ESTA ficha (si nos abre él, su estado ya llegó)
    selectionCount++;
    // La ficha y sus controles aparecen frente a donde mira la persona (las constelaciones están a ±40°)
    const frente = frenteAlFrente(3.0);
    infoPanel3D.setAttribute('position', `${frente.x} ${FICHA_BASE_Y + PLANO_ALTO / 2} ${frente.z}`);
    infoPanel3D.setAttribute('rotation', `0 ${frente.rotY} 0`);
    pintarFicha(ficha);
    activarGrupo(constelacionesEl, false);
    activarGrupo(infoPanel3D, true);
    visorControls3D.setAttribute('position', `${frente.x} ${POS_CONTROLES_Y} ${frente.z}`);
    visorControls3D.setAttribute('rotation', `0 ${frente.rotY} 0`);
    refrescarRaycaster();
    selectionStatus.textContent = `✔ Selección #${selectionCount} completada. ${mensajeEnReposo()}`;
    eventLine(`✔ Selección #${selectionCount}: ficha de ${ficha.titulo} abierta.`);
    if (!sincronizando) window.dispatchEvent(new CustomEvent('astrovisor:ficha-abierta', { detail: ficha }));
  }

  function cerrarFicha() {
    if (!estado.volver()) return;
    dwell.cancelar();
    if (!sincronizando) narracion = null;
    vistaLectura = 'ficha';
    libroSeleccionado = null;
    activarGrupo(estanteriaEl, false);
    activarGrupo(infoPanel3D, false);
    activarGrupo(constelacionesEl, true);
    visorControls3D.setAttribute('position', POS_CONTROLES.recorrido);
    visorControls3D.setAttribute('rotation', '0 0 0');
    refrescarRaycaster();
    selectionStatus.textContent = mensajeEnReposo();
    eventLine('Regreso al recorrido de constelaciones.');
    if (!sincronizando) window.dispatchEvent(new Event('astrovisor:ficha-cerrada'));
  }

  /** El panel y la estantería siempre se colocan delante de la dirección actual de la mirada. */
  function colocarVistaFrente(grupo) {
    const frente = frenteAlFrente(3.0);
    const y = grupo === estanteriaEl ? 1.9 : FICHA_BASE_Y + PLANO_ALTO / 2;
    grupo.setAttribute('position', frente.x + ' ' + y + ' ' + frente.z);
    grupo.setAttribute('rotation', '0 ' + frente.rotY + ' 0');
    visorControls3D.setAttribute('position', frente.x + ' ' + POS_CONTROLES_Y + ' ' + frente.z);
    visorControls3D.setAttribute('rotation', '0 ' + frente.rotY + ' 0');
  }

  function abrirEstanteria() {
    if (vistaLectura !== 'ficha' || estado.modo !== 'ficha' || !estanteria?.libros.length) return;
    dwell.cancelar();
    vistaLectura = 'estanteria';
    colocarVistaFrente(estanteriaEl);
    estanteria.mostrar(estado.fichaId);
    activarGrupo(infoPanel3D, false);
    activarGrupo(estanteriaEl, true);
    refrescarRaycaster();
    selectionStatus.textContent = mensajeEnReposo();
    eventLine('Estantería 3D de demostración abierta.');
  }

  function abrirDetalleLibro(id) {
    if (vistaLectura !== 'estanteria') return;
    const libro = estanteria?.libros.find((l) => l.id === id);
    if (!libro) return;
    dwell.cancelar();
    libroSeleccionado = libro;
    vistaLectura = 'detalle';
    colocarVistaFrente(infoPanel3D);
    pintarLayout(calcularDetalleLibro(cardCanvas.getContext('2d'), libro));
    activarGrupo(estanteriaEl, false);
    activarGrupo(infoPanel3D, true);
    refrescarRaycaster();
    selectionStatus.textContent = mensajeEnReposo();
    eventLine('Libro seleccionado: ' + libro.titulo);
  }

  function volverAEstanteria() {
    if (vistaLectura !== 'detalle') return;
    dwell.cancelar();
    libroSeleccionado = null;
    vistaLectura = 'estanteria';
    colocarVistaFrente(estanteriaEl);
    activarGrupo(infoPanel3D, false);
    activarGrupo(estanteriaEl, true);
    refrescarRaycaster();
    selectionStatus.textContent = mensajeEnReposo();
  }

  function volverAFicha() {
    if (vistaLectura !== 'estanteria') return;
    dwell.cancelar();
    vistaLectura = 'ficha';
    colocarVistaFrente(infoPanel3D);
    pintarFicha(fichas.get(estado.fichaId));
    activarGrupo(estanteriaEl, false);
    activarGrupo(infoPanel3D, true);
    refrescarRaycaster();
    selectionStatus.textContent = mensajeEnReposo();
  }

  function consultarLibro2D() {
    if (vistaLectura !== 'detalle' || !libroSeleccionado) return;
    const url = rutaLibro2D(libroSeleccionado);
    dwell.cancelar();
    cerrarFicha(); // el evento ficha-cerrada detiene la narración de Luis
    if (stereoActive) void exitStereo();
    else window.dispatchEvent(new Event('astrovisor:salida-visor'));
    eventLine('Consultar libro fuera del visor: ' + url);
    window.location.href = url;
  }

  // Audio: el reproductor es el de Luis (narraciones.js). Aquí solo se SOLICITA la acción (Escuchar/Pausar/Reanudar
  // según su estado) y se MUESTRA el estado que él confirma; no se reproduce nada desde la escena.
  function pedirAudio() {
    const ficha = fichas.get(estado.fichaId);
    if (!ficha) return;
    window.dispatchEvent(new CustomEvent('astrovisor:audio-solicitado', { detail: { id: ficha.id, titulo: ficha.titulo, audio: adaptarAudio(ficha) } }));
    eventLine(`Botón de narración: solicitud enviada al reproductor (${adaptarAudio(ficha) ? 'audio asociado' : 'sin audio asociado'}).`);
  }

  function sincronizar(accion) {
    sincronizando = true;
    try { accion(); } finally { sincronizando = false; }
  }

  // Contrato con narraciones.js (Luis). La pausa de la mirada NO toca la narración.
  window.astrovisorVisor = {
    constelaciones() {}, // el recorrido ya se construye con cargarDatos(); se acepta la llamada por compatibilidad
    abrir: (historia) => sincronizar(() => {
      if (estado.modo === 'ficha' && (estado.fichaId !== historia?.id || vistaLectura !== 'ficha')) cerrarFicha();
      abrirFicha(historia?.id);
    }),
    cerrar: () => sincronizar(() => { if (estado.modo === 'ficha') cerrarFicha(); }),
    estadoNarracion(nuevo) {
      narracion = nuevo;
      if (estado.modo === 'ficha' && vistaLectura === 'ficha') pintarFicha(fichas.get(estado.fichaId));
    },
  };

  function alternarPausa() {
    const pausado = estado.alternarPausa();
    dwell.cancelar();
    playPauseSound(pausado);
    etiquetaPausa.actualizar(pausado ? 'Reanudar mirada' : 'Pausar mirada');
    pauseBtn3D.setAttribute('color', pausado ? '#B26A00' : '#1B2A5A');
    if (pauseButton) {
      pauseButton.textContent = pausado ? 'Reanudar mirilla' : 'Pausar mirilla';
      pauseButton.style.background = pausado ? '#e59b3d' : '';
      pauseButton.style.color = pausado ? '#fff' : '';
    }
    selectionStatus.textContent = pausado
      ? 'Mirada en PAUSA: la selección por mirada está desactivada. Salir a 2D sigue disponible.'
      : mensajeEnReposo();
    eventLine(pausado ? 'Mirada pausada.' : 'Mirada reanudada.');
    if (!pausado) setTimeout(comprobarFoco, 250);
  }

  function desmontarVisor() {
    window.removeEventListener('deviceorientation', listenOrientation);
    liberarPantalla();
    window.dispatchEvent(new Event('astrovisor:salida-visor'));
  }

  function salir() {
    desmontarVisor();
    selectionStatus.textContent = '✔ Salida confirmada. Regresando al modo web 2D...';
    eventLine('✔ Salida a 2D y liberación de sensores completada.');
    setTimeout(() => {
      if (stereoActive) exitStereo();
      window.location.href = '/explorar';
    }, 250);
  }

  // --- Eventos de mirada y de clic/toque sobre cada elemento con data-action ---
  function soltar(el) {
    const t = objetivoDe(el);
    if (t && dwell.activo && dwell.activo.key === t.key) dwell.desenfocar();
  }

  function ligar(el) {
    const enfocar = () => { const t = objetivoDe(el); if (t) dwell.enfocar(t); };
    el.addEventListener('mouseenter', enfocar);
    el.addEventListener('raycaster-intersected', enfocar);
    el.addEventListener('mouseleave', () => soltar(el));
    el.addEventListener('raycaster-intersected-cleared', () => soltar(el));
    el.addEventListener('click', () => {
      userReady = true;
      const t = objetivoDe(el);
      if (!t || !estado.permitido(t.accion, 'clic') || !objetivoEnVista(t)) return;
      dwell.cancelar();
      playConfirmationSound();
      ejecutar(t, 'clic');
    });
  }

  if (gazeCursor) {
    gazeCursor.addEventListener('raycaster-intersection', (evt) => {
      if (dwell.activo) return;
      const els = evt.detail && evt.detail.els;
      const t = els && els.length ? objetivoDe(els[0]) : null;
      if (t) dwell.enfocar(t);
    });
    gazeCursor.addEventListener('raycaster-intersection-cleared', (evt) => {
      const activo = dwell.activo;
      if (!activo) return;
      const liberados = evt.detail && evt.detail.clearedEls;
      if (!liberados || liberados.some((el) => objetivoDe(el)?.key === activo.key)) dwell.desenfocar();
    });
  }

  ligar(pauseBtn3D);
  ligar(exitBtn3D);

  setTimeout(() => { userReady = true; comprobarFoco(); }, 600);
  window.addEventListener('mousemove', () => { userReady = true; comprobarFoco(); }, { once: true });
  window.addEventListener('touchstart', () => { userReady = true; comprobarFoco(); }, { once: true });

  function mostrarAvisoError3D(titulo, mensaje) {
    if (!cardCanvas) return;
    const ctx = cardCanvas.getContext('2d');
    const W = 1400, H = 1200;
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(40, 40, W - 80, H - 80);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#D9534F';
    ctx.strokeRect(40, 40, W - 80, H - 80);

    ctx.fillStyle = '#FDF2F2';
    ctx.fillRect(80, 80, 320, 60);
    ctx.fillStyle = '#9B2C2C';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Aviso del Visor', 240, 110);

    ctx.fillStyle = '#1A202C';
    ctx.font = 'bold 56px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(titulo, 80, 180);

    ctx.fillStyle = '#4A5568';
    ctx.font = '36px system-ui, sans-serif';
    const palabras = String(mensaje).split(/\s+/);
    let linea = '', y = 280;
    for (const p of palabras) {
      const prueba = linea ? `${linea} ${p}` : p;
      if (ctx.measureText(prueba).width > 1200) {
        ctx.fillText(linea, 80, y);
        linea = p;
        y += 56;
      } else {
        linea = prueba;
      }
    }
    if (linea) ctx.fillText(linea, 80, y);

    ctx.fillStyle = '#1B2A5A';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.fillText('Enfoca con la mirada o toca el botón «Salir a 2D» para volver.', 80, y + 80);

    actualizarTextura();
    const frente = frenteAlFrente(3.0);
    infoPanel3D.setAttribute('position', `${frente.x} ${FICHA_BASE_Y + PLANO_ALTO / 2} ${frente.z}`);
    infoPanel3D.setAttribute('rotation', `0 ${frente.rotY} 0`);
    activarGrupo(infoPanel3D, true);

    visorControls3D.setAttribute('position', `${frente.x} ${POS_CONTROLES_Y} ${frente.z}`);
    visorControls3D.setAttribute('rotation', `0 ${frente.rotY} 0`);
    activarGrupo(visorControls3D, true);
    setTimeout(() => {
      actualizarTextura();
      refrescarRaycaster();
    }, 100);
  }

  // --- Datos y construcción de las constelaciones ---
  async function iniciarContenido() {
    registrarCielo(AFRAME);
    const cielo = document.createElement('a-entity');
    cielo.setAttribute('campo-estelar', '');
    scene.appendChild(cielo);
    const horizonte = document.createElement('a-entity');
    horizonte.setAttribute('horizonte-nocturno', '');
    scene.appendChild(horizonte);
    const esperar = scene.hasLoaded ? Promise.resolve() : new Promise((ok) => scene.addEventListener('loaded', ok, { once: true }));
    let carga;
    const params = new URLSearchParams(window.location.search);
    const forzarError = params.get('error') === '1' || params.get('simularError') === '1';
    try {
      if (forzarError) throw new Error('Fallo simulado mediante ?error=1');
      carga = await cargarDatos();
    } catch (error) {
      await esperar;
      selectionStatus.textContent = 'No se pudieron cargar las constelaciones. Usa "Salir a 2D".';
      eventLine(`Error al cargar datos: ${error.message}`);
      mostrarAvisoError3D('No fue posible cargar las historias', 'Ocurrió un problema de conexión con los contenidos. Si estás usando el visor, enfoca o pulsa «Salir a 2D» para volver a la pantalla principal.');
      return;
    }
    await esperar;
    eventLine(carga.fuente === 'api'
      ? 'Datos de constelaciones: API /api/contenidos/recorridos.'
      : `Datos de constelaciones: respaldo local de DEMOSTRACIÓN (API no disponible: ${carga.motivo}).`);
    const lista = carga.datos.filter((f) => {
      if (FIGURAS[f.id]) return true;
      eventLine(`Constelación "${f.id}" sin figura 3D definida: omitida del recorrido.`);
      return false;
    });
    lista.forEach((ficha, i) => {
      fichas.set(ficha.id, ficha);
      const figura = FIGURAS[ficha.id];
      const dir = figura.direccion ?? { az: (i * 360) / lista.length, el: 25 };
      const c = crearConstelacion(document, { ficha, figura, pos: posicionEnEsfera(dir.az, dir.el) });
      constelaciones.set(ficha.id, c);
      constelacionesEl.appendChild(c.el);
      c.el.querySelectorAll('[data-action]').forEach(ligar);
    });
    estanteria = crearEstanteria3D(document, estanteriaEl, extraerLibros(lista), ligar);
    activarGrupo(estanteriaEl, false);
    activarGrupo(constelacionesEl, true);
    activarGrupo(visorControls3D, true);
    refrescarRaycaster();
    eventLine(`Recorrido listo con ${lista.length} constelaciones: ${lista.map((f) => f.titulo).join(', ')}.`);
    selectionStatus.textContent = mensajeEnReposo();
  }

  window.AstroVisorHomido = { estado, abrirFicha, cerrarFicha }; // ayuda para depurar en el dispositivo

  if (pauseButton) pauseButton.addEventListener('click', alternarPausa);

  const reticleToggleButton = $('reticleToggleButton');
  const reticleGroup = $('reticleGroup');
  let reticleVisible = true;

  if (reticleToggleButton && reticleGroup) {
    reticleToggleButton.addEventListener('click', () => {
      reticleVisible = !reticleVisible;
      reticleGroup.setAttribute('visible', reticleVisible ? 'true' : 'false');
      reticleToggleButton.textContent = reticleVisible ? 'Ocultar mirilla guía' : 'Mostrar mirilla guía';
      eventLine(reticleVisible ? 'Mirilla visual activada como guía.' : 'Modo mirada pura activo (sin puntito en pantalla).');
    });
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
      const size = renderer.getSize(new AFRAME.THREE.Vector2()); // px CSS (ver js/estereo.js)
      const vistas = vistasOjos(size.x, size.y);
      const camera = this.el.camera;
      camera.updateWorldMatrix(true, false);
      this.stereoCamera.aspect = vistas.aspecto;
      this.stereoCamera.update(camera);
      renderer.setScissorTest(true);
      for (const [vista, ojo] of [[vistas.izquierdo, this.stereoCamera.cameraL], [vistas.derecho, this.stereoCamera.cameraR]]) {
        renderer.setViewport(vista.x, vista.y, vista.ancho, vista.alto);
        renderer.setScissor(vista.x, vista.y, vista.ancho, vista.alto);
        renderer.clear(true, true, true);
        renderer.render(this.el.object3D, ojo);
      }
      renderer.setScissorTest(false);
      renderer.setViewport(0, 0, size.x, size.y);
    },
  });

  scene.setAttribute('experimental-stereo', '');
  iniciarContenido();
  if (leerParametros(location.search).activo) iniciarDiagnostico({ scene, log: eventLine }); // ?diag=1: modo temporal de aislamiento

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
    if (estado.modo === 'ficha') cerrarFicha();
    window.dispatchEvent(new Event('astrovisor:salida-visor'));
    if (!stereoActive) return;
    stereoActive = false;
    if (stereoComponent) stereoComponent.enabledStereo = false;
    host.classList.remove('stereo-active');
    document.body.classList.remove('stereo-mode');
    exitButton.hidden = true;
    stereoButton.disabled = false;
    stereoStatus.textContent = 'Vista dividida desactivada. Continuando en modo 2D.';
    eventLine('Vista dividida desactivada.');
    liberarPantalla();
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
    prepararPantallaCompleta();
    requestAnimationFrame(() => {
      if (scene && scene.resize) scene.resize();
      window.dispatchEvent(new Event('resize'));
    });
  });

  // Mejoras para el visor: pantalla completa, horizontal fijo y pantalla encendida (según soporte del navegador)
  let bloqueoPantalla = null;
  async function prepararPantallaCompleta() {
    const intentar = async (nombre, fn) => {
      try { await fn(); eventLine(`${nombre}: activado.`); } catch (e) { eventLine(`${nombre}: no disponible (${e.name || e.message}).`); }
    };
    if (host.requestFullscreen) await intentar('Pantalla completa', () => host.requestFullscreen());
    if (screen.orientation && screen.orientation.lock) await intentar('Bloqueo horizontal', () => screen.orientation.lock('landscape'));
    if (navigator.wakeLock) await intentar('Pantalla siempre encendida', async () => { bloqueoPantalla = await navigator.wakeLock.request('screen'); });
    if (window.innerHeight > window.innerWidth) stereoStatus.textContent = 'Gira el teléfono a horizontal para ver las dos mitades.';
    window.dispatchEvent(new Event('resize'));
  }
  function liberarPantalla() {
    if (bloqueoPantalla) { bloqueoPantalla.release().catch(() => {}); bloqueoPantalla = null; }
    if (screen.orientation && screen.orientation.unlock) { try { screen.orientation.unlock(); } catch (_) {} }
    if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
  }

  exitButton.addEventListener('click', exitStereo);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (estado.modo === 'ficha') cerrarFicha();
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
