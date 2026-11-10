# Sprint 4 — Validación final de demostración académica

Fecha: 9 de noviembre de 2026, America/Chihuahua. Informe local, sin publicación ni aceptación de requisitos pendientes.

## Resultado ejecutivo

[Inferencia] **Apto con condiciones pendientes** para proponer una revisión académica de la demo software controlada. El recorrido Chrome nuevo y las comprobaciones operativas descritas pasaron sin identificar un defecto bloqueante del producto. Eso no constituye aceptación académica, permiso de Ready for Review/merge, cierre de S4 ni preparación institucional. El zoom nativo, hardware y decisiones de aceptación siguen pendientes.

Se comprobó la rama `indigo/s4-persistencia-documental` y HEAD `b8c4b73e18b2b6d00d91fbeef177f8bc6af22972`. Main local permanece en `f1058c9b10641c470d7d3e331a81f327af78fc8c`. Se leyeron AGENTS.md, el expediente propuesto de aceptación, resumen5F y su guía. No se modificaron producto, OpenSpec, PR7, informes originales ni datos preexistentes.

## Entorno y aislamiento

- Microsoft Windows11 Pro, versión10.0.26200; Node24.21.0 y npm11.0.0.
- Chrome156.0.8078.80, **headless**, WebGL software mediante ANGLE/SwiftShader. Playwright1.56.1 instalado exclusivamente como herramienta temporal externa, sin modificar dependencias o lockfile del proyecto.
- Clon local temporal con `git clone --no-hardlinks --branch indigo/s4-persistencia-documental`, HEAD exacto comprobado. Dependencias existentes reutilizadas mediante junction de node_modules; **no fue una instalación limpia ni una nueva ejecución de npm ci**.
- El arnés Chrome versionado se ejecutó sin modificarlo dentro del clon. Sus capturas/JSON se escribieron allí, no sobre las evidencias históricas del workspace. Inicializa y retira sus datos/identidad efímeros propios.
- Un segundo ensayo temporal comprobó reinicio, navegación y mirada; otro almacén sintético sirvió para TTY/recuperación. Configuración privada, JSON, imágenes y exportación separados y externos a ambos checkouts. No se importó ni publicó el diagnóstico503 local.
- La cuenta del arnés y la adicional de navegador se generaron con contraseña aleatoria en memoria y hash privado. La cuenta TTY usó contraseña sintética introducida interactivamente, sin argumentos ni historial de shell. Los archivos privados de los ensayos se retiraron al terminar, después de cerrar procesos y comprobar las rutas propias sin enlaces.

## Evidencia nueva: Chrome sobre el HEAD actual

Comando principal desde la raíz de la aplicación del clon: `node scripts/probar-portadas-hibridas.mjs completo`, con `ASTROVISOR_PLAYWRIGHT_MODULE` apuntando al módulo externo temporal. Una ejecución, **salida0**,13033 ms, errores de página0. No se sustituyó un fallo por repeticiones ni se cambiaron aserciones/timeouts.

| Acción efectivamente realizada | Resultado observado |
| --- | --- |
| Acceso administrativo | Usuario/contraseña efímeros introducidos en el formulario; navegación al panel |
| PNG y JPEG sintéticos | Rectángulos180×260 generados con sharp; selección/carga, previsualización decodificada, procedencia/permiso de ensayo/alternativa y dos relaciones con motivos; guardados a revisiones2 y3 |
| Libro con SVG automático | Previsualización sin cambiar revisión3; alta confirmada a4 |
| Edición y cambios de modalidad | Título editado a5, sustitución por PNG a6 y regreso a automática a7; cancelación previa de ensayo sobre heredado mantuvo revisión3 |
| Consulta pública | Fichas PNG/JPEG decodificadas, alternativa y aviso de permiso declarado; ficha automática con título guardado |
| Conflicto412 | Otra sesión actualizó año sobre revisión7, creando8; el envío del formulario antiguo recibió412, conservó «Borrador no confirmado» y no sustituyó el título persistido |
| Exportación Homido | Exportación de revisión8; dos cubiertas de180px decodificadas online y desde Blob verificado al usar paquete |
| API detenida y estático disponible | Health dejó de responder; lector obtuvo paquete8 con MIME image/png e image/jpeg; Homido recargó desde respaldo con error503 interceptado deliberado para la ruta API |
| Medidas del formulario | innerWidth/clientWidth/scrollWidth=1280/1280/1280 y360/360/360; cero controles sin etiqueta detectados por el arnés |

El503 interceptado es deliberado para probar fallback, no un503 espontáneo de almacenamiento. Vite registró advertencias sobre imports desde public y ECONNREFUSED de la consulta `/api-inexistente` cuando Express ya estaba detenido; el lector recuperó el paquete y el arnés terminó0. No se ocultan esas salidas ni se presentan como un fallo inesperado del guardado.

### Ensayo complementario de reinicio y mirada software

Ayudante creado solo en TEMP, sin instrumentar el producto. Utilizó `crearApp()` real en procesos Node hijos independientes, Vite temporal y el mismo Chrome. **Salida0**, errores de página0. Los dos procesos API de este ensayo cerraron con código0, sin señal y sin escritor.lock residual.

