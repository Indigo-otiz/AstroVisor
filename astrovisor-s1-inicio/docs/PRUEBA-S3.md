# Evidencia de narraciones S3

Responsable: Luis. Ventana académica 26 de octubre–3 de noviembre de 2026; revisión Homido 3/11 y Expo 5/11. Implementación iniciada el **31 de octubre de 2026**, zona America/Mexico_City. Los timestamps UTC del manifiesto pueden corresponder al 1 de noviembre; no son la fecha local del día siguiente.

**Estado: Sprint 3 cerrado el 31 de octubre de 2026 por solicitud de Luis, con implementación verificada y aceptación reportada.** Revisión cruzada de **Índigo Ortiz**, identificada por Luis en esta conversación. Se registraron iPhone 13 con Chrome/Safari y «oppo 15a» con «google», tal como fueron reportados. Se conserva la distinción entre las pruebas del agente, la validación del responsable y la revisión de otro integrante comunicada por él. Video sigue pospuesto hasta después del hito 3D del 3/11.

## Conformidad de Luis y revisión de cierre

El 31 de octubre de 2026, Luis expresó «me parece bien, podemos cerrar mi sprint?» después de aplicar la voz femenina. Posteriormente respondió «si ya probe todo» a la pregunta conjunta sobre escucha de las tres narraciones y controles en iPhone Safari o Android Chrome con Homido. Se registra como confirmación del responsable de haber realizado esas pruebas, junto con su conformidad previa, sin atribuirle una captura o registro instrumental no aportado. La fecha corresponde al reporte; la fecha exacta de ejecución no se especificó.

Luis también indicó que el texto fue hecho por el equipo y pidió registrarlo así. Se atribuyen colectivamente los tres guiones al equipo AstroVisor y se documenta su uso en la demostración según la declaración del responsable. No se asigna una licencia pública al texto. Ver [constancia de autoría](../content/AUTORIA.md).

La implementación cuenta con tres WAV reales, transcripciones, controles web/3D, reproducción observada en escritorio, 23 pruebas automatizadas y build correctos. Luis indicó iPhone 13 con Chrome y Safari, y «oppo 15a» con «google». No se corrige silenciosamente el modelo OPPO ni se deduce si «google» significa Chrome u otra aplicación. Las versiones, URL usada y fecha exacta de ejecución no se especificaron. La confirmación de iPhone/Safari cubre la alternativa de navegador requerida por el alcance.

Luis identificó inicialmente a Luis Alberto Rodríguez como revisor; ese nombre corresponde también al responsable del sprint en el proyecto, por lo que se registra como validación del autor. Ante la aclaración, confirmó que también revisó otro compañero y después lo identificó como **Índigo Ortiz**. Se registra esa revisión cruzada según el reporte de Luis, junto con su conformidad y solicitud de cierre, sin incidencias adicionales comunicadas. La fecha exacta de la revisión de Índigo no fue especificada; la fecha de esta constancia es el 31 de octubre de 2026. [Registro estructurado del reporte](evidencias/s3/validacion-reportada.json). No se atribuyen una revisión formal de GitHub ni pruebas observadas directamente por el agente en esos teléfonos.

| Confirmación necesaria para cerrar | Estado registrado |
|---|---|
| Conformidad de Luis con la voz femenina aplicada | Recibida en esta conversación. |
| Escucha completa de las tres narraciones y controles | Confirmada por Luis con «si ya probe todo», junto con su conformidad previa. No se aportó grabación adicional. |
| Prueba física en iPhone Safari y/o Android Chrome con Homido y gesto Activar audio | Confirmada por Luis; iPhone 13 con Chrome/Safari y «oppo 15a» con «google». Versiones y fecha exacta no especificadas. Resultado conforme según el responsable. |
| Revisión cruzada de otro integrante sobre la misma versión | Índigo Ortiz, identificado por Luis. Revisión comunicada como parte de la aceptación y cierre; sin incidencias reportadas. La validación de Luis Alberto Rodríguez se registra por separado como la del responsable. |
| Autoría y uso de los guiones | Equipo AstroVisor, autoría colectiva declarada por Luis; uso en la demostración indicado por el responsable. Constancia en content/AUTORIA.md y créditos actualizados. |

