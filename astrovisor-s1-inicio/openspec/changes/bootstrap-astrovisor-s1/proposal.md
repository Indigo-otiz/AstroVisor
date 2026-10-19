# Propuesta: base técnica de AstroVisor (Sprint 1)

## Why
El equipo necesita una estructura compartida, reproducible y coherente con el alcance simplificado antes de desarrollar interfaces y controles Homido definitivos.

## What Changes
- Inicializar un monorepositorio con frontend Vue y API Express independientes.
- Habilitar rutas públicas, ruta de visor y acceso administrativo diferenciado.
- Leer los contenidos de demostración desde documentos JSON detrás de un adaptador del servidor.
- Denegar acciones administrativas en el servidor mientras no exista autenticación real.
- Documentar ejecución local, integración experimental Homido y evidencias del Sprint 1.

Fuera de alcance: autenticar usuarios, implementar CRUD persistente, construir recorrido inmersivo o cargar contenidos oficiales de la biblioteca.

## Capabilities
### New Capabilities
- `navegacion-publica`: acceso organizado a las rutas iniciales.
- `contenido-documental`: consulta desacoplada de recorridos demostrativos en documentos.
- `acceso-administrativo`: puerta administrativa sin acceso no autorizado a API.

## Impact
Afecta `frontend/`, `backend/`, `content/`, `docs/` y la configuración OpenSpec.
