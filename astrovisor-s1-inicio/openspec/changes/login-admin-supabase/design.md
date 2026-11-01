# Decisiones de diseño: autenticación y permisos verificados en Express

## Arquitectura de autenticación en Express

1. **Endpoints de Autenticación en Express (`backend/src/index.js`)**:
   - `POST /api/admin/login`: Recibe `{ usuario, contrasena }`. Valida los datos y consulta la tabla `admin` en Supabase (o credenciales maestras configuradas en servidor). Si coincide, genera un token de sesión seguro usando `node:crypto` y lo registra en el almacén de sesiones activas del servidor.
   - `GET /api/admin/sesion`: Endpoint protegido por el middleware de autorización; devuelve la información del administrador actual si el token es válido.
   - `POST /api/admin/logout`: Invalida el token en el servidor Express.

2. **Middleware de Autorización en Servidor (`backend/src/middleware/auth.js`)**:
   - Extrae el encabezado `Authorization: Bearer <token>`.
   - Verifica la validez y expiración del token de sesión generado por Express.
   - Si el token es ausente, expirado o inválido, responde inmediatamente con `HTTP 401 Unauthorized` (`{ error: 'Acceso no autorizado' }`).
   - Si es válido, inyecta `req.admin = sesion.admin` y permite el paso con `next()`.

3. **Integración con Supabase**:
   - El servidor Express utiliza el cliente o API REST de Supabase con las credenciales de entorno para consultar `admin` y `fichas_libros`.
   - Mantiene la compatibilidad con el esquema de tablas existente.

4. **Consumo en Frontend (`frontend/src/composables/useAuth.js`)**:
   - El frontend envía la solicitud de login a `POST /api/admin/login` hacia Express.
   - Guarda el token emitido por Express en `localStorage` y lo adjunta en los encabezados de peticiones protegidas.
   - El guard de Vue Router valida la existencia y vigencia de la sesión contra el servidor.
