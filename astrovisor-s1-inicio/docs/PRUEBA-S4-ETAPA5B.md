# S4 Etapa 5B — desbordamiento y accesibilidad de la ficha

## Alcance

Rama comprobada `indigo/s4-persistencia-documental`; base `5b7172b15b3314934bd9c0999a27f1294215503b`. Implementación inicial local; posteriormente el usuario autorizó auditoría y commit/push exclusivos de5B si no hay bloqueantes, sin merge ni archivo OpenSpec. El único cambio funcional es una propiedad de `frontend/src/public.css`; no se rediseña la ficha ni se modifica BibliotecaView, backend, auth, Homido, audio o datos versionados.

## Reproducción antes de cambiar CSS

Chrome headless156.0.8078.80, viewport360×900, ficha temporal `aa-aceptacion` con el mismo título/autor del ensayo5A, `body.style.zoom='2'`. Catálogo y procesos temporales externos al checkout, sin cuenta administrativa ni datos institucionales.

| Medición | Valor inicial |
|---|---|
| window.innerWidth |360|
| document.documentElement.clientWidth |360|
| document.documentElement.scrollWidth |447|
| document.body.scrollWidth |224|
| visualViewport |width360, height900, scale1, offsetLeft0|

Son valores directos de las APIs, sin convertir unidades de body bajo zoom CSS. No es un zoom por pellizco ni zoom nativo. Registro completo: [diagnostico-antes.json](evidencias-s4-5b/diagnostico-antes.json), captura [reproducción exacta360](evidencias-s4-5b/diagnostico-360-css-200.png).

| Elemento inicial | x / borde derecho / ancho visual(px) | Observación |
|---|---|---|
| #contenido y .biblioteca-page |40 /320 /280|Contenedor disponible140px CSS; su contenido rebasa su ancho|
| .biblioteca-detalle |40 /320 /280|Pista usada197.461px CSS aunque contenedor mide140|
| .biblioteca-detalle-portada |40 /324.34 /284.34|Ancho porcentual calculado sobre la pista expandida|
| .biblioteca-detalle-info |40 /434.92 /394.92|min-width:auto; ancho197px CSS|
| .biblioteca-buscar y botón externo |40 /434.92 /394.92|Siguen el ancho de información; no son el borde máximo del documento|
| .biblioteca-marc |88.80 /386.13 /297.33|También excede el viewport|
| .brand de cabecera |40 /447.05 /407.05|Borde máximo que determina447px del documento|

Se inspeccionaron los estilos de BibliotecaView, App.vue, styles.css y public.css. La regla pública heredada era `overflow-wrap:break-word`. Se probaron overrides reversibles en el navegador, sin editar fuentes:

- `min-width:0` sobre información: ajustó la ficha al contenedor, pero el documento continuó447 por la cabecera.
- `overflow-wrap:anywhere` solo sobre biblioteca-page: ajustó la ficha, pero continuó447 por la cabecera.
- Un override de grid sin especificidad suficiente no cambió la pista calculada; no se interpretó como demostración de que cambiar la pista fuera inútil.
- `overflow-wrap:anywhere` sobre public-shell: documento360; marca y bloque de información terminan en320, dentro del contenedor. Retirado después del diagnóstico.

La causa comprobada abarca el dimensionamiento intrínseco de la marca flex y de la información en grid con la regla heredada de salto de palabra; no se atribuyó únicamente a una columna o ancho mínimo. Los textos/identificadores largos ampliaron el mismo defecto en las pruebas de estrés.

## Corrección mínima

```diff
 .public-shell {
-  overflow-wrap: break-word;
+  overflow-wrap: anywhere;
 }
```

No se añadieron reglas de ocultación/recorte, transformaciones, reducción de fuentes, anchuras forzadas ni cambios de datos. Se conservan las reglas de proporción de portadas, colores, tipografía, botones, foco y jerarquía. En el espacio muy estrecho producido por zoom CSS las palabras pueden repartirse entre líneas; no se truncan ni ocultan.

Se eligió la regla global pública porque el máximo desbordamiento provenía también de su cabecera. Sus efectos se comprobaron en inicio, exploración, constelación y estantería, además de las fichas. No se aplicó un cambio global a body, administración o página Homido independiente.

## Regresión reproducible

