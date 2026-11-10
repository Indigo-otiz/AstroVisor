# Presentación web en computadora y proyección

## Purpose

Permitir que visitantes y facilitadores utilicen el recorrido público de AstroVisor con computadora o pantalla proyectada, con controles accesibles, contingencias y evidencia que distinga ejecución técnica de validación física.

## ADDED Requirements

### Requirement: Recorrido público independiente del visor

El sistema SHALL permitir completar inicio, listado, lectura, narración y regreso con teclado o ratón sin cuenta, sensores ni Homido, conservando las historias y controles existentes.

#### Scenario: Visita desde una computadora
- **WHEN** una persona abre la aplicación y el servicio de contenido está disponible
- **THEN** puede explorar Orión, Osa Mayor y Escorpio, leer sus historias, escuchar, pausar y reanudar, y regresar al listado sin abrir el visor ni administración.

#### Scenario: Falla de recursos inmersivos
- **WHEN** los sensores no están disponibles o falla la carga del motor 3D
- **THEN** el recorrido 2D sigue disponible mediante sus rutas y desde la salida del visor, siempre que la aplicación y su API sean accesibles.
- **AND** no se presenta ese recorrido como validación de óptica, sensores o selección por mirada en Homido real.

### Requirement: Vista para proyección optativa y reversible

El recorrido público SHALL ofrecer un control con estado perceptible para activar y desactivar una vista con texto mayor y distribución para presentación. La elección SHALL conservarse durante la navegación pública de la sesión abierta, sin afectar al panel administrativo ni a la escena inmersiva.

#### Scenario: Activar y continuar leyendo
- **WHEN** el visitante activa la vista para proyección y abre una historia
- **THEN** la historia conserva la adaptación y dispone de una acción de salida accesible.
- **AND** el control anuncia su estado y el contenido, los créditos y las transcripciones permanecen disponibles.

#### Scenario: Desactivar y acceder a otros módulos
- **WHEN** se desactiva la vista o se navega a administración o al visor
- **THEN** la vista pública vuelve a su distribución habitual o el otro módulo conserva su diseño propio, respectivamente.
- **AND** activar la vista no concede permisos administrativos.

### Requirement: Lectura adaptable y legible

Las vistas públicas SHALL permitir lectura sin recortes, superposiciones ni desplazamiento horizontal del documento entre 360 y 2560 px de ancho y con ampliación nativa al 200 %. La vista para proyección SHALL aumentar el cuerpo del texto a un mínimo de 24 px al tamaño predeterminado, conservar ancho de lectura limitado y controles de al menos 48 px.

#### Scenario: Resolución de referencia para proyección
- **WHEN** se verifica el recorrido a 1024×768 y 1920×1080 con vista para proyección
- **THEN** textos y controles permanecen completos, la página permite desplazamiento vertical y no obliga a reducir el tamaño del texto para operar.
- **AND** se identifican resolución y método de comprobación sin deducir distancia de lectura o calidad del proyector.

#### Scenario: Pantalla angosta o ampliación
- **WHEN** se revisan las vistas habituales y de proyección a 360 px o con zoom nativo al 200 %
- **THEN** la navegación y los controles se redistribuyen y el visitante puede leer la historia completa y operar audio y transcripciones.
- **AND** una simulación por CSS se registra por separado y no sustituye la prueba de zoom nativo.

### Requirement: Operación accesible con teclado y ratón

Las acciones públicas SHALL ser utilizables con ratón y teclado, con foco visible, orden lógico y sin trampas ni dependencia de hover o permanencia de mirada. Cambiar de ruta SHALL orientar el foco al contenido; el salto al contenido SHALL permitir omitir la navegación.

#### Scenario: Recorrido solo con teclado
- **WHEN** una persona utiliza Tab, Shift+Tab, Enter y Espacio donde corresponda
- **THEN** puede activar la vista de proyección, abrir una ficha, controlar el audio, consultar créditos y regresar sin perder acceso a los controles.
- **AND** el foco sigue visible al cambiar el estado de reproducción y tras navegar o reintentar la carga.

#### Scenario: Recorrido con ratón
- **WHEN** se activan los mismos enlaces y botones mediante clic
- **THEN** se obtiene el mismo resultado funcional, sin esperar un temporizador de mirada.

