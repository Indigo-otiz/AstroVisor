# S4 Etapa 4B — exportación pública Homido

## Estado de la entrega

Implementación sobre `7f6ec91c679f117d31eeb9fcb77f84f8c8b79c87`, rama `indigo/s4-persistencia-documental`. El usuario autorizó posteriormente auditoría final y commit/push exclusivamente de Etapa 4B si no se detectan bloqueantes. Sin autorización de merge ni archivo OpenSpec. Suites automatizadas y build repetidos correctamente; evidencia de navegador indicada abajo.

## Arquitectura y separación

El exportador lee una instantánea válida del catálogo privado y reutiliza `proyectarRecorridos`, `proyectarLibros` y `generarPortada`. Solo copia las tres portadas SVG originales y los tres WAV autorizados, o renderiza la plantilla permitida del libro nuevo. No copia directorios completos ni modifica el catálogo administrativo, los fixtures históricos o los archivos públicos originales.

Configuración de ejemplo; son rutas ilustrativas, no directorios institucionales configurados:

```powershell
$env:ASTROVISOR_DATA_DIR='C:\AstroVisor\privado\datos'
$env:ASTROVISOR_ADMIN_FILE='C:\AstroVisor\privado\identidad\admin.json'
$env:ASTROVISOR_PUBLIC_EXPORT_DIR='C:\AstroVisor\publicado'
```

Las rutas deben ser absolutas y externas al checkout; publicación y control tampoco pueden solaparse con datos o directorio de credenciales. Se comprueban los ancestros físicos para detectar enlaces. La configuración administrativa sirve para excluir su directorio: no se incluye en el paquete. Los archivos públicos se rechazan si son enlaces simbólicos o tienen enlaces físicos adicionales.

Estructura exacta generada para cada revisión N:

```text
publicado/
  ultima.json
  revisiones/N/
    manifiesto.json
    recorridos-demo.json
    libros.json
    portadas/<libroId>.svg
    audio/orion-kokoro-v1.wav
    audio/osa-mayor-kokoro-v1.wav
    audio/escorpio-kokoro-v1.wav
.publicado-control/             # hermano externo; no servir por HTTP
  exportador.lock              # solo mientras se exporta, o incidencia pendiente
  staging-<nonce>/             # transitorio
  ultima-<nonce>.tmp           # transitorio
```

El puntero contiene `schemaVersion:1`, `revision` entera positiva, `manifiesto:"revisiones/N/manifiesto.json"` y `sha256` del manifiesto. Este contiene `schemaVersion:1`, `revision`, `fecha` ISO, `datos:"recorridos-demo.json"`, `libros:"libros.json"` y `archivos:[{ruta,sha256,bytes}]`. Se validan rutas cerradas, duplicados, relaciones, referencias, revisión y recursos declarados/utilizados. Límites: 512 archivos, 32 MiB por archivo y 64 MiB en total. Puntero y manifiesto tienen además límites de lectura de 64 KiB y 256 KiB en navegador.

## Publicación y resultado real

```powershell
npm run exportar:homido
```

No acepta argumentos de rutas o credenciales. Puede cargar variables privadas del servidor; nunca versionar ese archivo de configuración.

1. Adquiere bloqueo exclusivo `wx` con PID, host y nonce; otro proceso falla cerrado.
2. Lee la instantánea y rechaza retroceder respecto al puntero publicado.
3. Genera staging externo, sincroniza archivos y verifica formato, hashes, referencias y ausencia de archivos no declarados.
4. Renombra el directorio completo a `revisiones/N`. Una revisión existente debe coincidir; no se sobrescribe.
5. Escribe/sincroniza el puntero temporal y lo sustituye mediante `rename`. Este es el punto de confirmación.
6. Informa sincronización de directorio y limpieza por separado; no convierte una publicación confirmada en error de publicación.

Salida estructurada: `revision`, `yaPublicada`, `confirmada`, `limpiezaPendiente`, `durabilidadPendiente`. CLI: 0 para confirmación sin limpieza pendiente; 1 para publicación no confirmada; 2 para confirmación con limpieza pendiente y mensaje explícito de no repetir automáticamente. La advertencia de durabilidad no cambia por sí sola el código 0. Los errores de CLI no imprimen rutas privadas, secretos ni el contenido del catálogo.

El guardado POST/PATCH no ejecuta exportación ni trabajo en segundo plano. Conserva su confirmación y consulta el estado del paquete; devuelve `respaldoPublico`, `revisionPublicada` y, si no pudo comprobarlo, `estadoPublicacionNoVerificado`. La consulta verifica todos los activos y espera como máximo 500 ms; el trabajo de lectura ya iniciado no se cancela al vencer ese plazo. El panel identifica publicación pendiente o revisión publicada anterior. La reexportación no repite POST/PATCH.

