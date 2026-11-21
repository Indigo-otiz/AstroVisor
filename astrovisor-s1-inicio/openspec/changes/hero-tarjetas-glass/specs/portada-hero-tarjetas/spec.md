# Portada Hero con Tarjetas de Experiencia

## Purpose

Proporcionar un punto de partida visualmente despejado, moderno y atractivo para que cualquier visitante identifique inmediatamente las dos experiencias principales (Web 2D o Visor 3D/VR) sin obstaculizar la vista de las estrellas.

## Requirements

### Requirement: Lienzo estelar despejado sin título duplicado

La vista principal `InicioView` SHALL omitir el contenedor `.hero-topbar` dentro del área del lienzo estelar interactivo, conservando únicamente la cabecera institucional global.

#### Scenario: Visualización del lienzo

- **WHEN** el usuario ingresa a la ruta raíz `/`
- **THEN** la zona superior del lienzo no muestra recuadros opacos de marca
- **AND** las estrellas y la constelación de Orión se visualizan sin obstrucción en el cuadrante superior.

### Requirement: Tarjetas de entrada translúcidas con indicación clara

La sección inferior del hero SHALL presentar dos tarjetas translúcidas de cristal esmerilado (`hero-glass-card`) que distingan claramente la experiencia web en pantalla de la experiencia inmersiva 3D/VR.

#### Scenario: Interacción con la tarjeta web

- **WHEN** el usuario interactúa con la tarjeta de pantalla
- **THEN** se presenta un enlace accesible hacia `/explorar`
- **AND** el fondo translúcido permite distinguir las estrellas del lienzo subyacente.

#### Scenario: Interacción con la tarjeta VR

- **WHEN** el usuario pulsa la tarjeta de inmersión 3D
- **THEN** se abre el modal de opciones de exploración `mostrarModalVR`
- **AND** ofrece las modalidades de visor físico, 3D ligera y 3D completa.
