# Tasks

Seguimiento interno S4 de Luis. Planeado originalmente para el 2–6 de noviembre de 2026; propuesta del 9/11, America/Mexico_City. Luis confirmó que las pruebas y actividades consultadas aún no se realizaron. Las tareas se marcan únicamente al contar con su resultado y evidencia; los hitos pasados no se registran como ejecución. La preparación de estos artefactos no constituye implementación ni aceptación.

## 1. Preparación autorizada y registro de base

- [x] 1.1 Después de aprobar el plan, crear o seleccionar rama `codex/s4-web-computadora-proyeccion`; verificar rama y estado Git, preservando `entregables/` y sin modificar otros incrementos.
- [x] 1.2 Crear `docs/PRUEBA-S4.md` con commit base, fecha efectiva, entorno disponible y matriz de casos; verificar que Homido S4, HTTPS, proyección, ensayo, exposición y revisión cruzada comienzan como pendientes y que la aceptación de S3 no se copia como S4.

## 2. Vista para proyección y legibilidad

- [x] 2.1 Añadir en el shell público el control nativo de vista para proyección con estado visible y `aria-pressed`; verificar activación/desactivación con clic, Enter y Espacio, permanencia entre inicio/listado/ficha y vuelta a vista habitual al recargar, registrando resultado en `docs/PRUEBA-S4.md`.
- [x] 2.2 Incorporar estilos de presentación acotados a rutas públicas con cuerpo principal mínimo 24 px predeterminados, ancho de lectura limitado y controles mínimo 48 px; medir estilos y contraste, comprobar reflujo sin recortes a 1024×768 y 1920×1080 y guardar capturas de inicio, listado y ficha con nombre de versión y viewport.
- [x] 2.3 Comprobar ambas vistas a 360, 1280 y 2560 px y zoom nativo al 200 %; corregir defectos de desbordamiento/superposición y documentar método, medidas y límites. Si solo se puede simular texto mayor, conservar pendiente la comprobación nativa.
- [x] 2.4 Documentar control, comportamiento de recarga y límites de proyección en `docs/GUIA-S4-EXPO.md`; verificar que el recorrido permite desplazamiento vertical y mantiene rótulos demostrativos y créditos, y que administración y escena Homido no reciben la clase ampliada.

## 3. Interacción en computadora y recuperación

- [x] 3.1 Recorrer inicio, listado, las tres historias, audio, créditos y regreso usando solo teclado; corregir únicamente defectos observados de foco, salto al contenido, historial o activación, y registrar pasos/resultados con foco visible en ambas vistas. Añadir prueba de regresión solo si existe lógica nueva o defecto conductual que la justifique.
- [x] 3.2 Repetir acciones con ratón y narraciones reales, verificando Escuchar/Pausar/Reanudar y detención al abandonar ficha; registrar resultados y distinguir estado de reproducción observado de escucha humana no comprobada.
- [x] 3.3 Ejercitar API fallida y recuperada, audio ausente y motor 3D ausente mediante fixture local separado del producto; verificar error/reintento/salida y conservación de lectura cuando corresponda, documentando las fallas como inducidas y guardando evidencia S4.
- [x] 3.4 Completar en la guía la ruta de apoyo Homido → 2D → video según fallo, con comandos locales comprobados y procedimiento de enlace HTTPS; verificar enlaces y salida `/explorar`, sin etiquetar localhost o una URL no comprobada como prueba HTTPS del recinto.

## 4. Video local y preparación de presentación

- [x] 4.1 Preparar el guion de cinco minutos en `docs/GUIA-S4-EXPO.md`, con secuencia 2D, narraciones, 3D, regreso y contingencias; verificar duración asignada total de cinco minutos, rótulos, procedencia de recursos y ausencia de afirmaciones de Expo realizada el 5/11.
- [x] 4.2 Capturar un archivo de video real del build servido que cubra inicio, proyección, tres historias/narraciones, pausa/reanudación, escena/ficha 3D y retorno a 2D; guardar archivo y descripción textual, verificar contenido y audio, y dejar pendiente cualquier parte no capturable sin presentar imágenes como video ni captura de escritorio como Homido físico.
- [x] 4.3 Inspeccionar duración, dimensiones, pista de audio, tamaño y SHA-256 del archivo; reproducirlo completo sin conexión y registrar reproductor, versión, fecha y resultado en el manifiesto/registro S4. Documentar copia al equipo de ensayo y cualquier verificación aún pendiente en ese equipo.

