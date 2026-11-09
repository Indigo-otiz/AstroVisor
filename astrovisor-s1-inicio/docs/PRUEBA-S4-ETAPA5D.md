# Sprint 4 — Etapa 5D: sistema híbrido de portadas

## Auditoría de cierre: estabilidad y publicación condicionada

El usuario autorizó esta auditoría y el commit/push exclusivo de5D si se satisfacen sus criterios. Base local/remota comprobada: `e56c60057d28a8d25558a7ea4875c455ee39429b`, rama `indigo/s4-persistencia-documental`; main local/remota `f1058c9b10641c470d7d3e331a81f327af78fc8c`. Sin PR, merge, rebase ni archivo OpenSpec. Las secciones inferiores son historial, no el estado posterior de estabilidad.

### Diagnóstico reproducido antes de corregir el arnés

Se mantuvieron las acciones y esperas originales y se añadieron registros pasivos de solicitudes/respuestas sin cuerpos/cabeceras, consola, focusin y Enter. No hubo console/evaluate adicional antes de cada pulsación para introducir una pausa. Al fallar se consultó estado/health y se capturó la pantalla. No se ejecutaron suites backend/frontend en paralelo con Chrome desde esta sesión; no se midió el uso de recursos de todos los procesos externos del equipo, por lo que no se atribuye el fallo a competencia de CPU/memoria.

Evidencia preservada: [JSON del timeout](evidencias-s4-5d/timeout-diagnostico.json) y [estado de la pantalla](evidencias-s4-5d/timeout-estado.png). Duración38809ms, incluido timeout30000ms de `#nuevo-id` en la segunda alta. La primera alta sí se mostró y guardó. Al segundo Enter, el registro del navegador muestra **activo/destino `editor-resultados`, botón habilitado, formulario ausente**. No hay un focusin al botón nuevo-libro entre la primera confirmación y ese Enter. El guardado recibió201 y la recarga GET200; al capturar el fallo no había solicitudes pendientes ni alertas, Chrome seguía conectado, API escuchando y health200. Consola solo Vite conectado; cero pageerror. No hubo terminación inesperada del navegador o del proceso Node del ensayo; este finalizó1 por el timeout y ejecutó su limpieza.

Mecanismo comprobado: el arnés esperaba únicamente visibilidad, llamaba focus y después enviaba Enter al foco global. El botón se deshabilita durante carga/guardado y `guardarYCentrar()` lleva el foco a resultados al completar. En el caso registrado, Enter no se dirigió al botón y el panel no recibió la activación de alta. Esto sustenta una falla de sincronización/foco del arnés, no una caída de Express ni una excepción del panel. No hay trazas equivalentes de los tres timeouts históricos para demostrar que todos tuvieron exactamente la misma secuencia; se acota la conclusión al mecanismo reproducido y a los recorridos actuales.

### Corrección mínima y regresión

En `scripts/probar-portadas-hibridas.mjs`, la acción espera `#nuevo-libro:enabled` y utiliza `locator.press('Enter')` sobre ese botón. No cambia el panel, su gestión de foco, CSS ni el controlador de mirada. No aumenta timeouts, no retira aserciones y no usa pausas fijas. Los guardados esperan además confirmación visible, botón habilitado y foco en resultados: estados reales que acreditan que el flujo de UI terminó antes de iniciar la acción siguiente. El flujo original que reprodujo el fallo pasó después de esa corrección con los mismos observadores pasivos.

Se ampliaron únicamente pruebas/evidencias para cubrir los recorridos de cierre solicitados. Modos reproducibles, con `ASTROVISOR_PLAYWRIGHT_MODULE` apuntando a Playwright externo si no está instalado en el proyecto:

```text
node scripts/probar-portadas-hibridas.mjs formulario
node scripts/probar-portadas-hibridas.mjs panel
node scripts/probar-portadas-hibridas.mjs completo-1
node scripts/probar-portadas-hibridas.mjs completo-2
```

Cada invocación crea identidad aleatoria, catálogo, imágenes y exportaciones propios en TEMP fuera del checkout, así como puertos aleatorios; termina servidores/navegador y retira su almacenamiento. Chrome headless156.0.8078.80; WebGL software/SwiftShader, no Homido físico. Los observadores no registran entradas de teclado distintas de Enter ni valores de campos. No se guardan trazas HAR con tokens/cuerpos ni credenciales.

| Caso independiente | Resultado | Evidencia |
|---|---|---|
| Formulario aislado tras autenticación de preparación | Salida0,8203ms; cinco aperturas Enter/cancelaciones, foco de regreso; revisión1 y cero POST/PATCH documentales | [formulario](evidencias-s4-5d/estabilidad-formulario.json) |
| Recorrido desde login/panel | Salida0,13478ms; PNG/JPEG, automática, edición, sustitución/regreso y412 real | [panel](evidencias-s4-5d/estabilidad-panel.json) |
| Completo1 | Salida0,20890ms; todo el panel, web pública, exportación y Homido API/paquete, con Express detenido para respaldo | [completo1](evidencias-s4-5d/estabilidad-completo-1.json) |
| Completo2, otro entorno independiente | Salida0,23771ms; mismo recorrido/aserciones, otros recursos/puertos/identidad | [completo2](evidencias-s4-5d/estabilidad-completo-2.json) |

En los cuatro casos todos los Enter destinados a alta se registraron en nuevo-libro habilitado. Cero pageerror. La repetición satisfactoria no se usa sola como diagnóstico: se conserva el caso fallido con destino equivocado y se comprueba la condición real corregida. Estos resultados no prometen ausencia de toda intermitencia futura en cualquier entorno.

Recorrido ampliado: PNG confirma revisión2, JPEG3; SVG heredado mantiene solo lectura y una sustitución previsualizada puede cancelarse sin escribir. Alta automática4, edición de título5, sustitución por PNG6 y retorno a automática7. Una segunda sesión temporal confirma cambio de año a revisión8; el formulario aún basado en7 recibe PATCH412 y conserva el título no enviado. El JSON confirmado permanece con título `Cielo estable`, no con el borrador. Consulta pública carga PNG/JPEG/automática y sus alternativas/créditos. Exportación revisión8 verificada; Homido online muestra las dos imágenes por API. Después se cierra realmente Express y su escritor, se comprueba rechazo de health en su puerto y el servidor estático permanece: lector devuelve PNG/JPEG del paquete8 y Homido usa Blobs verificados con API503.

Los JSON conservan una entrada de seguimiento PATCH412 sin evento requestfinished observado, aunque su respuesta412 y el error de UI están registrados. Ese campo no acredita una escritura todavía pendiente; no se vació artificialmente el registro para aparentar networkidle. La revisión y el contenido se comprobaron después del rechazo. El proxy Vite muestra ECONNREFUSED al consultar la API detenida: es el fallo deliberado de ese escenario, seguido de lectura correcta del paquete. Continúan advertencias de imports desde public; no se ocultaron. No hubo errores de mirada en estas ejecuciones y no se tocaron sus pruebas.