Nuevo `scripts/probar-biblioteca-responsive.mjs`: utiliza Playwright disponible externamente, Vite y Express reales con catálogo temporal. No instala dependencias en el proyecto. Crea dos libros de prueba con el editor/validador existentes y sirve sus SVG por la API; elimina el almacenamiento temporal al finalizar. No configura administradores ni escribe el catálogo real.

Ejecución desde raíz de la aplicación:

```powershell
# Si Playwright no está instalado como paquete resoluble, indicar el módulo ya disponible:
$env:ASTROVISOR_PLAYWRIGHT_MODULE='file:///RUTA-LOCAL-AL-MODULO/playwright/index.mjs'
$env:ASTROVISOR_RESPONSIVE_ETAPA='despues'
node scripts/probar-biblioteca-responsive.mjs
```

El valor RUTA-LOCAL es un marcador, no una ruta ejecutada literalmente. En esta sesión se usó el runtime Playwright ya instalado de Codex y Chrome instalado (`channel:chrome`). `ASTROVISOR_RESPONSIVE_ETAPA` solo selecciona el nombre de las evidencias (`antes`/`despues`); no cambia CSS ni debilita aserciones. Para reproducir el rojo se necesita el CSS anterior: cambiar solo la etiqueta de evidencia no revierte fuentes.

Matriz:5 anchos(320/360/375/768/1280)×2 zoom CSS(1/2)×9 páginas/casos=90. Incluye tres libros originales, libro nuevo regular, otro con título W×12/autor W×17, ID largo y motivo sin espacios; MARC se abre para medir sus metadatos completos. Los otros cuatro casos son inicio, exploración, Orión y estantería. La versión final espera tarjetas/constelación cargadas antes de medir.

El runner comprueba anchura de documento, existencia del texto completo de autor/MARC, enlace visible, proporción natural/renderizada de la portada y cero pageerror. Aparte comprueba Enter para abrir la ficha, focoH1, Tab/Shift+Tab, apertura de MARC, foco visible, activación del enlace externo, vuelta a estantería y Atrás. La petición externa se intercepta con una página de prueba: se valida activación, no disponibilidad ni contenido de la fuente bibliográfica remota.

Resultados rojo/verde observados, sin editar aserciones para aceptar el desbordamiento:

- Primer intento del fixture:409 por URL de prueba duplicada entre los dos libros. Se corrigieron únicamente sus URLs temporales para hacerlas únicas; aún no se había modificado CSS.
- CSS anterior:90 mediciones,34 casos de desbordamiento; salida1 por la aserción responsive. Teclado/foco sin fallo y cero errores JavaScript. [Mediciones antes](evidencias-s4-5b/antes-mediciones.json).
- Tras cambiar una propiedad:90 mediciones sin fallos; salida0. Se repitió después de reforzar la espera de contenido cargado en las páginas auxiliares. [Mediciones después](evidencias-s4-5b/despues-mediciones.json).
- Vite emitió avisos de imports existentes bajo public/ durante el runner de desarrollo. No se cambiaron esos consumidores de4B ni se interpretaron los avisos como fallo de la prueba. Se conservaron los errores iniciales descritos; no se modificó el controlador de mirada.

La regresión de90 casos es independiente y no está incluida en el contador137 de `npm run test:web`.

## Comparación medida

Ficha original `star-lore`, MARC desplegado: scrollWidth del documento antes→después. En cada fila innerWidth/clientWidth coinciden con viewport; se conservan todos los datos en los JSON enlazados.

| Viewport |Sin zoom|CSS200%|body.scrollWidth CSS200% antes→después|
|---|---|---|---|
|320|320→320|435→320|217→160|
|360|360→360|447→360|224→180|
|375|375→375|461→375|230→188|
|768|768→768|768→768|384→384|
|1280|1280→1280|1280→1280|640→640|

Después, en360/CSS200%, main y ficha conservan x40/derecha320/ancho280 visuales; grid usa140px CSS, la información140px y su scrollWidth140. Marca termina en320. visualViewport sigue width360/height900/scale1. Ningún elemento medido rebasa el viewport en ese caso.

Los metadatos temporales largos produjeron antes hasta1315px con CSS200%; después respetan el viewport en todos los anchos probados. El renderer y los contenidos permanecen iguales.

