## ADDED Requirements

### Requirement: Invitación visible a continuar leyendo
La vista 2D de una constelación SHALL mostrar una invitación de alto contraste a explorar libros vinculados, con una acción descriptiva y retorno a la constelación.

#### Scenario: Desde la historia a los libros
- **WHEN** una persona ve la ficha de Orión, Osa Mayor o Escorpio
- **THEN** aparece la acción «Ver libros recomendados» que abre la estantería para esa constelación

### Requirement: Estantería accesible e independiente del visor
La aplicación SHALL ofrecer una página 2D enlazable con portadas grandes y nombres legibles, y un detalle individual con regreso claro.

#### Scenario: Selección por teclado o toque
- **WHEN** se activa «Ver información del libro» desde una tarjeta
- **THEN** se muestra una página con título, autor, relación con la constelación y retorno a la estantería

### Requirement: Datos bibliotecarios honestamente demostrativos
La experiencia SHALL distinguir referencias públicas y portadas ilustrativas de existencias físicas no confirmadas. No SHALL afirmar disponibilidad ni asignar ubicaciones reales.

#### Scenario: Número de control MARC 21 simulado
- **WHEN** se abre una ficha de libro
- **THEN** el `001/003` aparece como ejemplo ficticio y la ubicación/signatura `852` indica que no se dispone de esos datos

### Requirement: Conservar funcionalidades existentes
El cambio SHALL evitar modificaciones de comportamiento del visor Homido, narración, autenticación y contrato JSON de constelaciones.

#### Scenario: Regresión
- **WHEN** se abre una constelación después del cambio
- **THEN** su historia, reconocimiento y reproductor existente siguen estando disponibles


### Requirement: Descubrir libros dentro del visor Homido
La ficha 3D SHALL ofrecer una invitación a la estantería seleccionable por mirada de tres segundos o toque. La estantería SHALL mostrar como máximo tres cubiertas ilustrativas grandes y una selección claramente identificada.

#### Scenario: Selección de un libro
- **WHEN** la persona mantiene la mirada sobre una portada durante tres segundos
- **THEN** se muestra la ficha breve del libro con título, autor, invitación a leer y la aclaración de que la ubicación física no está confirmada.

### Requirement: Consultar la ficha completa en modo web 2D
El visor SHALL ofrecer el paso a la ficha/estantería web de la rama, conservando los controles de pausa y salida y sin alterar el reproductor de narraciones.

#### Scenario: Continuar en 2D
- **WHEN** la persona elige «Consultar información en 2D»
- **THEN** la narración se detiene al cerrar la ficha y se navega a la URL interna asociada al libro.

#### Scenario: Navegación de regreso
- **WHEN** se elige «Volver a los libros» o «Volver a la constelación»
- **THEN** aparece la pantalla anterior con sus objetivos de mirada correspondientes.
