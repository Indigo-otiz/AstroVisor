# Proposal

## Why

El visitante necesita escuchar las historias a su ritmo sin perder la lectura cuando el audio falla. El Sprint 3 de Luis requiere tres narraciones reales y controles dentro de fichas 3D para la revisión Homido del 3 de noviembre y la Expo del 5 de noviembre de 2026; los relatos 2D actuales y el objetivo de prueba Homido todavía no ofrecen esa experiencia.

## What Changes

- Preparar un archivo de audio reproducible por constelación: Orión, Osa Mayor y Escorpio, con transcripción fiel y registro verificable de autoría, voz, procedencia y permiso. Confirmar los guiones originales: los únicos textos encontrados son adaptaciones demostrativas en `content/recorridos.json`, sin atribución individual ni archivos de voz.
- Incorporar fichas mínimas de las tres constelaciones en la escena A-Frame existente, con apertura y controles por mirada y alternativa táctil/teclado. Reutilizar el diagnóstico de sensores y la vista dividida experimental.
- Ofrecer Escuchar, Pausar y Reanudar, con una sola narración activa, y detener/reiniciar al cerrar ficha, cambiar constelación o salir del visor.
- Añadir Activar audio mediante gesto explícito antes de usar Homido y recuperación visible si la reproducción por mirada se bloquea. La activación será un intento comprobable, sin prometer compatibilidad universal.
- Mantener las historias y transcripciones legibles sin sonido, sin sensores ni visor; añadir controles equivalentes en la ficha web existente sin sustituir su diseño.
- Registrar pruebas técnicas, escucha real de los tres archivos, prueba física en iPhone Safari y/o Android Chrome y revisión cruzada. Mantener S3 pendiente hasta contar con la evidencia exigida.
- Video se pospone hasta después del hito 3D del 3/11. No se añaden cuentas, CRUD, catálogo, base de datos ni funciones administrativas.

## Capabilities

### New Capabilities

- `narraciones-constelaciones`: recursos de voz reales, procedencia y transcripciones; reproducción controlada en fichas 3D y web, activación móvil y conservación de lectura.

### Modified Capabilities

Ninguna especificación principal: `openspec list --specs --json` devuelve inventario vacío. Se complementan los cambios abiertos S1 y S2 sin archivarlos ni certificar sus pruebas pendientes. La exclusión de audio del incremento S2 no impide incorporarlo ahora como S3; no se afirma aprobación institucional.

## Impact

- Datos en `content/recorridos.json` y documentación de contenidos; recursos locales propuestos en `frontend/public/audio/` y metadatos documentales.
- Ficha Vue `frontend/src/views/ConstelacionView.vue`, validación del contrato multimedia en `frontend/src/services/contentService.js` y módulo de reproducción compartible con la página HTML independiente.
- `frontend/public/prueba-homido/` y acceso desde `/visor`: fichas de demostración y controles integrados en escena; no se reemplaza la aplicación React en `DEMO/`.
- Se conserva `GET /api/contenidos/recorridos` y la denegación de `/api/admin`. No se necesita un servicio de síntesis de voz en tiempo de ejecución.
- Pruebas de Node existentes, build Vite y evidencia S3 fuera de OpenSpec. Los artefactos OpenSpec son internos, no entregables académicos.
- Dependencias externas sin confirmar: identidad/permiso de los guiones, método y permiso de grabación o síntesis, disponibilidad de teléfono/visor y revisión por otro integrante. No se inventarán autores, licencias ni resultados físicos.
- La configuración menciona límites de S1: el alcance explícito S3 de esta solicitud permite audio y fichas 3D mínimas, pero no una experiencia VR definitiva ni calibración Homido certificada.

Estado inicial: propuesta para aprobación; implementación y pruebas S3 no iniciadas. Ventana académica 26 de octubre–3 de noviembre, distinta de las fechas reales de ejecución que se registren.
