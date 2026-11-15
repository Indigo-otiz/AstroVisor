/* Estantería 3D experimental; utiliza libros[] del API/respaldo sin simular existencias. */
import { ajustarLineas, CANVAS } from './ficha-canvas.js';
import { crearAnillo, vincularEtiqueta } from './escena-constelaciones.js';
import { idBibliograficoValido } from './ruta-libro-2d.js';
import { portadaPublicadaValida } from './paquete-publico.js';

const PALETA={orion:['#122B50','#254D78'],'osa-mayor':['#173F3C','#347065'],escorpio:['#4D263B','#7E4456']};
export function extraerLibros(recorridos,preferido='') {
  if(!Array.isArray(recorridos)) return [];
  const salida=[];
  for(const ficha of recorridos) {
    if(!idBibliograficoValido(ficha?.id)||!Array.isArray(ficha.libros)) continue;
    for(const l of ficha.libros) {
    if(!idBibliograficoValido(l?.libroId)||l.constelacionId!==ficha.id||typeof l.titulo!=='string'||!l.titulo.trim()) continue;
    salida.push({...l,id:l.libroId,libroId:l.libroId,constelacionId:ficha.id,constelacionTitulo:ficha.titulo,
      titulo:l.titulo.trim(),autor:(typeof l.autor==='string' && l.autor.trim()) || 'Autor no indicado',
      demostracion:l.demostracion ?? ficha.demostracion});
    }
  }
  const comparar=(a,b)=>a<b?-1:a>b?1:0;
  salida.sort((a,b)=>Number(b.constelacionId===preferido)-Number(a.constelacionId===preferido)||comparar(a.libroId,b.libroId)||comparar(a.constelacionId,b.constelacionId));
  return [...new Map(salida.map(l=>[l.libroId,null])).keys()].slice(0,3).map(id=>salida.find(l=>l.libroId===id));
}
function crear(doc,tag,attrs,padre) {
  const el=doc.createElement(tag);
  Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,v));
  padre.appendChild(el); return el;
}
export function ajustarTextoCubierta(ctx,texto,ancho,maxLineas,fuentes,cabe = () => true) {
  for(const font of fuentes) {
    ctx.font=font;
    const lineas=ajustarLineas(ctx,texto,ancho);
    if(lineas.length<=maxLineas&&cabe(font,lineas.length)&&lineas.every(l=>ctx.measureText(l).width<=ancho)) return {font,lineas};
  }
  return {font:fuentes[fuentes.length-1],lineas:['Texto completo','en la ficha 2D']};
}
function cubierta(doc,libro) {
  if (portadaPublicadaValida(libro.id,libro.portada?.src) || (libro.portada?.tipo==='imagen-autorizada' && new RegExp(`^/api/contenidos/libros/${libro.id}/portada\\.(png|jpg)\\?revision=[1-9][0-9]*$`).test(libro.portada.src))) {
    const imagen=crear(doc,'img',{id:'cubierta-vr-'+libro.id,src:libro.portada.src,'data-portada-homido':''},doc.querySelector('a-assets'));
    return '#'+imagen.id;
  }
  const c=doc.createElement('canvas');c.id='cubierta-vr-'+libro.id;c.width=512;c.height=768;
  c.setAttribute('data-portada-homido','');
  const ctx=c.getContext('2d'),color=PALETA[libro.constelacionId]||PALETA.orion;
  const f=ctx.createLinearGradient(0,0,512,768);f.addColorStop(0,color[0]);f.addColorStop(1,color[1]);
  ctx.fillStyle=f;ctx.fillRect(0,0,512,768);ctx.strokeStyle='#E5CC9C';ctx.lineWidth=7;ctx.strokeRect(22,22,468,724);
  ctx.fillStyle='#F7E6B9';ctx.textAlign='center';
  ctx.font='bold 22px system-ui,sans-serif';ctx.fillText('LECTURAS DEL CIELO',256,92);
  ctx.font='48px Georgia,serif';ctx.fillText('✦  ✧  ✦',256,210);
  const titulo=ajustarTextoCubierta(ctx,libro.titulo,398,4,[49,44,39,34,29,24].map(n=>'bold '+n+'px Georgia,serif'));
  ctx.font=titulo.font;
  const lineas=titulo.lineas,inicio=330-(lineas.length-1)*29;
  lineas.forEach((s,i)=>ctx.fillText(s,256,inicio+i*58));
  const autor=ajustarTextoCubierta(ctx,libro.autor,425,3,[27,24,21,18].map(n=>n+'px system-ui,sans-serif'));
  ctx.font=autor.font;
  autor.lineas.forEach((s,i)=>ctx.fillText(s,256,585+i*32));
  ctx.font='bold 21px system-ui,sans-serif';ctx.fillText('CUBIERTA ILUSTRATIVA',256,703);
  doc.querySelector('a-assets').appendChild(c);return '#'+c.id;
}
/** Portadas como planos A-Frame delante de una repisa; selección con el mismo dwell del visor. */
export function crearEstanteria3D(doc,grupo,libros,ligar,pantalla = false) {
  const nodos=new Map();
  crear(doc,'a-plane',{width:3.64,height:2.45,position:'0 0.14 -0.17',
    material:'shader: flat; color: #17283E; side: double'},grupo);
  crear(doc,'a-box',{width:3.65,height:0.13,depth:0.24,position:'0 -0.70 0.04',
    color:'#AA8559',material:'shader: flat'},grupo);
  vincularEtiqueta(crear(doc,'a-plane',{position:'0 1.14 0.02'},grupo),
    'La biblioteca de las estrellas',{ancho:3.15,alto:0.32});
  vincularEtiqueta(crear(doc,'a-plane',{position:'0 0.88 0.02'},grupo),
    pantalla ? 'Pulsa una portada' : 'Mira una portada durante 3 segundos',{ancho:3.15,alto:0.22});
  const volver=crear(doc,'a-plane',{position:'0 -1.08 0.14',width:1.88,height:0.32,
    'data-action':'volver-ficha','data-ring':'ring-volver-ficha',material:'shader: flat; color: #1F4E8C'},grupo);
  vincularEtiqueta(crear(doc,'a-plane',{position:'0 0 0.027'},volver),
    'Volver a la constelación',{ancho:1.78,alto:0.28});
  crearAnillo(doc,volver,{id:'ring-volver-ficha',rin:0.11,rout:0.15,x:-0.74,z:0.035});
  ligar(volver);
  for(const libro of libros) {
    const nodo=crear(doc,'a-entity',{position:'0 0 0'},grupo);
    crear(doc,'a-box',{width:0.91,height:1.25,depth:0.11,position:'0 0 0.02',
      color:'#B79C75',material:'shader: flat'},nodo);
    crear(doc,'a-plane',{width:0.86,height:1.19,position:'0 0 0.09',
      material:'shader: flat; src: '+cubierta(doc,libro)},nodo);
    const hit=crear(doc,'a-plane',{position:'0 0 0.14',width:1.01,height:1.32,
      'data-action':'libro','data-id':libro.id,'data-ring':'ring-libro-'+libro.id,
      material:'shader: flat; opacity: 0.001; transparent: true; depthWrite: false'},nodo);
    crearAnillo(doc,hit,{id:'ring-libro-'+libro.id,rin:0.39,rout:0.45,z:0.035});
    ligar(hit);nodos.set(libro.id,nodo);
  }
  return {libros,mostrar(preferido) {
    const ordenados=[...libros].sort((a,b)=>Number(b.constelacionId===preferido)-Number(a.constelacionId===preferido));
    const xs=ordenados.length===1?[0]:ordenados.length===2?[-0.65,0.65]:[0,-1.14,1.14];
    ordenados.forEach((l,i)=>nodos.get(l.id).setAttribute('position',xs[i]+' 0 0.07'));
  }};
}
export function calcularDetalleLibro(ctx, libro) {
  const items = []
  const zonas = {
    'consultar-libro': { x: 500, y: 770, w: 770, h: 112 },
    'volver-libros': { x: 500, y: 912, w: 770, h: 92 },
  }
  const portada = { x: 142, y: 291, w: 285, h: 428 }
  const fuente = (tam, negrita) => `${negrita ? 'bold ' : ''}${tam}px system-ui, sans-serif`
  const interlineado = (font) => Number(/(\d+)px/.exec(font)[1]) + 12
  const texto = (valor, y, tamanos, color, negrita, limite) => {
    const ajuste = ajustarTextoCubierta(ctx, valor, 735, 3, tamanos.map((tam) => fuente(tam, negrita)),
      (font, filas) => y + interlineado(font) * filas <= limite)
    const alto = interlineado(ajuste.font)
    items.push({ k: 'texto', lineas: ajuste.lineas, x: 500, y, lh: alto, font: ajuste.font, color, align: 'left', base: 'top' })
    return y + ajuste.lineas.length * alto
  }
  items.push({ k: 'caja', rect: { x: 94, y: 202, w: 1212, h: 845 }, radio: 26, fill: '#101d37', stroke: '#7790b6', sw: 4 })
  if (libro.demostracion) texto('DEMO', 285, [38], '#f5ce6d', true, 340)
  const finalTitulo = texto(libro.titulo, 354, [74, 65, 56, 47, 39, 32], '#fff', true, 600)
  const finalAutor = texto(libro.autor || 'Autor no indicado', finalTitulo + 24, [49, 41, 35, 30], '#dce7f8', false, 745)
  items.push(
    { k: 'boton', rect: zonas['consultar-libro'], fill: '#f5ce6d', texto: 'Consultar en 2D', font: fuente(47, true), color: '#111b31', padIzq: 70 },
    { k: 'boton', rect: zonas['volver-libros'], fill: '#233657', stroke: '#7790b6', sw: 3,
      texto: 'Volver a los libros', font: fuente(43, true), color: '#fff', padIzq: 62 },
  )
  return { ...CANVAS, items, zonas, portada, desborda: finalAutor > 745 }
}
