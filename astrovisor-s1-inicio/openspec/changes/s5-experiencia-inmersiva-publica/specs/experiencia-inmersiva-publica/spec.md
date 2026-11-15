## ADDED Requirements

### Requirement: Entradas directas a las dos escenas

Inicio SHALL ofrecer un enlace para explorar el cielo a pantalla completa con ratón o tacto y otro para explorar el mismo cielo en vista dividida con Homido. La exploración 2D SHALL continuar disponible sin visor ni cuenta.

#### Scenario: Entrar en modo pantalla

- **WHEN** el visitante elige la entrada de pantalla en Inicio
- **THEN** se abre directamente una escena monoscópica que ocupa el área visible y responde a ratón o tacto, sin requerir sensores.

#### Scenario: Entrar en modo Homido

- **WHEN** el visitante elige Homido desde Inicio
- **THEN** llega directamente a la experiencia estereoscópica y puede realizar los gestos de activación de audio y permisos de movimiento que requiera el navegador antes de colocarse el visor.

#### Scenario: Recuperarse de un permiso o función no disponible

- **WHEN** el navegador bloquea audio, sensores o pantalla completa nativa
- **THEN** la experiencia ofrece la recuperación o alternativa disponible y un acceso visible a la web 2D.

### Requirement: Diagnóstico fuera del recorrido público

Las vistas públicas SHALL mostrar el cielo y las indicaciones necesarias para explorar, escuchar o salir. Los controles técnicos, el registro y los contadores SHALL permanecer disponibles mediante acceso explícito de diagnóstico.

#### Scenario: Abrir diagnóstico

- **WHEN** se abre la página con el parámetro de diagnóstico
- **THEN** están disponibles sus herramientas y registros sin agregar paneles al flujo público habitual.

### Requirement: Ficha inmersiva centrada en la narración

Cada ficha SHALL conservar visibles el cielo y la constelación, e identificar la selección por su título. SHALL mostrar el estado real del audio y ofrecer escuchar, pausar, reanudar y repetir, con acceso a libros y acciones claras para volver al recorrido o salir a 2D. En Homido, la interacción por mirada SHALL conservar la selección de 3 s.

#### Scenario: Escuchar, pausar, reanudar y repetir

- **WHEN** el visitante abre la ficha de Orión, Osa Mayor o Escorpio y usa sus controles
- **THEN** la narración empieza, conserva la posición al pausar y reanudar, y al repetir comienza desde el inicio sin solapar voces.

#### Scenario: Pausar la mirada

- **WHEN** el visitante pausa la mirada mientras escucha
- **THEN** los objetivos ordinarios dejan de acumular permanencia, la narración continúa y siguen disponibles reanudar la mirada y salir.

#### Scenario: Cerrar o abandonar

- **WHEN** el visitante vuelve al recorrido, cambia de constelación o sale a 2D
- **THEN** la narración anterior se detiene sin reactivación tardía y, al salir, se liberan la vista estéreo, los sensores y la pantalla completa que se hubieran activado.

### Requirement: Presentación breve de libros y lectura completa en web

Los libros inmersivos SHALL mostrar portada, título, autor y una marca breve para los registros de demostración. La web SHALL conservar la ficha completa, los relatos y las transcripciones íntegras sin requerir visor ni sonido.

#### Scenario: Consultar un libro desde la estantería

- **WHEN** el visitante selecciona un libro dentro de la escena
- **THEN** se muestran sus datos breves y se puede volver o abrir su ficha completa en 2D. No se presenta una atribución, signatura o disponibilidad bibliotecaria sin confirmación.

#### Scenario: Leer cuando el audio falla

- **WHEN** el visitante abre la ficha web desde un acceso público y el audio está bloqueado, no disponible o falla
- **THEN** puede seguir leyendo la historia y abrir la transcripción completa cuando el recurso tenga una transcripción registrada.

### Requirement: Evidencia verificable de S5

La entrega SHALL registrar la versión y fecha reales, capturas de ambos modos, resultados de pruebas, incidencias y la validación de escucha de los audios demo. Las conclusiones sobre compatibilidad física SHALL identificar el dispositivo, navegador, visor y acciones que se probaron.

#### Scenario: Registrar pruebas en pantalla, en móvil y en Homido

- **WHEN** se comprueban la entrada, selección, narración, libros y salida
- **THEN** quedan registrados el modo y método de entrada, el resultado y el tipo de evidencia. Los casos que requieran hardware no disponible quedan pendientes.
