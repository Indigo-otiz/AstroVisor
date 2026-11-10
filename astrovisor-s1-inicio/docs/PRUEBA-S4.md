# Registro de pruebas S4 — computadora y proyección

Responsable: Luis Alberto Rodríguez. Periodo base: 2–6 de noviembre de 2026. Implementación autorizada el **9 de noviembre de 2026**, America/Mexico_City, mediante «continua» en este chat. Luis confirmó que las pruebas y actividades del periodo base no se realizaron. No se atribuye participación en Expo ni se retrofechan evidencias.

Estado al **10 de noviembre de 2026**: **la parte de Luis está terminada**. Adaptación implementada, regresión técnica aprobada, zoom nativo 200 % comprobado y respaldo audiovisual verificado localmente. Luis reportó funcionamiento correcto de Homido/pantalla y conformidad de Índigo. Tras su aclaración de alcance, se registran 19/19 tareas personales completas: el ensayo cronometrado separado no forma parte de su entrega. Integración y archivo se gestionan por separado.

**Decisión de seguimiento del 10/11:** Luis confirmó en este chat que las pruebas físicas, el ensayo y la revisión cruzada todavía no se realizaron y decidió dejarlos pendientes por no considerarlos necesarios para el trabajo inmediato. El trabajo técnico actual queda concluido; esas cuatro actividades se conservan como pendientes diferidos, sin fecha comprometida. Esta decisión no cambia sus resultados a aprobados ni implica archivo del cambio.

**Aclaración posterior del 10/11, que actualiza el estado anterior:** Luis indicó «el homido el homido y la pantalla ya lo revisamos, funciona correctamente». Se registran ambos como **revisados y con funcionamiento correcto según su reporte**, con fuente en este chat. La fecha de esta constancia no se presenta como fecha de ejecución. Los modelos, participantes, versión probada, URL y pasos concretos no fueron especificados. [Constancia estructurada](evidencias/s4/validacion-reportada.json).

**Revisión cruzada confirmada posteriormente el 10/11:** Luis informó «indigo ya lo reivozo y dice que esta bien». Se registra la conformidad de **Índigo Ortiz** con S4 como revisión reportada por Luis, sin incidencias comunicadas. La identidad corresponde al integrante ya identificado en el proyecto; esta aprobación proviene de la confirmación nueva de S4, no de la revisión de S3. Fecha de ejecución y versión exacta no especificadas. No se atribuye revisión formal desde una cuenta de GitHub.

## Versión de partida

- Rama: `codex/s4-web-computadora-proyeccion`.
- Commit base: `88667899838cc0c09976383972cadc7f1bf781e1`.
- [version.json](evidencias/s4/version.json) identifica los hashes de código, build, informe y evidencias. Los textos se normalizan a UTF-8 sin BOM y LF para que los hashes se conserven entre checkouts de Windows y otros sistemas; los binarios se verifican sin normalización. El manifiesto se genera sobre el estado de verificación previo al commit de entrega; su campo de cambios sin commit describe esa captura, no la integración posterior.
- Entorno disponible: Windows, Node, Vue/Vite y navegador de escritorio. Una resolución configurada no acredita hardware de proyección.
- Se conservan las evidencias S3, que no constituyen aceptación de S4.

## Matriz de ejecución

