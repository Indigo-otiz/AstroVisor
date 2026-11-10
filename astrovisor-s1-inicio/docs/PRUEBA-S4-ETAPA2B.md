# S4 — Etapa 2B: escritura documental y respaldos privados

Rama `indigo/s4-persistencia-documental`, base verificada `3bf81dd03e320b6207d6b053f5ee2862cd325371`. El usuario autorizó publicar Etapa 2B con la corrección tras revisión final sin bloqueantes. Este informe acompaña el commit `feat(s4): implementar escritura documental y recuperacion segura`; la comprobación del SHA local/remoto se informa en la entrega. No se autoriza merge, archivo OpenSpec ni Etapa 3. No se creó runtime ni cuenta administrativa de ejecución normal. Los tests utilizan archivos y credenciales aleatorios bajo `os.tmpdir()` y eliminan sus propios directorios.

## Revisión previa a publicación autorizada

Se verificaron rama/HEAD local y remoto esperados; `main` local/remoto se registró en `f1058c9b10641c470d7d3e331a81f327af78fc8c`. Se repitieron las cuatro validaciones: backend 87/87 (incluidas ocho regresiones de restauración), web 98/98, build correcto con 89 módulos y OpenSpec estricto válido. No se identificaron nuevos bloqueantes en esta revisión local. El código funcional no se modificó en esta publicación.

La restauración no confirmada rechaza; la confirmada devuelve revisión persistida, con limpieza pendiente separada si ocurre EACCES posterior. CLI 0/1/2 y procedimiento offline documentados; el bloqueo conservado no se fuerza ni se elimina por timeout. Las escrituras responden tras rename; la comparación de revisión permanece dentro del lock/cola.

Selección explícita de 14 archivos S4: cuatro fuentes backend, cuatro pruebas backend, CLI, este informe y cuatro documentos OpenSpec. Sin cambios a `.gitignore`, credenciales, runtime, backups, locks, temporales, presentaciones ni informe mixto preexistente. Tareas 3.1–3.4 y 4.1–4.4 completas; 3.5 permanece pendiente de copia externa operativa. Los límites operativos se conservan abajo; esta publicación no equivale a validación institucional.

La comprobación auxiliar del índice encontró EPERM al lanzar Git desde Node dentro del sandbox; repetida con subprocesos habilitados verificó selección exacta de 14 archivos y cero coincidencias en los patrones de secretos revisados. Esa búsqueda complementa la revisión manual; no demuestra ausencia de cualquier secreto posible.

## Corrección autorizada del bloqueante

Corrección implementada y validada localmente sobre la base publicada indicada arriba; publicación autorizada posteriormente. No merge ni archivo. La auditoría previa permanece abajo como evidencia histórica, no como descripción del comportamiento corregido.

**Causa raíz:** una excepción en `await bloqueo.liberar()` del finally sustituía el retorno ya preparado después de rename y también podía sustituir un error previo de la operación. El catálogo restaurado podía tener revisión 3 mientras el llamador recibía EACCES como si no hubiera confirmación.

**Corrección:** restauración conserva por separado el resultado confirmado y el error operativo. Después intenta liberar una sola vez el bloqueo adquirido, sin omitir comprobaciones de archivo/nonce ni forzar su retirada. Un fallo de esa liberación añade estado de limpieza; no altera si rename confirmó ni reemplaza el error primario. No se introduce reintento de restauración.

El retorno confirmado conserva `catalogo` y `durabilidadPendiente`, y añade `confirmada: true`, `revisionPersistida`, `limpiezaPendiente` y `codigoLimpieza` (null o código de IO permitido). Un error anterior a la confirmación sigue rechazando con status 400/503, `confirmada: false`, `revisionPersistida: null` y los mismos campos de limpieza; conserva un código operativo permitido, o `ERROR_OPERATIVO` genérico. No se exponen mensajes crudos de filesystem, rutas ni contenido del documento. `limpiezaPendiente` se refiere a la liberación de esta operación, no afirma que no existan locks de otro propietario.

| Resultado del comando restaurar | Estado y salida |
|---|---|
| Confirmada, limpieza completada | Confirma revisión; salida 0. Puede seguir existiendo aviso de durabilidad de directorio |
| Confirmada, falla liberar lock | Confirma revisión; salida 2. Indica que YA se restauró, NO repetir automáticamente y que el bloqueo pendiente puede impedir nuevas escrituras |
| No confirmada | Error operativo visible; salida 1 |
| No confirmada y falla liberar lock | Salida 1; error de operación y código de limpieza separados. No oculta ninguno |

