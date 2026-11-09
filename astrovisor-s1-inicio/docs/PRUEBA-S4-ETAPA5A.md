# Sprint 4 — Etapa 5A: auditoría integral y preparación del cierre

## Alcance y conclusión local

Base comprobada: `12546c2301a5c32efc0819b8731fe380412f20bf`, rama `indigo/s4-persistencia-documental`. `main` local permanece en `f1058c9b10641c470d7d3e331a81f327af78fc8c`. La ejecución original de 5A fue autorizada sin publicación. Posteriormente el usuario autorizó auditoría final y commit/push exclusivamente de sus ocho documentos y evidencias si no aparecen bloqueantes; sin merge, archivo OpenSpec ni funcionalidades posteriores. No se cambió código funcional.

La aceptación documental local completó inicialización, identidad, edición, alta compartida, reinicio, conflicto, exportación, lectura con API detenida y restauración. No se identificó un bloqueante de autorización, pérdida de datos, publicación corrupta o exposición privada en los casos comprobados. Esto no constituye una auditoría de despliegue ni acredita uso institucional.

**Hallazgo abierto de accesibilidad:** ficha de 360 px con `body.style.zoom='2'` produjo ancho de documento de 447 px. Sin zoom mide 360 px. Se registró el desbordamiento sin modificar estilos o componentes; 5.5 sigue parcial. No se ejecutó zoom nativo del navegador. La ejecución final de aceptación continuó registrando ese hallazgo; no se presenta todo el recorrido como una aprobación de accesibilidad.

## Entorno y verificación general

Fecha de ejecución: 9 de noviembre de 2026. Windows `10.0.26200.0`, PowerShell, Node `v24.21.0`, npm `11.0.0`, volumen de temporales C: NTFS. Chrome headless `156.0.8078.80`, perfil aislado; Homido con ANGLE SwiftShader y antialias desactivado mediante el diagnóstico existente. Frontend construido por Vite `6.4.4`, 51 módulos.

| Comando desde la raíz de la aplicación | Resultado de Etapa 5A |
|---|---|
| `npm test` | 107/107; 0 fallos, 0 omitidas, salida 0 |
| `npm run test:web` | 137/137; 0 fallos, 0 omitidas, salida 0 |
| `npm run build` | Correcto, salida 0; 51 módulos |
| `openspec validate s4-persistencia-documental --strict` | Correcto, salida0; repetido al actualizar la documentación |

Backend y web se ejecutaron por separado después del recorrido Chrome, sin carga de navegador simultánea. La suite web no presentó fallo intermitente de mirada en esta ejecución. No se deduce que la intermitencia histórica haya desaparecido. Las pruebas inyectadas generan deliberadamente errores 400/401/409/412/428/503 y fallos de filesystem; esos rechazos esperados no son fallos de la suite.

No hubo error `EPERM` del runner en las ejecuciones generales de esta etapa. Sí persistió `durabilidadPendiente:true` al restaurar, coherente con la falta de sincronización de directorio acreditada en Windows. Los informes previos conservan sus errores históricos; no se borraron ni se reutilizaron sus resultados como si fueran pruebas nuevas.

## Revisión de antecedentes

Se contrastaron AGENTS.md, proposal/design/spec/tasks S4, `openspec/config.yaml` e informes de etapas anteriores:

| Informe | Evidencia previa relevante; no sustituye la repetición actual |
|---|---|
| [Etapa 1](PRUEBA-S4-ETAPA1.md) | Fuente privada, semilla exclusiva, proyecciones iniciales, nueve relaciones y SVG; backend38/web93 |
| [Etapa 2A](PRUEBA-S4-ETAPA2A.md) | Scrypt, sesiones, límites, rechazo de configuración inválida; backend48/web98; TTY real y despliegue pendientes |
| [Etapa 2B](PRUEBA-S4-ETAPA2B.md) | Escritor, backup, revisión y restauración; fallo posrename corregido; cierre backend87/web98; copia externa pendiente |
| [Etapa 3A](PRUEBA-S4-ETAPA3A.md) | Migración del panel/web, 412, recuperación 401 en memoria, foco/360 px; backend87/web115 |
| [Etapa 3B](PRUEBA-S4-ETAPA3B.md) | Alta y plantillas SVG, confirmación sin reintento; backend94/web122; zoom nativo pendiente |
| [Etapa 4A](PRUEBA-S4-ETAPA4A.md) | Identidad por ID, firmas heredadas exactas, prioridad/máximo3; backend96/web129 |
| [Etapa 4B](PRUEBA-S4-ETAPA4B.md) | Paquetes verificados, puntero, lectura independiente y estado; backend107/web137; despliegue pospuesto |

