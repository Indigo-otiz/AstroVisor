## ADDED Requirements

### Requirement: Separación segura inicial de administración
El sistema SHALL distinguir las rutas administrativas del contenido público y denegar desde el servidor las operaciones administrativas mientras no esté implementada la autenticación real.

#### Scenario: Acceso a ruta administrativa sin sesión
- **WHEN** una persona abre `/admin` sin autenticación
- **THEN** es redirigida a una pantalla que explica que el acceso todavía no está habilitado.

#### Scenario: Petición administrativa no autorizada
- **WHEN** un cliente solicita una ruta bajo `/api/admin` durante Sprint 1
- **THEN** el servidor devuelve HTTP 401 y no efectúa ninguna modificación de documentos.