Ejemplo realmente comprobado tras la corrección: `confirmada: true`, `revisionPersistida: 3`, `limpiezaPendiente: true`, `codigoLimpieza: EACCES`; el documento conserva revisión y metadatos restaurados, `escritor.lock` permanece y otro escritor recibe 503. El intento de retirada durante la vida del propietario se rechaza sin intentar unlink de ese lock. Un proceso nuevo puede leer el documento restaurado. Recuperar la capacidad de escribir exige resolver el bloqueo conforme al procedimiento offline; la corrección no lo elimina automáticamente.

**Operaciones anteriores a confirmar:** argumentos, comprobación de ruta privada, adquisición de control/lock, lectura/validación del backup/hash/recursos, listado de revisiones, lectura del activo, respaldo del activo válido, conservación de evidencia, asignación/validación de revisión, apertura/escritura/sync/cierre del temporal y rename. Si no se confirma, se conserva el rechazo y se comunica por separado cualquier fallo de liberación de un lock adquirido.

**Operaciones posteriores:** sincronización del directorio (su fallo mantiene aviso de durabilidad), comprobación de archivo/nonce y retirada del lock (su fallo mantiene aviso de limpieza), y comunicación por CLI. Un fallo de limpieza no revierte el archivo ya publicado ni autoriza repetir automáticamente la restauración.

**Escrituras HTTP normales:** `guardar()` ya confirma tras rename y convierte fallos posteriores de sync/poda en avisos; mantiene el lock por vida del escritor. `cerrar()` es una operación posterior independiente y su fallo no sustituye un resultado de guardado ya devuelto. No se modificaron guardar/cerrar, autorización, ETag, retención ni mecanismos de persistencia. Si cerrar falla al liberar, sigue siendo necesaria intervención offline; no se añadió reintento automático ni cambios fuera del bloqueo corregido.

**Pruebas:** nuevo `backend/test/restauracion.test.js`, ocho casos que se ejecutaron antes de implementar y fallaron; después pasaron 8/8. Incluyen normal, EACCES al liberar después de rename real, EIO antes de reemplazo, EIO + EACCES simultáneos, fallo de sync posterior y CLI para confirmada con limpieza/no confirmada/ambos errores. Verifican una sola confirmación, revisión/metadata/recursos, bloqueo conservado, protección de propietario vivo, lectura desde proceso nuevo y ausencia de rutas/mensajes sensibles en stdout/stderr. Se utilizan procesos nativos Node con `--experimental-test-module-mocks` solo para inyectar fallos; no se añadieron dependencias ni flags al arranque real. La herramienta emite avisos experimental/deprecación en los hijos de prueba, capturados; su disponibilidad es una limitación del entorno de tests Node 24, no un requisito nuevo de producción.

Validación integral de esta corrección: backend 87/87, web 98/98, build correcto con 89 módulos y OpenSpec estricto válido. Revisión independiente: 8/8 en la suite nueva y sin nuevos bloqueantes reproducibles. Tarea 3.4 completada tras esta regresión; 3.5 permanece pendiente por falta de copia externa operativa real.

Archivos tocados por esta corrección: `backend/src/services/documentWriter.js`, `scripts/recuperar-catalogo.mjs`, nuevo `backend/test/restauracion.test.js`, este informe y las notas de estado de proposal/design/spec/tasks S4. Se incluyen con los archivos previos de 2B en la selección autorizada; ninguna cuenta institucional ni runtime real fue creado/modificado.

No se han verificado apagado físico, ACL/volumen de despliegue, copia externa real, navegador, móvil, teclado, TTY real ni Homido físico. Se conservan las limitaciones de NTFS/EPERM de directorio y recuperación offline de control.lock; esta corrección no amplía esas garantías.

## Auditoría previa: publicación detenida por el bloqueante

El usuario autorizó publicación condicionada a no identificar bloqueantes y ordenó detenerse si aparece un problema de recuperación o persistencia confirmada. Se comprobó la rama y el HEAD esperado; no se prepararon archivos para commit ni se ejecutaron commit/push. No se modificó código funcional durante esta auditoría.

**Bloqueante reproducido:** `restaurarCatalogo()` retorna el resultado después de rename, pero su `finally` espera `bloqueo.liberar()`. Si esa liberación falla, la promesa rechaza aunque la restauración ya se publicó. La prueba aislada inyectó EACCES únicamente al retirar `escritor.lock` después del rename real y obtuvo:

