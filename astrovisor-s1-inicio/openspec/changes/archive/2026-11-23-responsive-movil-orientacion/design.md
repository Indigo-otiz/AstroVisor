# Design: Optimización Responsiva Móvil, Navegabilidad de Modal VR e Indicador Visual de Giro 3D

## Contexto y Decisiones de Arquitectura

### 1. Desplazamiento y escape del modal sin trampas de coordenadas flexbox
En dispositivos móviles, `align-items: center` dentro de un contenedor flexbox con `height: 100vh` o `overflow: hidden` empuja los elementos hacia coordenadas negativas cuando el contenido desborda. Para garantizar que la cabecera y el botón `✕` permanezcan siempre alcanzables:
- El backdrop posee `overflow-y: auto` y padding perimetral.
- El contenedor usa `margin: auto`, lo que preserva el centrado cuando hay espacio y permite desplazar desde arriba sin recortar cuando hay desborde.
- La cabecera utiliza `position: sticky; top: 0; z-index: 10`.

### 2. Dimensionamiento de filas de tarjetas en Grid móvil
Se identificó que `align-content: stretch` dentro de flex containers forzaba a las filas de la rejilla a un alto fijo de 179px. Al declarar:
```css
.vr-modal-grid {
  grid-template-columns: 1fr;
  grid-auto-rows: max-content;
  align-content: start;
}
.vr-modal-card {
  min-height: max-content;
  overflow: visible;
}
```
las tarjetas crecen naturalmente hasta los ~328px requeridos, dejando visibles descripciones, viñetas y botón de acción.

### 3. Indicador visual de orientación no invasivo
En lugar de un modal bloqueante que interrumpa el flujo del visitante:
- Se implementó un `<aside class="orientacion-aviso">` posicionado a `top: 18px` centrado con z-index alto.
- Una regla CSS `@media (orientation: portrait) and (max-width: 900px)` asegura que el elemento solo sea visible cuando el teléfono está físicamente en vertical.
- Al rotar el teléfono a landscape, el aviso desaparece de inmediato por CSS, liberando el 100% de la pantalla para el visor WebGL / A-Frame.
- Persistencia de descarte mediante `sessionStorage.getItem('astrovisor_giro_ignorado')`.

### 4. Escala institucional adaptativa
Se separaron las reglas de tamaño para logotipos entre pantallas grandes y smartphones, garantizando que en desktop los sellos y tipografías institucionales mantengan presencia e impacto sin deformar el pie de página.
