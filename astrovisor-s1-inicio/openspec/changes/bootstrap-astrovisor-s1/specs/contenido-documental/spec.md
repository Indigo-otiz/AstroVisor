## ADDED Requirements

### Requirement: Lectura documental de contenidos de demostración
El sistema SHALL obtener recorridos educativos desde archivos estructurados y exponerlos por una interfaz de lectura independiente de las vistas Vue.

#### Scenario: Consulta de recorridos
- **WHEN** la interfaz solicita `GET /api/contenidos/recorridos`
- **THEN** la API devuelve el arreglo de recorridos almacenados en un documento JSON marcado como demostración.

#### Scenario: Error de lectura
- **WHEN** la API no puede cargar el documento
- **THEN** responde con un error controlado y la interfaz muestra un mensaje comprensible.
