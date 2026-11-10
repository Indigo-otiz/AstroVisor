# Sprint 4 — Etapa 4A: contratos documentales y navegación Homido

Cierre y publicación autorizados por el usuario tras auditoría final sin bloqueantes identificados. Rama `indigo/s4-persistencia-documental`, HEAD/base publicado anterior `58a77855cf35bac4908c8ec09cab9a2d8d46dd81`. Commit de entrega: `feat(s4): integrar identificadores estables en Homido`; hash y coincidencia remota se informan después de push. Sin merge/archivo OpenSpec. `main` local sigue en `f1058c9b10641c470d7d3e331a81f327af78fc8c`. No se inicia 4B ni se implementan exportador, sincronización, servidor estático independiente, infraestructura, auth o footer.

## Contrato ampliado

`GET /api/contenidos/recorridos` mantiene el arreglo y los textos/narraciones existentes; añade `revisionCatalogo`. `libros[]` ahora proyecta todas las relaciones de cada recorrido, no solo las que contienen la bibliografía pública heredada: nueve vínculos iniciales, once en el fixture de alta de un libro compartido entre dos constelaciones.

Cada elemento contiene `libroId`, `constelacionId`, `titulo`, `autor`, `anio` opcional, `url`, `motivo`, `demostracion`, `referenciaHeredada` y `portada`. Título/autor/año/URL se consultan en la única ficha privada del libro por ID; esta proyección no crea una segunda fuente editable. La semilla y el catálogo privado no se migran ni reinicializan.

`referenciaHeredada=true` indica que la relación contiene los metadatos bibliográficos anteriores. Se conservan `licencia`, `etiqueta` y `aclaracion` aplanados para consumidores previos. False significa recomendación documental sin ese objeto; **no significa necesariamente libro/relación recién creados**: seis de los nueve vínculos iniciales ya carecían de esa bibliografía heredada. Los tres objetos de referencia anteriores y sus campos públicos se preservan. La distinción no inventa fechas ni atribuciones.

La salida usa listas permitidas para constelación, referencia y audio. Los metadatos desconocidos se conservan en el JSON privado, pero ya no se publican mediante spreads arbitrarios. Se preservan los campos actuales de voz, permiso, procedencia, transcripción, autoría, formato y licencia. Prueba con datos administrativos inyectados en recorrido/libro/referencia: no aparecen en la proyección; continúan presentes en el documento privado.

Portada estática: `{tipo:'ilustrativa',origen:'estatica',src:'/libros-demo/<id>.svg'}`. Portada generada: `{tipo:'ilustrativa',origen:'plantilla',plantilla,paleta}`. No se incorpora `/api/...portada.svg` al descriptor Homido. La futura exportación podrá materializar el activo desde libroId/datos/plantilla y reescribir rutas relativas, pero no se implementa ahora. La web conserva la generación dinámica de 3B; los tres SVG originales no cambian.

## Identidad, selección y navegación

`rutaLibro2D` utiliza exclusivamente libroId y constelacionId validados. Cambiar el título no cambia `/explorar/<constelacionId>/libros/<libroId>`. Un libro sin ID válido regresa al índice de libros de su constelación; sin constelación válida, a `/explorar`. No hay tabla de títulos ni selección de destinos por nombres.

Regla determinista de escena:

1. Reunir relaciones con identidad válida y constelacionId correspondiente a su ficha.
2. Priorizar las que pertenecen a la constelación abierta.
3. Ordenar por libroId ASCII y, como desempate, constelacionId.
4. Conservar primera relación de cada libroId y tomar tres identidades como máximo.

Un libro compartido conserva como origen/motivo la constelación preferida. Sin preferida, desempata por constelación. La selección se recalcula al abrir la estantería, retirando solamente sus nodos y canvas anteriores. Los tres puestos y su distribución espacial siguen siendo los existentes: el primero se centra. No hay paginación; otras recomendaciones se consultan en 2D. No se inventa disponibilidad física ni ubicación.

Se conservan A-Frame, la geometría de escena, anillos, duración/cancelación de dwell, eventos de navegación y el único reproductor de narraciones. Corrección acotada de compatibilidad: los textos válidos nuevos de 3B podían superar la textura anterior, que usaba fuente fija y slice de líneas. Ahora se mide con Canvas y se conserva la fuente inicial si cabe; en los mismos espacios se reduce dentro de límites (cubierta título49–24 px, autor27–18; detalle título63–33, autor37–25). Si no cabe, muestra «Texto completo en la ficha 2D» en vez de recortar silenciosamente. No se modifica el algoritmo de mirada ni los recursos de audio.

