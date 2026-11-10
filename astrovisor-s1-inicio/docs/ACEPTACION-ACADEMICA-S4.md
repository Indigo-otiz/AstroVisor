# Sprint 4 — Expediente de aceptación académica para revisión y decisión

**El nombre de este documento no implica aceptación formal.** La autorización vigente permite publicar evidencia y actualizar editorialmente el PR7, que permanece Draft. No concede aceptación de requisitos pendientes, conformidad del equipo/docente/biblioteca, Ready for Review, merge, cierre de Sprint4 o despliegue institucional.

## Resumen ejecutivo y alcance académico

[Inferencia] La evidencia sustenta **apto con condiciones pendientes para solicitar revisión académica de una demostración software controlada**. Se ofrece esta recomendación técnica, no una aprobación formal. La decisión sobre límites académicos sigue pendiente.

S4 implementa autenticación administrativa sin BD obligatoria mediante scrypt/configuración privada y sesiones opacas; catálogo JSON persistente separado de semilla; bloqueo/revisión/If-Match; alta y edición; portadas automáticas SVG y PNG/JPEG normalizados; consulta pública; exportación Homido manual por revisión y recuperación. No representa gestión institucional de préstamos/acervo real ni administración multirrol.

Alcance demostrable: entorno Windows comprobado; administrador efímero de ensayo; catálogo bibliográfico demostrativo con altas/cambios sintéticos; portadas automáticas e imágenes sintéticas con permiso declarado; ficha/estantería; conflictos y borrador; respaldo/restauración temporal; Homido software con interacción sintética. No se atribuye aprobación docente ni acreditación de derechos concretos a estos resultados.

## Referencias y evidencia por revisión

Base main: `f1058c9b10641c470d7d3e331a81f327af78fc8c`. Último HEAD evaluado funcionalmente: `b8c4b73e18b2b6d00d91fbeef177f8bc6af22972`, con13 commits/133 archivos antes de esta publicación documental. El commit que incorpora este expediente solo añade documentación; no es una nueva ejecución funcional.

Fuentes publicadas para revisar:

- [Resumen de preintegración](RESUMEN-S4-PREINTEGRACION.md): fechas, revisiones y distinción entre pruebas históricas/locales/publicadas.
- [Corrección del manejo de errores](CORRECCION-S4-ERRORES-LIMPIEZA.md): f8154cbb3cfe158e2d1431249c67e5044d8046cd, EIO principal frente a EACCES secundario; rojo0/12 y verde12/12, enfocados54/54, backend132/132 dos veces. Frontend142/143, aislado5/5 y repetición143/143, sin ocultar el primer fallo.
- [Estabilización del ensayo de mirada](INVESTIGACION-S4-MIRADA-INTERMITENTE.md): b8c4b73e, controlador22/22, Homido78/78, frontend153/153, backend versionado132/132, build/S4 correctos. Controladores/default3000 ms intactos; mutaciones de umbral/cancelación/confirmación detectadas.
- [Validación final Chrome/PTY](VALIDACION-FINAL-DEMO-S4.md): ejecución nueva sobreb8c4b73e, Chrome completo0/13033 ms/0 pageerrors, reinicio con proceso nuevo, mirada sintética, PTY y restauración3; sin suites completas repetidas durante esa demo.
- [Responsive5B](PRUEBA-S4-ETAPA5B.md), [portadas/seguridad5D](PRUEBA-S4-ETAPA5D.md), [hashes5E](PRUEBA-S4-ETAPA5E.md), [recuperación2B](PRUEBA-S4-ETAPA2B.md) y [aceptación local5A](PRUEBA-S4-ETAPA5A.md): evidencia histórica y límites por etapa.

5F original continúa local, con síntesis publicada en el resumen:9-nov-2026,358f8979c30c28b6f35578b7e5f4c227325b289f, clon limpio Windows/NTFS/Node24.21.0/npm11.0.0/OpenSpec1.14.3; npm ci sin cambio de lockfile,119/119 backend,143/143 frontend, build/S4 correctos, auditorías npm con0 avisos y Chrome156.0.8078.80/WebGL software. La demo final reutilizó dependencias y Playwright externo, no fue otra instalación limpia.

**145/145 backend es un resultado exclusivamente local con13 tests diagnósticos503 adicionales. El PR contiene la suite versionada de132 tests, no ese arnés.** Todos los resultados son ejecuciones locales documentadas, no certificaciones ni nuevas pruebas independientes de GitHub Actions.

## Matriz A/B/C

A=defecto bloqueante funcional/seguridad; B=condición académica pendiente de aceptación; C=requisito institucional pendiente. No confundir con un resumen local anterior que llamaba A al alcance demostrable. Los responsables indicados son roles para decidir/verificar, no conformidades recibidas.

