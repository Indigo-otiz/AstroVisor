## ADDED Requirements

### Requirement: Rutas iniciales de AstroVisor
La aplicación SHALL ofrecer desde el navegador rutas de inicio, exploración de constelaciones y acceso a información del modo Homido, independientemente del panel administrativo.

#### Scenario: Navegación pública
- **WHEN** el visitante abre `/`, `/explorar` o `/visor`
- **THEN** puede consultar la vista correspondiente sin crear una cuenta.

#### Scenario: Contenido Homido pendiente
- **WHEN** el visitante abre `/visor` antes de la integración inmersiva
- **THEN** la página indica que es una funcionalidad en preparación y permite continuar en modo web.
