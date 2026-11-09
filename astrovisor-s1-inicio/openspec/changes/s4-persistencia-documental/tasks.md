# Plan de implementación — S4

Etapa 1 publicada: `735fd4b1413e5cd98387e297716f3d4c76cac52d`; Etapa 2A publicada: `3bf81dd03e320b6207d6b053f5ee2862cd325371`. Usuario autorizó publicar exclusivamente Etapa 2B corregida tras revisión final sin bloqueantes: guardado, API documental y respaldos privados. Sin merge ni archivo. Las tareas no marcadas siguen pendientes; no avanzar automáticamente a formularios, lectores, portadas dinámicas ni exports.

Auditoría anterior detuvo publicación por rechazo de restauración después de rename confirmado si falla liberar escritor.lock. Corrección posterior autorizada, implementada y validada; verificaciones repetidas para publicar: ocho regresiones, backend 87/87, web 98/98, build y OpenSpec correctos. Resultado confirmado y limpieza se comunican por separado; caso simultáneo conserva error de operación. Commit/push de 2B autorizados posteriormente, sin merge, archivo ni Etapa 3. Evidencia en `docs/PRUEBA-S4-ETAPA2B.md`.

**Goal:** permitir edición documental autorizada y persistente con lectura pública coherente.

**Architecture:** una instantánea JSON con revisión global, proyecciones compatibles y un solo escritor. Identidad separada del catálogo; no habilitar escritura hasta aprobar su revisión.

**Tech Stack:** Vue 3, Express, Node y archivos JSON; reutilizar herramientas instaladas. Sin nueva base de datos.

**Spec:** `specs/gestion-documental/spec.md` y `design.md`.

## Restricciones globales

- Solo implementar después de aprobación explícita del plan y de la integración autorizada de #6; rama nueva desde main actualizado.
- No integrar #5, no rediseñar estantería ni rehacer Homido. Conservar SVG, audio, transcripción, autoría y metadatos.
- No introducir préstamos, disponibilidad, contenido institucional ficticio ni base de datos adicional.
- Revisión de auth explícita con responsable; jamás usar fixture de pruebas como identidad de producción.
- Fixtures y archivos temporales aislados: las pruebas no deben escribir el catálogo real ni consultar Supabase con credenciales reales.
- No hacer commits de integración, merge, publicación ni archivo OpenSpec sin autorización del usuario.
- Identidad local de Etapa 2A conservada; Etapa 2B autoriza únicamente escritura documental y respaldos de secciones 3/4, sin avanzar a otras etapas.
- Semilla versionada separada del runtime: datos administrados, backups, secretos, lock y temporales externos a Git y raíces públicas; no copiar semilla durante arranque normal.

El plan completo permanece registrado; esta entrega ejecuta secciones 3 y 4 como Etapa 2B, tras lectura/inicialización y autenticación ya publicadas. Alojamiento independiente se traslada a 8.6 por decisión posterior del usuario. No se posponen controles de validación, integridad o regresión aplicables a esta etapa. Una prueba no ejecutada continúa pendiente.

## Foco de revisión

- Clientes con revisiones antiguas o peticiones simultáneas: un solo guardado confirmado, edición rechazada conservada.
- Proceso interrumpido, disco sin permisos/espacio y lock abandonado: documento válido o recuperación explícita, sin reset demo.
- Datos desconocidos y relaciones compartidas: PATCH parcial sin pérdida de metadatos ni duplicación del catálogo.
- Título cambiado y API caída: identidad estable, salida Homido correcta y revisión de respaldo visible.
- Estado local adulterado, rutas de archivo y originales sin permiso: no conceder acceso ni publicar material arbitrario.

## 0. Condiciones de entrada

