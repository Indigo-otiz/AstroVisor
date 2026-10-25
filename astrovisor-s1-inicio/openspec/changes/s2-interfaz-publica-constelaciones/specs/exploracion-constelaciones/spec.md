# Exploración pública de constelaciones

## Purpose

Permitir que visitantes, prioritariamente personas adultas mayores, exploren constelaciones y lean historias breves desde móvil o escritorio sin visor ni cuenta, con contenido documental provisional y estados de consulta comprensibles.

## ADDED Requirements

### Requirement: Acceso público al listado de constelaciones

La aplicación SHALL permitir llegar desde el inicio a `/explorar` y consultar fichas de constelaciones con nombre, resumen y acción identificable para leer su historia, sin cuenta ni visor.

#### Scenario: Exploración desde el inicio
- **WHEN** el visitante activa la acción de explorar desde `/`
- **THEN** llega a `/explorar` y ve las fichas obtenidas de la API al terminar la consulta.
- **AND** las fichas corresponden a constelaciones y no a planetas ni al Sistema Solar.

### Requirement: Lectura de una constelación e historia

La aplicación SHALL ofrecer una dirección `/explorar/:id` para cada constelación disponible, con nombre, resumen, historia breve y orientación textual para reconocer su figura. La ficha SHALL permitir regresar al listado.

#### Scenario: Apertura de una ficha
- **WHEN** el visitante abre una constelación desde su ficha o introduce directamente su dirección
- **THEN** puede leer la información de esa constelación y su historia sin depender de haber visitado antes el listado.
- **AND** dispone de una acción para volver a explorar las constelaciones.

#### Scenario: Identificador inexistente
- **WHEN** la consulta termina correctamente pero el identificador no corresponde a ninguna constelación
- **THEN** se muestra un mensaje de constelación no encontrada y un enlace al listado.
- **AND** no se presenta el fallo como un error de conexión ni se sustituye silenciosamente por otra ficha.

### Requirement: Contenido documental y procedencia provisional

El sistema SHALL obtener las fichas e historias de `GET /api/contenidos/recorridos`, que lee documentos JSON. Las pantallas SHALL identificar el contenido como demostrativo y sustituible por material autorizado de la biblioteca, sin afirmar disponibilidad de libros, narración ni aprobación institucional.

#### Scenario: Consulta del contenido demostrativo
- **WHEN** la API entrega los registros de Orión, Osa Mayor y Escorpio
- **THEN** sus historias y resúmenes se muestran desde los datos recibidos, sin incorporarlos como contenido fijo en las vistas.
- **AND** la interfaz informa de su carácter provisional.

#### Scenario: Recursos todavía ausentes
- **WHEN** una constelación no tiene libros o multimedia autorizados
- **THEN** su historia se puede leer y no aparecen controles de reproducción ni disponibilidad bibliográfica ficticios.

### Requirement: Estados de carga y recuperación de errores

La aplicación SHALL anunciar la carga mientras consulta contenido. Ante fallo de red, respuesta HTTP no exitosa o estructura de datos inválida, SHALL mostrar un mensaje sencillo y una acción de reintento. El visitante SHALL poder regresar al inicio o al listado según la pantalla.

#### Scenario: Consulta pendiente
- **WHEN** la consulta todavía no se ha resuelto
- **THEN** se anuncia que las constelaciones están cargando, sin mostrar prematuramente una lista vacía.

#### Scenario: Reintento tras un fallo
- **WHEN** una consulta falla y el visitante activa el reintento
- **THEN** se realiza una nueva solicitud, se indica nuevamente la carga y se presenta el resultado de esa solicitud.
- **AND** si la API vuelve a estar disponible, se muestran los datos sin recargar manualmente toda la página.

#### Scenario: Documento incompatible
- **WHEN** la respuesta no es una lista o contiene registros que no permiten mostrar una ficha válida
- **THEN** se muestra un error controlado en lugar de una pantalla rota o información incompleta presentada como correcta.

### Requirement: Estado de contenido vacío

La aplicación SHALL distinguir una consulta exitosa sin constelaciones de una consulta fallida, y SHALL ofrecer una salida de navegación en el estado vacío.

#### Scenario: Lista sin registros
- **WHEN** la API devuelve una lista vacía
- **THEN** el listado informa que todavía no hay constelaciones disponibles y permite volver al inicio.
- **AND** no muestra una alerta de conexión.

### Requirement: Lectura y navegación accesibles en pantalla

Las pantallas públicas SHALL conservar legibilidad y controles operables con ratón, tacto y teclado. SHALL ofrecer foco visible, etiquetas comprensibles y distribución sin desplazamiento horizontal del documento a 360 px y 1280 px de ancho, así como al ampliar el texto al 200 %.

#### Scenario: Navegación con teclado
- **WHEN** el visitante utiliza Tab, Enter y el historial del navegador
- **THEN** puede recorrer los enlaces, abrir una historia y regresar sin interacción exclusiva por ratón.
- **AND** identifica el foco y la página actual; al cambiar de ruta el foco se orienta hacia el contenido principal.

#### Scenario: Móvil y ampliación de texto
- **WHEN** el visitante abre el flujo en móvil o amplía el texto al 200 %
- **THEN** puede leer los textos completos y activar los controles sin superposiciones ni recortes de contenido.
- **AND** las ilustraciones de estrellas no sustituyen los nombres, las instrucciones ni las historias textuales.

### Requirement: Identificación de la página en la pestaña

La aplicación SHALL identificar la página pública o constelación actual en el título del documento. Durante la consulta de una ficha SHALL distinguir carga, fallo y constelación inexistente, sin conservar el nombre de otra ficha.

#### Scenario: Título de una historia
- **WHEN** termina correctamente la consulta de una constelación disponible
- **THEN** la pestaña identifica su nombre y AstroVisor.
- **AND** al regresar al listado identifica la exploración de constelaciones.

#### Scenario: Ficha no encontrada
- **WHEN** termina correctamente la consulta pero no existe el identificador
- **THEN** el encabezado principal y la pestaña identifican que la constelación no fue encontrada.

### Requirement: Coexistencia con los módulos existentes

La aplicación SHALL mantener accesibles los enlaces existentes al modo Homido y al acceso administrativo, sin condicionar la exploración de constelaciones a ninguno de ellos.

#### Scenario: Recorrido público independiente
- **WHEN** el visitante completa inicio, listado, lectura y regreso
- **THEN** no necesita abrir `/visor`, utilizar sensores ni autenticarse.
- **AND** los accesos existentes a esos módulos siguen disponibles.
