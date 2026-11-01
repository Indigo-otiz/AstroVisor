# Propuesta: autenticación administrativa y permisos verificados en servidor Express con Supabase

## Why
El panel de administración `/admin` y los endpoints `/api/admin/*` requieren autenticación y autorización real verificada por el servidor Express para garantizar que ningún usuario no autenticado acceda a recursos administrativos, cumpliendo con la historia de usuario de S2 donde las credenciales y permisos son validados en el backend.

## What Changes
- Implementar en el servidor Express los endpoints de autenticación: `POST /api/admin/login`, `POST /api/admin/logout` y `GET /api/admin/sesion`.
- Verificar credenciales de administrador en el servidor Express consultando la tabla `admin` de Supabase (o credenciales seguras del entorno en caso de modo desconectado).
- Emitir tokens de sesión criptográficos generados por el servidor Express al autenticarse exitosamente.
- Crear middleware de autorización en Express (`verificarAdmin`) que proteja todas las rutas bajo `/api/admin/*`, respondiendo con HTTP 401 si no se envía un token válido.
- Adaptar el composable de autenticación del frontend (`useAuth.js`) para autenticar contra la API de Express (`POST /api/admin/login`) y almacenar el token de sesión emitido por el servidor.
- Mantener la integración con las tablas de Supabase (`fichas_libros`, `temas_astronomicos`, `admin`).
- Agregar pruebas unitarias automatizadas en Express para validar inicio de sesión exitoso, rechazo de credenciales incorrectas y denegación HTTP 401 sin token.

Fuera de alcance: cuentas públicas para visitantes y préstamos físicos de libros de la biblioteca.

## Capabilities
### New Capabilities
- `autenticacion-admin`: Verificación de credenciales en servidor Express y emisión de tokens de sesión administrativa.
- `gestion-acceso-admin`: Protección de rutas `/api/admin/*` mediante middleware de Express y denegación de accesos no autorizados.

## Impact
Afecta a `backend/src/index.js`, crea `backend/src/middleware/auth.js` y `backend/test/auth.test.js`, y actualiza `frontend/src/composables/useAuth.js`.