Los números anteriores pertenecen al cierre documentado de cada etapa. Las restricciones textuales de etapas pasadas se interpretan con sus cortes autorizados posteriores, sin reescribir esos informes históricos. Las reglas S1 de `openspec/config.yaml` permanecen históricas y no acreditan una revisión de operación S4; 0.4 sigue abierta.

## Auditoría de migración y consumidores — 2.2

Se buscaron referencias a `libros-demo.json`, `recorridos-demo.json`, `fichas_libros`, `supabaseClient`, inicialización y escritura en fuentes, pruebas y scripts; se revisaron sus llamadores.

| Consumidor o archivo | Fuente actual y observación |
|---|---|
| `backend/src/services/documentRepository.js` | `obtenerCatalogo()` lee/valida `<ASTROVISOR_DATA_DIR>/catalogo.json`; no usa semilla tras error. `obtenerRecorridos/Libros` aplican proyectores a esa instantánea |
| `backend/src/index.js` | GET públicos/administrativo y POST/PATCH usan repositorio/escritor. El ejecutable adquiere escritor antes de escuchar. Inicialización solo por comando explícito |
| Panel y `catalogoAdminService` | GET/POST/PATCH de Express, Bearer y ETag; no consulta `fichas_libros` ni usa Supabase para identidad |
| Web convencional y `contentService/useRecorridos` | GET de recorridos en Express; error de consulta no reinicializa datos |
| Estantería y `librosDemoService/useLibros` | API pública por carga; respaldo publicado verificado únicamente con aviso y propiedad explícita de recursos; no import de JSON compilado |
| Homido `datos.js` y `narraciones.js` | API → paquete fijado/verificado → histórico identificado; escena y narración comparten carga |
| `content/catalogo-inicial.json` | Semilla versionada, solo para inicialización explícita; no recibe los guardados administrativos |
| `content/recorridos.json`, `frontend/src/data/libros-demo.json` | Fixtures usados por pruebas de contrato/regresión y herramientas históricas S3. No se eliminan |
| `frontend/public/prueba-homido/data/recorridos-demo.json` | Compatibilidad demostrativa final. Firmas URL+autor cerradas, revisión no verificada; no incorpora altas o ediciones actuales automáticamente |
| Generadores de narraciones y `scripts/registrar-audios.mjs` | Lectura/escritura manual histórica de fixtures/activos S3. No llamados por arranque, panel ni scripts normales de persistencia S4; no son una migración del runtime |
| `frontend/src/services/supabaseClient.js` y dependencia instalada | Residuo sin import encontrado en `frontend/src`; conservarlo en esta auditoría. No representa una dependencia activa del catálogo o login documental |

No se observó doble escritura automática entre catálogo, semilla y fixtures en los llamadores normales. La exportación es una proyección derivada manual, no una segunda fuente editable. La prueba actual comparó los tres libros completos, los nueve `libroRefs` originales y los arrays multimedia antes/después de editar/crear; la restauración comparó libros y recorridos completos contra la instantánea elegida.

Se corrigió únicamente una nota desactualizada de `content/README.md`, que todavía decía que la estantería usaba JSON estático. También se aclaró allí el límite de los scripts de audio S3. No se ejecutaron esos scripts ni se modificaron fixtures, audios o SVG.

Otro texto residual detectado, sin cambio funcional: la explicación de solo lectura de título/autor en el panel todavía menciona enlaces Homido dependientes del título. Los enlaces actuales auditados usan libroId; la restricción de edición se conserva y la dependencia de los SVG originales sigue existiendo. Revisar esa explicación en una corrección de textos posterior autorizada; no inferir una dependencia técnica actual desde el mensaje antiguo.

**2.2 permanece parcial:** consumidores migrados y fixtures justificados; todavía faltan una copia privada autorizada de entradas para una migración operativa, política/ensayo de cambios futuros de esquema y decisión documentada sobre el retiro de fixtures cuando dejen de ser necesarios. No confundir el ensayo de restauración temporal con una migración institucional completada.