Con las confirmaciones de pruebas, autoría y revisión cruzada identificada se completa el registro de aceptación y se cierra S3 a solicitud de Luis. La implementación incluye audio real y no se presenta un pitido como narración. Los guiones permanecen rotulados como demostrativos y la voz como sintética. El cierre no acredita aprobación institucional del material, producción, despliegue ni revisión formal de GitHub.

## Materiales y procedencia

Luis seleccionó en esta conversación «Usar relatos actuales y voz sintética; indicaré autoría/permiso» y posteriormente declaró que los guiones fueron elaborados por el equipo. Se reutilizan literalmente las historias demostrativas de `content/recorridos.json`, atribuidas colectivamente al equipo AstroVisor según ese reporte. Los créditos indican el origen y uso en la demostración; no afirman aprobación de la biblioteca ni atribución individual no especificada.

La voz activa es sintética femenina, **Kokoro ef_dora**, con fonética de español latinoamericano (`es-419`), elegida por Luis como «Femenina, cálida y tranquila» al solicitar reemplazar los audios que encontraba robóticos. No es una grabación de una persona del equipo. Los WAV y TXT se sirven desde el propio frontend sin servicio TTS en ejecución. [Manifiesto actual de audios](evidencias/s3/audios.json): rutas, bytes y SHA-256. [Contrato y reproducción de generación](../content/README.md).

El modelo [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M) está publicado con licencia Apache-2.0; su [lista de voces](https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md) identifica `ef_dora`. La procedencia de la voz no resuelve derechos del guion. La prueba de estructura PCM y señal no equivale a escuchar ni certificar la pronunciación. El modelo anterior Piper y su MODEL_CARD permanecen como evidencia histórica de la primera entrega.

## Sustitución de voz por solicitud de Luis

El 31 de octubre de 2026, Luis pidió una voz más humana y limpia y seleccionó la opción femenina. Se generaron dos muestras de Orión fuera del producto; la muestra femenina se conservó exactamente como audio activo de Orión. Osa Mayor y Escorpio se generaron con el mismo modelo, voz y ajuste. Esta selección no se registra como aprobación de una escucha completa de los tres archivos nuevos.

Configuración: Kokoro-82M v1.0, export `model-files-v1.1`, runtime `kokoro-onnx 0.4.9`, voz `ef_dora`, velocidad 0.96, WAV PCM16 mono a 24 kHz. Ajuste de nivel RMS con ganancia limitada por pico máximo 0.84 y fundidos de 12 ms, sin música ni reverberación. Las medidas se calcularon sobre los WAV exportados; no se detectó saturación digital. El modelo y las dependencias permanecen fuera del repositorio.

| Archivo activo | Duración | Pico | Saturación digital |
|---|---:|---:|---|
| `/audio/orion-kokoro-v1.wav` | 20.63 s | −1.51 dBFS | No detectada |
| `/audio/osa-mayor-kokoro-v1.wav` | 22.06 s | −1.51 dBFS | No detectada |
| `/audio/escorpio-kokoro-v1.wav` | 21.82 s | −1.51 dBFS | No detectada |

Las rutas nuevas evitan recuperar los WAV anteriores de la caché del navegador. Se mantuvieron los guiones y las transcripciones. El registro separa permiso del texto de licencia del modelo y conserva autoría/procedencia/documentos de otros tipos de multimedia al actualizar audio.

Verificación nueva: **2/2 pruebas backend, 21/21 frontend y build correctos**. En el navegador de escritorio se observó la nueva voz y duración en las tres fichas y reproducción real de los tres recursos. En Orión se comprobó pausa a 0:17 de 0:20 y reanudación desde ese punto. [Observaciones actuales](evidencias/s3/comprobaciones-kokoro.json), [captura de la ficha actual](evidencias/s3/ficha-kokoro.png) y [configuración, medidas y hashes de generación](evidencias/s3/generacion-kokoro.json). La escucha completa y las pruebas físicas fueron confirmadas posteriormente por Luis, con teléfonos y navegadores registrados arriba. La revisión cruzada de Índigo Ortiz fue comunicada por Luis y completa la constancia de cierre.

