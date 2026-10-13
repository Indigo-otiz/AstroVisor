# Registro de comprobaciones — 12 de octubre de 2026

## Entorno observado

Windows, PowerShell, Node 24.21.0, npm 11.0.0. Dependencias bloqueadas en `package-lock.json`; Vite instalado 7.3.7. Se preservaron los cinco documentos iniciales. No se hicieron commits, cambios remotos ni despliegues.

## Resultados ejecutados

| Comando / comprobación | Resultado |
| --- | --- |
| `npm install` | Primer intento bloqueado por modo de caché. El intento con red encontró ECONNRESET. Reintento con `--prefer-offline --fetch-retries=3` terminó con código 0, 179 paquetes añadidos y auditoría de npm sin vulnerabilidades reportadas. |
| `npm run build` | Código 0. API TypeScript y web TypeScript/Vite compiladas. |
| `npm test` | Código 0, 3 pruebas aprobadas, 0 fallidas. |
| `npm run dev` | API en 3001 y Vite en 5173 iniciados; el smoke consultó ambos mediante el proxy. |
| `npm run smoke` | Código 0. Chrome headless: proxy, WebGL, selección de Marte, controles, nueve cambios de selección, un solo canvas tras cada cambio, vistas móviles de 390 y 320 px sin desbordamiento, fallo de petición y reintento. Sin excepciones JavaScript detectadas. |
| Inspección de capturas | Revisadas imágenes de escritorio y móvil, incluyendo 320 px. Ajustado espacio entre escena, instrucciones y controles; repetido smoke después del ajuste. |
| Detector de diseño Impeccable | Código 0; devolvió `[]` sobre los archivos de UI. No equivale a una auditoría completa de accesibilidad. |

Las pruebas iniciales de contrato se ejecutaron antes de completar los endpoints y la validación: fallaron con HTTP 404 y con falta de rechazo del catálogo vacío. Después de completar los contratos, aprobaron. Se añadió una prueba del endpoint consumido, propagación de señal de cancelación, respuesta válida e IDs duplicados.

## Advertencia y límites

- Vite reporta un chunk JavaScript de **728,88 kB**, **197,12 kB gzip**, superior al umbral de 500 kB. No bloquea la compilación. Se conserva la advertencia; queda pendiente evaluar carga diferida si aumenta el alcance.
- El navegador integrado no respondió. Se usó Chrome headless local, protocolo CDP y WebGL por software como alternativa. No se midió el rendimiento de una GPU física.
- El smoke simula el fallo de API bloqueando la petición de catálogo en el navegador; no apaga el proceso API. El README incluye el procedimiento manual para apagarlo y comprobar el caso real.
- Los controles se accionaron desde el navegador automatizado. No se hizo una sesión de gestos táctiles en un dispositivo físico ni una auditoría con lector de pantalla.
- Se revisó el código de liberación y se comprobaron cambios repetidos sin acumulación de elementos canvas. No se hizo un perfil prolongado de memoria/GPU ni se afirma ausencia absoluta de fugas.
- No se verificaron teléfono físico, sensores, VR ni Homido. No están implementados en esta etapa.
- Las restricciones del sandbox bloquearon inicialmente procesos hijos (`EPERM`); durante la instalación incompleta hubo `EBUSY`. Las ejecuciones autorizadas posteriores de build, suite y smoke terminaron correctamente. No queda un bloqueo para estas comprobaciones locales.

## Archivos añadidos

- Raíz: `package.json`, `package-lock.json`, `.gitignore`, `README.md`.
- API: `apps/api/package.json`, `tsconfig.json`, `src/app.ts`, `src/server.ts`, `src/planets.ts`.
- Web: `apps/web/package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/PlanetScene.tsx`, `src/planets.ts`, `src/styles.css`.
- Pruebas: `tests/api.test.ts`, `tests/planets.test.ts`, `tests/browser-smoke.mjs`.
- Documentación: `docs/PLAN_ETAPA_1.md`, `docs/DECISIONES.md`, `docs/VERIFICACION.md`.

Artefactos locales excluidos por `.gitignore`: dependencias, compilados y `test-results/` (capturas y perfiles de Chrome). Los documentos originales `AGENTS.md`, `DEMO_BRIEF.md`, `LEEME_INICIO.md`, `PROMPT_01_CODEX.md` y `PROMPT_02_OPCIONAL.md` no se modificaron.
