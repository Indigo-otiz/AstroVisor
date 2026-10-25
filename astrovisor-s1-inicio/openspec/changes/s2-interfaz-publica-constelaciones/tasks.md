# Tareas S2 — Interfaz pública de constelaciones

Responsable: Luis. Periodo académico: 19–23 de octubre de 2026. Estado de esta lista: implementación solicitada por el usuario después de presentar el plan. OpenSpec es seguimiento interno y no forma parte de la evidencia académica solicitada.

## 1. Contenido documental y contrato de lectura

- [x] 1.1 Ampliar los tres registros de `content/recorridos.json` con historia breve y reconocimiento textual, preservando IDs y campos S1; verificar que todos sean demostrativos, legibles y sin fichas de planetas ni recursos institucionales inventados.
- [x] 1.2 Ampliar las pruebas del repositorio documental para comprobar IDs únicos, campos de lectura no vacíos y marcadores de demostración; verificar que `npm test` pase con el contenido real.
- [x] 1.3 Documentar el esquema ampliado y el reemplazo del contenido provisional en `content/README.md`; verificar que el ejemplo coincida con los documentos y con la respuesta de `/api/contenidos/recorridos`.

## 2. Consulta frontend y estados recuperables

- [x] 2.1 Extender `contentService.js` con validación del contrato e implementar reutilización de carga/error/reintento sin respuestas obsoletas; verificar con pruebas controladas de éxito, HTTP fallido, fallo de red, JSON inválido y registro incompatible, usando el runner disponible de Node sin dependencias de producción nuevas.
- [x] 2.2 Implementar carga anunciada, error comprensible con reintento, lista vacía e ID desconocido en listado y detalle; verificar los estados y la recuperación en navegador con condiciones controladas, dejando en `docs/PRUEBA-S2.md` los pasos reproducibles y su naturaleza simulada cuando corresponda.
- [x] 2.3 Incorporar un comando reproducible para ejecutar las pruebas de consumo frontend y documentarlo en el README del proyecto Vue; verificar que el comando ejecute las pruebas reales y reporte los fallos.

## 3. Flujo público e identidad visual

- [x] 3.1 Adaptar inicio y listado a la referencia Figma con componentes/estilos públicos y esquemas SVG de constelaciones; verificar en navegador que las tres fichas provengan de la API y que no se alteren las pantallas de otros integrantes.
- [x] 3.2 Añadir la ficha `/explorar/:id` con resumen, historia y reconocimiento desde los datos, más regreso al listado; verificar apertura desde cada ficha, URL directa, recarga, navegación entre IDs y atrás/adelante del navegador.
- [x] 3.3 Ajustar lectura, foco, navegación con teclado, controles de al menos 48 px y distribución responsiva; verificar 360 px, 1280 px, ampliación de texto al 200 %, ausencia de recortes y estados accesibles, y registrar el resultado real en `docs/PRUEBA-S2.md`.
- [x] 3.4 Registrar en `docs/PRUEBA-S2.md` la referencia Figma y las diferencias acotadas de implementación (detalle como página, sin reproducción ni catálogo); verificar que cada control visible tenga una acción real y que el contenido provisional se identifique.

## 4. Integración y evidencia auténtica

- [x] 4.1 Ejecutar pruebas documentales y de consumo frontend, `npm run build` y comprobación integrada con Vite/Express; verificar el flujo inicio → listado → historia → regreso, la API de lectura, `/visor`, `/admin/acceso`, la redirección de `/admin` y la denegación existente de `/api/admin`, registrando comandos, fecha real y resultados.
- [x] 4.2 Guardar capturas reales en `docs/evidencias/s2/` de listado/detalle en escritorio y móvil y de carga/error; vincularlas desde `docs/PRUEBA-S2.md` con entorno, tamaño, escenario, condición inducida si aplica y versión del código. Verificar cada enlace sin presentar las capturas como prueba de usuarios o de hardware físico.
- [ ] 4.3 Completar la revisión cruzada con otro integrante y registrar su nombre, fecha, versión/commit/PR, observaciones y resultado en `docs/PRUEBA-S2.md`; mantener esta tarea pendiente hasta contar con evidencia auténtica del compañero, sin sustituirla por revisión automática.

## Workflow follow-up

- Presentar estos artefactos y obtener la aprobación del usuario antes de modificar código, según `AGENTS.md`.
- Tras implementar, informar por separado los resultados técnicos y cualquier evidencia humana todavía pendiente; no declarar cumplido el criterio de revisión cruzada si falta.
- Solicitar aprobación antes de archivar este cambio; no archivar ni modificar el estado de los cambios S1 como parte de S2.