### Requirement: Recuperación de errores sin promesas de funcionamiento offline

El recorrido SHALL conservar sus estados de carga, vacío y error y ofrecer reintento y salida ante fallos de contenido. Un fallo de audio SHALL conservar la lectura disponible. La guía SHALL distinguir la ruta 2D con servicio disponible del video local como respaldo sin red.

#### Scenario: API temporalmente inaccesible
- **WHEN** falla la solicitud de historias y luego se restablece el servicio
- **THEN** se muestra un error comprensible y el reintento recupera las historias sin exigir entrar al visor o autenticarse.
- **AND** no se afirma que desconectar Internet garantice abrir la web desde cero.

#### Scenario: Audio no disponible
- **WHEN** una narración no se puede reproducir
- **THEN** el texto sigue legible, el control comunica el fallo y el facilitador puede continuar leyendo.

### Requirement: Respaldo audiovisual local trazable

La preparación de presentación SHALL incluir un archivo de video local reproducible sin red y su registro de versión, duración, procedencia y limitaciones. SHALL mostrar el recorrido completo 2D y la demostración 3D con controles y retorno, con narraciones audibles y descripción textual del recorrido.

#### Scenario: Revisión del respaldo
- **WHEN** el equipo abre el archivo con la red desconectada
- **THEN** puede ver el recorrido, oír las narraciones y reconocer el regreso a 2D; el registro identifica archivo, fecha, hash y entorno de reproducción.
- **AND** una captura de escritorio de la escena 3D no se etiqueta como prueba física Homido.

#### Scenario: Respaldo incompleto
- **WHEN** no se puede producir, abrir o comprobar una parte del video o su audio
- **THEN** se registra qué falta y la aceptación de respaldo permanece pendiente; una guía o colección de imágenes no se presenta como el video completo.

### Requirement: Guía de ensayo y apoyo de exposición

La entrega SHALL incluir instrucciones para comprobar enlace HTTPS, computadora, pantalla/proyector y sonido, un guion de cinco minutos y las decisiones para pasar del visor a 2D y de la web al video local. SHALL registrar por separado limitaciones de red, proyección y Homido.

#### Scenario: Selección de contingencia
- **WHEN** falla el visor y la web permanece accesible, o falla la red requerida por la demostración
- **THEN** la guía indica continuar en 2D en el primer caso y abrir el archivo local comprobado en el segundo.
- **AND** proyectar la escena o ver su video no se contabiliza como validación con visor real.

### Requirement: Evidencia efectiva y revisión cruzada de S4

El cierre S4 SHALL registrar versión, fechas reales, método, entorno, resultados y revisión de otro integrante. Pruebas en computadora, proyección/red del recinto, Homido y video SHALL distinguirse como observadas, reportadas, simuladas o pendientes. Los hitos 2–6 de noviembre SHALL conservarse como planificación mientras no exista evidencia de ejecución.

#### Scenario: Solo verificación de escritorio
- **WHEN** pasan las suites y el recorrido en navegador pero falta proyector, red del recinto, Homido S4 o revisor
- **THEN** se informa avance técnico y cada pendiente; no se certifica la Expo ni la aceptación completa del sprint.

#### Scenario: Revisión por otro integrante
- **WHEN** otro integrante revisa la versión S4 y sus evidencias
- **THEN** se registra su nombre, alcance, resultado y fuente de confirmación; no se reutiliza la revisión de S3 como aprobación de S4.

### Requirement: Contenidos identificados y administración protegida

Las vistas y respaldos SHALL mantener la identificación de contenido de demostración, voz sintética y materiales sujetos a permiso. El visitante SHALL completar la presentación sin credenciales y las rutas del servidor administrativas SHALL continuar exigiendo sesión autorizada.

#### Scenario: Proyección o grabación pública
- **WHEN** se demuestra o graba una historia
- **THEN** se conservan rótulos y créditos consultables y no se muestran credenciales ni contenido administrativo privado.

#### Scenario: Acceso sin sesión
- **WHEN** un visitante intenta consultar una ruta protegida de la API administrativa sin token válido
- **THEN** el servidor deniega el acceso aunque esté activada la vista para proyección.
