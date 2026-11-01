# Propuesta S3 — Homido 3D: selección de tres constelaciones y fichas dinámicas

## Why

La escena de `frontend/public/prueba-homido/` solo contiene **un punto naranja fijo etiquetado como Orión**; la ficha (título, historia, libro) está escrita a mano en `drawConstellationCard()` y los botones táctiles/mirada están alineados con píxeles del canvas a mano. Para la revisión física del **3 de noviembre de 2026** se necesita un recorrido donde se puedan explorar **Orión, Osa Mayor y Escorpio** y ver una ficha con datos propios de cada una, sin triplicar código.

## What Changes

- Generar las constelaciones (figura de estrellas + área de selección) **desde datos**, con ids `orion`, `osa-mayor`, `escorpio` (los mismos de `content/recorridos.json`).
- Reutilizar la selección por mirada de 3 s (anillo `#F5B301`, confirmación verde, margen de gracia, sonido) generalizándola de "un objetivo" a "N objetivos + botones".
- Una única ficha 3D reutilizable que se dibuja a partir de un objeto de constelación: título, descripción (`resumen`), historia, espacio de referencia bibliográfica, botón de narración y "Volver al recorrido".
- Datos: leer `/api/contenidos/recorridos` y, si no responde (p. ej. hosting HTTPS estático), usar una copia local de demostración con la **misma estructura**.
- Dejar listos, sin implementarlos, los puntos de conexión para libros (Karime) y audio (Luis).
- Mantener Pausa, Salir a 2D, alternativas por clic/toque y mirilla guía.
- Pruebas automatizadas nuevas y registro real de la prueba en teléfono + Homido.

### Exclusiones

API, panel administrativo, vistas Vue, `contentService.js`, Figma, reproductor de audio, contenido bibliográfico real, cambios al contrato JSON, estéreo/calibración óptica (se conserva el existente).

## Capabilities

### New Capabilities
- `homido-recorrido-constelaciones`: escena con tres constelaciones seleccionables por mirada/clic, controles y regreso sin recargar.
- `ficha-constelacion-dinamica`: ficha 3D única alimentada por datos, con ranuras de bibliografía y audio.

### Modified Capabilities
- Ninguna formal (`openspec/specs/` está vacío; `seleccion-mirada` de S2 sigue sin archivarse y se reutiliza como comportamiento base).

## Impact

- Solo `frontend/public/prueba-homido/` (+ pruebas en `frontend/test/` y un documento en `docs/`).
- Datos provisionales siempre marcados "Dato de muestra".
- Dependencias externas sin confirmar: formato de `libros[]` y `multimedia[]` (Carlos/Karime/Luis); la prueba física depende de teléfono, visor y HTTPS.