## Aceptación integral aislada

Arnés Node por stdin, sin archivo de credenciales real ni contraseña en argumentos. `inicializarAdmin()` creó configuración temporal exclusiva mediante el mismo scrypt. Servidores Express en procesos Node nuevos, servidor estático separado en otro proceso y servidor de prueba del build para Chrome con proxy local. Rutas bajo un `mkdtemp` externo al checkout; identidades/almacenamiento eliminados al terminar. No se usaron datos reales.

| Paso solicitado | Evidencia obtenida |
|---|---|
| 1. Inicializar catálogo | Inicialización explícita revisión1; segundo intento rechazado sin sobrescribir |
| 2. Configurar identidad | Helper productivo de configuración exclusiva con contraseña aleatoria y scrypt; no TTY real ni cuenta institucional |
| 3. Iniciar Express/frontend | Express con escritor antes de escuchar; build servido a Chrome, puertos loopback aleatorios |
| 4. Autenticarse | Login HTTP válido; login de Vue con Enter también válido |
| 5. Consultar catálogo/ETag | GET administrativo devolvió `"catalogo-1"` |
| 6–8. Editar, guardar y ver público | PATCH de resumen de Orión con If-Match confirmó revisión2; API y vista `/explorar/orion` mostraron el texto exacto |
| 9–11. Alta SVG y dos relaciones | POST creó `aa-aceptacion`, revisión3, plantilla cielo/azul y motivos distintos en Orión/Escorpio; Chrome mostró cuatro libros en ambas estanterías. Originales intactos |
| 12. Reiniciar Express | Se cerró el proceso y arrancó otro; texto persistido; token del proceso anterior rechazado con401 |
| 13. Revisión obsoleta | PATCH con ETag1 recibió412; revisión3 intacta. También401 sin token,428 sin If-Match y400 para prototipo/markup SVG, sin escritura |
| 14–16. Exportar y consumir | Paquete3 verificado por esquema/referencias/hashes; HTTP cotejó SHA-256 de todos los JSON/SVG/WAV; Homido indicó API revisión3 |
| 17. Detener API | Express detenido; Homido cargó paquete3 y SVG nuevo; audio entró en estado real Reproduciendo. Todos los JSON/SVG/WAV siguieron sirviéndose y sus hashes coincidieron sin API |
| 18–19. Fallo y estado | PATCH posterior confirmó revisión4 con publicación3 pendiente. Fallo EIO inyectado en rename del exportador conservó exactamente los bytes de `ultima.json`. Panel recargado indicó ambas revisiones; no repitió la edición |
| 20. Restaurar | Tras un guardado adicional de UI para comprobar foco, revisión vigente5. API detenida; respaldo privado de revisión3 restaurado a revisión6. Libros/recorridos exactos a instantánea3 y lectura tras otro reinicio correcta |

Ensayo adicional: copia de ese backup a otro directorio temporal, comparación de bytes y restauración también con revisión superior a5. Es el mismo disco NTFS, no otro volumen ni destino institucional. No se copió identidad con el contenido.

Rotación de configuración temporal conservando el usuario pero cambiando hash/identidad invalidó el token anterior con401. Nuevo login con la clave temporal nueva permitió logout; consultar sesión después devolvió401. Las claves/tokens no se imprimieron ni se guardaron en capturas. En el navegador de conflicto, localStorage y sessionStorage quedaron vacíos.

Restauración: `confirmada:true`, `revisionPersistida:6`, `durabilidadPendiente:true`. No se infiere resistencia ante corte eléctrico a partir de esa confirmación. La publicación3 queda identificada como anterior tras restaurar a revisión6; actualizarla exige exportación manual separada.

## Seguridad e integridad: comportamiento revisado

