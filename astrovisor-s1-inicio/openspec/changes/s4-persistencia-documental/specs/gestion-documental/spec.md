# Gestión documental administrativa

## Purpose

Permitir la edición autorizada de contenidos educativos y bibliográficos persistentes, manteniendo relaciones, recursos, metadatos y compatibilidad entre la web y el visor Homido.

Estado vigente: usuario autorizó Etapa 1, infraestructura/lectura. Identidad local con hashes/sesiones Express seleccionada para después, sin implementarla ahora. Solo semilla, inicialización, validación y proyecciones son parte de esta entrega. Los requisitos de escritura y portadas dinámicas permanecen pendientes; alojamiento independiente pospuesto, manteniendo respaldo estático existente.

## ADDED Requirements

### Requirement: Autorización efectiva antes de escribir
El sistema SHALL verificar identidad y permiso administrativo en servidor para toda operación de escritura. SHALL denegar acceso sin sesión, con sesión expirada o a una identidad sin permiso. La presencia de datos locales del navegador no SHALL conceder autorización.

#### Scenario: Solicitud sin autorización
- **WHEN** un cliente sin token, con token inválido/expirado o con identidad sin permiso intenta crear o editar contenido
- **THEN** recibe 401 o 403 según corresponda y ningún documento ni respaldo se modifica.

#### Scenario: Estado local manipulado
- **WHEN** un cliente altera su almacenamiento local para aparentar ser administrador
- **THEN** el servidor sigue denegando escrituras sin identidad y permiso válidos.

#### Scenario: Revisión de identidad pendiente
- **WHEN** solo está autorizada Etapa 1 aunque el usuario ya eligió identidad local
- **THEN** no se modifica autenticación ni se implementan endpoints administrativos de escritura.

### Requirement: Lectura canónica compatible durante la transición
El sistema SHALL servir recorridos desde el catálogo privado validado, conservando la selección y forma del contrato anterior. SHALL ofrecer lectura de los tres libros y sus nueve recomendaciones sin duplicarlos en el documento canónico. La transición no SHALL alterar SVG, rutas, estilos ni el respaldo Homido existente.

#### Scenario: Proyección pública inicial
- **WHEN** se inicializa desde la semilla y se solicita el contrato de recorridos
- **THEN** el resultado coincide campo por campo con el contrato y respaldo de PR #6, incluidos recursos, transcripciones y metadatos.

#### Scenario: Lectura bibliográfica preparada
- **WHEN** se consulta el catálogo completo o se filtra por constelación existente
- **THEN** se conservan IDs, campos bibliográficos y nueve motivos; el filtro devuelve los tres libros asociados y su motivo sin requerir sesión.

#### Scenario: Migración frontend todavía pendiente
- **WHEN** se entrega Etapa 1 con la estantería todavía consumiendo su fixture estático
- **THEN** se registra la transición pendiente y no se presenta como edición pública dinámica ni como sincronización del respaldo terminada.

### Requirement: Validación de integridad antes de leer
El sistema SHALL rechazar versiones, IDs, relaciones, rutas de portadas o recursos inválidos antes de publicar datos. SHALL conservar información desconocida al migrar y rechazar conflictos entre fuentes, sin elegir ni corregir valores silenciosamente.

#### Scenario: Relación o activo inválido
- **WHEN** un catálogo tiene referencia inexistente/duplicada, libro sin vínculo, portada fuera de la ruta permitida o recurso ausente
- **THEN** la lectura falla de forma controlada sin modificar el documento ni reemplazarlo por la semilla.

#### Scenario: Datos de origen discrepantes
- **WHEN** la migración encuentra títulos ambiguos o diferencias de autor, año o URL entre las fuentes
- **THEN** rechaza la migración y conserva las entradas, en lugar de perder metadatos.

### Requirement: Configuración administrativa privada
El sistema SHALL separar configuración de identidad, datos de contenido y exportaciones públicas. La alternativa aprobada SHALL mantener secretos fuera de Git y de raíces públicas, verificar permisos en servidor y permitir revocación. Ninguna alternativa SHALL usar contraseñas en filtros URL ni autorizar por estado local del cliente.

#### Scenario: Implementación administrativa autorizada posteriormente
- **WHEN** el usuario autoriza la etapa administrativa con la identidad local ya seleccionada
- **THEN** se usan hashes con sal y parámetros revisados y sesiones Express, sin base de datos ni dependencia obligatoria de Supabase; no se guardan contraseñas en claro ni se incluye configuración en exports o backups de contenido.

