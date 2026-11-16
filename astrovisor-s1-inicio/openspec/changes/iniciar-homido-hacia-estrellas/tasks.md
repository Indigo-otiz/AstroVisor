# Tasks

## 1. Orientación al inicio

- [x] 1.1 Orientar la cámara de entrada hacia Can Mayor y colocar los controles debajo. Verificar que la figura y el rótulo se ven en modo libre y en los dos ojos de Homido.
- [x] 1.2 Restaurar los controles hacia el sector estelar al cerrar una ficha. Comprobar que conservan margen sobre el terreno y que se pueden volver a usar al mirar hacia Can Mayor.
- [x] 1.3 Actualizar el criterio previo de encuadre en OpenSpec. Validar la especificación de los emblemas y el requisito de separar las figuras.

## 2. Pruebas del recorrido

- [x] 2.1 Verificar en Chrome que los dos emblemas aparecen al girar media vuelta y conservan su encuadre en modo libre y estéreo simulado. Probar la entrada directa y el retorno desde una ficha.
- [x] 2.2 Ejecutar `npm run test:web` y `npm run build`. Registrar el resultado de navegador y la disponibilidad de la prueba física.

## Resultados

- Chrome mostró Can Mayor, su rótulo y los controles por encima del terreno en modo libre y en ambos ojos del modo Homido. Los emblemas quedaron detrás y se vieron completos al girar media vuelta.
- Tras cerrar las fichas, los controles volvieron al sector de Can Mayor. La prueba de navegador verificó la narración y la salida al inicio.
- Pasaron las 179 pruebas web y la compilación. La validación estereoscópica fue simulada en navegador. Queda pendiente la prueba con sensores físicos.
