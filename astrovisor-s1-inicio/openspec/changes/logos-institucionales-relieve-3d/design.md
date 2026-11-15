# Design

Estado: plan aprobado por el usuario en el chat e implementado; ver evidencia en docs/PRUEBA-LOGOS-3D.md.

## Context

Ver `proposal.md`. La página estática A-Frame carga Three.js desde su distribución local. La cámara inicial está en `0 1.6 0`, sin rotación declarada. Los logos actuales son hijos de `visorControls3D`, que `prueba.js` reubica según el recorrido y la ficha. La única luz declarada es ambiental. Las pruebas S5 exigen hoy el recurso CECAN y las imágenes anteriores; deben actualizarse al nuevo contrato.

## Goals / Non-Goals

**Goals:** relieves geométricos reconocibles, contornos recortados y geometría de tamaño acotado para dos modos de visualización. Carga aislada y liberación de geometrías/materiales al desmontar.

**Non-Goals:** reconstrucción escultórica completa del retrato, animaciones, interacción nueva, nuevas bibliotecas del navegador o cambios a la web convencional.

## Decisions

### Approaches

Propuesta técnica: extraer contornos simplificados de las imágenes suministradas, preservar huecos de letras y figuras y crear capas extruidas con Three.js de A-Frame. El emblema de Tepic conserva sus regiones de color y los detalles negros elevados; la biblioteca conserva el retrato y texto negros como relieve. Guardar los contornos preparados como recurso estático; evitar procesar imágenes cada fotograma. Usar los adjuntos como fuente, sin redibujar texto con una tipografía aproximada.

Alternativas consideradas: una placa con textura requiere menos geometría, pero no ofrece relieve interno; un modelo escultórico manual aporta más detalle, pero requiere producción artística adicional no pedida. Se implementó el relieve por capas del plan aprobado. Para conservar la fidelidad del JPG de Tepic, las caras frontales usan su imagen original como mapa de color con UV normalizadas; el espesor y los detalles siguen siendo geometría extruida. La biblioteca usa un soporte marfil que sigue el contorno de las letras y el retrato, con tinta negra elevada; el soporte rellena el rostro y los interiores de letras, sin cartel rectangular.

### Ubicación e iluminación

Crear un grupo hermano de los controles, sin clase `selectable`, en el semiespacio Z positivo, rotado 180 grados en Y. Propuesta inicial: centro a altura de ojos, a unos cuatro metros, con Tepic al lado del logo horizontal de la biblioteca. Aumentar ambos respecto a sus representaciones actuales y ajustar la escala de cada uno por separado, conservando su relación ancho/alto. El tamaño anterior y la igualdad de dimensiones entre logos no son restricciones. Priorizar que el retrato, el escudo y las inscripciones se aprecien tras girar, sin recorte por ojo ni solapamiento. Ajustar tamaño, distancia y separación en las dos vistas del modo estéreo; registrar dimensiones y encuadre finales. No parentar a la cámara ni al grupo que reubica controles. La comodidad y legibilidad con visor físico requieren una prueba real y no se acreditan solo por simulación.

Añadir iluminación dirigida local a los relieves y material con respuesta a luz para distinguir caras y laterales. Mantener luz y geometría acotadas; comprobar que las constelaciones y fichas conservan su apariencia.

### Integración y límites

Cambiar `index.html`, añadir módulo de emblemas y recursos estáticos junto a `prueba-homido`, actualizar pruebas S5 y añadir una comprobación de geometría: profundidad positiva, contornos válidos, huecos, dimensiones y liberación. Integrar la carga sin bloquear la inicialización de `prueba.js`; capturar fallos por emblema. Revisar el build y sus rutas relativas. El exportador Homido publica datos del catálogo; no agregar los logos a ese contrato salvo evidencia de dependencia durante implementación.

La ubicación final del grupo es `0 2.3 5`, con giro Y de 180 grados. Tepic usa ancho de referencia 2.6, posición local `-2.8 0 -0.2` y giro Y de 28 grados; biblioteca usa ancho 5.2, posición local `1.4 0 0` y giro Y de -16 grados. Las escalas conservan las proporciones internas y orientan las caras hacia el visitante. Son dimensiones de la escena; el ancho visible depende de los márgenes del original.

El nuevo contrato reemplaza la ubicación junto a controles descrita en el cambio abierto de identidad S5. No modificar ni archivar otros cambios OpenSpec para implementar esta solicitud.

## Risks / Trade-offs

- [Riesgo previsto] El JPG de Tepic tiene 225 × 225 píxeles: ampliar y trazar puede mostrar bordes aproximados. Comparar con la fuente y documentar la limitación; no afirmar detalle vectorial original.
- [Riesgo previsto] Los huecos pequeños pueden perderse al simplificar. Verificar letras y retrato a tamaño real y en vista oblicua antes de la PR.
- [Riesgo previsto] Exceso de triángulos o iluminación puede afectar al modo estéreo. Medir geometría y revisar navegador; la comodidad y rendimiento en Homido físico quedan sin verificar hasta prueba real.

## Migration Plan

Tras aprobación, preparar rama desde la base remota revisada y conservar los archivos locales ajenos. No escribir commits ni hacer push sobre `main`. Incluir solo archivos del cambio en la rama y abrir PR contra `main`. Reversión mediante retirada del cambio de escena y recursos nuevos, sin migración de datos. No archivar el cambio sin aprobación posterior.