## Recuperación operativa

- Fallo anterior al cambio de puntero: la publicación anterior sigue seleccionada. Resolver permisos, espacio, configuración o integridad y repetir solo `exportar:homido`; no repetir la edición documental. Un directorio completo huérfano de esa revisión se reutiliza si coincide.
- Paquete inmutable existente distinto, corrupto o incompleto: rechazo y revisión manual. No sobrescribirlo ni eliminarlo mientras pueda haber lectores activos. La recuperación exige una copia verificada y coordinación operativa; no existe reparación automática.
- Confirmación con limpieza pendiente: el puntero ya cambió. No automatizar un nuevo intento. Un `exportador.lock` conservado puede impedir nuevas exportaciones; verificar primero la publicación y después intervenir en el control.
- Bloqueo abandonado: detener y comprobar todos los exportadores del host, cotejar PID, host, nonce e identidad del proceso (un PID puede reutilizarse). Solo después de acreditar que no hay escritor activo retirar exclusivamente el bloqueo identificado. No retirarlo por antigüedad ni ante dudas, ni borrar recursivamente el directorio de control.
- No se implementa recolección de revisiones antiguas: vigilar espacio. No retirar paquetes usados por lectores activos.
- Las exportaciones públicas no sustituyen los respaldos privados ni la copia externa pendiente en 3.5.

Se sincronizan archivos antes del reemplazo. En Windows se acepta la falta de soporte de sincronización de directorio (`EPERM`, `EISDIR`, `EINVAL`, `ENOTSUP`) con `durabilidadPendiente`. Tras confirmar el puntero, otros fallos de esa sincronización también quedan como advertencia. No se acredita resistencia a corte eléctrico, fallo del volumen o pérdida de hardware. La atomicidad del reemplazo depende de las operaciones del sistema de archivos; no se ensayó un corte eléctrico.

## Lectura y desarrollo local

Homido intenta API, luego paquete publicado verificado y por último respaldo histórico con aviso de revisión no verificada. Fija el manifiesto una sola vez y descarga/verifica todos sus archivos antes de usar los datos. Genera URLs Blob a partir de los bytes comprobados para portadas/audio; no consulta `/api/` por activos del respaldo. Escena y narración comparten la misma carga. La salida definitiva revoca URLs; el retorno mediante BFCache conserva las de la página cacheada.

La ficha 2D utiliza el paquete verificado si falla la API y muestra el aviso; no utiliza silenciosamente el catálogo compilado. Se conserva el origen por constelación y la navegación por ID. La revisión queda fijada hasta recargar. El aviso presenta origen, fecha, revisión y posible desactualización; no afirma conocer la revisión actual con API caída.

Servidor separado de prueba, solo GET/HEAD y loopback, sin listar directorios:

```powershell
npm run dev:homido:respaldo
```

Puerto predeterminado 3002, configurable mediante `ASTROVISOR_EXPORT_PORT`. En otra terminal de desarrollo, antes de iniciar Vite:

```powershell
$env:ASTROVISOR_EXPORT_ORIGIN='http://127.0.0.1:3002'
npm run dev:web
```

El proxy opcional admite exclusivamente origen HTTP local sin credenciales, ruta adicional, consulta ni fragmento. Mapea `/respaldo-homido/` al servidor externo de desarrollo. No convierte Express en servidor de respaldo. En producción falta aprobar/configurar el alias público y el alojamiento independiente (8.6); no se instaló infraestructura institucional.

Los hashes comprueban integridad respecto al puntero recibido, no autenticidad de un publicador comprometido. Permisos de publicación, HTTPS, ACL, volumen y alias deben comprobarse en despliegue. Un origen que controle puntero, manifiesto y archivos puede sustituirlos conjuntamente. El lector conserva los activos en memoria y exige `crypto.subtle` (HTTPS o contexto local seguro). Sin API, paquete accesible ni histórico, se muestra error; no hay nueva promesa offline.

## Pruebas y resultados reales

Directorios, credenciales y catálogos de pruebas son temporales; no se creó cuenta institucional ni se modificó almacenamiento real.

