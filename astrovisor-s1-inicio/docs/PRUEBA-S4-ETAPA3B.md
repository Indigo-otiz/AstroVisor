# Sprint 4 — Etapa 3B: alta y portadas ilustrativas

Cierre y publicación autorizados por el usuario tras auditoría final sin bloqueantes identificados. Rama `indigo/s4-persistencia-documental`, HEAD/base publicado anterior `d8f3792aa30c9de8362909131c82bfc030c9f5b3`. Mensaje del commit de entrega: `feat(s4): implementar alta de libros y portadas ilustrativas dinamicas`; hash y coincidencia remota se informan después del push. `main` local permanece en `f1058c9b10641c470d7d3e331a81f327af78fc8c`. Sin merge ni archivo OpenSpec. No se implementa exportación ni sincronización Homido.

## Arquitectura y compatibilidad

Se conserva schemaVersion 1 y el único catálogo JSON privado. No se migra ni reinicializa automáticamente. La semilla permanece intacta. Se intentó leer el runtime configurado sin imprimir rutas/contenido: no estuvo disponible en esta sesión y no se creó ni modificó; las pruebas usan inicialización explícita en directorios temporales externos.

Libro estático anterior: ausencia de `portada` y `portadaIlustrativa: '/libros-demo/<id>.svg'`. Continúan válidos los tres registros existentes, sus IDs y SVG exactos.

Libro generado: `portada: {tipo:'ilustrativa', plantilla:'cielo'|'guia'|'relatos', paleta:'azul'|'verde'|'violeta', procedencia, textoAlternativo}`. El servidor deriva los dos últimos campos. La ruta privada en `portadaIlustrativa` es `/api/contenidos/libros/<id>/portada.svg`; GET administrativo y catálogo público añaden `?revision=N` vigente. Así se conserva el campo público compatible sin escribir una URL con revisión antigua en el almacenamiento. No se publica el objeto privado de portada ni campos desconocidos en la proyección pública de libros.

El alta añade una ficha y sus relaciones en la transacción del escritor existente. Conserva metadatos desconocidos, audio, transcripciones y referencias anteriores. Datos nuevos siempre demostrativos; MARC `DEMO-<id>`/`DEMO`, ubicación/signatura null. No se crean registros institucionales, inventario ni préstamos. El POST estático previo sigue disponible para activos preexistentes del mismo ID; el panel nuevo solo ofrece plantillas. No se escribe SVG en public, dist o Git.

Título y autor siguen en solo lectura al editar cualquier ficha en el panel, incluidas las creadas ahora. No se convierten los SVG originales. Habilitar edición desde panel requiere adaptar Homido a IDs y revisar exportación; no se autoriza en esta etapa. El PATCH de Express previo conserva sus campos: una modificación válida de título generado por ese contrato se somete a validación tipográfica y el endpoint vuelve a generar el SVG desde los datos vigentes con revisión nueva.

## Renderizador y seguridad

`backend/src/services/portadas.js` genera SVG en memoria sin dependencia de Express/filesystem ni librerías nuevas, reutilizable posteriormente por el exportador. Tres trazos estelares y tres paletas cerradas, formato 450×640, fondo oscuro, marco, serif editorial para título y aviso «PORTADA ILUSTRATIVA». Los tres archivos aprobados de PR #6 no se modifican.

Texto permitido: letras ASCII y Latin-1 (incluidos acentos españoles), dígitos y puntuación declarada. Se normaliza NFC para composición de líneas; no se reemplazan caracteres ni se abrevia texto. Hasta cuatro líneas de título a 36/32/28/24 px y tres de autor a 19/17 px; presupuesto conservador de 1.2em por carácter sobre 354 px. Palabras indivisibles demasiado largas o textos que no caben producen error. No se admite todo Unicode. Ampliar el repertorio o fuentes requiere pruebas tipográficas adicionales.

XML escapado para ampersand, comillas y apóstrofos. Markup, caracteres de control, parámetros extra, plantilla/paleta/tipos inválidos y rutas se rechazan. Plantilla no incorpora scripts, enlaces, foreignObject, imágenes externas o recursos privados. Campos de procedencia y alternativa no son editables en la petición de alta. El frontend utiliza img/blob, sin v-html; cambios de título/autor/plantilla/paleta invalidan preview, abortan respuestas tardías y revocan URL al cancelar/desmontar. No se conservan blobs en borradores ni almacenamiento del navegador.

## Contratos HTTP