El canvas de Homido sigue siendo una representación ilustrativa del renderer anterior; no se afirma que lea los SVG de 3B ni una exportación nueva. Legibilidad óptica/calibración física permanece pendiente.

## Respaldo anterior y fallos

`recorridos-demo.json` permanece idéntico. En carga local únicamente, el adaptador reconoce tres firmas exactas URL+autor de las referencias conocidas y añade libroId/constelacionId en memoria, sin consultar títulos. Una referencia desconocida se conserva como dato, pero no se convierte en cubierta o enlace individual inventado. Una identidad explícita inválida no se sustituye con una firma heredada.

Auditoría de cierre: se exige una única correspondencia en la tabla cerrada y una única entrada con esa firma dentro de la constelación. Firmas repetidas se consideran ambiguas: los datos permanecen, pero no reciben ID inferido, no crean una cubierta seleccionable y solo permiten volver al índice de libros si se solicita la ruta sin ID. Compartir una referencia entre constelaciones diferentes sigue permitido. Las tres firmas corresponden exactamente a URLs y autores de los libros existentes de la semilla; la compatibilidad no se usa en la API versionada ni para altas nuevas.

La API versionada con identidad ausente, duplicada, malformada o ajena a la constelación se rechaza y permite intentar el respaldo. Un formato anterior sin revisión sigue aceptado como datos no versionados, sin inventar revisión o IDs desde sus títulos. El respaldo local devuelve `revision:null`; la página muestra permanentemente «Respaldo heredado de demostración, sin revisión verificada; no se afirma que esté actualizado». Si no hay revisión de API verificable, también se indica. Si fallan ambas fuentes, aparece error, no una promesa offline.

El respaldo aún no contiene libros nuevos ni revisiones publicadas del catálogo. Su actualización y publicación corresponden a 4B. La ficha web sigue requiriendo API: poder abrir una referencia desde el respaldo no acredita que el destino 2D esté disponible con toda la API caída. El lector 2D/narración de la página mantiene su carga independiente; en la simulación503 mostró historias/audio no disponibles mientras la escena usó el respaldo. No se añadió resiliencia nueva al audio ni se alteró su módulo.

## Pruebas ejecutadas

Windows/PowerShell y Node v24.21.0; fixtures y credenciales aleatorias externos, sin datos institucionales ni cambios al almacenamiento real.

| Validación final | Resultado |
|---|---|
| `npm test` | 96/96 |
| `npm run test:web` | 129/129 en auditoría de cierre |
| `npm run build` | Correcto, 48 módulos |
| `openspec validate s4-persistencia-documental --strict` | Correcto |

Cobertura: tres libros/nueve vínculos, alta compartida en dos constelaciones, título cambiado con ID estable, ruta 2D sin títulos, selección por identidad independiente del orden de entrada, deduplicación/máximo3, respaldo antiguo conocido/desconocido, API inválida/caída, campos privados no expuestos, metadatos/audio/transcripciones preservados y regresiones anteriores de portadas, mirada y controles. Las pruebas de contrato anteriores ahora comparan sus campos heredados con el respaldo inmutable y, separadamente, las nueve relaciones nuevas de la proyección. No se declara que el respaldo sea idéntico a la API ampliada.

Fallos observados durante desarrollo: seis pruebas nuevas fallaron antes de implementar (proyección solo3 relaciones, destino basado en título, falta de IDs/aviso y API inválida aceptada). Las comprobaciones antiguas de igualdad exacta fallaron por los nuevos campos/relaciones; se actualizaron conservando comparación de todos los campos públicos heredados y verificación de metadatos privados. Una prueba de inventario/hash detectó edición de un archivo público mientras se ejecutaba: esa ejecución se descartó y se repitió con archivos estables, sin debilitar la prueba. La suite final pasó96/96.

Revisión independiente detectó título W×12 aceptado por3B pero recortado en canvas Homido; corrección acotada y regresión añadidas. Otra regresión reprodujo desbordamiento de detalle con título de cuatro palabras W×12 y autor de tres palabras W×17; pasó tras ajuste dentro de los mismos espacios. IDs ausentes/duplicados en contrato versionado también tuvieron fallo nuevo antes de su rechazo. Revisión final: sin bloqueantes reproducibles restantes; sus14 pruebas seleccionadas pasaron. Esta revisión no valida hardware.

No se observó fallo intermitente de mirada en la ejecución final ni se modificó ese módulo. No se declara resuelta la intermitencia histórica descrita en etapas anteriores.

