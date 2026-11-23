# Capability: experiencia-responsiva-movil

## Purpose
Garantizar que todas las pantallas y experiencias interactivas y 3D de AstroVisor se adapten fluidamente a dispositivos móviles smartphones (vertical y horizontal), asegurando navegación accesible sin trampas de scroll e indicación intuitiva de orientación.

## ADDED Requirements

### Requirement: Modal de selección VR accesible y con scroll en smartphones
El modal de selección de experiencias VR SHALL permitir desplazarse cómodamente en pantallas pequeñas, manteniendo siempre accesible el control de cierre y desplegando la totalidad de los textos, viñetas y acciones de cada tarjeta.

#### Scenario: Apertura en móvil vertical
- **WHEN** un usuario abre el modal de experiencias VR en un smartphone en modo vertical
- **THEN** el modal permite deslizar el contenido de principio a fin
- **AND** la cabecera con el botón de cierre permanece fija y visible
- **AND** se muestra al pie un botón explícito de retorno a la portada.

#### Scenario: Visualización completa de tarjetas
- **WHEN** se visualizan las tarjetas de experiencia VR en pantalla móvil
- **THEN** cada tarjeta despliega su descripción completa sin truncamiento de palabras
- **AND** muestra las viñetas de características y el enlace de inicio correspondiente.

### Requirement: Indicador visual de giro de pantalla en experiencias inmersivas 3D
Las experiencias inmersivas 3D (Homido, Libre 3D y Visor 3D Completo) SHALL mostrar un indicador flotante no invasivo que oriente al usuario a rotar su dispositivo a posición horizontal cuando se detecte orientación vertical en un smartphone.

#### Scenario: Carga en orientación vertical
- **WHEN** el visitante accede a una experiencia 3D en un dispositivo móvil con orientación vertical
- **THEN** aparece un aviso superior traslúcido con icono animado indicando colocar la pantalla en horizontal
- **AND** el aviso cuenta con un botón de descarte manual.

#### Scenario: Giro físico a horizontal
- **WHEN** el usuario rota su teléfono a posición horizontal (landscape)
- **THEN** el indicador de giro se oculta automáticamente sin requerir interacción manual, despejando la escena 3D.
