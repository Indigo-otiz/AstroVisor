# S4 — Intermitencia de la prueba de mirada

Fecha: 9 de noviembre de 2026, America/Chihuahua. Windows, Node 24.21.0.
Rama: `indigo/s4-persistencia-documental`.
HEAD comprobado: `f8154cbb3cfe158e2d1431249c67e5044d8046cd`.
Main local: `f1058c9b10641c470d7d3e331a81f327af78fc8c`.

## Resultado y clasificación

**A — Fragilidad del test demostrada.** El cuerpo original del ensayo falla si no se entrega una actualización durante el intervalo correspondiente al 33 %. Su combinación de dwell100 ms, fallback setTimeout16 ms y espera real150 ms no controla qué actualizaciones ocurren. Una espera total suficiente para confirmar no implica haber muestreado todas las etapas intermedias.

**B — No se establece aquí un defecto de producción contra una política de retrasos definida.** Sí se reprodujo que ambos controladores omiten etapas intermedias cuando una actualización salta sobre todo su intervalo, incluso con dwell3000 ms. OpenSpec exige cuatro fases claras, pero no define cómo resolver una suspensión del event loop que impide actualizaciones durante una fase completa. No se interpreta ese silencio como aceptación de cualquier degradación visual.

**C — Ambos problemas no queda demostrado con un criterio de aceptación de retrasos que no está especificado.** La corrección aplicada es exclusivamente de pruebas. No se modifican los controladores ni se declara resuelta la causa concreta de los retrasos históricos.

## Síntoma y antecedentes preservados

La prueba `GazeController avanza por las etapas 0%, 33%, 66% y confirma en 100%` falló por `stagesVisited.includes('33%')` en ejecuciones anteriores y pasó después.

- El informe5B conserva una web136/137 seguida de137/137 y un diagnóstico anterior con bloqueo80ms. No identifica qué originó el retraso de la suite real.
- El informe del parche de limpieza conserva web142/143, el mismo salto de33%, archivo aislado5/5 y repetición143/143. Tampoco demuestra una causa de ese episodio.
- La línea base actual, antes de editar los tests, pasó **12/12** en los dos archivos de mirada (1536.3758 ms). Se conserva ese pase sin presentarlo como refutación de los fallos anteriores.

Se leyeron AGENTS.md, OpenSpec S2/S4 y las evidencias citadas. No se sobrescribieron esos documentos, ni se investigó o modificó el escritor/diagnóstico503 en esta tarea.

## Dos implementaciones distintas

| Aspecto | Servicio frontend | Experiencia Homido |
| --- | --- | --- |
| Archivo | src/services/gazeController.js | public/prueba-homido/js/gaze-dwell.js |
| API | Clase GazeController | crearDwell |
| Reloj/planificación | performance.now y RAF; fallback timeout16 | Inyección existente ahora/pedirFrame/cancelarFrame; defaults equivalentes |
| Default | 3000 ms | 3000 ms, gracia280 ms |
| Progreso/etapa | Tiempo transcurrido y umbrales .33/.66/1 | Tiempo transcurrido y los mismos umbrales |
| Estado inicial | onStageChange0% y onProgress0 | onInicio y onProgreso0%; onEtapa informa cambios posteriores |
| Pausa/cancelación | setPaused cancela la carga y restablece0 | El consumidor cancela explícitamente y restringe puedeEnfocar; desenfocar tiene gracia |

La escena pública importa crearDwell en `prueba-homido/prueba.js`, no el servicio GazeController. Al alternar pausa llama a dwell.cancelar. No se unificaron ambos controladores ni se cambió su comportamiento. Las pruebas reales restantes de gracia Homido se conservaron.

## Hipótesis y reproducción controlada

Con dwell100 ms, el intervalo de la etapa33% es [33,66) ms. El callback calcula la etapa del progreso actual; no recorre estados históricos. Con actualizaciones nominales16 ms puede observarse33% en48/64 ms, pero un retraso puede desplazar la siguiente actualización hasta después de66 ms.

### Cuerpo original del test, reloj aislado

Antes de editarlo, se guardó su fuente original. Se ejecutó ese cuerpo en un contexto VM privado con las mismas aserciones, el cuerpo real del controlador y una cola controlada. Solo se adaptaron declaraciones de módulo para cargarlo en VM; no se cambió la lógica de tick.

| Entrega | Resultado |
| --- | --- |
| Inicio y tick inmediato a0 | 0% |
| Primer timeout pendiente, entregado tarde a80 | 66% |
| Siguiente callback a96 | 66% |
| Callback a112 | 100%, confirmación |
| Espera original resuelta a150 | ERR_ASSERTION por falta de33% |

