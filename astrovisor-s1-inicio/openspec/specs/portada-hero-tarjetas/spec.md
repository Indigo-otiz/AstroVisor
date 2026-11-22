# portada-hero-tarjetas Specification

## Purpose
Proporcionar un punto de partida visualmente despejado, moderno y atractivo para que cualquier visitante identifique inmediatamente las experiencias principales (Web 2D o Visor 3D/VR) sin obstaculizar la vista de las estrellas, con orientación inicial frontal hacia los emblemas institucionales en 3D.

## Requirements

### Requirement: Lienzo estelar despejado sin título duplicado

La vista principal `InicioView` SHALL omitir el contenedor `.hero-topbar` dentro del área del lienzo estelar interactivo, conservando únicamente la cabecera institucional global.

#### Scenario: Visualización del lienzo

- **WHEN** el usuario ingresa a la ruta raíz `/`
- **THEN** la zona superior del lienzo no muestra recuadros opacos de marca
- **AND** las estrellas y la constelación de Orión se visualizan sin obstrucción en el cuadrante superior.

### Requirement: Tarjetas de entrada translúcidas con indicación clara

La sección inferior del hero SHALL presentar dos tarjetas translúcidas de cristal esmerilado (`hero-card`) que distingan claramente la experiencia web en pantalla de la experiencia inmersiva 3D/VR.

#### Scenario: Interacción con la tarjeta web

- **WHEN** el usuario interactúa con la tarjeta de pantalla
- **THEN** se presenta un enlace accesible hacia `/explorar`
- **AND** el fondo translúcido permite distinguir las estrellas del lienzo subyacente.

#### Scenario: Interacción con la tarjeta VR

- **WHEN** el usuario pulsa la tarjeta de inmersión 3D
- **THEN** se abre el modal de opciones de exploración `mostrarModalVR`
- **AND** ofrece las modalidades de visor físico, 3D ligera y 3D completa.

### Requirement: Modal de selección VR con tarjetas concisas y jerarquía visual

El modal de selección VR SHALL presentar tres tarjetas de diseño cristal cósmico con microetiquetas por dispositivo, iconos temáticos vectoriales y viñetas breves que expliquen las diferencias entre Visor Celular (Homido), 3D Versión Lite y 3D Versión Completa.

#### Scenario: Presentación del modal de selección

- **WHEN** se abre el modal de selección de experiencia VR
- **THEN** cada tarjeta contiene un distintivo de dispositivo (`GAFAS O VISOR`, `SIN ACCESORIOS`, `INMERSIÓN TOTAL ★`), título en Orbitron, texto explicativo conciso de una línea y dos viñetas clave de características.

### Requirement: Orientación inicial frontal hacia relieves 3D institucionales

Al ingresar a cualquiera de las tres experiencias 3D/VR (Homido, Libre 3D y Versión Completa), la cámara SHALL aparecer orientada frontalmente hacia los relieves institucionales 3D de IT Tepic y Biblioteca Solón Argüello, ubicando los controles de descanso al frente y debajo de los mismos.

#### Scenario: Carga de la experiencia 3D

- **WHEN** el visitante entra a `prueba-homido/index.html` (modo libre u homido) o a `/visor-3d`
- **THEN** el encuadre inicial de la cámara muestra de frente los emblemas institucionales 3D
- **AND** los controles de pausa y salida se presentan accesibles debajo de ellos en azimut frontal.
