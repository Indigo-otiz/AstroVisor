# Prueba técnica Homido

## ADDED Requirements

### Requirement: Página aislada de demostración
La aplicación SHALL disponer de una página de pruebas accesible desde la ruta `/visor`, independiente de la experiencia inmersiva definitiva.

#### Scenario: Acceso a la prueba
- **WHEN** un visitante abre `/prueba-homido/`
- **THEN** obtiene controles para sensores, retícula, vista dividida y retorno a modo web 2D.

### Requirement: Diagnóstico de sensores sin resultados supuestos
El experimento SHALL informar si recibe datos de orientación y SHALL permitir usar 2D incluso si no hay acceso a sensores.

#### Scenario: Permisos rechazados o ausentes
- **WHEN** no se conceden o no se reciben lecturas de orientación
- **THEN** la interfaz indica la limitación y conserva la alternativa 2D.

### Requirement: Selección por retícula
El experimento SHALL ofrecer un objetivo con selección de permanencia y retroalimentación visual.

#### Scenario: Selección de un objeto
- **WHEN** la retícula permanece sobre el objetivo durante 1800 ms
- **THEN** el objetivo cambia visualmente y se registra un evento local.

### Requirement: Vista dividida experimental
El experimento SHALL permitir activar y desactivar una representación por ojo sin presentarla como compatibilidad Homido ya validada.

#### Scenario: Solicitud de vista dividida
- **WHEN** se activa la vista dividida
- **THEN** el experimento intenta dibujar dos puntos de vista y ofrece una salida a 2D.
