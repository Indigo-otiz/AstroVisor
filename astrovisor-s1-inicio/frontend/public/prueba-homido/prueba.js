/* AstroVisor — Sprint 3: recorrido Homido con tres constelaciones y ficha dinámica.
   - Constelaciones generadas desde datos (js/datos.js + js/figuras.js); ficha única (js/ficha-canvas.js).
   - Selección por mirada de 3 s con anillo #F5B301, confirmación verde, cancelación y gracia (js/gaze-dwell.js).
   - Pausa (de la MIRADA) y Salir a 2D siempre disponibles, también con la ficha abierta.
   - Clic/toque equivalen a la selección por mirada para pruebas fuera del visor.
   - Audio: el reproductor ES el de Luis (audio/narration.js, vía narraciones.js). Contrato: window.astrovisorVisor y eventos
     astrovisor:ficha-abierta/-cerrada/audio-solicitado/salida-visor (ver docs/PRUEBA-S3-HOMIDO.md).
*/
import { cargarDatosCompartidos, adaptarAudio } from './js/datos.js';
import { FIGURAS, posicionEnEsfera, frenteDeCamara } from './js/figuras.js';
import { crearConstelacion, crearAnillo, actualizarAnillo, vincularEtiqueta, COLOR_CONFIRMADO } from './js/escena-constelaciones.js';
import { crearDwell } from './js/gaze-dwell.js';
import { crearEstado } from './js/visor-estado.js';
import { registrarCielo } from './js/cielo.js';
import { vistasOjos } from './js/estereo.js';
import { leerParametros, iniciarDiagnostico } from './js/diagnostico.js';
import { calcularLayout, dibujarFicha, zonaAMundo, presentarAudio, PLANO_ALTO } from './js/ficha-canvas.js';
import { crearEstanteria3D, extraerLibros, calcularDetalleLibro, LIMITES_ESTANTERIA } from './js/estanteria-3d.js';
import { anclajePanel, escalaPanel, alturasPanel, crearPruebaVisibilidad, crearCierreFueraDeVista, LIMITES_CONTROLES } from './js/panel-espacial.js';
import { rutaLibro2D } from './js/ruta-libro-2d.js';