### A — Criterios de bloqueo de código

| Requisito | Evidencia y estado observado | Limitación / OpenSpec | Responsable y decisión pendiente |
| --- | --- | --- | --- |
| Autorización y exposición | 5F,parche f8154cbb y suites132/132: autenticación privada, rechazo sin token/configuración inválida y HTTP sin causas internas; seguridad parser documentada5D | Una identidad, no403 por rol ni auditoría exhaustiva.1.1–1.4b/4 marcadas;1.4c abierta | Revisor backend y usuario: bloquear si se demuestra elusión, secreto expuesto o fallo obligatorio; ningún permiso para aceptar ese defecto |
| Persistencia, concurrencia y recuperación | f8154cbb: prioridad de error, diagnóstico secundario, catálogo/backup/revisión conservados; restauración confirmada con limpieza diferenciada. Demo b8c4b73e persiste tras reinicio y restaura3 | No reconstruye estado de almacenes históricos retirados ni durabilidad eléctrica.3.1–3.4/4.3 marcadas;3.5 abierta | Revisor de persistencia: bloquear ante pérdida, falsa confirmación, interferencia con lock activo o concurrencia incompatible demostradas |
| Identidad, recursos y navegación | 5F y Homido78/78; demo actual abre ficha, usa paquete8 y sale a2D; tres SVG/nueve vínculos conservados | Software/activación sintética, sin validación física.2.1/2.3/2.4/5/6.1–6.2 con evidencia parcial detallada;6.4 abierta | Revisor frontend/Homido: bloquear si aparece ficha errónea, navegación obligatoria rota o integridad comprometida |

No se identificó un nuevo A confirmado en esta auditoría documental ni en los casos ejecutados de la demo. No equivale a demostrar ausencia de todos los defectos. Un riesgo B que se concrete en los supuestos anteriores pasa a A.

### B — Condiciones académicas abiertas

| Requisito | Evidencia y estado observado | Limitación / OpenSpec | Responsable y decisión pendiente |
| --- | --- | --- | --- |
| Demo controlada y arranque | Chrome/PTY b8c4b73e nuevo: altas, imágenes, edición,412, persistencia y paquete; PTY con contraseña sin eco | PTY automatizada, no equipo institucional/TTY física.7.1/7.2/7.4 marcadas;7.5/1.4c abiertas | Usuario y demostrador: decidir aceptación del alcance Windows/loopback y guía o exigir otra ejecución |
| 503 espontáneos | 5E118/119; investigación local posterior116/119 con POST503 real y dos rechazos de preparación; luego pases. Parche publicado corrige enmascaramiento, no causa espontánea | Errno/fase originales desconocidos; arnés correlacionado solo local.3.1–3.4/4.3 marcadas, sin casilla específica503;7.5 abierta | Usuario/revisor: admitir incertidumbre acotada con captura/detención ante recurrencia o exigir causa previa |
| Suspensiones largas de mirada | b8c4b73e: recorrido determinista de cuatro etapas y reproducción de saltos; demo nominal0/33/66/100 | No política de recuperación ni percepción validada bajo interrupciones. S2R2/R3;0.2/6.4 abiertas | Usuario y responsable Homido/accesibilidad: decidir si exigir política/evidencia antes de aceptar; no seleccionar automáticamente una alternativa |
| Nativo200% | 5B90 casos CSS y demo1280/360; canal nativo inaccesible en los intentos documentados | Seis vistas sin verificación nativa; CSS no sustituye zoom.0.2/5.5 abiertas,5.5a/b parciales | Usuario/demostrador/docente si corresponde: completar o admitir expresamente pendiente sin cerrar tareas |
| Homido, sensores, móvil y audio físicos | WebGL software; handlers/RAF/DOM con entrada sintética; audio software histórico5A | Sin visor, sensores, escucha humana o confort físico comprobados.0.2/6.4 abiertas | Usuario y responsable Homido/audio: aceptar alcance software o exigir pruebas físicas |
| Plataforma y guía | Windows probado; Linux5E únicamente checkout/hashes. Guía siguiente y protocolo de demo publicados | Sin aplicación completa/sharp/suites Linux; README y prosa histórica dispersos.2.2/1.4c/7.5 abiertas | Usuario fija plataforma académica; demostrador valida alternativa antes de ofrecerla |
| Conformidades y revisión | Autorizaciones del usuario para etapas, parches y publicación documental; PR7 Draft | Sin nuevas conformidades acreditadas del equipo/docente/biblioteca.7.3/7.5 abiertas | Usuario: definir responsables/revisiones requeridos y autorizar separadamente solicitud de revisión/estado |

