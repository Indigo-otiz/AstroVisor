import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { extraerLibros, calcularDetalleLibro } from '../public/prueba-homido/js/estanteria-3d.js';
import { dibujarFicha, CANVAS, calcularLayout } from '../public/prueba-homido/js/ficha-canvas.js';
import { crearEstado } from '../public/prueba-homido/js/visor-estado.js';
import { rutaLibro2D } from '../public/prueba-homido/js/ruta-libro-2d.js';

const recorridos = JSON.parse(readFileSync(new URL('../../content/recorridos.json', import.meta.url), 'utf8'));
function ctxFalso() {
  const dibujado=[];
  const ctx={
    font:'',measureText(t){const px=Number(/(\d+)px/.exec(this.font)?.[1]??16);return{width:t.length*px*.5}},
    clearRect(){},beginPath(){},moveTo(){},lineTo(){},quadraticCurveTo(){},closePath(){},fill(){},stroke(){},
    fillText(s){dibujado.push(s)},
  };
  return {ctx,dibujado};
}
test('la estantería utiliza libros[] existentes, prioriza la constelación y limita a tres',()=>{
  for(const id of ['orion','osa-mayor','escorpio']){
    const libros=extraerLibros(recorridos,id);
    assert.equal(libros.length,3);
    assert.equal(libros[0].constelacionId,id);
    assert.equal(new Set(libros.map(l=>l.id)).size,3);
    assert.ok(libros.every(l=>l.demostracion&&l.titulo&&l.autor));
  }
  assert.deepEqual(extraerLibros([]),[]);
  assert.deepEqual(extraerLibros([{id:'orion',libros:[]}]),[]);
});
test('la ficha de constelación invita a explorar y el botón queda dentro del canvas',()=>{
  const {ctx,dibujado}=ctxFalso();
  const layout=calcularLayout(ctx,recorridos[0]);
  dibujarFicha(ctx,layout);
  assert.ok(layout.zonas.libros);
  assert.equal(layout.desborda,false);
  assert.match(dibujado.join(' '),/Ver libros recomendados/);
});
test('detalle 3D tiene dos botones grandes y advierte que la ubicación es desconocida',()=>{
  const {ctx,dibujado}=ctxFalso(),libro=extraerLibros(recorridos)[0];
  const layout=calcularDetalleLibro(ctx,libro);
  assert.equal(layout.desborda,false);
  assert.deepEqual(Object.keys(layout.zonas).sort(),['consultar-libro','volver-libros']);
  for(const z of Object.values(layout.zonas)){
    assert.ok(z.x>=0&&z.y>=0&&z.x+z.w<=CANVAS.ancho&&z.y+z.h<=CANVAS.alto);
    assert.ok(layout.items.some(i=>i.k==='boton'&&i.rect===z));
  }
  dibujarFicha(ctx,layout);
  assert.match(dibujado.join(' '),/no ha confirmado un ejemplar físico/);
});
test('las acciones de libros respetan modo ficha y pausa de mirada',()=>{
  const estado=crearEstado();
  assert.equal(estado.permitido('libros'),false);
  assert.equal(estado.abrirFicha('orion'),true);
  for(const a of ['libros','libro','volver-ficha','consultar-libro','volver-libros']){
    assert.equal(estado.permitido(a),true);
  }
  estado.alternarPausa();
  assert.equal(estado.permitido('libro','mirada'),false);
  assert.equal(estado.permitido('salir','mirada'),true);
});
test('cada libro navega a una URL interna y rechaza IDs ajenos',()=>{
  for(const l of extraerLibros(recorridos)){
    const url=rutaLibro2D(l);
    assert.ok(url.startsWith('/')&&!url.startsWith('//'));
    assert.ok(url.includes(l.constelacionId));
  }
  assert.equal(rutaLibro2D({constelacionId:'../admin'}),'/explorar');
});
test('se mantiene un solo reproductor de narraciones',()=>{
  const visor=readFileSync(new URL('../public/prueba-homido/prueba.js',import.meta.url),'utf8');
  assert.match(visor,/astrovisor:ficha-cerrada/);
  assert.match(visor,/astrovisor:salida-visor/);
  assert.ok(!visor.includes('new Audio('));
});
