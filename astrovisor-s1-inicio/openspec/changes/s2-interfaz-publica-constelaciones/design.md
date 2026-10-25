# Diseño técnico S2

## Context

Véase `proposal.md` para la motivación. La inspección encontró Vue 3, Vue Router, Vite y Express en `astrovisor-s1-inicio/`. `ExplorarView.vue` ya consume `cargarRecorridos()`, muestra carga/error/lista vacía y tres resúmenes. No hay historia, detalle ni reintento. `content/recorridos.json` es leído por `documentRepository.js` y expuesto como arreglo por `/api/contenidos/recorridos`. La prueba existente verifica IDs, títulos y `demostracion`.

`App.vue` y `styles.css` se comparten con visor y administración. El experimento Homido tiene su página independiente. `DEMO/` contiene una demo React de planetas y no es la base de S2. OpenSpec conserva dos cambios S1 abiertos y todavía no tiene especificaciones principales archivadas. La checklist académica S1 y sus tareas internas tienen estados distintos; este cambio no resolverá ni certificará retroactivamente esos estados.

Figma muestra un sistema visual, inicio, recorrido 2D, detalle superpuesto y estados. Es referencia de estructura e identidad; algunos ejemplos (audio, libro y módulos administrativos) exceden la tarea de Luis. El contenido público de S2 se ajusta al alcance indicado por el usuario.

## Goals / Non-Goals

**Goals:** reutilizar la lectura documental y las rutas; añadir navegación de detalle enlazable; aislar los estilos públicos; hacer verificable el contrato de contenido y la recuperación de errores; separar evidencia técnica de revisión humana.

**Non-Goals:** cambiar de framework, introducir almacenamiento nuevo, crear un editor de documentos, instalar librerías de UI o convertir el prototipo de Figma en todos los módulos del producto. No se necesita renderer Markdown porque el formato JSON existente resuelve este incremento.

## Decisions

### 1. Ampliación aditiva del documento actual

Conservar `orion`, `osa-mayor` y `escorpio`, sus campos y arrays actuales. Añadir `historia` y `comoReconocerla` como textos breves, en español y demostrativos. No incrustar HTML ni contenido editorial en componentes. Los relatos se presentarán como adaptaciones de muestra, distinguiendo relato cultural de explicación de la figura celeste, sin atribuirlos a la biblioteca.

Alternativa descartada: otro catálogo o endpoint específico de constelaciones. Duplicaría la fuente y alteraría innecesariamente la integración S1. La prueba documental se ampliará para comprobar IDs únicos y campos de lectura necesarios. No se migra ni escribe desde la API.

### 2. Listado y ficha con URL propia

Mantener `/` y `/explorar`; añadir `/explorar/:id` para la ficha. Reutilizar el servicio actual para resolver el registro en la colección, incluyendo apertura directa y actualización de la página. Las fichas tendrán enlaces semánticos con nombre concreto, por ejemplo «Leer la historia de Orión». Habrá retorno al listado y tratamiento explícito de ID inexistente.

Se elige página de detalle frente al modal de Figma: facilita lectura prolongada, enlaces compartibles e historial en móvil y reduce gestión de foco y confinamiento de teclado. Se conservan identidad visual y jerarquía de la referencia, sin trasladar su barra interna de selección de marcos al producto.

### 3. Consulta recuperable y datos validados

Mantener `contentService.js` como frontera HTTP, con comprobación de estado HTTP, JSON, arreglo y forma mínima de los registros. Un composable pequeño, si ambas vistas lo necesitan, compartirá carga, resultado, error y reintento; no se añadirá una tienda global. Si se crea, seguirá la convención `use…` de Vue.

Cada reintento vuelve a consultar la API. Evitar solicitudes superpuestas y resultados obsoletos al cambiar de ruta o desmontar una vista, mediante cancelación o identificador de solicitud. Usar mensajes para visitantes, sin instrucciones técnicas como «enciende Express». Reservar los detalles de diagnóstico para desarrollo. Una respuesta vacía no es un error; un ID desconocido solo se decide después de una consulta válida.

### 4. Adaptación visual limitada al flujo público