- [x] 0.1 Referencias autorizadas, corregidas e integradas en PR #6; validación automatizada en `docs/VALIDACION-PR6.md`. Pruebas físicas permanecen en 0.2.
- [ ] 0.2 Completar navegador escritorio/360 px/teclado/200 % y pruebas Homido físicas cuando se disponga del dispositivo; registrar pendientes y aceptación expresa si subsisten.
- [x] 0.3 PR #6 integrada y rama S4 creada desde `f1058c9b10641c470d7d3e331a81f327af78fc8c`; autorización limitada a Etapa 1.
- [ ] 0.4 Confirmar rutas externas de runtime/configuración, volumen persistente, un escritor y servidor estático independiente de Express para el respaldo; revisar reglas históricas S1 con el usuario antes de ampliarlas a S4.
- Etapa 5A: escritorio/360 px/teclado y procesos independientes temporales repetidos. 0.2 y 0.4 parciales: faltan zoom nativo, hardware, destinos/volumen/ACL/alias operativos y revisión histórica S1; no inferir despliegue desde temporales. Matriz en `docs/PRUEBA-S4-ETAPA5A.md`.
- [x] 0.5 Usuario eligió A: configuración privada con hashes y sesiones Express sin base de datos. Implementación no realizada en Etapa 1.

## 1. Puerta de seguridad administrativa

Archivos: `backend/src/index.js`, `backend/src/middleware/auth.js`, `backend/test/auth.test.js`; `frontend/src/composables/useAuth.js`, `frontend/src/router/index.js`, `frontend/src/views/AdminAccesoView.vue` solo si la transición lo requiere. Interfaz consumida después: sesión Express validada en cada endpoint, identidad administrativa autorizada en servidor.

- [x] 1.1 Inspección del flujo REST y sustitución aprobada por identidad local, sin migrar/descargar cuentas reales; procedimiento de alta/rotación privado documentado. ACL y costo en servidor destino pendientes.
- [x] 1.2 Pruebas de credenciales/configuración, sin token, token inválido/expirado por HTTP, logout/revocación, estado Vue adulterado y ausencia de fixture automático. Observados fallos previos a implementación y posteriores resultados correctos.
- [x] 1.3 Scrypt, comparación segura, límites, cuenta explícita y verificación en servidor implementados; adaptado formulario/guard, sin Supabase obligatorio para identidad. Generador sin eco, argumentos o salida de secretos; sin cuentas reales creadas.
- [x] 1.4a Auditoría final local y regresiones: backend 48/48, web 98/98 por separado, build y OpenSpec estrictos correctos. Integración HTTP aislada: configuración corrupta/inválida, revocación y cabeceras proxy falsificadas. Mirada: diez ejecuciones aisladas correctas; bloqueo controlado reproduce salto de etapa sin modificar módulo ajeno. Evidencia y fallo paralelo previo conservados en el informe.
- [x] 1.4b Revisión del informe por el usuario y publicación de Etapa 2A autorizadas, condicionadas a auditoría sin bloqueantes; auditoría local sin bloqueantes identificados. No equivale a revisión operativa del despliegue ni autoriza escritura documental.
- [ ] 1.4c Validación operativa de HTTPS, permisos/ACL, TTY real y costo/límites en servidor destino antes de uso real. No hay endpoints de escritura nuevos.
- Etapa 5A repite login, reinicio, rotación/revocación y logout aislados; no ejecuta TTY real, HTTPS/ACL ni capacidad en destino. 1.4c sigue parcial; no se creó identidad institucional.

## 2. Catálogo único y migración

Archivos: `backend/src/services/documentRepository.js`, nuevo `content/catalogo-inicial.json` versionado, nuevo `scripts/migrar-catalogo.mjs`, `backend/test/documentRepository.test.js`, fixtures temporales y documentación. Runtime: `<ASTROVISOR_DATA_DIR>/catalogo.json`, externo y sin seguimiento. Entradas: JSON actuales corregidos con aprobación. Salida: instantánea de `design.md` y proyección compatible.

