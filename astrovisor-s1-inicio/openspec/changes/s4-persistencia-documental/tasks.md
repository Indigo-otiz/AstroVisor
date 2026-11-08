# Plan de implementación — S4

Etapa 1 publicada: `735fd4b1413e5cd98387e297716f3d4c76cac52d`. Usuario revisó Etapa 2A y autorizó auditoría final, commit y push si no aparecen bloqueantes. Las tareas no marcadas siguen pendientes; no implementar CRUD documental ni avanzar o archivar automáticamente.

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
- Identidad local seleccionada y autorizada en Etapa 2A; no ampliar a escritura documental ni otras etapas.
- Semilla versionada separada del runtime: datos administrados, backups, secretos, lock y temporales externos a Git y raíces públicas; no copiar semilla durante arranque normal.

El plan completo permanece registrado; esta entrega cierra la autenticación de Etapa 2A, además de la lectura/inicialización de Etapa 1. Alojamiento independiente se traslada a 8.6 por decisión posterior del usuario. No se posponen controles de validación, integridad o regresión aplicables a esta etapa. Una prueba no ejecutada continúa pendiente.

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
- [x] 0.5 Usuario eligió A: configuración privada con hashes y sesiones Express sin base de datos. Implementación no realizada en Etapa 1.

## 1. Puerta de seguridad administrativa

Archivos: `backend/src/index.js`, `backend/src/middleware/auth.js`, `backend/test/auth.test.js`; `frontend/src/composables/useAuth.js`, `frontend/src/router/index.js`, `frontend/src/views/AdminAccesoView.vue` solo si la transición lo requiere. Interfaz consumida después: sesión Express validada en cada endpoint, identidad administrativa autorizada en servidor.

- [x] 1.1 Inspección del flujo REST y sustitución aprobada por identidad local, sin migrar/descargar cuentas reales; procedimiento de alta/rotación privado documentado. ACL y costo en servidor destino pendientes.
- [x] 1.2 Pruebas de credenciales/configuración, sin token, token inválido/expirado por HTTP, logout/revocación, estado Vue adulterado y ausencia de fixture automático. Observados fallos previos a implementación y posteriores resultados correctos.
- [x] 1.3 Scrypt, comparación segura, límites, cuenta explícita y verificación en servidor implementados; adaptado formulario/guard, sin Supabase obligatorio para identidad. Generador sin eco, argumentos o salida de secretos; sin cuentas reales creadas.
- [x] 1.4a Auditoría final local y regresiones: backend 48/48, web 98/98 por separado, build y OpenSpec estrictos correctos. Integración HTTP aislada: configuración corrupta/inválida, revocación y cabeceras proxy falsificadas. Mirada: diez ejecuciones aisladas correctas; bloqueo controlado reproduce salto de etapa sin modificar módulo ajeno. Evidencia y fallo paralelo previo conservados en el informe.
- [x] 1.4b Revisión del informe por el usuario y publicación de Etapa 2A autorizadas, condicionadas a auditoría sin bloqueantes; auditoría local sin bloqueantes identificados. No equivale a revisión operativa del despliegue ni autoriza escritura documental.
- [ ] 1.4c Validación operativa de HTTPS, permisos/ACL, TTY real y costo/límites en servidor destino antes de uso real. No hay endpoints de escritura nuevos.

## 2. Catálogo único y migración

Archivos: `backend/src/services/documentRepository.js`, nuevo `content/catalogo-inicial.json` versionado, nuevo `scripts/migrar-catalogo.mjs`, `backend/test/documentRepository.test.js`, fixtures temporales y documentación. Runtime: `<ASTROVISOR_DATA_DIR>/catalogo.json`, externo y sin seguimiento. Entradas: JSON actuales corregidos con aprobación. Salida: instantánea de `design.md` y proyección compatible.

- [x] 2.1 Pruebas de migración y validación: tres libros/constelaciones, nueve relaciones, IDs, metadatos desconocidos, recursos y colisiones. Fallos previos a implementación observados y posterior suite satisfactoria.
- [ ] 2.2 Completar migración de consumidores/frontend y retirada de fixtures duplicados; copia privada de entradas y backup de migraciones futuras cuando corresponda. No confundir con doble escritura ni con el inicializador de Etapa 1.
- [x] 2.2a Semilla unificada e inicializador explícito/exclusivo; rechazo de destino existente válido/corrupto y rutas dentro del checkout. Sin creación automática. Archivo modificado en fixture temporal sobrevive reapertura desde otro proceso y reintento de inicialización.
- [x] 2.3 Lectura/proyección y validación implementadas; corrupción/ausencia produce error controlado sin reinicializar ni usar semilla silenciosamente. Endpoint nuevo exclusivamente de lectura de libros.
- [x] 2.4 Proyecciones iniciales iguales a fixtures, metadatos/avisos demo conservados y hashes SVG exactos; suite backend 38/38, web 93/93 y build correcto. Evidencia en `docs/PRUEBA-S4-ETAPA1.md`. No equivale a pruebas de navegador o hardware.

