# Design

## Context

`onSceneReady()` inclina la cámara hacia `institutionalLogos3D`. Los relieves ocupan el sector de azimut 0°, Can Mayor se encuentra a −180° y los controles del recorrido parten en el sector de los relieves. El cierre del panel restaura actualmente esa posición.

## Goals / Non-Goals

**Objetivo.** Dar prioridad al cielo al entrar al recorrido A-Frame y tener los controles a la vista en ese encuadre.

**Alcance.** Orientación inicial y posición de los controles en modo libre y Homido. El posicionamiento de los paneles durante la consulta corresponde al anclaje por constelación.

## Decisions

1. Tomar el rumbo inicial de la dirección de Can Mayor en `FIGURAS`. Usar una elevación ligeramente inferior al centro de la figura para que su rótulo y los botones quepan en el encuadre. Aplicar el rumbo al inicializar los controles de cámara.
2. Colocar los controles de reposo en el mismo rumbo horizontal al entrar y al cerrar cualquier panel. Ubicar el grupo debajo de la figura en el encuadre y por encima del terreno según las posiciones reales de la escena.
3. Actualizar la verificación de relieves para probar primero la vista estelar y después girar hacia los dos emblemas. Revisar la condición de encuadre en el cambio previo de distribución, que conserva el criterio de separar figuras y emblemas.

## Risks / Trade-offs

- La vista dividida reduce el ancho disponible por ojo. Medir el encuadre en ambas cámaras para validar Can Mayor, su rótulo y los controles.
- La activación de los sensores puede ajustar la orientación. Verificar la entrada directa y la activación de vista dividida en Chrome. La validación de sensores físicos depende del dispositivo.
