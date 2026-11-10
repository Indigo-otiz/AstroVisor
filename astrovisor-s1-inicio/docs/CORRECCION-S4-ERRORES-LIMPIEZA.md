# S4 — Corrección focalizada del enmascaramiento por limpieza

Fecha: 9 de noviembre de 2026, America/Chihuahua (ejecución local Windows).
Rama: `indigo/s4-persistencia-documental`.
HEAD al iniciar: `358f8979c30c28b6f35578b7e5f4c227325b289f`.
Base `main` local comprobada: `f1058c9b10641c470d7d3e331a81f327af78fc8c`.
Entorno: Node 24.21.0, npm 11.0.0; build con Vite 6.4.5.

## Alcance y defecto comprobado

Corrección autorizada del manejo de excepciones en el escritor existente, sin cambiar almacenamiento, revisión, exclusión, contratos HTTP o confirmación. No se añaden funcionalidades ni dependencias. El informe histórico `INVESTIGACION-S4-ERROR-503.md` permanece sin modificaciones.

Antes de la corrección, una excepción EIO de `rename` atravesaba el `finally` de `sustituir()`. Si `unlink(temporal)` lanzaba EACCES, esa segunda excepción sustituía a EIO. `guardar()` la convertía en un 503 genérico sin causa y `restaurarCatalogo()` comunicaba EACCES como código operativo principal. No había confirmación del reemplazo.

Se comprobaron puntos equivalentes **dentro de documentWriter.js**: cierre y retirada en `escribirExclusivo()`, cierre en `sincronizarDirectorio()`, retirada de `control.lock` en `conControl()` y liberación al fallar la apertura del escritor. Se añadieron regresiones antes de modificar esos puntos. No se extiende el cambio al inicializador, exportador, sistema de imágenes o consumidores.

## Prueba roja anterior a modificar producción

Ensayos con inyección de IO, catálogo inicializado expresamente y directorios individuales bajo el directorio temporal del sistema; sin fallos físicos del disco ni datos institucionales.

| Comando desde backend | Resultado antes de corregir |
| --- | --- |
| `node --test --test-name-pattern='error original' test/documentWriter.test.js` | 0/6: los seis rechazos 503 no conservaban `cause` |
| `node --test --test-name-pattern='restauración temporal' test/restauracion.test.js` | 0/2: `EACCES !== EIO`, reproducción directa del enmascaramiento |
| `node --test --test-name-pattern='error original conserva prioridad' test/documentWriter.test.js` | 0/4: causa ausente; en apertura la limpieza sustituía además al 503 normalizado |

La primera tentativa sin permisos ampliados no alcanzó los tests: el sandbox rechazó `spawn` con EPERM. Se repitió con permiso para procesos hijos y temporales; ese rechazo del arnés no es un fallo de persistencia del producto.

Las seis primeras pruebas verificaron, antes de la aserción roja de diagnóstico, catálogo sin cambios, respaldo verificable, temporales presentes cuando fallaba su retirada y ausencia de reintentos de EIO. Después se reforzaron para partir de una revisión ya guardada y comprobar también un respaldo preexistente byte por byte.

## Corrección mínima aplicada

- El error de operación se conserva y se vuelve a lanzar después de intentar la limpieza.
- Los errores secundarios se añaden a `erroresLimpieza`, una propiedad interna no enumerable del error original. Se conservan las excepciones, su orden y su código; no se escriben nuevos logs con mensajes o rutas privadas.
- `noDisponible(cause)` utiliza la propiedad nativa no enumerable `Error.cause`. `guardar()`, la apertura, la retirada de bloqueo abandonado y la restauración conservan así el diagnóstico al normalizar a 503.
- `escribirExclusivo()` intenta retirar el archivo también cuando falla el cierre posterior al error inicial. Si fallan varias limpiezas, conserva cada incidencia. Un cierre fallido no se presenta como cierre completado.
- Si no hay una excepción previa que preservar, el error de limpieza sigue propagándose. `sustituir()` mantiene la tolerancia existente a ENOENT del temporal y no intenta borrarlo después de que `rename` lo haya publicado.
- Los avisos ya existentes tras la confirmación siguen siendo avisos: sincronización/poda no convierten un guardado confirmado en un guardado fallido. La restauración confirmada con liberación pendiente mantiene `confirmada`, `revisionPersistida`, `limpiezaPendiente` y `codigoLimpieza`.

