# Design

## Context

`colocarVistaFrente()` proyecta la ficha y los controles a partir de la posición y el cuaternión de la cámara. También se ejecuta al cambiar de vista de lectura. El ángulo vertical de la cámara se aplica tanto a la distancia frontal como al desplazamiento de los botones. El visor dispone de las direcciones de las constelaciones, de la cámara mono y de las proyecciones que usa para renderizar ambos ojos.

## Goals / Non-Goals

**Objetivo.** Posicionar y cerrar los paneles de lectura del recorrido A-Frame en modo libre y Homido. Las acciones por clic, toque o mirada y la pausa conservan sus reglas de selección.

**Alcance.** El ajuste se aplica al recorrido que muestra la captura. La verificación física con sensores requiere un equipo compatible.

## Decisions

1. Calcular un anclaje en coordenadas de la escena a partir de la dirección fija de la constelación. Situar la ficha junto a su rótulo, orientada hacia el observador, con una altura que deje margen entre el terreno y el borde inferior de los controles. Usar el tamaño del área visible en mono y por ojo para ajustar la escala al cambiar el tamaño de la ventana o el modo.
2. Reutilizar el anclaje al abrir estantería, detalle y al regresar. La orientación de la cámara se usa para determinar visibilidad. La posición se calcula con la geometría de la escena.
3. Comparar los límites del panel activo con el campo de visión real. En estéreo cuenta cualquier parte visible en cualquiera de los ojos. Cerrar solo si queda fuera de la vista de forma continua durante un intervalo breve, con un temporizador que se reinicia al recuperar visibilidad.
4. Reutilizar `cerrarFicha()` para desactivar los objetivos del panel, cancelar la selección en curso, restaurar los controles del recorrido y emitir el evento de cierre que detiene la narración. La pausa de mirada y la salida siguen accesibles durante la consulta.

## Risks / Trade-offs

- El marco completo del canvas incluye zonas transparentes. Medir la región visible del panel activo evita que un margen vacío retrase el cierre.
- La pantalla dividida tiene un campo horizontal menor. Comprobar el anclaje en los dos ojos y seleccionar Escorpio desde más de una inclinación para verificar acceso por mirada y por clic.
- La detección se ejecuta con el ciclo de la escena. Reutilizar los cálculos y objetos temporales para evitar trabajo innecesario entre cuadros.
