# Propuesta: prueba técnica Homido del Sprint 1

## Why
Cubrir temporalmente el alcance de la prueba técnica originalmente asignada a Luis, sin adelantar el módulo VR definitivo y sin atribuir resultados físicos que no se han obtenido.

## What Changes
- Exponer una página independiente de diagnóstico en `/prueba-homido/`, con escena A-Frame mínima.
- Permitir orientación con sensores cuando estén disponibles, retícula de permanencia y vista dividida experimental.
- Proporcionar salida y alternativa web 2D; registrar eventos localmente.
- Añadir protocolo, matriz y documentación preliminar de pruebas físicas.

## Capabilities
### New Capabilities
- `prueba-homido`: evaluar por separado sensores, selección por mirada, vista dividida y modo 2D.

## Impact
Afecta `frontend/public/prueba-homido/`, `frontend/src/views/VisorView.vue` y `experiments/homido-spike/`. No altera backend ni panel administrativo.
