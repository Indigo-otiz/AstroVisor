# Sprint 4 — Resumen de preintegración académica

**Publicación documental para revisión, no aceptación formal.** Este resumen consolida registros locales de pruebas; no es una ejecución independiente de GitHub Actions ni una certificación de seguridad, accesibilidad o uso institucional. No autoriza Ready for Review, merge, cierre de S4 o despliegue.

## Propósito, referencias y entorno

La evaluación considera la rama `indigo/s4-persistencia-documental`, base main `f1058c9b10641c470d7d3e331a81f327af78fc8c`. El último commit funcional/de pruebas evaluado es `b8c4b73e18b2b6d00d91fbeef177f8bc6af22972`; esta publicación añade únicamente documentación posterior. Los conteos13 commits/133 archivos corresponden a ese HEAD previo, no al commit documental que contiene este resumen.

Las ejecuciones citadas son del **9 de noviembre de2026**, en Windows/NTFS, Node24.21.0 y npm11.0.0. OpenSpec1.14.3, Vite6.4.5, body-parser1.20.9 y sharp0.35.5 fueron comprobados en la revisión5F. Chrome headless156.0.8078.80 y WebGL software se usaron en5F y en la demostración final. Esta última utilizó Playwright1.56.1 externo y dependencias reutilizadas mediante junction; no fue otra instalación limpia.

## Alcance implementado y evidencia

El prototipo ofrece identidad administrativa mediante configuración privada/scrypt, comparación segura y sesiones Express opacas; semilla versionada separada del catálogo JSON privado; alta/edición autorizadas con If-Match y revisión dentro del bloqueo; respaldo/restauración; biblioteca pública por ID; portadas automáticas y PNG/JPEG normalizados con permiso declarado/alternativa; proyección y exportación manual Homido por revisión. Conserva tres SVG y nueve relaciones originales. Una declaración de permiso no acredita derechos institucionales.

| Revisión o ejecución | Resultado documentado | Alcance y límite |
| --- | --- | --- |
| 5F sobre358f8979c30c28b6f35578b7e5f4c227325b289f | npm ci correcto en clon limpio, lockfile sin cambios; backend119/119, frontend143/143, build y S4 estricto correctos; npm audit y omit=dev con0 avisos reportados | Windows; auditorías a esa fecha, no garantía de ausencia de vulnerabilidades. El informe5F original continúa local; aquí se publica su síntesis |
| Parche f8154cbb3cfe158e2d1431249c67e5044d8046cd | Escritor anterior0/12 frente a corregido12/12; enfocados54/54; dos procesos backend132/132; frontend inicial142/143, aislado5/5 y repetición143/143; build/S4 correctos | Fallo inicial de mirada conservado; pases posteriores no identifican su retraso histórico |
| Auditoría de mirada b8c4b73e18b2b6d00d91fbeef177f8bc6af22972 | Mirada22/22, todos Homido78/78, frontend153/153, backend versionado132/132; build/S4 correctos; seis mutaciones temporales detectadas | Selección backend de16 archivos versionados; no incluye arnés503 local. Controladores de producción y default3000 ms intactos |
| Copia local con diagnóstico503 | Backend145/145, incluidos13 tests diagnósticos locales | **Los145 tests no están contenidos en el PR**: arnés, tests y reporte diagnóstico siguen sin versionar; la suite versionada contiene132 |
| Demostración final sobreb8c4b73e | Chrome completo salida0,13033 ms,0 pageerrors; ensayo complementario salida0; PTY y recuperación comprobadas | Datos sintéticos y procesos temporales; no suites completas, npm ci/build/audit/OpenSpec nuevos durante esa demostración |

Las suites de persistencia y seguridad documentan configuración ausente/corrupta rechazada, falta de token, revocación, rechazo de sobrescritura inicial, conflictos/concurrencia, errores inyectados, respaldo íntegro, revisión superior al restaurar y respuestas sin causas privadas. Las pruebas HTTP de5D incluyen cuerpos comprimidos rechazados y supervivencia del proceso. No acreditan HTTPS, ACL, capacidad o respaldos externos del destino institucional.

### Correcciones verificadas, separadas de las incertidumbres

