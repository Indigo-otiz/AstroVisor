# Propuesta: QA Integrado y Validación Física en Visor Homido (Sprint 4)

## Motivación
El objetivo del Sprint 4 para el rol de QA (Karime) es comprobar que los contenidos administrados y de demostración se integran y visualizan correctamente entre la web y el visor inmersivo.
Hasta ahora, las suites de software y Playwright han validado la persistencia y la renderización en navegadores headless, pero los criterios del proyecto y la revisión académica establecen explícitamente: **«No presentar simulación de escritorio como sustituto de prueba VR»**.
Se requiere un protocolo de prueba extremo a extremo en dispositivo móvil físico colocado dentro del visor Homido real, probando las tres constelaciones, la selección por mirada, la ficha técnica, los libros rotulados DEMO, la reproducción/pausa de audio real, el menú de pausa y la salida a 2D, así como un video de respaldo de 5 minutos para la Expo de la biblioteca del 5 de noviembre.

## Alcance
- Protocolo de pruebas físicas extremo a extremo en móvil + visor Homido antes de la revisión del 3 de noviembre.
- Comprobación de permisos reales en dispositivo (sensores de orientación y audio con interacción inicial).
- Validación de flujo de mirada (dwell 3 s), ficha, libros demo rotulados, audio real y salida a 2D.
- Ensayo de 5 minutos y preparación del video de respaldo para la Expo del 5 de noviembre.
- Matriz de registro técnico de compatibilidad (dispositivo, versión de SO, navegador, red, incidencias) sin declarar compatibilidad universal.
- Revisión cruzada con integrantes del equipo.

## Fuera de alcance
- Reescritura del backend de persistencia o rediseño de Figma.
- Pruebas del editor administrativo o inyección de fallos de API complejas (pospuestas para después de la Expo).
- Declarar compatibilidad en dispositivos no probados empíricamente.