| Caso | Método | Resultado y evidencia |
|---|---|---|
| Control de proyección y navegación | Observado en navegador | Activación con Enter/Espacio/clic, persistencia durante navegación y reinicio al recargar; `navegador.json`. |
| Distribución 360/1024/1280/1920/2560 | Viewports configurados | 30 combinaciones de tamaño/ruta/vista sin desplazamiento horizontal ni elementos fuera del ancho. Capturas `inicio/listado/ficha-*.png`. |
| Zoom nativo 200 % | Observado en Chrome real, 10/11 | 6/6 combinaciones de inicio/listado/ficha y vista habitual/proyección, sin desbordamiento. Zoom cambiado mediante teclado del navegador; `zoom-nativo.json`, captura del indicador 200 % y seis capturas de página. |
| Texto al 200 % mediante CSS | Simulado | 6 combinaciones de ruta/vista a 1280 px, raíz 18→36 px, sin desbordamiento horizontal. Capturas `texto-200-css-*.png`; no es zoom nativo. |
| Teclado, ratón, salto y foco | Observado en navegador | Tab/Shift+Tab/Enter/Espacio, tres fichas, créditos, historial, reintento y salto a `main`; `navegador.json`. |
| Audio y detención al salir | Observado en navegador | WAV reales, avance de tiempo, pausa, reanudación y reinicio al salir en ambas vistas. No acredita escucha humana en sala. |
| API/audio/A-Frame fallidos | Inducido | Intercepción Playwright: API 503/reintento con API real, WAV 404 con lectura conservada y CDN abortada con retorno 2D. Capturas de errores. |
| Suites y build | Automatizado | Backend 7/7, frontend 26/26, build correcto, detector Impeccable sin hallazgos y diff sin errores de espacios. Logs en evidencias S4. |
| Video local y reproducción sin red | Observado en navegador offline | Archivo local reproducido completo a velocidad 1, 2589 frames y pista Opus decodificada; `video-local.json` y tres capturas. Pendiente repetir en equipo/proyector de ensayo. |
| Enlace HTTPS del recinto | Pendiente | URL/equipo no confirmados. |
| Homido real S4 | Reportado correcto por Luis | Ya revisado y funcionando según su confirmación. Fecha, teléfono, versión, URL y detalle de pasos sin especificar; `validacion-reportada.json`. |
| Pantalla real | Reportado correcto por Luis | Ya revisada y funcionando según su confirmación. Tipo/modelo, computadora, resolución, luz, distancia, sonido y red sin desglose; no se deduce que se utilizó proyector. |
| Ensayo de cinco minutos / Expo | Pendiente | Actividades del 2–6 no realizadas según Luis. |
| Revisión cruzada de S4 | Conformidad de Índigo reportada por Luis | Revisado y considerado correcto, según confirmación nueva de este chat. Fecha exacta y versión no especificadas; `validacion-reportada.json`. |

## Alcance de la regresión de escritorio

`scripts/verificar-s4.cjs --serve` verificó **44 casos correctos, 0 fallos**, con Chrome **157.0.8103.38** en Windows. La verificación corresponde al build final `index-Bv3LUvch.js` / `index-ButWuUIA.css`. El archivo [navegador.json](evidencias/s4/navegador.json) conserva timestamp, casos y medidas. No hubo errores JavaScript de página en esa ejecución.

El cuerpo principal de proyección se midió a **24.0012 px**, controles nuevos de al menos 48 px, y ambas vistas conservaron el ancho del documento. Los colores heredados se midieron con luminancia sRGB: texto secundario `#535e6c` sobre papel `#faf7f0`: **6.16:1**; tinta `#1b2430`: **14.63:1**; azul `#1f4e8c` sobre blanco: **8.31:1**; azul sobre papel: **7.77:1**. Estos valores no miden contraste del proyector bajo luz ambiente.

Revisión visual de inicio 1920, listado 1024 y ficha 360: identidad de S2 conservada, textos completos, controles envueltos en ancho estrecho y lectura vertical disponible. El ajuste se limita a rutas públicas. La API administrativa real devuelve 401 sin sesión; no se ejecutó login Supabase real ni se grabaron credenciales.

Los primeros intentos de navegador no accedían al localhost del entorno aislado. Se resolvió iniciando API, preview y navegador en el mismo contexto de prueba. Se corrigió además la espera del script para medir tras completar el cambio de estilos. Una ejecución coincidió con la recreación de `dist` por build y produjo errores de servidor transitorios: se descartó y se repitió con build estable. El resultado final de 44 casos corresponde a esta última ejecución.

Logs: [backend](evidencias/s4/backend.txt), [frontend](evidencias/s4/frontend.txt), [build](evidencias/s4/build.txt), [detector](evidencias/s4/detector.json). Los scripts auxiliares sirven y verifican el build, pero no se incluyen en el producto Vite.