- [x] 2.1 Pruebas de migración y validación: tres libros/constelaciones, nueve relaciones, IDs, metadatos desconocidos, recursos y colisiones. Fallos previos a implementación observados y posterior suite satisfactoria.
- [ ] 2.2 Completar migración de consumidores/frontend y retirada de fixtures duplicados; copia privada de entradas y backup de migraciones futuras cuando corresponda. No confundir con doble escritura ni con el inicializador de Etapa 1.
- Auditoría 5A: consumidores migrados a Express/paquete verificado, sin import runtime encontrado de libros-demo.json o supabaseClient. Fixtures necesarios para pruebas/histórico y herramientas manuales S3 conservados; sin doble escritura automática. Nota de content/README actualizada. 2.2 parcial por copia privada de entradas operativas y procedimientos de migraciones futuras no acreditados.
- [x] 2.2a Semilla unificada e inicializador explícito/exclusivo; rechazo de destino existente válido/corrupto y rutas dentro del checkout. Sin creación automática. Archivo modificado en fixture temporal sobrevive reapertura desde otro proceso y reintento de inicialización.
- [x] 2.3 Lectura/proyección y validación implementadas; corrupción/ausencia produce error controlado sin reinicializar ni usar semilla silenciosamente. Endpoint nuevo exclusivamente de lectura de libros.
- [x] 2.4 Proyecciones iniciales iguales a fixtures, metadatos/avisos demo conservados y hashes SVG exactos; suite backend 38/38, web 93/93 y build correcto. Evidencia en `docs/PRUEBA-S4-ETAPA1.md`. No equivale a pruebas de navegador o hardware.

## 3. Guardado exclusivo y recuperación

Archivos: `backend/src/services/documentRepository.js`, `backend/src/services/documentWriter.js`, `backend/test/documentWriter.test.js`, `scripts/recuperar-catalogo.mjs`, `docs/PRUEBA-S4-ETAPA2B.md`; `<ASTROVISOR_DATA_DIR>/backups/`, temporales y locks solo runtime privado externo. `.gitignore` preexistente intacto, sin reglas nuevas. Interfaz: guardar cambios permitidos con revisión base y devolver nueva revisión confirmada; errores tipados para API.

- [x] 3.1 Pruebas aisladas añadidas y observados fallos previos al escritor: otro proceso, dos editores/procesos, backup, escritura parcial/sync/rename, corrupción, hash y restauración. Sin datos reales.
- [x] 3.2 Lock por vida del escritor más control breve de recuperación, cola y revisión dentro de la sección crítica. Temporal/sync/cierre/rename, respaldo validado previo y retención tras confirmar. Fallos anteriores conservan datos; avisos posteriores no simulan reversión.
- [x] 3.3 Interrupciones de proceso antes/después de rename comprobadas; lock vivo no se retira y lock abandonado exige PID/host. Control huérfano falla cerrado y exige operación manual offline documentada. No equivale a prueba de corte eléctrico.
- [x] 3.4 Restauración normal/CLI, evidencia, revisión superior y lectura desde otro proceso comprobadas. Hallazgo de auditoría corregido: rename confirmado + EACCES al liberar comunica confirmada=true, revisión persistida y limpieza pendiente; no elimina lock activo ni reintenta restauración. CLI salida 2 con aviso inequívoco; fallo previo salida 1 y error primario conservado aunque también falle liberar. Ocho regresiones nuevas y suite backend 87/87, web 98/98, build/OpenSpec correctos. Publicación posterior de 2B autorizada, sin ampliación de alcance.
- [ ] 3.5 Validación local ejecutada: `npm test` 87/87, NTFS de C: identificado y límites de energía/disco documentados. Procedimiento de copia externa documentado, pero destino y copia/restauración externos reales siguen sin configurar/ensayar; no declarar completa la operación de respaldo externo.
- Etapa 5A: backend107/107, copia y restauración de backup en otro directorio temporal del mismo NTFS, restauración del ensayo a revisión6 con metadatos intactos y durabilidadPendiente=true. No equivale a destino externo institucional, otro volumen ni resistencia eléctrica; 3.5 permanece parcial.

## 4. API administrativa y publicación

Archivos: `backend/src/index.js`, `backend/src/services/catalogoEdicion.js`, `backend/src/services/documentWriter.js`, `backend/test/documentAdmin.test.js`, ajuste de ruta desconocida en `backend/test/auth.test.js`. Contratos: tabla de endpoints y estados HTTP de `design.md` y decisiones acotadas 2B.

