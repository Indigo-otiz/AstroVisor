# S4 Etapa 5E — Portabilidad de hashes de las portadas originales

## Auditoría final autorizada para publicación

Auditoría del 9 de noviembre de 2026 sobre el HEAD publicado `9762148568103f7d14f43555cfa2460ba031bac9`, confirmado tanto localmente como en origin. Rama `indigo/s4-persistencia-documental`; main local/remoto `f1058c9b10641c470d7d3e331a81f327af78fc8c`. Índice inicialmente vacío. El usuario autoriza commit/push exclusivamente de los cuatro archivos del inventario, condicionado a ausencia de bloqueantes; no autoriza merge, PR, rebase ni archivo OpenSpec. Los apartados de implementación siguientes conservan el historial anterior a esta auditoría.

### Resultados repetidos

| Validación de auditoría | Resultado real |
| --- | --- |
| npm test, proceso independiente1 | **119/119**, salida0, 9344.0727ms |
| npm test, proceso independiente2 | **119/119**, salida0, 8747.5974ms |
| npm run test:web | **143/143**, salida0, 2197.1839ms |
| npm run build | Salida0, Vite6.4.5,51 módulos,983ms |
| openspec validate s4-persistencia-documental --strict | Correcto, repetido tras la actualización documental |
| Checkout Windows true/false/input | Nueve combinaciones archivo/configuración correctas, rechazo de CRLF y de un byte alterado |
| Checkout nativo Linux autocrlf=true | Tres archivos correctos; rechazo de CRLF y del byte alterado |

Ambas suites backend incluyen los casos de seguridad HTTP, exportación/corrupción, portadas automáticas y PNG/JPEG, restauración y CLI ambos. Ningún fallo nuevo de mirada en la suite frontend. No se modificaron aserciones, timeouts, controlador ni arnés Chrome. Las suites completas siguen acreditadas exclusivamente en Windows. Linux Node24.21.0 ejecuta únicamente el bloque real de hashes en un archivo temporal, como se explica abajo; no se atribuye validación Linux al resto del sistema.

En los clones candidatos se repitió la instalación de la política **antes** del checkout, sin crear commits temporales. Windows usa el caso completo de catalogo.test.js filtrado y dependencias existentes mediante junctions; Linux clona y materializa nativamente dentro del contenedor node:24 existente, sin red. Cada prueba negativa comprobó salida1 **y presencia del SHA de los bytes alterados en el error**, no solo cualquier terminación fallida. Las reposiciones vuelven a pasar. Los clones se eliminaron después de validar su pertenencia al TEMP del ensayo.

Se volvieron a comparar los tres Buffer físicos con los blobs de HEAD y main: igualdad exacta; tamaños1475/1483/1484, once LF y cero CR en cada SVG, y los SHA-256 LF de la tabla siguiente. `.gitattributes` está en `astrovisor-s1-inicio/`, por lo que sus patrones anclados `/frontend/...` resuelven respecto de esa carpeta, no respecto de la raíz Git padre. No existe regla global SVG. La prueba continúa usando readFile binario seguido de SHA-256/assert.equal, sin conversión de líneas ni dobles referencias.

### Investigación del fallo inicial118/119