Las capturas, registros y duraciones de la sección de implementación inicial corresponden a **Piper**, no a estos WAV. Se preservaron sus manifiestos como [audios anteriores](evidencias/s3/audios-piper-original.json) y [versión anterior](evidencias/s3/version-piper-original.json). Los controles no se reimplementaron; esta sustitución no convierte las pruebas de escritorio anteriores en pruebas móviles ni acredita nueva revisión cruzada.

## Implementación y pruebas automatizadas

Un elemento de audio compartido por página ofrece Escuchar, Pausar y Reanudar, con estado real de `play()`, errores, transcripción y créditos. Detener cancela la intención de reproducción y reinicia la posición. Cerrar ficha, cambiar constelación, salir de vista dividida, navegar o `pagehide` detienen. Ocultar la página pausa sin reanudación automática. Un play anterior que se resuelve tarde no interrumpe la reproducción nueva ni reactiva una ficha cerrada.

El control web conserva el mismo botón al cambiar de Escuchar a Pausar/Reanudar para mantener el foco. En el canvas los botones tienen posiciones distintas para evitar pausar inmediatamente por conservar la mirada donde se activó Escuchar. Los controles ocultos salen del raycaster. La ficha se coloca frente a la cámara al abrir y queda fija en el mundo: seguir la cabeza impediría apuntar a sus botones.

Las pruebas Node usan un medio simulado para estados, errores, activación, carreras y ciclo de vida. Las pruebas documentales verifican WAV PCM no vacío/silencioso y transcripciones exactas; no prueban sonido audible por altavoz ni permisos de un móvil.

## Activación del navegador

Activar audio intenta `play()` desde el evento de clic real sobre el mismo medio, pausa y reinicia al resolverse. Puede oírse el inicio de la narración durante esa preparación. Después se solicita Escuchar por mirada. Un rechazo no se presenta como reproducción; se indica retirar el visor y tocar Activar audio o el control de nuevo. No se necesita solicitar permiso de micrófono.

