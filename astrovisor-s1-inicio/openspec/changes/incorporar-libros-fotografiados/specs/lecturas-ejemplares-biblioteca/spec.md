# Lecturas de los ejemplares fotografiados

## Purpose

Permitir que visitantes de la web y Homido consulten los ejemplares documentados y sus recomendaciones de lectura.

## ADDED Requirements

### Requirement: Portada y ficha del ejemplar fotografiado

Cada publicación identificada SHALL tener su propia ficha con la portada de la fotografía proporcionada y los datos bibliográficos legibles.

#### Scenario: Consultar una edición sin acceso digital confirmado

- **WHEN** un visitante abre una ficha sin un enlace público verificado
- **THEN** puede consultar su portada y datos sin que se le ofrezca un enlace de lectura ni se declare disponibilidad para préstamo.

### Requirement: Recomendaciones por constelación

El catálogo SHALL ofrecer acceso a las publicaciones asociadas a Orión, Osa Mayor, Escorpio, Can Mayor o Boyero desde la web y Homido.

#### Scenario: Consultar más de tres lecturas

- **WHEN** una constelación tiene más de tres lecturas asociadas
- **THEN** el visitante puede consultar todas y distinguir los títulos que aportan contexto general.

#### Scenario: Repartir las publicaciones fotografiadas

- **WHEN** se consulta el catálogo incorporado a partir del ZIP
- **THEN** cada una de las cinco constelaciones tiene tres de las publicaciones fotografiadas y cada publicación se asigna a una sola constelación.