No se modifica la firma pública del escritor o restaurador, los códigos HTTP, la CLI ni sus salidas 0/1/2. `erroresLimpieza` es diagnóstico interno, no un nuevo campo público. En errores de restauración, `limpiezaPendiente/codigoLimpieza` siguen describiendo la liberación del bloqueo; los errores del temporal permanecen diferenciados en `cause.erroresLimpieza`.

No se añaden reintentos de guardado/restauración. El algoritmo Windows conserva sus seis intentos máximos y esperas originales únicamente para EPERM/EACCES/EBUSY de rename. EIO se rechaza sin reintentar. No se elimina un bloqueo activo para resolver una limpieza fallida.

## Prueba verde e integridad

La selección combinada de las doce regresiones nuevas de escritor/restauración pasó **12/12** después de corregir (683.2155 ms). La regresión de tres archivos, incluyendo HTTP y casos existentes, pasó **54/54** (7920.6623 ms).

| Escenario | Evidencia comprobada |
| --- | --- |
| EIO de rename + EACCES al retirar temporal | 503 con `cause` idéntica al error EIO; EACCES secundario separado; temporal presente; un intento, sin confirmación |
| EIO con limpieza correcta | Causa EIO conservada, sin incidencias secundarias ni temporal pendiente |
| EIO de writeFile/sync + retirada fallida | EIO conserva prioridad; ambas tentativas fallidas de retirada quedan registradas, sin ocultarlas ni afirmar retirada completa |
| EIO + error de close, directorio, control o apertura | Error original conservado; EACCES distinguible; catálogo anterior intacto; locks cuya retirada falla siguen presentes |
| Respaldo anterior y revisión | Guardado previo real a revisión 2; intento fallido mantiene bytes del catálogo y backup previo; backup de revisión vigente conserva catálogo y SHA-256 válidos |
| Restauración previa al reemplazo | `confirmada=false`, `revisionPersistida=null`, código EIO, catálogo a revisión 2, backup preexistente intacto |
| Restauración fallida + temporal y bloqueo pendientes | Causa EIO y EACCES del temporal separados de los campos de liberación; lock conservado y recuperación contra propietario vivo rechazada |
| Restauración confirmada + liberación fallida | Revisión 3 persistida, metadatos conservados y lectura desde proceso nuevo; no se repite la restauración; CLI salida 2 con aviso explícito |
| Escritura confirmada + mantenimiento fallido | Revisión 2 leída del almacenamiento; avisos de durabilidad/retención; sin falso rechazo de sustitución |
| Conflicto 412 y concurrencia | Un solo ganador con revisión igual; exclusión de segundo escritor y de procesos competidores, en pruebas existentes |
| EPERM transitorio | Regresión Windows existente pasa sin cambiar aserciones, esperas ni número de reintentos |
| HTTP POST con EIO y limpieza EACCES | Un intento de rename; 503 con únicamente el mensaje público genérico; sin ETag de catálogo confirmado, revisión anterior intacta |

El ensayo HTTP usa credenciales sintéticas temporales y el escritor real con IO inyectado, conectado mediante `app.locals.iniciarEscritor`; no añade opciones de fallo al servidor de producción. La comparación exacta del cuerpo comprueba que no se publican `cause`, errores secundarios, rutas o mensajes privados. No se añaden logs de diagnóstico ni cabeceras internas.

Los temporales y bloqueos pendientes se comprueban **antes** de la limpieza del entorno de prueba. Después se cierra el escritor o termina el hijo y se retira exclusivamente su directorio aislado. Esa retirada de fixtures no es un procedimiento para borrar un bloqueo de producción. Si falla la limpieza real, corresponde inspección operativa con la API detenida y verificación del propietario; no repetir automáticamente una operación confirmada.

