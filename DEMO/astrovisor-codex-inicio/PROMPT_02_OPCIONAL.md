# Siguiente iteración (NO usar hasta terminar la Etapa 1)

Lee `AGENTS.md`, `DEMO_BRIEF.md` y el código existente. Implementa **solo una prueba de persistencia con PostgreSQL** para la demo D3, sin romper la versión actual.

Primero inspecciona el backend y pregunta si aún no se ha confirmado PostgreSQL. Si está confirmado, añade migración/DDL para una tabla `planetas` con al menos `id`, `nombre`, `tipo`, `descripcion`, y datos semilla de prueba, más repositorio en el backend. La API debe poder leer de PostgreSQL; deja documentado qué ocurre cuando la base de datos no está disponible. Si Docker está disponible, puedes crear `compose.yaml` para levantar PostgreSQL local sin exponer contraseñas reales. Proporciona `.env.example`, nunca un archivo `.env` con credenciales reales.

Ejecuta build y una consulta verificable o test de integración cuando haya conexión. No implementes autenticación, administración, ni préstamos en esta iteración. Al terminar, documenta y demuestra que al modificar el dato en PostgreSQL cambia la respuesta de la API y el contenido de la interfaz.