Lecturas del reloj: `[0,0,80,96,112]`. Etapas emitidas: `["0%","66%","100%"]`; confirmada=true. La reproducción con la copia guardada del test se repitió y obtuvo el mismo resultado. Este es un fallo deliberado del test original bajo una secuencia conocida, no un nuevo fallo espontáneo de la suite.

El primer montaje del observador VM no capturó etapas porque una declaración léxica sombreaba la referencia observada y su propia aserción recibió una lista vacía. Se corrigió el aislamiento del arnés mediante un envoltorio léxico antes de registrar la reproducción válida; no se atribuyó ese error del investigador al controlador.

### Reloj y temporizadores reales, proceso separado

Se ejecutó una sola prueba adicional con el módulo original importado normalmente, performance.now real, setTimeout real y bloqueo síncrono deliberado de80 ms en su proceso aislado. No se sustituyeron temporizadores globales.

| Medida observada | Resultado |
| --- | --- |
| Bloqueo medido | 80.060 ms |
| Actualización después del bloqueo | 80.568 ms desde el inicio; progreso .805, etapa66% |
| Confirmación | 104.625 ms; progreso1, etapa100% |
| Etapas | 0%,66%,100% |
| Confirmaciones | Una; falta33%=true |

Esto demuestra que una demora real puede producir la secuencia que invalida la aserción. **No demuestra que la carga del event loop fuera causada por backend, Windows, antivirus o un proceso concreto en las ejecuciones históricas.** Sus planificaciones originales no quedaron capturadas.

## Qué exige y qué no define OpenSpec

S2, requisitoR2, pide permanencia3000 ms, cuatro fases y cancelación al desviar; R3 pide confirmación al100%. El diseño especifica actualización mediante RAF o reloj de escena. S4 conserva mirada/pausa y no añade una política para un event loop detenido. Homido añade la gracia280 ms documentada enS3.

No hay una cláusula que ordene emitir retrospectivamente33% y66% en el mismo frame, prolongar la permanencia para mostrarlos o cancelar automáticamente tras una demora determinada. No se añadió ninguna de esas conductas. Emitir varios callbacks seguidos no acreditaría que el usuario vio esas etapas.

Las pruebas normales siguen exigiendo **todas** las etapas, en orden, y ningún confirmado antes de3000 ms. Se comprueban los umbrales actuales a990/1980 ms (.33/.66 de3000); S2 los describe visualmente como1/2 segundos. No se cambia esa cuantización existente ni el default.

[Inferencia] Si se exige que cada fase sea perceptible incluso tras una suspensión prolongada, hace falta decidir un criterio de retraso y recuperación con evidencia visual/usuario. No procede inventarlo en esta corrección de tests.

## Corrección mínima del ensayo

Se añadió un ayudante exclusivo de pruebas con reloj y colas privados. Cada entrega ejecuta solo callbacks pendientes; no reproduce artificialmente todos los intervalos perdidos. No cambia performance, RAF o timers del proceso compartido.

- GazeController se carga en VM con el contenido actual de su archivo, eliminando únicamente los prefijos export y usando un envoltorio léxico. Se ejecutan intactos sus métodos con performance/RAF/timeouts privados. No se añade una API de inyección a producción ni otra implementación del controlador.
- El test principal usa ahora el default3000 ms, avanza explícitamente por989/990/1979/1980/2999/3000 y conserva las cuatro aserciones includes originales. Añade secuencia exacta, confirmación única, objetivo correcto y ausencia de confirmación temprana.
- La cancelación se verifica a2999 ms, sin espera de pared. Nuevos escenarios comprueban pausa/reinicio, independencia entre dos relojes, fallback con cuatro etapas y saltos grandes sin eventos retroactivos.
- En Homido se usan los puntos de inyección ya existentes. Su test principal conserva la secuencia33/66/100 y añade verificación explícita de0% mediante onProgreso, límites temporales y una única confirmación. También se caracterizan cancelación/pausa del consumidor y saltos.

Los casos de salto no sustituyen las aserciones del recorrido normal. Bajo frames a2400/3000 ms se observa0→66→100; un primer frame a6000 produce0→100, sin emitir etapas que no se actualizaron. Se prueban esos comportamientos actuales y su riesgo, no se presenta esa observación como nueva aprobación de accesibilidad.

## Validaciones reales

Ejecutadas de forma sucesiva, sin solapar backend y frontend:

| Comando/selección | Resultado |
| --- | --- |
| Línea base original, dos archivos | 12/12; 1536.3758 ms |
| Primer ensayo determinista del frontend | 9/9 |
| Ambos archivos, antes de la última regresión de aislamiento | 21/21; 1294.3455 ms |
| node --test frontend/test/gazeController.test.js | **11/11**; 110.0077 ms |
| node --test frontend/test/homido-gaze-dwell.test.js | **11/11**; 1262.5496 ms |
| Todos los archivos homido*.test.js (11 archivos) | **78/78**; 1385.1058 ms |
| npm run test:web | **153/153**; 5968.7102 ms |
| npm test, copia local con diagnóstico503 no versionado | **145/145**; 11301.2356 ms; incluye 13 pruebas locales que no forman parte de esta publicación |
| npm run build | Correcto, salida0; Vite6.4.5,51 módulos,2.43 s |
| openspec validate s4-persistencia-documental --strict | Correcto, salida0 |
| openspec validate s2-seleccion-mirada-homido --strict, adicional | **Falla, salida1:** el cambio vigente no contiene deltas reconocidos |

El validador S2 exige encabezados ADDED/MODIFIED/REMOVED/RENAMED Requirements y escenarios que ese documento no tiene. `git diff --exit-code -- openspec` confirmó que OpenSpec permanece idéntico a HEAD. No se reformateó S2 ni se marcó su validación como correcta. S4 sí pasó.

No se observó otra omisión espontánea en estas suites. Se conservan el fallo controlado original, el error inicial del arnés y la validación S2 fallida. Los pases no identifican la causa exacta de una ejecución histórica ni acreditan comportamiento físico.

## Integridad, inventario y riesgos pendientes

Se comprobó que los dos controladores conservan sus bytes. SHA-256:

- gazeController.js: `123e279c7c990b9ae566b5cc6d8aec129e48cf1923d261da4c9caef2d4556152`.
- gaze-dwell.js: `6846e636d153359099b741f60f9d0427f75110e597abe26a93d7ec1fd2601248`.

Inventario de esta tarea, cuatro archivos:

1. `frontend/test-support/reloj-mirada.mjs` — ayudante nuevo, reloj/colas y carga VM aislada.
2. `frontend/test/gazeController.test.js` — ensayo determinista y caracterizaciones; sin cambio de producción.
3. `frontend/test/homido-gaze-dwell.test.js` — ensayo de etapas con inyección existente y caracterizaciones adicionales.
4. `docs/INVESTIGACION-S4-MIRADA-INTERMITENTE.md` — este informe nuevo.

Los archivos de diagnóstico503 y sus informes se verificaron por hash sin modificarlos. Se conservaron documentos5C/5F, informes históricos, presentaciones y cambios ajenos. No se prepararon archivos en el índice ni se cambiaron referencias Git, PR #7, OpenSpec o main. Sin commit, push, merge o archivo de Sprint4.

Límites: el ayudante VM adapta los exports del servicio actual sin imports; si ese módulo adquiere dependencias, el arnés necesitará revisión. Los ensayos VM no son una prueba de render real. Los tests Homido de gracia conservan temporizadores reales y pueden depender de planificación; no se reescribieron por conjetura.

Un bloqueo que salte una fase completa también afecta al módulo Homido, según el ensayo controlado. No se ensayaron FPS, sensores, móvil o visor físico bajo esas demoras. La confirmación por tiempo transcurrido y la percepción de etapas bajo suspensión prolongada requieren evaluación separada; no se inventa una política de recuperación ni se declara corregido ese riesgo.

[Inferencia] El siguiente paso útil sería acordar el comportamiento deseado ante suspensiones largas y comprobarlo en el visor real. La fragilidad del ensayo queda tratada con control explícito del tiempo; la continuidad visual bajo carga y la conformidad formal del documento S2 permanecen pendientes.

## Auditoría para publicación de las pruebas

Auditoría posterior autorizada, 9 de noviembre de 2026. Windows, Node24.21.0 y OpenSpec1.14.3. HEAD local/remoto previo `f8154cbb3cfe158e2d1431249c67e5044d8046cd`; main local/remoto `f1058c9b10641c470d7d3e331a81f327af78fc8c`. PR7 abierto en Draft al verificar. Esta autorización permite publicar exclusivamente los cuatro archivos del inventario; los estados de no publicación anteriores describen la investigación inicial.

La revisión confirmó reloj y colas privados, ausencia de sustituciones globales, comprobación de las cuatro etapas normales, cancelación, pausa, reinicio, objetivo correcto y confirmación única. Las colas controladas terminan sin callbacks pendientes. Los casos de gracia que conservan temporizadores reales no se alargaron ni relajaron. Los dos archivos de producción y OpenSpec continúan sin cambios respecto de HEAD.

### Sensibilidad de las aserciones

Se copiaron los dos controladores, los tests y el ayudante a directorios temporales independientes. Solo esas copias recibieron seis mutaciones deliberadas; ningún archivo de producción del checkout fue editado. Cada ejecución usó `node --test --test-reporter=tap` sobre el test correspondiente.