### Seguridad y validaciones finales repetidas

| Validación | Resultado real de cierre |
|---|---|
| `npm test` |119/119,0 fallos/omitidas,19927.5993ms, salida0 |
| Regresión HTTP incluida en esa suite | gzip/deflate415, health200, sin Z_DATA_ERROR; JSON normal/login/PATCH/PNG/JPEG operables y cierre normal0 |
| `npm run test:web` |143/143,0 fallos/omitidas,5398.2805ms, salida0; mirada sin fallo observado |
| `npm run build` | Salida0,Vite6.4.5,51 módulos |
| `npm audit` y `npm audit --omit=dev` | Ambos found0 vulnerabilities; sin cambios de dependencias en esta auditoría |
| `npm ls body-parser --all` / `npm ls vite` | Express4.22.3 → body-parser1.20.9; Vite6.4.5 directo/deduplicado |
| `openspec validate s4-persistencia-documental --strict` | Cambio válido, salida0 tras actualizar evidencia |

Parser global64KiB/inflate:false y raw PNG/JPEG2MiB/inflate:false conservados. Las suites incluyen hashes de SVG originales, nueve relaciones, bloqueo/revisión, respaldo fallido, procesos nuevos/reinicio/restauración y paquete anterior conservado ante fallo. No se detectaron nuevos bloqueantes en esos casos; cero avisos npm no certifica ausencia de vulnerabilidades desconocidas. No se ejecutó npm audit fix ni se migró Express/Vite de serie.

### Inventario y publicación

El inventario anterior de37 se conserva y añade **seis archivos de evidencia**, para43: JSON/captura del fallo y los cuatro resultados independientes. La única corrección adicional de código en esta auditoría pertenece al arnés; el sistema híbrido y la seguridad previamente corregida se publican juntos. Inventario completo al final. Imágenes de pruebas, catálogos, credenciales y paquetes públicos temporales no forman parte del inventario; las PNG incluidas son capturas de UI con datos sintéticos.

Los criterios locales de publicación autorizados quedan sustentados por el diagnóstico reproducido, corrección de espera/foco, dos recorridos completos, suites y auditorías. Commit solicitado: `feat(s4): incorporar portadas hibridas y corregir seguridad HTTP`. La identificación definitiva se obtiene con `git log -1 --format=%H -- docs/PRUEBA-S4-ETAPA5D.md` y se entrega en el informe final de la sesión después de comprobar el push; no se inserta un hash autorreferente en el contenido del mismo commit. La autorización sigue excluyendo main, PR y archivo OpenSpec.

Informe5C y2281 archivos ajenos mantienen sus hashes anteriores, sin preparación para commit. Se preserva la línea vacía final preexistente de `.gitignore`, fuera del inventario. S4 no se declara completo ni aprobado institucionalmente. Siguen pendientes LF/CRLF, cuota total y control de capacidad, respaldo externo real que incluya imágenes, zoom nativo, móvil/Homido físico, derechos reales y validaciones de infraestructura/operación. No se amplía esta auditoría hacia esos pendientes.

## Corrección de seguridad autorizada, sin publicación

Estado posterior a la auditoría bloqueante conservada abajo: **body-parser1.20.9 y Vite6.4.5 instalados; defensa JSON global y regresión en proceso hijo comprobadas**. No commit, push, PR, merge ni archivo OpenSpec. El bloqueo de seguridad reproducido queda mitigado en las pruebas descritas; esto no autoriza publicar ni acredita uso institucional. La repetición Chrome tiene resultados mixtos, detallados aquí, que deberán revisarse antes de declarar una validación de publicación completamente satisfactoria.

### Cambios aplicados y dependencias

- Actualización puntual de la resolución transitiva `express4.22.3 → body-parser1.20.8 → 1.20.9`, mediante `npm update body-parser --ignore-scripts --no-audit --no-fund`. Express continúa4.22.3 con su rango `~1.20.5`, compatible con1.20.9. Sin dependencia directa nueva, overrides ni salto mayor.
- Frontend declara exactamente `vite:6.4.5` y el lockfile resuelve esa versión, compartida con plugin-vue5.2.4. Actualización con `npm install vite@6.4.5 --save-dev --save-exact --workspace frontend --ignore-scripts --no-audit --no-fund`; sin Vite7/8, sin audit fix ni cambios de reglas fs.allow/fs.deny.
- Comparación estructural del lockfile contra el estado local anterior a esta corrección: cambian exclusivamente entradas `frontend` (declaración), `node_modules/body-parser` y `node_modules/vite`; ninguna nueva entrada ni otro paquete actualizado. Sharp permanece0.35.5. La incorporación previa de sharp y sus dependencias sigue formando parte de5D, no es una actualización adicional de esta corrección.
- Parser JSON global: `express.json({limit:'64kb',inflate:false})`. Los clientes examinados envían JSON sin Content-Encoding y sus flujos normales pasan. No se requiere aceptar JSON comprimido en los contratos comprobados. El middleware de errores comunica415 genérico para `encoding.unsupported`, sin reflejar cuerpo, ruta privada o credencial.
- Los únicos parsers de cuerpos encontrados en `backend/src` son JSON global64KiB y raw PNG/JPEG2MiB. Ambos deshabilitan inflación; la carga conserva autorización antes del parser binario, validación real con sharp y asociación mediante If-Match. No se añadieron parsers alternativos.

### Regresión nueva: antes, actualización puntual y defensa adicional

Nuevo archivo `backend/test/httpSecurity.test.js`, ejecutado mediante `node --test backend/test/httpSecurity.test.js`. Usa Node hijo real, puerto aleatorio en loopback y TEMP para catálogo, imágenes, exportaciones y configuración privada. Retira variables ASTROVISOR heredadas; la contraseña aleatoria se transmite por IPC, no por argumentos ni logs. Inicializa solo datos de prueba, cierra el escritor/proceso y retira su directorio. No hay listeners globales de excepciones para mantener artificialmente vivo el servidor.

| Estado | Petición hostil sin token | Proceso / consulta posterior |
|---|---|---|
| Original1.20.8, antes de corregir | gzip, POST a ruta inexistente:404 | Salida1, Z_DATA_ERROR; health no disponible. La aserción de supervivencia falló, como se esperaba |
| Solo actualización1.20.9, parser global todavía anterior | Mismo caso:404 | Sigue activo, health200, sin Z_DATA_ERROR. Falló únicamente el rechazo415 aún pendiente |
|1.20.9 e inflate:false global | gzip y deflate adversos:415 | Tras observar el proceso200ms, health200/estado ok en ambos casos; sin Z_DATA_ERROR. Cierre explícito final: salida0 |

