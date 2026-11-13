# Especificación: Validación Física en Visor Homido

## Requisitos de la Prueba Física
1. **Verificación de Sensores:** El sistema debe responder a la inclinación y giro de cabeza en los ejes yaw/pitch/roll mediante eventos reales de orientación en dispositivo físico, tras la concesión explícita de permisos.
2. **Selección por Mirada:** La retícula debe completar las fases de dwell (33%, 66%, 100%) al mantener el enfoque durante 3.0 segundos sobre Orión, Osa Mayor o Escorpio, abriendo la ficha correspondiente.
3. **Reproducción de Audio Humano/Real:** La ficha debe emitir sonido audible al seleccionar la opción de reproducción y silenciarse de inmediato al pulsar pausa.
4. **Contenido de Demostración:** La estantería de libros consultada dentro del visor debe presentar de forma visible y clara la etiqueta `DEMO` o `Identificador simulado` en cada título.
5. **Control de Escape y Seguridad:** El usuario debe poder detener la detección de mirada («Pausar mirilla») y regresar al modo plano («Salir a 2D») sin requerir interacción táctil sobre la pantalla oculta en el visor.
6. **Evidencia y Trazabilidad:** Todo resultado debe documentarse con identificadores reales de hardware y software, sin inferir compatibilidad universal.
