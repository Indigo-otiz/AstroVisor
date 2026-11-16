# Tasks

## 1. Posición del panel y los controles

- [x] 1.1 Anclar la ficha, la estantería, el detalle y sus controles a la constelación activa. Comprobar con una prueba de geometría que Escorpio conserva la posición con dos inclinaciones de cámara y que los controles quedan por encima del terreno.
- [x] 1.2 Verificar el anclaje al abrir y cerrar la estantería o el detalle y comprobar la escala en modo libre y en las dos mitades de Homido.

## 2. Cierre al girar la cámara

- [x] 2.1 Detectar cuándo el panel activo sale por completo de la vista y reutilizar la transición de regreso al recorrido. Probar la visibilidad parcial, el giro rápido, el cierre tras permanecer fuera de vista y el manejo de una narración activa.
- [x] 2.2 Reproducir en navegador la selección de Escorpio y el giro hacia otra constelación en modo libre y estéreo simulado. Verificar que se pueda elegir una nueva constelación, y ejecutar `npm run test:web` y `npm run build`.

## Resultados

- En Chrome, Escorpio conservó la posición al abrir con dos inclinaciones distintas. La estantería y el detalle conservaron el anclaje. El borde inferior de los controles quedó a 0.697 m y el terreno alcanzó 0.657 m.
- Al girar hacia Orión se cerró la ficha una sola vez, se detuvo la narración y se pudo seleccionar Orión. Se verificó en modo libre y en pantalla dividida simulada.
- Pasaron las 179 pruebas web y la compilación. La prueba del visor físico queda pendiente.
