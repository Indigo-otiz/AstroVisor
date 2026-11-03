# Propuesta S3 — Contrato JSON/API para integrar narraciones y libros en 2D/3D

## Why

Para la revisión del 3 de noviembre de 2026, el visitante necesita consultar las mismas historias, referencias bibliográficas y recursos de audio estructurados tanto en la interfaz web 2D como en la escena inmersiva 3D con visor Homido, sin depender de redes institucionales ni de servicios externos de biblioteca.
Debido a la repriorización de cara a la Expo del 5 de noviembre, se posterga el editor administrativo completo (CRUD) para después de dicho evento, concentrando el esfuerzo en un contrato documental compartido robusto, reproducible localmente y validado contra errores de carga, sin incorporar bases de datos adicionales ni depender de Supabase para servir la experiencia pública de demostración.

## What Changes

- Definir y validar el contrato JSON documental unificado para las tres constelaciones (`orion`, `osa-mayor`, `escorpio`), incluyendo historias, figuras de reconocimiento, libros reales de dominio público marcados explícitamente como "Referencia de demostración" y rutas locales a narraciones de audio reproducibles.
- Servir este contenido a través de la API común de Express (`GET /api/contenidos/recorridos`) para la web 2D (`ExplorarView.vue`, `ConstelacionView.vue`) y sincronizar el recurso local de respaldo (`recorridos-demo.json`) para la escena A-Frame Homido (`prueba-homido/`), evitando la duplicación o el "hardcodeo" de fichas y datos en la escena.
- Verificar rutas locales de medios/audio, manejo de estados de carga, fallos de red y recuperación automática mediante el respaldo local ante indisponibilidad del servidor.
- Garantizar que la integración se ejecute progresivamente: primero el flujo completo de Orión, seguido de Osa Mayor y Escorpio.
- Mantener intacto el sistema de login administrativo en Express previamente desarrollado en S2, pero posponer formalmente la persistencia de edición CRUD y cualquier migración de almacenamiento hasta después de la Expo.

### Exclusiones

- Editor administrativo CRUD para crear/modificar constelaciones o libros desde el panel web (pospuesto a post-Expo).
- Nuevas bases de datos relacionales o dependencia de red externa para la experiencia de los visitantes.
- Préstamos físicos, reservas de biblioteca o cuentas de usuario para visitantes.

## Capabilities

### New Capabilities

- `contrato-documental-compartido`: especificación y validación del formato JSON único consumido por la API de Express y por el visor 3D, cubriendo constelaciones, libros de muestra y recursos de audio locales con tolerancia a fallos.

### Modified Capabilities

- Ninguna especificación base preexistente en `openspec/specs/`. Complementa los cambios de S2 y S3 existentes manteniendo compatibilidad con `login-admin-supabase`.

## Impact

- `content/recorridos.json`: fuente canónica documental del backend.
- `frontend/public/prueba-homido/data/recorridos-demo.json`: respaldo local alineado 100% al contrato compartido (libros y audio incluidos para funcionamiento autónomo o estático).
- `backend/src/index.js` y `backend/src/services/documentRepository.js`: servicio de consulta de contenidos.
- `frontend/src/services/contentService.js` y `frontend/public/prueba-homido/js/datos.js`: validadores y adaptadores sincronizados del contrato JSON.
- Pruebas automatizadas en `backend/test/` y `frontend/test/` para validar contrato, rutas de error y fallback.
- Documentación de pruebas y evidencias en `docs/`.

Responsable: Carlos. Seguimiento: S3, 26 de octubre–3 de noviembre de 2026.

