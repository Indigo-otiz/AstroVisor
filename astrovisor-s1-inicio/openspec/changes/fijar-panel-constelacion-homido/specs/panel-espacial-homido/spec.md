# Spec Delta

## Purpose

Mantener las fichas de Homido ligadas a sus constelaciones y despejar el recorrido cuando el visitante gira hacia otra parte del cielo.

## ADDED Requirements

### Requirement: Panel fijo junto a la constelación

La ficha y sus controles SHALL aparecer cerca de la constelación seleccionada y mantener un margen sobre el terreno. Su posición SHALL mantenerse al mover la cámara y al navegar entre la ficha, la estantería y el detalle.

#### Scenario: Selección con inclinaciones distintas

- **WHEN** se abre Escorpio desde dos inclinaciones de cámara distintas, en modo libre o en modo Homido
- **THEN** la ficha aparece en el mismo punto de la escena y los botones se ven completos, sin atravesar el terreno.

#### Scenario: Navegación de lectura

- **WHEN** el visitante pasa a la estantería o al detalle y regresa a la ficha
- **THEN** el panel de lectura aparece en el mismo anclaje junto a la constelación.

### Requirement: Cierre cuando el panel sale del campo de visión

Cuando el panel activo queda completamente fuera del campo de visión por un intervalo continuo, el sistema SHALL cerrar la ficha y volver a habilitar la selección de constelaciones.

#### Scenario: Parte del panel sigue visible

- **WHEN** el visitante mira a un botón del borde o el panel se ve parcialmente en al menos un ojo
- **THEN** la ficha se mantiene abierta y las acciones de la vista siguen disponibles.

#### Scenario: Girar hacia otra parte del cielo

- **WHEN** el visitante gira hasta que el panel completo deja de verse y mantiene la nueva dirección
- **THEN** se ejecuta el flujo de cierre de la ficha, se detiene su narración y vuelve a estar disponible la selección de otra constelación.
