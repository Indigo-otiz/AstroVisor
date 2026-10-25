# Especificación: Selección por mirada y retroalimentación accesible

## Requisitos de Capacidad

### R1. Retícula y mirilla accesible
- La retícula se ubicará en el centro exacto del campo visual de la cámara o viewport.
- Tendrá un punto central visible de color blanco `#FFFFFF` con halo de contraste oscuro para destacar sobre el cielo `#0B1530`.
- Tendrá un anillo exterior concéntrico que sirve como indicador visual de permanencia.

### R2. Temporizador de permanencia (*Gaze Dwell*)
- La duración requerida para completar una selección será de **3.0 segundos (3000 ms)** sin prisa, adecuada para personas adultas mayores.
- El anillo exterior se llenará de forma continua con el color de acento **`#F5B301`**.
- El progreso reflejará con claridad las 4 fases de avance:
  - **0 %:** Estado de reposo, anillo inactivo o tenue.
  - **33 %:** 1.0 segundo de mirada fija, un tercio del anillo lleno.
  - **66 %:** 2.0 segundos de mirada fija, dos tercios del anillo lleno.
  - **100 %:** 3.0 segundos de mirada fija, anillo cerrado y selección concretada.
- Si el usuario retira el punto de enfoque antes de alcanzar los 3000 ms, el temporizador se cancelará y el anillo volverá a 0 % de inmediato.

### R3. Confirmación visual accesible
- Al llegar al 100 %, la retícula emitirá una señal visual clara (pulso/cambio de color al verde de éxito `#1E7B3A` y destello suave en el objeto seleccionado).
- Se emitirá el evento de selección para abrir la información del objeto.

### R4. Información de constelación en visor
- Al seleccionar una constelación interactiva (Orión, Osa Mayor o Cruz del Sur):
  - Se desplegará un panel legible con la etiqueta `Dato de muestra`, el nombre de la constelación, una breve descripción astronómica y cultural, y la recomendación del libro asociado con la nota: *"Pídelo en persona en el mostrador de la biblioteca"*.
  - En modo estereoscópico, la información se mostrará duplicada por ojo con texto legible de 28 px.
  - Dispondrá de un botón `Volver al recorrido` operable por mirada o toque, que cerrará el panel y retornará a la retícula en 0 %.

### R5. Controles del visor y regreso a 2D
- Botones accesibles de al menos 72 px de altura con borde blanco de 4 px:
  - `[ || Pausa ]` / `[ ▶ Continuar ]`: congela o reanuda la detección de mirada para descanso visual.
  - `[ 🚪 Salir ]`: sale del visor y regresa a `/explorar` en modo web 2D tradicional.
- En todo momento, la experiencia podrá operarse sin visor mediante clic con mouse, toque en pantalla o teclado.