```json
{"restauracion":"rechazada:EACCES","renameConfirmado":true,"revisionPersistida":3,"bloqueoRetenido":true}
```

Se usó un proceso por stdin con `node --experimental-test-module-mocks --input-type=module` y mock nativo de `node:fs/promises`; sin dependencias nuevas ni cambio de fuentes. El runtime de diagnóstico fue temporal y se eliminó al terminar. Node emitió avisos experimental/deprecación de esa herramienta de diagnóstico; no forma parte del arranque de aplicación. Este camino no estaba cubierto por las 79 pruebas existentes.

**Corrección requerida en esa auditoría, ahora implementada en la revisión descrita arriba:** separar el resultado confirmado por rename de la limpieza posterior en restauración. Un fallo de liberación posterior debe comunicar restauración confirmada con bloqueo pendiente de resolver, y el CLI debe distinguir ese aviso de un fallo previo a persistir. Conservar el bloqueo y el procedimiento offline; no retirar un bloqueo de proceso vivo ni ocultar un error anterior al punto de confirmación. En ese momento la recuperación se reabrió en la tarea 3.4.

Validaciones repetidas en esta auditoría: `npm test` 79/79; `npm run test:web` 98/98; `npm run build` correcto (89 módulos); OpenSpec estricto válido. Estos resultados no invalidan el hallazgo de la prueba de fallo adicional.

Al registrar la nota de auditoría, OpenSpec estricto advirtió texto introductorio dentro de ADDED Requirements; se movió la nota fuera del bloque de deltas y se repitió la validación.

Además se ejecutó el flujo HTTP aislado solicitado, con credenciales aleatorias y tres arranques de procesos API temporales: GET/ETag revisión 1, PATCH de resumen autorizado, lectura pública actualizada, cierre/reinicio con persistencia, rechazo 412 de If-Match antiguo, cierre/restauración normal desde respaldo a revisión 3 y nuevo arranque. GET administrativo/público confirmó el resumen original restaurado; libros y recorridos completos coincidieron con la instantánea inicial. Este flujo normal pasó; el bloqueo se refiere al fallo posterior de liberación.

Las limitaciones de EPERM de directorio, durabilidad real, intervención offline de control.lock, copia externa pendiente, portada estática y 403 reservado siguen descritas abajo y no se declaran resueltas mediante infraestructura nueva. No se verificaron despliegue institucional, hardware ni pruebas de navegador/dispositivos.

## Implementación y decisiones acotadas

- `documentRepository.js` conserva inicialización exclusiva, lectura y proyecciones; exporta las operaciones del nuevo `documentWriter.js`.
- El ejecutable Express adquiere `escritor.lock` antes de escuchar. El lock persiste durante la vida del escritor e identifica PID, host y nonce. Otra instancia falla cerrada. Los consumidores que importan `crearApp()` deben llamar `app.locals.iniciarEscritor()` antes de escuchar y `cerrarEscritor()` al cerrar; la primera escritura también exige adquirirlo. Las pruebas HTTP iniciales usan adquisición diferida a esa primera escritura; el proceso nuevo del ensayo de reinicio adquiere antes de escuchar. Todas cierran el escritor explícitamente.
- `control.lock` serializa la creación del bloqueo y su retirada por recuperación. Si el proceso se interrumpe durante esa sección breve, se requiere intervención manual offline; no hay retiro automático por edad. Ninguna de las dos exclusiones se basa en datos del cliente.
- Una cola por escritor abarca lectura/validación, comparación de revisión, cambios sobre copia, validación completa, backup y reemplazo. Dos editores con la misma revisión producen un guardado y un 412. Se conservan campos desconocidos, IDs, vínculos, recursos, MARC y etiqueta demo; se añaden fecha de modificación e ID del administrador al nivel global.
- Cada respaldo es un JSON privado `{sha256, catalogo}`, creado exclusivamente, sincronizado, cerrado y validado antes de reemplazar el catálogo. El hash comprueba integridad de la copia, no firma/autenticidad frente a un operador con permisos de escritura.
- El catálogo siguiente se escribe completo en un temporal del mismo directorio, con `FileHandle.sync()` y cierre antes de `rename`. No se borra el destino para facilitar el reemplazo. Windows reintenta EPERM/EACCES/EBUSY un máximo de seis intentos, con esperas de 50/100/200/400/800 ms (1,55 s total). Un fallo persistente devuelve 503 y conserva el catálogo anterior.
- `rename` exitoso es el punto de confirmación. Un problema posterior de sincronización de directorio o poda devuelve guardado confirmado con `durabilidadPendiente`/`retencionPendiente`; no simula una reversión. La poda conserva hasta 20 respaldos válidos y ocurre solo tras confirmar. Si hay copias corruptas o fallos de poda, se conservan para revisión; un guardado fallido puede dejar más de 20 copias, sin eliminarlas para cumplir el número.
- **Ruling: alta con portada estática preexistente.** POST exige `/libros-demo/<id>.svg` regular y existente. No acepta una ruta arbitraria ni la portada de otro ID. Si falta, responde 409 y comunica la dependencia de generación dinámica. La prueba de alta usa un catálogo temporal que omite un libro original y luego lo crea con su SVG existente; no se creó una imagen ni se publicó un libro nuevo real. La revisión de correspondencia visual/procedencia de futuros activos es operativa, no automática.
- **Ruling: relaciones mediante upsert.** `relaciones` de libro y `libroRefs` de recorrido agregan o actualizan motivos; omitir un vínculo no lo borra. Así se conservan los nueve vínculos iniciales y los metadatos `referencia`, sin implementar DELETE.
- No se cambió autenticación. El test histórico que esperaba 404 para POST de libros ahora comprueba una ruta desconocida; POST de libros pasa a estar autorizado en esta etapa.