Commits publicados: [f8154cbb](https://github.com/Indigo-otiz/AstroVisor/commit/f8154cbb3cfe158e2d1431249c67e5044d8046cd) y [b8c4b73e](https://github.com/Indigo-otiz/AstroVisor/commit/b8c4b73e18b2b6d00d91fbeef177f8bc6af22972).

- **f8154cbb:** una excepción secundaria de limpieza ocultaba EIO principal. Ahora `cause` conserva el original y `erroresLimpieza` distingue secundarios; HTTP sigue genérico y se conservan reintentos/confirmación/CLI. **No identifica la causa de los503 espontáneos**. Evidencia: [corrección de limpieza](CORRECCION-S4-ERRORES-LIMPIEZA.md).
- **b8c4b73e:** el ensayo reducido a100 ms con temporizadores reales podía no muestrear33%. Se reprodujo con entregas80/96/112 ms y bloqueo deliberado real. Las pruebas nuevas controlan reloj/actualizaciones privados, conservan todas las etapas, pausa/cancelación/reinicio/confirmación única y no modifican producción. **No define una política ante suspensiones largas ni identifica el retraso de cada fallo histórico**. Evidencia: [investigación de mirada](INVESTIGACION-S4-MIRADA-INTERMITENTE.md).

## Navegador y PTY: histórico frente a evidencia nueva

Chrome5F comprobó login, PNG/JPEG/automática, edición/transiciones,412 y paquete8 con API detenida. Responsive5B conserva90 casos CSS,34 desbordamientos antes y0 después; no fue zoom nativo. Son ejecuciones anteriores, no las del último ensayo.

La [validación final de demostración](VALIDACION-FINAL-DEMO-S4.md), sobreb8c4b73e, repitió las altas y transiciones, consulta pública,412 con borrador y exportación8 con Express detenido/estático disponible. Un proceso API nuevo conservó la edición realizada desde Chrome. La mirada software mostró0/33/66/100, abrió ficha y permitió pausa/continuación/salida2D mediante activación sintética, no sensores físicos.

En PTY, stdin/stdout/stderr indicaronTTY, el generador pidió la contraseña sin eco y terminó0. Se verificaron init0, rechazo de destino existente1 sin cambio de hash, exportación2 confirmada, restauración3 con metadatos/relaciones iguales al respaldo y consulta pública desde otro proceso. La copia pública permaneció en2 hasta otra exportación; no hay sincronización automática.

Se conserva el primer arranque estático fallido1 por variables privadas omitidas en esa terminal y la repetición correcta con entorno completo. Las sesiones interrumpidas con Ctrl+C terminaron con estado1, sin código Node independiente; después se comprobaron puertos cerrados y ausencia de lock. Los cierres IPC del ensayo sí terminaron0. No se ocultan avisos de durabilidad ni se atribuye la interrupción automáticamente a un defecto funcional.

## Riesgos y criterios pendientes

- **503:**5E118/119 en CLI ambos; la investigación local posterior sobre358f897 registró116/119, con un POST HTTP503 inesperado y dos rechazos de preparación. Después hubo pases, pero los errores originales de esos episodios no quedaron capturados. EPERM recuperados o EIO/EACCES inyectados en otros ensayos no explican la causa histórica. Los resultados de esa investigación se resumen aquí; el informe ampliado y el arnés permanecen locales, sin enlace a un archivo inexistente en GitHub.
- **Mirada:** ambos módulos pueden saltar fases cuando no hay actualizaciones durante su intervalo. No se decidió reiniciar/suspender/acumular tiempo observado ni se validó percepción bajo suspensión. Los tests nominales y la demo no resuelven esa política.
- **Accesibilidad/hardware:** zoom nativo200% no activado/verificado por falta de canal nativo; seis vistas pendientes. CSS zoom/viewport software no lo sustituyen. Sin Homido/móvil/sensores físicos ni escucha humana de audio.
- **Linux:**5E probó checkout/hashes de tres SVG y rechazó CRLF/byte alterado; no instalación de sharp, suites completas, API o Chrome Linux. Validar la plataforma si se elige como destino.
- **Operación:** una identidad, un escritor local, sesiones/borradores en memoria, tipografía acotada, sin cuota total ni GC de imágenes/paquetes. No borrar recursos aún referenciados. HTTPS/ACL/proxy, volumen, capacidad, copia externa de JSON+imágenes y restauración real sin acreditar; sync de directorios/durabilidad eléctrica pendientes.
- **Conformidades:** no se acreditan nuevas aprobaciones de equipo/docente/biblioteca; la publicación autorizada no las sustituye.

S4 estricto pasó en las ejecuciones citadas. La validación independiente `openspec validate s2-seleccion-mirada-homido --strict` terminó1 por ausencia de deltas/escenarios reconocibles por el esquema, no por un test funcional. S2 no se declara válido ni se cambia su estructura. OpenSpec permanece intacto.

## Condiciones de revisión

[Inferencia] **Apto con condiciones pendientes para solicitar revisión académica de una demostración software controlada.** Usar Windows comprobado, configuración privada temporal, datos bibliográficos demostrativos y altas/cambios sintéticos, imágenes de prueba y Homido software. Los detalles, matriz y guía están en el [expediente para revisión y decisión](ACEPTACION-ACADEMICA-S4.md).

Siguen abiertas0.2,0.4,1.4c,2.2,3.5,5.5,6.4,7.3 y7.5. La PTY nueva aporta evidencia parcial a1.4c; no valida terminal institucional, HTTPS/ACL/costo. Las mejoras pospuestas no dispensan requisitos obligatorios. Aceptación académica, Ready for Review, merge, cierre y operación institucional requieren decisiones distintas.

Los originales5C/5F, propuestas locales, registro local de zoom, investigación503 y arnés diagnóstico no se incorporan. Este resumen y el expediente son sus versiones publicables autorizadas; el informe de demo se publica sin reescribir su registro. Sus expresiones «informe local/sin publicación» describen el momento del ensayo anterior, no una prohibición de esta publicación documental posterior. No se repitieron pruebas funcionales al preparar estos documentos ni se presenta su publicación como aceptación.