1. Abrió la página inicial y comprobó su encabezado; login desde Chrome al panel.
2. Editó el año de Star Lore a2024 mediante formulario, obtuvo «Guardado confirmado», revisión2 y dato2024 en JSON. Consultó estantería, abrió el enlace de la ficha y decodificó su cubierta; la ficha mostró2024.
3. Cerró la API y el escritor mediante IPC del lanzador de ensayo y comprobó health sin conexión. Arrancó **otro proceso Node**, recreó el proxy de ensayo y volvió a leer la ficha en Chrome:2024 y revisión2 persistían. No fue solo recargar la página ni reutilizar el mismo escritor.
4. Abrió Homido software. Entregó un evento `mouseenter` sintético al objetivo Orión y observó con MutationObserver el texto DOM actualizado por RAF real: **0%,33%,66%,100%**; después estado `ficha` y ficha Orión abierta. No se sustituyeron relojes ni se redujeron3000 ms.
5. Clic en pausa y continuar: estado pausado true/false; enlace «Regresar al modo web 2D»: llegada a `/explorar`.

Esta es verificación de handlers/estado y feedback DOM software con activación sintética. No acredita que una cabeza/sensor real enfocara el objetivo, que todas las fases fueran perceptibles en visor ni que el raycaster físico se comporte igual. No se ensayaron suspensiones largas, escucha humana ni navegación exhaustiva de todas las acciones3D.

## Evidencia nueva: PTY y comandos operativos

La herramienta de terminal se abrió con `tty:true`; Node informó `stdin/stdout/stderr.isTTY=true` y `setRawMode` disponible. Es una **PTY interactiva automatizada de Windows**, no una terminal física operada por el equipo/docente. Se distingue de las acciones del navegador.

| Comando o comprobación | Resultado real |
| --- | --- |
| `npm run init:catalogo` sobre destino nuevo | salida0; catálogo inicializado |
| `npm run configurar:admin` | Preguntó usuario/nombre/contraseña/confirmación; entradas de contraseña sin eco en salida capturada; archivo privado creado; salida0 |
| `node backend/src/index.js`, entorno completo y puerto temporal | Mensaje de arranque, health HTTP200 y bloqueo presente durante ejecución |
| Ctrl+C a esa PTY | Sesión de shell terminó con estado1; no se obtuvo un código Node independiente. Comprobación posterior: health sin conexión y bloqueo ausente; no se afirma salida0 del comando por esa señal |
| Repetir `npm run init:catalogo` en catálogo existente | salida1 y «El catálogo ya existe; no se ha sobrescrito»; SHA del catálogo intacto |
| `node scripts/configurar-admin.mjs argumento-no-admitido` | salida1 genérica; SHA del archivo de identidad intacto. Es rechazo de argumentos, no una prueba adicional de reconfiguración interactiva |
| `npm run exportar:homido` | salida0; revisión2, confirmada=true, limpiezaPendiente=false, durabilidadPendiente=true |
| `node scripts/recuperar-catalogo.mjs restaurar <respaldo-r1> 2` | API detenida; salida0, revisión3 confirmada y aviso de sincronización pendiente |
| Integridad después de restaurar | Libros/metadatos y recorridos/relaciones iguales al catálogo del respaldo mediante deepEqual; Star Lore volvió a1911; revisión3 superior a2 y sin lock |
| `node scripts/recuperar-catalogo.mjs restaurar` incompleto | salida1; SHA de catálogo restaurado intacto |
| Nuevo proceso API tras recuperación | GET público HTTP200 y año1911; cierre controlado por IPC con código0 y sin lock |
| Primer `npm run dev:homido:respaldo` | Comando Node terminó1, mensaje genérico: se suministró solo ASTROVISOR_PUBLIC_EXPORT_DIR a esa terminal, omitiendo variables privadas requeridas |
| Arranque estático con las cuatro variables y mismo puerto elegido | `node scripts/servir-homido-dev.mjs` escuchó en loopback; `/ultima.json` HTTP200, revisión pública2 |
| Ctrl+C al estático | Sesión terminó con estado1; conexión posterior rechazada. No se afirma código Node0 independiente |

El primer arranque estático falló por preparación incompleta del ensayo. `directorioExportacion()` exige ASTROVISOR_ADMIN_FILE absoluto y valida separación con ASTROVISOR_DATA_DIR; la repetición corrigió únicamente el entorno. No se cambió el servidor ni se aumentaron tiempos. El mensaje genérico no reveló rutas privadas. La guía debe proporcionar el entorno completo a **cada** terminal.

La revisión pública siguió en2 después de restaurar el catálogo privado a3. Esa observación confirma la separación y no acredita sincronización automática: requiere otra exportación explícita para publicar3. No se ejecutó una segunda restauración ni se reintentó ningún guardado por incertidumbre. La salida2 de limpieza pendiente no ocurrió en este ensayo; su evidencia permanece en pruebas históricas, no se atribuye a esta ejecución normal.

