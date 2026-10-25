# Diseño Técnico S2 — Selección por mirada y retroalimentación accesible

## Context

En el Sprint 1 se implementó un diagnóstico de sensores y una escena A-Frame básica en `frontend/public/prueba-homido/` con un objetivo esférico y una animación de escalado simple (`scale: 0.6` en 1.8 s). 

El documento de diseño de Karime (`Spring 1_ Rendon Vazquez.pdf`) define para el Sprint 1 y la experiencia Homido un sistema visual riguroso:
- Paleta: Espacio `#0B1530`, Acento `#F5B301` (usado específicamente para estrellas, puntos de interés y **progreso de mirada**), Blanco `#FFFFFF`, Índigo Homido `#4A3F99`, Texto `#1B2430`.
- Tipografía accesible y botones de 72 px en el visor con borde blanco de 4 px (`Pausa` y `Salir`).
- Retícula de mirada con 4 estados visuales claros: 0 %, 33 %, 66 % y 100 %.
- Tiempo de permanencia (*gaze dwell*): 3 segundos continuos sin prisa.
- Al llegar al 100 %, confirmación visual y despliegue del panel de información estereoscópico para Orión (y constelaciones del recorrido), con texto de 28 px duplicado por ojo, indicación de "Dato de muestra" y botón "Volver al recorrido".
- Controles de seguridad: aviso de precaución para adultos mayores, botón de Pausa y retorno a la navegación 2D (`/explorar`).

## Decisiones Técnicas

### 1. Componente de retícula y permanencia con SVG / Canvas de precisión
En lugar de una simple animación genérica de escalado de A-Frame que no comunica el porcentaje de avance, la retícula incorporará un anillo de progreso circular SVG con `stroke-dasharray` / `stroke-dashoffset` en color `#F5B301` y núcleo blanco con halo oscuro.
- Se actualizará en tiempo real con `requestAnimationFrame` o reloj de escena durante los 3000 ms de enfoque.
- Mostrará con claridad los umbrales de avance: 0 %, 33 %, 66 % y 100 %.
- Al perder el foco del objetivo (desvío de mirada o `mouseleave`), el anillo se desvanece y reinicia suavemente a 0 %.

### 2. Confirmación accesible al 100 %
Al completarse los 3 segundos:
- Se emite una animación de confirmación (pulso / destello de éxito `#1E7B3A` y anillo completo `#F5B301`).
- Se despliega el panel de información de la constelación seleccionada (ej. Orión: resumen, cómo reconocerla y libro de muestra recomendado en biblioteca), renderizado legiblemente para ambos ojos o en modo pantalla completa accesible.
- Se proporciona el botón "Volver al recorrido" (también operable por mirada o toque) para reiniciar la retícula a 0 %.

### 3. Controles del visor y accesibilidad para personas mayores
- Se incorporan los botones de control de 72 px de alto con borde blanco de 4 px:
  - `[ || Pausa ]`: detiene la detección de mirada para que el usuario pueda descansar los ojos sin seleccionar nada accidentalmente.
  - `[ 🚪 Salir ]`: finaliza la vista inmersiva y regresa inmediatamente a la web 2D (`/explorar` o `/`).
- Se mantiene el soporte táctil y con cursor de mouse para que cualquiera sin visor o sin sensores físicos pueda realizar la experiencia idéntica en 2D.
- Rotulación visible de `Dato de muestra` en los textos de constelaciones y libros.

### 4. Integración y verificación
- La escena se servirá tanto a través de la ruta `/visor` en Vue como directamente desde `/prueba-homido/`.
- Se añadirán pruebas automatizadas para comprobar los estados del temporizador de permanencia (cancelación al desviar, confirmación a los 3000 ms, reseteo).
- Se recopilará evidencia visual con capturas reales para `docs/PRUEBA-S2-HOMIDO.md`.
