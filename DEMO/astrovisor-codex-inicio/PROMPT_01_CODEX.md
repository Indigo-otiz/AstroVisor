# Prompt inicial para pegar en Codex

Lee primero `AGENTS.md` y `DEMO_BRIEF.md`. Ayúdame a implementar **solo la Etapa 1** de la demo técnica de AstroVisor.

Antes de escribir, inspecciona la carpeta actual: si está vacía, crea el proyecto; si ya hay código, respeta los archivos existentes y explica brevemente los cambios propuestos. No modifiques repositorios remotos.

Usa este stack provisional:
- Frontend: React + Vite + TypeScript.
- Visualización: Three.js (sin recursos externos que necesiten atribución).
- Backend: Node.js + Express, preferentemente con TypeScript y `tsx`.
- Datos: JSON local o un arreglo en memoria servido por la API. **No configures PostgreSQL todavía.**

Implementa un monorepositorio fácil de arrancar, preferentemente con npm workspaces y carpetas `apps/web` y `apps/api`. Crea comandos claros para instalar dependencias y levantar frontend/API. Configura un proxy de Vite para llamar a `/api` sin problemas de CORS durante el desarrollo.

Requisitos:
1. Página responsiva, oscura y temática de astronomía con título AstroVisor, texto explicativo, selección de al menos tres planetas (Tierra, Marte, Júpiter) y ficha del seleccionado.
2. Una escena simple de Three.js que muestre el planeta seleccionado mediante una esfera 3D, iluminación, fondo estrellado generado por código y controles básicos de rotación/zoom. Al cambiar planeta, actualizar vista y detalles sin recargar la página. Manejar montaje/desmontaje y resize sin fugas evidentes de recursos.
3. API Express con `GET /api/health` y `GET /api/planets`, devolviendo JSON. Campos mínimos por planeta: id, nombre, tipo, descripción, radioVisual, colorVisual. Los valores visuales son para la demo y no representan dimensiones reales.
4. Consumir `GET /api/planets` desde React, con estados de carga y error. Evita duplicar el arreglo de planetas en el frontend.
5. README en español: instalación, versión Node recomendada, comandos exactos, URLs y pasos para demostrar que el frontend usa la API.
6. Archivo `docs/DECISIONES.md` con stack provisional, restricciones y pendientes para D3.
7. Comprobaciones: ejecutar `npm run build` y cualquier test/smoke-check creado; arreglar errores reales. Documenta resultados y bloqueos.

No implementes todavía registro de usuarios, autenticación, CRUD administrativo, préstamos, PostgreSQL ni VR real. No presentes una esfera 3D de escritorio como una prueba funcional de Homido. Prioriza una demo sólida sobre una aplicación completa.

Al finalizar, responde con: archivos creados/cambiados, comandos para arrancar, qué mostrar a la maestra, resultados de pruebas, y tres próximos pasos ordenados por prioridad.
