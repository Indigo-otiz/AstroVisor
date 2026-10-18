# AstroVisor — Base técnica Sprint 1

Prototipo académico de **AstroVisor: Historias del cielo**, orientado prioritariamente a adultos mayores. El contenido todavía es demostrativo hasta recibir y validar el material de la biblioteca.

## Requisitos
- Node.js **20.19 o superior** y npm.
- Git.
- Navegador moderno.
- Para OpenSpec: CLI `@fission-ai/openspec` y una herramienta de programación compatible (Codex / Claude Code).

## Arranque local

```bash
npm install
npm test
```

Abrir dos terminales en el directorio raíz:

```bash
npm run dev:api
```

```bash
npm run dev:web
```

Abrir **http://localhost:5173**. La API escuchará en **http://localhost:3001/api/health**.

Rutas: `/` inicio; `/explorar` contenido JSON de demostración; `/visor` marcador Homido; `/admin/acceso` puerta administrativa; `/admin` redirige a puerta de acceso. Ninguna acción administrativa está habilitada todavía.

## Alcance de Sprint 1
- Proyecto Vue/Vite/Router y Express, instalable y documentado.
- Contenidos JSON aislados en `content/` detrás de la API de consulta.
- Estructura de admin sin login ni CRUD aún; API admin denegada de forma explícita (401).
- Carpeta experimental para el prototipo técnico Homido de Luis.
- Plan inicial OpenSpec bajo `openspec/`.

**No es una aplicación lista para producción.** La autenticación, autorización, guardado persistente de documentos y pruebas reales de Homido corresponden a trabajo posterior o paralelo.

## Primer flujo con OpenSpec

```bash
npm install -g @fission-ai/openspec@latest
openspec init
openspec validate bootstrap-astrovisor-s1 --strict
```

La instalación crea habilidades/comandos de OpenSpec para la herramienta de IA seleccionada. Ya existe un borrador de especificación en `openspec/changes/bootstrap-astrovisor-s1/`; revisarlo en conjunto antes de usar `/opsx:apply` o equivalente. No reescribir sin revisar trabajo que ya exista en el repositorio de GitHub.

## Git y colaboración

```bash
git init
git add .
git commit -m "chore: base inicial AstroVisor Sprint 1"
```

Crear un repositorio privado o público en GitHub según acuerde el equipo y establecerlo como remoto. Trabajar con ramas `feature/*`, revisiones mediante Pull Request y `main` como rama estable.

## Estructura

```text
frontend/     Vue, rutas y vistas
backend/      Express, adaptador JSON de lectura y prueba
content/      Contenido de demostración en documentos
experiments/  Prueba técnica Homido separada
openspec/     Configuración y propuesta Sprint 1
docs/         Arquitectura y criterios de revisión
```

## Referencias
- `docs/ARQUITECTURA.md`
- `docs/PRUEBA-S1.md`
- `docs/FLUJO-OPENspec.md`
