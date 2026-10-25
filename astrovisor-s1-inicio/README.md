# AstroVisor — Base S1 e interfaz pública S2

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

## Interfaz pública Sprint 2

Luis: constelaciones e historias del cielo para visitantes, prioritariamente personas adultas mayores. `/explorar` muestra Orión, Osa Mayor y Escorpio; `/explorar/:id` permite leer la historia y reconocer su figura. Los datos se consultan desde la API documental, con carga, error/reintento, lista vacía y constelación no encontrada. Los textos y los esquemas son demostrativos.

Para ejecutar solo en esta computadora, iniciar la API y la web con estos comandos desde la raíz de este proyecto (en dos terminales):

```bash
node --input-type=module -e "process.env.NODE_ENV='test'; const { app } = await import('./backend/src/index.js'); app.listen(3001, '127.0.0.1');"
npm run dev --workspace frontend -- --host 127.0.0.1 --port 5173 --strictPort
```

Abrir http://127.0.0.1:5173/. La variable `NODE_ENV=test` evita el arranque automático del módulo de la API para enlazarla explícitamente a localhost; no simula sus respuestas.

Verificación técnica:

```bash
npm test
npm run test:web
npm run build
```

`test:web` ejecuta las pruebas de consumo de la API con el runner de Node: contrato real, HTTP/red/JSON fallidos, campos inválidos, lista vacía y recuperación. Las condiciones de fallo de esas pruebas son simuladas. Ver [registro de pruebas S2](docs/PRUEBA-S2.md) para la revisión en navegador, capturas y revisión cruzada pendiente.

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