## API y campos editables

Todos los endpoints siguientes ejecutan `verificarAdmin`. GET devuelve la instantánea y `ETag: "catalogo-N"`. Las escrituras exigen ese valor exacto en `If-Match`; no se aceptan wildcard, ETag débil ni listas.

| Ruta | Éxito | Campos |
|---|---|---|
| `GET /api/admin/catalogo` | 200, instantánea y ETag | Solo lectura |
| `POST /api/admin/libros` | 201 y nuevo ETag | `id`, `titulo`, `autor`, `anio` opcional, `enlacePublico`, `tema` opcional, `portadaIlustrativa`, `relaciones` |
| `PATCH /api/admin/libros/:id` | 200 y nuevo ETag | `titulo`, `autor`, `anio`, `enlacePublico`, `tema`, `relaciones` |
| `PATCH /api/admin/recorridos/:id` | 200 y nuevo ETag | `titulo`, `resumen`, `historia`, `comoReconocerla`, `libroRefs` |

`relaciones = [{constelacionId, motivo}]`; `libroRefs = [{libroId, motivo}]`. POST requiere al menos una relación válida y los campos bibliográficos obligatorios. Genera `demostracion: true` y MARC explícitamente demo (`DEMO-<id>`, `DEMO`, ubicación/signatura null), sin aceptar datos institucionales inventados del cliente. PATCH no permite IDs, revisión, MARC, demostración, portada, multimedia, permisos, autorías ni metadatos desconocidos como campos editables.

Límites de esquema vigentes: título/autor 200, resumen/motivo 1000, historia/reconocimiento 12000, URL HTTPS sin credenciales 2048, ID slug 100 y cuerpo HTTP 64 KiB. `tema` debe ser color hexadecimal de seis dígitos. Se rechazan HTML y claves peligrosas también en estructuras anidadas; el recorrido iterativo limita profundidad de entrada a 32, por encima de la estructura permitida de relaciones. No se consultan URLs bibliográficas desde el servidor. Una historia distinta con audio se rechaza con 409; enviar la misma historia no modifica el audio.

Estados: 400 cuerpo/campos/referencias/If-Match inválidos; 401 sin sesión válida; 404 recurso o ruta desconocidos; 409 ID/URL/relación duplicados, conflicto de audio o portada aún no disponible; 412 revisión obsoleta; 428 falta If-Match; 503 lectura, lock, backup o escritura no disponibles. El parser conserva 413 para cuerpos superiores a 64 KiB. **403 está reservado:** la configuración 2A solo emite sesiones para una cuenta con permiso completo; no se añadió un rol limitado ni se inventó una prueba de ese rol.

Éxito de escritura devuelve `{ok, revision, durabilidadPendiente, retencionPendiente, respaldoPublico:"pendiente"}`. Este último campo informa que el respaldo estático Homido no se sincroniza en 2B. GET y errores no incluyen rutas privadas, respaldos ni configuración de cuentas. Las lecturas públicas conservan su contrato y reflejan el runtime; la estantería compilada y el fallback Homido siguen en su revisión estática previa.

