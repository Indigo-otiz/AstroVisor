# Capacidad: Manuales en Video e Identidad Institucional

## Purpose

Estructurar los manuales pedagógicos de uso del sistema para usuarios finales, garantizar la trazabilidad de su producción y acreditar formalmente la autoría académica del Equipo 8 e identidad institucional disponible.

## ADDED Requirements

### Requirement: Sección de manuales en video y guiones pedagógicos
La portada web SHALL integrar una sección dedicada a tres manuales de usuario:
1. *Cómo usar la web educativa:* Explicación de la navegación 2D, fichas, audios, libros y vista para proyección.
2. *Cómo explorar en VR:* Guía para los modos libre (mouse/tacto) y Homido (pantalla dividida, mirada de 3 s, salida segura).
3. *Cómo administrar el catálogo:* Flujo de acceso autenticado, consulta y alta de libros demostrativos.

#### Scenario: Visualización accesible de manuales
- **WHEN** el usuario consulta la sección de manuales en `/`
- **THEN** encuentra cada manual con su título descriptivo, transcripción accesible paso a paso y reproductor con controles accesibles.

#### Scenario: Estado de producción de grabaciones
- **WHEN** los archivos de video finales aún no han sido capturados con hardware real
- **THEN** la interfaz y la documentación técnica identifican explícitamente el estado como `PENDIENTE DE GRABACIÓN`, sin fingir que el video de respaldo de S4 sustituye a los manuales.

### Requirement: Créditos académicos del Equipo 8
La aplicación web SHALL mostrar de forma clara y accesible los créditos académicos del proyecto.

#### Scenario: Consulta de créditos en web
- **WHEN** se visualiza la portada o el pie de página institucional
- **THEN** se exhibe la leyenda «AstroVisor — proyecto académico del Equipo 8» y se listan los cuatro integrantes: Karime Rendón Vázquez, Luis Alberto Rodríguez, Carlos Martínez Orozco e Índigo Andre Ortiz Vega.

### Requirement: Identidad institucional en VR y deslinde externo
La escena VR SHALL incorporar la identidad gráfica confirmada sin invadir el campo visual astronómico, manteniendo los activos externos no verificados en espera de autorización.

#### Scenario: Logotipo de IT Tepic en el visor
- **WHEN** se accede a la escena VR
- **THEN** se muestra el logotipo del Instituto Tecnológico de Tepic de manera discreta en la zona inferior de controles/salida, sin interferir con la observación de las constelaciones.

#### Scenario: Bloqueo de identidades no autorizadas
- **WHEN** no se dispone de archivos oficiales ni permisos institucionales para CECAN o Gobierno
- **THEN** el sistema no incluye logotipos provisionales ni atribuciones no verificadas, registrando la tarea como bloqueada externamente.
