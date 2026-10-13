# Decisiones — Etapa 1

## Stack provisional y estructura

- React + Vite + TypeScript para la interfaz; Three.js directo y OrbitControls para el visor.
- Node.js + Express + TypeScript; `tsx watch` durante desarrollo.
- npm workspaces en `apps/web` y `apps/api`; `concurrently` inicia y detiene ambos procesos con un comando.
- Catálogo en memoria, solo en la API. El frontend valida la respuesta antes de mostrarla. No se crea PostgreSQL.
- Proxy Vite `/api` hacia `127.0.0.1:3001`, tanto en desarrollo como en vista previa. No hace falta configurar CORS para estos flujos locales.
- Node 24 para reproducir esta demo; el entorno observado tiene 24.21.0.

## Decisiones de implementación

La escena y la ficha son el centro de la página. Se elige un fondo oscuro, texto claro y acento cálido. En móvil, la ficha queda debajo de la escena. Son decisiones de implementación a partir del alcance solicitado, no preferencias estéticas confirmadas por el equipo.

El catálogo incluye texto didáctico de ejemplo. Radios, colores y patrón generado son valores de demo. No hay texturas reales, imágenes, videos ni fuentes descargadas al ejecutar.

Una escena se crea para cada selección. Al cambiar o desmontar, se detienen frames, se desconecta ResizeObserver, se eliminan listeners, se liberan controles, geometrías, materiales, textura y renderer. React StrictMode permanece activo para exponer problemas de ciclo de vida en desarrollo. La inspección del código no sustituye un perfil de memoria prolongado.

La rotación automática empieza desactivada. Los botones ofrecen alternativa al gesto de arrastrar y a la rueda. La ficha usa `aria-live`; estados de carga/error tienen roles accesibles. No hay validación formal completa de accesibilidad todavía.

La petición tiene un límite de 10 segundos, cancelación al desmontar y reintento explícito. Un catálogo vacío o inválido se trata como error. Un fallo de WebGL conserva el contenido textual. Se limita el pixel ratio a 2 y el catálogo visual es pequeño para esta demo.

## Restricciones

Sin cuentas, administración, autenticación, CRUD, préstamos, servicios cloud, pagos ni secretos. Sin cambios en repositorios remotos ni despliegue. No se ha validado VR, sensores, vista estereoscópica ni Homido.

## Pendientes para D3, por prioridad

1. Ejecutar el guion en la computadora y navegador de la presentación, incluida selección de Marte, vista móvil y recuperación después de apagar la API.
2. Revisar contenido didáctico, guion oral y reparto de roles con el equipo; definir criterios de aceptación de las etapas siguientes.
3. Planificar después de la revisión las pruebas independientes de PostgreSQL y de teléfono/Homido real. Registrar HTTPS, permisos y compatibilidad antes de afirmar resultados.

## Referencias técnicas consultadas

- [Vite: guía y requisitos](https://vite.dev/guide/).
- [Three.js: OrbitControls](https://threejs.org/docs/pages/OrbitControls.html).
- [Three.js: ciclo de vida de controles](https://threejs.org/docs/pages/Controls.html).

Los resultados de ejecución y bloqueos se registran en `VERIFICACION.md`.
