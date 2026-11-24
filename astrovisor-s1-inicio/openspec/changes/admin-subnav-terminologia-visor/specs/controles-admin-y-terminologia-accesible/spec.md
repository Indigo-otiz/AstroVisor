# Capability: controles-admin-y-terminologia-accesible

## Purpose
Proporcionar controles de navegación rápida y atajos ergonómicos en la consola administrativa, evitar tecnicismos de marca confusos para el público general y ofrecer instrucciones claras y concisas para el uso del visor.

## ADDED Requirements

### Requirement: Barra de navegación rápida y accesos directos en administración
El panel de administración `AdminPanelView` SHALL presentar una barra de accesos directos adherente que permita saltar directamente a las secciones de experiencias, catálogo de libros y constelaciones, así como un control de acción directa para iniciar la captura de un nuevo libro sin necesidad de desplazamiento manual previo.

#### Scenario: Salto directo a una sección
- **WHEN** el administrador pulsa uno de los accesos directos (ej. «Catálogo de Libros» o «Constelaciones»)
- **THEN** la vista realiza un desplazamiento suave (`smooth scroll`) hasta el encabezado de la sección seleccionada.

#### Scenario: Registro directo de libro desde la barra
- **WHEN** el administrador pulsa el botón «+ Registrar Libro» en la barra de accesos
- **THEN** se inicializa el borrador de nuevo libro en el composable de catálogo
- **AND** la pantalla se desplaza de inmediato al formulario de edición enfocando el primer campo de captura.

### Requirement: Terminología universal del visor sin mención de marca aislada
Las interfaces públicas y administrativas SHALL emplear términos universales y descriptivos como «Visor VR», «Visor Celular» o «el visor», omitiendo el uso del nombre de marca «Homido» cuando figure de manera aislada sin calificativo de dispositivo.

#### Scenario: Navegación pública superior
- **WHEN** un visitante visualiza la barra de navegación principal en la cabecera
- **THEN** el enlace hacia la experiencia de visor indica claramente «Visor VR» en lugar de la palabra aislada «Homido».

#### Scenario: Estados del catálogo en administración
- **WHEN** el administrador consulta el estado de sincronización y publicación de las fichas
- **THEN** los textos informan sobre el «respaldo del visor» sin emplear el nombre de marca de forma aislada.

### Requirement: Instrucciones de uso del visor claras, concisas y orientadas a la acción
La guía de uso en `VisorView` SHALL presentar instrucciones breves (máximo 25 palabras por tarjeta) con tipografía contrastada y acciones destacadas en negrita, facilitando la comprensión rápida para todo público sin saturación de texto.

#### Scenario: Consulta de pasos en la guía del visor
- **WHEN** el usuario lee los pasos de preparación y seguridad del visor
- **THEN** cada tarjeta comunica una instrucción atómica y concisa sin párrafos extensos ni terminología redundante.
