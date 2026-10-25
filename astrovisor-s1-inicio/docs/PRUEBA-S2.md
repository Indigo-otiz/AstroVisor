# Evidencia de la interfaz pública S2

Responsable académico: Luis. Sprint: 19–23 de octubre de 2026. Verificación técnica realizada el **24 de octubre de 2026**, zona America/Mexico_City. El periodo académico y la fecha real de prueba se registran por separado.

La interfaz pública permite explorar Orión, Osa Mayor y Escorpio, abrir sus historias y regresar al listado sin visor ni cuenta. Los textos y diagramas son demostrativos; el material autorizado de la biblioteca sigue pendiente. La revisión de otro integrante todavía no se ha realizado.

## Versión y entorno

- Rama local: `codex/s2-interfaz-publica-constelaciones`.
- Commit base: `3f888bb686f9c606ca0b080447d85be20c795c00`. Las capturas corresponden a la implementación S2 de esta rama posterior a ese commit, no al Sprint 1 original. El commit de entrega puede identificarse en el historial de la rama.
- [Rama para revisión en GitHub](https://github.com/Indigo-otiz/AstroVisor/tree/codex/s2-interfaz-publica-constelaciones).
- [Manifiesto SHA-256 de código y capturas](evidencias/s2/version.json): identifica los archivos de esta revisión. Para el código, calcular SHA-256 del texto UTF-8 sin BOM y con finales de línea LF; para las capturas, calcularlo sobre los bytes originales. Esta normalización permite verificar el contenido aunque Git convierta CRLF/LF al clonar.
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

Las capturas fueron obtenidas del navegador con la aplicación ejecutándose. No son imágenes generadas ni montajes de diseño.

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

## Revisión por otro integrante

**Pendiente. Esta sección debe completarla o respaldarla un integrante real del equipo.** Una revisión técnica asistida no sustituye este criterio académico.

| Campo | Registro |
|---|---|
| Integrante revisor | Pendiente |
| Fecha | Pendiente |
| Commit, PR o versión revisada | Pendiente; registrar el commit exacto de la rama que pruebe el integrante. |
| Dispositivo y recorrido probado | Pendiente |
| Observaciones y correcciones | Pendiente |
| Resultado y enlace a evidencia | Pendiente |

No se han realizado en esta sesión pruebas con personas adultas mayores, evaluación con lector de pantalla, validación en teléfono físico ni aprobación del material por la biblioteca. Las pruebas móviles usan viewport del navegador. La publicación de la rama no acredita revisión humana ni integración en `main`. La implementación técnica y la revisión cruzada se mantienen como estados distintos.
