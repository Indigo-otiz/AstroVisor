# Proposal

## Why

El visitante necesita utilizar AstroVisor desde una computadora o seguir una demostración proyectada sin visor. S4 adapta el recorrido público existente y prepara contingencias verificables para exposición; la legibilidad en un navegador no acredita legibilidad a distancia ni validación física de Homido.

## What Changes

- Reutilizar inicio, `/explorar` y `/explorar/:id`, con las tres historias, ilustraciones y narraciones S3, sin cuenta ni sensores.
- Añadir una vista para proyección, activada y desactivada expresamente dentro del recorrido público: texto mayor, lectura con ancho limitado, controles visibles y distribución adaptable. Conservar la identidad de S2 y el diseño del resto del equipo.
- Revisar teclado, ratón, foco al navegar y regresar, salto al contenido, controles de audio y transcripciones; corregir únicamente defectos observados dentro del recorrido S4.
- Verificar el recorrido a 360, 1024, 1280, 1920 y 2560 px, resoluciones de referencia 1024×768 y 1920×1080 y ampliación nativa al 200 %. Distinguir siempre viewport configurado, simulación y hardware real.
- Preparar una guía de operación: enlace HTTPS a comprobar, apoyo a Homido, salida a la web 2D, ensayo con equipo real, guion de cinco minutos y video local de respaldo de la experiencia completa. La grabación debe incluir recorrido 2D y visor 3D, controles, retorno y narraciones; identificar qué se capturó en escritorio y qué requeriría teléfono/visor.
- Producir y comprobar el archivo de video durante implementación con las herramientas disponibles; conservarlo fuera de la carga inicial de la aplicación. Si la captura o su audio no son verificables, registrar el pendiente sin sustituir el video por capturas o prometer funcionamiento offline de la web.
- Registrar versión, fecha efectiva, entorno, resultados, incidencias y revisión cruzada. Mantener pendientes las comprobaciones que dependan de proyector, red del recinto, teléfono/Homido u otro integrante hasta recibir evidencia.

### Alcance temporal y exclusiones

Responsable: Luis. Periodo académico base: 2–6 de noviembre de 2026, con apoyo Homido y contingencia 2D el 2–3, ensayo el 4, Expo de cinco minutos el 5 y adaptación completa desde el 6. Esta propuesta se prepara el **9 de noviembre de 2026**, America/Mexico_City: esas fechas son hitos previstos, no actividades realizadas. Toda ejecución nueva llevará su fecha real; los reportes anteriores se registrarán con su fuente y fecha de recepción.

El 9 de noviembre Luis confirmó en este chat que no se han realizado las pruebas ni actividades consultadas del 2–6. Homido S4, ensayo, proyección, enlace HTTPS y revisión cruzada S4 se mantienen pendientes; el guion de Expo queda disponible para ensayo o presentación posterior, sin atribuir participación el 5 de noviembre.

No incluye rediseño general, nueva aplicación, PWA/caché offline, nuevas constelaciones, modificación de mirada/óptica, resolución de versiones, CRUD, autenticación nueva ni despliegue en un proveedor nuevo. Los cambios de S1/S2/S3 permanecen independientes y no se archivan por preparar S4. OpenSpec es seguimiento interno, separado de guía, informe y evidencias académicas.

## Capabilities

### New Capabilities

- `presentacion-web`: adaptación del recorrido público a computadora y proyección, interacción accesible, contingencias y aceptación con evidencia trazable.

### Modified Capabilities

Ninguna especificación principal: `openspec list --specs --json` devuelve inventario vacío. Se complementan los requisitos abiertos de `exploracion-constelaciones` y `narraciones-constelaciones`, conservando sus contratos; no se duplican sus reproductores ni historias.

## Impact

- Objetivo: `astrovisor-s1-inicio/` (Vue/Vite + Express); `DEMO/astrovisor-inicio/` es otra aplicación y queda fuera del cambio.
- Frontend: `src/App.vue`, `src/public.css`, vistas públicas y componentes existentes según hallazgos; módulo pequeño de estado de presentación solo si facilita la integración. El estilo ampliado no se aplica a administración ni al canvas Homido.
- Contrato conservado: `GET /api/contenidos/recorridos`, medios locales y protección del servidor de `/api/admin`. La web 2D sigue necesitando el frontend, la API y sus recursos; no equivale a una aplicación offline.
- Guía prevista `docs/GUIA-S4-EXPO.md`, registro `docs/PRUEBA-S4.md`, evidencias en `docs/evidencias/s4/` y video local con ruta y hash registrados. No incorporar credenciales, datos administrativos ni material externo sin procedencia.
- Validación: suites existentes de backend/frontend y build; revisión visual y funcional del build servido, recuperación ante fallos y archivo de respaldo abierto sin conexión. Pruebas automatizadas nuevas únicamente para comportamiento que lo justifique.
- Dependencias sin confirmar: URL HTTPS, equipo y proyector/pantalla, sonido, condiciones de luz/red, captura audiovisual disponible y revisor del equipo. S3 contiene aceptación de octubre; esa evidencia no acredita el ensayo ni la Expo de noviembre.

Estado al 10/11: plan aprobado mediante «continua»; adaptación implementada, regresión técnica y respaldo audiovisual verificados localmente. Se completó zoom nativo 200 % con 6/6 combinaciones aprobadas. La aceptación permanece pendiente de pruebas físicas y revisión cruzada; ver `docs/PRUEBA-S4.md`. No se archiva el cambio.

Decisión posterior de Luis del 10/11: dejar pendientes las pruebas físicas, el ensayo y la revisión cruzada por no considerarlos necesarios para el trabajo inmediato. Se concluye el trabajo técnico actual y se conservan las cuatro actividades pendientes para retomarlas cuando lo indique. No se modifica el contrato de aceptación ni se atribuyen pruebas realizadas.

Aclaración siguiente de Luis del 10/11: Homido y pantalla ya se revisaron y funcionan correctamente. Se registra esta validación funcional reportada y se mantienen sin especificar fecha de ejecución, equipos, versión y pasos del protocolo. Ensayo cronometrado y revisión cruzada identificada siguen diferidos; ver la constancia en `docs/evidencias/s4/validacion-reportada.json`.