- Nombre exacto: `CLI ambos: distingue intervención de limpieza de restauración no confirmada` (`backend/test/restauracion.test.js`, declaración en línea87).
- Salida disponible: `Error: Almacenamiento documental no disponible`, status503; origen documentWriter.js:127, que envuelve las operaciones respaldar/sustituir. **No se reportó un AssertionError ni un valor actual/esperado de una aserción**. No corresponde describirlo como una aserción SHA fallida.
- La prueba primero espera `entorno(t)` y luego ejecuta el hijo con fallos EIO/EACCES controlados. Espera salida1 de la CLI, mensaje de restauración no confirmada, mención EACCES, ausencia de datos privados y catálogo conservado en revisión2. El rechazo503 del proceso de prueba no es ese resultado controlado esperado.
- [Inferencia] La traza del escritor, junto con el único `escritor.guardar()` del archivo dentro de `entorno()`, sitúa el rechazo durante la preparación del respaldo/revisión2, antes del spawnSync y de las aserciones CLI. No se conserva el error IO interno que permita precisar la operación o su causa; el catch lo sustituye por503.
- Condiciones: Windows/NTFS, Node24.21.0; `npm test` ejecuta node --test con concurrencia predeterminada entre archivos. Cada entorno de restauración utiliza mkdtemp propio; el mock de EIO/EACCES vive en el proceso hijo, no en la preparación del padre. Las suites backend y frontend se lanzaron secuencialmente. No se midió actividad concurrente de procesos externos; no se atribuye el fallo a ella.
- Relación examinada con5E: solo cambian política de checkout de tres SVG, literales de una comprobación binaria y documentación. No cambian documentWriter/restauración, mocks, límites ni configuración de concurrencia. El catálogo valida la existencia de las portadas; respaldar/sustituir opera sobre JSON privados y no calcula los SHA literales de catalogo.test.js.
- Evidencia posterior:8/8 aislado y119/119 en la implementación; en esta auditoría, dos procesos completos nuevos119/119, incluyendo CLI ambos en304.7998ms y310.3432ms. No se reprodujo el fallo ni apareció evidencia de una regresión funcional vinculada a5E. Estas repeticiones **no prueban la causa ni lo declaran resuelto**.

Evaluación de publicación: no se identifica un bloqueante atribuible a esta corrección limitada, con dos suites independientes completas y regresiones de integridad positivas/negativas. Se conserva como incidencia abierta el fallo503 inicial de causa desconocida. Si vuelve a aparecer, se requiere capturar el error IO de forma controlada en un entorno aislado antes de proponer una corrección; no se amplía aquí el código de persistencia.

### Homido: revisión histórica y modificación documental legítima

Ensayo repetido en un almacén TEMP nuevo, sin credenciales ni datos institucionales. El IO inyectable simula exclusivamente los bytes CRLF anteriores de los tres recursos y exporta revisión1. Con los archivos actuales LF, la reexportación de1 falla con `Revisión existente distinta; no se sobrescribe` y confirmada=false. El puntero permanece byte a byte y todos los archivos del paquete histórico, incluido el manifiesto, conservan sus SHA.

En esta auditoría **no se incrementó manualmente la revisión**: se abrió el escritor normal, se suministró revisión1 y se aplicó editarCatalogo con tipo recorrido/id orion para cambiar solo el resumen a `Resumen de ensayo aislado 5E: revision nueva por edicion documental.`. El guardado confirmado generó revisión2, que se exportó y verificó con los recursos LF. Esta prueba sustituye como evidencia de flujo operativo al incremento manual usado exclusivamente en el primer diagnóstico temporal descrito más abajo.

Se sirvieron ambos paquetes mediante el servidor estático de desarrollo en loopback y el lector real `cargarRespaldoPublicado`: revisión1 CRLF y revisión2 LF verificadas, nueve relaciones conservadas, resumen nuevo visible y Buffer de cada portada nueva idéntico al original LF. Después de publicar2 se volvió a leer1 proporcionando al fetch del lector su puntero anterior conservado, sin cambiar ultima.json en disco. Una respuesta HTTP de portada modificada en un byte fue rechazada por el lector. Las comprobaciones de manifiesto/referencias permanecen activas; la suite frontend también prueba rutas/manifiestos corruptos y recursos ausentes. No se debilita la verificación ni se promete despliegue validado.

Procedimiento para un entorno con paquete histórico CRLF:

1. Conservar y verificar el paquete y su puntero con sus propios hashes. No convertir archivos dentro de revisiones publicadas ni regenerar sus manifiestos para acomodar LF.
2. Aplicar la nueva política al checkout de la aplicación y comprobar sus tres hashes LF. Puede seguir sirviéndose el paquete histórico; no se necesita alterar el catálogo para instalar esta corrección.
3. Si una reexportación de la misma revisión encuentra bytes distintos, detener ese intento y conservar el paquete/puntero. No borrarlos, no cambiar la revisión a mano ni introducir una edición ficticia en datos reales solo para eludir la validación.
4. Cuando exista una modificación documental real aprobada, guardarla mediante el flujo administrativo normal con autorización/If-Match y copia de respaldo conforme al procedimiento operativo vigente. Exportar la revisión generada por ese guardado, verificar el nuevo paquete/puntero y conservar el anterior. El ensayo TEMP anterior acredita este mecanismo, no una copia externa institucional.

