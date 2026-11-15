# Diseño

## Context

La rama de S5 parte de `main` de GitHub en `1354c70`. El PR #9 amplió `VisorView.vue` y la introducción del HTML, añadió recuperación y prueba de controles, y reforzó el desmontaje de audio, sensores y pantalla completa. El PR #12 incorporó el informe físico de Karime con Samsung Galaxy S25 y Homido y sus hallazgos de usabilidad. La prueba física corresponde a la versión de S4 que documentó ese informe.

Inicio conserva la ruta convencional `/explorar` y enlaza hoy a `/visor`. La página independiente A-Frame contiene el cielo común, modo estéreo, diagnóstico `?diag=1`, estantería y ficha canvas. `gaze-dwell.js` gobierna la selección de 3 s y el puente `narraciones.js` recibe la acción de audio y publica el estado real de `frontend/public/audio/narration.js`. La ficha Vue conserva las transcripciones mediante `NarracionAudio.vue`. En S4 pausar la mirada es independiente de pausar la voz, y la salida usa un evento que detiene el reproductor.

## Goals / Non-Goals

Dar acceso directo a los dos modos y reducir el tiempo hasta explorar o escuchar. Mostrar pocos controles legibles y una salida siempre alcanzable. El incremento abarca la experiencia pública, los audios demo, sus verificaciones y los pasos vigentes de la guía pública. El panel administrativo, el contrato editorial y los contenidos institucionales quedan fuera del incremento.

## Decisions

### Una escena con dos entradas explícitas

Usar dos enlaces de Inicio a la página estática, con `?modo=pantalla` y `?modo=homido`. Mantener `/visor` como guía compatible y conservar el acceso desde los enlaces existentes de Homido. Compartir datos, cámara base, selección y controlador de audio. El modo pantalla abre directamente una escena monoscópica que ocupa el área visible, con orientación y selección por ratón y tacto. La pantalla completa nativa podrá pedirse desde un gesto dentro de la escena cuando el navegador la permita. En Homido, presentar dos vistas del mismo cielo y una preparación breve antes de colocarse el visor.

Mantener los gestos reales para audio y sensores. Solicitar permisos de movimiento solo en el recorrido Homido y mediante una interacción explícita si el navegador los exige. Mostrar una instrucción breve cuando falte un permiso o la orientación requerida y conservar una salida útil ante rechazo. Los paneles de diagnóstico, contadores y registros se muestran únicamente al pedir diagnóstico mediante `?diag=1`. Mantener los avisos de error y recuperación que ayudan al visitante.

### Ficha centrada en escuchar

Mantener visible la figura del cielo y separar su visibilidad de la posibilidad de seleccionarla, para que los objetivos del fondo queden fuera del raycaster mientras la ficha está abierta. Reusar el layout canvas y su cálculo de zonas de selección con una ficha compacta de alto contraste, ubicación reconocible y retornos cortos. Revisar la composición en navegador tomando como referencia las observaciones de Karime en S4. Usar una sola acción principal que refleje el estado real del narrador. «Escuchar» inicia, «Pausar» conserva la posición, «Reanudar» continúa y «Repetir» empieza desde cero. «Repetir» es la acción principal al finalizar y secundaria en pausa.

Actualizar el puente existente para distinguir una repetición explícita de la acción contextual. Conservar un solo reproductor, su control de carreras, la activación por gesto y el cese al cerrar ficha, cambiar constelación o salir. La pausa de la mirilla y su recuperación de S4 siguen disponibles, con prioridad visual menor que la narración. La navegación de ficha a estantería y regreso conserva el comportamiento actual del audio dentro de la misma constelación.

### Libros y lectura completa

Reutilizar la estantería, las portadas autorizadas en los orígenes ya configurados y el vínculo de detalle a 2D. La presentación VR usa portada, título, autor y DEMO para un registro de demostración; omite los párrafos extensos. Conservar metadatos, créditos, relatos y transcripciones en el documento y la web. Ante audio o sensores bloqueados, la lectura pública sigue accesible.

### Evidencia

Guardar capturas de Inicio y la ficha en pantalla con ratón y viewport táctil, y de las dos vistas de Homido. Registrar cada entrada, constelación, modo de interacción, acciones de audio, salida y errores. Distinguir prueba automatizada, emulación, teléfono real, Homido físico y escucha humana. Medir duración y nivel de los tres archivos vigentes y documentar cualquier ajuste. Referenciar versión, entorno y fecha real. Conforme a la decisión comunicada por Luis el 14 de noviembre, el cierre de S5 prescinde de la revisión externa.

## Risks / Trade-offs

- Los permisos y la pantalla completa dependen del navegador y del contexto seguro. Mantener gesto explícito, recuperación y acceso 2D.
- La reducción de superficie puede dejar objetivos demasiado próximos en estéreo. Comprobar separación y legibilidad en ambos ojos, y registrar la prueba física cuando se disponga de visor.
- Desmontar o volver desde un libro usa rutas distintas. Comprobar que ambas liberan el audio, la vista dividida, el dwell, los sensores y la pantalla completa aplicables.
- Reportar como pendientes las pruebas físicas y las aportaciones de la biblioteca que aún no se hayan confirmado.

## Migration Plan

Tras la aprobación del plan, preparar la rama S5 a partir de `main` actualizado y conservar los archivos locales ajenos al cambio. El incremento se puede revertir sin migrar datos. Verificar las rutas históricas y el paquete público de respaldo además de los dos accesos nuevos.

## Open Questions

Queda pendiente disponer de un visor para la prueba física y confirmar una fuente para los comentarios de Expo atribuibles a la biblioteca.
