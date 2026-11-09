/* Estantería 3D experimental; utiliza libros[] del API/respaldo sin simular existencias. */
import { ajustarLineas, CANVAS } from './ficha-canvas.js';
import { crearAnillo, vincularEtiqueta } from './escena-constelaciones.js';
import { idBibliograficoValido } from './ruta-libro-2d.js';

const PALETA={orion:['#122B50','#254D78'],'osa-mayor':['#173F3C','#347065'],escorpio:['#4D263B','#7E4456']};
export function extraerLibros(recorridos,preferido='') {
  if(!Array.isArray(recorridos)) return [];
  const salida=[];
  for(const ficha of recorridos) {
    if(!idBibliograficoValido(ficha?.id)||!Array.isArray(ficha.libros)) continue;
    for(const l of ficha.libros) {
    if(!idBibliograficoValido(l?.libroId)||l.constelacionId!==ficha.id||typeof l.titulo!=='string'||!l.titulo.trim()) continue;
    salida.push({...l,id:l.libroId,libroId:l.libroId,constelacionId:ficha.id,constelacionTitulo:ficha.titulo,
      titulo:l.titulo.trim(),autor:typeof l.autor==='string'?l.autor.trim():'Autor no indicado',
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
export function ajustarTextoCubierta(ctx,texto,ancho,maxLineas,fuentes) {
  for(const font of fuentes) {
    ctx.font=font;
    const lineas=ajustarLineas(ctx,texto,ancho);
    if(lineas.length<=maxLineas&&lineas.every(l=>ctx.measureText(l).width<=ancho)) return {font,lineas};
  }
  return {font:fuentes[fuentes.length-1],lineas:['Texto completo','en la ficha 2D']};
}
function cubierta(doc,libro) {
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
export function crearEstanteria3D(doc,grupo,libros,ligar) {
  const nodos=new Map();
  crear(doc,'a-plane',{width:3.64,height:2.45,position:'0 0.14 -0.17',
    material:'shader: flat; color: #17283E; side: double'},grupo);
  crear(doc,'a-box',{width:3.65,height:0.13,depth:0.24,position:'0 -0.70 0.04',
    color:'#AA8559',material:'shader: flat'},grupo);
  vincularEtiqueta(crear(doc,'a-plane',{position:'0 1.14 0.02'},grupo),
    'La biblioteca de las estrellas',{ancho:3.15,alto:0.32});
  vincularEtiqueta(crear(doc,'a-plane',{position:'0 0.88 0.02'},grupo),
    'Mira una portada durante 3 segundos',{ancho:3.15,alto:0.22});
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
export function calcularDetalleLibro(ctx,libro) {
  const W=CANVAS.ancho,H=CANVAS.alto,items=[],zonas={};
  const font=(n,b=false)=>(b?'bold ':'')+n+'px system-ui,sans-serif';
  const texto=(s,y,t,color='#1B2430',bold=false)=>{
    ctx.font=font(t,bold);const lineas=ajustarLineas(ctx,s,1200);
    items.push({k:'texto',lineas,x:90,y,lh:t+14,font:ctx.font,color,align:'left',base:'top'});
    return y+lineas.length*(t+14);
  };
  const textoAjustado=(s,y,tamanos,color,bold)=>{
    const ajuste=ajustarTextoCubierta(ctx,s,1200,2,tamanos.map(t=>font(t,bold)));
    const t=Number(/(\d+)px/.exec(ajuste.font)[1]);
    items.push({k:'texto',lineas:ajuste.lineas,x:90,y,lh:t+14,font:ajuste.font,color,align:'left',base:'top'});
    return y+ajuste.lineas.length*(t+14);
  };
  items.push({k:'caja',rect:{x:20,y:20,w:W-40,h:H-40},radio:30,fill:'#FFFFFF',stroke:'#CED7E1',sw:4});
  let y=texto('LECTURA DE DEMOSTRACIÓN',88,31,'#725113',true);
  y=textoAjustado(libro.titulo,y+30,[63,55,47,39,33],'#142641',true);
  y=textoAjustado(libro.autor,y+15,[37,33,29,25],'#3D4D62',false);
  y=texto('¿Por qué leerlo?',y+35,42,'#142641',true);
  y=texto('Continúa descubriendo las historias del cielo y las estrellas con esta lectura.',y+20,36);
  const ultimo=texto('La biblioteca aún no ha confirmado un ejemplar físico ni su ubicación.',y+42,31,'#664A13');
  const consultar={x:75,y:860,w:1250,h:100},volver={x:310,y:1000,w:780,h:96};
  zonas['consultar-libro']=consultar;zonas['volver-libros']=volver;
  items.push({k:'boton',rect:consultar,fill:'#1F4E8C',
    texto:'Consultar información en 2D',font:font(38,true),color:'#FFFFFF',padIzq:0});
  items.push({k:'boton',rect:volver,fill:'#354C69',
    texto:'← Volver a los libros',font:font(35,true),color:'#FFFFFF',padIzq:0});
  return {ancho:W,alto:H,items,zonas,desborda:ultimo>820};
}