### Inventario y decisión

Publicación limitada a `.gitattributes`, `backend/test/catalogo.test.js`, este informe y `openspec/changes/s4-persistencia-documental/tasks.md`. Los tres SVG tienen diff de contenido vacío y no se incluyen en el índice. Se confirmó nuevamente el SHA agregado de los2281 archivos ajenos y el SHA del informe5C indicados más abajo. La línea vacía preexistente de `.gitignore` sigue fuera del alcance; diff --check limitado a5E correcto.

Auditoría sin bloqueantes identificados para la publicación autorizada; incertidumbre503 conservada expresamente. La identificación del commit publicado se obtiene con `git log -1 --format=%H -- docs/PRUEBA-S4-ETAPA5E.md` y se entrega tras verificar el push; no se introduce un hash autorreferente en este archivo. No se cierra ninguna tarea física/institucional ni se declara S4 terminado.

## Alcance y estado

Evaluación y corrección local del 9 de noviembre de 2026, sobre `indigo/s4-persistencia-documental`, HEAD `9762148568103f7d14f43555cfa2460ba031bac9`. Sin commit, push, PR, merge ni archivo OpenSpec. No se declara terminado S4 ni autorizado el uso institucional.

Se consultaron AGENTS.md, proposal/design/spec/tasks S4, el informe local5C y el informe publicado5D. Esta evidencia resuelve el pendiente técnico LF/CRLF registrado en esos informes; no modifica sus registros históricos ni sus otros pendientes.

## Diagnóstico comprobado antes de modificar los originales

Git de Windows declara `core.autocrlf=true` desde su configuración de sistema. La consulta `git config --show-origin --get-regexp 'core\.(autocrlf|eol|safecrlf)|core.attributesfile'` no mostró valores explícitos para las otras claves consultadas. `git check-attr -a` no devolvió atributos para las portadas. `git ls-files --eol` mostró `i/lf w/crlf` en las tres rutas.

Los bytes obtenidos mediante `git show HEAD:astrovisor-s1-inicio/frontend/public/libros-demo/<id>.svg` se compararon como Buffer, sin pasar por redirección textual de PowerShell. Cada blob fue idéntico al de `main` aprobado, `f1058c9b10641c470d7d3e331a81f327af78fc8c`. Los tres blobs contienen once LF y ningún CR; los checkouts iniciales contienen once CRLF y ningún LF aislado. La comparación de diagnóstico que retira únicamente CR de CRLF demostró igualdad del resto de bytes; esa operación **no forma parte de la prueba de integridad**.

| SVG | Bytes blob / checkout inicial | SHA-256 blob aprobado = variante LF = checkout final = nueva referencia |
| --- | --- | --- |
| star-lore | 1475 / 1486 | `46094f074bdcdf069d5decab843457c38d9978c0456c0e758c5941bc87cc5faa` |
| field-stars | 1483 / 1494 | `f241990eb92799a8be18102a724ef2ea4ff524374414e46532e5f6b7d4b0124c` |
| half-hours | 1484 / 1495 | `905e02247d12184d268d75e5362b9dc6f201f3ab022030157241ee060437d276` |

| SVG | SHA-256 checkout inicial = variante CRLF = referencia anterior |
| --- | --- |
| star-lore | `c4266615a052733476739e2b6ff22c43c904499f3b05a76b91e684eaf197b9a4` |
| field-stars | `fd1bd898d6bd05f322badc32ca38c8370762e47f5e2204ec3730007b5c823631` |
| half-hours | `ee49362effa9a303c4e63adb44c0ae60aee59f1eb3fab2c88602cefc2b98af75` |

La prueba original pasó en el checkout CRLF. En un clon temporal de HEAD con `core.autocrlf=false` falló por la diferencia `46094f…` frente a `c42666…` en star-lore, salida1. La referencia dependía de los bytes CRLF del checkout y no de los bytes LF almacenados en Git. Esa es la causa reproducida.

El primer intento del clon no llegó a la comparación: faltaba sharp. Se repitió enlazando mediante junctions los node_modules ya instalados, sin instalar dependencias; entonces se observó el fallo SHA esperado. Ninguna de estas pruebas rojas alteró los originales del workspace.