| Límite | Comportamiento y evidencia, además de leer el nombre de la prueba |
|---|---|
| Autenticación/expiración | Scrypt con sal y parámetros fijos; timingSafeEqual de hash y resumen de usuario. Suite manipula reloj y llama endpoint protegido: token expirado401; configuración ausente/corrupta/inválida503, sin cuenta demo habilitada por entorno |
| Revocación | Comparación de huella de configuración en cada petición protegida. Rotación y logout reales del ensayo devolvieron401 al token retirado; reinicio en proceso nuevo también401 |
| Autorización | Rutas administrativas aplican verificarAdmin en Express. PATCH sin Bearer rechazado401; no depende de Vue. Única identidad con permiso completo:403 reservado, sin rol restringido ficticio |
| Intentos y logs | trust proxy permanece falso; prueba HTTP falsifica X-Forwarded-For/X-Real-IP/Forwarded y el sexto intento recibe429. Espías de logs comprueban contraseña/hash/token ausentes incluso ante consultas/cuerpo malformados; login de Vue transmite contraseña en cuerpo |
| ETag y exclusión | Revisión comparada dentro de cola/bloqueo; dos PATCH iguales confirman uno, otro412; otro proceso escritor rechazado. Ensayo5A repitió412 y428 con revisión persistida sin cambios |
| Bibliografía y SVG | Whitelist, tipos, longitudes, IDs, HTTPS sin credenciales, plantillas/paletas cerradas y escape. Ensayo markup rechazado400; suites verifican SVG dinámico,304/409 y bytes de los tres originales |
| Prototipos | Recorrido iterativo de entrada rechaza __proto__/prototype/constructor y profundidad excesiva. Cuerpo HTTP con __proto__ recibió400 y no avanzó revisión |
| Separación privada | rutaPrivada rechaza checkout, relativos y enlaces al checkout; exportador excluye runtime/identidad/control y usa recursos cerrados. Pruebas solicitan catálogo/backups/locks por estático y reciben404; publicación no contiene campos administrativos o secretos de prueba |
| Paquete y recursos | Puntero fija manifiesto/hash/revisión; lector valida todo antes de crear Blob. Verificación HTTP actual de todos los activos, corrupción y rutas manipuladas rechazadas en suites; no mezcla versiones de recursos |
| Bloqueos/recuperación | wx por host/PID/nonce, control breve, no retirada por tiempo. Suites intentan retirar lock vivo:503 y archivo conservado. Control huérfano exige procedimiento offline; no se retiró ningún lock real |
| Confirmación/limpieza | Inyección EACCES después de rename de restauración confirma revisión, conserva bloqueo y comunica limpieza pendiente; fallo previo no confirma. Caso operación+limpieza conserva error primario. Exportador tiene la separación equivalente, sin rollback aparente |
| Metadatos/atribuciones | Proyectores cerrados; suites y aceptación comparan originales/referencias/multimedia. Restauración compara arrays completos. Audio mantiene transcripción/autoría/permisos; edición de historia incompatible rechazada409 |

Estos controles se comprobaron mediante inspección del código y aserciones ejecutadas, con fallos operativos inyectados en temporales. No se ensayaron ACL reales de producción, sistema de archivos de red, pentest externo, pérdida de hardware o interrupción eléctrica.

## Navegador, accesibilidad y Homido

| Comprobación actual | Resultado y límite |
|---|---|
| Escritorio1280×900 | Estanterías Orión/Escorpio: documento1280, focoH1. Panel: documento1280 |
| Emulación360×900 | Panel, ficha y conflicto: documento360; no teléfono real. Portada generada cargada (`naturalWidth>0`) |
| Teclado | Enter abre editor; foco en editor-heading; Tab llega al resumen; Shift+Tab vuelve al botón de recarga; cancelar devuelve foco al selector de Orión; guardar mueve foco a editor-resultados |
| Confirmación/error | Mensaje de guardado en role=status. Login inválido mostró role=alert. Conflicto real provocado por otro PATCH mostró role=alert, conservó borrador, deshabilitó guardar y enfocó resultados. Cero controles sin etiqueta en ese formulario |
| Contraste muestreado | Etiqueta resumen 14.63:1 (18px), textarea16.49:1 (18px), botón guardar11.65:1 (15.84px), calculados desde colores sólidos efectivos. No es auditoría exhaustiva WCAG ni prueba con lector de pantalla |
| Zoom CSS200% sobre360 | Documento447: desbordamiento observado. Captura conservada; no corregido fuera del alcance de auditoría |
| Zoom nativo200% | No ejecutado; automatización usada fue Chrome headless y CSS zoom. No se presenta como zoom nativo ni como aumento óptico del dispositivo |
| Homido | API revisión3, paquete3 al detener Express, tres cubiertas máximo, libro nuevo por ID y contexto Orión, salida2D y Atrás |
| Audio/pausa | Estado Reproduciendo con Blob del paquete; pausar mirada no cambió ese estado. No escucha humana ni validación acústica |
| Mirada/dwell/histórico | Regresiones ejecutadas dentro de web137/137: cancelación, pausa, IDs, deduplicación, firmas ambiguas/desconocidas, paquete corrupto, API503 y ausencia total. No se cambió controlador ni reproductor |
| Errores JS | Cero pageerror en los recorridos finales y en el conflicto aislado |

