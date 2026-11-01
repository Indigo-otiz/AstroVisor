# Especificación: Recorrido Homido con tres constelaciones

## ADDED Requirements

### Requirement: Tres constelaciones generadas desde datos
La escena SHALL mostrar las constelaciones `orion`, `osa-mayor` y `escorpio`, cada una con silueta, color y rótulo de texto distintos, generadas a partir de una definición de datos sin lógica específica por id.

#### Scenario: Las tres son visibles
- **WHEN** la escena termina de cargar
- **THEN** se ven tres figuras separadas, cada una con su nombre legible y sin traslape de sus áreas de mirada

#### Scenario: Agregar una constelación
- **WHEN** se agrega una figura en `figuras.js` y un registro con el mismo id en el JSON
- **THEN** aparece y es seleccionable sin modificar la lógica de interacción

### Requirement: Selección por mirada de 3 segundos
Cada constelación SHALL poder seleccionarse manteniendo la mirada 3000 ms, con anillo de progreso `#F5B301`, etapas 33/66/100 %, confirmación verde `#1E7B3A`, sonido, cancelación a 0 % al retirar la mirada y margen de gracia de 280 ms.

#### Scenario: Selección completa
- **WHEN** la retícula permanece 3 s sobre una constelación
- **THEN** se confirma y se abre la ficha de esa constelación

#### Scenario: Mirada retirada
- **WHEN** la mirada sale por más de 280 ms antes de 3 s
- **THEN** el anillo vuelve a 0 % y no se abre ninguna ficha

#### Scenario: Cambio entre constelaciones
- **WHEN** la mirada pasa de una constelación a otra
- **THEN** la carga de la primera se reinicia y la segunda inicia desde 0 %

### Requirement: Regreso y nueva selección sin recargar
Desde la ficha, "Volver al recorrido" SHALL restaurar las tres constelaciones con anillos en 0 % para elegir otra sin recargar la página.

#### Scenario: Ver dos constelaciones seguidas
- **WHEN** se abre Orión, se vuelve al recorrido y se selecciona Escorpio
- **THEN** se muestra la ficha de Escorpio sin datos residuales de Orión

### Requirement: Controles de bienestar y salida
Pausa y Salir a 2D SHALL seguir disponibles por mirada y por clic/toque. En pausa SHALL ignorarse toda selección salvo "Seguir"; Salir SHALL navegar a `/explorar`.

#### Scenario: Pausa
- **WHEN** se activa Pausa
- **THEN** mirar una constelación no inicia carga hasta reanudar

#### Scenario: Alternativa sin visor
- **WHEN** se hace clic o toque sobre una constelación, la ficha, Pausa o Salir
- **THEN** se ejecuta la misma acción sin esperar 3 s

### Requirement: Datos de demostración identificados
Todo contenido provisional SHALL mostrarse rotulado "Dato de muestra" y la fuente usada (API o respaldo local) SHALL registrarse en el log de la sesión.

#### Scenario: API no disponible
- **WHEN** `/api/contenidos/recorridos` falla o devuelve datos inválidos
- **THEN** se cargan los datos locales, el recorrido funciona y el log lo indica