Cierre: repetidas las cuatro validaciones, correctas (backend96/96, web129/129). La regresión adicional con firma repetida falló6/7 antes del endurecimiento y pasó7/7 después; pruebas conjuntas de identidad/datos15/15. La corrección consiste únicamente en rechazar inferencia ambigua, sin cambiar respaldo, IDs explícitos o narración. No apareció fallo de mirada en esta ejecución.

## Navegador y evidencia

Chrome headless156.0.8078.80, 1280×960, WebGL de software SwiftShader, perfil y servidores temporales. No dispositivo Homido físico ni sensores reales. Se usó el objeto de depuración existente para abrir la constelación y se emitieron eventos click sobre los controles A-Frame existentes; no se simuló permanencia ocular física.

Secuencia real de páginas: alta temporal de `aaa-nuevo` asociada con Orión/Escorpio → cambio autorizado de su título manteniendo ID → Homido con API revisión3 → tres cubiertas distintas → ficha2D `/explorar/orion/libros/aaa-nuevo` con título nuevo/motivo de Orión → Atrás al visor → misma ficha desde Escorpio con motivo de Escorpio → simular503 en recorridos → respaldo sin libro nuevo y con aviso de revisión no verificada. Cero errores JavaScript no controlados.

Ronda final confirmó con measureText real que W×12 se ajusta a Georgia bold29px y ancho≤398, sin perder letras; título/autor largos mantienen texto completo y detalle sin desbordamiento. Se repitió navegación y fallback tras el ajuste.

Auditoría de publicación: nueva ejecución Chrome156/SwiftShader con fixture temporal y título cambiado manteniendo ID; navegación desde Orión/Escorpio y retorno Atrás correctos. Con API503, respaldo válido mostró star-lore/field-stars/half-hours; el respaldo con firma ambigua y el desconocido mostraron únicamente field-stars/half-hours, sin enlace dudoso ni libro nuevo. Los fixtures alterados se suministraron mediante interceptación de red del navegador; no se escribió el JSON original. Se observaron eventos de narración cargando/listo/reproduciendo/pausado, pausa/reanudación y pausa de mirada independiente del audio. No se afirma escucha física ni calibración óptica. Cero errores JavaScript no controlados. Script, cuenta y almacenamiento temporales retirados; las tres capturas conservadas corresponden a la implementación previa, no son capturas nuevas del cierre.

Capturas inspeccionadas: [estantería Homido](evidencias-s4-4a/homido-estanteria.png), [ficha desde Homido](evidencias-s4-4a/ficha-desde-homido.png), [respaldo heredado](evidencias-s4-4a/respaldo-heredado.png). No contienen credenciales. Script y directorios temporales retirados al terminar.

## Inventario y OpenSpec

- Backend: `src/services/catalogo.js`; pruebas modificadas `test/catalogo.test.js`, `test/catalogo-api.test.js`, `test/documentRepository.test.js`; nueva `test/homidoContrato.test.js`.
- Homido: `index.html`, `prueba.js`, `js/datos.js`, `js/ruta-libro-2d.js`, `js/estanteria-3d.js`.
- Frontend pruebas: `test/homido-estanteria-3d.test.js`; nueva `test/homido-identidad.test.js`.
- Documentación: este informe, tres capturas, proposal/design/spec/tasks S4.

6.1a completada: contrato/identidad, relación compartida, título y privacidad. 6.1b pendiente: igualdad de exportación/paquete aún no implementado. 6.2 implementada; 6.4 permanece pendiente por hardware. No cerrar 6.3/exportador ni 8.6/alojamiento pospuesto, 3.5/copia externa u otros controles operativos. S4 no se declara terminado.

Semilla, respaldo JSON, SVG, audio, transcripciones/créditos actuales, CSS, rutas Vue, autenticación y código de mirada permanecen sin cambios. Archivos ajenos conservados: `.gitignore` previo, `docs/VALIDACION-PR6-S4.md`, raíz `.presentacion-build/`, guion y PDF/PPTX. Inventario2281 archivos con SHA-256 agregado previo `ACF1CBE34F9B96E0F93EEFAD29AB0415DDB78615BBDD860B66292AE74A460B2C`; comprobación final registrada en la entrega. Índice Git sin preparar; no se publican secretos, runtime ni respaldos privados.

Pendientes: exportación/revisión estática de4B, nuevos campos públicos autorizados si se requieren metadatos adicionales, prueba física del visor y sensores, legibilidad en hardware, audio bajo caída de API, móvil real/zoom nativo y despliegue institucional. No se promete disponibilidad offline ni ante caída total.