## Validaciones generales y repeticiones reales

Comandos ejecutados desde la raíz de la aplicación, de forma sucesiva, sin ejecutar backend y frontend simultáneamente:

| Comando | Resultado |
| --- | --- |
| `npm test` | Dos ejecuciones 132/132, 0 fallos/omitidas/canceladas; salida 0; 10505.0335 ms y 9036.1671 ms |
| `npm run test:web` | 143/143, 0 fallos/omitidas/canceladas; salida 0; 2360.1148 ms |
| `npm run build` | Salida 0; 51 módulos; 984 ms |
| `openspec validate s4-persistencia-documental --strict` | Cambio válido; salida 0 |

Después de la primera suite se añadió únicamente una aserción/contador de intentos en restauración: `node --test test/restauracion.test.js` pasó **10/10** (3365.3828 ms). Confirma un solo intento de rename para cada EIO inyectado. Se repitió además `npm test` completo sobre el estado final: **132/132**, 9036.1671 ms. No hubo cambios funcionales después de las validaciones; no se repitieron frontend ni build por ese refuerzo exclusivo del test.

No hubo fallos espontáneos 503 ni fallos de mirada en estas ejecuciones. Los fallos rojos intencionales y el EPERM de spawn del sandbox se distinguen de las validaciones verdes; no se modificaron pruebas temporizadas ni el arnés Chrome.

## Inventario exacto de esta corrección

1. `backend/src/services/documentWriter.js`: prioridad de errores, registro interno de limpieza y conservación de cause.
2. `backend/test/documentWriter.test.js`: diez regresiones parametrizadas de diagnóstico e integridad, usando almacenamiento aislado.
3. `backend/test/restauracion.test.js`: dos escenarios adicionales y comprobaciones de respaldo/causa/intentos; conserva escenarios y límites existentes.
4. `backend/test/documentAdmin.test.js`: regresión HTTP del error compuesto sin filtración ni reintento.
5. `docs/CORRECCION-S4-ERRORES-LIMPIEZA.md`: este informe local nuevo.

No se cambian OpenSpec ni sus tareas; no se declara Sprint 4 completo. No se cambian CSS, SVG, audio, mirada, UI ni dependencias. Los cambios preexistentes de `.gitignore`, indicadores Git de los tres SVG y documentos/presentaciones locales ajenos permanecen fuera de este inventario. `git diff --check` de los cuatro archivos de código/pruebas no mostró errores de whitespace; la línea vacía preexistente de `.gitignore` no se corrigió.

Al terminar la implementación inicial no se realizó commit, push, merge, rebase, archivo OpenSpec ni operación sobre PR #7. No había cambios preparados en el índice y las referencias locales HEAD/main conservaban los hashes indicados. No se comprobó nuevamente el estado remoto del PR durante aquella corrección. La auditoría posterior autorizada se registra a continuación.

## Riesgo residual y límites

**La causa de los 503 espontáneos históricos sigue sin verificarse.** La reproducción EIO/EACCES demuestra este defecto de diagnóstico; no demuestra que ocurriera en aquellos episodios. Esta corrección conserva información útil para un próximo fallo, pero no añade observabilidad permanente ni acredita que la intermitencia haya desaparecido.

Los errores internos pueden contener mensajes/rutas privados del sistema de archivos: deben inspeccionarse en un entorno autorizado y no volcarse completos a logs o respuestas. Las propiedades no enumerables y la respuesta HTTP selectiva comprobada no son una certificación exhaustiva de todos los consumidores futuros.

No se ejecutaron Linux, navegador, zoom nativo, dispositivos físicos ni ensayos de cortes eléctricos. No se acreditan durabilidad institucional, ACL desplegadas o respaldos externos. La corrección queda local, para revisión; no modifica la recomendación histórica de mantener pendientes las decisiones de integración y las incertidumbres de disponibilidad.

## Auditoría final autorizada y validación previa a publicar