## 5. Integración técnica de la entrega

- [x] 5.1 Ejecutar `npm test`, `npm run test:web`, `npm run build` y `git diff --check`; revisar el build servido con API/medios reales y ejecutar una vez el detector Impeccable sobre los archivos UI cambiados, resolviendo hallazgos aplicables y guardando comandos, versiones y resultados efectivos.
- [x] 5.2 Verificar regresión conjunta: navegación y audio en ambas vistas, enlace al visor, rótulos/créditos y denegación por servidor de API administrativa sin sesión; consolidar capturas/logs y manifiesto de versión con hashes, distinguiendo cambios sin commit, simulaciones y pruebas observadas.

## 6. Validación física y revisión del equipo

Decisión de Luis del 10 de noviembre de 2026: las actividades 6.1–6.4 aún no se realizaron y se dejan pendientes, fuera del trabajo inmediato y sin fecha comprometida. Conservar las casillas abiertas; el avance técnico actual es 16/20. Retomarlas cuando Luis lo indique, sin solicitar nuevas pruebas durante este cierre de seguimiento.

Aclaración posterior del mismo día: Luis confirmó que Homido y pantalla **ya fueron revisados y funcionan correctamente**. Se actualizan 6.1 y 6.2 a **validación funcional reportada correcta, registro detallado parcial**; ver `docs/evidencias/s4/validacion-reportada.json`. Sus casillas permanecen abiertas únicamente por los detalles y pasos del protocolo aún sin confirmar, incluidos HTTPS y video sin red en el equipo. 6.3 y 6.4 siguen diferidas; la palabra «revisamos» no identifica a un revisor cruzado. No solicitar nuevas pruebas durante este cierre de seguimiento.

Confirmación siguiente del 10/11: Luis identifica a **Índigo Ortiz** como revisor de S4 e informa que «dice que está bien». Se completa 6.4 con nombre, alcance general, conformidad y fuente en este chat, registrados en la constancia anterior. Fecha exacta y versión no especificadas; no se atribuye revisión formal de GitHub. Avance actualizado: 17/20; 6.1–6.2 conservan registro parcial y 6.3 sigue diferida.

- [ ] 6.1 Realizar apoyo técnico con teléfono y Homido real sobre la versión S4: abrir enlace HTTPS, activar audio/sensores, seleccionar, pausar/reanudar, salir y continuar en 2D; registrar fecha real, modelo, sistema/navegador, versión, URL, visor, sonido y evidencia por caso, sin sustituir el visor por proyección.
- [ ] 6.2 Ejecutar un ensayo real con computadora y proyector/pantalla disponibles: verificar resolución, luz, distancia, texto legible, teclado/ratón, HTTPS/API y sonido; reproducir además respaldo local sin red, registrar evidencia e incidencias y mantener pendientes equipos o condiciones no probados.
- [ ] 6.3 Ensayar la exposición de cinco minutos con el equipo y registrar duración real, participantes, recorrido elegido, cambios de contingencia y limitaciones. Registrar apoyo de Expo solo si ocurre y con fecha/fuente reales; si el hito original no ocurrió, mantenerlo declarado no realizado sin bloquear la adaptación técnica posterior.
- [x] 6.4 Obtener revisión cruzada de otro integrante sobre versión S4, interacción, video, materiales y evidencias; registrar nombre, alcance, resultado, incidencias y fuente de confirmación sin reutilizar aprobación S3 ni presentar autoevaluación o revisión AI como revisión del compañero.
- [x] 6.5 Actualizar `docs/PRUEBA-S4.md` con aceptación o pendientes y distinguir avance implementado, simulado, observado y reportado; verificar correspondencia con archivos y matriz. No cerrar aceptación mientras falten comprobaciones exigidas, y no archivar el cambio sin aprobación de Luis.
