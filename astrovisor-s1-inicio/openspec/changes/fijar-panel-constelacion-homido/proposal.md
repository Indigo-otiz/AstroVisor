# Proposal

## Why

El visor posiciona la ficha y sus controles con la orientación de la cámara en el momento de seleccionar una constelación. Al mirar hacia abajo, su parte inferior puede atravesar el terreno. La ficha también sigue abierta al girar hacia otro lado, lo que impide seleccionar otra constelación.

## What Changes

- Fijar la ficha y sus controles cerca de la constelación seleccionada, con espacio sobre el terreno.
- Mantener la posición al pasar de la ficha a la estantería o al detalle del libro.
- Volver al recorrido cuando el panel completo quede fuera del campo de visión durante un intervalo breve.
- Aplicar el ajuste al recorrido Homido y a su modo libre. La pantalla 2D, el visor Three.js independiente y la prueba física se mantienen fuera del alcance de esta implementación.

## Capabilities

### New Capabilities

- `panel-espacial-homido` — posición fija de las fichas inmersivas y cierre al salir del campo de visión.

### Modified Capabilities

## Impact

Afecta al posicionamiento de los paneles y al ciclo de selección en `frontend/public/prueba-homido`. La prueba con sensores reales depende de disponer de un teléfono y un visor Homido.