Referencias primarias contrastadas: [WebKit sobre gesto directo en iOS](https://webkit.org/blog/6784/new-video-policies-for-ios/), [WebKit sobre comprobación de play y reutilización de elementos](https://webkit.org/blog/7734/auto-play-policy-changes-for-macos/), [Chrome: política de autoplay y rechazos de play](https://developer.chrome.com/blog/autoplay/). Estas referencias orientan la estrategia; no acreditan funcionamiento en un teléfono de 2026 ni sustituyen la prueba física.

## Resultados de implementación inicial con Piper

Entorno: Windows, Node v24.20.0, Vue/Vite/Express, navegador Chromium integrado de Codex (Chrome/156.0.0.0 según user agent observado). API en `127.0.0.1:3001`, frontend en `127.0.0.1:5173`, ambos limitados a esta computadora. El build real se verificó mediante el servidor auxiliar local en `127.0.0.1:5174`; también se indujeron condiciones de fallo únicamente en ese auxiliar. No se desplegó el sitio ni se abrió un túnel público.

Rama: `codex/s3-narraciones-audio-visor`. Commit base: `e717955593ac0115b59db617434e546040f6a8d7`; implementación S3 aún sin commit. El [manifiesto de versión](evidencias/s3/version.json) identifica por SHA-256 los archivos actuales y las capturas, sin confundir el commit base con código S3 ya comprometido.

| Comprobación | Resultado actual |
|---|---|
| Tres WAV y transcripciones | Generados; hashes en manifiesto; revisión audible completa pendiente. |
| Ficha Orión: Escuchar → Pausar → Reanudar | Reproducción real observada por estados del navegador; pausa a 0:02 en desarrollo y 0:04 en build, de aproximadamente 0:27; continuación observada. El mismo botón conserva foco al cambiar de estado, también con Enter. No se certifica escucha humana. |
| Gesto Activar audio en escritorio | La promesa se resolvió; se mostró Audio preparado. No equivale a Safari/Android. |
| Ficha 3D en ambas vistas | Observada con acentos legibles y proporciones por ojo corregidas. No valida óptica Homido. |
| Escuchar → Pausar → Reanudar → Cerrar con retícula | Ejecutado por permanencia en el build real, moviendo la cámara con arrastre de mouse. Registro de reproducción 18:46:57, pausa 18:47:09, reanudación 18:47:23 y cierre 18:47:38 (hora local). Es selección por retícula en escritorio, no mirada física en Homido. |
| Cambiar ficha y salir | Escorpio reproduce, pausa y reanuda; abrir Osa Mayor vuelve a Listo y reproduce su propio archivo. Cerrar y salir de vista dividida vuelven a sin ficha/no disponible. Navegación SPA e historial abren la siguiente ficha en 0:00 sin reanudación automática. |
| Finalización sin repetir por mirada inmóvil | En el build, Orión reproduce 18:45:14 y finaliza 18:45:42, conservando estado Finalizado bajo la misma retícula. El código rearma la selección al desplazar la mirada. |
| Pruebas automatizadas y build | `npm test`: 2/2; `npm run test:web`: 21/21; `npm run build`: correcto. Sintaxis JS de controlador, escena, diagnóstico y fixture correcta. `git diff --check`: correcto, con aviso de conversión LF/CRLF del contenido JSON. |
| Archivo ausente, bloqueo y metadatos | En el build con fixture: WAV 404 muestra error y conserva historia; NotAllowedError inducido muestra Activar audio sin estado falso de reproducción; metadatos inválidos deshabilitan solo audio. Son fallos simulados, no problemas reales del móvil. |
| A-Frame ausente | En el build con script 3D ausente inducido, la ficha HTML de Escorpio sigue legible y reproduce el WAV; cerrar funciona. |
| API caída y reintento | Se detuvo temporalmente la API local: apareció fallo y Volver a cargar historias. Al restaurarla, el botón recuperó las tres constelaciones sin recargar. |
| Teclado, 360 px y texto al 200 % | Foco conservado y controles de 56 px en web; texto normal en 360 px sin desbordamiento. Con raíz CSS de 36 px (frente a 18 px), botón de 80 px y ancho documental 345 px dentro de viewport 360; sin recortes observados. No es zoom nativo. |
| Autoría/permiso documental del texto | Pendiente de Luis/equipo. |
| iPhone Safari y/o Android Chrome físicos + Homido | Pendiente; no se ha usado teléfono ni visor en esta sesión. |
| Revisión por otro integrante | Pendiente; no se ha recibido aprobación S3. |

## Capturas y reproducción de las condiciones

Las imágenes proceden del navegador con la aplicación ejecutándose; no son imágenes generadas. Viewports medidos: 1280×900 y 360×800. La salida nativa de CUA/IAB puede excluir barras y bordes del viewport: por ejemplo, el PNG del visor tiene 1265×889 y algunas páginas móviles 344 px de ancho. No se hicieron recortes ni retoques manuales; se conservan las dimensiones originales de la herramienta.

- [Ficha de escritorio en pausa](evidencias/s3/ficha-escritorio.png), [ficha móvil](evidencias/s3/ficha-movil.png) y [transcripción/créditos abiertos](evidencias/s3/creditos-movil.png).
- [Texto al 200 % simulado](evidencias/s3/texto-200-movil.png), [audio ausente inducido](evidencias/s3/audio-ausente.png), [bloqueo inducido](evidencias/s3/audio-bloqueado.png) y [alternativa sin A-Frame](evidencias/s3/sin-3d-movil.png).
- [Ficha final en ambos ojos](evidencias/s3/visor-ficha-final.png), [reproducción tras reanudar por retícula](evidencias/s3/visor-reanudar.png), [registro del recorrido final](evidencias/s3/visor-registro.txt) y [mediciones/condiciones observadas](evidencias/s3/comprobaciones.json).
- `visor-mirada.png` conserva una captura intermedia de la prueba de selección; no representa por sí sola la versión final.

Para reproducir el build: iniciar API, ejecutar `npm run build` y luego `node scripts/prueba-audio.mjs real --build` en una terminal interactiva. Abrir `http://127.0.0.1:5174/explorar/orion`. Escribir `ausente`, `bloqueado`, `metadatos`, `sin-3d` o `real` y pulsar Enter; recargar la página. `texto-grande`/`texto-normal` controlan la próxima carga. El bloqueo sustituye `play()` solo en la página de prueba y no acredita política móvil. El fixture escucha solo en localhost y no se incluye en el producto. Para probar desarrollo se puede omitir `--build` con Vite iniciado.

## Revisión técnica independiente de la extensión

Se realizó una revisión AI separada de código y ocho capturas, sin heredar el razonamiento de implementación. Dictamen **ship**, limitado a la extensión local, sin hallazgos materiales abiertos tras corregir una carrera: si la ficha HTML abría antes de la escena, se invalidaba la deduplicación para inicializar los botones 3D nuevos. Se recompiló y se volvió a capturar la ficha final. El revisor no ejecutó las pruebas ni realizó escucha o evaluación física; no es la revisión académica de otro integrante.

La comprobación independiente del sistema visual revisó diff, CSS, componentes, visor y tres capturas. La ficha conserva crema `#faf7f0`, azul `#1f4e8c`, cuerpo aproximado de 20 px, títulos principales Georgia y botones de 56 px. El visor conserva Arial y su identidad independiente; sus botones HTML pasan de 44 a 48 px y de 16 a 18 px para legibilidad. El texto del canvas usa textura local con acentos. El detector solo observó Arial heredado; se conservó la tipografía por el alcance de refinamiento. No se crearon nuevos documentos de identidad ni se homogeneizaron los estilos de módulos ajenos.

## Protocolo físico y revisión cruzada de referencia

Se conserva el protocolo utilizado para solicitar la validación y para futuras repeticiones. La ejecución y la revisión ya fueron confirmadas por Luis en la constancia de cierre. Los detalles no especificados por él permanecen identificados como tales; no se completan con valores supuestos. En futuras ejecuciones registrar fecha efectiva, integrante, commit/manifiesto, URL HTTPS, modelo de teléfono, versión de sistema/navegador, Homido, salida de sonido y resultado por paso. No anotar viewport como teléfono real.

1. Leer las tres historias sin audio y confirmar transcripciones/créditos y rótulo de voz sintética.
2. Tocar Activar audio antes de colocar el visor; observar éxito o rechazo y recuperar mediante gesto si corresponde.
3. Abrir Orión por mirada y seleccionar Escuchar; escuchar la voz real y verificar que no es un pitido. Pausar tras varios segundos, esperar y Reanudar: debe continuar desde ese punto.
4. Cerrar la ficha durante sonido; confirmar silencio. Reabrir y comprobar inicio desde cero.
5. Reproducir y cambiar de constelación; confirmar ausencia de superposición. Repetir controles con Osa Mayor y Escorpio y escuchar cada archivo completo, cotejando pronunciación y transcripción.
6. Reproducir y salir de vista dividida, volver a 2D y navegar fuera; no debe quedar audio ni reanudarse automáticamente al volver.
7. Provocar bloqueo de reproducción o ausencia de archivo en un entorno de prueba; verificar mensaje y texto legible, sin presentar el fallo simulado como avería espontánea.
8. Otro integrante revisa esa misma versión y registra identidad, fecha, resultados, incidencias y aprobación/rechazo con evidencia o fuente real del reporte.

El audio real se generó y verificó técnicamente; la escucha, pruebas físicas y revisión cruzada están respaldadas por las confirmaciones de Luis, con sus límites documentados. S3 queda cerrado; cualquier archivo del cambio interno de OpenSpec se gestiona por separado. OpenSpec no cuenta como evidencia académica de funcionamiento.