## Corrección mínima

Se crea `.gitattributes` en la raíz de la aplicación con tres reglas cerradas:

```gitattributes
/frontend/public/libros-demo/star-lore.svg text eol=lf
/frontend/public/libros-demo/field-stars.svg text eol=lf
/frontend/public/libros-demo/half-hours.svg text eol=lf
```

No hay patrón global `*.svg` ni cambio de configuración Git local/global. Se elige LF porque coincide exactamente con los blobs aprobados, en vez de establecer nuevas referencias CRLF dependientes del checkout anterior.

La prueba de `backend/test/catalogo.test.js` conserva lectura binaria, SHA-256 y `assert.equal` sin normalización, sin aceptar múltiples hashes y sin omitir casos. Sus tres literales se sustituyen por los hashes LF de la tabla y se explica su procedencia en un comentario.

Después del diagnóstico, los tres archivos físicos del workspace se materializaron mediante los Buffer de `git show HEAD:…`, comprobando previamente que no había diferencias aparte de finales de línea. Se verificó igualdad binaria final con los blobs. No cambian geometrías, textos, estilos, accesibilidad, metadatos ni rutas. `git diff --numstat -- frontend/public/libros-demo` queda vacío. Los bytes físicos sí cambian CRLF→LF; no se oculta esa diferencia. Un estado Git transitorio `M` por estadísticas/filtros no constituye un cambio del blob: no se preparó ni reescribió el índice para ocultarlo.

## Regresiones de checkout e integridad

Se crearon clones locales temporales **sin checkout**, a partir del HEAD publicado. Antes de materializar HEAD se copió exclusivamente la nueva `.gitattributes`; se ejecutó el checkout con cada valor `core.autocrlf=true`, `false` e `input`. Se copió la prueba candidata, porque los cambios5E todavía no están publicados. Se trata de checkouts limpios de la base más los cambios candidatos descritos, no de un supuesto commit5E.

En Windows se ejecutó el caso real con:

```powershell
node --test --test-name-pattern='tres portadas SVG' backend/test/catalogo.test.js
```

Para cada configuración y cada archivo se comprobó:

1. Igualdad byte a byte con `git show HEAD:…`; checkout LF y prueba salida0.
2. Conversión controlada del archivo temporal a CRLF: la misma prueba termina con salida1.
3. Reposición del LF y cambio de un byte relevante: `v`→`V` de `viewBox`, offset65; la misma prueba termina con salida1.
4. Reposición del Buffer original y nueva ejecución salida0; diff de los SVG vacío.

Resultados: nueve combinaciones archivo/configuración en Windows, todas con rechazo de CRLF y del byte alterado. Las reglas fuerzan LF incluso con autocrlf=true; una edición posterior a CRLF es rechazada por el hash, no aceptada mediante normalización.

### Linux aislado

Disponibilidad verificada de Docker Linux y de la imagen local `node:24`. No se descargaron imágenes ni paquetes. Contenedores efímeros con red deshabilitada, raíz de solo lectura, sin capabilities, `no-new-privileges`, fuente temporal montada de solo lectura y espacio de trabajo en tmpfs.

Además de una primera ejecución aislada del bloque de hashes, se realizaron **checkouts nativos de Git dentro de Linux**, mediante clones locales sin hardlinks/alternates del repositorio temporal. Se copió la política antes del checkout y se repitieron las tres configuraciones autocrlf. `git ls-files --eol` mostró `i/lf w/lf attr/text eol=lf` en las tres portadas para cada configuración. Las nueve combinaciones Linux pasaron y rechazaron CRLF y el byte de viewBox alterado.

El caso Linux ejecutó el bloque real `test('las tres portadas SVG…')` extraído sin modificar de la prueba candidata, con sus imports estándar, en un archivo temporal ubicado en el mismo directorio relativo. No ejecutó el resto de catalogo.test.js ni importó sharp para Windows. Linux reportó `process.platform=linux`, Node `v24.21.0`. **No se ejecutaron las suites completas ni build en Linux**, ni se acredita allí instalación de sharp. Windows utilizó Node24.21.0/npm11.0.0.