## 3. Guardado exclusivo y recuperación

Archivos: `backend/src/services/documentRepository.js`, `backend/test/documentRepository.test.js`, `.gitignore`, documentación operativa; `<ASTROVISOR_DATA_DIR>/backups/`, temporales y lock solo runtime privado externo. Interfaz: guardar cambios permitidos con revisión base y devolver nueva revisión confirmada; errores tipados para API.

- [ ] 3.1 Añadir pruebas sobre directorio temporal: persistencia en otro proceso, dos editores de igual revisión, segunda instancia, fallo de backup/escritura/rename, JSON corrupto y restauración. Usar inyección mínima de fallo o un fixture de proceso, sin modificar datos reales. Ejecutar y comprobar fallos esperados.
- [ ] 3.2 Implementar lock de escritor, cola, comparación de revisión dentro del guardado y reemplazo temporal en mismo volumen con flush/cierre; backup antes del cambio, retención de 20 solo tras éxito.
- [ ] 3.3 Probar interrupción antes/después de rename y conservación de un documento válido; no retirar un lock cuyo propietario sigue activo. Documentar cómo comprobar y recuperar un lock abandonado.
- [ ] 3.4 Restaurar una copia validada con API detenida y nueva revisión; iniciar proceso nuevo y comprobar textos, relaciones y metadatos. Comprobar que runtime privado no entra en `dist` ni rutas públicas.
- [ ] 3.5 Ejecutar `npm test`; registrar sistema de archivos probado y límites frente a pérdida de disco/energía. Documentar volumen y copia externa operativa sin conectar servicios nuevos.

## 4. API administrativa y publicación

Archivos: `backend/src/index.js`, `backend/src/services/documentRepository.js`, `backend/test/auth.test.js`, `backend/test/documentRepository.test.js`. Contratos: tabla de endpoints y estados HTTP de `design.md`.

- [ ] 4.1 Añadir pruebas de POST/PATCH autorizado y no autorizado, `If-Match` ausente/obsoleto, duplicados, campos prohibidos, contaminación de prototipo, URLs/rutas inválidas, texto excesivo y método/ruta desconocido. Ejecutar y comprobar fallo esperado.
- [ ] 4.2 Implementar GET público de libros y GET administrativo de catálogo con ETag; POST/PATCH mínimos con validación y whitelist, sin DELETE. Reemplazar respuesta administrativa genérica por 404/405.
- [ ] 4.3 Probar que leer/guardar no filtra información de cuentas, backups o rutas y que ningún fallo devuelve éxito aparente. Guardar y reiniciar proceso; comprobar API pública contra estado persistido.
- [ ] 4.4 Bloquear con 409 cambios de historia con audio que carecen de revisión coordinada aprobada; probar que la edición de resumen/libro no altera `multimedia`, autoría ni transcripciones.

## 5. Panel y catálogo público

Archivos: `frontend/src/views/AdminPanelView.vue`, `frontend/src/services/librosDemoService.js`, `frontend/src/services/contentService.js`, `frontend/src/composables/useRecorridos.js`, `frontend/src/views/BibliotecaView.vue`; tests `biblioteca-demo.test.js`, `contentService.test.js`. Interfaz: misma API documental para editor/lector y revisión devuelta al guardar.

- [ ] 5.1 Añadir pruebas de carga/cancelación/error, catálogo actualizado después del guardado, creación con relación y conflicto que conserva la edición. Ejecutar `npm run test:web` y comprobar fallo nuevo.
- [ ] 5.2 Retirar lectura directa de `fichas_libros`; reutilizar panel para formulario de campos permitidos, carga, errores y revisión. Mantener datos remotos de Supabase intactos.
- [ ] 5.3 Sustituir import compilado por carga API; conservar rutas #6 y layout/CSS. Mostrar tipo de portada y estados honestos de demo, sin ubicaciones inventadas.
- [ ] 5.4 Implementar plantillas ilustrativas permitidas y endpoint `GET /api/contenidos/libros/:id/portada.svg?revision=N`, compartiendo renderizado con exportador. Probar libro nuevo visible sin build/reinicio, ETag/revalidación, conflicto de revisión, ajuste de texto, escape SVG y rechazo de rutas/markup. No escribir en frontend público ni Git; conservar bytes/estilos de los tres SVG. Mantener originales deshabilitadas en MVP.
- [ ] 5.5 Probar escritorio, 360 px, 200 %, Tab/Enter/Shift+Tab, foco y retorno; registrar navegador/viewport y separar emulación de teléfono físico. Ejecutar `npm run test:web` y `npm run build`.