### Requirement: Semilla versionada separada del almacén persistente
El sistema SHALL distinguir catálogo inicial versionado de datos administrados de ejecución. Runtime, backups, bloqueos y temporales SHALL permanecer fuera de Git y de toda raíz pública. El arranque normal SHALL leer el runtime existente sin reemplazarlo por semilla ni reinicializarlo ante ausencia o corrupción.

#### Scenario: Reinicio o actualización de código
- **WHEN** existe un catálogo administrado y se reinicia el proceso o cambia la semilla versionada
- **THEN** sus datos y revisión permanecen intactos, sin copia automática de la semilla.

#### Scenario: Inicialización exclusiva
- **WHEN** se ejecuta el comando explícito de inicialización sobre un destino ausente
- **THEN** se valida y crea el runtime de forma exclusiva; si el destino ya existe, se rechaza sin sobrescribirlo, incluso si está corrupto.

#### Scenario: Almacén ausente en arranque normal
- **WHEN** falta el runtime o no puede validarse
- **THEN** se informa el error operativo y no se crea ni publica automáticamente un catálogo demo.

### Requirement: Edición limitada y preservación de metadatos
El sistema SHALL aceptar únicamente campos de edición permitidos y validar sus tipos, límites y referencias en servidor. SHALL conservar campos almacenados fuera del alcance de la edición, incluidos transcripciones, autoría, permisos y metadatos bibliográficos adicionales.

#### Scenario: Edición parcial válida
- **WHEN** un administrador cambia el resumen de una constelación con revisión vigente
- **THEN** se guarda el nuevo resumen y permanecen intactos los demás campos, recursos y metadatos desconocidos.

#### Scenario: Entrada inválida
- **WHEN** se envía un tipo incorrecto, campo prohibido, ID manipulado, URL no permitida o cuerpo excesivo
- **THEN** la operación se rechaza con error comprensible y el documento anterior permanece íntegro.

### Requirement: Relaciones estables entre constelaciones libros y recursos
El sistema SHALL identificar libros y constelaciones con IDs estables y conservar sus relaciones y motivos de lectura. SHALL rechazar referencias inexistentes e IDs duplicados. Cambiar un título no SHALL romper sus rutas ni enlaces desde Homido.

#### Scenario: Nuevo libro vinculado
- **WHEN** un administrador crea un libro válido y lo vincula con una constelación existente
- **THEN** el libro y su motivo aparecen en la lectura pública de esa constelación después de guardar y recargar.

#### Scenario: Cambio de título
- **WHEN** se cambia el título conservando el ID del libro
- **THEN** su ruta individual existente y el enlace de salida Homido siguen resolviendo el mismo libro.

#### Scenario: Referencia inválida
- **WHEN** se intenta guardar una relación con un libro, recurso o constelación inexistente
- **THEN** se rechaza el cambio completo y no queda una relación parcial.

### Requirement: Consistencia pública con la edición administrativa
La web pública, el panel y el visor online SHALL obtener sus datos de la misma revisión documental. Después de un guardado confirmado y una nueva lectura, no SHALL mostrar valores anteriores por depender de un catálogo compilado independiente.

#### Scenario: Guardado y consulta pública
- **WHEN** se guarda un autor o motivo y se recarga la estantería, la ficha individual y la lectura del visor
- **THEN** los tres consumidores muestran el valor de la revisión confirmada sin recompilar el frontend.

#### Scenario: Ruta o método desconocido
- **WHEN** un administrador solicita una operación administrativa no implementada
- **THEN** recibe 404 o 405 y no un mensaje genérico que parezca confirmar un guardado.

### Requirement: Portadas ilustrativas y originales diferenciadas
El sistema SHALL conservar los tres SVG y el diseño de estantería de PR #6. En el MVP SHALL ofrecer portadas ilustrativas del mismo estilo para libros nuevos, identificadas en texto y alternativas accesibles. SHALL reservar originales autorizadas para una mejora posterior y no habilitarlas sin procedencia y permiso.

#### Scenario: Conservación de las portadas existentes
- **WHEN** se migra el catálogo y se consulta cualquiera de los tres libros existentes
- **THEN** se mantienen los SVG y su presentación, con identificación de portada ilustrativa.

#### Scenario: Libro sin fotografía
- **WHEN** un administrador crea un libro sin una portada original autorizada
- **THEN** puede seleccionar una plantilla ilustrativa del estilo existente y consultar su cubierta tras guardar/recargar, sin recompilar ni reiniciar la aplicación.

