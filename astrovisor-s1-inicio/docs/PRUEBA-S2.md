# Evidencia de la interfaz pública S2

Responsable académico: Luis. Sprint: 19–23 de octubre de 2026. Verificación técnica realizada el **24 de octubre de 2026**, zona America/Mexico_City. El periodo académico y la fecha real de prueba se registran por separado.

La interfaz pública permite explorar Orión, Osa Mayor y Escorpio, abrir sus historias y regresar al listado sin visor ni cuenta. Los textos y diagramas son demostrativos; el material autorizado de la biblioteca sigue pendiente. Índigo realizó la revisión técnica y manual; Luis confirmó el 25 de octubre de 2026 que Índigo le dio la aprobación en persona. Esta aprobación presencial se registra como información comunicada por Luis, sin atribuirle una aprobación formal dentro de GitHub.

## Versión y entorno

- Rama local: `codex/s2-interfaz-publica-constelaciones`.
- Commit base: `3f888bb686f9c606ca0b080447d85be20c795c00`. Las capturas corresponden a la implementación S2 de esta rama posterior a ese commit, no al Sprint 1 original. El commit de entrega puede identificarse en el historial de la rama.
- [Rama para revisión en GitHub](https://github.com/Indigo-otiz/AstroVisor/tree/codex/s2-interfaz-publica-constelaciones).
- [Manifiesto SHA-256 original](evidencias/s2/version.json): identifica el código y las capturas de `084b764`. Para el código, calcular SHA-256 del texto UTF-8 sin BOM y con finales de línea LF; para las capturas, calcularlo sobre los bytes originales. Esta normalización permite verificar el contenido aunque Git convierta CRLF/LF al clonar. Las correcciones posteriores tienen [su propio manifiesto](evidencias/s2/revision/version.json).
- Windows, Node.js v24.20.0, npm 11.19.0, Vue 3, Vite 6.4.4 y API Express documental.
- Página real: `http://127.0.0.1:5173/`; API real: `http://127.0.0.1:3001/`. Ambos servicios limitados a esta computadora.
- Navegador integrado de Codex/Chromium. Pruebas de viewport de 1280×900 y 360×800; las imágenes de página completa pueden excluir el ancho de la barra de desplazamiento.

## Código y flujo revisados

- [Inicio](../frontend/src/views/InicioView.vue), [listado](../frontend/src/views/ExplorarView.vue) y [ficha](../frontend/src/views/ConstelacionView.vue).
- [Consulta y validación del contrato](../frontend/src/services/contentService.js), [carga/reintento/cancelación](../frontend/src/composables/useRecorridos.js) y [estados accesibles](../frontend/src/components/ContentState.vue).
- [Contenido documental de demostración](../content/recorridos.json) y [esquema de campos](../content/README.md).

| Verificación | Resultado observado |
|---|---|
| Inicio → explorar → historia → listado | Correcto, mediante enlaces reales y datos de la API. |
| Orión, Osa Mayor y Escorpio | Cada dirección muestra su propio resumen, historia y reconocimiento. No hay fichas de planetas. |
| Recarga y dirección directa | Se consulta la colección y se resuelve la ficha sin visitar primero el listado. |
| Historial atrás/adelante | Conserva la ruta correspondiente y muestra su contenido. |
| `/explorar/no-existe` | Mensaje de constelación no encontrada y regreso al listado; no se confunde con un fallo de conexión. |
| Móvil 360 px | Una columna; documentos sin desbordamiento horizontal. `innerWidth=360`, ancho documental observado 345 px, columna de aproximadamente 305 px. |
| Escritorio 1280 px | Tres fichas en columnas y detalle con diagrama junto al texto; sin desbordamiento horizontal. |
| Teclado | Tab enfoca el enlace de una historia, Enter lo abre y el foco termina en el título. Los enlaces de regreso funcionan. |
| Controles | Acciones del listado de 48 px y botones principales de 56 px de alto, medidos en navegador. |
| Texto al 200 % | Condición controlada con raíz de 36 px frente a 18 px: cuerpo de aproximadamente 40 px frente a 20 px. Listado y detalle legibles en 360/1280 px, sin desbordamiento documental. No equivale a una prueba del zoom nativo del navegador. |
| Carga lenta y salida antes de resolver | Se muestra carga; al volver a inicio antes de responder, la petición anterior no reemplaza esa página. |
| HTTP 503 y reintento | Aparece error y botón. Al restaurar la consulta, el mismo botón obtiene las tres constelaciones sin recarga completa. |
| API devuelve `[]` | Estado vacío diferenciado del error. |
| API devuelve `{}` en detalle | Error controlado con reintento, sin presentar una ficha rota. |
| Consola del flujo real | No se observaron errores en el registro inspeccionado. |
| `/visor` y `/admin/acceso` | Se conservan contenido y estilos originales; no reciben la variante visual pública S2. |
| `/admin` y `/api/admin` | Redirección existente a acceso y denegación HTTP 401, respectivamente. No se añadió autenticación. |

## Comprobaciones ejecutadas

Desde `astrovisor-s1-inicio/`:

```bash
npm test
npm run test:web
npm run build
node --check scripts/prueba-estados.mjs
git diff --check
```

Resultados: **1/1 prueba documental**, **10/10 pruebas del consumo frontend**, compilación correcta y comprobación de sintaxis correcta. El diff no contiene errores de espacios. El build necesitó ejecutarse fuera del aislamiento del entorno por restricciones de lectura de esbuild. El detector de interfaz de Impeccable se ejecutó una vez sobre los archivos UI modificados y devolvió `[]`.

Las pruebas automatizadas del cliente inducen HTTP fallido, red interrumpida, JSON inválido, estructura incompatible, historia ausente, IDs repetidos/incompatibles y lista vacía; también prueban recuperación. Su simulación no acredita disponibilidad permanente de un servicio externo.

## Capturas auténticas

Las capturas fueron obtenidas del navegador con la aplicación ejecutándose. No son imágenes generadas ni montajes de diseño. Las nueve imágenes de esta sección documentan la versión original `084b764`; se conservan sin sobrescribir como evidencia histórica. Las nuevas imágenes se enlazan en la sección de correcciones posterior a la revisión.

| Captura | Origen y condición |
|---|---|
| [Inicio de escritorio](evidencias/s2/inicio-escritorio.jpg) | Página real, viewport 1280×900. |
| [Listado de escritorio](evidencias/s2/listado-escritorio.jpg) | API real, tres constelaciones, viewport 1280×900. |
| [Historia de escritorio](evidencias/s2/detalle-escritorio.jpg) | Orión desde la API real, viewport 1280×900. |
| [Listado móvil](evidencias/s2/listado-movil.jpg) | API real, viewport 360×800; archivo 344×2324, una columna. |
| [Historia móvil](evidencias/s2/detalle-movil.jpg) | API real, viewport 360×800; archivo 344×2006, una columna. |
| [Carga controlada](evidencias/s2/carga-controlada.jpg) | Fixture local en 5174; demora inducida de 12 segundos antes de leer la API real. |
| [Error controlado](evidencias/s2/error-controlado.jpg) | Fixture local en 5174; respuesta HTTP 503 inducida. |
| [Texto al doble en escritorio](evidencias/s2/texto-200.jpg) | Fixture local, datos reales, raíz tipográfica de 36 px y viewport 1280×900. |
| [Texto al doble en móvil](evidencias/s2/texto-200-movil.jpg) | Misma condición de texto, viewport 360×800. |

## Reproducir estados sin alterar el producto

Iniciar la aplicación real con los comandos localhost del [README](../README.md). En otra terminal interactiva:

```bash
node scripts/prueba-estados.mjs error
```

Abrir `http://127.0.0.1:5174/explorar`. El [servidor auxiliar](../scripts/prueba-estados.mjs) reutiliza los módulos de Vite y permite cambiar únicamente las condiciones de consulta. Escribir un modo y pulsar Enter:

- `error`: respuesta 503; con la página abierta, escribir `real` y pulsar el botón de reintento para comprobar recuperación.
- `lento`: demora de 12 segundos, útil para observar la carga y navegar fuera de la vista antes de que termine.
- `vacio`: arreglo vacío.
- `invalido`: objeto en lugar de lista.
- `real`: consulta la API original a través de Vite.
- `texto-grande` / `texto-normal`: para la próxima recarga, cambia la raíz tipográfica a 36/18 px; estas opciones no cambian la aplicación del puerto 5173.

Este servidor auxiliar se limita a 127.0.0.1, no cambia los documentos, no forma parte del frontend de producción y no presenta los estados de prueba como opciones al visitante.

## Referencia y diferencias de alcance

[Figma Make compartido por el usuario](https://www.figma.com/make/1JNE45ayMot6p5VclicI3F/AstroVisor-design-setup?code-node-id=0-6&fullscreen=1): se conserva la dirección de fondo crema, azul web, diagramas sobre azul oscuro, tipografía grande y navegación sencilla. La ficha tiene URL propia en lugar de modal. El listado usa las tres constelaciones existentes del proyecto. No se incorporan los controles de reproducción, el catálogo, la selección de marcos de Figma ni los módulos administrativos/VR de la referencia.

## Revisión técnica recibida y correcciones

Informe comunicado por el usuario en esta conversación sobre el commit **`084b764`**. Dictamen inicial: **aprobado con observaciones**, entonces pendiente de revisión manual complementaria. El 25 de octubre de 2026, Luis aclaró que el revisor fue **Índigo**, que realizó las pruebas automatizadas y manuales y le dio la aprobación en persona. La fecha exacta de ejecución no fue especificada; se registra la fecha de esa aclaración sin atribuirla a la ejecución de las pruebas.

Según el informe recibido, un agente ejecutó `npm test` (1/1), `npm run test:web` (10/10) y `npm run build` correctamente. También verificó las tres historias, apertura directa, historial, teclado, viewport de 360 px y recuperación ante fallos. El entorno reportado fue **Edge 156 en modo headless**, sin evaluación presencial. Estos son resultados reportados por el revisor, separados de las comprobaciones nuevas de esta sesión.

| Observación recibida | Corrección aplicada y comprobación nueva |
|---|---|
| Nombre accesible distinto del texto visible | Los enlaces muestran «Leer la historia de Orión/Osa Mayor/Escorpio». Se retiró el `aria-label` que sustituía el texto. El árbol accesible y el texto visible coinciden; Tab y Enter abren Orión. |
| Todas las pestañas tenían el mismo título | Se distinguen inicio, listado y las tres constelaciones. Se verificaron recarga, atrás/adelante, carga, fallo y recuperación; la ficha controla el título según su respuesta real. |
| Pie de página público de 15 px | Aumentado a 20 px; medición computada aproximada de 19.9998 px en escritorio y móvil. No cambian los estilos de administración ni visor. |
| Favicon con 404 | Se añadió `/favicon.svg` y su enlace explícito en el HTML. HTTP 200 con `image/svg+xml`; el build contiene el archivo. |
| Encabezado genérico para constelación inexistente | El encabezado principal y la pestaña indican «Constelación no encontrada» después de una consulta válida sin coincidencia. Carga y fallo conservan mensajes propios. |

Después de corregir, se ejecutaron nuevamente **1/1 pruebas documentales, 10/10 pruebas de consumo frontend y build**, todos correctos. Las comprobaciones de navegador se realizaron en Chromium integrado, en 1280×900 y 360×800. El listado móvil tiene una columna, sin desbordamiento horizontal; el enlace largo de Osa Mayor ocupa dos líneas sin recortes. Se comprobó el reintento con HTTP 503 inducido y el cambio de título al recuperarse la ficha.

Evidencia nueva:

- [Listado de escritorio](evidencias/s2/revision/listado-escritorio.jpg) y [listado móvil](evidencias/s2/revision/listado-movil.jpg).
- [Detalle de escritorio](evidencias/s2/revision/detalle-escritorio.jpg) y [constelación no encontrada](evidencias/s2/revision/constelacion-no-encontrada.jpg).
- [Mediciones y títulos observados en navegador](evidencias/s2/revision/comprobaciones.json) y [manifiesto de la corrección](evidencias/s2/revision/version.json).

El informe recibido y esta corrección no acreditan pruebas con lectores de pantalla, zoom nativo al 200 %, teléfonos físicos ni personas adultas mayores. La ampliación por CSS del primer registro permanece identificada como condición controlada. La aprobación manual de Índigo sobre el trabajo corregido quedó confirmada por Luis en la aclaración posterior.

## Validación manual y aclaración del revisor

El **24 de octubre de 2026**, zona America/Mexico_City, Luis informó en esta conversación: «ya hice la prueba manual y todo esta bien». Inicialmente se registró como validación del autor. El **25 de octubre de 2026** aclaró: «indigo fue quien hizo la prueba manul y atumotizada, el me dio la aprovación en persona». Se corrige por ello la atribución: las pruebas y la aprobación corresponden a Índigo, según el testimonio de Luis.

La versión de código corregida es **`659100628ce21d49f55824739645f00ccc2e5f2e`**. Los commits posteriores hasta esta aclaración solo actualizan documentación; no añaden cambios funcionales.

| Campo | Registro |
|---|---|
| Persona que realizó la revisión | Índigo, integrante del equipo, según la aclaración de Luis |
| Persona que comunica el resultado | Luis, autor de esta entrega S2 |
| Resultado informado | Prueba manual correcta, sin incidencias reportadas |
| Fuente | Confirmación directa de Luis de la aprobación presencial de Índigo |
| Navegador, dispositivo y pasos exactos | No especificados en la confirmación |
| Alcance de la evidencia | Revisión cruzada manual y técnica de Índigo reportada por Luis; no equivale a evaluación con personas adultas mayores |

Esta confirmación permite avanzar a la integración del [PR #1](https://github.com/Indigo-otiz/AstroVisor/pull/1). Se conservan por separado las comprobaciones automatizadas, las observaciones corregidas y la aprobación presencial. No se crea ni se simula una revisión de GitHub en nombre de Índigo.

## Revisión por otro integrante

**Aprobación presencial comunicada por Luis el 25 de octubre de 2026.** El revisor fue Índigo. La constancia identifica que el resultado fue recibido verbalmente y que no hay una aprobación formal de su cuenta dentro de GitHub.

| Campo | Registro |
|---|---|
| Integrante revisor | Índigo |
| Fecha | Constancia de la aprobación recibida el 25 de octubre de 2026, America/Mexico_City; día exacto de la prueba y de la conversación presencial no especificado |
| Commit, PR o versión revisada | Código corregido `6591006`, con seguimiento en el PR #1; el informe técnico inicial corresponde a `084b764` |
| Dispositivo y recorrido probado | El informe técnico describe Edge 156 headless, historias, navegación, teclado, viewport móvil y recuperación. El dispositivo y los pasos exactos de la comprobación manual no fueron especificados. |
| Observaciones y correcciones | Cinco observaciones técnicas atendidas en `6591006`, descritas arriba |
| Resultado y enlace a evidencia | Aprobado presencialmente por Índigo, según confirmación directa de Luis; constancia en este documento vinculado al [PR #1](https://github.com/Indigo-otiz/AstroVisor/pull/1) |

No se han realizado en esta sesión pruebas con personas adultas mayores, evaluación con lector de pantalla, validación en teléfono físico ni aprobación del material por la biblioteca. Las pruebas móviles técnicas usan viewport del navegador. La revisión cruzada queda respaldada por la confirmación de Luis de la aprobación presencial de Índigo; la integración en `main` se comprueba por separado en el estado del PR.
