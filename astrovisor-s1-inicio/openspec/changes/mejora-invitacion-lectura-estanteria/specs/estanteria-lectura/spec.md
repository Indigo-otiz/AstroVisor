# Estantería de lecturas

## ADDED Requirements

### Requirement: Invitación clara a continuar leyendo
La ficha 2D de una constelación SHALL ofrecer una acción identificable para consultar libros relacionados, sin exigir uso de Homido.

#### Scenario: Continuación desde una constelación
- **WHEN** una persona abre una constelación que tiene referencias
- **THEN** ve una invitación destacada y puede navegar a la estantería correspondiente.

### Requirement: Selección accesible de libros
La estantería SHALL mostrar cubiertas ilustrativas grandes y controles operables mediante teclado y toque, sin navegación automática.

#### Scenario: Seleccionar un libro
- **WHEN** se selecciona una portada
- **THEN** se muestran título, autor, referencia en línea si existe y una opción clara de regresar.

### Requirement: Identificadores y ubicaciones sin atribución falsa
El sistema SHALL mostrar explícitamente que son referencias de demostración y SHALL evitar afirmar una ubicación, ejemplar físico o identificador MARC 21 no confirmado.

#### Scenario: Sin datos institucionales
- **WHEN** el libro no tiene ubicación confirmada por la biblioteca
- **THEN** muestra «sin confirmar» y no inventa número de control, signatura ni disponibilidad.

#### Scenario: Datos confirmados más adelante
- **WHEN** se reciben metadatos de catálogo marcados como confirmados
- **THEN** se distingue el número de control MARC 21 (001/003) de la ubicación y signatura.


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
