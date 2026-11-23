# Design: Iconos de Audio y Acabado Marca de Agua en Relieves 3D

## Contexto

El sistema AstroVisor cuenta con tres experiencias principales de interacción:
1. **Web 2D:** Vistas de exploración y constelación individual (`ConstelacionView.vue`, `NarracionAudio.vue`).
2. **Visor 3D Web:** Vista inmersiva con Three.js en canvas (`Visor3DView.vue`).
3. **Visor Homido VR:** Vista estereoscópica para dispositivos móviles con A-Frame (`prueba-homido/index.html`, `prueba.js`, `ficha-canvas.js`).

## Decisiones Técnicas

### 1. Iconografía de Audio Universal
- Emplear los símbolos estándar `▶` (U+25B6 / Play), `⏸` (U+23F8 / Pause) y `↺` (U+21BA / Repeat).
- En canvas (`createButtonCanvasTexture` y `dibujarFicha`), asegurar soporte multiplataforma incluyendo fuentes con soporte de glifos (`"Space Grotesk", "Segoe UI Emoji", "Apple Color Emoji", sans-serif`).
- En Vue (`NarracionAudio.vue`), mantener etiquetas accesibles en atributos `aria-label` y `title` para no perjudicar la accesibilidad para lectores de pantalla.

### 2. Acabado de Marca de Agua en Relieves 3D
- Modificar la función `crearRelieve` tanto en `Visor3DView.vue` como en `logos-3d.js` para configurar materiales con:
  - `transparent: true`
  - `opacity: 0.38` (frente)
  - `opacity: 0.22` (caras laterales)
  - `depthWrite: false`
- Reemplazar la luz puntual de 2.5 de intensidad por una luz tenue celestial (`#c8dcfa`, 0.9 de intensidad) en la posición posterior.
- Mantener la textura y colores originales de los emblemas, respetando el contrato de capas y contornos.