Los avisos de durabilidad se conservaron. La operación confirmada no equivale a resistencia ante corte eléctrico; Windows/sistema de archivos y respaldo externo institucional siguen pendientes. No se simuló un fallo real de disco ni se modificaron datos reales.

## Zoom nativo200%: no verificado

Comprobaciones nuevas del canal nativo:

- `cua.getState()` devolvió apps y browsers vacíos, `Computer Use native pipe is unavailable` y `The browser access host is unavailable`.
- El cliente Windows `@oai/sky`, `list_apps()`, devolvió también error de conexión al pipe nativo, os error2.

Chrome headless sí pudo controlarse por Playwright para el recorrido funcional, pero no hubo una interfaz/menú nativo accesible donde activar y verificar200%. No se usaron CSS zoom, pinch zoom, device scale ni CDP como sustitutos. Las medidas1280/360 anteriores son viewport software normal.

| Vista requerida | Zoom nativo200%, ventana/viewport, overflow, campos/botones, teclado/foco y acciones |
| --- | --- |
| Estantería pública | No comprobados |
| Ficha de libro | No comprobados |
| Acceso administrativo | No comprobados |
| Panel administrativo | No comprobados |
| Formulario de alta | No comprobados |
| Formulario de edición | No comprobados |

Protocolo manual pendiente: en entorno desechable equivalente, registrar commit/fecha/versión Chrome/escala del sistema y tamaño de ventana; medir estado100%; usar el menú de Chrome para200% y capturar su indicador. Mantener ventana/zoom al recorrer las seis vistas; registrar innerWidth/clientWidth/scrollWidth, campos/botones accesibles por desplazamiento, Tab/Shift+Tab/Enter, foco y retorno, alta/cancelación/edición/guardado. No asumir que un viewport nominal360 siga midiendo360 al aplicar zoom nativo. Ante defecto, conservar pasos/datos sintéticos/medidas/captura y gravedad antes de proponer CSS. Restablecer zoom al terminar. Véase el registro local `PRUEBA-S4-ZOOM-NATIVO.md`.

## Evidencia histórica y límites de la conclusión

Este informe aporta **ejecuciones nuevas** sobre b8c4b73e. No reutiliza el Chrome5F como si se hubiera ejecutado ahora. No se repitieron npm ci, suites completas backend/frontend, build, npm audit u OpenSpec en esta tarea; sus resultados anteriores están en los informes correspondientes. En particular,132 backend versionados y153 frontend corresponden a la auditoría de mirada;145 backend de la copia local incluye13 tests503 sin publicar y no es un resultado de este ensayo.

No se observó un503 espontáneo en estos recorridos. Esto **no identifica ni resuelve su causa histórica**. La mirada recorrió sus etapas en este ensayo nominal; no define ni resuelve la política ante suspensiones largas. No se ejecutaron Linux, zoom nativo, móvil/visor/sensores físicos, escucha humana, ensayo eléctrico, copia externa institucional, despliegue ni revisión exhaustiva de accesibilidad/seguridad.

No se identificó un fallo reproducible nuevo del producto que bloquee la demo en los casos ejecutados. Quedan expresamente registrados: falta del canal nativo, rechazo de configuración incompleta del estático, comandos inválidos rechazados y estado1 de las sesiones PTY interrumpidas. Los cierres IPC0, puertos sin conexión y lock ausente son evidencias distintas del estado de la shell.

## Evidencias, conservación y siguiente decisión

Artefactos nuevos conservados fuera del repositorio, bajo la raíz temporal del ensayo final: `chrome-completo.log`, `suplemento.json`, `suplemento.log`, `verificar-operativo.log`, captura software `suplemento-explorar.png` y evidencias5D generadas exclusivamente dentro del clon temporal. La localización absoluta no se publica para evitar rutas personales. La salida PTY queda en el registro de herramientas de esta ejecución; no se creó un log que contenga contraseñas. El clon/herramientas temporales no son archivos propuestos para Git.

Se comprobó ausencia de procesos Node con comando apuntando al clon y cierre de los puertos de las dos terminales; los hijos de reinicio/recuperación terminaron0 y los browsers/Vite se cerraron en finally. El arnés retiró su mkdtemp propio; después se retiró únicamente el directorio privado sintético creado por esta tarea, validando su ruta absoluta y ausencia de enlaces. No se retiraron archivos preexistentes ni el junction de dependencias.

Único archivo nuevo en el workspace: `docs/VALIDACION-FINAL-DEMO-S4.md`. Se conservan código, OpenSpec, informes5C/5F/aceptación/503/mirada, cambios preexistentes y main. No hubo commit, push, cambios de PR/contadores/estado, merge, rebase o archivo.

[Inferencia] El usuario puede considerar solicitar revisión académica **con condiciones**, tras decidir el alcance software y los pendientes de zoom/hardware/incertidumbre. La evidencia PTY nueva aporta al criterio TTY, pero no cierra1.4c: no acredita HTTPS, ACL, costo/capacidad o terminal institucional. Las tareas0.2/5.5/6.4 y demás requisitos institucionales siguen abiertos. Publicar este informe, actualizar PR7 o pasar a Ready for Review requieren autorización posterior separada; este ensayo no ejecuta ninguna de esas decisiones.
