# Spec Delta

## Purpose

Definir la presentación de los emblemas de IT Tepic y Biblioteca Solón Argüello como relieves detrás del visitante en la experiencia inmersiva.

## ADDED Requirements

### Requirement: Dos identidades con volumen y relieve
La escena SHALL representar exclusivamente las identidades de IT Tepic y Biblioteca Pública Central Estatal Solón Argüello mediante emblemas con espesor y detalles geométricos elevados, conservando las proporciones, colores y contenido de las imágenes proporcionadas.

#### Scenario: Inspección oblicua de los emblemas
- **WHEN** el visitante observa cada emblema desde un ángulo lateral
- **THEN** distingue espesor, superficies laterales y detalles elevados; el logo no consiste solamente en una imagen plana ni una imagen sobre una caja sin relieve interno.

#### Scenario: Fidelidad de las identidades
- **WHEN** se compara la vista frontal con los dos adjuntos
- **THEN** el escudo de Tepic conserva su forma circular y sus colores y la biblioteca conserva el retrato y las inscripciones del original, sin fondos rectangulares blancos ajenos al diseño.

### Requirement: Tamaño orientado a la apreciación en el visor
Los emblemas SHALL mostrarse a mayor tamaño que sus representaciones anteriores, con escala independiente y proporciones internas conservadas. El tamaño, distancia y separación SHALL permitir apreciar cada identidad y leer sus inscripciones al orientarse hacia ella, en pantalla y en ambas vistas estereoscópicas.

#### Scenario: Observación en estéreo
- **WHEN** el visitante gira hacia cada emblema en modo visor
- **THEN** puede apreciar el emblema completo y sus inscripciones en ambas vistas, sin recorte ni solapamiento con el otro logo o los controles.

### Requirement: Posición fija detrás de la cámara inicial
Los emblemas SHALL situarse detrás de la posición y orientación iniciales de la cámara, orientados hacia el visitante. SHALL permanecer fijos en el entorno al girar o reubicar los controles, en pantalla y estéreo.

#### Scenario: Entrada y giro
- **WHEN** el visitante entra y gira aproximadamente media vuelta
- **THEN** encuentra los dos emblemas legibles, separados entre sí y orientados hacia él, fuera del encuadre inicial.

#### Scenario: Controles y narración
- **WHEN** abre o cierra fichas, usa narraciones o reubica controles
- **THEN** los emblemas permanecen en su posición y no capturan selecciones por clic o mirada.

### Requirement: Retirada de imágenes anteriores del visor
La escena SHALL retirar la identidad CECAN y las imágenes planas anteriores junto a los controles. Los logos y recursos de la web convencional SHALL conservarse.

#### Scenario: Revisión del entorno inmersivo
- **WHEN** se recorre la escena completa
- **THEN** no aparecen el logo CECAN ni copias planas anteriores de los emblemas junto a los controles.

### Requirement: Fallo aislado de recursos
Un fallo al cargar un emblema SHALL permitir continuar el recorrido, usar la salida y consultar el contenido; SHALL quedar registrado sin sustituirlo por otra identidad.

#### Scenario: Recurso no disponible
- **WHEN** falla la carga de uno de los recursos gráficos nuevos
- **THEN** la escena mantiene cámara, controles y salida operativos, sin impedir cargar el otro emblema.
