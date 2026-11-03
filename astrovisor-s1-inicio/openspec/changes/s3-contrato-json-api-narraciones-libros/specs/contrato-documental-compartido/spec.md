# Contrato Documental Compartido 2D/3D

## Purpose

Permitir que la interfaz web 2D y el visor Homido 3D consulten las mismas historias, referencias bibliográficas y recursos de audio estructurados desde un contrato documental común, con tolerancia a fallos y sin requerir servicios externos de biblioteca.

## ADDED Requirements

### Requirement: Contrato JSON documental común

El sistema SHALL disponer de una estructura JSON homogénea para las constelaciones Orión, Osa Mayor y Escorpio, que incluya campos de texto descriptivos, libros de demostración reales y metadatos de audio local reproducible.

#### Scenario: Contenido completo de constelación
- **WHEN** se consulta el contenido de cualquiera de las tres constelaciones (`orion`, `osa-mayor`, `escorpio`)
- **THEN** la ficha incluye `id`, `titulo`, `resumen`, `historia`, `comoReconocerla` y `demostracion: true`.
- **AND** el arreglo `libros` contiene referencias con título, autor y etiqueta de demostración.
- **AND** el arreglo `multimedia` contiene la ruta a la narración local y su transcripción.

#### Scenario: Validación de esquema documental
- **WHEN** un validador verifica el archivo `content/recorridos.json` o su respaldo
- **THEN** se rechazan arreglos vacíos, identificadores duplicados o campos requeridos ausentes.

### Requirement: Consumo unificado en API Express y Visor A-Frame

El servidor Express SHALL servir el contrato documental mediante `GET /api/contenidos/recorridos` y la escena 3D en A-Frame SHALL alimentarse de estos mismos datos sin duplicar fichas ni escribir textos fijos en el código.

#### Scenario: Petición desde interfaz web
- **WHEN** la aplicación web 2D solicita `GET /api/contenidos/recorridos`
- **THEN** la API responde con código HTTP 200 y los recorridos completos sin requerir token ni sesión.

#### Scenario: Alimentación de la escena Homido
- **WHEN** se inicia la escena de visor Homido
- **THEN** las fichas 3D de las constelaciones se construyen dinámicamente a partir de los datos recibidos de la API.

### Requirement: Resiliencia y respaldo local sin red institucional

El visor Homido SHALL mantener operatividad completa ante indisponibilidad de la API o ejecución estática sin backend, utilizando un archivo de respaldo local idéntico en estructura.

#### Scenario: Caída o timeout de la API
- **WHEN** la llamada a la API documental falla por error HTTP o tiempo de espera excedido
- **THEN** el sistema conmuta automáticamente al archivo de respaldo `recorridos-demo.json`.
- **AND** el visitante visualiza las mismas historias, libros y audios de demostración.

#### Scenario: Falla de reproducción de audio local
- **WHEN** un archivo de audio local no puede reproducirse por bloqueo del navegador o ausencia del medio
- **THEN** la lectura visual del relato y la información bibliográfica continúan visibles y navegables.

### Requirement: Pospuesto del editor administrativo CRUD

El panel de administración SHALL mantener la autenticación del servidor previamente desarrollada, pero SHALL aplazar la persistencia y edición CRUD de contenidos hasta después de la Expo.

#### Scenario: Acceso administrativo
- **WHEN** un administrador inicia sesión en `/api/admin/login`
- **THEN** el servidor verifica las credenciales y emite el token de sesión sin alteraciones.
- **AND** no se habilitan operaciones destructivas de base de datos ni modificaciones al archivo JSON canónico durante la demo.
