# Propuesta S2 — Interfaz pública de constelaciones e historias del cielo

## Why

Luis necesita entregar en el Sprint 2 una experiencia pública que permita a personas adultas mayores explorar constelaciones y leer historias breves desde el navegador, sin visor ni registro. La base S1 ya consulta tres registros JSON, pero solo muestra resúmenes: faltan las historias, la navegación a una ficha completa y la adaptación a la referencia de Figma.

## What Changes

- Ampliar el flujo público existente con un listado de constelaciones y fichas de detalle con historias breves, instrucciones para reconocer la figura y retorno al listado.
- Mantener los registros de Orión, Osa Mayor y Escorpio, incorporando texto demostrativo reemplazable desde JSON y representaciones esquemáticas de estrellas sin planetas ni Sistema Solar.
- Adaptar las pantallas públicas a la referencia Figma compartida: fondo crema, azul oscuro, acento amarillo, texto grande, controles legibles y composición responsiva.
- Mejorar los estados de carga, error con reintento, lista vacía y constelación no encontrada, consumiendo realmente la API existente.
- Preparar comprobaciones, capturas auténticas de escritorio/móvil y un registro de evidencia y revisión por otro integrante. La revisión humana solo se marcará completa cuando exista su resultado.

Fuera de alcance: autenticación, CRUD, panel administrativo, experiencia Homido/VR, audio o video funcional, catálogo bibliográfico, préstamos, base de datos, despliegue y modificaciones al prototipo React de `DEMO/`. Los enlaces existentes a otros módulos se conservan, pero sus pantallas no se rediseñan.

El contenido es provisional hasta recibir material autorizado de la biblioteca. El flujo público no depende de teléfono con sensores ni de visor; las comprobaciones de usabilidad con personas adultas mayores y la revisión de un compañero no se sustituyen por pruebas técnicas. OpenSpec es documentación interna y no es el entregable académico.

## Capabilities

### New Capabilities

- `exploracion-constelaciones`: listado y lectura de fichas e historias públicas, datos documentales, estados recuperables y navegación accesible en móvil y escritorio.

### Modified Capabilities

Ninguna especificación principal: `openspec list --specs --json` devuelve un inventario vacío. Los cambios S1 `bootstrap-astrovisor-s1` y `prueba-tecnica-homido-s1` están abiertos; se reutilizan sus rutas y contrato de lectura, sin archivarlos, reescribir sus requisitos ni duplicar la inicialización del proyecto.

## Impact

- Proyecto objetivo: `astrovisor-s1-inicio/` (Vue, Vite, Vue Router y Express).
- Frontend: inicio, exploración, nueva vista de detalle, componentes públicos, servicio de contenido, rutas y estilos acotados al flujo público. Los cambios necesarios en la envoltura compartida deberán preservar la presentación de visor y administración.
- Contenido: ampliación aditiva de `content/recorridos.json`, conservando IDs, `titulo`, `resumen`, `demostracion`, `libros` y `multimedia`.
- API: se conserva `GET /api/contenidos/recorridos`, sin nuevo endpoint ni escritura. La capa documental existente sigue siendo la fuente de lectura.
- Validación y evidencia: pruebas del contrato documental y del consumo frontend, build, revisión en navegador y futura documentación en `docs/PRUEBA-S2.md` con capturas y revisión humana trazables.
- No se prevén dependencias nuevas de producción ni un procesador Markdown: JSON satisface el almacenamiento documental solicitado y ya está integrado.

Referencia visual: https://www.figma.com/make/1JNE45ayMot6p5VclicI3F/AstroVisor-design-setup?code-node-id=0-6&fullscreen=1

Estado: implementación solicitada por el usuario después de presentar el plan; ver tareas y evidencia técnica. Luis confirmó el 25 de octubre de 2026 la aprobación presencial de Índigo, responsable de las pruebas manuales y automatizadas; la constancia está en docs/PRUEBA-S2.md. Periodo académico: 19–23 de octubre de 2026; la fecha real de cada comprobación se registrará sin retrocederla al periodo del sprint.
