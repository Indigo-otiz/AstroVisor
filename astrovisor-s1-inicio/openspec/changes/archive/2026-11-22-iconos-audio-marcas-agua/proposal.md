# Proposal: Iconos Universales de Control de Audio e Integración de Relieves 3D como Marca de Agua

## Why

1. **Controles de Audio:** En las distintas modalidades del sistema (Web 2D, Visor 3D y Homido VR), los controles de reproducción y pausa de narraciones empleaban botones extensos con texto completo repetitivo («Pausar audio», «Reanudar audio», «Escuchar narración», «Pausar narración»), lo cual saturaba visualmente los paneles y resultaba en una sobreabundancia de botones en pantallas móviles y visores 3D. Se solicitó sustituirlos por los iconos universales e intuitivos (`▶` / `⏸` / `↺`), simplificando el diseño de las interfaces.
2. **Emblemas Institucionales Traseros (Solón Argüello e IT Tepic):** Los relieves tridimensionales situados detrás de la cámara en el visor se renderizaban con opacidad plena o iluminación excesiva, luciendo como objetos sólidos pesados en vez de una sutil marca de agua integrada naturalmente con el fondo estelar cósmico. Se solicitó suavizar su apariencia hacia un acabado translúcido tipo marca de agua con iluminación atenuada que preserve la inmersión espacial.

## What Changes

- **Controles de Audio:**
  - En Web 2D (`NarracionAudio.vue`), incorporar los símbolos estándar `▶` y `⏸` acompañando la acción de forma concisa y con accesibilidad plena (`aria-label`, `title`).
  - En el visor 3D interactivo (`Visor3DView.vue`), simplificar los botones inferiores del cuadro informativo integrando los glifos reconocidos `▶ Reproducir`, `⏸ Pausar` y `↺ Repetir`.
  - En la experiencia Homido VR (`ficha-canvas.js` y `narraciones.js`), incorporar los iconos `▶`, `⏸` y `↺` en los botones dibujados en el lienzo de la ficha espacial y en la interfaz móvil.
- **Relieves Institucionales 3D:**
  - En `Visor3DView.vue` y `logos-3d.js`, aplicar parámetros de material translúcido (`transparent: true`, `opacity: 0.38`, `opacidadLateral: 0.22`, `depthWrite: false`) para crear un efecto de marca de agua que se funda armónicamente con el firmamento y permita que el campo de estrellas titile sutilmente tras ellos.
  - Atenuar la luz puntual trasera a un brillo suave y frío (`#c8dcfa`, intensidad `0.9`) para evitar reflejos plásticos o sobreexposición.

## Capabilities

### New Capabilities
- `controles-audio-experiencias` — Controles de audio concisos y universales mediante iconografía reconocida (`▶`, `⏸`, `↺`) en todas las modalidades.

### Modified Capabilities
- `identidad-inmersiva-relieve` — Apariencia translúcida integrada como marca de agua en los relieves 3D traseros.

## Impact

Mejora la claridad visual, reduce la carga cognitiva de botones repetitivos y perfecciona la estética astronómica de los emblemas institucionales en 3D sin alterar contratos de datos ni pruebas existentes.