| Defecto introducido exclusivamente en copia | Frontend | Homido |
| --- | --- | --- |
| Mover umbral .33 a .5 | salida1; 3 pruebas fallan | salida1; 2 pruebas fallan |
| Convertir cancelación en retorno inmediato | salida1; 3 pruebas fallan | salida1; 4 pruebas fallan |
| Duplicar callback de confirmación | salida1; 7 pruebas fallan | salida1; 6 pruebas fallan |

Los fallos fueron aserciones sobre etapas, estado, cancelación o número de confirmaciones; no errores de carga ni timeouts. Esto aporta evidencia de que el ensayo ejecuta y comprueba el controlador real, no solo las respuestas del reloj. El primer colector esperaba el resumen TAP mientras Node imprimía el formato spec: los seis procesos ya fallaban, pero no extrajo sus contadores. Se repitió con reportero TAP explícito; no se cambió ninguna aserción para obtener estos resultados.

### Regresiones de la auditoría

Ejecuciones sucesivas, sin solapar suites. No se observó un nuevo fallo espontáneo de mirada ni un HTTP503 inesperado en estas ejecuciones; no se atribuye por ello una causa a los episodios históricos.

| Comando | Resultado |
| --- | --- |
| `node --test frontend/test/gazeController.test.js frontend/test/homido-gaze-dwell.test.js` | 22/22; 1273.7098 ms; 11 por controlador |
| `node --test` con los 11 archivos `frontend/test/homido*.test.js` | 78/78; 1393.2943 ms |
| `npm run test:web` | 153/153; 2293.2133 ms |
| `npm test` en la copia local | 145/145; 10203.204 ms; incluye 13 pruebas del diagnóstico503 no versionado |
| `node --test` con los 16 archivos devueltos por `git ls-files backend/test`, filtrados por extensión test/spec JS | 132/132; 9154.5372 ms; selección correspondiente al backend que quedará en GitHub |
| `npm run build` | salida0; Vite6.4.5, 51 módulos, 953 ms |
| `openspec validate s4-persistencia-documental --strict` | salida0, válido |
| `openspec validate s2-seleccion-mirada-homido --strict` | salida1; ausencia de deltas reconocidos |

Los 145 tests locales no se presentan como pruebas publicadas. El backend versionado no cambia y contiene 132 tests; los cuatro archivos del diagnóstico503 permanecen fuera del índice y del commit.

### Diagnóstico independiente de S2

El comando exacto anterior informa `No delta sections found` y `Change must have at least one delta`. El documento usa `## Requisitos de Capacidad` y encabezados `### R1`, `### R2`, etc.; no contiene secciones `## ADDED/MODIFIED/REMOVED/RENAMED Requirements` ni bloques `#### Scenario:` que el esquema de cambios del validador reconoce. También advierte que la sección de capacidad no se trasladaría al archivar.

Es un incumplimiento de estructura/formato del cambio frente al esquema instalado, no el resultado de ejecutar un requisito funcional ni evidencia de que los controles fallen. S4 sí utiliza deltas y escenarios reconocibles y pasa por separado. S2 no se modificó, no se archivó y no se marca válido.

### Alternativas pendientes para suspensiones largas

S2 exige 3000 ms, cuatro fases visibles y cancelación/confirmación; no fija un umbral de interrupción ni una política de recuperación. Las pruebas verifican callbacks y estado ante actualizaciones controladas, no la percepción visual, continuidad de la mirada ni sensores durante un intervalo sin frames. Bajo grandes saltos ambos módulos muestran directamente la etapa del tiempo transcurrido. No se añaden eventos retroactivos ni se aprueba ese comportamiento para cualquier demora.

Las siguientes consecuencias son evaluación técnica, no resultados de pruebas con usuarios:

| Alternativa para decisión posterior | Ventaja prevista | Riesgo y consecuencia de accesibilidad |
| --- | --- | --- |
| A. Mantener tiempo transcurrido y mostrar etapa actual | Conserva duración y comportamiento actuales | Puede omitir feedback intermedio o confirmar en el primer frame tras una suspensión; la continuidad del enfoque durante ella no queda acreditada |
| B. Suspender o reiniciar después de un intervalo prolongado | Permite exigir continuidad antes de confirmar | Requiere decidir umbral y condición de reanudación; reinicios frecuentes pueden frustrar o fatigar a personas con dispositivos lentos |
| C. Acumular solo intervalos de enfoque observados y acotados | Permite descontar intervalos sin observación, conservando parte del progreso | Requiere una política explícita de tiempo válido y feedback; puede prolongar la espera y tampoco demuestra por sí sola que cada fase fue perceptible |

No se selecciona ninguna alternativa en esta publicación. Una decisión posterior necesita criterios de aceptación y validación visual, con adultos mayores y hardware Homido cuando esté disponible. No se probaron visor físico, sensores, FPS ni continuidad visual bajo suspensión; S4 permanece abierto.
