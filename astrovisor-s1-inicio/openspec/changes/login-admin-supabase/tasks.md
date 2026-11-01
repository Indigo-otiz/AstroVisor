# Tareas de implementación — Autenticación y permisos verificados en Express

- [x] 1. Crear especificación y decisiones de arquitectura en OpenSpec.
- [x] 2. Crear servicio y middleware de autenticación en Express (`backend/src/middleware/auth.js`) para validar tokens y denegar accesos sin autorización.
- [x] 3. Implementar endpoints en Express (`POST /api/admin/login`, `GET /api/admin/sesion`, `POST /api/admin/logout`) con validación de credenciales en servidor.
- [x] 4. Crear pruebas unitarias automáticas en Express (`backend/test/auth.test.js`) que verifiquen login, rechazo y denegación HTTP 401.
- [x] 5. Adaptar el frontend (`frontend/src/composables/useAuth.js`) para realizar login contra el endpoint de Express y adjuntar el Bearer token emitido por el servidor.
- [x] 6. Verificar funcionamiento completo con `npm test`, `npm run test:web` y `npm run build`.
