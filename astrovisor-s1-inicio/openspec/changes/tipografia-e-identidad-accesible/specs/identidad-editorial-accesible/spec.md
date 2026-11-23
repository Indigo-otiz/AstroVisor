# Spec: Identidad Editorial y Accesibilidad Tipográfica

## Purpose

Garantizar una experiencia de lectura cómoda, accesible e institucional para personas adultas mayores y público general en toda la interfaz web de AstroVisor, mediante tipografía legible, caja mixta natural, contraste cromático WCAG sin textos amarillos y armonización con la identidad de la Biblioteca Solón Argüello y CECAN.

## ADDED Requirements

### Requirement: Tipografía unificada para lectura e interfaz
La aplicación web general SHALL estructurar sus estilos tipográficos utilizando tipografía serif editorial para lectura y títulos culturales, y tipografía sans-serif neutral para navegación, controles, tarjetas y badges, excluyendo fuentes geométricas o arcade de la interfaz general.

#### Scenario: Visualización tipográfica en vistas públicas
- **WHEN** el usuario navega por las secciones públicas (inicio, exploración, fichas, biblioteca y manuales)
- **THEN** los títulos y textos culturales se presentan en tipografía serif (`Newsreader` / `Georgia`)
- **AND** los elementos interactivos, navegación y badges se presentan en sans-serif legible (`system-ui`, `-apple-system`, `Segoe UI`, `sans-serif`) sin emplear la fuente `Orbitron`.

### Requirement: Normalización a caja mixta natural sin mayúsculas forzadas
Los componentes de la interfaz general SHALL presentar sus textos, botones, microetiquetas y badges en caja mixta natural (mayúscula inicial y minúsculas), suprimiendo transformaciones forzadas a mayúsculas completas.

#### Scenario: Presentación de microetiquetas y botones
- **WHEN** se renderizan las tarjetas de entrada, insignias de estado o botones de acción
- **THEN** los textos se muestran en caja mixta (por ejemplo, «Pantalla 2D», «Inmersión 3D», «Desplazar hacia abajo») sin aplicar `text-transform: uppercase`.

### Requirement: Erradicación de textos amarillos y contraste accesible
La interfaz web SHALL prescindir de colores amarillos o dorados como tono de fuente para textos de lectura o etiquetas, garantizando un ratio de contraste accesible sobre sus fondos respectivos.

#### Scenario: Legibilidad sobre fondos oscuros y claros
- **WHEN** se visualizan textos sobre fondos nocturnos o tarjetas translúcidas
- **THEN** los textos y enlaces emplean blanco (`#ffffff`) o azul celeste suave de alto contraste (`#bae6fd`)
- **AND** sobre fondos claros emplean azul marino (`#1f4e8c`) o carbón profundo (`#1b2430`), reservando el dorado exclusivamente a detalles vectoriales o bordes sutiles.

### Requirement: Integración de cromática institucional
La paleta general de la aplicación SHALL incorporar el guinda institucional del CECAN / Gobierno de Nayarit (`#7a152b`) y el azul institucional (`#1f4e8c`) en acentos y elementos de identidad, manteniendo el fondo pergamino cálido (`#faf7f0`) de la biblioteca.

#### Scenario: Inspección de acentos institucionales
- **WHEN** se visualizan los componentes generales y enlaces institucionales
- **THEN** se aprecian detalles de realce en guinda y azul institucional en equilibrio con la identidad editorial de la biblioteca.