- [x] 4.1 Pruebas HTTP añadidas y observadas inicialmente con 404 por rutas ausentes: POST/PATCH, ausencia de token, If-Match, duplicados, whitelist, prototipos, URLs/rutas, texto y rutas desconocidas. Nuevas pruebas no usan administradores reales.
- [x] 4.2 GET administrativo/ETag y POST/PATCH mínimos protegidos, 428/412/400/401/404/409/503; API pública de libros conservada. Sin DELETE. 403 reservado: 2A solo emite cuenta con permiso completo. Alta depende de SVG estático correcto existente; falta de portada 409, sin generación dinámica.
- [x] 4.3 Respuestas sin credenciales/rutas privadas, fallos sin éxito aparente y corrección de falso 503 posrename con regresión. API HTTP anterior detenida, escritor cerrado y proceso nuevo sirve por HTTP el cambio persistido.
- [x] 4.4 Historia distinta con audio bloqueada con 409; pruebas de resumen/libro/motivos conservan multimedia, transcripciones, metadatos de referencia y los nueve vínculos. SVG aprobados sin cambios.

## 5. Panel y catálogo público

Etapa 3A autorizada sobre 2B publicada en `38c00eb452e3f24b4bbb2177ce58ce8463d7ace1`. Auditoría final, corrección de borrador ante 401 y commit/push de 3A autorizados por el usuario; sin merge ni archivo. Evidencia: `docs/PRUEBA-S4-ETAPA3A.md`. Este estado sustituye las restricciones históricas de no iniciar formularios/lectores para el alcance explícito de 3A.

Archivos: `frontend/src/views/AdminPanelView.vue`, `frontend/src/services/librosDemoService.js`, `frontend/src/services/contentService.js`, `frontend/src/composables/useRecorridos.js`, `frontend/src/views/BibliotecaView.vue`; tests `biblioteca-demo.test.js`, `contentService.test.js`. Interfaz: misma API documental para editor/lector y revisión devuelta al guardar.

- [x] 5.1a Pruebas de carga/cancelación/error, lectura pública tras guardado, If-Match, conflicto con borrador conservado y reinicio en proceso nuevo. Fallos iniciales registrados; resultado final web 115/115; regresión adicional de cancelación después de confirmación/GET fallido.
- [x] 5.1c Regresiones de 401: borrador solo en memoria, recuperación explícita tras login/GET de misma identidad, revisión cambiada bloquea envío, otra identidad no recupera, token expirado retirado sin reenviar y sin almacenamiento del token en navegador. Chrome aislado confirma flujo sin PATCH automático. Recargar/cerrar pierde sesión y borrador; aviso visible.
- [x] 5.1b Etapa 3B autorizada sobre d8f3792: alta desde panel con ID/título/autor/año/HTTPS, varias relaciones, portada/preview, confirmación, cancelación, 401 recuperable en memoria y 412 sin pérdida. Pruebas HTTP y navegador con reinicio en proceso nuevo, sin datos reales. Cierre y publicación autorizados después; auditoría sin bloqueantes identificados, backend94/94, web122/122, build/OpenSpec correctos. Regresión de alta confirmada seguida de GET fallido no reintenta ni permite duplicación tras cancelar.
- [x] 5.2 Retirar lectura directa de `fichas_libros`; reutilizar panel para formulario de campos permitidos, carga, errores y revisión. Mantener datos remotos de Supabase intactos.
- [x] 5.3 Sustituir import compilado por carga API; conservar rutas #6 y layout/CSS. Mostrar tipo de portada y estados honestos de demo, sin ubicaciones inventadas.
- Título y autor en solo lectura en 3A por texto fijo SVG y mapeo Homido por título. Edición solo de año/enlace/motivos y resumen/reconocimiento; sin alta. 400/401/403/404/409/412/428/503 manejados; recarga fallida posterior conserva confirmación, no repite escritura.
- [x] 5.4 Implementar plantillas ilustrativas permitidas y endpoint `GET /api/contenidos/libros/:id/portada.svg?revision=N`, compartiendo renderizado con exportador. Probar libro nuevo visible sin build/reinicio, ETag/revalidación, conflicto de revisión, ajuste de texto, escape SVG y rechazo de rutas/markup. No escribir en frontend público ni Git; conservar bytes/estilos de los tres SVG. Mantener originales deshabilitadas en MVP.
- Etapa 3B: generador reutilizable por futuro exportador, sin implementarlo. SHA SVG existentes conservados; revisión vigente, 304/409, validación común y caracteres fuera de Latin-1 rechazados. Evidencia en docs/PRUEBA-S4-ETAPA3B.md. Validación física/operativa de 5.5 y tareas 3.5/6 permanecen pendientes.
- [x] 5.5a Chrome headless 156.0.8078.80: escritorio 1280×900, 360×900 emulado, Tab/Enter/Shift+Tab y retorno de foco, SVG, conflicto y API caída. CSS zoom 200 % sin desbordamiento; no equivale a zoom nativo. Build y web correctos; capturas en informe.
- [ ] 5.5 Probar escritorio, 360 px, 200 %, Tab/Enter/Shift+Tab, foco y retorno; registrar navegador/viewport y separar emulación de teléfono físico. Ejecutar `npm run test:web` y `npm run build`.
- Etapa 5A Chrome156: escritorio1280/360, foco abrir/guardar/cancelar, error412 role=alert con borrador conservado y contraste muestreado. Ficha360 sin zoom mide360; zoom CSS200% mide447, hallazgo abierto sin cambio visual. No zoom nativo ni móvil real; 5.5 sigue parcial. Web137/137 y build correctos; capturas en informe5A.

