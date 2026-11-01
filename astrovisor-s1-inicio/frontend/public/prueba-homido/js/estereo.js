/* Geometría de la vista dividida. Las unidades son píxeles CSS: three.js multiplica por el
   pixelRatio dentro de setViewport/setScissor, así que NO se debe usar el tamaño del buffer de
   dibujo (en un móvil con densidad 3 eso dejaba cada ojo fuera del lienzo y la vista salía vacía). */

export function vistasOjos(anchoCss, altoCss) {
  const mitad = Math.floor(anchoCss / 2)
  return {
    izquierdo: { x: 0, y: 0, ancho: mitad, alto: altoCss },
    derecho: { x: mitad, y: 0, ancho: anchoCss - mitad, alto: altoCss },
    aspecto: mitad / altoCss, // cada ojo es la mitad del ancho
  }
}