#### Scenario: Servicio dinámico y exportación
- **WHEN** se solicita una portada ilustrativa nueva online o desde el paquete estático publicado
- **THEN** se obtiene el SVG correspondiente a los datos y plantilla de esa revisión, sin depender de un archivo añadido al código frontend.

#### Scenario: Entrada de portada maliciosa o revisión obsoleta
- **WHEN** el cliente envía markup, ruta o plantilla no permitidos, o pide una revisión no servible
- **THEN** el servidor rechaza la entrada o informa conflicto de revisión sin ejecutar contenido ni servir una imagen distinta como si fuera la solicitada.

#### Scenario: Original sin permiso
- **WHEN** se intenta seleccionar como original un activo sin procedencia o permiso registrado
- **THEN** el sistema rechaza esa selección y conserva la portada previa o la opción ilustrativa.

#### Scenario: Título no representable en plantilla
- **WHEN** el texto no cabe de forma legible en una plantilla permitida
- **THEN** el editor indica el problema y no publica una portada con información recortada silenciosamente.

### Requirement: Guardado íntegro y persistencia después del reinicio
El sistema SHALL confirmar éxito solo después de persistir un documento completo y válido. Una interrupción o error de escritura no SHALL publicar contenido parcial. Reiniciar el proceso no SHALL restaurar automáticamente datos demo ni perder cambios confirmados.

#### Scenario: Reinicio después de guardar
- **WHEN** se guarda un cambio válido, se detiene el proceso y se inicia otro con el mismo almacenamiento
- **THEN** la API y la web leen el cambio confirmado con relaciones y metadatos preservados.

#### Scenario: Escritura o respaldo fallido
- **WHEN** faltan permisos, espacio o falla el reemplazo del documento o su respaldo previo
- **THEN** no se confirma el cambio, se informa el error y el documento anterior sigue válido y recuperable.

#### Scenario: Interrupción del proceso
- **WHEN** el proceso termina antes o después del reemplazo durante un guardado
- **THEN** el arranque recupera una revisión completa anterior o nueva, nunca JSON parcialmente escrito ni una colección demo vacía.

### Requirement: Protección frente a sobrescritura concurrente
El sistema SHALL exigir la revisión leída por el editor y comprobarla durante el guardado exclusivo. SHALL rechazar solicitudes sin precondición y revisiones obsoletas. Un segundo escritor no SHALL operar sobre el mismo almacén simultáneamente.

#### Scenario: Dos editores sobre la misma revisión
- **WHEN** dos administradores guardan cambios basados en la misma revisión
- **THEN** solo uno confirma; el otro recibe conflicto de revisión y conserva su edición para comparar y reintentar.

#### Scenario: Falta de precondición
- **WHEN** se intenta guardar sin indicar la revisión base
- **THEN** se responde 428 y no se modifica el documento.

#### Scenario: Segunda instancia
- **WHEN** otro proceso intenta abrir para escritura el mismo almacén ocupado
- **THEN** su acceso escritor se rechaza sin retirar el bloqueo del proceso activo.

### Requirement: Respaldos privados y recuperación comprobable
El sistema SHALL conservar revisiones válidas previas en almacenamiento administrativo protegido. SHALL permitir una recuperación operativa documentada y verificada. Los respaldos, temporales, bloqueos y credenciales no SHALL estar disponibles desde rutas públicas ni incluirse en la distribución web.

#### Scenario: Documento corrupto
- **WHEN** el documento activo no puede leerse o validarse
- **THEN** se devuelve error controlado, se conserva la evidencia y se permite restaurar una copia validada mediante el procedimiento administrativo.

#### Scenario: Restauración
- **WHEN** se restaura una revisión previa válida con el servicio detenido y se reinicia
- **THEN** se leen los datos restaurados con una revisión que invalida ediciones anteriores y se comprueba su consistencia pública.

#### Scenario: Intento de descargar archivos privados
- **WHEN** un visitante solicita rutas de respaldo, temporales, configuración o bloqueo, o inspecciona los artefactos públicos
- **THEN** no obtiene esos archivos ni su contenido.

### Requirement: Compatibilidad y límites explícitos del respaldo Homido
El visor SHALL conservar la lectura por API y la conmutación a una copia pública válida cuando falle. La copia SHALL identificar origen y revisión, conservar contratos y metadatos públicos y no presentarse como contenido actualizado si pertenece a una exportación anterior.

#### Scenario: Falla aislada del endpoint
- **WHEN** el endpoint de recorridos falla, expira o devuelve datos inválidos y el servidor estático independiente responde
- **THEN** el visor utiliza la última exportación completa publicada e informa origen, fecha y revisión.