## 6. Homido y respaldo público

Archivos: `frontend/public/prueba-homido/js/datos.js`, `js/estanteria-3d.js`, `js/ruta-libro-2d.js`, `prueba.js`, copia demo inicial `data/recorridos-demo.json`, `frontend/vite.config.js`, `backend/src/index.js`, nuevo `scripts/exportar-homido.mjs` y tests `homido-datos.test.js`, `homido-estanteria-3d.test.js`. Artefactos administrados: `<ASTROVISOR_PUBLIC_EXPORT_DIR>` externo. Interfaz: proyección compatible con ID, revisión y fuente.

- [x] 6.1a Etapa 4A: pruebas de cambio de título/ID estable, libro nuevo compartido, nueve vínculos originales, bibliografía heredada, privacidad y audio. Fallos nuevos observados antes de implementar; evidencia en docs/PRUEBA-S4-ETAPA4A.md.
- Auditoría/publicación 4A autorizadas: backend96/96, web129/129, build y OpenSpec correctos. Regresión de firma heredada ambigua, rechazo de inferencia y Chrome software con respaldo válido/ambiguo/desconocido, dos orígenes, Atrás y estados/eventos de audio. Sin hardware, merge, archivo ni avance a4B.
- [x] 6.1b Etapa 4B local: comparación completa contra proyectores públicos, SVG originales byte a byte, audio/transcripciones/créditos, libro nuevo compartido y cambio de título con ID estable comprobados. Exportador 10/10 e integración HTTP 1/1; evidencia en `docs/PRUEBA-S4-ETAPA4B.md`. No equivale a validación visual/física.
- [x] 6.2 Mapeo por libroId, extracción deduplicada y máximo tres, prioridad a constelación de origen y desempate ASCII. Respaldo antiguo adaptado solo por firma URL+autor con aviso sin revisión verificada. Chrome software: Homido→ficha por ID, retorno Atrás, libro renombrado y compartido. Ajuste acotado de texto en slots existentes; sin cambios de dwell/audio/escena. Prueba física pendiente en 6.4.
- [x] 6.3 Publicación local por revisión implementada y comprobada: staging externo, lista cerrada, hashes/referencias, directorio y puntero, exclusión entre procesos, rechazo de retroceso, idempotencia y confirmación separada de limpieza. Backend 107/107, web 137/137, build correcto y Chrome SwiftShader sin errores JS. Primeros intentos bloqueados por permisos/límite de revisión automática documentados y posteriores ejecuciones aprobadas. Auditoría final y commit/push exclusivos de 4B autorizados posteriormente por el usuario, sin merge ni archivo. Alojamiento de producción sigue pendiente en 8.6.
- [x] 6.3b Integración temporal: PATCH confirmado revisión 2, exportación fallida conserva puntero 1, reexportación sin PATCH, reinicio persistente y JSON/SVG/audio con Express detenido. Mensajes del editor publicados/pendientes comprobados; Chrome distingue API revisión 3, paquete anterior revisión 2, histórico no verificado y ausencia total con error. No se promete offline. Evidencia en `docs/PRUEBA-S4-ETAPA4B.md`.
- [ ] 6.4 Repetir regresiones de audio y salida 2D; probar físicamente Homido/sensores cuando esté disponible y registrar el resultado real. No cerrar verificación física con tests de canvas simulado.
- Etapa 5A repite software WebGL, paquete con Express detenido, SVG nuevo/audio, pausa de mirada independiente, máximo3, salida2D/Atrás y suites; no hardware/sensores ni escucha humana. 6.4 parcial, sin cambios en controlador o reproductor.

