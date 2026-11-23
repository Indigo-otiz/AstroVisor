# Design: Tipografía Accesible, Caja Mixta e Identidad Institucional

## Context

Ver `proposal.md` para motivación y justificación de accesibilidad.
Actualmente `public.css` define variables `--font-orbitron`, `--font-sans` ('Space Grotesk') y reglas CSS con `text-transform: uppercase`, además de estilos con textos amarillos (`#f5b301`, `#f5c842`, `#ffd666`) y ausencia del guinda institucional en acentos.

## Goals / Non-Goals

**Goals:**
- Centralizar y estandarizar la tipografía de la interfaz general a una sans-serif legible del sistema para UI y serif clásica de biblioteca para títulos editoriales.
- Reemplazar todas las letras amarillas por blanco, azul cielo suave o tonos oscuros de alto contraste según el fondo.
- Eliminar la transformación forzada a mayúsculas (`uppercase`) en tarjetas, badges y botones.
- Incorporar variables institucionales de CECAN (`--cecan-wine: #7a152b`) y afinar los acentos.
- Mantener la suite de 179 pruebas de frontend en estado verde (pass 179 / fail 0).

**Non-Goals:**
- No alterar las experiencias inmersivas 3D internas (Three.js WebGL en `Visor3DView.vue` ni A-Frame en `prueba-homido/`).
- No modificar contratos de la API ni rutas del enrutador.

## Decisions

### 1. Sustitución de `Orbitron` en `:root`
- **Decisión:** Redefinir `--font-orbitron` en `:root` para mapear a `var(--font-sans)` o eliminar su uso en componentes UI, dejando `--font-sans: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` y `--font-serif: 'Newsreader', Georgia, serif`.
- **Alternativa descartada:** Cargar fuentes externas adicionales desde Google Fonts (evita dependencias de red o lentitud en modo sin internet/offline).

### 2. Normalización de mayúsculas a caja mixta
- **Decisión:** Retirar `text-transform: uppercase` de las clases `.hero-glass-card .card-badge`, `.card-title`, `.vr-modal-card-badge`, `.vr-modal-card-action`, `.hero-scroll-link`, etc., y ajustar las cadenas de texto a Title Case / Sentence Case en los templates de Vue.
- **Alternativa descartada:** Conservar mayúsculas con espaciado amplio (sigue presentando menor legibilidad para personas adultas mayores).

### 3. Reemplazo cromático de textos amarillos
- **Decisión:**
  - Fondos oscuros / glass: Texto principal `#ffffff`, subtítulos `#bae6fd` (azul cielo) o `#dbeafe`.
  - Fondos claros: Texto `#1b2430` (carbón tinta), enlaces/botones `#1f4e8c` (azul) o `#7a152b` (guinda).
  - Los tonos dorados (`#d49e1e`) se restringen estrictamente a bordes decorativos o iconos de estrellas, jamás texto.

## Risks / Trade-offs

- *[Riesgo]* Tests de regresión existentes que busquen texto exacto en mayúsculas (por ejemplo en `inicio-portal-s5.test.js`).
  - *Mitigación:* Se verificaron los 179 tests; los tests validan presencia de IDs y títulos estructurales (`tarjeta-explorar`, `Explorar Constelaciones`), los cuales se conservan intactos. Se ejecutará la suite completa para validar no-regresión.