Referencia observada: fondo `#FAF7F0`, tarjetas `#FFFFFF`, texto `#1B2430`, azul web `#1F4E8C`, acento `#F5B301`, espacio `#0B1530` y estrellas `#FFF4CF`. Cuerpo de referencia de 20 px, tarjetas con radio de 20 px y botones de 14 px. Estos valores guían tokens públicos, no cambios globales sin revisar su efecto.

Composición prevista: cabecera pública con navegación existente; inicio con invitación clara a explorar; listado con tres fichas e ilustraciones de constelaciones; detalle con nombre, esquema, resumen, historia y reconocimiento; pie con aviso provisional. Una columna en móvil y rejilla adaptable en escritorio. No se copian planetas, catálogo, reproducción, pausa ni controles decorativos sin función. El zoom del navegador será suficiente para S2; no se añade un control propio de tamaño de letra.

Usar componentes y CSS acotados al flujo público, manteniendo las reglas base que necesitan visor y administración. Si `App.vue` requiere una variante según ruta, limitar sus efectos a inicio/listado/detalle y verificar las otras rutas como regresión. La alternativa de reemplazar todo `styles.css` se descarta porque afectaría trabajo de otros integrantes.

### 5. Ilustraciones esquemáticas y accesibilidad

Generar diagramas SVG locales, sencillos, con estrellas y conexiones de las tres figuras. Son esquemas didácticos, no mapas de precisión ni predicciones de visibilidad. No se necesitan imágenes externas ni generación raster. Los diagramas pueden ser decorativos cuando el texto contiguo ya identifica la constelación; cualquier información propia relevante tendrá alternativa textual.

Usar jerarquía de encabezados, texto sin justificar, ancho de lectura cómodo, controles de al menos 48 px, foco visible, contraste verificable, enlace de salto y anuncios accesibles de carga/error. Tras navegar, orientar el foco al contenido sin perder los enlaces de regreso. Evitar movimiento automático y respetar reducción de movimiento. Comprobar 360 px, 1280 px, teclado y ampliación de texto al 200 %.

### 6. Evidencia académica separada de OpenSpec

Crear durante la implementación `docs/PRUEBA-S2.md` y capturas bajo `docs/evidencias/s2/`. Registrar fecha real, entorno, tamaños, pasos, resultado, limitaciones y enlaces relativos al código y las imágenes. Capturar el flujo con la API real; los estados inducidos por demora o fallo se identificarán como condiciones controladas. Una captura técnica no acredita una prueba de usabilidad con personas adultas mayores ni una prueba física de teléfono.

El registro de revisión cruzada incluirá nombre del integrante, fecha, commit/PR o versión revisada, observaciones y resultado, inicialmente pendientes. Las pruebas automáticas o una revisión de IA no sustituyen ese criterio. No se publicará un PR ni se enviarán mensajes a compañeros sin instrucción adicional. OpenSpec no se enumerará como entregable académico.

## Risks / Trade-offs

- Figma incluye funciones de otros módulos → adaptar solo el flujo público y declarar las diferencias de alcance.
- Cambio en datos compartidos con otros sprints → preservar campos/IDs y añadir texto sin alterar el contrato de arreglo de la API.
- Estilos compartidos → usar variantes acotadas y revisar `/visor`, `/admin/acceso` y la redirección de `/admin`.
- API caída o documentos incompatibles → error comprensible, reintento y pruebas del servicio con respuestas controladas.
- Contenido todavía no autorizado → mostrar aviso demostrativo, evitar recursos externos y no atribuir material a la institución.
- Revisor y material de biblioteca pendientes → registrarlos como pendientes reales; no bloquean la implementación técnica aprobada.
- Contenido esquemático → no afirmar precisión astronómica, visibilidad local ni orientación real del cielo.

## Migration Plan

Después de la aprobación, aplicar en una rama de trabajo acorde al repositorio: datos aditivos, componentes públicos, rutas/servicio y evidencia. Ejecutar pruebas documentales y de consumo frontend, build y revisión real en navegador antes de presentar el resultado. No se requiere migración de base de datos ni despliegue.

La reversión se limita a los archivos del cambio y a la ruta añadida, preservando el trabajo S1 y de otros integrantes. No se archivarán cambios OpenSpec sin aprobación posterior.