## 7. Revisión y entrega

- [x] 7.1 Etapa 5A sobre12546c2301a5c32efc0819b8731fe380412f20bf: Windows10.0.26200.0/Node24.21.0/NTFS, backend107/107, web137/137, build y OpenSpec estricto correctos. Fallo de selector del arnés, desbordamiento CSS y repeticiones registrados. No sustituye validación operativa/física.
- [x] 7.2 Aceptación5A local: resumen/alta compartida, procesos nuevos con lectura panel/web/visor,412 real conserva borrador, rechazo sin autorización/precondición, exportación fallida conserva publicación3 y restauración privada a revisión6. Metadatos/relaciones comparados y copia temporal restaurada; no datos institucionales. Evidencia detallada en informe5A.
- [ ] 7.3 Revisar con responsables de auth, contenido/audio y Homido los cambios justificados en sus módulos; documentar aprobaciones realmente recibidas.
- 7.3 parcial: aprobaciones del usuario y revisiones técnicas previas documentadas; no hay nueva aprobación de responsables ajenos acreditada en5A. No se solicita como requisito nuevo ni se inventa su recepción.
- [x] 7.4 Informe5A registra límites MVP, hallazgo de accesibilidad, riesgos y matriz completa. No declara cerrados3.5/5.5/6.4/8.6 ni acreditados HTTPS/ACL/volumen por esta documentación.
- [ ] 7.5 Presentar diff y evidencia al usuario; esperar autorización antes de integración o archivo OpenSpec. No marcar S4 terminado con pendientes obligatorios sin resolver.
- 7.5 parcial: usuario revisó5A y autorizó publicación exclusivamente documental tras auditoría final. Repetición backend107/107, web137/137, build/OpenSpec correctos; cinco capturas inspeccionadas. No autoriza integración/archivo ni cierre de Sprint4. El hallazgo CSS447/360 permanece abierto y las tareas operativas/físicas siguen pendientes.

## 8. Mejoras posteriores al MVP

- [ ] 8.6 Alojamiento independiente pospuesto por el usuario (antes 6.3a). Evaluar servidor estático/alias independiente y pruebas de caída completa únicamente con autorización posterior; mientras tanto conservar API principal y respaldo estático versionado actual sin prometer resiliencia nueva.

- [ ] 8.1 Incorporar selección de portadas originales solo con activos, procedencia, permisos y aprobación; conservar distinción accesible. Upload libre queda fuera de alcance.
- [ ] 8.2 Incorporar footer responsive en `App.vue` después de recibir logos oficiales y aprobación; probar teclado, 360 px y 200 %, sin afectar estantería/Homido.
- [ ] 8.3 Mejorar comparación visual de conflictos; MVP ya debe conservar la edición rechazada y explicar recuperación.
- [ ] 8.4 Automatizar copia externa de backups después de aprobar destino; MVP exige procedimiento manual y prueba de restauración, no omitir respaldo externo operativo.
- [ ] 8.5 Habilitar edición coordinada de historia/audio con responsable y recursos aprobados; hasta entonces MVP rechaza el cambio inconsistente y preserva metadatos.

No se incluyen por defecto service worker, actualización en tiempo real ni administración web de cuentas; requerirían alcance y aprobación adicionales.
