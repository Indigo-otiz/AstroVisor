# Capacidad: Inmersión Auditiva y Cielo Visible

## Purpose

Permitir la exploración astronómica 3D directa en modalidades monoscópica y estereoscópica, preservando la visibilidad del cielo y de las constelaciones durante la narración y priorizando el audio sobre el texto dentro del visor.

## ADDED Requirements

### Requirement: Resolución de modalidad directa por URL
La aplicación inmersiva `/prueba-homido/index.html` SHALL interpretar el parámetro `modo` de la URL para configurar la experiencia sin pantallas intermedias:
- `modo=libre`: Escena monoscópica estándar que ocupa el 100% del viewport, con controles de arrastre y toque táctil.
- `modo=homido`: Escena estereoscópica con renderizado en pantalla dividida y controles de mirada y orientación.
- Sin parámetro: Asume `modo=libre` como fallback de compatibilidad.

#### Scenario: Carga en modo libre
- **WHEN** se carga la URL con `?modo=libre`
- **THEN** la escena 3D ocupa la ventana completa, los paneles HTML externos (`.controls-panel`, `.reading-panel`, `.log-panel`) permanecen ocultos y se desactiva la división de pantalla.

#### Scenario: Carga en modo Homido
- **WHEN** se carga la URL con `?modo=homido`
- **THEN** se inicializan las dos cámaras virtuales de `estereo.js`, la retícula con dwell-time de 3 s y la orientación por sensores, ocultando los paneles HTML externos.

#### Scenario: Conservación de herramientas de diagnóstico
- **WHEN** la URL incluye `?diag=1`
- **THEN** los paneles HTML de log, botones técnicos y mediciones de orientación se muestran para fines de prueba y auditoría.

### Requirement: Visibilidad del cielo durante la narración
Al seleccionar una constelación en VR, el sistema SHALL mantener visible la escena del cielo nocturno y la figura estelar activa mientras se reproduce la historia.

#### Scenario: Apertura de ficha inmersiva
- **WHEN** se completa la selección de una constelación por mirada o interacción directa
- **THEN** el grupo de estrellas y constelaciones permanece visible de fondo, la constelación activa se resalta visualmente y el panel de ficha se ubica de forma no obstructiva sin tapar la escena completa.

### Requirement: Controles compactos de narración de audio
La ficha inmersiva SHALL presentar controles simplificados para gobernar el audio: Escuchar, Pausar/Reanudar y Repetir desde el inicio.

#### Scenario: Repetición de narración
- **WHEN** el usuario activa la acción «Repetir» en la ficha
- **THEN** el audio se reinicia desde el segundo 0 sin solapamientos ni duplicación de reproductores.

#### Scenario: Independencia de pausa de mirada y narración
- **WHEN** el usuario activa «Pausar mirada»
- **THEN** se suspende la selección por permanencia de la retícula, pero la reproducción del audio narrativo continúa sin interrupciones.

### Requirement: Representación reducida de libros en VR
La visualización de recomendaciones bibliográficas en VR SHALL limitarse a portada, título, autor y etiqueta DEMO.

#### Scenario: Consulta de libros en el visor
- **WHEN** el usuario abre la estantería o ficha de libro en VR
- **THEN** el visor muestra únicamente la cubierta ilustrativa, el título y el autor, con opción de volver a la constelación o consultar el detalle completo en la web 2D.
