import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('S5-02: index.html incluye los elementos directos y el logo de IT Tepic', () => {
  const htmlPath = path.resolve(__dirname, '../public/prueba-homido/index.html');
  const content = fs.readFileSync(htmlPath, 'utf8');

  // Botón directo de salida y overlay de interacción
  assert.ok(content.includes('id="directExitBtn"'), 'Debe incluir botón flotante directExitBtn');
  assert.ok(content.includes('id="vrInteractionOverlay"'), 'Debe incluir overlay de interacción');

  // Logotipo IT Tepic en VR
  assert.ok(content.includes('id="itTepicLogo"'), 'Debe incluir asset de imagen itTepicLogo');
  assert.ok(content.includes('id="itTepicLogo3D"'), 'Debe incluir plano 3D itTepicLogo3D en visorControls3D');
});

test('S5-02: prueba.js preserva el cielo visible al abrir la ficha', () => {
  const pruebaPath = path.resolve(__dirname, '../public/prueba-homido/prueba.js');
  const content = fs.readFileSync(pruebaPath, 'utf8');

  // abrirFicha conserva constelacionesEl visible
  assert.ok(
    content.includes("constelacionesEl.setAttribute('visible', 'true');"),
    'abrirFicha debe mantener visible el grupo de constelaciones'
  );
  assert.ok(
    content.includes("c.resaltar(cId === id)"),
    'abrirFicha debe resaltar la constelación activa'
  );
});

test('S5-02: prueba.js y ficha-canvas.js soportan la acción de repetir audio', () => {
  const pruebaPath = path.resolve(__dirname, '../public/prueba-homido/prueba.js');
  const canvasPath = path.resolve(__dirname, '../public/prueba-homido/js/ficha-canvas.js');
  const narrPath = path.resolve(__dirname, '../public/prueba-homido/narraciones.js');

  const prueba = fs.readFileSync(pruebaPath, 'utf8');
  const canvas = fs.readFileSync(canvasPath, 'utf8');
  const narr = fs.readFileSync(narrPath, 'utf8');

  assert.ok(canvas.includes('zonas.repetir = repetir'), 'ficha-canvas debe definir zonas.repetir');
  assert.ok(prueba.includes("t.accion === 'repetir'"), 'prueba.js debe despachar accion repetir');
  assert.ok(narr.includes('astrovisor:audio-repetir'), 'narraciones.js debe escuchar evento de repetición');
});

test('S5-02: prueba.js activa modo directo para modo=libre y modo=homido', () => {
  const pruebaPath = path.resolve(__dirname, '../public/prueba-homido/prueba.js');
  const content = fs.readFileSync(pruebaPath, 'utf8');

  assert.ok(
    content.includes("modoParam === 'libre' || modoParam === 'homido'"),
    'Debe reconocer modo libre y homido'
  );
  assert.ok(
    content.includes("document.body.classList.add('modo-directo')"),
    'Debe aplicar clase modo-directo'
  );
});