| Endpoint | Comportamiento |
|---|---|
| `POST /api/admin/libros` | Token válido, If-Match exacto, ID único, título/autor/año/HTTPS, portada permitida y relaciones con motivos. 201 y nueva revisión solo tras guardar; 400/401/409/412/428/503 conservan controles previos. Respaldo público Homido pendiente. |
| `POST /api/admin/portadas/previsualizar` | Token e If-Match vigentes; cuerpo `{titulo,autor,portada:{tipo,plantilla,paleta}}`. Mismo renderizador/ajuste que alta. SVG, no-store, nosniff y CSP; no modifica catálogo ni revisión. |
| `GET /api/contenidos/libros/:id/portada.svg?revision=N` | SVG público vigente, MIME image/svg+xml, nosniff, CSP sin recursos externos y Cache-Control no-cache. ETag incluye revisión y SHA-256; coincidencia If-None-Match devuelve 304. |
| GET de portada inválida | 400 ID/revisión/parámetros inválidos; 404 libro/portada dinámica ausente; 409 revisión obsoleta antes de revalidar; 503 almacenamiento no disponible. No genera contenido nuevo bajo revisión antigua. |
| `GET /api/admin/catalogo` y `GET /api/contenidos/libros` | Conservan contrato y ETag administrativo; derivan URL dinámica con revisión vigente. Los libros estáticos mantienen su ruta original. |

El preview valida la portada, no sustituye las comprobaciones de ficha/relaciones al guardar. No hay endpoint de upload. No se modifican sesiones, hashes o middleware de autenticación. Los errores públicos no incorporan rutas privadas ni credenciales.

## Uso del panel

«Registrar libro de demostración» abre formulario con ID estable, título, autor, año, enlace HTTPS, plantilla/paleta y casillas de constelaciones existentes con sus motivos. «Previsualizar portada» consulta el servidor sin guardar. «Confirmar registro» exige preview vigente y al menos una relación, usa If-Match y recarga el catálogo solo después de confirmación.

Cancelar no envía POST de alta y devuelve foco al botón inicial. 412 conserva el formulario y bloquea reenvío hasta recarga explícita; 401 utiliza recuperación en memoria de 3A con misma identidad y comparación de revisión. Un alta recuperada exige previsualizar de nuevo. Recargar o cerrar la pestaña pierde borrador y sesión cliente. El guardado diferencia alta web confirmada de publicación Homido pendiente; no promete disponibilidad offline.

## Pruebas y resultados reales

Windows, Node v24.21.0 y PowerShell. Directorios externos y credenciales aleatorias temporales; sin cuentas institucionales, catálogos reales ni dependencias nuevas.

| Validación | Resultado |
|---|---|
| `npm test` | 94/94 en ejecución final |
| `npm run test:web` | 122/122 en auditoría de cierre; validación anterior 121/121 tras fallo 120/121 por mirada, descrito abajo |
| `npm run build` | Correcto, 48 módulos |
| `openspec validate s4-persistencia-documental --strict` | Correcto |
| Integración HTTP con reinicio en proceso nuevo | Correcta; incluida en web |
| Chrome aislado | Secuencia de alta y persistencia correcta, cero errores JS no controlados |

Cobertura añadida: compatibilidad y hashes de SVG previos mediante regresiones existentes; tres variantes, XML escapado, rechazo de markup/controles/caracteres fuera del repertorio, textos que no caben, listas cerradas y tipos incorrectos; ID/rutas maliciosas; preview sin cambios; MIME/nosniff/ETag/304/409; autorización, If-Match, revisión antigua, duplicados y relaciones inválidas; varias constelaciones; cancelación, recuperación 401/412 y preview tardío. Pruebas de audio/Homido anteriores incluidas sin modificar sus módulos.

La integración real utiliza servicios/composable Vue contra Express: crea un libro generado en dos constelaciones, consulta ficha y SVG, conserva los nueve vínculos anteriores y multimedia, cierra servidor/escritor y arranca otro proceso Node. Nuevo login obtiene documento persistido y la portada coincide en bytes tras reinicio. La comparación administrativa tiene en cuenta que su URL contiene revisión mientras la ruta privada no la guarda.

Auditoría de cierre: repetidos `npm test` (94/94), `npm run test:web` (122/122), build y OpenSpec estricto, todos correctos. Se añadió una regresión específica de alta confirmada seguida de GET503: mantiene confirmación/ETag nuevo y exige recarga, incluso después de cancelar; no reenvía POST ni habilita otro alta que duplique el libro. La prueba HTTP también compara inventario y SHA-256 de todos los archivos regulares de frontend/public y dist antes/después de previsualizar y registrar: sin cambios. No hubo cambios funcionales adicionales. Ningún fallo de mirada en esta repetición; se conserva la incidencia anterior y no se declara resuelta.

Incidencias reales conservadas:

- Pruebas nuevas fallaron inicialmente por módulo/funciones ausentes, endpoint de preview 404 y rechazo del nuevo contrato público; después de implementación pasaron.
- La primera revalidación devolvió 200 por la evaluación automática de freshness con fetch de Node; se implementó comparación explícita If-None-Match después de comprobar revisión y las pruebas devolvieron 304 y 409 en sus casos correspondientes.
- Revisión independiente detectó ancho excesivo para `Ǆ` repetido diez veces bajo la estimación aplicada a todo Script=Latin. Regresión falló 4/5 antes de corregir; se acotó a Latin-1 y 1.2em y pasó 5/5. Tanto preview como alta rechazan el caso y marcas combinantes aisladas; tipos no string también se rechazan con 400 en vez de excepción no tipada. No se sustituyen caracteres para ocultar el problema.
- Una ejecución web tuvo 120/121: `GazeController avanza por las etapas 0%, 33%, 66% y confirma en 100%` no observó 33 %. Sin cambios a ese módulo, prueba aislada 5/5 y repetición completa 121/121. Diagnóstico de solo memoria con dwell100 ms y bloqueo controlado65 ms produjo etapas `[0%,66%,100%]` y confirmación. La causa concreta de la ejecución fallida no quedó verificada; se registra el comportamiento intermitente de esta prueba temporal, sin declararlo corregido.

