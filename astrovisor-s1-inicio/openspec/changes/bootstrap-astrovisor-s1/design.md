# Diseño técnico: bootstrap AstroVisor

## Decisiones
- **Monorepositorio con npm workspaces:** dos paquetes (`frontend`, `backend`) y raíz compartida para documentación y datos.
- **Frontend Vue + Vue Router:** navegación pública `/`, `/explorar`, `/visor`; administración `/admin/acceso` y `/admin`.
- **Express:** API `/api/health`, `/api/contenidos/recorridos` y protección de denegación de `/api/admin/*` por defecto.
- **Contenido separado:** `content/recorridos.json` leído por `backend/src/services/documentRepository.js` (sustituible por almacenamiento persistente o API posterior).
- **Administración:** en Sprint 1 una ruta frontend bloqueada es solo UX; Express responde 401 a cualquier solicitud admin. No se simula login seguro.
- **Homido:** se reserva `experiments/homido-spike/` para trabajo independiente de Luis; `/visor` solo ofrece una explicación y alternativa web en esta fase.

## Riesgos y decisiones posteriores
- Un hosting con disco efímero no permite guardar JSON permanente. El CRUD documental necesitará almacenamiento durable, validación, autenticación y estrategia de concurrencia.
- La viabilidad de estereoscopía con Homido debe comprobarse físicamente: WebGL y sensores por sí solos no prueban compatibilidad.
- Los datos y recomendaciones bibliográficas son de demostración hasta recibir los materiales de la biblioteca.

## Pruebas
- Instalación limpia reproducible, verificación de `/api/health` y lectura JSON.
- Confirmación de rutas públicas, denegación de rutas administrativas y build del frontend.
- Evidencias y revisión cruzada en `docs/PRUEBA-S1.md`.
