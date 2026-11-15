# Proposal

## Why

El usuario solicita que los logos de IT Tepic y la Biblioteca Pública Central Estatal Solón Argüello tengan volumen y relieve detrás de la posición inicial de la cámara. Confirmó ambas condiciones en el chat. La escena actual usa imágenes planas de IT Tepic y CECAN junto a los controles; el emblema circular de Tepic se representa con ancho 0.62 y alto 0.18.

## What Changes

- Plan aprobado por el usuario en el chat: representar los dos archivos adjuntos mediante geometría con espesor y detalles en relieve, conservando colores y proporciones.
- Colocar ambas identidades en el mundo, detrás de la cámara inicial, orientadas hacia el visitante al girar.
- Aumentar su tamaño respecto a las imágenes actuales, con escala independiente para cada emblema y prioridad a su apreciación y legibilidad en el visor; conservar las proporciones internas no implica conservar sus dimensiones actuales.
- Retirar de la escena 3D la imagen CECAN y las anteriores imágenes planas junto a los controles.
- Mantener los logos fuera del grupo móvil de controles y de los objetivos seleccionables.
- Verificar pantalla y estéreo con evidencia de navegador y pruebas enfocadas.

## Capabilities

### New Capabilities

- `identidad-inmersiva-relieve`: dos emblemas con geometría volumétrica fija detrás de la cámara inicial.

### Modified Capabilities

No hay especificaciones principales en `openspec/specs`. Este cambio sucede al requisito de ubicación inferior del logo de Tepic del incremento abierto `s5-astrovisor-experiencias-contenido/specs/manuales-e-identidad/spec.md`; no reescribe aquel incremento.

## Impact

Escena `frontend/public/prueba-homido/index.html`, módulo de geometría y recursos nuevos dentro de esa página, inicialización si fuera necesaria, pruebas `frontend/test/homido-vr-s5.test.js` y cobertura específica. Reutilizar A-Frame y su Three.js local. Sin cambios de API, catálogo, autenticación, panel ni identidad de la web 2D. No borrar archivos locales ajenos ni imágenes usadas fuera del visor.

Entrega prevista: rama de trabajo y PR hacia `main`, sin push directo a `main` ni merge. Implementación sujeta a aprobación del plan conforme a AGENTS.md. Archivado sujeto a aprobación posterior. La validación física Homido queda pendiente salvo prueba real; no se acredita autorización institucional adicional por recibir los archivos.