## Evidencia de navegador

Chrome headless 156.0.8078.80 mediante Playwright instalado, perfil/Vite/API y credenciales temporales. Escritorio 1280×900 y 360×900 emulado; no teléfono físico. Secuencia ejecutada y repetida tras ajuste acotado: login → alta → seleccionar plantilla/paleta → asociar Orión y Escorpio → preview → guardar → estantería con cuatro libros → ficha por ID → detener API y cerrar escritor → proceso API nuevo en el mismo puerto → recargar ficha/portada y consultar Escorpio. Vite permanece ejecutándose, sin build/reinicio durante la secuencia.

Cierre: secuencia repetida otra vez con fixture nuevo `cierre-temporal`, plantilla guía/verde y motivos distintos para Orión y Escorpio. Se verificaron revisión intacta después de preview, un único POST de alta, configuración de plantilla persistida, tres fichas/nueve vínculos/multimedia originales intactos, portada decodificada de 450 px y segundo motivo tras reiniciar Express en otro proceso. Cero errores JavaScript no controlados; Enter/Tab y cancelación sin POST correctos. Datos, cuenta y script temporales retirados; se conservan las cinco capturas de la implementación anterior, sin presentarlas como capturas nuevas del cierre.

Enter abre alta, Tab enfoca ID y cancelar devuelve foco al botón inicial; cancelación sin POST. A 360 px el ancho total coincide con viewport. Se comprobaron imágenes SVG cargadas y límites getBBox de los textos de las tres variantes dentro del marco. Primera inspección mostró solapamiento de notas por margen negativo heredado; se corrigió solo en la sección de libros. Para la lámina comparativa de SVG embebidos se aislaron IDs de gradiente en el documento de prueba; las imágenes reales se sirven como recursos independientes.

Capturas inspeccionadas: [alta escritorio](evidencias-s4-3b/alta-escritorio.png), [alta 360](evidencias-s4-3b/alta-360.png), [estantería 360](evidencias-s4-3b/estanteria-360.png), [ficha 360](evidencias-s4-3b/ficha-360.png), [tres plantillas](evidencias-s4-3b/plantillas-escritorio.png). El script aislado y sus datos temporales se retiraron. Detector Impeccable sobre AdminPanelView: sin avisos.

## Inventario y estado

- Backend modificados: `src/index.js`, `src/services/catalogo.js`, `src/services/catalogoEdicion.js`, `test/documentAdmin.test.js`.
- Backend nuevos: `src/services/portadas.js`, `test/portadas.test.js`.
- Frontend modificados: `src/composables/useEditorCatalogo.js`, `src/services/catalogoAdminService.js`, `src/services/librosDemoService.js`, `src/views/AdminPanelView.vue`, `test/catalogo-integracion.test.js`.
- Frontend nuevo: `test/alta-libros.test.js`.
- Documentación: este informe, cinco capturas y proposal/design/spec/tasks S4.

OpenSpec 5.1b y 5.4 implementadas en este corte: renderizador disponible para futura reutilización; el exportador permanece pendiente en sección6. 5.5 y 3.5 no se cierran; pruebas físicas, copia externa operativa y despliegue institucional siguen pendientes. S4 no se declara terminado. Los textos de cortes previos son históricos; 3B actualiza la restricción anterior de no crear libros.

Limitaciones: repertorio tipográfico acotado y rechazo de texto que no cabe; estilos dependen de fuentes serif/sans instaladas y requieren comprobar equipos destino. Revisiones globales invalidan URLs de portada anteriores: consultar catálogo de nuevo tras409. No se publica incorporación Homido ni paquete offline; mantener su renderizador, respaldo, controles y audios intactos hasta Etapa4. Títulos/autores aún no editables desde panel. No ejecutados zoom nativo200 %, móvil real, Homido físico ni auditoría exhaustiva con lector de pantalla. Persisten límites operativos de backup/durabilidad ya documentados en2B.

Archivos ajenos intactos: `.gitignore` con línea vacía previa, `docs/VALIDACION-PR6-S4.md`, carpeta raíz `.presentacion-build/`, guion y PDF/PPTX preexistentes. Inventario2281 archivos con SHA-256 agregado idéntico: `ACF1CBE34F9B96E0F93EEFAD29AB0415DDB78615BBDD860B66292AE74A460B2C`. Semilla, SVG, CSS/rutas de estantería, contenido y Homido sin cambios. Índice Git vacío; no se publican archivos de ejecución, secretos ni respaldos.
