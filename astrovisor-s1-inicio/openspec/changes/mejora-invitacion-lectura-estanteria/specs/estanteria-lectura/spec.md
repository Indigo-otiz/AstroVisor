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