### C — Operación institucional pendiente

| Requisito | Evidencia y estado observado | Limitación / OpenSpec | Responsable y decisión pendiente |
| --- | --- | --- | --- |
| HTTPS, ACL, cuenta y proxy | Identidad temporal/scrypt/rate limit y pruebas de rechazo; PTY local ejecutada | No configuración, capacidad/costo/proxy o permisos en destino.0600 no acredita ACL Windows.0.4/1.4c abiertas | Operador/seguridad por designar: configurar y ensayar antes de datos/credenciales reales |
| Volumen, escritor y estático | Un escritor local y estático temporal que responde con Express detenido | Sin servicio/alias/volumen institucional ni soporte multihost/NFS.0.4 abierta;8.6 pospuesta | Operador por designar: aprobar rutas/volumen/disponibilidad y revisar reglas históricas S1 |
| Copia externa y durabilidad | Restauraciones temporales5A a6 y demo actual a3; avisos conservados | TEMP no es copia externa; sync de directorio Windows y corte eléctrico no acreditados.3.5 abierta;8.4 automatización pospuesta | Operador de respaldo: copiar JSON+imágenes a destino externo y probar recuperación real |
| Migración y conservación | Semilla exclusiva y consumidores activos Express/paquete; fixtures conservados para tests/S3/compatibilidad | No migrador genérico ni copias de entradas operativas acreditadas.2.2 abierta | Custodio/operador: inventariar y ensayar migración sin sobrescritura; no borrar fixtures sin justificar uso |
| Imágenes, derechos y retención | 5D y demo: límites por archivo/decodificador, reencode, recursos inmutables y permiso declarado | Sin cuota total/GC; permiso declarado no acredita derechos reales; audio/historia incoherentes rechazados.8.1a–g con evidencia;8.5 pospuesta;3.5/6.4 abiertas | Custodio/operador: validar derechos/capacidad/retención y copia, sin borrar recursos históricos necesarios |
| Dispositivos y plataforma destino | Windows software y hashes Linux5E | No suites/instalación completa Linux ni nativo/hardware/audio del destino.0.2/1.4c/5.5/6.4 abiertas | Responsables institucionales por designar: validar plataforma y accesibilidad antes de despliegue |

## Coherencia y riesgos conservados

Las cifras119/143 de5F,132/143 del parche y132/153 de auditoría de mirada pertenecen a revisiones distintas.145 incluye diagnóstico local. Los fallos142/143 de mirada y118/119/116/119 de503 no desaparecen por repeticiones verdes. La corrección de limpieza no demuestra causa de503; el ensayo determinista no define política ante suspensiones.

S4 estricto pasó en las ejecuciones documentadas. S2 independiente salió1: `No delta sections found` y `Change must have at least one delta`, por encabezados de capacidad/R1–R5 sin deltas/escenarios reconocidos. Es estructura del cambio frente al esquema, no test funcional. No se declara S2 validado ni se modifica para hacerlo pasar.

OpenSpec conserva prosa histórica de2B/3A/5A que debe leerse con las etapas posteriores: el panel/exportador ya están implementados; el desbordamiento CSS447/360 de5A tiene corrección5B, mientras nativo200% sigue abierto. El estado TTY de5F fue anterior a la PTY nueva; esta no acredita operación institucional. Los originales no se reescriben para aparentar que ya conocían evidencia posterior.

Siguen abiertas0.2,0.4,1.4c,2.2,3.5,5.5,6.4,7.3 y7.5. Impiden declarar satisfecho el cierre completo de S4. Las mejoras8.2/8.3/8.4/8.5/8.6 permanecen pospuestas; posponer8.4 no dispensa copia externa manual de3.5. Ninguna casilla se cierra en esta publicación.

## Guía reproducible de demostración

Procedimiento para una ejecución posterior, basado en ensayos publicados; no una nueva ejecución al publicar. Usar copia separada del commit funcional evaluado, Windows/Node24.21.0 o validar otra plataforma. Solo cuenta/archivos nuevos sintéticos.

