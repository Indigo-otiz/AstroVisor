# Proposal: Optimización Responsiva Móvil, Navegabilidad de Modal VR e Indicador Visual de Giro 3D

## Why

En pruebas realizadas en dispositivos móviles smartphones (iOS / Android) y pantallas de computadoras de escritorio, se identificaron cuatro barreras críticas de usabilidad y presentación visual:
1. **Atrapamiento en el Modal VR en móviles:** En pantallas verticales o de altura reducida, el modal de experiencias VR carecía de scroll táctil interno, desplazando la cabecera y el botón de cierre `✕` a coordenadas negativas fuera del viewport sin posibilidad de salir ni regresar a la portada.
2. **Truncamiento de tarjetas en el Modal VR móvil:** Al comprimir la rejilla de tarjetas mediante CSS Grid por altura limitada, el texto descriptivo de las tarjetas se cortaba a media frase, ocultando las viñetas y el botón de inicio de cada modalidad.
3. **Falta de orientación intuitiva en experiencias VR en celular:** Al acceder a los visores 3D o Homido con el teléfono en vertical, la visualización dividida o inmersiva resultaba desorientadora sin una indicación que invitara a colocar la pantalla en horizontal (landscape), requiriendo un elemento visual integrado que no fuese un popup invasivo.
4. **Desproporción de logotipos institucionales:** En computadoras de escritorio, las restricciones de escala redujeron excesivamente los logotipos de CECAN, Biblioteca Solón Argüello, TecNM e IT Tepic, restándoles presencia visual e institucional, mientras que en el pie se mantenía una nota provisional de autorización redundante que debía retirarse.

## What Changes

- **Resolución integral de navegabilidad en el Modal VR:**
  - Habilitar desplazamiento vertical fluido con scroll táctil (`overflow-y: auto`, `-webkit-overflow-scrolling: touch`) y centrado con `margin: auto` que evita trampas de coordenadas negativas.
  - Convertir la cabecera del modal en fija (`sticky`) con botón de cierre de 44×44px siempre accesible.
  - Incorporar botón explícito de pie `← Volver a la portada`, cierre por toque en fondo oscuro y tecla `Escape`.
- **Corrección de truncamiento en tarjetas VR en móvil:**
  - Ajustar la rejilla en pantallas `<= 768px` con `grid-auto-rows: max-content`, `align-content: start` y `min-height: max-content`, desplegando la descripción completa, viñetas de características y botón de acción.
  - Preservar la disposición horizontal de 3 columnas en modo landscape (`@media (max-height: 520px) and (orientation: landscape)`).
- **Indicador cósmico de giro de dispositivo para las 3 experiencias VR:**
  - Integrar un banner flotante superior con acabado glassmorphism (`backdrop-filter: blur(12px)`) y animación sutil de giro de teléfono en SVG.
  - Mensaje claro: *"Gira tu dispositivo — Coloca tu pantalla en horizontal para disfrutar la inmersión 360°"*.
  - Ocultamiento automático instantáneo al colocar la pantalla en horizontal vía `@media (orientation: portrait)` y opción de descarte manual (`✕`) con persistencia en `sessionStorage`.
  - Aplicado a Modo Homido estéreo, 3D Versión Lite y 3D Versión Completa.
- **Jerarquía y legibilidad de logotipos institucionales:**
  - Escala proporcionada y visible en computadoras (`> 768px`) con alturas de 55–76px y anchos balanceados.
  - Distribución en cuadrícula 2×2 ordenada en móviles (`<= 640px`).
  - Retiro definitivo de la nota provisional de trámite institucional en `App.vue`.

## Capabilities

### New Capabilities
- `experiencia-responsiva-movil`: Especificación de adaptabilidad y control de orientación para visores astronómicos en smartphones y tabletas.

### Modified Capabilities
- `portada-hero-tarjetas`: Requisitos de accesibilidad, scroll y escape en el modal de experiencias VR y proporción de logotipos institucionales en pie.

## Impact

- Modificación de estilos en `public.css` y `prueba-homido/styles.css`.
- Actualización de `InicioView.vue`, `Visor3DView.vue` y `App.vue`.
- Actualización de `index.html` y `prueba.js` en `prueba-homido/`.
- Actualización de suites de prueba unitarias en `test/inicio-portal-s5.test.js`.