Además, en ese mismo proceso: JSON gzip válido415; JSON normal incompleto400; JSON normal excesivo413; login normal200; catálogo sin token401 y con token200/ETag catalogo-1; PATCH autorizado200; PNG y JPEG201; SVG disfrazado400; imagen excesiva413 y cuerpo binario comprimido415; sesión200, logout200 y sesión revocada401; health final200. Dos recursos normalizados en el almacén temporal. Logs comprobados sin contraseña ni token del ensayo.

La prueba independiente pasó1/1 (3539.8221ms); volvió a pasar dentro de la suite completa. Se conserva el rechazo real y la consulta posterior, no se sustituye por una aserción sobre la primera respuesta HTTP. La observación temporal no acredita supervivencia indefinida frente a cualquier entrada posible.

### Validaciones finales de esta corrección

Windows10.0.26200.0, Node24.21.0/npm11.0.0. Sin cambios a almacenamiento real.

| Comando | Resultado real |
|---|---|
| `npm ls body-parser --all` | Express4.22.3 → body-parser1.20.9; salida0 |
| `npm ls vite` | Vite6.4.5 directo y deduplicado para plugin-vue; salida0 |
| `npm audit` | found0 vulnerabilities |
| `npm audit --omit=dev` | found0 vulnerabilities |
| `npm test` |119/119,0 fallos/omitidas,16085.39ms, salida0 |
| `npm run test:web` |143/143,0 fallos/omitidas,5129.1098ms, salida0 |
| `npm run build` | Salida0,Vite6.4.5,51 módulos |
| `openspec validate s4-persistencia-documental --strict` | Cambio válido tras actualizar evidencia, salida0 |

Las dos vulnerabilidades identificadas ya no aparecen en las versiones resueltas según la auditoría consultada. Cero avisos npm no certifica ausencia de vulnerabilidades desconocidas. No hubo otros avisos de seguridad en esas dos salidas; se mantienen advertencias de imports desde public en el servidor Vite. No se repitió la instalación limpia temporal npm ci de la implementación anterior; sí se instalaron y verificaron los dos parches en este entorno.

Backend vuelve a comprobar alta automática/preview, PNG/JPEG, formatos/límites, autorización/If-Match,412, sustitución y regreso a automática, lectura pública, manifiesto/hashes, exportación por revisión, persistencia en otro proceso/reinicio/restauración y conservación del paquete anterior ante fallo de publicación. La nueva prueba eleva118→119 sin cambiar las pruebas de hashes ni las de mirada. No se observó fallo de mirada en esta ejecución frontend; la intermitencia anterior se conserva como antecedente.

### Servidor Vite y Chrome: resultados mixtos sin ocultarlos

Se conserva `vite --host 0.0.0.0`: permite acceso desde dispositivos de la LAN para los ensayos Homido existentes. Expone el servidor de desarrollo a interfaces de red; no utilizar como alojamiento institucional, limitar acceso a la red de pruebas. No se cambiaron allowedHosts, fs.allow/fs.deny ni proxy. El runner utiliza127.0.0.1, Vite real6.4.5, Express temporal y servidor estático independiente.

Se ejecutó cuatro veces `scripts/probar-portadas-hibridas.mjs`:

1. Original: salida1 por timeout30000ms esperando `#nuevo-id` al abrir la primera alta. Vite también informó reoptimización por cambio de lockfile; no se verificó relación causal.
2. Original: salida1 por el mismo timeout al abrir la segunda alta, después de preparar/guardar la primera.
3. Con diagnóstico temporal exclusivamente del estado del botón antes de Enter: salida0, flujo completo, PNG/JPEG públicos y paquete revisión3; Homido WebGL software por API y con503/Blob;0 pageerror,1280/360 sin overflow y0 controles de formulario sin etiqueta. En ambas observaciones `disabled:false`, `cargando:false`. Las tres capturas y resultados JSON corresponden a ese recorrido completo; las ejecuciones posteriores pueden regenerar las capturas previas a su punto de fallo, con los mismos datos sintéticos.
4. Diagnóstico retirado, arnés original restaurado: salida1, timeout al abrir la segunda alta.

La causa de la intermitencia **no está verificada**. Inspección: el arnés espera visibilidad, no habilitación, y usa focus/Enter; el botón se deshabilita durante carga/guardado y el panel también gestiona foco tras guardar. Estos son puntos para diagnóstico posterior, no prueba de la causa exacta. No se atribuye el fallo a Vite ni a mirada sin evidencia. No se modificaron panel, controlador de mirada, aserciones ni esperas para obtener un resultado favorable. No se presenta la última ejecución del arnés original como pasada. La ejecución completa acredita funcionamiento observado del dev server y flujo, pero la repetibilidad del arnés queda pendiente para la nueva auditoría de publicación. No se amplía esta corrección de seguridad hacia cambios de foco/UI.

### Capacidad y condiciones operativas

Se mantienen2MiB de entrada/salida por imagen,4096px por eje,8millones de píxeles, una imagen y dos decodificaciones simultáneas por proceso. Subida sin token401 y límites413 comprobados. Dos preparaciones autorizadas crean dos recursos aunque no se asocien; no hay cuota total, límite acumulado, retención automática ni rate limit de cargas. Una identidad administrativa válida puede agotar disco mediante cargas repetidas; el impacto sobre disponibilidad de imágenes y escrituras documentales es alto si comparten capacidad. No se hizo un ensayo destructivo de llenado ni se conoce la capacidad del destino institucional.

Clasificación para el entorno local comprobado: riesgo operativo autenticado, con una única identidad administrativa de permisos completos; no se identificó en estas pruebas una vía anónima o de una cuenta de permisos inferiores para crear recursos. Se conserva como condición que debe resolverse o aceptarse formalmente antes de despliegue institucional, no como garantía de capacidad suficiente ni como autorización para exponerlo. Requiere dimensionar/reservar almacenamiento, vigilar espacio y restringir quién usa la identidad, además de inventario/cuarentena offline revisada que conserve recursos referenciados por catálogo y backups. No se añadió subsistema de cuotas ni borrado automático. Los paquetes previos siguen autocontenidos.

### Alcance preservado y estado de entrega

Inventario ampliado:37 archivos, los35 originales más `backend/test/httpSecurity.test.js` y `frontend/package.json`. La corrección modifica dentro del inventario existente `backend/src/index.js`, `package-lock.json`, informe5D y documentos OpenSpec. El diagnóstico temporal del runner se retiró; no se conserva como funcionalidad ni cambio adicional. No se tocaron SVG, audio, semilla, pruebas temporizadas o componentes de mirada. El informe5C y2281 archivos ajenos conservan los hashes registrados abajo; índice vacío, HEAD y main sin cambios.

OpenSpec8.1 conserva el estado de desarrollo local; se registra la corrección de seguridad con pruebas reales, sin cerrar criterios físicos/institucionales ni declarar la publicación autorizada. Permanecen LF/CRLF, móvil/Homido físico, zoom nativo, HTTPS/ACL/volúmenes/capacidad institucionales, copia externa que incluya imágenes, derechos reales y pendientes previos. La auditoría bloqueante de abajo se conserva como historial; la presente sección es el estado posterior de seguridad. La nueva auditoría de publicación debe revisar también la intermitencia del arnés Chrome.