## Recuperación local con API detenida

1. Detener todas las instancias API y el supervisor que pudiera reiniciarlas. Conservar el directorio privado completo; anotar la última revisión conocida, revisar ACL y trabajar como responsable del almacén. No ejecutar `init:catalogo` para reparar corrupción.
2. Si existe `escritor.lock`, inspeccionar PID/host. `node scripts/recuperar-catalogo.mjs retirar-bloqueo` solo lo retira cuando el host coincide y `process.kill(pid, 0)` confirma ESRCH. PID vivo/reutilizado, EPERM, otro host o lock inválido se rechazan. No usar timeout ni eliminar a ciegas.
3. Si queda `control.lock`, el comando anterior también falla cerrado. No hay borrado automático de ese archivo. El operador debe detener todos los procesos involucrados, verificar que no hay propietario vivo en ese host, conservar el archivo como evidencia y resolverlo manualmente en el directorio privado antes de reintentar. Un control ilegible exige investigación; no autoriza adivinar su propietario.
4. Elegir un basename existente `catalogo-rN-<uuid>.json` de `backups/`; no se admiten rutas ni `..`. Con `ASTROVISOR_DATA_DIR` configurado, ejecutar:

```powershell
node scripts/recuperar-catalogo.mjs restaurar catalogo-rN-UUID.json ULTIMA_REVISION_CONOCIDA
```

Los nombres anteriores son marcadores, no un comando listo para copiar. Sustituir por el archivo real y un entero conocido. El comando adquiere el lock, comprueba hash/esquema/relaciones/recursos, preserva el catálogo existente como `evidencia-<uuid>.json` y, si todavía es válido, también lo respalda. Restaura por temporal y rename con una revisión superior al actual legible, a la última indicada y al límite deducible de los backups. Con catálogo corrupto se conserva evidencia; no se publica como backup válido. Si el archivo activo está ausente, solo este procedimiento explícito permite recuperarlo desde un backup validado: no consulta ni copia la semilla. Permisos insuficientes, enlaces y respaldo inválido siguen rechazados.

5. Reiniciar la API, reautenticar y comprobar GET administrativo/ETag y las dos API públicas; no reusar una edición con ETag anterior. Si hay un aviso de durabilidad, verificar el volumen antes del uso real. Los temporales de una interrupción se conservan como evidencia privada; no son entradas de restauración.
6. Antes de una intervención real, copiar el backup validado a un destino privado externo autorizado, comparar los hashes SHA-256 de ambos archivos y ensayar restauración en otro volumen/directorio aislado. Mantener la configuración de cuentas separada: no copiarla con exportaciones de contenido. **Destino/copia externa reales no configurados ni ejecutados** en esta entrega; no hay conexión a servicios ni protección frente a pérdida del disco demostrada.

## Atomicidad, durabilidad y entorno observado

Windows; Node v24.21.0, npm 11.0.0. El volumen C: de temporales se identificó como **NTFS** mediante `System.IO.DriveInfo.DriveFormat`. `Get-Volume` fue rechazado por permisos; se utilizó esa alternativa de solo lectura.

