# Proposal: Portada Hero Limpia con Tarjetas Gemelas Glassmorphism

## Why

En la pantalla principal (`InicioView.vue`), el bloque superior izquierdo que contiene el título "ASTROVISOR" es redundante con el logotipo oficial ya presente en la cabecera superior y obstaculiza la vista de la constelación interactiva de Orión. Asimismo, los dos botones de acceso a las experiencias situados en la esquina inferior derecha tienen un diseño opaco, alargado y con textos pequeños que no destacan como portales de entrada principales ni aprovechan la estética astronómica inmersiva.

## What Changes

- **Retirar el panel superior de marca:** Eliminar el recuadro redundante `.hero-topbar` (`ASTROVISOR`) del hero canvas para despejar completamente el firmamento estelar y evitar duplicidad con el navbar.
- **Rediseñar los accesos como Tarjetas Gemelas Glassmorphism:**
  - Sustituir los botones opacos arrinconados por dos tarjetas simétricas centradas en la parte inferior.
  - Implementar acabado de cristal esmerilado translúcido (`backdrop-filter: blur`, fondo ahumado semitransparente) que permite ver y titilar las estrellas del canvas por detrás.
  - Reducir el texto a elementos concisos y de lectura inmediata: badge de modalidad (`PANTALLA 2D` / `INMERSIÓN 3D`), título de acción claro (`Explorar Constelaciones` / `Entrar al Visor 360°`), y micro-indicador de destino (`Relatos y biblioteca →` / `Con o sin gafas VR ✦`).
  - Añadir respuesta táctil y de cursor con elevación suave (`translateY(-4px)`) y halo de luz temático (*glow* cian/azul para web y dorado para VR).
- **Preservar compatibilidad:** Mantener intacto el modal de selección de modalidad VR (`mostrarModalVR`), las rutas de Vue Router (`/explorar`, `/visor-3d`) y las secciones accesibles inferiores.

## Capabilities

### New Capabilities

- `portada-hero-tarjetas` — Interfaz de entrada minimalista con tarjetas de cristal esmerilado translúcido y lienzo despejado.

### Modified Capabilities

- Ninguna breaking change en contratos ni rutas existentes.

## Impact

Mejora visual directa en la experiencia de inicio tanto en escritorio como en dispositivos móviles, sin afectar la lógica del lienzo interactivo ni los flujos de navegación.