Ejecutada el 9 de noviembre de 2026 en Windows, sobre el mismo HEAD de S4. Se comprobó PR #7 abierto, Draft, no fusionado, con origen `358f8979c30c28b6f35578b7e5f4c227325b289f` y destino `f1058c9b10641c470d7d3e331a81f327af78fc8c`. No se editó su descripción ni estado.

Se revisó el diff completo de los cuatro archivos de código/pruebas y este informe: no contiene credenciales reales, catálogos de ejecución, respaldos, bloqueos o temporales. Las identidades/contraseñas de ensayo se generan o configuran exclusivamente en fixtures privados temporales. Las rutas de inyección se construyen durante los tests, no se incorporan rutas personales al informe. La revisión incluyó los consumidores HTTP y CLI: seleccionan mensajes/códigos públicos, no serializan las causas internas. La búsqueda de marcadores complementó esa inspección; no se presenta como auditoría exhaustiva de secretos.

**Contraprueba roja/verde reproducida:** en un clon local temporal sin hardlinks se combinaron los dos archivos actuales de regresión con el escritor original de HEAD. La selección `error original|restauración temporal` falló **0/12**, salida 1, incluida la divergencia EACCES/EIO. Después se copió exclusivamente el escritor corregido al clon: la misma selección pasó **12/12**, salida 0, 882.6477 ms. No se revirtió el árbol de trabajo ni se modificaron aserciones, timeouts o reintentos. El clon reutilizó mediante junction las dependencias instaladas; no equivale a una instalación limpia nueva.

| Ejecución nueva | Resultado real |
| --- | --- |
| Tres archivos enfocados: escritor, restauración y HTTP | 54/54, salida 0; 7289.8688 ms |
| `npm test`, proceso independiente 1 | 132/132, salida 0; 9294.5674 ms |
| `npm test`, proceso independiente 2 | 132/132, salida 0; 9625.8641 ms |
| `npm run test:web`, primera ejecución | **142/143**, salida 1; 2528.0944 ms |
| Archivo aislado `frontend/test/gazeController.test.js` | 5/5, salida 0; 311.6793 ms |
| `npm run test:web`, repetición completa | 143/143, salida 0; 2331.8218 ms |
| `npm run build` | Salida 0; 51 módulos, 983 ms |
| `openspec validate s4-persistencia-documental --strict` | Cambio válido, salida 0 |

Cada suite se ejecutó después de terminar la anterior. Los dos backend son invocaciones independientes de npm/Node, no dos selecciones de una misma suite. Los registros completos se conservan en almacenamiento temporal local, fuera del repositorio y de los cinco archivos publicables.

**Fallo observado:** `GazeController avanza por las etapas 0%, 33%, 66% y confirma en 100%`, en `gazeController.test.js:34`, no encontró `33%` en `stagesVisited`. Su causa no se verificó; los pases aislado y completo posteriores muestran variación entre ejecuciones, no demuestran una causa ni una resolución. No se modificó el controlador, el test temporizado o el arnés Chrome. El fallo queda conservado, no sustituido por la repetición verde.

No apareció un 503 inesperado en las dos suites backend ni en la integración enfocada. Los 503 inyectados siguen siendo resultados esperados de rechazo no confirmado. Dos suites correctas **no resuelven ni explican** los 503 espontáneos históricos.

La auditoría no identificó un bloqueante del parche de enmascaramiento en las comprobaciones ejecutadas. La prioridad EIO, el diagnóstico secundario EACCES, el catálogo/revisión/backup, los temporales pendientes, los contratos de confirmación y las salidas CLI quedaron comprobados. El algoritmo Windows de reintentos no cambia; la regresión EPERM existente pasó. No se amplía esta conclusión a disponibilidad histórica ni preparación institucional.

El usuario autorizó publicar exclusivamente el inventario de cinco archivos si pasa esta auditoría. Se mantiene separada esa autorización de cualquier merge, Ready for Review, despliegue o cierre de S4. Este apartado registra la evidencia previa al commit; el hash resultante y la coincidencia remota se entregan después de la publicación, sin añadir otros documentos al commit.
