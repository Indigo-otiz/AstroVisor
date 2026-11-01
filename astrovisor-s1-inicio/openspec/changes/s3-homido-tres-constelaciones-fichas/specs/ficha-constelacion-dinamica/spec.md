# Especificación: Ficha de constelación dinámica

## ADDED Requirements

### Requirement: Una sola ficha reutilizable
La experiencia SHALL tener una única ficha 3D que se dibuja con los datos de la constelación seleccionada: título, descripción (`resumen`), historia, bibliografía, botón de audio y "Volver al recorrido".

#### Scenario: Contenido específico
- **WHEN** se selecciona `osa-mayor`
- **THEN** la ficha muestra el título, resumen e historia de `osa-mayor` y nada de otra constelación

### Requirement: Texto completo y legible
El texto SHALL ajustarse al ancho de la tarjeta y la altura de la ficha SHALL calcularse según el contenido, de modo que ningún texto se superponga con botones ni salga de la tarjeta, con contraste mínimo 4.5:1.

#### Scenario: Historia larga
- **WHEN** la historia ocupa más líneas que la de Orión
- **THEN** el layout se ajusta y las zonas de mirada de los botones coinciden con los botones dibujados

### Requirement: Ranura de referencia bibliográfica
La ficha SHALL reservar una zona de referencia bibliográfica alimentada por `libros` del JSON. Sin datos SHALL mostrar un texto de pendiente rotulado como muestra, sin presentar libros como disponibles.

#### Scenario: Sin libros
- **WHEN** `libros` está vacío
- **THEN** se muestra "Referencia bibliográfica: pendiente" y no un título inventado como real

### Requirement: Ranura de narración de audio
El botón de narración SHALL emitir `astrovisor:audio-solicitado` y SHALL mostrar el estado real confirmado por el reproductor de Luis (`window.astrovisorVisor.estadoNarracion`); SHALL mostrar "Reproduciendo" solo cuando el reproductor lo confirme y "La narración aún no está disponible. Puedes leer el texto." sin audio. Pausar la mirada SHALL NOT pausar la narración.

#### Scenario: Sin módulo de audio
- **WHEN** se pulsa "Escuchar" y no hay audio
- **THEN** aparece el aviso y la ficha sigue operable

#### Scenario: Con módulo de audio (futuro)
- **WHEN** otro módulo escucha el evento
- **THEN** recibe `{id, audio}` y puede reportar su estado sin modificar la ficha