(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const modo = document.documentElement.dataset.visor;
  const diagnostico = modo === 'diagnostico';
  const pantalla = modo === 'pantalla';
  const logEl = $('log');
  const logs = [];
  const eventLine = (message) => {
    if (!diagnostico) return;
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
  const camaraRig = $('cameraRig');
  const avisoPublico = $('publicNotice');
  const fullscreenButton = $('fullscreenButton');
  const publicExit = $('publicExit');

  function avisar(mensaje) {
    if (avisoPublico) {
      avisoPublico.textContent = mensaje;
      avisoPublico.hidden = !mensaje;
    }
  }

  const constelacionesEl = $('constelaciones');
  const visorControls3D = $('visorControls3D');
  const pauseBtn3D = $('pauseBtn3D');
  const exitBtn3D = $('exitBtn3D');
  const infoPanel3D = $('infoPanel3D');
  const estanteriaEl = $('estanteria3D');
  const cardPlane = $('cardPlane');
  const detailCover = $('detailCover');
  const cardCanvas = $('cardCanvas');

  function crearBotonPildora3D(el, textoInicial) {
    if (!el) return { actualizar() {} };
    const canvas = document.createElement('canvas');
    canvas.id = 'tex-pausa-pildora';
    canvas.width = 680;
    canvas.height = 168;
    document.querySelector('a-assets')?.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const dibujar = (texto, pausado = false) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const r = 74;
      const x = 10, y = 10, w = canvas.width - 20, h = canvas.height - 20;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
      ctx.fillStyle = pausado ? 'rgba(92, 56, 14, 0.78)' : 'rgba(11, 21, 48, 0.72)';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = pausado ? 'rgba(245, 200, 66, 0.78)' : 'rgba(148, 197, 248, 0.48)';
      ctx.stroke();

      ctx.fillStyle = '#e2e8f0';
      ctx.font = '600 54px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(texto, canvas.width / 2, canvas.height / 2 + 2);

      const mesh = el.getObject3D && el.getObject3D('mesh');
      if (mesh && mesh.material && mesh.material.map) mesh.material.map.needsUpdate = true;
    };
    dibujar(textoInicial, false);
    el.setAttribute('material', { shader: 'flat', transparent: true, depthWrite: false, src: `#${canvas.id}` });
    return { actualizar: (texto, pausado) => dibujar(texto, pausado) };
  }

  const etiquetaPausa = crearBotonPildora3D(pauseBtn3D, 'Solo mirar');
  if ($('exit3DLabel')) vincularEtiqueta($('exit3DLabel'), 'Salir', { ancho: 1.2, alto: 0.3 });

  const estado = crearEstado();
  const fichas = new Map(); // id -> ficha del JSON
  const constelaciones = new Map(); // id -> { el, resaltar }
  let selectionCount = 0;
  let orientationEvents = 0;
  let lastUpdate = 0;
  let stereoActive = false;
  let stereoComponent;
  let bloqueoPantalla = null;
  let movimientoAutorizado = typeof window.DeviceOrientationEvent?.requestPermission !== 'function';
  let narracion = null; // último estado REAL del reproductor (narraciones.js); null = sin reproductor/audio
  let actualizarInmersion = null;
  let sincronizando = false; // true mientras narraciones.js nos abre/cierra la ficha (no se le devuelve el evento)
  let vistaLectura = 'ficha'; // ficha | estanteria | detalle; modo de visor continúa en 'ficha'
  let libroSeleccionado = null;
  let recorridosBibliograficos = [];
  let estanteria = null;
  let userReady = false; // evita autodisparos mientras la persona acomoda el visor
  let saliendo = false;
  let anclajeLectura = null;
  let escalaLectura = null;
  let limitesFicha = null;
  const cierreFueraDeVista = crearCierreFueraDeVista();

  // Geometría de la escena (m): la ficha termina en y=0.9 y los controles en reposo van justo debajo de los logos
  const FICHA_BASE_Y = 0.9;
  const POS_CONTROLES_Y = 1.55;
  const direccionInicial = FIGURAS['can-mayor'].direccion;
  const controlesRecorrido = posicionEnEsfera(0, 0, 3.5, POS_CONTROLES_Y);

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
    if (!el) return null;
    const targetEl = el.closest ? el.closest('[data-action]') : (el.getAttribute && el.getAttribute('data-action') ? el : null);
    if (!targetEl || !targetEl.getAttribute) return null;
    const accion = targetEl.getAttribute('data-action');
    if (!accion) return null;
    const id = targetEl.getAttribute('data-id') || '';
    const ringId = targetEl.getAttribute('data-ring');
    return { key: `${accion}:${id}`, accion, id, el: targetEl, anillo: ringId ? $(ringId) : null };
  }

  function nombreDe(t) {
    if (t.accion === 'constelacion') return fichas.get(t.id)?.titulo || t.id;
    return { volver: 'Cerrar ficha', audio: 'Escuchar narración', repetir: 'Repetir narración desde el inicio', libros: 'Ver libros recomendados', libro: 'Abrir libro', 'volver-ficha': 'Volver a la constelación', 'volver-libros': 'Volver a los libros', 'consultar-libro': 'Consultar libro en 2D', pausa: estado.pausado ? 'Reanudar' : 'Solo mirar', salir: 'Salir' }[t.accion] || t.accion;
  }

  function mensajeEnReposo() {
    if (estado.pausado) return 'Modo solo mirar activo. Enfoca "Reanudar" para volver a seleccionar.';
    if (estado.modo === 'ficha' && vistaLectura === 'estanteria') return 'Biblioteca de las estrellas: mira una portada 3 segundos o vuelve a la constelación.';
    if (estado.modo === 'ficha' && vistaLectura === 'detalle') return 'Libro seleccionado: consulta en 2D o vuelve a los libros con la mirada.';
    if (estado.modo === 'ficha') return `Ficha de ${fichas.get(estado.fichaId)?.titulo ?? ''} abierta. Enfoca la "✕" durante 3 s o tócala para cerrar.`;
    return 'Mirada activa: enfoca una constelación o un botón durante 3 s para seleccionarlo.';
  }

  /** La selección de libros comparte la mirada existente, pero solo enfoca la vista activa. */
  function objetivoEnVista(t) {
    if (t.accion === 'pausa' || t.accion === 'salir') return true;
    if (t.accion === 'constelacion') return estado.modo === 'recorrido';
    if (['audio', 'repetir', 'volver', 'libros'].includes(t.accion)) return vistaLectura === 'ficha';
    if (['libro', 'volver-ficha'].includes(t.accion)) return vistaLectura === 'estanteria';
    if (['consultar-libro', 'volver-libros'].includes(t.accion)) return vistaLectura === 'detalle';
    return false;
  }

  const dwell = crearDwell({
    graciaMs: 750, // ventana de gracia generosa (750 ms) para evitar cancelaciones por micro-temblor
    puedeEnfocar: (t) => !saliendo && userReady && t.el.classList.contains('selectable') &&
      estado.permitido(t.accion, 'mirada') && objetivoEnVista(t),
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
    if (saliendo || !t.el.classList.contains('selectable') || !estado.permitido(t.accion, via) || !objetivoEnVista(t)) return;
    if (t.accion === 'constelacion') abrirFicha(t.id);
    else if (t.accion === 'volver') cerrarFicha();
    else if (t.accion === 'audio') pedirAudio();
    else if (t.accion === 'repetir') repetirAudio();
    else if (t.accion === 'pausa') alternarPausa();
    else if (t.accion === 'libros') abrirEstanteria();
    else if (t.accion === 'libro') abrirDetalleLibro(t.id);
    else if (t.accion === 'volver-ficha') volverAFicha();
    else if (t.accion === 'volver-libros') volverAEstanteria();
    else if (t.accion === 'consultar-libro') consultarLibro2D();
    else if (t.accion === 'salir') salir('/');
  }

  /** Muestra/oculta un grupo y solo hace "selectable" lo visible, para que el raycaster no vea objetos ocultos. */
  function activarGrupo(grupo, activo) {
    grupo.setAttribute('visible', activo ? 'true' : 'false');
    grupo.querySelectorAll('[data-action]').forEach((el) => {
      el.classList.toggle('selectable', activo && el.getAttribute('visible') !== false);
    });
  }

  function refrescarRaycaster() {
    const rc = gazeCursor && gazeCursor.components && gazeCursor.components.raycaster;
    if (rc) rc.refreshObjects();
    // La retícula puede quedar ya sobre un objetivo sin generar un evento nuevo
    setTimeout(comprobarFoco, 250);
  }

  function comprobarFoco() {
    if (saliendo || !userReady || dwell.activo) return;
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
      cardPlane.setAttribute('material', 'shader: flat; src: #cardCanvas; transparent: true; depthWrite: false');
    }
  }

  /** Reutiliza un único canvas para ficha de constelación y detalle de libro. */
  function pintarLayout(layout) {
    limitesFicha = zonaAMundo(layout.items.find((item) => item.k === 'caja').rect);
    dibujarFicha(cardCanvas.getContext('2d'), layout);
    actualizarTextura();
    detailCover.setAttribute('visible', Boolean(layout.portada));
    if (layout.portada) {
      const portada = zonaAMundo(layout.portada);
      detailCover.setAttribute('position', `${portada.x} ${portada.y} 0.02`);
      detailCover.setAttribute('width', portada.ancho);
      detailCover.setAttribute('height', portada.alto);
      detailCover.setAttribute('material', `shader: flat; src: #cubierta-vr-${libroSeleccionado.id}`);
    }
    infoPanel3D.querySelectorAll('[id^="zona-"][data-action]').forEach((zona) => {
      zona.classList.remove('selectable');
      zona.setAttribute('visible', 'false');
    });
    for (const [nombre, rect] of Object.entries(layout.zonas)) colocarZona(nombre, rect);
    gazeCursor.components?.raycaster?.refreshObjects();
  }

  function pintarFicha(ficha) {
    if (vistaLectura !== 'ficha' || !ficha) return;
    const ctx = cardCanvas.getContext('2d');
    const audio = presentarAudio(narracion);
    const hayLibro = extraerLibros(recorridosBibliograficos, ficha.id).length > 0;
    const layout = calcularLayout(ctx, ficha, audio, hayLibro);
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
    anclajeLectura = anclajePanel(constelaciones.get(id).direccion);
    cierreFueraDeVista.reiniciar();
    pintarFicha(ficha);
    colocarVistaAnclada();
    // S5: Mantener constelaciones visibles de fondo y resaltar la activa
    constelacionesEl.setAttribute('visible', 'true');
    constelacionesEl.querySelectorAll('[data-action]').forEach((el) => el.classList.remove('selectable'));
    constelaciones.forEach((c, cId) => c.resaltar(cId === id));
    activarGrupo(infoPanel3D, true);
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
    anclajeLectura = null;
    cierreFueraDeVista.reiniciar();
    activarGrupo(estanteriaEl, false);
    activarGrupo(infoPanel3D, false);
    activarGrupo(constelacionesEl, true);
    constelaciones.forEach((c) => c.resaltar(false));
    colocarControlesRecorrido();
    refrescarRaycaster();
    selectionStatus.textContent = mensajeEnReposo();
    eventLine('Regreso al recorrido de constelaciones.');
    if (!sincronizando) window.dispatchEvent(new Event('astrovisor:ficha-cerrada'));
  }

  function limitesVistaActiva() {
    return vistaLectura === 'estanteria' ? LIMITES_ESTANTERIA : limitesFicha;
  }

  function colocarControlesRecorrido() {
    const { x, y, z, rotY } = controlesRecorrido;
    const controles = visorControls3D.object3D;
    controles.position.set(x, y, z);
    controles.rotation.set(0, rotY * Math.PI / 180, 0);
    controles.scale.setScalar(1);
  }

  function grupoVistaActiva() {
    return vistaLectura === 'estanteria' ? estanteriaEl.object3D : infoPanel3D.object3D;
  }

  function ajustarVistaAnclada(aspecto) {
    if (!anclajeLectura || !(aspecto > 0)) return;
    const escala = escalaPanel(scene.camera.fov, aspecto);
    if (escala === escalaLectura) return;
    escalaLectura = escala;
    const { x, y, z, rotY } = anclajeLectura;
    const alturas = alturasPanel(y, escala, limitesVistaActiva());
    const orientar = (objeto, altura) => {
      objeto.position.set(x, altura, z);
      objeto.rotation.set(0, rotY * Math.PI / 180, 0);
      objeto.scale.setScalar(escala);
    };
    orientar(grupoVistaActiva(), alturas.panel);
    orientar(visorControls3D.object3D, alturas.controles);
  }

  function colocarVistaAnclada() {
    escalaLectura = null;
    if (scene.camera) ajustarVistaAnclada(scene.camera.aspect / (stereoActive ? 2 : 1));
  }

  function abrirEstanteria() {
    if (vistaLectura !== 'ficha' || estado.modo !== 'ficha') return;
    const libros = extraerLibros(recorridosBibliograficos, estado.fichaId);
    if (!libros.length) return;
    dwell.cancelar();
    estanteriaEl.replaceChildren();
    document.querySelectorAll('[data-portada-homido]').forEach(c => c.remove());
    estanteria = crearEstanteria3D(document, estanteriaEl, libros, ligar, pantalla);
    vistaLectura = 'estanteria';
    colocarVistaAnclada();
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
    pintarLayout(calcularDetalleLibro(cardCanvas.getContext('2d'), libro));
    colocarVistaAnclada();
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
    colocarVistaAnclada();
    activarGrupo(infoPanel3D, false);
    activarGrupo(estanteriaEl, true);
    refrescarRaycaster();
    selectionStatus.textContent = mensajeEnReposo();
  }

  function volverAFicha() {
    if (vistaLectura !== 'estanteria') return;
    dwell.cancelar();
    vistaLectura = 'ficha';
    pintarFicha(fichas.get(estado.fichaId));
    colocarVistaAnclada();
    activarGrupo(estanteriaEl, false);
    activarGrupo(infoPanel3D, true);
    refrescarRaycaster();
    selectionStatus.textContent = mensajeEnReposo();
  }

  function consultarLibro2D() {
    if (vistaLectura !== 'detalle' || !libroSeleccionado) return;
    const destino = rutaLibro2D(libroSeleccionado);
    const queryVisor = destino.includes('?') ? '&origen=visor' : '?origen=visor';
    salir(destino + queryVisor);
  }

  // Audio: el reproductor es el de Luis (narraciones.js). Aquí solo se SOLICITA la acción (Escuchar/Pausar/Reanudar
  // según su estado) y se MUESTRA el estado que él confirma; no se reproduce nada desde la escena.
  function repetirAudio() {
    const ficha = fichas.get(estado.fichaId);
    if (!ficha) return;
    window.dispatchEvent(new CustomEvent('astrovisor:audio-repetir', { detail: { id: ficha.id, titulo: ficha.titulo, audio: adaptarAudio(ficha) } }));
    eventLine('Botón de repetir: solicitud de reinicio enviada al narrador.');
  }

  function pedirAudio(accion = 'audio') {
    const ficha = fichas.get(estado.fichaId);
    if (!ficha) return;
    window.dispatchEvent(new CustomEvent('astrovisor:audio-solicitado', { detail: { id: ficha.id, titulo: ficha.titulo, audio: adaptarAudio(ficha), accion } }));
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
      if (typeof actualizarInmersion === 'function') actualizarInmersion();
      if (estado.modo === 'ficha' && vistaLectura === 'ficha') pintarFicha(fichas.get(estado.fichaId));
    },
  };

  function alternarPausa() {
    const pausado = estado.alternarPausa();
    dwell.cancelar();
    playPauseSound(pausado);
    etiquetaPausa.actualizar(pausado ? 'Reanudar' : 'Solo mirar', pausado);
    if (pauseButton) {
      pauseButton.textContent = pausado ? 'Reanudar' : 'Solo mirar';
      pauseButton.style.background = pausado ? '#e59b3d' : '';
      pauseButton.style.color = pausado ? '#fff' : '';
    }
    selectionStatus.textContent = pausado
      ? 'Modo solo mirar activo: la selección por mirada está pausada.'
      : mensajeEnReposo();
    eventLine(pausado ? 'Mirada pausada.' : 'Mirada reanudada.');
    if (!pausado) setTimeout(comprobarFoco, 250);
  }

  function desmontarVisor() {
    saliendo = true;
    try { dwell.cancelar(); } catch {}
    try { window.removeEventListener('deviceorientation', listenOrientation); } catch {}
    try {
      const controles = camaraRig?.components?.['look-controls'];
      controles?.magicWindowControls?.disconnect?.();
      controles?.pause?.();
    } catch {}
    try {
      exitStereo();
    } catch (e) {
      console.error('Error al salir de estéreo:', e);
    }
  }

  function salir(destino = '/') {
    const url = typeof destino === 'string' && destino ? destino : '/';
    if (saliendo) return;
    try {
      desmontarVisor();
    } catch (e) {
      console.error('Error al desmontar visor:', e);
    }
    if (selectionStatus) {
      selectionStatus.textContent = '✔ Salida confirmada. Regresando a la pantalla de inicio...';
    }
    try {
      window.location.assign(url);
    } catch {
      window.location.href = url;
    }
  }
  if (publicExit) publicExit.addEventListener('click', (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    salir();
  });

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
      if (!els || !els.length) return;
      for (const el of els) {
        const t = objetivoDe(el);
        if (t && dwell.enfocar(t)) break;
      }
    });
    gazeCursor.addEventListener('raycaster-intersection-cleared', (evt) => {
      const activo = dwell.activo;
      if (!activo) return;
      const liberados = evt.detail && evt.detail.clearedEls;
      if (!liberados || liberados.some((el) => objetivoDe(el)?.key === activo.key)) dwell.desenfocar();
    });
  }

  if (pauseBtn3D) ligar(pauseBtn3D);
  if (exitBtn3D) ligar(exitBtn3D);
  const pause3DLabel = $('pause3DLabel');
  if (pause3DLabel) ligar(pause3DLabel);
  const exit3DLabel = $('exit3DLabel');
  if (exit3DLabel) ligar(exit3DLabel);

  if (diagnostico) setTimeout(() => { userReady = true; comprobarFoco(); }, 600);
  window.addEventListener('mousemove', () => { userReady = true; comprobarFoco(); }, { once: true });
  window.addEventListener('touchstart', () => { userReady = true; comprobarFoco(); }, { once: true });

  function enlazarPuntero() {
    const canvas = scene.canvas;
    if (!canvas) return;
    const raycaster = new AFRAME.THREE.Raycaster();
    const punto = new AFRAME.THREE.Vector2();
    let pointerDownPos = null;

    canvas.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.button !== 0) return;
      pointerDownPos = { x: event.clientX, y: event.clientY };
    });

    canvas.addEventListener('pointerup', (event) => {
      if (!pointerDownPos) return;
      const dx = Math.hypot(event.clientX - pointerDownPos.x, event.clientY - pointerDownPos.y);
      pointerDownPos = null;
      if (dx > 12 || !scene.camera) return; // Si arrastró, fue rotación de cámara, no clic directo

      const rect = canvas.getBoundingClientRect();
      punto.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(punto, scene.camera);

      const mallas = Array.from(scene.querySelectorAll('.selectable'), (el) => el.getObject3D('mesh')).filter(Boolean);
      const impactos = raycaster.intersectObjects(mallas, true);
      if (impactos.length > 0) {
        let obj = impactos[0].object;
        let el = obj.el;
        while (!el && obj.parent) {
          obj = obj.parent;
          el = obj.el;
        }
        const targetEl = el?.closest ? el.closest('[data-action]') : el;
        const target = targetEl && objetivoDe(targetEl);
        if (target && estado.permitido(target.accion, 'clic') && objetivoEnVista(target)) {
          userReady = true;
          dwell.cancelar();
          playConfirmationSound();
          ejecutar(target, 'clic');
        }
      }
    });
  }

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
    ctx.fillText('Pulsa el botón «Salir» para volver.', 80, y + 80);

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
      carga = await cargarDatosCompartidos();
    } catch (error) {
      await esperar;
      avisar('No pudimos cargar las historias. Puedes volver a la web 2D.');
      selectionStatus.textContent = 'No se pudieron cargar las constelaciones. Usa "Salir".';
      if ($('fuenteDatos')) $('fuenteDatos').textContent = 'No hay una fuente de contenidos disponible.';
      eventLine(`Error al cargar datos: ${error.message}`);
      mostrarAvisoError3D('No fue posible cargar las historias', 'Ocurrió un problema de conexión con los contenidos. Pulsa «Salir» para volver a la pantalla principal.');
      return;
    }
    await esperar;
    eventLine(carga.fuente === 'api'
      ? 'Datos de constelaciones: API /api/contenidos/recorridos.'
      : carga.aviso);
    $('fuenteDatos').textContent = carga.aviso;
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
      constelaciones.set(ficha.id, { ...c, direccion: dir });
      constelacionesEl.appendChild(c.el);
      c.el.querySelectorAll('[data-action]').forEach(ligar);
    });
    recorridosBibliograficos = lista;
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
  function iniciarMovimiento() {
    if (saliendo || !movimientoAutorizado) return;
    const controles = camaraRig.components?.['look-controls'];
    if (controles?.data.magicWindowTrackingEnabled) controles.magicWindowControls?.connect();
    window.addEventListener('deviceorientation', listenOrientation);
  }

  permissionButton.addEventListener('click', () => {
    if (!window.DeviceOrientationEvent) {
      status.textContent = 'Sensores: API no disponible.';
      eventLine('DeviceOrientationEvent no disponible.');
      return;
    }
    if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
      window.DeviceOrientationEvent.requestPermission()
        .then((result) => {
          if (saliendo) return;
          if (result === 'granted') {
            movimientoAutorizado = true;
            iniciarMovimiento();
          }
          eventLine(`Permiso de orientación: ${result}`);
          status.textContent = result === 'granted'
            ? 'Permiso concedido. Mueve el teléfono para enfocar el punto.'
            : 'Permiso denegado. Puedes usar la pantalla táctil o el mouse.';
          if (!diagnostico) {
            permissionButton.hidden = result === 'granted';
            avisar(result === 'granted' ? '' : 'El movimiento está bloqueado. Permítelo en el navegador o vuelve a la web 2D.');
          }
        })
        .catch((error) => {
          status.textContent = 'Error al pedir permiso. Revisa la configuración del navegador.';
          avisar('No se pudo activar el movimiento. Revisa los permisos o vuelve a la web 2D.');
          eventLine(`Error de permiso: ${error.message || ''}`);
        });
    } else {
      status.textContent = 'Este navegador no requiere solicitud previa; mueve el teléfono para orientar.';
      eventLine('Esperando eventos de orientación directos.');
    }
  });

  // A-Frame Estereoscópico
  if (!window.AFRAME) {
    avisar('No se pudo abrir la escena. Puedes leer las historias en la web 2D.');
    stereoStatus.textContent = 'A-Frame no pudo cargarse.';
    return;
  }

  const enCampoDeVision = crearPruebaVisibilidad(AFRAME.THREE);
  function vigilarVista(tiempo, aspecto, camara, otroOjo) {
    if (!anclajeLectura || saliendo) return;
    ajustarVistaAnclada(aspecto);
    const grupo = grupoVistaActiva();
    const limites = limitesVistaActiva();
    const visibleEn = (vista) => enCampoDeVision(vista, grupo, limites) ||
      enCampoDeVision(vista, visorControls3D.object3D, LIMITES_CONTROLES);
    const visible = visibleEn(camara) || Boolean(otroOjo && visibleEn(otroOjo));
    if (cierreFueraDeVista.debeCerrar(visible, tiempo)) cerrarFicha();
  }

  AFRAME.registerComponent('experimental-stereo', {
    init() {
      this.stereoCamera = new AFRAME.THREE.StereoCamera();
      this.stereoCamera.eyeSep = 0.064;
      this.enabledStereo = false;
      stereoComponent = this;
    },
    tock(tiempo) {
      if (!this.el.renderer || !this.el.camera) return;
      if (!this.enabledStereo && !anclajeLectura) return;
      const renderer = this.el.renderer;
      if (renderer.xr && renderer.xr.isPresenting) return;
      const camera = this.el.camera;
      camera.updateWorldMatrix(true, false);
      if (!this.enabledStereo) {
        vigilarVista(tiempo, camera.aspect, camera);
        return;
      }
      const size = renderer.getSize(new AFRAME.THREE.Vector2()); // px CSS (ver js/estereo.js)
      const vistas = vistasOjos(size.x, size.y);
      this.stereoCamera.aspect = vistas.aspecto / camera.aspect;
      this.stereoCamera.update(camera);
      vigilarVista(tiempo, vistas.aspecto, this.stereoCamera.cameraL, this.stereoCamera.cameraR);
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
    const relieves = $('institutionalLogos3D').object3D.position;
    const camara = camaraRig.object3D.position;
    const controles = camaraRig.components['look-controls'];
    if (controles?.yawObject && controles.pitchObject) {
      controles.yawObject.rotation.y = 0;
      controles.pitchObject.rotation.x = Math.atan2(relieves.y - camara.y, camara.z - relieves.z);
    }
    colocarControlesRecorrido();
    if (!stereoComponent) stereoComponent = scene.components['experimental-stereo'];
    stereoButton.disabled = !stereoComponent;
    stereoStatus.textContent = stereoComponent
      ? 'Escena lista. Compatible con 2D y vista dividida Visor VR.'
      : 'Escena cargada sin componente estéreo.';

    // S5: Modos directos desde URL
    const urlParams = new URLSearchParams(window.location.search);
    const modoParam = urlParams.get('modo');
    const diagParam = urlParams.get('diag') === '1';

    const directExitBtn = $('directExitBtn');
    if (directExitBtn) {
      directExitBtn.addEventListener('click', () => salir('/'));
    }
    const directExitBtnRight = $('directExitBtnRight');
    if (directExitBtnRight) {
      directExitBtnRight.addEventListener('click', () => salir('/'));
    }

    const avisoGiro = $('orientacionAviso');
    const btnDescartarGiro = $('btnDescartarGiro');
    if (avisoGiro && btnDescartarGiro) {
      if (sessionStorage.getItem('astrovisor_giro_ignorado') === '1') {
        avisoGiro.classList.add('descartado');
      }
      btnDescartarGiro.addEventListener('click', () => {
        avisoGiro.classList.add('descartado');
        sessionStorage.setItem('astrovisor_giro_ignorado', '1');
      });
    }

    const modoEfectivo = modoParam || 'libre';
    if ((modoParam === 'libre' || modoParam === 'homido' || !modoParam) && !diagParam) {
      document.body.classList.add('modo-directo');
      if (directExitBtn) directExitBtn.hidden = false;
      if (directExitBtnRight) directExitBtnRight.hidden = false;
    }

    const btnActivar = $('btnActivarInmersion');
    enlazarPuntero();

    if (modoEfectivo === 'homido' && !diagParam && stereoComponent) {
      stereoActive = true;
      stereoComponent.enabledStereo = true;
      host.classList.add('stereo-active');
      document.body.classList.add('stereo-mode');
      prepararPantallaCompleta();

      if (btnActivar) {
        const estadoInmersion = {
          pantallaCompleta: false,
          orientacion: typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function' ? 'pendiente' : 'no_requerido',
          audio: 'pendiente',
          intentoPrevio: false,
        };

        const comprobarEstado = () => {
          estadoInmersion.pantallaCompleta = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
          
          // Sincronización con el estado real del reproductor (narrador de audio/narration.js vía narraciones.js)
          const estadoNarrador = narracion?.estado;
          const activacionExitosa = Boolean(narracion?.activacion);
          const reproduciendoOReanudado = ['reproduciendo', 'pausado', 'finalizado'].includes(estadoNarrador);

          if (reproduciendoOReanudado || (estadoNarrador === 'listo' && activacionExitosa)) {
            estadoInmersion.audio = 'desbloqueado';
          } else if (estadoNarrador === 'bloqueado' || estadoNarrador === 'error') {
            estadoInmersion.audio = 'bloqueado';
          } else if (estadoNarrador === 'listo' && !activacionExitosa) {
            // La simple selección de recurso en el narrador no equivale a audio desbloqueado o activación exitosa
            estadoInmersion.audio = estadoInmersion.audio === 'bloqueado' ? 'bloqueado' : 'pendiente';
          }

          const fsOk = estadoInmersion.pantallaCompleta;
          const oriOk = estadoInmersion.orientacion === 'concedido' || estadoInmersion.orientacion === 'no_requerido';
          const audOk = estadoInmersion.audio === 'desbloqueado';

          // No ocultar el botón únicamente porque se haya activado la pantalla completa:
          // Solo se oculta cuando TODAS las capacidades requeridas (pantalla, orientación y audio) están activas.
          if (fsOk && oriOk && audOk) {
            btnActivar.hidden = true;
          } else {
            btnActivar.hidden = false;
            if (estadoInmersion.intentoPrevio && (estadoInmersion.orientacion === 'denegado' || !fsOk || !audOk)) {
              const faltantes = [];
              if (!fsOk) faltantes.push('pantalla');
              if (estadoInmersion.orientacion === 'denegado') faltantes.push('sensores');
              if (!audOk) faltantes.push('audio');
              btnActivar.textContent = `Reintentar activación (${faltantes.join(', ') || 'inmersión'})`;
              btnActivar.classList.add('btn-reintentar');
            } else {
              btnActivar.textContent = 'Activar pantalla completa, sensores y audio';
              btnActivar.classList.remove('btn-reintentar');
            }
          }
        };

        comprobarEstado();
        actualizarInmersion = comprobarEstado;

        btnActivar.addEventListener('click', async () => {
          estadoInmersion.intentoPrevio = true;

          // 1. SOLICITUD DE ORIENTACIÓN DIRECTA Y SÍNCRONA EN EL GESTO
          // Se invoca antes de cualquier await o microtarea asíncrona para no perder la activación (User Gesture en WebKit)
          let orientacionPromesa = null;
          if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
              orientacionPromesa = DeviceOrientationEvent.requestPermission();
            } catch (err) {
              eventLine(`Orientación error síncrono: ${err.message || err.name}`);
            }
          }

          // 2. ACTIVACIÓN DIRECTA DEL REPRODUCTOR REAL DE NARRACIONES EN EL GESTO
          try {
            const btnAudio = $('activateAudio');
            if (btnAudio && !btnAudio.disabled) {
              btnAudio.click();
            } else {
              window.dispatchEvent(new Event('astrovisor:activar-audio'));
            }
          } catch (err) {
            eventLine(`Audio activación error: ${err.message || err.name}`);
          }

          // 3. SOLICITUD DE PANTALLA COMPLETA
          let fsPromesa = null;
          if (!document.fullscreenElement && host.requestFullscreen) {
            fsPromesa = host.requestFullscreen().catch((err) => {
              eventLine(`Pantalla completa no disponible: ${err.name || err.message}`);
            });
          }
          if (screen.orientation && screen.orientation.lock) {
            screen.orientation.lock('landscape').catch(() => {});
          }

          // 4. RESOLVER ORIENTACIÓN Y EVALUAR RESULTADOS POR SEPARADO SIN BLOQUEAR LA ESCENA
          if (orientacionPromesa) {
            try {
              const res = await orientacionPromesa;
              estadoInmersion.orientacion = res === 'granted' ? 'concedido' : 'denegado';
              eventLine(`Permiso orientación: ${estadoInmersion.orientacion}`);
            } catch (err) {
              estadoInmersion.orientacion = 'denegado';
              eventLine(`Permiso orientación denegado/error: ${err.message || err.name}`);
            }
          }

          if (fsPromesa) {
            await fsPromesa;
          }

          comprobarEstado();
        });

        document.addEventListener('fullscreenchange', comprobarEstado);
        window.addEventListener('astrovisor:narracion', (ev) => {
          const st = ev.detail?.state;
          const act = Boolean(ev.detail?.activacion || narracion?.activacion);
          if (st) {
            if (['reproduciendo', 'pausado', 'finalizado'].includes(st) || (st === 'listo' && act)) {
              estadoInmersion.audio = 'desbloqueado';
            } else if (st === 'bloqueado' || st === 'error') {
              estadoInmersion.audio = 'bloqueado';
            } else if (st === 'listo' && !act) {
              estadoInmersion.audio = estadoInmersion.audio === 'bloqueado' ? 'bloqueado' : 'pendiente';
            }
            comprobarEstado();
          }
        });
      }
    }
  }
  if (scene.hasLoaded) onSceneReady();
  else scene.addEventListener('loaded', onSceneReady, { once: true });
  window.addEventListener('pagehide', () => { if (!saliendo) desmontarVisor(); });
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted || !saliendo) return;
    saliendo = false;
    camaraRig.components['look-controls']?.play();
    iniciarMovimiento();
    if (!pantalla && !diagnostico) activarEstereo();
    refrescarRaycaster();
  });

  function exitStereo() {
    try {
      if (estado.modo === 'ficha') cerrarFicha();
    } catch (e) {
      console.error('Error al cerrar ficha en exitStereo:', e);
    }
    window.dispatchEvent(new Event('astrovisor:salida-visor'));
    liberarPantalla();
    if (!stereoActive) return;
    stereoActive = false;
    if (stereoComponent) stereoComponent.enabledStereo = false;
    host.classList.remove('stereo-active');
    document.body.classList.remove('stereo-mode');
    if (exitButton) exitButton.hidden = true;
    if (stereoButton) stereoButton.disabled = false;
    if (stereoStatus) stereoStatus.textContent = 'Vista dividida desactivada. Continuando en modo 2D.';
    eventLine('Vista dividida desactivada.');
    window.dispatchEvent(new Event('resize'));
  }

  function activarEstereo() {
    if (!stereoComponent || !scene.hasLoaded) return;
    stereoActive = true;
    stereoComponent.enabledStereo = true;
    host.classList.add('stereo-active');
    document.body.classList.add('stereo-mode');
    exitButton.hidden = false;
    stereoButton.disabled = true;
    stereoStatus.textContent = 'Vista dividida ACTIVADA: gira el teléfono a horizontal.';
    eventLine('Vista dividida activada.');
    requestAnimationFrame(() => {
      if (scene && scene.resize) scene.resize();
      window.dispatchEvent(new Event('resize'));
    });
  }
  stereoButton.addEventListener('click', () => {
    activarEstereo();
    prepararPantallaCompleta();
  });
  if (fullscreenButton) fullscreenButton.addEventListener('click', () => {
    if (document.fullscreenElement) liberarPantalla();
    else prepararPantallaCompleta();
  });
  document.addEventListener('fullscreenchange', () => {
    if (fullscreenButton) fullscreenButton.textContent = document.fullscreenElement ? 'Salir de pantalla completa' : 'Pantalla completa';
    if (!document.fullscreenElement && !saliendo) liberarPantalla();
  });

  // Mejoras para el visor: pantalla completa, horizontal fijo y pantalla encendida (según soporte del navegador)
  async function prepararPantallaCompleta() {
    const intentar = async (nombre, fn) => {
      try { await fn(); eventLine(`${nombre}: activado.`); return true; }
      catch (e) { eventLine(`${nombre}: no disponible (${e.name || e.message}).`); return false; }
    };
    const completa = host.requestFullscreen && await intentar('Pantalla completa', () => host.requestFullscreen());
    if (saliendo || !completa) {
      if (!saliendo) avisar('El navegador no abrió la pantalla completa. Puedes continuar aquí.');
      return;
    }
    if (stereoActive && screen.orientation?.lock) await intentar('Bloqueo horizontal', () => screen.orientation.lock('landscape'));
    if (!saliendo && stereoActive && navigator.wakeLock) await intentar('Pantalla siempre encendida', async () => {
      const bloqueo = await navigator.wakeLock.request('screen');
      if (saliendo || !document.fullscreenElement) await bloqueo.release();
      else bloqueoPantalla = bloqueo;
    });
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
      else if (stereoActive && diagnostico) exitStereo();
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
