# AstroVisor · Demo técnica, Etapa 1

Demostración local del flujo **React → HTTP → Express → catálogo en memoria**, con una escena Three.js. Conserva los documentos de inicio originales.

## Requisitos e instalación

Usar **Node.js 24**: esta es la línea recomendada para reproducir el entorno de esta demo. Las comprobaciones de esta sesión usan Node **24.21.0** y npm **11.0.0**. [Requisitos oficiales de Vite](https://vite.dev/guide/).

En PowerShell, desde la carpeta `DEMO`:

```powershell
cd astrovisor-codex-inicio
npm install
npm run dev
```

Con `package-lock.json` disponible, `npm ci` reproduce las versiones bloqueadas. La primera instalación necesita internet; la ejecución usa recursos locales. No hay imágenes, fuentes remotas ni claves.

| Servicio | URL |
| --- | --- |
| Frontend | http://127.0.0.1:5173 |
| Salud de API | http://127.0.0.1:3001/api/health |
| Catálogo de API | http://127.0.0.1:3001/api/planets |
| API mediante proxy Vite | http://127.0.0.1:5173/api/planets |

`Ctrl+C` detiene ambos procesos. Vite exige el puerto 5173; si está ocupado, libera ese puerto antes de iniciar. La API escucha solamente en la máquina local, puerto 3001.

Para probar el fallo de API, abre **dos terminales** en esta carpeta:

```powershell
# Terminal 1
npm run dev:api
```

```powershell
# Terminal 2
npm run dev:web
```

## Compilación y pruebas

```powershell
npm run build
npm test
```

Con `npm run dev` ejecutándose en otra terminal, la comprobación de navegador es:

```powershell
npm run smoke
```

Este smoke usa Chrome headless instalado en `C:/Program Files/Google/Chrome/Application/chrome.exe`. Si la ruta es distinta, establece `$env:CHROME_PATH = 'ruta/al/chrome.exe'` antes de ejecutarlo. Necesita el puerto de depuración `9223` libre. Guarda capturas y un perfil temporal de Chrome en `test-results/`, que se excluye del repositorio. Usa renderizado WebGL por software; no mide rendimiento de la GPU ni demuestra compatibilidad con un teléfono físico.

`build` compila TypeScript de la API a `apps/api/dist` y genera la web en `apps/web/dist`. `test` verifica endpoints por HTTP, campos del catálogo, rutas desconocidas y rechazo de respuestas vacías o inválidas. No necesita que la API de desarrollo esté encendida.

Resultados de esta sesión: build aprobado, 3/3 pruebas y smoke aprobado. Vite advierte que el bundle JavaScript supera 500 kB; el build final produjo 728,88 kB (197,12 kB gzip). Detalles y límites en `docs/VERIFICACION.md`.

Para ejecutar los artefactos compilados, usa dos terminales:

```powershell
# Terminal 1
npm run start:api
```

```powershell
# Terminal 2
npm run preview
```

La vista previa está en http://127.0.0.1:4173 y también usa proxy `/api`. Es una vista previa local, no un despliegue de producción.

Comprobación manual en PowerShell:

```powershell
Invoke-RestMethod http://127.0.0.1:3001/api/health
Invoke-RestMethod http://127.0.0.1:3001/api/planets
Invoke-RestMethod http://127.0.0.1:5173/api/planets
```

## Qué mostrar en la revisión (5 minutos)

1. Abre la web, espera el catálogo y selecciona **Marte**. La ficha, el tamaño y el color de la esfera cambian sin recargar la página.
2. Arrastra la escena, usa la rueda o pellizca para zoom. También hay botones utilizables con teclado para girar, acercar, alejar, activar/pausar rotación y restablecer la cámara.
3. En herramientas del navegador → **Network/Red**, recarga y filtra por `planets`. Muestra la respuesta de `GET /api/planets`; compara `nombre`, `radioVisual` y `colorVisual` con la ficha. El enlace **Ver datos JSON** abre ese mismo endpoint mediante el proxy.
4. Enseña `apps/api/src/planets.ts`: es la única fuente del catálogo. `apps/web/src/planets.ts` contiene el contrato y la petición, sin un arreglo de planetas. Como demostración adicional, cambia una descripción en la API, guarda y recarga la web para observar el dato nuevo; después restaura el texto.
5. Con procesos separados, detén solo la API y recarga la web: aparece un error y un botón para reintentar. Enciende de nuevo la API y pulsa **Reintentar conexión**.
6. Usa un viewport móvil del navegador y navega por selector, ficha y controles. Explica los límites de esta etapa.

El catálogo se consulta al cargar y al reintentar; la selección usa los datos ya recibidos. Detener la API después de cargar no borra ese catálogo: hay que recargar para demostrar el fallo de conexión.

## Estructura y límites

- `apps/api`: aplicación Express, catálogo y arranque.
- `apps/web`: React, cliente de API, escena y estilos.
- `tests`: pruebas locales.
- `docs/DECISIONES.md`: decisiones, restricciones y pendientes para D3.
- `docs/VERIFICACION.md`: resultados ejecutados y verificaciones pendientes.

Los colores, radios y patrones de superficie son ilustrativos, **no medidas ni mapas reales**. Se generan estrellas y superficie con código, sin assets externos. El navegador necesita WebGL para la escena; si no puede iniciarlo, muestra un mensaje y conserva la ficha.

Esta entrega no implementa PostgreSQL, registro, autenticación, administración, préstamos ni VR. **La esfera de escritorio no prueba compatibilidad con Homido.**
