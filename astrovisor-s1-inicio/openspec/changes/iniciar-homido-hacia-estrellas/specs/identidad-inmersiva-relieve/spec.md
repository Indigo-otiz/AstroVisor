# Spec Delta

## MODIFIED Requirements

### Requirement: Posición fija detrás de la cámara inicial

La cámara SHALL iniciar orientada al sector estelar de Can Mayor en modo libre y Homido. Los emblemas SHALL situarse detrás de la posición y orientación iniciales de la cámara, orientados hacia el visitante. Los emblemas SHALL permanecer fijos al girar o reubicar los controles.

#### Scenario: Vista inicial del cielo

- **WHEN** el visitante entra en modo libre o Homido con el dispositivo en su orientación inicial
- **THEN** se ven Can Mayor, su rótulo y los controles del recorrido. Los dos emblemas se encuentran detrás.

#### Scenario: Entrada y giro

- **WHEN** el visitante entra y gira aproximadamente media vuelta
- **THEN** encuentra los dos emblemas legibles, separados entre sí y orientados hacia él, fuera del encuadre inicial.

#### Scenario: Controles y narración

- **WHEN** abre o cierra fichas, usa narraciones o reubica controles
- **THEN** los emblemas permanecen en su posición y no capturan selecciones por clic o mirada.
