# PR #6 — corrección bibliográfica y validación

Rama revisada: `feat/estanteria-libros-demo`. Base de la corrección: `8b6ffc3f7e853ec696cbbd2e01bba0d16abb3154`. Este informe corresponde a las correcciones autorizadas para publicación; no describe implementación de Sprint 4 ni autoriza merge.

## Cambios

- `Star Lore of All Ages`: `https://archive.org/details/starloreofallage00olco`.
- `Half-Hours with the Stars`: `https://www.gutenberg.org/ebooks/23300`.
- Actualizados `content/BIBLIOGRAFIA.md`, `content/recorridos.json`, `frontend/src/data/libros-demo.json` y `frontend/public/prueba-homido/data/recorridos-demo.json`.
- Añadida prueba de correspondencia de URLs entre catálogo, contrato documental y bibliografía en `frontend/test/biblioteca-demo.test.js`.
- Aclarado OpenSpec de #6: Homido agrega navegación bibliográfica/subvistas conservando las funciones previas de mirada de 3 s, renderizado estéreo y narración. Se registraron comprobaciones automatizadas completadas, sin archivar el cambio.

El respaldo de Orión ya tenía el enlace aprobado; el de Escorpio tenía el ID correcto por HTTP. Los enlaces antiguos del documento canónico (`39064` y `40292`) no coincidían con las obras seleccionadas. Se aplicaron únicamente las dos referencias autorizadas, sin cambiar años, licencias ni otros metadatos.

## Resultados realmente ejecutados

Windows, PowerShell, Node `v24.21.0`, npm `11.0.0`; comandos desde `astrovisor-s1-inicio/`. Las suites y build se ejecutaron tras corregir y se repitieron antes de preparar la publicación, con los mismos resultados. Se permitió ejecución fuera del sandbox para procesos Node/Vite.

| Comprobación | Resultado |
|---|---|
| `npm test` | Código 0, 8/8 pasan |
| `npm run test:web` | Código 0, 93/93 pasan |
| `npm run build` | Código 0, Vite 6.4.4, 89 módulos |
| `openspec validate invitacion-lectura-estanteria-demo --strict` | Código 0, cambio válido |

La nueva prueba falló antes de corregir los datos y pasó después. Salidas de la validación inicial: [pr6-validacion.txt](evidencias/pr6-validacion.txt). No se presentan los tests de autenticación con fixture como prueba del servicio Supabase desplegado.

## Integridad y navegación

Las aserciones complementarias locales comprobaron:

- Igualdad completa entre JSON canónico, respaldo Homido y copia del respaldo generada en `dist`.
- Cada JSON coincide con la base después de aplicar solo las URLs aprobadas: IDs, relaciones, autoría, transcripciones y demás campos conservados.
- Los nueve pares libro/constelación resuelven mediante el servicio bibliográfico.
- Las salidas Homido resuelven los libros esperados: `/explorar/orion/libros/star-lore`, `/explorar/osa-mayor/libros/field-stars`, `/explorar/escorpio/libros/half-hours`.
- Los tres SVG mantienen los hashes registrados en la evidencia y son idénticos a sus copias compiladas. No se modificaron estilos ni portadas.

La suite web cubre API/respaldo con datos simulados, estados y detalle de libros, mirada y regresión del narrador. Estas comprobaciones no ejecutan sensores físicos ni sustituyen la navegación real en un navegador.

## Pendientes explícitos

No se realizó validación interactiva en navegador: el acceso conectado devolvió `browsers: []` y «The browser access host is unavailable». Pendientes escritorio, móvil/360 px, teclado y foco, texto al 200 %, escucha real, escena WebGL y Homido/teléfono físico. No se atribuyen esas pruebas a esta entrega ni se considera emulación como prueba física.

Se conservaron las atribuciones existentes por el alcance autorizado: los metadatos de Olcott todavía mencionan Project Gutenberg aunque el enlace aprobado es Internet Archive. Su revisión de procedencia/licencia queda registrada como pendiente bibliográfico, sin inventar permisos.

## Alcance de publicación

Solo corrección bibliográfica, prueba, documentación de #6 y evidencia. Se excluyen `.gitignore` preexistente, presentaciones, temporales, planificación S4 y el informe mixto `VALIDACION-PR6-S4.md`. Ningún SVG, credencial, archivo de entorno, `node_modules` o `dist` forma parte del commit. La PR #6 y #5 siguen siendo alternativas; esta publicación no solicita integrarlas conjuntamente.

Quedan sin autorizar merge y archivo OpenSpec. Las decisiones posteriores de S4 se mantienen para su preparación desde main cuando corresponda.