Comparación automatizada de1650 valores de font-size/color/background entre casos emparejados antes/después:0 diferencias observadas. Botón externo blanco sobre rgb(31,78,140): contraste calculado8.31:1, sin cambiar colores. No es auditoría WCAG exhaustiva. La proporción de las portadas coincidió con naturalWidth/naturalHeight con tolerancia0.01 en los50 casos de ficha. No se modificó ningún SVG.

Capturas inspeccionadas:

- [Original360/CSS200%, motivo corto](evidencias-s4-5b/diagnostico-360-css-200.png).
- [Antes360/CSS200%, metadatos largos](evidencias-s4-5b/antes-360-css-200.png).
- [Después360/CSS200%, mismos metadatos largos](evidencias-s4-5b/despues-360-css-200.png).
- [Antes1280/CSS200%](evidencias-s4-5b/antes-1280-css-200.png).
- [Después1280/CSS200%](evidencias-s4-5b/despues-1280-css-200.png).

## Accesibilidad y zoom nativo

Comprobados en Chrome: Tab/Enter/Shift+Tab, foco al abrir H1, contorno solid3px en enlace, Enter abre details, enlace externo activable con teclado, retorno a la estantería y focoH1 después de Atrás. Las leyendas ilustrativas y avisos demostrativos permanecen en la ficha; textos/MARC largos se redistribuyen sin elipsis o recorte. Las imágenes conservan proporción. Las capturas200% muestran una página más alta, no información eliminada.

**Zoom nativo200% no ejecutado.** La automatización usada fue viewport y CSS zoom en Chrome headless; no se acreditó un control verificable del porcentaje nativo del navegador. No se usaron transform:scale, deviceScaleFactor ni pinch para simular una verificación nativa. No cerrar5.5 por estas pruebas.

Procedimiento manual pendiente y reproducible:

1. Usar Chrome de escritorio con la aplicación y un catálogo de prueba; dejar `document.body.style.zoom='1'`, sin transformaciones ni emulación de dispositivo.
2. Si hace falta un área de contenido de360px, usar DevTools acoplado lateralmente, con emulación de dispositivos desactivada, y ajustar el panel hasta medir innerWidth360 al100%. Registrar clientWidth/scrollWidth/body.scrollWidth/visualViewport y captura.
3. Abrir el menú del navegador y ajustar **Zoom a200%**, comprobando el número mostrado en el propio menú. Capturar ese indicador; no sustituirlo por estilo CSS o escala de dispositivo.
4. Volver a medir el viewport CSS resultante y las mismas anchuras; abrir MARC, recorrer con Tab/Shift+Tab, activar controles con Enter y volver a estantería/Atrás. No exigir que innerWidth continúe360 tras zoom nativo; registrar su valor real.
5. Comprobar ausencia de desbordamiento, texto y leyendas completos, foco visible y proporción de portadas. Repetir con originales/nuevo y escritorio; registrar navegador/SO/dimensiones y cualquier fallo. Restaurar el zoom nativo a100% al terminar.

Este procedimiento no se declaró ejecutado. Móvil real, Homido físico/sensores, escucha humana e infraestructura/ACL/HTTPS/backup externo siguen pendientes en sus tareas.

## Validaciones generales

Windows10.0.26200.0, Node24.21.0 y npm11.0.0. Suites ejecutadas separadamente después del navegador:

| Comando | Resultado |
|---|---|
| npm test |107/107, salida0|
| npm run test:web |137/137, salida0|
| npm run build |Correcto, Vite6.4.4,51 módulos|
| openspec validate s4-persistencia-documental --strict |Correcto, salida0, documentos5B actualizados|

La validación inicial de implementación pasó137/137 sin fallo de mirada. En la auditoría posterior de publicación se observó una intermitencia que se conserva en el apartado siguiente. No se atribuye a esta corrección la resolución de intermitencias históricas. No se tocaron pruebas o componentes ajenos para ocultar fallos.

## Auditoría final para publicación

HEAD local/remoto cotejados con la base esperada. Revisión del diff: una propiedad funcional y archivos de prueba/evidencia/documentación exclusivamente de5B. Se recalcularon los34 desbordamientos desde las90 mediciones anteriores, comprobando combinaciones únicas y mismo umbral scrollWidth > clientWidth+1. No se relajó la aserción para aceptar desbordamientos.

