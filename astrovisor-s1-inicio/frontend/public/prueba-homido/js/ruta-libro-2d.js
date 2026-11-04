/* PR #6: enlaza a la ficha individual 2D del catálogo ilustrativo. */
const ids={'Star Lore of All Ages':'star-lore','A Field Book of the Stars':'field-stars',
  'Half-Hours with the Stars':'half-hours'};
export function rutaLibro2D(libro) {
  if(!libro||!/^[a-z0-9-]+$/.test(libro.constelacionId)) return '/explorar';
  const base='/explorar/'+encodeURIComponent(libro.constelacionId)+'/libros';
  return ids[libro.titulo]?base+'/'+ids[libro.titulo]:base;
}