### Reproducción sin publicar

Para repetir la comprobación sobre una copia aislada:

1. Crear un clon local `git clone --no-checkout` de la base indicada, en TEMP, fuera del repositorio de trabajo. Para trasladarlo entre sistemas, usar `--no-hardlinks` y no `--shared`.
2. Copiar la `.gitattributes` candidata a `astrovisor-s1-inicio/.gitattributes` **antes** de `git -c core.autocrlf=true checkout HEAD`. Repetir en clones nuevos con false/input.
3. Copiar `backend/test/catalogo.test.js` candidato al mismo destino relativo. En Windows reutilizar los node_modules instalados mediante junctions temporales o preparar dependencias separadamente.
4. Ejecutar el comando anterior; comparar Buffers de cada SVG con `git show HEAD:astrovisor-s1-inicio/frontend/public/libros-demo/<id>.svg` y comprobar `git ls-files --eol`.
5. Solo en ese clon, convertir un SVG a CRLF y ejecutar la misma prueba: esperar salida1. Restaurar el Buffer original, cambiar el byte65 de118 a86 y esperar salida1. Reponer el original y esperar salida0. Repetir por archivo.
6. En Linux sin dependencias, crear en `backend/test/` un archivo temporal con imports de node:test, node:assert/strict, readFile de node:fs/promises y createHash de node:crypto, seguidos del bloque original de hashes; ejecutar `node --test` sobre ese archivo. Mantener literales y lectura binaria originales.

Los clones y almacenes de ensayo se eliminaron tras comprobar que pertenecían al TEMP creado por cada ensayo. No se crearon commits temporales.

## Renderizado y Homido

Chrome headless156.0.8078.80 decodificó cada SVG LF y su variante CRLF mediante imágenes data: en una página de ensayo, sin modificar el arnés5D. Tamaño natural450×640 en ambos casos. Se compararon en memoria los PNG de la captura del elemento: fueron idénticos por archivo. SHA-256 de esas capturas:

- star-lore: `a3c8d9e148bb50202addee47b81c74a34e6195799fa45471d4ff17332dedb713`
- field-stars: `4e9a41de1c64d0862849941327b6c01ecd9a3ca9766e16c89cb47e9f3b0cde9e`
- half-hours: `82c9eca1695fe492731d52659956f25b83ff832e9e233f65c44ebe41589580d9`

No se añadieron capturas ni se sobrescribieron las evidencias5D. Esto acredita decodificación/renderizado local y equivalencia observada en ese navegador, no hardware físico.

No se modificó homidoExport.js: continúa copiando bytes y comprobando tamaño/hash del manifiesto, referencias, revisiones e inmutabilidad. La suite backend repetida pasó los casos de copia exacta de originales, corrupción/ausencia del paquete, concurrencia y exportación PNG/JPEG/automática. La suite frontend pasó los lectores de paquetes y las transiciones híbridas5D.

**Compatibilidad con paquetes ya exportados:** un ensayo aislado simula los tres SVG CRLF anteriores mediante el IO de lectura inyectable del exportador. Publica revisión1, verifica su paquete y luego intenta exportar los bytes LF bajo la misma revisión. El exportador rechaza `Revisión existente distinta; no se sobrescribe`, conserva el puntero byte a byte y el paquete1 sigue verificándose. En el catálogo exclusivamente temporal se establece revisión2 y la exportación LF queda confirmada y verificada. No se modificaron datos reales ni revisiones de ejecución.

Un paquete CRLF existente conserva su propia integridad y no debe reescribirse para imponer LF. Si se desea publicar otra representación, debe usarse una revisión nueva mediante el flujo documental autorizado; no se propone editar manualmente una revisión real. No se relajan hashes ni se sustituyen paquetes anteriores. El primer intento de este diagnóstico temporal se detuvo por una expresión regular acentuada alterada al pasar por stdin de PowerShell; se corrigió solo el diagnóstico a `/existente distinta/` y el ensayo completo pasó.

## Validaciones generales reales

Ejecuciones secuenciales de las suites backend/frontend; sin modificar restauración, mirada ni sus aserciones:

| Comando | Resultado |
| --- | --- |
| npm test, primera ejecución | **118/119**, salida1, 9473.4479ms; `CLI ambos: distingue intervención de limpieza de restauración no confirmada` falla con503 |
| node --test backend/test/restauracion.test.js | **8/8**, salida0, 3077.6599ms |
| npm test, repetición completa | **119/119**, salida0, 9793.997ms |
| npm run test:web | **143/143**, salida0, 2265.3345ms |
| npm run build | Correcto, salida0; Vite6.4.5,51 módulos,976ms |
| openspec validate s4-persistencia-documental --strict | Correcto; repetido después de actualizar documentación/tareas |

El fallo backend inicial muestra `Almacenamiento documental no disponible`, status503, en documentWriter.js:127, al envolver respaldo/sustitución durante el escenario CLI. No hubo traza de la causa IO interna. El archivo completo pasó8/8 aislado y la suite siguiente119/119: el fallo no se reprodujo en esas repeticiones. **La causa no está verificada**; no se atribuye a antivirus, concurrencia ni finales de línea sin evidencia. No se modificó código ajeno para ocultarlo. No se observó fallo de mirada en la ejecución frontend5E; sus antecedentes permanecen documentados en5B/5D.

## Inventario exacto y conservación

Cuatro archivos con cambios de configuración/prueba/documentación destinados a revisión:

1. `.gitattributes` — nuevo; únicamente las tres reglas.
2. `backend/test/catalogo.test.js` — tres hashes LF y comentario; misma comprobación binaria.
3. `docs/PRUEBA-S4-ETAPA5E.md` — nuevo; este informe.
4. `openspec/changes/s4-persistencia-documental/tasks.md` — registro8.1g sustentado por estas pruebas.

Además, tres rutas físicas materializadas CRLF→LF, **sin diferencia respecto de sus blobs Git aprobados**:

5. `frontend/public/libros-demo/star-lore.svg`
6. `frontend/public/libros-demo/field-stars.svg`
7. `frontend/public/libros-demo/half-hours.svg`

No se añadió dependencia ni se modificaron package-lock, código funcional, CSS, audio, generadores, exportador, controlador/pruebas de mirada ni arnés Chrome. Build generó su salida ignorada habitual; no se prepara para versionar. Índice sin cambios preparados.

`git diff --check` global señala la línea vacía final preexistente de `.gitignore`; no se corrige por estar fuera de alcance. La comprobación limitada a los cambios5E pasa. Git también avisa que test/tasks usan LF en el workspace y su política general podrá convertirlos a CRLF: sus diferencias de contenido quedan limitadas al inventario anterior. La nueva política eol=lf solo afecta las tres portadas.

Los2281 archivos ajenos conservan el SHA agregado registrado5D: `ACF1CBE34F9B96E0F93EEFAD29AB0415DDB78615BBDD860B66292AE74A460B2C`. Incluye `.presentacion-build`, las presentaciones/guion preexistentes, `.gitignore` y `docs/VALIDACION-PR6-S4.md`, con el mismo procedimiento Path/Hash ordenado de5D. El primer cálculo de esta sesión intentó una API ToHexString no disponible en Windows PowerShell; se repitió con BitConverter, sin cambiar archivos.

El informe5C permanece sin seguimiento e intacto, SHA-256 `DB3AE9BEB8ECEE868BF40247FF053AE91396C7D816F556C1CCAFFC2A277962FD`. Se conserva el cambio preexistente de `.gitignore`. HEAD y main permanecen en los commits indicados; no se consulta ni modifica PR5.

## Límites pendientes

Esta etapa registra8.1g; no cierra artificialmente0.2,0.4,1.4c,2.2,3.5,5.5,6.4,7.3,7.5 ni los pendientes institucionales previos. No se ejecutaron zoom nativo, móvil/Homido físico, TTY ni despliegue. No se acreditaron respaldos externos, ACL/HTTPS/capacidad institucionales o durabilidad eléctrica. Permanece el fallo backend inicialmente observado con causa sin verificar, aunque las repeticiones indicadas pasaron.

Estado histórico al terminar la implementación: pendiente de revisión del usuario, sin publicación ni inicio de otra etapa. La auditoría final autorizada y sus criterios de publicación se registran al inicio de este informe.