## Auditoría final de publicación — 2026-11-09

**Publicación detenida por un bloqueante reproducido de disponibilidad. No se creó commit ni se hizo push.** La autorización exige detenerse ante una vulnerabilidad explotable bloqueante. El apartado de dependencia anterior a esta auditoría registraba el aviso como pendiente de despliegue; la nueva reproducción demuestra impacto directo en el proceso Express y cambia esa clasificación. No se modificó código funcional ni se actualizaron dependencias durante esta auditoría.

### Bloqueante: parser JSON comprimido antes de autorización

`npm ls` confirma `express@4.22.3 → body-parser@1.20.8` (transitiva de producción). `backend/src/index.js` instala `express.json({limit:'64kb'})` antes de rutas y autenticación; la inflación HTTP está habilitada por defecto. La subida binaria nueva usa `inflate:false`, pero no protege este parser global. El [aviso de body-parser GHSA-27r3-jxmh-p828](https://github.com/advisories/GHSA-27r3-jxmh-p828) describe la excepción no capturada al recibir bytes posteriores a un cuerpo comprimido; indica versión corregida1.20.9 y alternativa `inflate:false`.

Reproducción ejecutada sin archivos de prueba permanentes, sin cuenta ni catálogo: proceso Node independiente importa `crearApp()`, no inicia escritor, ejecuta desde TEMP con variables ASTROVISOR retiradas y escucha únicamente127.0.0.1/puerto aleatorio. Una petición `POST /api/auditoria-inexistente`, sin Authorization, Content-Type application/json y Content-Encoding gzip, lleva un JSON sintético comprimido seguido de un byte cero y100KiB de relleno. Resultado observado: **404, seguido de terminación del proceso con código1, `Error: incorrect header check`, `Z_DATA_ERROR`, errno-3**. El proceso/directorio temporal se cerraron/retiraron. No se atacó ningún servidor existente ni se leyó almacenamiento real. El límite64kb sobre el contenido decodificado no impidió este caso.

Corrección mínima propuesta, **no aplicada**: deshabilitar inflación en el parser JSON global si no se necesitan solicitudes comprimidas, o actualizar de forma acotada la resolución transitiva a body-parser1.20.9 o posterior compatible. Express4.22.3 declara `~1.20.5`, que admite1.20.9. Añadir regresión en proceso hijo con cuerpo adverso y una consulta posterior que compruebe que sigue vivo, además de JSON normal/login/escritura. Una actualización del parser exige repetir regresiones HTTP y revisar lockfile; no requiere salto mayor de Express. No basta mantener `inflate:false` solo en la carga de imágenes.

### Segundo aviso: servidor de desarrollo Vite

`vite@6.4.4` es dependencia directa de desarrollo del frontend, compartida con plugin-vue. El [aviso oficial GHSA-8g5g-mxqh-grgj](https://github.com/vitejs/vite/security/advisories/GHSA-8g5g-mxqh-grgj) informa bypass de `server.fs.deny` mediante consultas; versión corregida6.4.5. El comando existente `vite --host 0.0.0.0` expone el servidor a la red. La explotación requiere además un archivo sensible dentro de las rutas permitidas y cubierto por una regla deny. **No se intentó descargar archivos privados reales ni se acredita una filtración observada.** El ensayo Chrome usa loopback y datos temporales; el aviso no convierte los archivos del build estático en un servidor Vite.

Propuesta no aplicada: actualizar Vite6.4.4→6.4.5 y probar desarrollo, proxy, build e integración. El rango directo `^6.2.6` y Node24.21.0 admiten esa versión; npm informa engines `^18.0.0 || ^20.0.0 || >=22.0.0`. Sigue siendo necesario comprobar regresiones del parche; no se afirma riesgo cero. No exponer el dev server como alojamiento institucional. No se ejecutó `npm audit fix`, ni actualizaciones automáticas mayores. Auditoría npm: salida1 por dos avisos, uno alto y otro moderado; no aviso de sharp en esa salida.

### Validaciones repetidas en esta auditoría

| Comprobación | Resultado real |
|---|---|
| Rama, HEAD local/remoto | `indigo/s4-persistencia-documental`, ambos `e56c60057d28a8d25558a7ea4875c455ee39429b` |
| main local/remoto | Ambos `f1058c9b10641c470d7d3e331a81f327af78fc8c`; sin operaciones sobre main |
| `npm test` | Primer intento sandbox:15 archivos no pudieron iniciarse por spawn EPERM; repetido con ejecución permitida:118/118,0 fallos/omitidas,8610.9554ms, salida0 |
| `npm run test:web` |143/143,0 fallos/omitidas,2241.2679ms, salida0; sin fallo de mirada observado en esta repetición |
| `npm run build` | Salida0,51 módulos,Vite6.4.4 |
| OpenSpec estricto | Cambio válido, salida0; repetido tras registrar el bloqueo |
| Chrome y pruebas específicas | Runner5D salida0; login, PNG/JPEG, preparación sin cambio de revisión, asociación, ficha, paquete por revisión y Homido WebGL software por API y con503.0 pageerror;1280/360 sin overflow y0 controles de formulario sin etiqueta |
| Persistencia/exportación | Suite backend vuelve a cubrir sustitución, lectura en proceso independiente, reinicio, restauración con imagen,412 y fallo de backup/puntero conservando datos/paquete anteriores |
| Instalación limpia | Se revisó la evidencia ya documentada de npm ci temporal y smoke sharp en Windows/Node24.21.0; no se repitió npm ci durante esta auditoría |

Las advertencias Vite sobre imports desde public siguen visibles. La intermitencia de mirada anterior permanece como antecedente, no como fallo observado en esta repetición; no se cambió controlador ni aserción. No se ensayaron zoom nativo, móvil/Homido físico, corte eléctrico ni entorno institucional.

### Resultado de integridad y alcance

Inventario comprobado: exactamente35 archivos existentes, coincidente con el listado al final; se excluyen `.gitignore`, informe5C y archivos ajenos. Sharp0.35.5 coincide entre manifiesto backend, lockfile y módulo instalado. Las tres capturas repetidas se inspeccionaron: solo datos sintéticos, sin tokens/contraseñas/configuración privada visibles. El análisis acotado de patrones de secretos no encontró coincidencias; no equivale a certificar ausencia de cualquier secreto posible. No se prepararon archivos en el índice ni se revisó un diff staged de publicación, porque el bloqueo se identificó antes de seleccionar archivos.

Carga: solo sesión válida y precondición; PNG/JPEG decodificados/reencodificados,2MiB entrada/salida,4096px por lado,8millones de píxeles, una imagen y dos decodificaciones simultáneas por proceso. Descriptores cerrados, nombres UUID del servidor, hash y formato comprobados antes de asociar, rechazo de hardlink/junction y de raíces solapadas. Respuestas públicas por libro/revisión con MIME/nosniff; sin rutas privadas o UUID de almacenamiento en proyección pública. No se encontró otro bloqueante confirmado en los flujos examinados.

La asociación usa el escritor existente con revisión dentro del bloqueo, y falla antes de publicar si no hay recurso íntegro. No hay eliminación automática de imágenes: ni sustitución ni cancelación borran recursos de catálogo/backups o paquetes; estos últimos contienen sus propias copias. El procedimiento conservador de inventario/cuarentena sigue documentado. **No existe cuota total ni límite acumulado de cargas**: el límite por imagen y de decodificaciones no limita crecimiento de disco ni todas las fases de E/S. Se requiere control de capacidad y limpieza offline revisada; no se añadió infraestructura ni automatización fuera del alcance.

Modalidades verificadas: heredada conserva bytes y PATCH directo rechaza título/autor incompatible409; transición explícita habilita automática o imagen. Automática se genera/valida con los textos actuales; imagen conserva sus bytes y declaraciones al editar texto, con aviso en panel. Paquetes mixtos mantienen extensiones/MIME/hash, publicación atómica y revisiones previas; respaldo funciona con estático disponible sin depender de Express para sus activos.

Se repitió hash de los2281 archivos ajenos: `ACF1CBE34F9B96E0F93EEFAD29AB0415DDB78615BBDD860B66292AE74A460B2C`, sin cambio. Informe5C: `DB3AE9BEB8ECEE868BF40247FF053AE91396C7D816F556C1CCAFFC2A277962FD`, intacto y sin versionar. No diff en SVG originales, audio o controlador de mirada. Se conservan la incidencia LF/CRLF y los pendientes físicos/operativos previos. OpenSpec8.1 registra implementación local, **no aprobación de publicación ni preparación institucional**; se añade este bloqueo sin cerrar otras tareas. Sin commit, push, PR, merge ni archivo OpenSpec.

## Alcance y estado

Implementación local sobre `indigo/s4-persistencia-documental`, HEAD `e56c60057d28a8d25558a7ea4875c455ee39429b`. El usuario autorizó ampliar8.1 para el MVP híbrido, sin acreditar derechos de imágenes concretas. No se hicieron commit, push, PR, merge ni archivo OpenSpec. `main` conserva `f1058c9b10641c470d7d3e331a81f327af78fc8c`. S4 no se declara completo.

Se mantienen `schemaVersion:1`, semilla, IDs, nueve relaciones, SVG heredados y audios. No se ejecutó migración ni se modificó almacenamiento real. El esquema añade una modalidad opcional; el software nuevo lee los registros anteriores sin transformarlos. Un rollback de código que desconozca esta modalidad requiere catálogo/activos compatibles y recuperación explícita; no equivale a poder arrancar main antiguo con cualquier catálogo nuevo.

## Contrato de las modalidades

| Modalidad | JSON privado y comportamiento |
|---|---|
| SVG heredado | Sin propiedad `portada`; misma `portadaIlustrativa:/libros-demo/<id>.svg`. Se conserva explícitamente. PATCH rechaza409 si cambia título/autor y no se sustituye la portada. No modifica los SVG |
| Automática | `portada:{tipo:'ilustrativa',plantilla:'cielo'|'guia'|'relatos',paleta:'azul'|'verde'|'violeta',procedencia,textoAlternativo}`. SVG en memoria desde título/autor vigentes; validación tipográfica anterior conservada |
| Imagen autorizada | `portada:{tipo:'imagen-autorizada',recursoId,formato:'png'|'jpeg',sha256,bytes,ancho,alto,procedencia,permiso,textoAlternativo}`. Ruta documental `/api/contenidos/libros/<id>/portada.png` o `.jpg`. Recurso inmutable del servidor; procedencia/permiso/alternativa obligatorios, máximo1000 caracteres cada uno |

Los metadatos de permiso son una declaración del administrador: no se comprobó titularidad de una imagen real ni se implementó gestión jurídica de derechos. Todas las imágenes del ensayo son rectángulos sintéticos generados para pruebas. No se presenta una portada ilustrativa como fotografía de una edición original ni una imagen declarada como aprobación institucional.

Los tres registros previos no cambian de modalidad automáticamente. Al editar se puede conservar el SVG fijo o sustituirlo explícitamente. No se ofrece volver a un SVG heredado después de haberlo sustituido y confirmado. Para automática e imagen se permite editar título/autor; en imagen aparece el aviso de revisar la correspondencia. Cambiar esos textos no modifica sus bytes. Al regresar a automática se exige preview para validar ajuste; la nueva portada usa los textos vigentes.

## Preparación, asociación y consulta

1. `POST /api/admin/imagenes`: Bearer válido, `If-Match:"catalogo-N"`, cuerpo binario `image/png` o `image/jpeg`, no multipart. La revisión de preparación se compara con el catálogo actual. Preparar no reserva esa revisión ni escribe el catálogo.
2. El servidor valida, decodifica completamente y normaliza. Publica un archivo completo con nombre UUID generado por servidor, no utiliza nombre/ruta del cliente. Solo devuelve201 después de sincronizar el archivo, publicar por enlace exclusivo, retirar el temporal y volver a comprobar integridad. Respuesta `{recurso,previsualizacion,preparada:true,asociada:false}`. Preview data URL de bytes normalizados limitado por el tamaño del recurso; el cliente lo muestra mediante Blob temporal.
3. El usuario aporta procedencia, permiso y texto alternativo. `POST /api/admin/libros` o `PATCH /api/admin/libros/:id` asocia el descriptor mediante el escritor existente y **vuelve a comprobar revisión dentro de su cola/bloqueo**, validación documental, existencia/hash/formato/dimensiones de la imagen, respaldo y reemplazo del JSON.
4. Un201 de subida no confirma un libro. Un412 o fallo de respaldo/persistencia conserva el catálogo anterior y la imagen preparada sin asociar. No se reintenta automáticamente un POST/PATCH. Guardado confirmado con GET posterior fallido sigue informado como confirmado y exige recarga antes de otra escritura.
5. `GET /api/contenidos/libros/:id/portada.:formato?revision=N` sirve la portada dinámica asociada vigente con SVG/PNG/JPEG real, `nosniff`, CSP, ETag y304. Revisión distinta409; ruta/ID inválido400, libro o formato incompatible404, almacenamiento no disponible503. Los SVG heredados conservan su ruta estática. No hay endpoint público por UUID para imágenes preparadas.

La comprobación del recurso se repite al leer el catálogo y antes de confirmar una restauración. Un catálogo que referencia un recurso ausente/corrupto falla cerrado; no se reinicializa ni se oculta el problema mediante semilla. Catálogos sin imágenes no requieren el almacén de imágenes para su lectura normal.

## Validación y almacenamiento

Nuevo entorno: **`ASTROVISOR_COVERS_DIR`**, absoluto y externo al checkout y a cualquier raíz web. Debe estar separado de `ASTROVISOR_DATA_DIR`, del directorio de `ASTROVISOR_ADMIN_FILE`, de exportaciones y de su control hermano. Ejemplo de distribución conceptual, sin configurar destinos reales:

```text
<privado>/datos/catalogo.json y backups/
<privado>/identidad/admin.json
<privado>/imagenes/<UUID>.png o <UUID>.jpg
<publicaciones>/homido/revisiones/N/...
<publicaciones>/.homido-control/...
```

No montar `<privado>` como contenido web. La validación de rutas no puede descubrir todas las raíces públicas externas del operador: ACL, cuenta del servicio y montajes deben verificarse antes del despliegue. Se rechazan rutas internas, solapamientos, directorios/archivos enlazados y hardlinks del recurso; no hay destinos de escritura proporcionados por el usuario. Archivos privados con modo0600 y directorios0700 solicitados; esto no acredita ACL de Windows.

Límites implementados: entrada y normalizado de hasta **2MiB**, dimensiones por eje hasta4096, hasta8.000.000 píxeles y una sola página/imagen. Firma PNG/JPEG y formato real deben concordar con MIME. `sharp` con `failOn:'warning'`, `limitInputPixels` y reencode completo; no basta extensión, cabecera o `metadata()` sin decodificar. Rechaza SVG/HTML, formatos desconocidos, corrupción, truncado, exceso y MIME falso. No se copian EXIF/ICC/XMP/comentarios; se aplica orientación antes de retirar metadatos, sin recortar o redimensionar. Dos decodificaciones simultáneas como máximo; exceso503. Entrada comprimida HTTP no se infla en el parser de subida.

`imageResources.js` comprueba SHA256, tamaño, formato, dimensiones y archivo regular en cada lectura. La publicación del archivo utiliza temporal propio, sync/cierre y enlace exclusivo; no sobrescribe recursos existentes. No se prometen garantías frente a pérdida de energía: la sincronización de archivo no acredita la durabilidad de la entrada de directorio. Los límites de NTFS/sync de directorio ya registrados en2B permanecen; el escritor documental sigue informando `durabilidadPendiente` cuando corresponde. No se ensayó fallo eléctrico ni almacenamiento institucional.

### Dependencia e instalación

Se añadió únicamente **`sharp:0.35.5`** al backend y su resolución en `package-lock.json`. No se cambió Express/Vite deliberadamente ni se ejecutó `npm audit fix`. Sharp aporta decoder y reencode para evitar implementar un parser de imágenes propio. Su documentación describe [límites del constructor](https://sharp.pixelplumbing.com/api-constructor/), [salida y eliminación predeterminada de metadatos](https://sharp.pixelplumbing.com/api-output/#keepmetadata) y [binarios/plataformas de instalación](https://sharp.pixelplumbing.com/install/).

Verificación real: copia de los tres manifiestos y lockfile a un directorio temporal nuevo; `npm ci --no-audit --no-fund` instaló122 paquetes y terminó0. Importar sharp y generar/leer PNG funcionó: sharp0.35.5, libvips8.18.7 en Windows con Node24.21.0/npm11.0.0. No se reinstaló el workspace, no se compiló manualmente libvips y no se comprobó Linux/macOS. Conservar dependencias opcionales correspondientes a la plataforma; un despliegue debe repetir su instalación limpia y prueba nativa.

`npm audit --json` reportó **body-parser alto** (`GHSA-27r3-jxmh-p828`, instalado anterior a1.20.9) y **Vite moderado** (`GHSA-8g5g-mxqh-grgj`,6.4.4). Estos paquetes no son la nueva dependencia sharp y sus entradas no fueron actualizadas en este cambio. Son pendientes de revisión/actualización antes de despliegue; no se declara el árbol libre de vulnerabilidades. El parser binario nuevo deshabilita inflación, pero eso no constituye reparación del parser JSON anterior ni del servidor de desarrollo Vite. La salida de instalación inicialmente mencionó solo un aviso alto; la auditoría explícita posterior informó ambos.

## Panel, web y Homido

El formulario existente incorpora selector de modalidad, archivo PNG/JPEG, declaraciones obligatorias y preview. En alta la automática sigue seleccionada por defecto. Se conservan año, enlace y relaciones; varias constelaciones mantienen motivos independientes. No se añadieron CSS, galería, filtros, IA, búsqueda de cubiertas, cloud ni administración compleja de derechos.

El borrador y token siguen solo en memoria. Ante401 se retira el token y se conserva descriptor/borrador sin credenciales; recuperación explícita tras login de la misma identidad y GET, comparando ETag. Si cambió revisión, se bloquea guardar. No se conserva el Blob de preview en el borrador recuperado; la imagen preparada sigue en servidor y el descriptor puede recuperarse. Para verla otra vez antes de confirmar se puede volver a seleccionar/preparar el archivo. Recargar/cerrar pierde el borrador. No se almacenan archivos, passwords o tokens en almacenamiento persistente del navegador.

Proyección pública incluye exclusivamente tipo/formato/procedencia/permiso/alternativa necesarios para imagen, sin ruta privada ni UUID del almacén. El campo compatible `portadaIlustrativa` conserva su nombre, aunque pueda apuntar a PNG/JPEG. La ficha distingue imagen declarada de ilustración y muestra los créditos como texto. Navegación bibliográfica sigue por ID y constelación.

Exportador copia bytes normalizados verificados a `revisiones/N/portadas/<libroId>.png|jpg`; conserva SVG para otras modalidades. JSON público y manifiesto mantienen referencias/extensión/hash coherentes. Lectores y servidor estático admiten solo svg/png/jpg para portadas; Blob con MIME correspondiente y registro por identidad. Homido online usa la imagen asociada, y el respaldo usa sus propios bytes verificados. Una nueva revisión no elimina ni sobrescribe los paquetes anteriores. Staging, puntero atómico, bloqueo de exportación, ausencia de retroceso e informe de publicación pendiente se mantienen. Sin cambios en mirada, dwell, narraciones, controles, WAV o transcripciones.

## Recuperación y recursos sin asociar

No existe eliminación automática de recursos ni endpoint DELETE. Esto conserva imágenes usadas por catálogo y backups previos; el coste es crecimiento de disco y recursos preparados que finalmente no se utilizan.

Procedimiento manual conservador:

1. Detener API y cualquier preparación/exportación. Conservar copia externa del catálogo, backups, evidencia y almacén de imágenes como conjunto. No copiar credenciales con la publicación pública.
2. Inventariar UUID/formato/hash de todos los `portada.tipo=imagen-autorizada` del catálogo y de **todos los respaldos que se pretenda conservar/restaurar**, además de evidencias de operaciones inconclusas. Una copia inválida/no comprendida exige investigación; no descartarla para justificar borrado.
3. Comparar con archivos del almacén. Una imagen referenciada no se retira. Si un recurso falta, recuperarlo desde copia privada y verificar exactamente descriptor/hash, no sustituirlo bajo el mismo UUID con otra imagen.
4. Recursos sin referencia pueden ponerse en cuarentena externa privada, sin borrar de inmediato y solo tras revisar las operaciones inconclusas. No hay herramienta automática de GC implementada ni procedimiento ensayado de eliminación en producción. Los paquetes públicos existentes son autocontenidos; no necesitan el almacén privado para mostrar su revisión.
5. Para restaurar JSON, usar la CLI previa con API detenida y última revisión conocida; ahora valida también recursos antes del reemplazo. CLI2 sigue significando catálogo YA restaurado con limpieza pendiente, NO repetir automáticamente. CLI1 es no confirmado. No retirar locks activos o por antigüedad.

Fallo antes de publicar un recurso: no hay asociación; puede quedar temporal privado si tampoco se consigue limpiar. Fallo después del enlace/antes de respuesta: puede quedar recurso no asociado y la subida no se informa exitosa. Consultar/inventariar antes de automatizar reintentos. La creación/edición documental no se repite para recuperar una exportación o una limpieza.

## Pruebas ejecutadas

Entorno Windows10.0.26200.0, Node24.21.0/npm11.0.0, Chrome headless156.0.8078.80. Directorios aislados externos al checkout y credenciales aleatorias temporales, eliminados al terminar las suites/navegador. No cuenta institucional ni catálogo real.

| Comando final | Resultado |
|---|---|
| `npm test` | **118/118**, salida0,0 omitidas,8836.3283ms |
| `npm run test:web` | **143/143**, salida0,0 omitidas,2277.1557ms |
| `npm run build` | Salida0,51 módulos,Vite6.4.4 |
| `openspec validate s4-persistencia-documental --strict` | Salida0, cambio válido después de actualizar las tareas y el diseño |
| `node scripts/probar-portadas-hibridas.mjs` con Playwright externo | Salida0, login/PNG/JPEG/panel/web/paquete/Homido software;0 pageerror |
| Instalación temporal `npm ci` + smoke sharp | Salida0,122 paquetes; PNG decodificado |

Mapa de los20 criterios solicitados:

| Criterio | Evidencia |
|---|---|
| 1 Alta automática | Regresiones existentes `documentAdmin`, `alta-libros`, preview/endpoint SVG y cambio heredada→automática |
| 2–3 PNG/JPEG | `imagenes.test.js` y `portadas-hibridas.test.js`: ambos formatos normalizados y altas HTTP; navegador completa ambas |
| 4 Entradas inválidas/excesivas | SVG/HTML, MIME falso, truncado, bytes,4097px y9 millones de píxeles rechazados |
| 5 Autorización | Subida401 sin token,428 sin If-Match,412 obsoleto; middleware de sesión existente. Regresiones globales cubren expiración/revocación |
| 6 Preparada sin catálogo | Subida201 no avanza revisión; no hay descarga pública por UUID; cancelar no hace POST documental |
| 7 Error persistencia | Obstáculo en backups tras preparar imagen:503, revisión1 y archivo preparado conservados |
| 8 Conflicto412 | Asociación con revisión obsoleta rechazada; frontend conserva descriptor y no repite envío |
| 9–10 Reemplazo/regreso | HTTP reemplaza imagen por otra preparada y luego automática; paquetes anteriores conservados |
| 11 Título/autor dinámicos | Sustitución explícita de SVG fijo por automática con ambos campos; SVG público vigente refleja textos; imagen conserva hash al cambiar texto |
| 12 Estática incoherente | PATCH directo de título y autor rechaza409 mientras sigue heredada |
| 13 SVG originales | Prueba de hashes anterior intacta y suite118/118; no diff en los tres archivos. Incidencia LF/CRLF no corregida artificialmente |
| 14 Consulta pública | GET PNG/JPEG, MIME/nosniff/ETag/304,409 obsoleta; ficha Chrome decodifica ambas |
| 15–16 Exportación/hashes | Paquetes PNG/JPEG verificados, bytes iguales a normalizado, extensión real, lector HTTP/Blob con MIME y Homido API/paquete |
| 17 Publicación fallida | Error EIO de puntero conserva revisión5 publicada y paquete válido, después de crear imágenes y regresar a automática |
| 18 Reinicio/persistencia | Proceso Node independiente lee SHA persistido; Express cierra/reabre; restauración de backup con imagen devuelve revisión superior a6 y hash original |
| 19 Privacidad | Rutas/UUID arbitrarios, separación de raíces, hardlink y junction rechazados; sin archivos en public/dist creados por el alta. Las capturas contienen solo datos sintéticos, no tokens/passwords/rutas privadas |
| 20 Panel accesible | Chrome1280/360 sin overflow y cero controles del formulario sin etiqueta; Enter abre alta, foco/Tab y cancelar; regresiones401/412 y confirmación anterior conservadas. No WCAG integral |

### Fallos iniciales, revisión y repeticiones

- Pruebas HTTP nuevas fallaron primero por endpoint ausente404 y por aceptación200 del cambio de título estático que debía devolver409. La nueva prueba de almacén inicialmente no pudo importar el módulo aún inexistente; tras implementarlo pasó. No se presenta ese error de importación como una prueba semántica fallida de decodificación.
- Primer backend completo después del nuevo bloqueo de estáticas falló en cinco casos antiguos de edición/concurrencia/validación/backup/reinicio que cambiaban título de un libro fijo. Se mantuvo su propósito usando año editable para persistencia/concurrencia; título inválido se valida400 antes de evaluar coherencia. Se añadió la regresión explícita409 y transición. No se retiraron controles de revisión ni metadatos.
- Dos expectativas frontend anteriores prohibían tener título/autor en todo borrador o enviarlos por servicio. Se adaptaron a la nueva modalidad editable y a la prohibición de campos privados; se conservan rechazo sin sesión y ETag coherente. Nuevas regresiones comprueban solo lectura heredada y descriptor recuperado401, misma revisión y revisión cambiada.
- Primera web completa140/141: `GazeController avanza por las etapas 0%,33%,66% y confirma en100%`, falta `stagesVisited.includes('33%')`, duración185.6891ms. Repetición completa141/141; después de ampliar pruebas híbridas, suite final143/143. No se modificaron controlador ni aserciones. No se determinó la causa exacta del retraso; la hipótesis temporal histórica no se convierte en diagnóstico acreditado de esta ejecución.
- Una ampliación del arnés de restauración tuvo error de sintaxis; se corrigió el arnés y la prueba5/5 pasó. No fue error del producto ni se omitió la restauración.
- Revisión final separada de solo lectura detectó que `directorioExportacion({destino,...})` comparaba imágenes contra rutas de entorno en vez de argumentos efectivos. Regresión observada roja: no rechazaba exportar sobre imágenes. Corrección pasa rutas efectivas al validador compartido; regresión verde cubre igualdad, anidamiento, control hermano, catálogo y credenciales. Suites118/143 posteriores correctas. No se solicitó aprobación a otros integrantes ni se hizo nueva revisión ajena del equipo.

### Evidencia de navegador

Runner reproducible nuevo, con `ASTROVISOR_PLAYWRIGHT_MODULE` apuntando al módulo Playwright externo instalado. No se añadieron dependencias de navegador al producto. Ejecuta API/Vite/estático en loopback con puertos aleatorios e imágenes/identidad temporales; cierra y retira sus datos en finally.

- [Formulario1280](evidencias-s4-5d/panel-1280.png).
- [Formulario360](evidencias-s4-5d/panel-360.png).
- [Ficha JPEG360](evidencias-s4-5d/ficha-jpeg-360.png).
- [Resultados](evidencias-s4-5d/resultados.json).

Panel: documento/clientWidth1280/1280 y360/360,0 controles sin etiqueta en el formulario. Subir PNG no avanza revisión1; confirmar PNG→2, JPEG→3, relación Orión/Escorpio. Cambiar heredada a automática habilita texto, preview funciona; cancelar conserva revisión3. Fichas PNG/JPEG cargan con alt y procedencia/permiso visibles. Lector del paquete devuelve MIME image/png e image/jpeg en revisión3. Homido Chrome/ANGLE SwiftShader con diagnóstico existente `diag=1&aa=0`: las dos cubiertas tienen naturalWidth180 por API; con API503 ambas cargan como Blob del paquete. Selecciones de escena disparadas mediante eventos DOM, sin prueba física de dwell.0 errores JavaScript en el ensayo final.

Tres capturas inspeccionadas: datos sintéticos y ninguna contraseña/token o configuración privada visible. Se mantuvieron las advertencias Vite sobre imports desde public; build correcto. Detector Impeccable señaló el borde decorativo preexistente de BibliotecaView; no se cambió CSS ni diseño para resolver un aviso ajeno al alcance.

## OpenSpec y pendientes

8.1 y sus subtareas registran el desarrollo local autorizado, no derechos sobre activos reales ni uso institucional. El plan D1–D5 recoge pruebas/código/revisión/evidencia; proposal/design/spec explicitan la ampliación de8.1. No se cierran0.2,0.4,1.4c,2.2,3.5,5.5,6.4,7.3,7.5 o8.6 por este incremento.5C queda como evaluación histórica previa, sin sobrescribir su informe local.

Siguen pendientes: portabilidad de hashes LF/CRLF, zoom nativo, móvil/Homido físico, sensores/escucha humana, HTTPS/ACL/TTY real y capacidad en destino, raíces/volúmenes persistentes institucionales, respaldo externo real que incluya imágenes, copia/ensayo de migración operativa, aprobaciones/coordinación y autorización de integración. Dependencias con avisos npm requieren revisión antes del despliegue. No hay limpieza automática ni cuota total del almacén; vigilar espacio y recuperar huérfanos mediante procedimiento conservador. El límite tipográfico de SVG sigue siendo el de3B, no admite todo Unicode.

Se conservaron2281 archivos ajenos con SHA256 agregado inicial/final `ACF1CBE34F9B96E0F93EEFAD29AB0415DDB78615BBDD860B66292AE74A460B2C`, incluyendo .gitignore y presentaciones. El informe local5C permaneció intacto (SHA256 `DB3AE9BEB8ECEE868BF40247FF053AE91396C7D816F556C1CCAFFC2A277962FD`). Índice Git vacío y HEAD/main sin cambios. No se configura ni acredita entorno institucional.

`git diff --check` con conversión de finales de línea desactivada señaló únicamente la línea vacía final preexistente de `.gitignore`; se conservó. No se eliminó para aparentar un árbol limpio. La carpeta temporal propia de instalación npm se retiró tras verificar su ruta absoluta dentro de TEMP.

## Inventario de Etapa5D

Inventario original:35 archivos; corrección de seguridad añade2 y auditoría de estabilidad añade6 evidencias:43 en total. Las rutas son relativas a la raíz de la aplicación. Excluyen los cambios locales preexistentes y el informe5C. Este es el inventario exclusivo seleccionado para la publicación condicionada autorizada.

- `.env.example`
- `backend/package.json`
- `backend/src/index.js`
- `backend/src/services/catalogo.js`
- `backend/src/services/catalogoEdicion.js`
- `backend/src/services/documentRepository.js`
- `backend/src/services/documentWriter.js`
- `backend/src/services/homidoExport.js`
- `backend/src/services/imageResources.js`
- `backend/src/services/portadas.js`
- `backend/test/documentAdmin.test.js`
- `backend/test/imagenes.test.js`
- `backend/test/portadas-hibridas.test.js`
- `docs/evidencias-s4-5d/ficha-jpeg-360.png`
- `docs/evidencias-s4-5d/panel-1280.png`
- `docs/evidencias-s4-5d/panel-360.png`
- `docs/evidencias-s4-5d/resultados.json`
- `docs/PRUEBA-S4-ETAPA5D.md`
- `frontend/public/prueba-homido/js/estanteria-3d.js`
- `frontend/public/prueba-homido/js/paquete-publico.js`
- `frontend/public/prueba-homido/js/respaldo-publicado.js`
- `frontend/src/composables/useEditorCatalogo.js`
- `frontend/src/services/catalogoAdminService.js`
- `frontend/src/services/librosDemoService.js`
- `frontend/src/views/AdminPanelView.vue`
- `frontend/src/views/BibliotecaView.vue`
- `frontend/test/catalogo-editor.test.js`
- `frontend/test/portadas-hibridas.test.js`
- `openspec/changes/s4-persistencia-documental/design.md`
- `openspec/changes/s4-persistencia-documental/proposal.md`
- `openspec/changes/s4-persistencia-documental/specs/gestion-documental/spec.md`
- `openspec/changes/s4-persistencia-documental/tasks.md`
- `package-lock.json`
- `scripts/probar-portadas-hibridas.mjs`
- `scripts/servir-homido-dev.mjs`

Adicionales autorizados para la corrección de seguridad:

- `backend/test/httpSecurity.test.js`
- `frontend/package.json`

Evidencias adicionales de estabilidad autorizadas:

- `docs/evidencias-s4-5d/timeout-diagnostico.json`
- `docs/evidencias-s4-5d/timeout-estado.png`
- `docs/evidencias-s4-5d/estabilidad-formulario.json`
- `docs/evidencias-s4-5d/estabilidad-panel.json`
- `docs/evidencias-s4-5d/estabilidad-completo-1.json`
- `docs/evidencias-s4-5d/estabilidad-completo-2.json`
