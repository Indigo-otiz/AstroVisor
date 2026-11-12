import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { crearEstado } from '../public/prueba-homido/js/visor-estado.js';
import { calcularLayout, CANVAS } from '../public/prueba-homido/js/ficha-canvas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('S5-02: index.html incluye los elementos directos y el logo de IT Tepic', () => {
  const htmlPath = path.resolve(__dirname, '../public/prueba-homido/index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert.ok(html.includes('id="directExitBtn"'), 'Debe existir directExitBtn');
  assert.ok(html.includes('id="itTepicLogo3D"'), 'Debe existir itTepicLogo3D');
  assert.ok(html.includes('ITTepic_logo.jpg'), 'Debe cargar el asset de IT Tepic');
  assert.ok(html.includes('id="btnActivarInmersion"'), 'Debe existir control de activación directa de Homido');
});

test('S5-02: prueba.js preserva el cielo visible al abrir la ficha', () => {
  const pruebaPath = path.resolve(__dirname, '../public/prueba-homido/prueba.js');
  const content = fs.readFileSync(pruebaPath, 'utf8');

  assert.ok(
    content.includes("constelacionesEl.setAttribute('visible', 'true')"),
    'abrirFicha debe mantener visible el grupo de constelaciones'
  );
  assert.ok(
    content.includes("c.resaltar(cId === id)"),
    'abrirFicha debe resaltar la constelación seleccionada'
  );
});

test('S5-02: prueba.js, visor-estado.js y ficha-canvas.js soportan la acción de repetir audio por clic y mirada', () => {
  const canvasPath = path.resolve(__dirname, '../public/prueba-homido/js/ficha-canvas.js');
  const pruebaPath = path.resolve(__dirname, '../public/prueba-homido/prueba.js');
  const narrPath = path.resolve(__dirname, '../public/prueba-homido/narraciones.js');

  const canvas = fs.readFileSync(canvasPath, 'utf8');
  const prueba = fs.readFileSync(pruebaPath, 'utf8');
  const narr = fs.readFileSync(narrPath, 'utf8');

  assert.ok(canvas.includes('zonas.repetir = repetir'), 'ficha-canvas debe definir zonas.repetir');
  assert.ok(prueba.includes("t.accion === 'repetir'"), 'prueba.js debe despachar accion repetir');
  assert.ok(prueba.includes("'audio', 'repetir', 'volver'"), 'objetivoEnVista debe admitir repetir');
  assert.ok(narr.includes('astrovisor:audio-repetir'), 'narraciones.js debe escuchar evento de repetición');
  assert.ok(narr.includes('narrador.detener()'), 'repetición debe detener y reiniciar desde segundo 0');

  // Comprobar visor-estado.js
  const estado = crearEstado();
  assert.equal(estado.permitido('repetir', 'clic'), false, 'repetir no permitido en reposo');
  estado.abrirFicha('orion');
  assert.equal(estado.permitido('repetir', 'clic'), true, 'repetir permitido por clic con ficha abierta');
  assert.equal(estado.permitido('repetir', 'mirada'), true, 'repetir permitido por mirada con ficha abierta');
  estado.alternarPausa(); // pausar mirada
  assert.equal(estado.permitido('repetir', 'mirada'), false, 'mirada pausada no debe permitir enfocar repetir');
  assert.equal(estado.permitido('repetir', 'clic'), true, 'clic sigue permitido con mirada pausada');
});

test('S5-02: prueba.js activa modo directo para modo=libre, modo=homido y fallback sin modo', () => {
  const pruebaPath = path.resolve(__dirname, '../public/prueba-homido/prueba.js');
  const content = fs.readFileSync(pruebaPath, 'utf8');

  assert.ok(
    content.includes("modoParam === 'libre' || modoParam === 'homido'"),
    'Debe reconocer modo libre y homido'
  );
  assert.ok(
    content.includes("!modoParam"),
    'Debe aplicar fallback para acceso sin parámetro de modo conforme a OpenSpec'
  );
  assert.ok(
    content.includes("document.body.classList.add('modo-directo')"),
    'Debe aplicar clase modo-directo'
  );
});

test('S5-02: geometría de ficha-canvas.js corrige el trazado del lado izquierdo en trazarRecta', () => {
  const canvasPath = path.resolve(__dirname, '../public/prueba-homido/js/ficha-canvas.js');
  const canvas = fs.readFileSync(canvasPath, 'utf8');

  assert.ok(canvas.includes('ctx.lineTo(x, y + r)'), 'Debe trazar el borde vertical izquierdo hacia y + r');
  assert.equal(canvas.includes('ctx.lineTo(x + r, y + h)\n  ctx.quadraticCurveTo(x, y, x + r, y)'), false, 'No debe tener el segmento incorrecto duplicado');
});

test('S5-02: ficha inmersiva omite pared de texto (resumen e historia extensa) en VR', () => {
  const canvasPath = path.resolve(__dirname, '../public/prueba-homido/js/ficha-canvas.js');
  const canvas = fs.readFileSync(canvasPath, 'utf8');

  assert.equal(canvas.includes('ficha.resumen'), false, 'No debe dibujar resumen extenso en la ficha inmersiva');
  assert.equal(canvas.includes('historiaParaVisor(ficha, maxHistoria)'), false, 'No debe dibujar historia extensa en VR');
  assert.ok(canvas.includes('ficha.titulo'), 'Debe conservar el título');
  assert.ok(canvas.includes('zonas.audio'), 'Debe conservar los controles de audio');
  assert.ok(canvas.includes('zonas.repetir'), 'Debe conservar el botón repetir');
  assert.ok(canvas.includes('zonas.volver'), 'Debe conservar el botón volver');
});
