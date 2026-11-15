# Diseño técnico: QA Integrado y Protocolo de Prueba Física

## Arquitectura de la Prueba Extremo a Extremo
1. **Punto de Entrada en Dispositivo Físico:**
   - La prueba se realiza cargando la vista `/prueba-homido/index.html` bajo contexto seguro (HTTPS o túnel seguro / DevTools port forwarding).
   - Secuencia de inicialización en pantalla plana antes de inserción en Homido:
     - Tocar «Activar audio» para desbloquear el contexto de audio (`AudioContext`) restringido por políticas de autoplay en navegadores móviles.
     - Tocar «Solicitar sensores» para invocar `DeviceOrientationEvent.requestPermission()` (indispensable en iOS Safari).
     - Tocar «Probar vista dividida» para activar el canvas estéreo en orientación horizontal.
2. **Interacción Inmersiva Homido (3D):**
   - Retícula central con temporizador dwell de 3 s (`gaze-dwell.js`).
   - Las 3 constelaciones distribuidas espacialmente: Orión (-70°, 25°), Osa Mayor (12°, 34°), Escorpio (100°, 21°).
   - Ficha flotante con render en canvas (`ficha-canvas.js`), botón de narración de audio, estantería de libros recomendados con marca `DEMO`.
   - Controles de recuperación y seguridad: «Pausar mirilla» (deshabilita dwell) y «Salir a 2D» (regreso a la web convencional sin mareo).
3. **Plan de Contingencia (Fallback 2D y Video de Respaldo):**
   - Grabación continua de 5 minutos del recorrido para proyección en caso de fallo de conectividad en la biblioteca o visitantes con mareo/incomodidad visual.
   - Navegación web 2D alternativa (`/explorar`) accesible para adultos mayores sin requerir visor.

## Matriz de Registro y Criterios
- La compatibilidad queda restringida únicamente a la tupla `(Dispositivo, SO, Navegador, Red)` efectivamente comprobada.
- No se consideran aprobadas pruebas de escritorio simuladas.