Primer intento de aceptación se detuvo por un ID inexistente esperado por el arnés (`recargar-catalogo`); se corrigió la expectativa usando el texto del botón real y la clase real books-section. Segundo intento observó el desbordamiento CSS447/360 y se detuvo antes de restaurar. Tercero registró ese hallazgo como pendiente y completó la restauración. Se conservan esos resultados; no se atribuye el primer fallo a la aplicación ni se oculta el segundo. El comando temporal final no modificó código funcional.

Capturas de esta etapa:

- [Panel360](evidencias-s4-5a/panel-360.png).
- [Ficha360](evidencias-s4-5a/ficha-360.png).
- [Ficha con zoom CSS200% y desbordamiento](evidencias-s4-5a/ficha-zoom-css-200.png).
- [Homido y publicación](evidencias-s4-5a/homido-publicado.png).
- [Conflicto accesible360](evidencias-s4-5a/conflicto-360.png).

## Operación y respaldo externo

Se contrastaron instrucciones2A/2B/4B y ejecutables reales. Secuencia coherente para un operador autorizado, sin datos reales aplicados en esta auditoría:

1. Configurar rutas absolutas externas: ASTROVISOR_DATA_DIR para catálogo/backups; ASTROVISOR_ADMIN_FILE en otro directorio privado; ASTROVISOR_PUBLIC_EXPORT_DIR separado de ambos. Su control hermano tampoco puede solaparse. No versionar archivos privados.
2. Ejecutar `npm run init:catalogo` explícitamente una vez. Un fallo de lectura posterior requiere diagnóstico/restauración, no otra inicialización.
3. En TTY real, `npm run configurar:admin` crea el destino inexistente, pide contraseña sin eco y rechaza argumentos/redirecciones. Aquí se validó el helper y regresiones de TTY simulado; el procedimiento interactivo real sigue pendiente.
4. Para rotar, generar otra configuración en archivo privado nuevo, comprobar ACL y sustituir la configuración mediante procedimiento del operador. La huella revoca sesiones anteriores; no reutilizar tokens. No pegar secretos en historial ni copiar identidad en el paquete público.
5. Arrancar una instancia escritora en volumen local persistente. Sin proxy confiado por defecto; antes de cambiarlo verificar topología/IP, HTTPS y acceso directo al backend.
6. Antes de intervenir, detener API/supervisor. Elegir backup privado válido y última revisión conocida; CLI `recuperar-catalogo.mjs restaurar <basename-validado> <revision>` comprueba hash, conserva evidencia y publica una revisión superior. Salida0 normal;1 no confirmada;2 confirmada con limpieza pendiente y aviso de no repetir automáticamente.
7. Locks: no quitar por edad. Verificar host, PID y reutilización/identidad del proceso; escritor vivo no se retira. control.lock ilegible/huérfano y exportador.lock pendiente requieren intervención offline documentada, sin borrado indiscriminado.
8. Ejecutar `npm run exportar:homido` manualmente. Un fallo previo conserva publicación anterior y permite repetir únicamente exportación. Si confirmó con limpieza pendiente, revisar el resultado/lock antes de intervenir; no repetir escritura documental. No podar paquetes usados por lectores activos.
9. En desarrollo, servidor estático de loopback y proxy restringido como4B. No instalar ni presentar ese servidor de prueba como despliegue institucional independiente.
10. Copia externa real: elegir destino institucional privado autorizado, comparar hashes y ensayar restauración allí. No existe destino autorizado acreditado en esta sesión y no se usó ningún servicio personal. Ensayo temporal del mismo disco no satisface3.5.

