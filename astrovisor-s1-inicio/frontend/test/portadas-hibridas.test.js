import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { useEditorCatalogo, descartarBorradorPendiente } from '../src/composables/useEditorCatalogo.js'
import { esLibroValido } from '../src/services/librosDemoService.js'
const semilla=JSON.parse(readFileSync(new URL('../../content/catalogo-inicial.json',import.meta.url)))
const recurso={recursoId:'a'.repeat(8)+'-aaaa-4aaa-8aaa-aaaaaaaaaaaa',formato:'png',sha256:'a'.repeat(64),bytes:8,ancho:1,alto:1}
const imagen={tipo:'imagen-autorizada',...recurso,procedencia:'Ensayo',permiso:'Prueba',textoAlternativo:'Imagen de ensayo'}
function fetchTemporal(t,status=201){let posts=0;t.mock.method(globalThis,'fetch',async(url,o)=>{
  if(url.endsWith('/imagenes'))return new Response(JSON.stringify({recurso,previsualizacion:'data:image/png;base64,iVBORw0KGgo='}),{status:201})
  if(o.method==='POST'||o.method==='PATCH'){posts++;return new Response(JSON.stringify({ok:true,revision:2}),{status,headers:{ETag:'"catalogo-2"'}})}
  return new Response(JSON.stringify(semilla),{headers:{ETag:'"catalogo-1"'}})
});return()=>posts}
test('imagen preparada no guarda libro y cancelar no envía POST documental',async t=>{
  const posts=fetchTemporal(t),e=useEditorCatalogo({obtenerToken:()=> 'temporal'})
  await e.cargar();e.nuevoLibro();e.borrador.value.tipoPortada='imagen-autorizada'
  const ok=await e.subirImagen(new File([new Uint8Array([1,2])],'sintetica.png',{type:'image/png'}))
  assert.equal(ok,true);assert.equal(e.borrador.value.portada.recursoId,recurso.recursoId);assert.match(e.previsualizacion.value,/^blob:/);assert.equal(posts(),0)
  e.cancelarEdicion();assert.equal(e.previsualizacion.value,'');assert.equal(posts(),0)
})
test('cambio explícito de heredada a automática permite editar título y preview; conservar estática lo bloquea',async t=>{
  fetchTemporal(t);const e=useEditorCatalogo({obtenerToken:()=> 'temporal'});await e.cargar();e.seleccionarLibro('star-lore')
  assert.equal(e.borrador.value.tipoPortada,'heredada');assert.equal(e.puedeEditarTexto.value,false)
  e.borrador.value.tipoPortada='ilustrativa';assert.equal(e.puedeEditarTexto.value,true)
  assert.equal(e.borrador.value.portada.plantilla,'cielo');assert.equal(e.requierePreview.value,true)
})
test('412 conserva descriptor preparado y formulario sin repetir POST',async t=>{
  const posts=fetchTemporal(t,412),e=useEditorCatalogo({obtenerToken:()=> 'temporal'});await e.cargar();e.nuevoLibro()
  Object.assign(e.borrador.value,{id:'temporal',titulo:'Ensayo',autor:'Equipo',anio:2026,enlacePublico:'https://example.org/ensayo',tipoPortada:'imagen-autorizada'})
  e.borrador.value.portada={...imagen};e.borrador.value.relaciones[0].seleccionada=true;e.borrador.value.relaciones[0].motivo='Prueba'
  assert.equal(await e.guardar(),false);assert.equal(e.conflicto.value,true);assert.equal(e.borrador.value.portada.recursoId,recurso.recursoId)
  assert.equal(await e.guardar(),false);assert.equal(posts(),1)
})
test('lector público acepta PNG/JPEG autorizado y rechaza extensión o identidad incompatible',()=>{
  const l={...semilla.libros[0],portada:imagen,portadaIlustrativa:'/api/contenidos/libros/star-lore/portada.png?revision=2'}
  assert.equal(esLibroValido(l),true);assert.equal(esLibroValido({...l,portadaIlustrativa:l.portadaIlustrativa.replace('star-lore','otro')}),false)
  assert.equal(esLibroValido({...l,portadaIlustrativa:l.portadaIlustrativa.replace('.png','.html')}),false)
})
for(const revision of [1,2])test(`401 recupera descriptor preparado sin tokens ni envío automático, revisión ${revision}`,async t=>{
  descartarBorradorPendiente();let posts=0,caducada=false,actual=1
  t.mock.method(globalThis,'fetch',async(url,o)=>{
    if(o.method==='POST'){posts++;return new Response('{}',{status:401})}
    return new Response(JSON.stringify({...semilla,revision:actual}),{headers:{ETag:`"catalogo-${actual}"`}})
  })
  const e=useEditorCatalogo({obtenerToken:()=> 'expirado',obtenerUsuario:()=> 'misma-identidad',alExpirarSesion:()=>{caducada=true}})
  await e.cargar();e.nuevoLibro();Object.assign(e.borrador.value,{id:'temporal',titulo:'Ensayo',autor:'Equipo',anio:2026,enlacePublico:'https://example.org/ensayo',tipoPortada:'imagen-autorizada'})
  e.borrador.value.portada={...imagen};Object.assign(e.borrador.value.relaciones[0],{seleccionada:true,motivo:'Ensayo'})
  assert.equal(await e.guardar(),false);assert.equal(caducada,true);assert.equal(posts,1)
  actual=revision
  const nuevo=useEditorCatalogo({obtenerToken:()=> 'nuevo-token',obtenerUsuario:()=> 'misma-identidad'});await nuevo.cargar()
  assert.equal(nuevo.recuperarBorrador(),true);assert.equal(nuevo.borrador.value.portada.recursoId,recurso.recursoId);assert.equal(nuevo.conflicto.value,revision!==1)
  assert.equal(posts,1);assert.ok(!JSON.stringify(nuevo.borrador.value).includes('expirado'));assert.ok(!JSON.stringify(nuevo.borrador.value).includes('nuevo-token'))
  nuevo.cancelarPeticiones();e.cancelarPeticiones();descartarBorradorPendiente()
})