Chrome se repitió con la versión final del runner:90 casos,0 fallos,0 errores JavaScript; foco solid3px, teclado, enlace externo interceptado, retorno y proporciones comprobados de nuevo. Conserva métricas de viewport/clientWidth/scrollWidth y recursos desde Express temporal. Además se probaron seis estados de error: exploración, Orión y ficha, a360px y zoom CSS1/2, con API503 y respaldo503 interceptados. Todos midieron documento360/client360 y mostraron role=alert y reintento visible; Enter generó otra petición. Este ensayo adicional no se suma al contador90 de la matriz.

La revisión de capturas y valores conserva textos/leyendas completos, fuentes y colores, sin ocultación o recorte añadido. El ancho estrecho puede repartir palabras entre líneas; no se presenta esa revisión como validación universal de legibilidad ni conformidad WCAG integral. Zoom nativo y dispositivos físicos siguen sin comprobar.

Resultados generales repetidos para publicación: backend107/107; primera suite web136/137 y repetición completa137/137; build correcto51 módulos y OpenSpec estricto correcto. La primera web empezó mientras el comando backend todavía tenía una sesión activa después de devolver control al runner. Se esperó la finalización real de backend antes de repetir toda la suite web, no solo el caso fallido.

Fallo conservado: `GazeController avanza por las etapas 0%, 33%, 66% y confirma en 100%`, aserción `stagesVisited.includes('33%')`, duración observada175.727ms. La prueba usa dwell100ms y espera150ms; el controlador programa ticks con setTimeout16ms en Node. Importa únicamente el controlador JavaScript, sin CSS. Controlador y prueba son idénticos a HEAD. Un diagnóstico Node sin CSS, bloqueando el bucle80ms después de start, produjo etapas `["0%","66%","100%"]`, confirmed=true e incluye33=false. Esto reproduce el mecanismo temporal de salto de etapa; no determina qué originó exactamente el retraso de la ejecución real. No se cambió mirada, no se debilitó la prueba y no se afirma resuelta esa intermitencia.

No se identificaron nuevos bloqueantes de accesibilidad o integridad atribuibles al cambio revisado. La publicación se limita a los12 archivos inventariados y mantiene5.5 parcial. No se realizaron pruebas físicas, zoom nativo ni despliegue institucional durante esta auditoría.

## OpenSpec, inventario y límites

Se añade evidencia local a5.5; la tarea general permanece parcial por zoom nativo y verificaciones restantes. No se declara Sprint4 terminado, no se cierran pruebas físicas ni operación institucional, ni se archiva el cambio.

Archivos de5B:

- `frontend/src/public.css`: una propiedad.
- `scripts/probar-biblioteca-responsive.mjs`: nueva regresión con mediciones y aserciones de usuario.
- `docs/PRUEBA-S4-ETAPA5B.md`: este informe.
- `openspec/changes/s4-persistencia-documental/tasks.md`: evidencia y pendientes.
- `docs/evidencias-s4-5b/`: cinco PNG y tres JSON enumerados/enlazados en el informe (diagnóstico y matrices antes/después).

No se modifican BibliotecaView, datos JSON versionados, backend, autenticación, Homido, exportador, audio, transcripciones ni los tres SVG. Los fixtures privados de la prueba son temporales y no quedan en Git. No se crearon cuentas.

Se conservan los archivos ajenos preexistentes: `.gitignore`, `docs/VALIDACION-PR6-S4.md`, `.presentacion-build/`, guion y PDF/PPTX. Comprobación repetida previa a publicación:2281 archivos con hash agregado SHA-256 igual al inicial `ACF1CBE34F9B96E0F93EEFAD29AB0415DDB78615BBDD860B66292AE74A460B2C`. HEAD base5b7172b15b3314934bd9c0999a27f1294215503b; main local/remoto f1058c9b10641c470d7d3e331a81f327af78fc8c. Índice vacío antes de seleccionar exclusivamente5B. Sin autorización de merge o archivo OpenSpec.

Inventario local de5B:12 archivos (CSS, prueba, informe, tasks y ocho evidencias). No hay diff en los componentes, servicios, datos o activos expresamente excluidos. La línea vacía preexistente de `.gitignore` se mantiene; no pertenece a esta entrega.
