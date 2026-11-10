# Proposal: S4 - Menús Homido, salida y control de narración

## Why

Durante la revisión del hito Homido (3 de noviembre) y la presentación en la Expo (5 de noviembre de 2026), se demostró con éxito el flujo mínimo de inmersión estereoscópica, selección por retícula de 3 segundos y narraciones de audio de muestra desarrollado por Índigo y Luis. Debido a la urgencia de estas fechas, **los controles mínimos de selección, pausa de mirada, pausa de audio y salida a 2D se adelantaron e integraron en el hito S3**.

Concluida la Expo, la tarjeta de Carlos en el **Sprint 4 (2–6 de noviembre)** no requiere crear dichos botones desde cero, sino concentrarse en el **refinamiento y recuperación técnica post-Expo**:
1. Reconocer y auditar los controles mínimos ya implementados, evitando duplicar controladores o reescribir la base funcional probada.
2. Resolver fallos no críticos detectados: ausencia de feedback auditivo al conmutar la pausa de mirada, falta de limpieza rigurosa de escuchadores de eventos (`deviceorientation`, `wakeLock`) al salir a 2D, y carencia de avisos de error dentro del espacio 3D cuando fallan los sensores o la carga de datos.
3. Consolidar la experiencia para personas adultas mayores con guías de orientación previa y alertas comprensibles.
4. Elaborar la documentación de evidencias post-Expo (`docs/PRUEBA-S4-HOMIDO.md`), la suite de pruebas de regresión y la revisión cruzada con otro integrante del equipo.

## What Changes

- **Auditoría y respeto a la base existente:** Se mantiene intacta la implementación funcional de `pauseBtn3D` («Pausar mirada»), el botón de audio en la ficha canvas («Pausar/Reanudar narración») y `exitBtn3D` («Salir a 2D»).
- **Feedback sonoro en conmutación de mirada:** Añadir un tono suave y diferenciado vía Web Audio API al alternar «Pausar mirada» / «Reanudar mirada», dando certeza a la persona con el visor puesto de que la selección quedó congelada o reactivada.
- **Higiene y desmontaje riguroso en Salir a 2D:** Refactorizar la rutina de salida para remover explícitamente los escuchadores globales de orientación y movimiento (`window.removeEventListener('deviceorientation', ...)`), liberar bloqueos de pantalla (`wakeLock`) y cancelar pantalla completa antes de navegar a 2D.
- **Avisos de error en el espacio inmersivo 3D:** Si la carga documental de constelaciones falla o los sensores de orientación no están disponibles, proyectar un panel informativo legible dentro de la escena 3D en lugar de depender únicamente de párrafos HTML invisibles bajo el visor.
- **Pruebas y Evidencias de Sprint 4:** Crear `frontend/test/homido-controles-s4.test.js` y `docs/PRUEBA-S4-HOMIDO.md` documentando la verificación técnica y la revisión cruzada.

## Capabilities

### New Capabilities

- `controles-homido-narracion`: Refinamiento post-Expo de la experiencia Homido: confirmación auditiva de pausa de mirada, desmontaje limpio de sensores en salida a 2D, alertas de error en el espacio 3D y trazabilidad de pruebas.

### Modified Capabilities

- Ninguna capacidad previa es revocada; se extiende la base de S3 asegurando no regresión.

## Impact

- **Archivos afectados:** `frontend/public/prueba-homido/prueba.js`, `frontend/src/views/VisorView.vue`, pruebas en `frontend/test/homido-controles-s4.test.js` y documentación en `docs/PRUEBA-S4-HOMIDO.md`.
- **Exclusiones:** No se altera el contrato documental JSON (`content/recorridos.json`), no se crean nuevos reproductores de audio y no se agregan funciones administrativas ni de usuario visitante.
