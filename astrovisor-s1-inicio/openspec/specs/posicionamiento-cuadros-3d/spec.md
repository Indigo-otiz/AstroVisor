# Capability: posicionamiento-cuadros-3d

## Purpose
Garantizar que los cuadros de información 3D se muestren rectos a la vista, perfectamente centrados horizontalmente con la constelación y nivelados con el horizonte, asegurando una lectura natural y sin distorsiones oblicuas.

## Requirements

### Requirement: Cuadro centrado y nivelado al horizonte
El cuadro 3D de información de constelación SHALL posicionarse sobre el mismo azimut que la constelación seleccionada (sin desplazamiento lateral `lateralOffset = 0`), con un descenso angular esférico suave para dejar visibles las estrellas en la parte superior sin taparlas, y con su vector horizontal `right` paralelo al plano del horizonte terrestre (`right.y === 0`).

#### Scenario: Visualización frontal recta
- **WHEN** el usuario selecciona una constelación en el visor 3D
- **THEN** el cuadro de información aparece centrado frontalmente respecto a la línea visual de la constelación
- **AND** los bordes superior e inferior del cuadro se proyectan perfectamente paralelos al horizonte sin ladeo ni inclinación oblicua.
