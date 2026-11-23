# Proposal: Estandarización de Tipografía Accesible, Eliminación de Textos Amarillos e Identidad Institucional

## Why

En la revisión de diseño y accesibilidad para usuarios de la Biblioteca Pública Central Estatal Solón Argüello y adultos mayores, se identificaron tres barreras de legibilidad y coherencia visual en la interfaz web general:
1. **Tipografía inadecuada:** El uso de fuentes geométricas o futuristas como `Orbitron` en títulos, tarjetas, badges y modales de selección dificulta la lectura cómoda y accesible, alejándose de la identidad cultural y bibliotecaria.
2. **Mayúsculas sostenidas forzadas:** Múltiples componentes presentan texto transformado a mayúsculas completas (`text-transform: uppercase`), lo que ralentiza la comprensión lectora y genera una sensación visual agresiva e impersonal.
3. **Letras amarillas y bajo contraste:** La presencia de textos en tonos amarillos/dorados (`#f5b301`, `#f5c842`, `#ffd666`) sobre fondos claros u oscuros no cumple con los estándares óptimos de contraste WCAG y provoca deslumbramiento y fatiga visual.
4. **Falta de armonía institucional:** La paleta cromática de la interfaz general no incorpora los colores institucionales oficiales del CECAN (guinda Nayarit `#7a152b`) ni los tonos sobrios de lectura de la Biblioteca Solón Argüello (pergamino y carbón).

## What Changes

- **Estandarización tipográfica:**
  - Retirar `Orbitron` de la interfaz general (tarjetas, botones, badges, modales y navegación).
  - Adoptar tipografía serif humanista (`Newsreader` / `Georgia`) para encabezados y lectura editorial.
  - Adoptar tipografía sans-serif neutral y legible (`system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`) para elementos de control, navegación, badges y botones.
- **Normalización a caja mixta natural:**
  - Eliminar `text-transform: uppercase` en tarjetas, badges (`Pantalla 2D`, `Inmersión 3D`), botones y acciones del modal, empleando mayúscula inicial y minúsculas naturales.
- **Erradicación de textos amarillos:**
  - Sustituir los textos amarillos por blanco (`#ffffff`) o azul celeste suave (`#bae6fd`) sobre fondos oscuros, y azul marino (`#1f4e8c`) o carbón profundo (`#1b2430`) sobre fondos claros.
  - Reservar los acentos dorados/ámbar exclusivamente para detalles gráficos vectoriales finos (iconos, estrellas o bordes sutiles), nunca como color de texto de lectura.
- **Incorporación de identidad cromática institucional:**
  - Integrar el guinda oficial del CECAN / Gobierno de Nayarit (`#7a152b`) y el azul institucional (`#1f4e8c`) en acentos de la interfaz general, manteniendo el fondo pergamino cálido (`#faf7f0`) de la biblioteca.
- **Delimitación de alcance (experiencias 3D intactas):**
  - Las experiencias de simulación espacial 3D interna (Three.js en `Visor3DView.vue` y A-Frame en `prueba-homido/`) conservan sus coordenadas celestes, retículas y comportamiento intactos.

## Capabilities

### New Capabilities
- `identidad-editorial-accesible`: Requisitos de accesibilidad tipográfica, caja mixta natural, contraste cromático sin textos amarillos y armonía institucional aplicados a toda la interfaz web.

### Modified Capabilities
- `portada-hero-tarjetas`: Actualización de requisitos de las tarjetas glassmorphism del hero y del modal de selección VR para alinearse con tipografía accesible, caja mixta y ausencia de texto amarillo.

## Impact

- Modificación de variables CSS globales y componentes en `astrovisor-s1-inicio/frontend/src/public.css`.
- Actualización de textos y marcado visual en `InicioView.vue`, `VisorView.vue`, `ConstelacionView.vue` y `App.vue`.
- Validación de contrastes y ejecución de la suite de pruebas automatizadas existentes (`npm run test:web`).
