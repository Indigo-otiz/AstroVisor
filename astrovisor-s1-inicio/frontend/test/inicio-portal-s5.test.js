import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('S5-01 / S5-03: InicioView contiene exactamente las tres tarjetas de acceso directo', () => {
  const viewPath = path.resolve(__dirname, '../src/views/InicioView.vue');
  const content = fs.readFileSync(viewPath, 'utf8');

  // Tarjeta 1: Web Educativa
  assert.ok(content.includes('Experiencia Web Educativa'), 'Debe incluir el título de Web Educativa');
  assert.ok(content.includes('to="/explorar"'), 'Debe incluir enlace directo a /explorar');

  // Tarjeta 2: Experiencia Inmersiva 3D con dos accesos directos
  assert.ok(content.includes('Experiencia Inmersiva 3D'), 'Debe incluir el título de Experiencia Inmersiva');
  assert.ok(
    content.includes('href="/prueba-homido/index.html?modo=libre"'),
    'Debe incluir enlace directo a modo libre'
  );
  assert.ok(
    content.includes('href="/prueba-homido/index.html?modo=homido"'),
    'Debe incluir enlace directo a modo homido'
  );

  // Tarjeta 3: Administración
  assert.ok(content.includes('Administración'), 'Debe incluir título de Administración');
  assert.ok(content.includes('to="/admin"'), 'Debe incluir enlace directo a /admin');
});

test('S5-05: InicioView incorpora la sección de los tres manuales con estado pendiente de grabación', () => {
  const viewPath = path.resolve(__dirname, '../src/views/InicioView.vue');
  const content = fs.readFileSync(viewPath, 'utf8');

  assert.ok(content.includes('Manuales de uso y exploración'), 'Debe tener título de sección de manuales');
  assert.ok(content.includes('1. Cómo usar la web educativa'), 'Debe incluir manual 1');
  assert.ok(content.includes('2. Cómo explorar en VR'), 'Debe incluir manual 2');
  assert.ok(content.includes('3. Cómo administrar el catálogo'), 'Debe incluir manual 3');

  // Estado explícito pendiente de grabación (no simular videos terminados)
  const matches = content.match(/Pendiente de grabación/g);
  assert.ok(matches && matches.length >= 3, 'Los tres manuales deben indicar estado de pendiente de grabación');
});

test('S5-06: InicioView acredita formalmente al Equipo 8 y deslinde de CECAN/Gobierno', () => {
  const viewPath = path.resolve(__dirname, '../src/views/InicioView.vue');
  const content = fs.readFileSync(viewPath, 'utf8');

  assert.ok(content.includes('AstroVisor — Proyecto Académico'), 'Debe titular créditos académicos');
  assert.ok(content.includes('Equipo 8'), 'Debe mencionar al Equipo 8');
  assert.ok(content.includes('Karime Rendón Vázquez'), 'Debe listar a Karime');
  assert.ok(content.includes('Luis Alberto Rodríguez'), 'Debe listar a Luis');
  assert.ok(content.includes('Carlos Martínez Orozco'), 'Debe listar a Carlos');
  assert.ok(content.includes('Índigo Andre Ortiz Vega'), 'Debe listar a Índigo');

  // Deslinde de CECAN / Gobierno como dependencia externa
  assert.ok(content.includes('CECAN y Gobierno del Estado'), 'Debe mencionar la nota de trazabilidad de CECAN/Gobierno');
  assert.ok(content.includes('dependencia externa pendiente de autorización'), 'Debe deslindar la dependencia externa');
  assert.ok(content.includes('Nayarit_CECAN_Convivencia_Horizontal.png'), 'Debe incluir el logo de CECAN en créditos de inicio');
});

test('S5-06: App.vue incorpora el logotipo oficial horizontal de CECAN en el pie institucional', () => {
  const appPath = path.resolve(__dirname, '../src/App.vue');
  const content = fs.readFileSync(appPath, 'utf8');

  assert.ok(
    content.includes('Nayarit_CECAN_Convivencia_Horizontal.png'),
    'El pie institucional debe incluir el logotipo horizontal de CECAN/Gobierno'
  );
  assert.ok(
    content.includes('institutional-logo-cecan'),
    'Debe aplicar la clase institutional-logo-cecan'
  );
  assert.ok(
    content.includes('Consejo Estatal para la Cultura y las Artes de Nayarit (CECAN)'),
    'Debe incluir texto alternativo accesible'
  );
  assert.ok(
    content.includes('Autorización institucional'),
    'Debe dejar constancia explícita del estado de trámite de autorización'
  );
});
