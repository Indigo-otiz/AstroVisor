# Tareas S2 — Selección por mirada y retroalimentación accesible

Responsable: Karime. Periodo académico: 19–23 de octubre de 2026.
Objetivo: Implementar controles reutilizables de retícula, permanencia accesible (0 %, 33 %, 66 %, 100 % en 3 segundos), confirmación visual, regreso a modo 2D y panel informativo con datos de muestra.

## 1. Especificación y diseño de los controles
- [x] 1.1 Registrar la propuesta OpenSpec con base en el documento `Spring 1_ Rendon Vazquez.pdf` de Karime.
- [x] 1.2 Diseñar el componente reutilizable de retícula y temporizador de permanencia (*gaze dwell*) de 3 segundos con anillo amarillo `#F5B301`.

## 2. Implementación de los controles de permanencia y retícula
- [x] 2.1 Construir la retícula visual de alta visibilidad con indicador de progreso circular en 4 etapas (0 %, 33 %, 66 %, 100 %).
- [x] 2.2 Implementar la lógica de permanencia (*gaze dwell*) de 3000 ms con cancelación inmediata y reinicio a 0 % al desviar la mirada.
- [x] 2.3 Implementar la señal de confirmación visual accesible al alcanzar el 100 % de permanencia con animación y tono auditivo.
- [x] 2.4 Incorporar las constelaciones interactivas del recorrido (Orión, Osa Mayor y Cruz del Sur) con halo amarillo `#F5B301` de 48 px.
- [x] 2.5 Integrar el panel informativo estereoscópico/2D (título, descripción, "Dato de muestra", libro recomendado y botón "Volver al recorrido").
- [x] 2.6 Incorporar los controles del visor: botones de Pausa (detiene la mirada) y Salir (72 px de alto, borde blanco de 4 px, regreso directo a `/explorar` en modo 2D).

## 3. Pruebas y verificación automatizada
- [x] 3.1 Crear prueba unitaria/de integración que verifique la máquina de estados de la retícula (0 %, progreso, cancelación, confirmación a los 3000 ms y reinicio).
- [x] 3.2 Verificar que `npm test`, `npm run test:web` y `npm run build` compilen sin errores ni advertencias.

## 4. Evidencia visual y documentación
- [x] 4.1 Incorporar selector de marcos para verificación interactiva y capturas de los estados clave (0 %, 33 %, 66 %, 100 % e información).
- [x] 4.2 Redactar el reporte de entrega y evidencia en `docs/PRUEBA-S2-HOMIDO.md` con la matriz de resultados, verificación de accesibilidad y constancia del sprint.
