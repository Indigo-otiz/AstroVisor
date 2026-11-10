# Verificación de S4 con main

Registro del 10 de noviembre de 2026, America/Mexico_City. Responsable de la entrega: Luis Alberto Rodríguez.

Se combina la entrega S4 de la rama `codex/s4-web-computadora-proyeccion`, hasta `16848a1`, con `main` en `c294ecc167279dfb2f29b51371f278d5b6b9ef78`. La combinación conserva la biblioteca, el catálogo persistente, el visor y los logos institucionales incorporados por el equipo. No hubo conflictos de Git.

## Resultados efectivos

| Comprobación | Resultado |
|---|---|
| npm test | 132/132 aprobadas, 0 omitidas. |
| npm run test:web | 153/153 aprobadas, 0 omitidas. |
| npm run build | Correcto, assets index-C-ENQNVz.js e index-CdvUSALg.css. |
| scripts/verificar-s4.cjs --serve | 50/50 casos correctos, 0 errores JavaScript de página. |
| Recorrido original S4 | 44 casos repetidos sobre la combinación, con API y WAV reales. |
| Biblioteca y pie institucional | 6 recorridos adicionales: 360/1024/1920 px por vista habitual/proyección; navegación entre constelación, estantería y libro, tres logos cargados y sin desbordamiento horizontal. |
| Diff propio respecto de origin/main | Sin errores de espacios ni conflictos. |

Chrome 157.0.8103.50 en Windows; suites con Node 24.20.0. Los tamaños son viewports de navegador. Las fallas de API, WAV y A-Frame son inducidas; no se presentan como incidentes del hardware.

## Entorno y repetición

El servidor auxiliar crea un catálogo de demostración fuera del checkout, en un directorio temporal independiente. Aísla las rutas de catálogo, identidad, imágenes y exportación; no abre cuentas reales. Cierra API, preview y escritor documental y elimina únicamente el directorio temporal creado para la prueba.

Para las suites en Windows se fijaron TEMP y TMP a la ruta completa obtenida con `fs.realpathSync.native(os.tmpdir())`. Los alias cortos de Windows fueron rechazados por comprobaciones de integridad del código de main. El primer intento coincidió además con la recreación de dist durante una prueba que verifica su inmutabilidad. La ejecución final ocurrió con build estable; no se relajaron las comprobaciones de seguridad ni se modificaron funciones productivas del equipo.

La regresión del navegador usa Playwright externo, Chrome local y `S4_EVIDENCE_DIR` apuntando a esta carpeta. El build ya debe existir antes de ejecutar `node scripts/verificar-s4.cjs --serve`. Los logs backend.txt, frontend.txt y build.txt conservan los resultados finales; navegador.json enumera los casos y las capturas identifican ancho y vista. Los intentos de diagnóstico se conservaron en .qa, fuera de la entrega.

## Correspondencia con la entrega académica

El informe Word de ocho páginas y el video local son los materiales ya revisados de la entrega individual. Sus capturas documentan la versión previa a esta combinación. Las nuevas capturas muestran también el pie institucional y la biblioteca actualizados; no se sustituyen retrospectivamente las evidencias de S3 ni las de la entrega S4 original.

No se repitieron en esta integración el zoom nativo al 200 %, la comprobación física de Homido/pantalla, la revisión de Índigo ni la reproducción completa del video. Sus resultados anteriores conservan el alcance de sus registros. La simulación CSS del texto al 200 % sí forma parte de los 50 casos actuales.

version.json identifica los hashes del código combinado, build, logs, capturas y materiales académicos. Es una captura previa al commit de integración y no pretende incluir su propio hash ni atribuir un commit futuro. El resultado remoto del merge se comprueba en GitHub.