#### Scenario: Caída de toda la API
- **WHEN** se detiene todo el proceso API y la web con su servidor estático independiente sigue disponible
- **THEN** el visor lee la copia publicada y sus portadas/audios sin llamar endpoints API para obtener esos recursos, e identifica su revisión.

#### Scenario: Exportación de una revisión
- **WHEN** se genera la copia pública de una revisión confirmada
- **THEN** sus campos públicos coinciden con la proyección API de esa revisión, sus activos existen y no contiene archivos ni metadatos administrativos.

#### Scenario: Fallo de publicación después de persistir
- **WHEN** se confirma una edición pero falla la publicación del snapshot público
- **THEN** se informa guardado confirmado con respaldo público pendiente, se mantiene la copia publicada anterior identificada y puede reintentarse la exportación sin repetir la edición.

#### Scenario: Sitio totalmente estático
- **WHEN** se ejecuta una exportación sin servidor y después cambia el catálogo del servidor
- **THEN** el paquete autocontenido mantiene su revisión identificada y no afirma haber recibido esos cambios sin nueva exportación/publicación.

#### Scenario: Ausencia de todos los orígenes
- **WHEN** no están disponibles API, servidor estático ni un paquete previamente accesible
- **THEN** se informa el fallo y no se promete operación offline ni datos actualizados.

### Requirement: Referencias bibliográficas verificadas y corrección explícita
El sistema SHALL conservar trazabilidad de las dos URLs divergentes y corregirlas solo con una fuente bibliográfica seleccionada y confirmada. La igualdad entre API y respaldo no SHALL sustituir la correspondencia verificada de título, autor y referencia. No SHALL inventar enlaces ni alterar ediciones o licencias por deducción.

#### Scenario: Referencias candidatas pendientes
- **WHEN** falta confirmar las referencias existentes verificadas de Olcott en Internet Archive y Proctor en Gutenberg 23300
- **THEN** se mantiene la propuesta de corrección documentada y no se sustituyen URLs funcionales en esta revisión.

#### Scenario: Corrección autorizada posteriormente
- **WHEN** el usuario autoriza las referencias verificadas
- **THEN** se actualizan de forma coordinada bibliografía, documentos canónicos/demo y exportaciones, y las pruebas comprueban correspondencia bibliográfica e igualdad de campos públicos.

### Requirement: Coherencia entre relato audio y autoría
El sistema SHALL preservar transcripciones y metadatos de autoría y permisos. SHALL rechazar un cambio de historia con audio asociado si no puede publicar una revisión coherente aprobada de texto y narración. Un error de audio no SHALL impedir leer la historia vigente.

#### Scenario: Historia editada sin nueva narración
- **WHEN** se intenta cambiar una historia que tiene audio sin revisión de narración aprobada
- **THEN** se rechaza con 409 y se conservan historia, transcripción y audio previos.

#### Scenario: Edición ajena al guion
- **WHEN** se actualiza un libro o resumen sin alterar la historia narrada
- **THEN** permanecen intactos el audio, la transcripción, los permisos y la autoría.

### Requirement: Separación de demostración y datos institucionales
El sistema SHALL conservar la identificación de demostración y los metadatos no confirmados como tales. No SHALL inventar disponibilidad, propiedad, signaturas, ubicaciones, identificadores MARC ni aprobación institucional al migrar o crear documentos.

#### Scenario: Migración del catálogo de muestra
- **WHEN** se migran los tres libros y las nueve recomendaciones de #6
- **THEN** se preservan IDs y avisos demo, los campos MARC simulados continúan señalados y no se completan ubicaciones desconocidas.

#### Scenario: Nuevo libro demostrativo
- **WHEN** no se proporciona información institucional autorizada
- **THEN** el libro se identifica como demostrativo sin atribuirlo al acervo ni ofrecer disponibilidad o préstamo.

### Requirement: Edición accesible y conservación de navegación
El panel SHALL comunicar carga, éxito, errores de validación y conflictos con texto accesible. La estantería y las fichas SHALL mantener navegación por teclado, foco visible, regreso y lectura a 360 px y texto al 200 %, sin exigir visor físico.

#### Scenario: Conflicto en el panel
- **WHEN** se rechaza un guardado por revisión obsoleta
- **THEN** el editor conserva el texto introducido e informa cómo recargar y comparar, sin reemplazarlo silenciosamente.

#### Scenario: Lectura sin dispositivo físico
- **WHEN** se navega con teclado y viewport de 360 px, incluyendo texto al 200 %
- **THEN** los libros, controles y mensajes siguen operables y legibles sin superposición.
