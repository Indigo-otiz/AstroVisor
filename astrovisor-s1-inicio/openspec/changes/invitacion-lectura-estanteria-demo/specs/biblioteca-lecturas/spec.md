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