La exclusión usa creación `wx` y depende de un filesystem local de un solo host con permisos privados; no se afirma compatibilidad con NFS/SMB ni coordinación multihost. Node advierte que la exclusión puede no funcionar en filesystems de red. `sync()` sincroniza el archivo según la implementación del SO/dispositivo; no demuestra resistencia a todo corte eléctrico. Referencia de APIs y límites: [Node FS](https://nodejs.org/docs/latest-v24.x/api/fs.html#filehandlesync), [flags exclusivos](https://nodejs.org/docs/latest-v24.x/api/fs.html#file-system-flags).

Se probaron procesos interrumpidos inmediatamente antes y después de rename: se leyó una revisión completa anterior o nueva. No se ensayaron apagado físico, extracción de disco, disco realmente lleno, ACL de producción, fallo de hardware ni filesystem de despliegue. Los fallos ENOSPC/EACCES/EIO se inyectan en operaciones de filesystem sobre temporales. No hay fallback de borrar destino/copiar sobre él. Windows no permite confirmar aquí sincronización del directorio por esta API; el resultado lo declara mediante `durabilidadPendiente`.

## Evidencia y validación final

Las pruebas nuevas fallaron inicialmente por ausencia del escritor y de las rutas. Hubo un atasco inicial de la prueba de procesos porque un import inexistente terminó el hijo sin salida stdout; se detuvieron solo los dos procesos de prueba identificados y se añadió comprobación previa/timeout. Se corrigió también el orden de cierre antes de borrar fixtures y una conversión de URL a ruta Windows en la prueba CLI. El único fixture huérfano de esa interrupción se eliminó tras verificar ruta dentro de Temp, contenido único y SHA-256 idéntico a la semilla.

Se observaron EPERM intermitentes al reemplazar archivos temporales en Windows: cinco y luego seis diagnósticos aislados de reemplazo fueron correctos; ejecuciones conjuntas mostraron errores. No se identificó qué proceso/condición originó cada EPERM. Se añadieron reintentos acotados. Una ejecución completa posterior fue 70/71: el guardado confirmó, pero la prueba exigía exactamente dos intentos y observó seis; se corrigió la aserción para aceptar los reintentos del filesystem dentro del límite, manteniendo prueba separada de fallo persistente con 503 y datos intactos.

La revisión independiente reprodujo un falso 503 después de rename por limpieza del nombre ya movido; una regresión observó el fallo y después pasó tras corregirlo. También se cerró la carrera entre crear/retirar locks mediante `control.lock`. La revisión posterior no encontró otros fallos importantes reproducibles; no equivale a auditoría del despliegue.

La comprobación adicional de un cuerpo JSON con 8000 niveles, dentro de 64 KiB, observó un 503 por recursión en validación de entrada. Se sustituyó ese recorrido por una pila con profundidad limitada y se mantuvo el caso como regresión de rechazo 400, sin avanzar revisión.

Validación final ejecutada por separado, sin navegador ni hardware:

| Comando | Resultado |
|---|---|
| `npm test` | 79/79, salida 0 |
| `npm run test:web` | 98/98, salida 0 |
| `npm run build` | Salida 0, 89 módulos |
| `openspec validate s4-persistencia-documental --strict` | Válido, salida 0 |

Revisión de 38 archivos de `frontend/dist`: ninguna coincidencia con nombres runtime/credenciales/locks/backups ni variables privadas del backend. Git no muestra cambios en frontend, contenido/semilla, SVG, módulos Homido ni fuentes de autenticación 2A. Estas comprobaciones no reemplazan una revisión de configuración del servidor desplegado.

Cobertura real: lectura posterior y API pública desde otro proceso tras detener el servidor HTTP anterior; ausencia de sesión; ETag; dos editores/procesos; duplicados; esquema/prototipos/URLs; audio; fallos de backup/escritura parcial/sync/rename; retención solo tras éxito; corrupción/hash manipulado; restauración de catálogo válido/corrupto/ausente; bloqueos; metadatos y hashes SVG. El test de mirada pasó en la ejecución web de esta etapa; no se modificó ni se repitió su diagnóstico histórico.

## Inventario y límites de alcance

- Modificados: `backend/src/index.js`, `backend/src/services/documentRepository.js`, `backend/test/auth.test.js`.
- Nuevos: `backend/src/services/documentWriter.js`, `backend/src/services/catalogoEdicion.js`, `backend/test/documentWriter.test.js`, `backend/test/documentAdmin.test.js`, `backend/test/restauracion.test.js`, `scripts/recuperar-catalogo.mjs`, este informe.
- Documentación OpenSpec S4: estado de `proposal.md`, decisiones de ejecución en `design.md`, escenarios en `specs/gestion-documental/spec.md` y tareas completadas de secciones 3/4 en `tasks.md`.
- Intactos: frontend, lector estático, SVG, módulos Homido, auth 2A funcional, semilla y respaldos públicos. No se cambiaron reglas de `.gitignore`; archivos privados y ajenos excluidos del commit.
- Archivos locales ajenos preservados: `.gitignore` preexistente, `.presentacion-build/`, guion, presentaciones/PDF locales e informe mixto `docs/VALIDACION-PR6-S4.md`.

Pendientes de otras etapas: formularios, migración del lector estático, portadas dinámicas, sincronización/exportación Homido, footer y logos. Pendientes operativos: volumen/ACL/HTTPS/proxy reales, copia externa y restauración fuera del disco de trabajo. No se ejecutaron TTY real, navegador, móvil, teclado ni Homido físico.
