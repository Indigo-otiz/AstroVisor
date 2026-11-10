/* La identidad llega del contrato; el respaldo heredado se adapta antes de navegar. */
export const idBibliograficoValido = id => typeof id === 'string' && id.length <= 100 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
export function rutaLibro2D(libro) {
  if(!libro||!idBibliograficoValido(libro.constelacionId)) return '/explorar';
  const base='/explorar/'+encodeURIComponent(libro.constelacionId)+'/libros';
  return idBibliograficoValido(libro.libroId)?base+'/'+encodeURIComponent(libro.libroId):base;
}
