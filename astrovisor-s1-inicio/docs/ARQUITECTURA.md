# Arquitectura inicial de AstroVisor

## Capas
- `frontend/`: Vue y Vue Router; rutas públicas y puerta de acceso administrativo.
- `backend/`: Express; API de lectura pública y denegación de acceso admin mientras no haya autenticación.
- `content/`: documentos JSON de demostración, fuente independiente de datos.
- `experiments/homido-spike/`: prueba de Homido de Luis; se integra solo después de validar.
- `openspec/`: especificaciones y propuestas versionadas.

## Seguridad
La navegación `/admin` se redirige a `/admin/acceso` por experiencia de usuario, NO por seguridad. Toda solicitud bajo `/api/admin` obtiene HTTP 401 mientras la autenticación no esté implementada. NO hay cuentas, JWT, contraseñas ni escritura desde navegador en Sprint 1.

## Persistencia futura
Para implementar CRUD en archivos sin BD, Express deberá validar identidad y datos, escribir documentos con control de concurrencia, persistencia y copias de seguridad. El despliegue deberá ofrecer almacenamiento persistente, dado que un disco efímero perdería cambios.

## Alcance
Adultos mayores como público principal. Contenido provisional: constelaciones e historias del cielo; catálogo y narración de la biblioteca pendientes. No existen registro de visitantes, reservas ni préstamos de libros.
