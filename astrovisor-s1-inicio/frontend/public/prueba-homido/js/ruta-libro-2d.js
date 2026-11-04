/* PR #5: una estantería 2D que prioriza la constelación elegida. */
export function rutaLibro2D(libro) {
  if(!libro||!/^[a-z0-9-]+$/.test(libro.constelacionId)) return '/explorar';
  return '/biblioteca/'+encodeURIComponent(libro.constelacionId);
}
