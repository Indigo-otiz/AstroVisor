# Autenticación y permisos administrativos en Express

## Purpose
Permitir que el personal administrativo autorizado acceda a recursos y vistas protegidas mediante credenciales y permisos verificados directamente por el servidor Express, denegando todo acceso no autorizado mediante respuestas HTTP 401.

## ADDED Requirements

### Requirement: Verificación de credenciales en servidor Express
El servidor Express SHALL exponer un endpoint `POST /api/admin/login` que valide el usuario y la contraseña enviados, consultando la base de datos de administradores y respondiendo con un token de sesión si son válidas.

#### Scenario: Credenciales válidas procesadas por el servidor
- **WHEN** un cliente envía `POST /api/admin/login` con credenciales de administrador correctas
- **THEN** el servidor Express responde con código HTTP 200
- **AND** entrega un token de sesión y los datos del administrador autenticado.

#### Scenario: Credenciales inválidas o incompletas
- **WHEN** un cliente envía `POST /api/admin/login` con usuario o contraseña erróneos o faltantes
- **THEN** el servidor Express responde con código HTTP 401
- **AND** no emite ningún token de sesión.

### Requirement: Protección y denegación de rutas administrativas en Express
El servidor Express SHALL interceptar todas las solicitudes a rutas `/api/admin/*` mediante un middleware de autorización que requiera un token de sesión válido emitido por el servidor.

#### Scenario: Intento de acceso sin token de sesión
- **WHEN** una solicitud HTTP se dirige a un recurso protegido bajo `/api/admin/*` sin encabezado de autorización
- **THEN** el servidor responde inmediatamente con código HTTP 401
- **AND** bloquea el procesamiento del recurso solicitado.

#### Scenario: Solicitud con token de sesión administrativo válido
- **WHEN** una solicitud HTTP incluye un encabezado `Authorization: Bearer <token>` válido y activo
- **THEN** el servidor autoriza la solicitud
- **AND** permite acceder a la información o acción administrativa solicitada.

### Requirement: Cierre e invalidación de sesión en el servidor
El servidor Express SHALL permitir cerrar sesión mediante `POST /api/admin/logout`, invalidando el token para peticiones futuras.

#### Scenario: Cierre de sesión administrativo
- **WHEN** el administrador envía `POST /api/admin/logout` con su token de sesión
- **THEN** el servidor invalida el token
- **AND** peticiones subsecuentes con ese token reciben HTTP 401.