## 6. Homido y respaldo público

Archivos: `frontend/public/prueba-homido/js/datos.js`, `js/estanteria-3d.js`, `js/ruta-libro-2d.js`, `prueba.js`, copia demo inicial `data/recorridos-demo.json`, `frontend/vite.config.js`, `backend/src/index.js`, nuevo `scripts/exportar-homido.mjs` y tests `homido-datos.test.js`, `homido-estanteria-3d.test.js`. Artefactos administrados: `<ASTROVISOR_PUBLIC_EXPORT_DIR>` externo. Interfaz: proyección compatible con ID, revisión y fuente.

- [ ] 6.1 Añadir prueba de cambio de título con ID estable, libro nuevo, relación compartida, exportación idéntica en todos los campos públicos y ausencia de datos privados. Ejecutar `npm run test:web` y comprobar fallo esperado.
- [ ] 6.2 Adaptar mapeo por ID y extracción, manteniendo máximo de tres cubiertas y controles de mirada; no rehacer renderer, dwell ni audio.
- [ ] 6.3 Implementar publicación de paquete público por revisión con JSON, manifiesto, cubiertas generadas y audios públicos existentes. Filtrar campos/activos explícitamente; verificar hashes/rutas antes de mover puntero atómico, conservar última copia completa ante fallo. No publicar runtime/backups ni depender de endpoints API para activos del paquete.
- [ ] 6.3b Inyectar fallo de publicación después de guardar: panel informa persistencia confirmada con respaldo público pendiente, queda revisión anterior publicada y reexportación operativa no repite edición. Probar caída de ambos servidores sin caché: error honesto, sin prometer offline.
- [ ] 6.4 Repetir regresiones de audio y salida 2D; probar físicamente Homido/sensores cuando esté disponible y registrar el resultado real. No cerrar verificación física con tests de canvas simulado.

## 7. Revisión y entrega

- [ ] 7.1 Ejecutar desde raíz `npm test`, `npm run test:web`, `npm run build` y `openspec validate s4-persistencia-documental --strict`; registrar SHA, entorno y resultados, sin ocultar pruebas fallidas.
- [ ] 7.2 Completar evidencia de guardar → detener → iniciar otro proceso → leer en panel/web/visor; conflicto de dos editores; recuperación y verificación de archivos privados.
- [ ] 7.3 Revisar con responsables de auth, contenido/audio y Homido los cambios justificados en sus módulos; documentar aprobaciones realmente recibidas.
- [ ] 7.4 Documentar límites MVP y pendientes posteriores sin omitir controles obligatorios; no cerrar seguridad, persistencia, integridad o regresión por diferir mejoras visuales.
- [ ] 7.5 Presentar diff y evidencia al usuario; esperar autorización antes de integración o archivo OpenSpec. No marcar S4 terminado con pendientes obligatorios sin resolver.

## 8. Mejoras posteriores al MVP

- [ ] 8.6 Alojamiento independiente pospuesto por el usuario (antes 6.3a). Evaluar servidor estático/alias independiente y pruebas de caída completa únicamente con autorización posterior; mientras tanto conservar API principal y respaldo estático versionado actual sin prometer resiliencia nueva.

- [ ] 8.1 Incorporar selección de portadas originales solo con activos, procedencia, permisos y aprobación; conservar distinción accesible. Upload libre queda fuera de alcance.
- [ ] 8.2 Incorporar footer responsive en `App.vue` después de recibir logos oficiales y aprobación; probar teclado, 360 px y 200 %, sin afectar estantería/Homido.
- [ ] 8.3 Mejorar comparación visual de conflictos; MVP ya debe conservar la edición rechazada y explicar recuperación.
- [ ] 8.4 Automatizar copia externa de backups después de aprobar destino; MVP exige procedimiento manual y prueba de restauración, no omitir respaldo externo operativo.
- [ ] 8.5 Habilitar edición coordinada de historia/audio con responsable y recursos aprobados; hasta entonces MVP rechaza el cambio inconsistente y preserva metadatos.

No se incluyen por defecto service worker, actualización en tiempo real ni administración web de cuentas; requerirían alcance y aprobación adicionales.