NTFS y sync de archivos/rename: confirmación observable en el filesystem, sin prueba de resistencia eléctrica. sync de directorio puede devolver EPERM y se comunica durabilidad pendiente. No se probaron red, volumen efímero, varias réplicas o permisos ACL del servidor destino. Una revisión pública antigua continúa identificada después de restauración hasta reexportar; hashes no autentican a un publicador comprometido. No prometer disponibilidad si API, estático e histórico accesible fallan.

## Matriz final de cumplimiento

Las casillas globales siguen abiertas cuando falta algún criterio; «parcial» no equivale a listo para producción.

| Tarea | Criterios de aceptación | Evidencia existente | Evidencia5A | No verificado y acción para cerrar | Estado |
|---|---|---|---|---|---|
|0.2|Escritorio/360/teclado/200% y Homido físico; registrar aceptación si faltan|3A/3B/4A/4B Chrome y CSS zoom|Chrome escritorio/360/teclado; hallazgo447/360|Zoom nativo y hardware; revisar desbordamiento y obtener aceptación explícita de pendientes|Parcial|
|0.4|Rutas externas, volumen persistente, escritor único, estático independiente, revisión de reglasS1|Repositorios/locks/rutas4B y documentación|Procesos separados y rutas temporales externos|Confirmar destinos reales, volumen/ACL/alias, operación y revisión históricaS1 con usuario; no inferir de temporales|Parcial|
|1.4c|HTTPS, ACL, TTY real, costo/límites en servidor|2A pruebas/configuración sin demo|Login/revocación/rotación reales en temporales|TTY, HTTPS y medición/capacidad en equipo destino; validar proxy y ACL|Parcial|
|2.2|Migrar consumidores, justificar/retirar duplicados cuando corresponda y copia/backup de migraciones|3A migra panel/web,4A/4B Homido|Inventario de consumidores, sin imports runtime de fixtures/Supabase; comparación originales|Copia privada de entradas operativas y procedimiento de futuras migraciones; no borrar fixtures útiles|Parcial|
|3.5|Copia externa autorizada y restauración comprobadas, límites reales documentados|2B procedimiento/NTFS|Copia y restauración en otro directorio temporal, revisión6 y durabilidad pendiente|Destino institucional externo, copia y restauración reales; no equivalente al mismo disco|Parcial|
|5.5|Escritorio/360/200%, teclado/foco/mensajes, web/build|3A/3B evidencia local|Foco abrir/guardar/cancelar, error412, etiquetas/contraste muestreado; suites/build|Zoom nativo y resolver/revisar desbordamiento CSS447/360; ampliar revisión accesible requerida|Parcial|
|6.4|Regresiones audio/salida2D y prueba física Homido/sensores|4A/4B software|Audio/pausa/Atrás/2D y suite137|Hardware/sensores y legibilidad/calibración física; registrar escucha humana|Parcial|
|7.1|Cuatro comandos desde raíz, SHA/entorno/resultados y fallos|Informes anteriores|Backend107/web137/build y validación estricta de esta etapa|Repetir solo si hay cambios relevantes posteriores; no equivale a cierre físico|Completa local|
|7.2|Guardar/reiniciar/leer, conflicto, recuperación y archivos privados|Suites2B/3A/4B|Recorrido20 pasos, procesos nuevos, panel/web/visor,412, respaldo y restauración6; rechazo de entradas privadas|Operación del servidor real queda en0.4/3.5, no en este ensayo local|Completa local|
|7.3|Revisión con responsables y aprobaciones realmente recibidas|Usuario aprobó cortes anteriores; revisiones técnicas registradas|Sin nueva aprobación de responsables ajenos documentada|Registrar revisión/aprobación real cuando exista; no solicitarla como requisito nuevo ni inventarla|Parcial|
|7.4|Documentar límites MVP y pendientes sin omitir controles|Informes anteriores|Matriz, hallazgo y separación demostración/institución en este informe|Controles operativos no se cierran por esta documentación; permanecen en sus tareas|Completa documental|
|7.5|Presentar diff/evidencia al usuario y esperar autorización para integrar/archivar|Entregas anteriores publicadas por orden|Informe5A revisado por usuario y publicación exclusivamente documental autorizada|Integración/archivo no autorizados; no marcar S4 terminado|Parcial|