## Zoom nativo al 200 % — 10 de noviembre

Se completó la comprobación pendiente con **Chrome 157.0.8103.50** sobre el mismo build. El 9/11 Computer Use había devuelto «Computer Use app approval timed out»; el nuevo intento logró observar la ventana y cambiar el zoom mediante cinco pulsaciones reales de Ctrl + suma del teclado numérico, con valores observados 110, 125, 150, 175 y **200 %**. La [captura del navegador](evidencias/s4/zoom-200-chrome.png) muestra ese indicador.

`scripts/verificar-zoom-s4.cjs` conserva el viewport nativo sin emulación y registra una referencia inicial: DPR **1.25**, ancho interior **1427 px**. Al 200 % se observó DPR **2.5**, ancho interior **713 px** y documento **706 px** (área de contenido descontando la barra vertical). El factor relativo es **2**, independiente de la escala del sistema. No se cambiaron `font-size`, `zoom` CSS ni métricas mediante DevTools.

Las seis combinaciones de **inicio/listado/ficha × habitual/proyección** pasaron sin elementos fuera del ancho de contenido. En ambas fichas se alcanzó audio con Tab, se activó reproducción con Enter, se pausó/reanudó con Espacio/Enter y se abrieron transcripción/créditos con teclado conservando foco. Los resultados y medidas están en [zoom-nativo.json](evidencias/s4/zoom-nativo.json); las capturas `zoom-200-*.png` corresponden a esta ejecución. Se incluyen seis capturas del inicio de cada vista y dos de los controles/créditos de la ficha. La simulación CSS del 9/11 permanece registrada por separado.

El modo `fullPage` de la herramienta de captura recortó incorrectamente las primeras imágenes al usar coordenadas anteriores al zoom. Se sustituyeron por capturas de la superficie visible de Chrome mediante CDP, sin recorte, emulación ni cambios de escala; el script comprueba que el ancho PNG corresponda a ancho interior × DPR. La repetición final aprobó 6/6 casos. Este ajuste pertenece a la herramienta de evidencia y no requirió cambios de la interfaz.

Esta comprobación valida zoom y operación en el navegador de escritorio disponible, sin acreditar proyección, legibilidad a distancia, red del recinto ni evaluación con personas adultas mayores. La sesión y sus servidores temporales se cerraron al terminar. El código de la aplicación y el video no se modificaron para esta prueba.

## Respaldo audiovisual

Se produjo [astrovisor-respaldo-s4.webm](evidencias/s4/astrovisor-respaldo-s4.webm): **103.551 segundos**, **1280×900**, video **VP8** y audio **Opus estéreo, 48 kHz**. El archivo está fuera de `frontend/public` y no se descarga al abrir la web. [Metadatos del contenedor](evidencias/s4/video-metadata.txt).

El video utiliza frames reales del build final capturados con Playwright/Chrome. Su pista de voz se montó desde los WAV S3 de Orión, Osa Mayor y Escorpio, según posiciones y tiempos de los eventos `playing`/`pause` observados. No se capturaron micrófono, sonido del sistema ni sonido de una sala. No se agregó música ni material de biblioteca. El ajuste temporal es una edición del respaldo; no demuestra salida audible del teléfono o de la computadora del recinto. Se conservan rótulos demostrativos, voz sintética y créditos.

La captura silenciosa se codificó con FFmpeg de Playwright; Chrome MediaRecorder generó VP8/Opus usando esa captura y la pista de voz editada; FFmpeg añadió índice y duración mediante copia de pistas, sin nueva recodificación. La generación y los eventos están en [grabacion.json](evidencias/s4/grabacion.json). Los archivos intermedios y herramientas se guardaron en `.qa/`, ignorada por Git. El primer intento del script esperaba un texto de finalización incorrecto: se corrigió y se repitió la captura completa.

Descripción textual de la secuencia:

| Tiempo aproximado | Contenido |
|---|---|
| 0:00–0:05 | Inicio público, vista para proyección y listado. |
| 0:05–0:31 | Historia de Orión, narración, pausa/reanudación y créditos. |
| 0:31–0:57 | Historia y narración de Osa Mayor, créditos y regreso. |
| 0:57–1:23 | Historia y narración de Escorpio, créditos y regreso. |
| 1:23–1:37 | Preparación Homido, escena/ficha 3D de Orión y controles equivalentes de narración. |
| 1:37–1:44 | Cerrar ficha, vista dividida experimental de escritorio y retorno a 2D. |

La escena y la vista dividida se grabaron **en escritorio**; no se simularon sensores ni se presenta el video como prueba de permanencia de mirada o visor físico. El respaldo resume el recorrido en 1:44; el guion de presentación de la guía asigna cinco minutos para explicarlo.

La [reproducción local completa](evidencias/s4/video-local.json) terminó correctamente en Chrome 157, con contexto offline desde antes de abrir el archivo mediante `file://`: **2589 frames**, sin error de medio y **897838 bytes de audio decodificado**. El PCM extraído del mismo archivo tiene pico **0.77265** y RMS **0.06126**, señal no nula. El archivo final ocupa **13369025 bytes** y su SHA-256 es `a7884439bd62ace696480574d3f15115d9275868e6a77ef28b306b8acc0435e5`.

Se inspeccionaron frames de inicio, escena 3D y final; [captura 3D](evidencias/s4/video-local-3d.png) y [retorno a 2D](evidencias/s4/video-local-final.png). Durante la instrumentación inicial, `MediaElementAudioSourceNode` entregó ceros al analizar `file://`; se cambió a análisis independiente de los bytes del archivo para conservar la reproducción nativa. Esta medición no sustituye escucha humana. El equipo de proyección y su reproductor siguen pendientes de ensayo real.

## Alcance personal y seguimiento operativo del equipo

Luis aclaró que el equipo utiliza una presentación y muestra el proyecto, y pidió centrar el trabajo en su parte. Se retira el ensayo cronometrado separado como requisito personal, sin declararlo ejecutado. Las confirmaciones de Homido/pantalla e Índigo se aceptan como constancias para el informe de Luis. Los siguientes detalles quedan disponibles para seguimiento operativo del equipo y no bloquean su entrega:

1. Completar, si se dispone de ellos, los detalles del protocolo de Homido ya reportado correcto: fecha real, teléfono, navegador, versión, HTTPS y resultados por control.
2. Completar el registro de la pantalla ya reportada correcta y la comprobación del video sin red en ese equipo. No se atribuyen modelo de proyector, pruebas de red ni escucha en sala sin desglose.

El avance técnico no acredita esas actividades ni una evaluación formal con personas adultas mayores. Los materiales académicos son esta guía/registro y las evidencias; OpenSpec conserva únicamente el seguimiento interno. La aprobación de archivo se solicitará solo cuando corresponda finalizar el cambio.

El [informe académico de S4](../../entregables/Sprint%204_Luis%20Rodriguez.md) reúne resultados y pendientes para entrega, separado del seguimiento interno.

La [versión Word del informe individual](../../entregables/Sprint%204_Luis%20Rodriguez.docx) está centrada en la parte de Luis. A petición del responsable, se amplió con una profundidad similar al informe de S3: objetivo, criterios de aceptación, implementación, pruebas, respaldo, validación y evidencias. Se renderizaron e inspeccionaron sus cinco páginas y el audit automático de accesibilidad no registró hallazgos; la constancia está en `evidencias/s4/word.json`. Los renders de QA permanecen como archivos temporales, separados del documento entregable.

## Datos exigidos en una prueba física

Registrar fecha real, persona, versión/commit o manifiesto, URL HTTPS, computadora y sistema, navegador/versión, resolución de salida, proyector/pantalla, tamaño de imagen y distancia/luz, red, salida de sonido, teléfono/visor cuando corresponda, pasos, resultado e incidencias. Adjuntar captura/video o identificar la fuente del reporte. Las pruebas de navegador y las fallas inducidas no equivalen a ensayo físico ni evaluación con personas adultas mayores.