1. Instalar desde lockfile con `npm ci`. Configurar en **cada terminal correspondiente** rutas absolutas externas/separadas `ASTROVISOR_DATA_DIR`, `ASTROVISOR_ADMIN_FILE` (archivo nuevo en carpeta privada), `ASTROVISOR_COVERS_DIR` y `ASTROVISOR_PUBLIC_EXPORT_DIR`. La última no debe contener datos/identidad/originales privados.
2. `npm run init:catalogo` exclusivamente sobre almacén nuevo. `npm run configurar:admin` en terminal interactiva, contraseña sin argumentos/historial. No usar init como migración/restauración de datos existentes ni cuentas demo de producción.
3. API: `npm run dev:api` (proxy frontend espera3001). Vite: `ASTROVISOR_EXPORT_ORIGIN=http://127.0.0.1:3002` y `npm run dev --workspace frontend -- --host 127.0.0.1`; abrir localhost5173. Para arnés Chrome preparar Playwright externo/Chrome y `ASTROVISOR_PLAYWRIGHT_MODULE`, ejecutar `node scripts/probar-portadas-hibridas.mjs completo` solo en copia temporal porque genera evidencias.
4. Login y alta sintética con ID único, título/autor/año/enlace de ensayo, portada automática y varias relaciones/motivos. Previsualizar, confirmar, consultar estantería/ficha. Usar PNG/JPEG sintético dentro de2MiB/4096px/8MP con procedencia/permiso/alternativa; no modificar los SVG originales.
5. Editar, guardar y consultar; reiniciar Express con mismo almacenamiento y comprobar persistencia. Desde dos sesiones sobre la misma revisión, guardar una y después otra: mostrar412 y borrador conservado. Ante respuesta incierta, consultar estado antes de decidir; no reintentar POST/PATCH automáticamente.
6. `npm run exportar:homido`; comprobar revisión/confirmación/avisos. `npm run dev:homido:respaldo` con entorno completo, loopback3002; consultar Homido software, ficha, pausa/salida. Detener Express manteniendo estático/Vite para demostrar paquete identificado; no prometer disponibilidad si también cae el estático.
7. Solo con datos desechables/API detenida, `node scripts/recuperar-catalogo.mjs restaurar <respaldo-conocido> <ultima-revision>`; comprobar revisión superior/metadatos y lectura nueva. CLI0=confirmada;2=confirmada con limpieza pendiente, NO repetir automáticamente;1=inspeccionar estado sin asumir éxito. No borrar un lock activo. La publicación anterior sigue en su revisión hasta nueva exportación.
8. Registrar commit, fecha, entorno, acciones y fallos. Para nativo200%, observar Chrome real: capturar indicador de menú, ventana/viewport, overflow, Tab/Shift+Tab/Enter/foco y acciones en estantería/ficha/acceso/panel/alta/edición. No sustituirlo por CSS ni escala emulada. No ejecutar diagnóstico503 local como si formara parte del checkout del PR.

## Condiciones de revisión y decisiones no aprobadas

| Condición | Estado y decisión necesaria |
| --- | --- |
| Preparación para solicitar revisión | Recomendación técnica condicionada y evidencia publicable; solicitud/cambio de estado requieren autorización posterior |
| Aceptación académica formal | Pendiente de decisiones del usuario y conformidades requeridas; no concedida por publicación |
| Autorización de merge | No otorgada; separada de revisión y sujeta a protecciones/requisitos vigentes |
| Finalización/archivo de S4 | No autorizados; tareas obligatorias siguen abiertas |
| Preparación institucional | No acreditada; completar C y permisos antes de datos reales/despliegue |

- [ ] Aprobar alcance sintético Windows/software y guía o exigir validaciones adicionales.
- [ ] Completar nativo200% y pruebas físicas o admitirlos expresamente como pendientes, sin cerrar tareas.
- [ ] Decidir tratamiento de incertidumbre503 y condiciones para detener/capturar recurrencia; no aceptar defectos obligatorios demostrados.
- [ ] Decidir si exigir política/validación ante suspensiones largas antes de aceptación; ninguna alternativa se selecciona aquí.
- [ ] Precisar conformidades/revisores de equipo/docente que se requieren y registrar solo las recibidas.
- [ ] Autorizar por separado Ready for Review/solicitud de revisión, merge y eventualmente cierre/despliegue, si corresponden.

Un defecto demostrado de autorización, secreto expuesto, integridad, concurrencia, falsa confirmación o navegación obligatoria impide merge; también un503 obligatorio nuevo sin impacto evaluado, criterios académicos exigidos incumplidos, cambios no revisados o protecciones pendientes. No se autoriza evadir protecciones.

PR6 fue la alternativa seleccionada e integrada en main; PR5 es alternativa no seleccionada, no dependencia ni bloqueante S4. No se modifican. Los informes5C/5F originales, propuestas, zoom local, investigación503 ampliada y arnés permanecen fuera de esta publicación. Este expediente y el resumen son versiones publicables revisadas; [la demo](VALIDACION-FINAL-DEMO-S4.md) conserva su registro histórico, incluidas expresiones de no publicación anteriores a esta autorización documental. No se alteran OpenSpec ni pruebas.