## Demostración a la biblioteca

Puede demostrarse como prototipo local con datos expresamente de muestra: acceso administrativo por configuración privada, edición autorizada con conflictos, alta ilustrativa vinculada a varias constelaciones, lectura inmediata, persistencia tras reinicio, navegación2D/Homido, audio con atribución y exportación por revisión. Se puede mostrar el respaldo con Express detenido manteniendo servidor estático de prueba disponible y explicar su revisión/antigüedad.

No presentarlo como listo para uso institucional: faltan destinos y operación aprobados, HTTPS/ACL/volumen/backup externo restaurable, derechos/contenido institucional definitivo, hardware Homido/móvil, zoom nativo y revisión del desbordamiento observado. No afirmar propiedad física, disponibilidad, préstamos, offline total o durabilidad eléctrica. El cierre funcional local no cierra Sprint4 automáticamente.

## Inventario y conservación

Cambios de5A limitados a:

- Nuevo `docs/PRUEBA-S4-ETAPA5A.md`.
- Nuevas cinco capturas en `docs/evidencias-s4-5a/` enumeradas arriba.
- `content/README.md`: actualizar estado de consumidores y advertir límite de herramientas S3, sin cambiar datos.
- `openspec/changes/s4-persistencia-documental/tasks.md`: evidencia/estados, sin archivar.

Sin cambios funcionales, nuevos paquetes o dependencias, CSS, auth, renderer, mirada, narración, SVG originales, WAV, JSON histórico, semilla o catálogo real. La publicación posterior se limita a documentación/evidencias, sin merge. Los arneses de aceptación corrieron por stdin; su almacenamiento privado fue temporal y se retiró al finalizar.

Ajeno preexistente: `.gitignore` con línea vacía final, `docs/VALIDACION-PR6-S4.md`, `../.presentacion-build/`, guion y cuatro PDF/PPTX. Se conserva la línea final de ignore sin corregirla. Verificación repetida previa al commit documental: 2281 archivos ajenos con SHA-256 agregado idéntico al inicial `ACF1CBE34F9B96E0F93EEFAD29AB0415DDB78615BBDD860B66292AE74A460B2C`. HEAD base12546c2301a5c32efc0819b8731fe380412f20bf y main local/remoto f1058c9b10641c470d7d3e331a81f327af78fc8c. Índice vacío antes de seleccionar los ocho archivos.

Inventario5A: ocho archivos (este informe, cinco capturas, README de contenido y tasks). `git diff` no muestra cambios funcionales en backend, frontend/src, frontend/public, scripts, semilla o fixture de recorridos. `git diff --check` del cambio documental no encontró incidencias; no se corrigió la línea ajena de ignore. OpenSpec estricto validó los documentos actualizados. Sin archivo OpenSpec.

## Auditoría final de publicación documental

Se revisó el informe contra el recorrido y las salidas reales de ejecución5A: la restauración confirmada a revisión6 pertenece al ensayo temporal anterior y no representa un respaldo institucional. Se inspeccionaron nuevamente las cinco capturas; muestran datos de demostración, sin contraseñas, tokens ni rutas privadas sensibles visibles. El diagnóstico Homido muestra una URL loopback pública de prueba, no una ruta administrativa. No se detectó una interpretación de evidencia que requiera modificar los resultados.

Validaciones repetidas para esta publicación, sobre la misma base y sin cambios funcionales: `npm test`107/107, `npm run test:web`137/137, build correcto (51 módulos) y OpenSpec estricto correcto. Backend/web se ejecutaron por separado. Sin fallo de mirada observado en esta repetición; sin errores de entorno bloqueantes. Esta auditoría inspeccionó las capturas existentes; no repitió el recorrido Chrome, la restauración6 ni pruebas físicas, zoom nativo o despliegue.

Se conserva expresamente: viewport360px, zoom CSS200%, documento447px, desbordamiento abierto y5.5 parcial. Tareas7.1/7.2/7.4 sustentadas local/documentalmente;0.2/0.4/1.4c/2.2/3.5/5.5/6.4/7.3/7.5 siguen abiertas. No se declara Sprint4 completo ni se amplían aprobaciones ajenas. No se identificaron nuevos bloqueantes documentales en el alcance revisado.