| Comprobación | Resultado observado |
|---|---|
| `npm test` | 107/107, sin fallos, última ejecución tras los cambios de código actuales |
| `backend/test/homidoExport.test.js` | 10/10: proyección completa, bytes originales, libro compartido/renombrado, privacidad, fallos de staging/directorio/puntero/limpieza, exclusión, idempotencia y no retroceso |
| `backend/test/homidoExport.integration.test.js` | 1/1: Express y estático en procesos separados; guardado, fallo de exportación, reexportación sin PATCH, reinicio y archivos servidos con Express detenido |
| `frontend/test/homido-publicado.test.js` aislado | 5/5: carga HTTP real, blobs/audio, ficha con API 503, hashes/rutas/cancelación, BFCache, histórico y ausencia total |
| `npm run test:web` completo | 137/137, sin fallos; incluye tres regresiones de mensajes publicado/pendiente del editor. Repetición anterior 134/134. Antes falló por igualdad estricta en `catalogo-integracion.test.js`: faltaba el nuevo campo `publicacionHomido` en el esperado. Expectativa corregida y suite completa repetida |
| `npm run build` | Correcto: Vite 6.4.4, 51 módulos. Primer intento limitado por `spawn EPERM`; ejecución aprobada fuera del sandbox completada |
| `openspec validate s4-persistencia-documental --strict` | Correcto; repetido después de actualizar design/tasks e informe |
| Chrome/WebGL de software, Etapa 4B | Chrome headless 156.0.8078.80, 1280×900, ANGLE SwiftShader, antialias desactivado mediante diagnóstico existente. Flujo completado, sin errores JavaScript registrados |
| Homido/móvil físicos, zoom nativo, despliegue | No ejecutados |

Integración HTTP comprobada: exportación 1 → PATCH autorizado revisión 2 → API pública actualizada y publicación 1 pendiente → fallo inyectado de exportación conserva puntero 1 y catálogo 2 → detener Express → exportar 2 sin repetir PATCH → estático separado sirve todos los JSON, SVG y WAV con bytes correctos → reiniciar Express conserva revisión 2. Retirar un audio del paquete provoca estado no verificable, sin anunciar publicación válida.

Concurrencia comprobada entre dos procesos: el primero pausa después de sincronizar el bloqueo; el segundo falla sin retirarlo; el primero continúa y publica. Una invocación posterior de CLI reconoce la revisión ya publicada.

Fallos encontrados y corregidos: liberación de blobs al entrar en BFCache (ahora solo al salir definitivamente); estado publicado que antes comprobaba solo manifiesto (ahora verifica archivos completos); posible solapamiento del control hermano con identidad privada (ahora excluido). Se añadieron regresiones. Errores de fixtures corregidos: ruta de PATCH era incorrecta, argumento URL de proceso hijo, mocks de URL/ventana y expectativa de `publicacionHomido`. No se modificó el controlador de mirada. Las dos últimas suites web completas pasaron; no se observó fallo intermitente de mirada en esas ejecuciones, sin inferir ausencia de intermitencias futuras.

Una repetición elevada de `npm run test:web` fue rechazada antes de ejecutarse: la revisión automática no pudo completarse por límite de uso. No fue un dictamen de inseguridad ni un fallo de la prueba; no se evitó el control. Tras pasar la hora de reintento indicada por el servicio, una nueva solicitud fue aprobada y permitió completar web, backend y build.

### Evidencia de Chrome

Entorno temporal aislado, identidad aleatoria no versionada y eliminada al finalizar. Servidor de prueba del build con adaptador local a API/estático; no es infraestructura desplegada. Secuencia comprobada:

1. API de revisión 3 con escena inicializada.
2. Detener Express; recargar obtiene paquete publicado de revisión 2 con aviso de posible desactualización.
3. Abrir Orión, activar audio y escuchar: estado real del reproductor «Reproduciendo»; bytes del paquete en Blob.
4. Abrir estantería, comprobar máximo tres cubiertas y carga real del SVG nuevo (`IMG.complete`, anchura natural positiva).
5. Seleccionar libro `aa-nuevo` y abrir `/explorar/orion/libros/aa-nuevo`; ficha y portada cargan del respaldo.
6. Atrás; repetir desde Escorpio abre `/explorar/escorpio/libros/aa-nuevo`, mismo ID y contexto conservado.
7. Corromper SVG únicamente en el paquete temporal: rechazo completo y aviso del histórico sin revisión verificada.
8. Hacer indisponible también el histórico: error visible de carga.

Capturas inspeccionadas:

- [Homido, copia publicada y audio](evidencias-s4-4b/homido-respaldo.png).
- [Ficha 2D del libro nuevo](evidencias-s4-4b/ficha-respaldo.png).

Dos problemas del arnés precedieron la ejecución correcta: import de Playwright con ruta Windows sin `file:///`, y espera del origen en `storiesStatus` en vez de `fuenteDatos`. Se corrigieron en el comando temporal sin modificar producto. El recorrido correcto no produjo eventos `pageerror`. Audio validado por estado del reproductor, no por escucha humana ni prueba acústica del dispositivo. Se usaron clics/eventos DOM para seleccionar acciones 3D; no sustituye calibración de mirada o sensores físicos.

## Inventario local de Etapa 4B

Nuevos:

- `backend/src/services/homidoExport.js`
- `backend/test/homidoExport.test.js`
- `backend/test/homidoExport.integration.test.js`
- `scripts/exportar-homido.mjs`
- `scripts/servir-homido-dev.mjs`
- `frontend/public/prueba-homido/js/paquete-publico.js`
- `frontend/public/prueba-homido/js/respaldo-publicado.js`
- `frontend/test/homido-publicado.test.js`
- `docs/PRUEBA-S4-ETAPA4B.md`
- `docs/evidencias-s4-4b/homido-respaldo.png`
- `docs/evidencias-s4-4b/ficha-respaldo.png`

Modificados:

- `backend/src/index.js`
- `package.json`
- `frontend/vite.config.js`
- `frontend/public/audio/narration.js` (registro explícito de audio verificado; reproducción/eventos conservados)
- `frontend/public/prueba-homido/js/datos.js`
- `frontend/public/prueba-homido/js/estanteria-3d.js`
- `frontend/public/prueba-homido/narraciones.js` (carga compartida)
- `frontend/public/prueba-homido/prueba.js`
- `frontend/src/services/librosDemoService.js`
- `frontend/src/composables/useLibros.js`
- `frontend/src/composables/useEditorCatalogo.js`
- `frontend/src/views/AdminPanelView.vue`
- `frontend/src/views/BibliotecaView.vue`
- `frontend/test/catalogo-integracion.test.js`
- `frontend/test/catalogo-editor.test.js`
- `openspec/changes/s4-persistencia-documental/design.md`
- `openspec/changes/s4-persistencia-documental/tasks.md`

Las especificaciones existentes ya describen API principal, paquete por revisión, guardado separado, origen visible y ausencia de todos los orígenes: no se modifica su texto para simular cumplimiento. Proposal conserva el alcance aprobado.

Inventario de esta entrega: 28 archivos (11 nuevos, 17 modificados), sin incluir los archivos ajenos preexistentes.

## Auditoría para publicación

Rama local y remota verificadas en la base esperada; `main` local/remoto conserva `f1058c9b10641c470d7d3e331a81f327af78fc8c`. Revisión de exportador, validadores, lector, integración, proyecciones y diff: no se identificaron bloqueantes de privacidad, exclusión, revisión o confirmación en este alcance. No fue necesario cambiar código funcional para esta auditoría.

Comprobaciones generales repetidas: backend 107/107, web 137/137, build correcto y OpenSpec estricto correcto. No se observó fallo intermitente de mirada en esa repetición. Se amplió la integración HTTP existente para contrastar SHA-256 de todos los bytes servidos contra el manifiesto con Express detenido, recargar el estado administrativo pendiente tras exportación fallida y comprobar estado publicado tras reiniciar. Se registra la repetición de esa integración dentro de la suite backend final.

La auditoría conserva los límites operativos: hashes no autentican al publicador; ACL/HTTPS/alias/volumen de despliegue pendientes; `EPERM` de sincronización de directorio implica durabilidad no acreditada. La publicación del código no equivale a desplegar un paquete institucional. Las capturas Chrome corresponden a la implementación previamente revisada; en esta auditoría se repitieron las pruebas automatizadas, no Chrome, hardware ni zoom nativo.

Revisión adicional solo de lectura: se comprobaron las correcciones de BFCache, verificación de activos del estado publicado y separación del control; no se identificaron bloqueantes adicionales en ese alcance. La repetición del revisor se detuvo por `spawn EPERM` antes de ejecutar casos, por lo que los resultados automatizados acreditados son los de las ejecuciones aprobadas descritas arriba.

## OpenSpec y trabajo pendiente

- 6.1b: proyección y activos comprobados automáticamente; registro de evidencia actualizado. No equivale a validación visual física.
- 6.3: implementación y validación automatizada/local completadas; independiente del despliegue aplazado 8.6.
- 6.3b: integración aislada, mensajes del editor, ausencia total y Chrome comprobados; no se repite edición al recuperar exportación.
- 3.5 permanece pendiente: no se acreditó copia externa privada operativa.
- 6.4 y 8.6 permanecen pendientes: hardware y alojamiento independiente de producción.

Archivos ajenos preexistentes conservados: `.gitignore`, `docs/VALIDACION-PR6-S4.md`, `../.presentacion-build/`, guion y cuatro documentos PDF/PPTX enumerados por Git. No se añadieron reglas de ignore. Los SVG originales, WAV, JSON histórico, transcripciones, créditos y CSS no se editaron. La selección de publicación se limita al inventario de 28 archivos de esta entrega; quedan excluidos los archivos ajenos, privados y de ejecución.

Comprobación de conservación: 2281 archivos ajenos, hash agregado SHA-256 igual al inicial `ACF1CBE34F9B96E0F93EEFAD29AB0415DDB78615BBDD860B66292AE74A460B2C`. `main` local sigue en `f1058c9b10641c470d7d3e331a81f327af78fc8c`. `git diff --check` detectó solo la línea vacía preexistente de `.gitignore`, conservada.
