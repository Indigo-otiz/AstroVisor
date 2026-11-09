# Design — S4

Estado vigente: Etapa 1 publicada como `735fd4b1413e5cd98387e297716f3d4c76cac52d`; Etapa 2A publicada como `3bf81dd03e320b6207d6b053f5ee2862cd325371`. Publicación de Etapa 2B y su corrección autorizada tras revisión final sin bloqueantes: guardado, API documental y respaldos privados. Sin merge ni archivo. Base main original `f1058c9b10641c470d7d3e331a81f327af78fc8c`. Formularios, portadas dinámicas, migración de lectores y exports siguen pendientes.

## Decisiones de ejecución de Etapa 2B

Corrección autorizada del hallazgo de auditoría: restauración conserva resultado confirmado tras rename y comunica aparte limpiezaPendiente/codigoLimpieza; error previo conserva confirmada=false y su código aunque también falle liberar. CLI distingue salida 0, salida 2 confirmada con intervención (NO repetir automáticamente) y salida 1 no confirmada. Ocho regresiones nuevas correctas; sin cambios a guardar/cerrar ni eliminación forzada de locks activos. Usuario autorizó posteriormente commit/push de esta etapa corregida. Ver evidencia en `docs/PRUEBA-S4-ETAPA2B.md`.

- `documentWriter.js` adquiere `escritor.lock` con creación exclusiva por vida del escritor; PID/host/nonce y cola interna. `control.lock` breve serializa alta y retiro de bloqueo abandonado. Arranque ejecutable adquiere antes de escuchar; `crearApp()` expone inicio/cierre explícitos y también exige adquisición al primer guardado. Segunda instancia falla cerrada; no se borra un lock por timeout.
- Comparación global de revisión dentro de la cola y del lock. Backup privado validado `{sha256,catalogo}` antes del temporal, sync/cierre y rename en el mismo directorio. Confirmación en rename; errores posteriores de sync/poda se devuelven como avisos, sin falso 503 ni simular reversión. Seis intentos máximos Windows para EPERM/EACCES/EBUSY, sin borrar destino. Retención de 20 copias válidas solo tras confirmar; ante fallo se conservan copias/evidencia y se avisa.
- ETag fuerte `"catalogo-N"`; If-Match exacto, sin wildcard/listas. POST 201, PATCH 200; errores 400/401/404/409/412/428/503. 403 reservado porque toda sesión 2A corresponde a la única cuenta administrativa completa; no se crea un rol adicional.
- Libro PATCH: titulo/autor/anio/enlacePublico/tema/relaciones. Recorrido PATCH: titulo/resumen/historia/comoReconocerla/libroRefs. IDs, demo, MARC, audio, transcripción, créditos, permisos, portada existente y metadatos desconocidos no son editables. Las relaciones son upsert de motivo, conservando los nueve vínculos y metadatos anteriores. Historia distinta con audio: 409.
- Ruling: creación sin generación dinámica — POST requiere SVG estático preexistente regular `/libros-demo/<id>.svg`, con el mismo ID; falta de activo: 409. No genera portadas ni reutiliza la de otro ID. El operador deberá revisar correspondencia visual/procedencia de cualquier activo futuro. Alta inicial siempre demo con MARC demo y ubicación/signatura null. La prueba de POST usa catálogo temporal sin uno de los libros originales, para reutilizar su portada correcta sin crear archivos públicos.
- Restauración exclusivamente local con API detenida: comando `scripts/recuperar-catalogo.mjs`, basename permitido, hash/esquema/relaciones validados, evidencia del archivo activo y respaldo adicional si sigue válido. Nueva revisión superior a límites conocidos; sin semilla. Lock abandonado se retira solo con mismo host/PID ausente comprobado. `control.lock` huérfano o ilegible requiere intervención offline; no se retira automáticamente.
- Filesystem probado: NTFS local de C:, Windows/Node 24.21.0. Las pruebas de interrupción de proceso no equivalen a apagado/disco perdido. Sync de directorio, ACL y volumen destino, así como copia externa real, siguen pendientes operativos. Exclusión en filesystems de red/multihost no validada. Procedimiento, fallos y pruebas: [PRUEBA-S4-ETAPA2B.md](../../../docs/PRUEBA-S4-ETAPA2B.md).
- Lectura pública sigue proyectando runtime; el frontend estático y respaldo Homido no se sincronizan en esta etapa. Las respuestas de escritura indican `respaldoPublico: pendiente`. No se cambian SVG, mirada, renderer, audio, auth ni formularios.

## Decisiones de Etapa 2A

- Una cuenta administrativa explícita en `ASTROVISOR_ADMIN_FILE`, archivo JSON privado externo al checkout. Sin archivo válido se deniega autenticación con 503, sin defaults ni cuentas activadas por NODE_ENV, npm o argumentos de pruebas.
- Scrypt nativo asíncrono: N=131072, r=8, p=1, sal aleatoria de 16 bytes, derivado de 64 bytes; parámetros fijos validados y comparación con `timingSafeEqual`. SHA-256 solo resume identificador de usuario/configuración; no sustituye el hash de contraseña. Máximo dos verificaciones costosas simultáneas.
- Generación exclusivamente local con `npm run configurar:admin`: contraseña oculta en TTY, confirmación, sin argumentos/env de contraseña ni salida de hashes. Publicación exclusiva de archivo completo sin sobrescribir. Archivo solo con identidad, sal, parámetros y hash, permisos 0600 solicitados; ACL Windows bajo control operativo.
- Sesiones Express en memoria: token aleatorio de 32 bytes, ocho horas, máximo 256; logout/expiración invalidan token. Cada ruta protegida revalida la huella de configuración: rotación o retirada revoca sesiones; reinicio pierde sesiones. No hay CRUD nuevo; rutas administrativas desconocidas ahora responden 404 después de autorización.
- Login: cinco intentos por IP/15 min antes de derivar, 429 con Retry-After, mapa limitado a 1000 IP. Express mantiene trust proxy desactivado; no confiar en X-Forwarded-For. El límite y las sesiones son de una instancia, no distribuidos.
- No consultas REST Supabase, contraseñas en URL ni cuenta demo de producción. Rutas admin rechazan query strings y envían Cache-Control no-store. Login/sesión/logout no generan logs de petición; rutas desconocidas pueden registrar estado y marcador de ruta, sin URL cruda, cuerpo o mensaje de error con datos. Configuración ausente, inválida o falla de almacenamiento se deniega con respuesta genérica.
- Vue conserva formulario y contrato JSON/bearer. No recortar contraseña; token solo en memoria/sessionStorage de pestaña, retirar dato legado de localStorage. No confiar en usuario almacenado: guard async consulta Express. Logout limpia cliente aun si red falla; respuesta tardía de sesión no reabre acceso. Lectura opcional `fichas_libros` del panel queda intacta por estar fuera del alcance.
- Sin configuración real de cuenta ni cambios de ACL/despliegue en esta entrega. Revisión del informe por el usuario recibida; HTTPS, ACL del archivo, calibración de costo en servidor destino y navegador/TTY físicos siguen pendientes operativos. Riesgo residual: sessionStorage es accesible a JS; esta etapa no migra a cookies HttpOnly ni añade protección global frente a XSS.

Procedimiento, pruebas y límites: [PRUEBA-S4-ETAPA2A.md](../../../docs/PRUEBA-S4-ETAPA2A.md). Las secciones históricas siguientes no autorizan otras etapas.

## Decisiones de Etapa 1 y registro de ejecución

- Semilla: `content/catalogo-inicial.json`, versionada. Runtime: `ASTROVISOR_DATA_DIR/catalogo.json`, directorio absoluto externo al checkout. Se verifica destino real para rechazar enlaces hacia el checkout. No se crea ni configura almacenamiento de despliegue durante esta entrega; pruebas en temporales aislados.
- Inicialización: `npm run init:catalogo`, explícita. Temporal privado, flush/cierre y publicación con hard link exclusivo; un destino existente válido o corrupto produce EEXIST sin sobrescribir. No hay copia automática al arrancar ni fallback silencioso a semilla.
- Lectura: cada petición lee/valida runtime. Sin configuración o documento válido, error controlado. Configurar e inicializar antes de ejecutar API; no modificar `.env` real desde esta tarea.
- Ruling: selección pública compatible — tres libros únicos, nueve `libroRefs` con motivo y recursos completos en `multimedia`. Solo las relaciones con metadatos `referencia` se proyectan al contrato previo `recorridos[].libros`, para reproducir exactamente la selección anterior de Homido. Título, autor, año y URL se toman del libro único; otros metadatos de esa referencia se conservan en la relación.
- `GET /api/contenidos/libros` reconstruye el catálogo completo y sus nueve recomendaciones; filtro `constelacionId` añade motivo. No añadir IDs ni otras claves al arreglo de recorridos existente durante esta etapa. Se mantienen rutas Vue y módulos Homido.
- Ruling: transición de lectores — backend deja de leer los dos JSON antiguos en runtime. Permanecen fixtures de migración con tests de igualdad de proyecciones. La estantería mantiene temporalmente el import estático hasta conectar el adaptador API en otra etapa; no declarar edición pública dinámica implementada ni mantener doble escritura. La sincronización del respaldo queda pendiente.
- Validación: esquema/versión/revisión, IDs, relaciones, libros vinculados, URLs HTTPS, claves peligrosas, SVG locales existentes, recursos y transcripción/relato. Metadatos desconocidos preservados internamente; nueva proyección pública de libros limitada a campos conocidos.
- El hard link requiere sistema de archivos compatible; probado en el entorno local, pendiente en despliegue. Modos POSIX 0700/0600 no reemplazan ACL en Windows. No hay escritura de ediciones ni respaldo administrativo hasta la siguiente autorización.

Las secciones posteriores conservan el diseño del MVP completo y su comparación histórica; no amplían Etapa 1. La identidad ya fue decidida por el usuario y el alojamiento independiente dejó de ser condición de esta etapa. La corrección bibliográfica descrita como propuesta ya está aplicada en PR #6.

## Context

Ver `proposal.md` y [validación #6](../../../docs/VALIDACION-PR6.md). `documentRepository.js` lee un arreglo de recorridos en cada petición; el catálogo de #6 se compila en frontend. El panel no tiene CRUD. Las sesiones Express existen, pero el proveedor de credenciales usa la tabla REST `admin`. No se comprobó RLS ni el servicio real.

## Goals / Non-Goals

**Goals:** un administrador autorizado edita campos explícitos; un guardado confirmado puede leerse de nuevo después del reinicio y desde web/Homido; las relaciones y los metadatos se conservan; no se requiere recompilar la web para observar cambios online.

**Non-Goals:** multirréplica, edición colaborativa en tiempo real, préstamo, eliminación, catálogo institucional ficticio, nueva base de datos, rediseño, regeneración de voz o administración de usuarios. Un sitio totalmente estático tiene una copia de una revisión concreta, no acceso a cambios futuros sin nueva exportación.

## Decisions

### 1. Una instantánea JSON y proyecciones compatibles

Separar las siguientes ubicaciones; las rutas de despliegue concretas están pendientes de confirmación:

| Ubicación | Uso y protección |
|---|---|
| `content/catalogo-inicial.json` (propuesto, versionado) | Semilla demo revisada para inicialización; nunca almacén editable en producción |
| `<ASTROVISOR_DATA_DIR>/catalogo.json` | Única fuente editable de ejecución, volumen persistente privado externo al checkout y a cualquier raíz pública |
| `<ASTROVISOR_DATA_DIR>/backups/`, temporales y lock | Estado administrativo privado, fuera de Git y de toda distribución web |
| Configuración privada de identidad, si se elige opción local | Ruta de secretos separada del catálogo y sus exports, fuera de Git y web; acceso restringido al servicio |
| `<ASTROVISOR_PUBLIC_EXPORT_DIR>/revisiones/<revision>/` | Copia pública derivada y filtrada, externa al checkout; servidor estático independiente con acceso de solo lectura |

Arranque normal: exigir runtime existente y válido; si falta, falla lectura/escritura con instrucción de inicialización, sin copiar semilla automáticamente. Inicialización mediante comando explícito, con bloqueo y creación exclusiva que rechaza un destino existente, incluso corrupto. Un reinicio, nueva build o actualización de semilla no reemplaza runtime. Las migraciones son explícitas, con backup y revisión de esquema. Añadir exclusiones defensivas a Git, pero un `.gitignore` no sustituye la separación física ni los permisos.

La estructura de la única instantánea editable es:

```text
schemaVersion: 1
revision: entero creciente, administrado por servidor
recorridos: [campos actuales excepto libros incrustados,
             libroRefs: [{ libroId, motivo, metadatos de la relación }],
             multimedia: [recursos actuales completos]]
libros: [{ id estable, titulo, autor, anio, enlacePublico,
           demostracion, marc21, portada, recursos: [] opcional,
           metadatos existentes adicionales }]
```

Se conservan `multimedia`, autoría, transcripción, permisos y campos desconocidos de cada registro. Recursos bibliográficos opcionales usan identificador, tipo, URL y procedencia; no se crea un registro global de recursos si no lo exige el contenido. Un recurso ausente no se convierte en disponibilidad física.

`GET /api/contenidos/recorridos` sigue devolviendo el arreglo esperado; `libros[]` se genera a partir de IDs y referencias, con los campos antiguos `titulo`, `autor`, `url`, etc. Añadir `id` estable a cada libro proyectado sin retirar claves que ya consumen web/visor. `GET /api/contenidos/libros?constelacionId=...` devuelve libros con motivos y alias de portada necesarios para #6. No modificar las rutas web existentes.

Alternativas consideradas: dos archivos editables independientes requieren coordinar commits para relaciones; conservar tres fuentes perpetúa la divergencia. Una instantánea pequeña permite publicar relaciones, libros y recursos con un solo reemplazo. No se propone SQL/MongoDB.

### 2. Migración sin descartar información

Preparar la semilla versionada desde `content/recorridos.json` y `frontend/src/data/libros-demo.json`; inicializar runtime solo mediante acción explícita sobre destino ausente. Conservar copia íntegra de entradas en el respaldo privado de migración. Mantener los IDs `star-lore`, `field-stars`, `half-hours` y las tres constelaciones. Importar las nueve recomendaciones del catálogo #6 como relaciones; mantener etiqueta/aclaración bibliográfica como metadatos de relación. Unir solo las tres coincidencias conocidas; rechazar coincidencias ambiguas.

#### Corrección bibliográfica propuesta, todavía sin aplicar

Conservar el reporte original de divergencia en `docs/VALIDACION-PR6-S4.md`. La revisión externa adicional comprobó que las URLs del JSON canónico y `content/BIBLIOGRAFIA.md` apuntan a obras distintas: [39064](https://www.gutenberg.org/ebooks/39064) identifica *Hegel’s Philosophy of Mind*; [40292](https://www.gutenberg.org/ebooks/40292) identifica *Paris Vistas*. Igualar el respaldo a esos valores no corrige la referencia bibliográfica.

| Libro | Referencia existente seleccionada como candidata | Verificación y cambio propuesto |
|---|---|---|
| `star-lore` | `https://archive.org/details/starloreofallage00olco`, ya presente en respaldo | [Internet Archive](https://archive.org/details/starloreofallage00olco) identifica obra y autor Olcott. Proponer este mismo enlace para bibliografía, JSON canónico, catálogo #6 y futura semilla/runtime |
| `half-hours` | ID Gutenberg `23300`, ya presente en respaldo por HTTP | [Ficha HTTPS verificada](https://www.gutenberg.org/ebooks/23300) identifica título y autor Proctor. Proponer esa URL HTTPS verificada para los mismos consumidores y respaldo; no fabricar otro ID |

La selección candidata requiere confirmación del usuario/responsable bibliográfico antes de modificar fuentes. El enlace HTTP original de `23300` no pudo recuperarse directamente en esta revisión; la ficha HTTPS sí se consultó. No se cambian años, ediciones, licencias ni avisos institucionales por deducción de la página. Después de aprobación, corregir juntos `content/BIBLIOGRAFIA.md`, `content/recorridos.json`, `frontend/src/data/libros-demo.json` y `frontend/public/prueba-homido/data/recorridos-demo.json`; luego generar semilla/exports y ejecutar pruebas de igualdad **y correspondencia título-autor-URL**. La igualdad de archivos por sí sola no certifica bibliografía.

Comparar fixtures antes/después y conservar campos adicionales aunque el formulario no los muestre. Si fuentes coinciden en ID pero discrepan en otro campo, detener migración y reportar la colisión; no sustituir autoría/licencias por valores inventados.

Tras migrar, los JSON anteriores dejan de ser fuentes de runtime: no hay doble escritura. Se conservan como fixtures/entrada de migración identificados o se retiran los imports una vez actualizados sus consumidores y pruebas. Mantener solo un catálogo editable.

### 3. Modelo de libros y portadas

**Corte implementado 3B:** conservar `schemaVersion: 1`, sin migrar ni reescribir semilla/runtime al arrancar. Libro antiguo sin `portada`: mantiene `/libros-demo/<id>.svg`. Libro generado: `portada: { tipo: 'ilustrativa', plantilla: 'cielo'|'guia'|'relatos', paleta: 'azul'|'verde'|'violeta', procedencia, textoAlternativo }`, con los dos últimos campos derivados por servidor; `portadaIlustrativa` privado contiene `/api/contenidos/libros/<id>/portada.svg` sin revisión. GET administrativo y proyección pública añaden `?revision=N` vigente, sin persistir una URL obsoleta. Campos desconocidos de libros/relaciones permanecen intactos.

POST acepta parámetros cerrados, no `src`, markup ni rutas con plantilla. Mantiene alta estática anterior con SVG existente del mismo ID, sin crear archivos. UI nueva solo ofrece plantillas. MARC nuevo siempre `DEMO-<id>`/`DEMO`, ubicación/signatura null. No añadir referencias al contrato Homido: incorporación pendiente de Etapa 4. Título/autor de cualquier ficha, incluidos libros nuevos, siguen en solo lectura en panel hasta adaptar Homido. PATCH Express previo no se amplía: si se cambia título generado mediante ese contrato, se valida ajuste y genera SVG con revisión nueva.

`portadas.js` es renderizador compartible sin filesystem ni Express. SVG 450×640, composición astronómica/editorial, marco y paletas existentes. Título hasta cuatro líneas (36/32/28/24 px), autor hasta tres (19/17 px); presupuesto conservador 1.2em por carácter en 354 px, sin dividir palabras, truncar ni sustituir texto. Repertorio latino básico y Latin-1, números y puntuación declarada; NFC solo para composición tipográfica. Otros caracteres, controles, markup o texto que no cabe producen error: no extrapolar medidas a todo Unicode. Escapar XML; sin scripts, href, foreignObject o recursos externos. Expansión tipográfica exige medición/pruebas adicionales.

`POST /api/admin/portadas/previsualizar`: autorización, cuerpo `{titulo,autor,portada:{tipo,plantilla,paleta}}`, If-Match obligatorio y comparación con revisión vigente. Solo lectura, sin revisión nueva; SVG/no-store/nosniff/CSP. Misma validación de portada que alta, sin sustituir controles de ID/año/HTTPS/relaciones al guardar. Mostrar mediante img/blob, sin v-html; invalidar al cambiar texto/plantilla/paleta, abortar respuestas obsoletas y revocar URL al cancelar/desmontar. Alta exige preview válido y alguna relación. Recuperación 401 conserva datos/ETag en memoria, sin blob ni tokens; exige nueva preview y bloquea envío si cambió revisión.

GET público SVG exige ID válido y revisión entera positiva exacta, sin parámetros adicionales. 400 malformado, 404 sin libro/portada dinámica, 409 revisión distinta antes de revalidación, 503 almacén no disponible. MIME SVG, nosniff, CSP sin recursos externos, Cache-Control no-cache. ETag con revisión y SHA-256 del SVG; If-None-Match coincidente devuelve 304 tras comprobar revisión. No genera archivos en Git/public/dist ni promete offline. SVG originales mantienen rutas y bytes.

`portada = { tipo: 'ilustrativa' | 'original-autorizada', src, plantilla?, procedencia, permiso?, textoAlternativo }`.

Los tres SVG actuales mantienen bytes, rutas y estilos. El tipo inicial es ilustrativo. Para libros nuevos, usar una de esas plantillas con título/autor escapados como texto SVG y la misma composición; nunca interpolar markup sin escape. El servidor selecciona plantillas/activos de una lista permitida: no se aceptan rutas arbitrarias, SVG subido o código del administrador. Si un título no cabe, el editor avisa y requiere una variante revisada de la plantilla, sin recortar silenciosamente la información.

**Generación/servicio sin build (MVP):** extraer plantillas de las composiciones existentes sin modificar los tres SVG. El registro nuevo guarda ID de plantilla, paleta permitida, título y autor en runtime. `GET /api/contenidos/libros/:id/portada.svg?revision=N` genera el SVG en memoria a partir de la revisión vigente; no escribe en `frontend/public`, `dist` ni Git. Responder `image/svg+xml`, `nosniff`, ETag del contenido y revalidación; sin scripts, referencias externas ni contenido administrativo. Si `N` quedó obsoleta, responder conflicto de revisión y solicitar recarga del catálogo, sin etiquetar una imagen nueva como antigua. Validar el ajuste del texto antes de confirmar el libro. No añadir dependencias para una plantilla textual.

Las fichas nuevas reciben esa URL desde la API, de modo que un libro creado aparece con cubierta tras guardar/recargar sin recompilar ni reiniciar. Para la copia Homido/estática, renderizar el mismo SVG dentro del paquete público de esa revisión y cambiar únicamente la URL proyectada a su archivo relativo. Una cubierta derivada faltante invalida la publicación del paquete; no publicar un manifiesto que apunte a archivos inexistentes. El catálogo activo sigue siendo fuente única, sin upload o editor SVG libre.

Presentar siempre la distinción ilustrativa/original en textos y alternativas accesibles. MVP solo genera/selecciona ilustrativas; reservar el tipo `original-autorizada` para mejora posterior con activos entregados y procedencia/permiso registrados. No habilitar esa selección en MVP ni implementar upload. MARC demo se preserva; no convertir `DEMO-*` ni `852: null` en datos oficiales.

### 4. Endpoints propuestos

| Método y ruta | Contrato |
|---|---|
| `GET /api/contenidos/recorridos` | Público, proyección compatible de una única revisión |
| `GET /api/contenidos/libros?constelacionId=:id` | Público, catálogo filtrado; 400 parámetro inválido, 404 constelación inexistente |
| `GET /api/contenidos/libros/:id/portada.svg?revision=N` | SVG ilustrativo dinámico público de revisión vigente; ID/plantilla inválidos rechazados; sin build |
| `GET /prueba-homido/data/recorridos-demo.json` | Alias estático independiente hacia última exportación completa publicada; formato de arreglo conservado |
| `GET /api/admin/catalogo` | Autorizado, instantánea editable y ETag de revisión |
| `POST /api/admin/libros` | Autorizado; crear libro con ID único y relaciones válidas; requiere `If-Match` global |
| `PATCH /api/admin/libros/:id` | Autorizado; campos bibliográficos, portada y relaciones permitidos; `If-Match` |
| `PATCH /api/admin/recorridos/:id` | Autorizado; texto y referencias permitidos; `If-Match` |

El panel guarda un recurso por operación; cada operación persiste la instantánea completa. Los motivos y relaciones se normalizan dentro de esa misma transacción. No hay endpoints DELETE ni rutas de archivos proporcionadas por el usuario. Restitución de backup mediante procedimiento local con API detenida, sin endpoint público de descarga/restauración.

ETag representa la revisión global. `If-Match` ausente: 428; revisión obsoleta: 412; duplicado de ID: 409; esquema inválido: 400; recurso ausente: 404; no autenticado: 401; identidad sin permiso: 403; almacenamiento/backup fallido: 503. Errores no revelan rutas, contraseñas ni contenido de respaldos. Las rutas administrativas desconocidas deben devolver 404, nunca un 200 genérico que parezca confirmar un guardado.

Validar en servidor: cuerpo objeto, límite 64 KiB, claves modificables, tipos, longitudes, IDs estables, referencias existentes, duplicados, URLs HTTPS permitidas y rutas locales de activos conocidas. Proponer límites explícitos: títulos/autores 200 caracteres, resumen/motivo 1000, historia/reconocimiento 12000, URL 2048. Rechazar claves no permitidas del PATCH y claves de contaminación de prototipo en cualquier nivel; preservar las claves ya almacenadas sin exponerlas como editables. No aceptar HTML como contenido ejecutable. El servidor genera revisión y metadatos de modificación.

### 5. Comparación de identidad, sin alternativa seleccionada

Reutilizar el concepto de sesión Express y su middleware, **sin dar por seguro el proveedor actual**. Antes del CRUD, revisión conjunta con quien mantiene login: credenciales en filtros de URL, configuración real de permisos/RLS, limitación de intentos, validación de sesión al abrir panel y descarte del modo fixture en producción.

| Criterio | A. Configuración privada y hashes, sin base de datos | B. Supabase Auth |
|---|---|---|
| Identidad | Archivo privado de administradores, sin contraseñas en claro; hashes derivados con sal y parámetros almacenados | Identidades verificadas en servidor mediante el proveedor, con IDs administrativos explícitamente autorizados |
| Dependencias de almacenamiento | Configuración privada del sistema de archivos y sesiones Express; sin base de datos de cuentas | Supabase documenta que Auth usa Postgres internamente, aunque el catálogo de contenidos quede en JSON |
| Contraseñas | Candidato a evaluar: `node:crypto.scrypt` asíncrono, sal aleatoria por cuenta de al menos 16 bytes, parámetros calibrados y comparación de buffers de longitud fija con `timingSafeEqual`; no SHA simple ni cifrado reversible | Delegación al proveedor; no consultar ni copiar la columna `contrasena` de la tabla REST actual |
| Operación | Alta/rotación/revocación manual fuera de la web, permisos de archivo y recuperación bajo responsabilidad operativa; requiere invalidar sesiones al revocar o rotar | Gestión de cuentas y recuperación del proveedor; revisar red, configuración, revocación, permisos y migración de cuentas reales |
| Límites | Un despliegue pequeño y un escritor; asegurar límites de intentos/concurrencia antes de ejecutar derivaciones costosas | Dependencia externa y admisibilidad académica aún no confirmada; no equivale a «sin base de datos» |
| Estado | Evaluada como opción documental; no seleccionada ni implementada | Evaluada como opción documental; no seleccionada ni implementada |

La API de scrypt y la recomendación de sal están documentadas en [Node 24 Crypto](https://nodejs.org/docs/latest-v24.x/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback); eso no constituye validación de parámetros para este hardware. El uso interno de Postgres consta en [Supabase Auth](https://supabase.com/docs/guides/auth). Inicio por contraseña y recuperación: [documentación del proveedor](https://supabase.com/docs/guides/auth/passwords). No se han creado hashes, cuentas, secretos ni conexiones reales para esta evaluación.

**Decisión retenida:** esperar la confirmación del usuario sobre si la restricción académica cubre también identidad, y luego su aprobación explícita de A o B. No recomendar una opción como ya acordada ni iniciar implementación de autenticación o escritura administrativa mientras esa puerta esté pendiente. El diseño de contenidos no depende de escoger hoy un proveedor.

Controles obligatorios para ambas alternativas: autorización en cada endpoint, limitación de intentos y concurrencia, errores de login sin revelar cuentas, protección de configuración, revocación/logout y reautenticación tras reinicio, HTTPS y ausencia de secretos en logs/frontend. No tomar permisos de `localStorage` o metadatos editables por usuario. Mantener escritura sin implementar/habilitar hasta resolver la puerta. Definir almacenamiento/transporte de sesión con el proveedor seleccionado; cookies exigirían HttpOnly/Secure/SameSite y CSRF, sin conversión tácita. No ampliar el proveedor REST actual ni su exposición para avanzar el MVP.

La lectura `fichas_libros` se retira del panel como parte de la unificación; su existencia remota no se elimina ni migra automáticamente. Políticas RLS/despliegue no verificados son una dependencia, no un test aprobado. No se crea nueva persistencia relacional para contenidos.

### 6. Guardado, concurrencia y recuperación

Ejecutar una sola instancia escritora. Adquirir bloqueo exclusivo del almacén al iniciar; segunda instancia falla cerrada. Serializar operaciones dentro de la instancia y comprobar revisión **dentro** de esa sección. El bloqueo y la comprobación abarcan lectura, validación, respaldo y reemplazo. Revisión global sacrifica concurrencia entre recursos independientes a cambio de no sobrescribir cambios.

Flujo propuesto: leer/validar estado vigente → verificar `If-Match` → aplicar solo campos permitidos sobre copia del documento → validar referencias/documento completo → escribir respaldo íntegro de la revisión previa en directorio privado → escribir temporal en el mismo volumen → flush/sync y cerrar → renombrar sobre catálogo → responder solo después del reemplazo. Si falla respaldo, escritura o rename, no confirmar éxito ni avanzar revisión. Conservar documento anterior y limpiar temporal cuando sea seguro. Validar semántica de rename/flush en Windows y en el sistema de despliegue mediante pruebas de interrupción; no se declara durabilidad frente a cualquier fallo eléctrico sin probar el almacenamiento.

Backups en `<ASTROVISOR_DATA_DIR>/backups/`, temporales y lock fuera del checkout y de toda raíz pública; permisos de cuenta de servicio, sin `express.static` sobre el almacén. Retención propuesta: últimas 20 revisiones completas; podar solo después de un guardado confirmado, nunca borrar el último respaldo válido. Backup local no cubre pérdida de disco: copia externa manual autorizada y procedimiento de restauración son requisito operativo del MVP; automatizar esa copia es mejora posterior, sin enviar datos a servicios nuevos.

Recuperación: detener API, conservar archivo corrupto para análisis, verificar hash/esquema/referencias de un backup, restaurar por temporal+rename, asignar revisión superior a la última conocida para invalidar clientes antiguos, reiniciar y comprobar lecturas; sesiones se reautentican. Lock abandonado solo se retira comprobando que su proceso ya no existe, no por timeout mientras otro escritor podría seguir activo. Una lectura corrupta muestra error controlado, no catálogo vacío ni reinicialización demo automática. Montar el directorio runtime externo en almacenamiento persistente; no arrancar sobre disco efímero para un despliegue con escrituras.

### 7. Actualización pública y respaldo Homido

Web pública y panel leen la misma fuente por API. Tras guardar, el panel usa la revisión devuelta y recarga catálogo; al entrar/reintentar en estantería pública se solicita de nuevo con revalidación HTTP, sin catálogo importado como fuente permanente. Una pantalla ya abierta no promete actualización en tiempo real; recargar debe bastar y no requerir build.

Homido sigue usando el arreglo compatible. Sustituir mapeo por título por `libro.id`, conservando selección, tres cubiertas, eventos de audio y renderizado. Diferenciar backup administrativo (privado, para restauración) y snapshot público (proyección filtrada de lectura, sin secretos). El segundo no es otro almacén editable.

| Caso de fallo | Origen y comportamiento obligatorio del MVP |
|---|---|
| Falla solo `GET /api/contenidos/recorridos` | Después del timeout/error/JSON inválido, usar última exportación completa del servidor estático independiente; conservar arreglo compatible y avisar «copia publicada», revisión y fecha |
| Cae todo Express/API, incluidos endpoints de portada | El mismo servidor estático, que no depende de Express para funcionar, sirve JSON, SVG derivados y audios locales del paquete publicado. Las URL del paquete no apuntan a `/api/`. Mostrar copia publicada; no mostrar guardado ni contenido al día como confirmados |
| Distribución completamente estática | Entregar paquete autocontenido por revisión con JSON, manifiesto, portadas y audios referenciados; no necesita API. Solo recibe cambios mediante nueva exportación/publicación explícita, sin recompilar el frontend para cada edición |
| También cae el servidor de archivos o falta un recurso | Sin caché/paquete previamente disponible no se promete uso offline. Mostrar error controlado de lectura o recurso y mantener las alternativas disponibles; service worker queda fuera de MVP |

El servidor estático monta **solo la proyección pública derivada** de `<ASTROVISOR_PUBLIC_EXPORT_DIR>` como solo lectura, nunca el runtime, backups o configuración de identidad. Cada paquete contiene manifiesto con revisión/fecha/hashes, `recorridos-demo.json`, cubiertas y copia de los audios públicos permitidos. No copiar recursivamente directorios privados: lista explícita de campos/activos publicables y validación de rutas. La exportación estática demo inicial puede versionarse con el frontend; las exportaciones derivadas de datos administrados se generan fuera de Git/public del checkout y se distribuyen como artefactos, no como código fuente.

Propuesta de publicación: preparar paquete en staging externo desde una revisión confirmada → verificar JSON, hashes y todos los activos → renombrar a directorio inmutable de revisión → actualizar atómicamente el puntero de «última publicada». Mantener copia anterior si falla. Leer manifiesto/puntero una sola vez y resolver todos los recursos contra ese directorio, sin mezclar revisiones. Conservar el alias `/prueba-homido/data/recorridos-demo.json` para compatibilidad y un manifiesto adyacente; el lector S4 usa el manifiesto para fijar una revisión. La API conserva formato antiguo y añade metadatos de revisión sin alterar su arreglo.

Guardado del catálogo y publicación pública son resultados distintos: si persiste revisión N y falla exportación, devolver éxito de persistencia con aviso accesible `respaldoPublico: pendiente` y mantener N-1 publicada; no decir «guardado fallido» ni «respaldo actualizado». Permitir reintentar exportación desde comando operativo y publicar la revisión indicada solo tras verificarla. La web online consulta N; el fallback avisa N-1, sin presentarlo como valor vigente. La aceptación incluye este fallo posterior al commit.

Desarrollo: Vite sirve/proxy de la URL del snapshot hacia un servidor estático de prueba separado, nunca hacia Express; prueba obligatoria con proceso Express detenido y web/estático activos. Producción: documentar el montaje equivalente y verificarlo. Alojamiento independiente y ruta física siguen pendientes de confirmar con el usuario; si no existen, la resiliencia frente a caída total se registra como no satisfecha, no como implementada por tener otro endpoint en Express.

### 8. Texto, audio y autoría

Preservar `multimedia` y los documentos `content/AUTORIA.md`/`BIBLIOGRAFIA.md`. En el mínimo S4, bloquear con 409 el cambio de `historia` si existe audio asociado y no se entrega una revisión de audio/transcripción aprobada por su responsable. No reutilizar la grabación anterior para un relato nuevo. Los campos sin audio (resumen, reconocimiento, datos de libro) sí pueden editarse. Una actualización coordinada posterior debe publicar texto, transcripción y recurso aprobados en la misma revisión, con prueba de fidelidad y créditos; no implementar síntesis de voz en S4.

### 9. Footer institucional registrado, sin implementación

Ampliar posteriormente el footer existente de `App.vue`, usando contenedor flex con wrap y tamaño intrínseco reservado, sin superposición ni posición fija. Cada logo requiere archivo oficial autorizado, nombre accesible y enlace institucional aprobado si corresponde. Mantener navegación y estantería sin cambios; no insertarlo dentro de la escena Homido. No añadir placeholders que parezcan logos. Pendiente de archivos, instituciones, permisos y aprobación; probar 360 px, teclado y 200 % al incorporarlos.

## Matriz propuesta de archivos

| Archivos | Cambio necesario y motivo |
|---|---|
| `content/catalogo-inicial.json` (nuevo, versionado) | Semilla demo revisada; no recibe escrituras administrativas |
| `<ASTROVISOR_DATA_DIR>/catalogo.json`, `backups/`, lock y temporales | Runtime privado externo, no son archivos que agregar a Git |
| Configuración privada de identidad, si se aprueba opción local | Hashes/sales/roles fuera del checkout, catálogo, backups de contenido y exports |
| `content/recorridos.json`, `frontend/src/data/libros-demo.json` | Entradas/fixtures de migración; retirar lectura runtime tras migrar |
| `backend/src/services/documentRepository.js` | Lectura, proyección, validación, revisión, guardado y backup; extraer módulo solo si su tamaño lo exige |
| `backend/src/index.js` | Rutas reales, estados de error y 404 administrativo; eliminar éxito genérico |
| `backend/src/middleware/auth.js`, login en `index.js` | Solo con aprobación de revisión de auth; validación administrativa efectiva |
| `frontend/src/services/librosDemoService.js` | Reutilizar funciones/IDs; cambiar origen a API con estados de carga/error |
| `frontend/src/services/contentService.js`, `frontend/src/composables/useRecorridos.js` | Lectura/revalidación coherente cuando se guarden cambios |
| `frontend/src/views/AdminPanelView.vue` | Retirar `fichas_libros`, formulario permitido, errores/conflictos, feedback accesible |
| `frontend/src/views/BibliotecaView.vue` | Datos dinámicos y tipo de portada; conservar layout y CSS |
| `frontend/src/composables/useAuth.js`, `frontend/src/router/index.js`, `frontend/src/views/AdminAccesoView.vue` | Solo cambios justificados de verificación de sesión/proveedor aprobados; conservar rutas públicas |
| `frontend/src/services/supabaseClient.js` | Revisar usos tras retirar lectura de contenido; no borrar dependencia de identidad sin acuerdo |
| `frontend/public/prueba-homido/js/datos.js`, `js/estanteria-3d.js`, `js/ruta-libro-2d.js`, `prueba.js` | IDs estables, adaptación de datos, fuente/respaldo; sin rehacer escena |
| `frontend/public/prueba-homido/data/recorridos-demo.json` | Copia demo inicial revisada; snapshots administrados van fuera del checkout |
| `frontend/vite.config.js`, documentación de enrutamiento de despliegue | Ruta/alias del snapshot y servidor estático independiente de Express |
| `frontend/public/libros-demo/*.svg` | Conservar los tres archivos sin cambio; nuevas cubiertas se generan por endpoint/exportación, no se escriben aquí |
| `backend/src/services/portadas.js` (nuevo si se justifica separar) | Plantillas permitidas y renderizado SVG compartido por API/exportador |
| `backend/test/documentRepository.test.js`, `backend/test/auth.test.js` | Contrato, errores, concurrencia, seguridad y reinicio; fixture temporal aislado |
| `frontend/test/biblioteca-demo.test.js`, `contentService.test.js`, `homido-datos.test.js`, `homido-estanteria-3d.test.js` | Carga dinámica, rutas/IDs, igualdad completa de fallback, portadas y regresión |
| `scripts/migrar-catalogo.mjs` y `scripts/exportar-homido.mjs` (propuestos) | Preparación de semilla/inicialización exclusiva y publicación verificada reutilizando proyección/renderizado |
| `.gitignore`, `.env.example`, `content/README.md`, `docs/ARQUITECTURA.md` | Excluir estado privado, explicar volumen/backup/recuperación; sin secretos |
| `openspec/config.yaml` | Revisar con usuario reglas históricas S1 frente a S4, sin reescribirlas tácitamente |

No requieren modificación prevista: CSS público general, renderer estéreo, controlador dwell, `public/audio/narration.js`, archivos WAV, constelaciones gráficas. `App.vue`/footer se registra para un cambio posterior con los activos autorizados.

## Risks / Trade-offs

- [Riesgo] Auth desplegada no verificada → no habilitar escritura hasta completar revisión y transición aprobada.
- [Riesgo] Disco efímero o varias réplicas → exigir volumen persistente e instancia escritora única; otra arquitectura requiere nueva revisión.
- [Riesgo] Proyección/fallback atrasado → publicar revisión/origen y comprobar exportación; la ejecución estática conserva límites explícitos.
- [Riesgo] Conflictos con módulos de compañeros → limitar cambios a adaptadores y contratos con pruebas, revisar con responsables.
- [Riesgo] Relato editado con voz antigua → bloquear esa edición hasta entrega coordinada.
- [Riesgo] SVG o URL malicioso → plantillas/activos permitidos, escape y validación de servidor.

## Migration Plan

1. Resolver pendientes #6; aprobación e integración solo por orden del usuario. Actualizar main y abrir rama S4.
2. Confirmar restricción académica y elegir identidad solo tras aprobación explícita; no implementar proveedor ni escritura administrativa mientras tanto.
3. Aprobar corrección bibliográfica; preparar semilla/fixtures e inicializar runtime externo de forma explícita y exclusiva; validar almacenamiento/recuperación antes de API de escritura.
4. Añadir API y panel con revisión optimista; conectar estantería/Homido a proyecciones.
5. Probar reinicio, errores de disco, conflicto, restauración, 360 px/teclado y hardware cuando esté disponible.
6. Publicar solo con aprobación; rollback: detener escritura y recuperar backup validado con versión de código compatible. No restaurar solo código sobre un esquema nuevo sin verificarlo. No archivar OpenSpec sin orden.

## Dependencias pendientes de confirmación

1. Confirmación académica: si se prohíbe también toda base de datos para identidad o únicamente persistencia de contenidos; después elegir A o B. Ninguna seleccionada.
2. Confirmación de las referencias candidatas verificadas de Olcott/Proctor y autorización posterior para corregir los cuatro archivos de contenido. Esta revisión no cambia datos.
3. Destino/volumen persistente externo y servidor estático independiente, rutas privadas y política operativa de backup. No se presentan como entorno ya disponible; si exige varias réplicas, revisar diseño.
4. Cuentas autorizadas, política de sesión y credenciales operativas de la alternativa elegida; no se solicitan ni generan secretos en esta tarea.
5. Autorización independiente para integrar #6 e iniciar implementación. La aprobación conceptual no autoriza merge, archivo OpenSpec ni escritura.

Activos institucionales y originales quedan pendientes para mejoras posteriores; no bloquean el MVP ilustrativo.

## Alcance de entrega

### Corte autorizado de Etapa 3A

- Panel existente → servicio administrativo → Express → JSON privado. `GET /api/admin/catalogo` aporta ETag; PATCH transmite exactamente ese valor y solo campos permitidos. Un 412 conserva selección/borrador y exige recarga explícita para descartar; no reintenta ni sobrescribe automáticamente. Un 401 detiene operaciones y vuelve al acceso existente.
- Corrección final autorizada de 3A: ante 401, conservar solo borrador no confirmado/selección/identidad/ETag en memoria de la pestaña, retirar token sin reenviarlo y avisar en acceso. Recuperación explícita tras nuevo login de la misma identidad y GET satisfactorio; comparar ETag original con actual, bloquear envío si difieren. Sin envío automático ni copia de credenciales en el borrador. Identidad distinta o logout explícito descartan. Borrador y token se pierden al recargar/cerrar: se elimina la persistencia anterior de tokens en sessionStorage y se limpian claves heredadas. No alterar el contrato de auth Express.
- El editor permite año, enlace HTTPS y motivos de relaciones existentes; para constelaciones, resumen y cómo reconocerla. Título y autor permanecen en solo lectura: SVG incluyen texto fijo y `ruta-libro-2d.js` identifica libros por títulos. No modificar esos consumidores en 3A. La API 2B no cambia; esta restricción corresponde al panel.
- Confirmación solo tras PATCH satisfactorio y revisión nueva válida. GET posterior actualiza catálogo; si falla, conservar aviso de guardado confirmado, revisión recibida y borrador, bloqueando otro envío hasta recarga. Avisar siempre que respaldo público Homido sigue pendiente. Pérdida de respuesta de PATCH: resultado no confirmado al cliente, consultar antes de reintentar; revisión optimista del servidor permanece vigente.
- Estantería → GET público por consulta, sin importar JSON compilado ni fallback silencioso. IDs y rutas se conservan; abortar solicitudes al cambiar ruta/desmontar y descartar respuestas tardías. Distinguir carga, error recuperable, vacío y ficha inexistente. `libros-demo.json` permanece únicamente como fixture de regresión, sin doble escritura.
- Navegación, selector, SVG y CSS de estantería conservados. Formularios con etiquetas, foco y controles nativos; ajuste responsive local de flex-wrap en barra del panel para evitar el desbordamiento observado a 360 px. No modifica navegación ni estilos globales.
- Evidencia: pruebas HTTP con directorios/credenciales temporales, reinicio en proceso nuevo y Chrome headless aislado. Zoom CSS 200 % es emulación: zoom nativo, móvil y Homido físicos permanecen pendientes. No cerrar verificación operativa con estas pruebas.

Creación desde panel depende de 5.4; sincronización/exportación Homido depende de sección 6. No se implementan en este corte.

| MVP obligatorio | Mejoras posteriores |
|---|---|
| Decisión académica/proveedor, autorización real, validación y gestión segura de sesión antes de escritura | Administración web de cuentas, si llega a solicitarse |
| Semilla versionada separada, init exclusivo, runtime/backup privados, atomicidad, revisión optimista, bloqueo y restauración/reinicio | Automatización de copia externa; en MVP procedimiento manual verificable |
| Alta/edición limitada de libros y campos no narrados; preservar todo metadato y relación | Cambios coordinados de relato/audio con revisión del responsable; en MVP bloquear inconsistencias |
| SVG ilustrativos dinámicos y los tres originales del proyecto conservados | Selección de cubiertas originales autorizadas y footer institucional |
| API pública coherente, IDs estables y tres casos de respaldo Homido con publicación versionada independiente | Service worker/offline adicional y notificaciones en tiempo real |
| Pruebas de seguridad, persistencia, integridad, regresión, 360 px/teclado y evidencia Homido requerida | Interfaz avanzada de comparación de conflictos; en MVP conservar edición e informar recarga |

No posponer seguridad, backups, pruebas de reinicio/conflicto, correspondencia bibliográfica, coherencia de recursos ni regresión con el argumento de reducir el MVP. Las casillas de tests no ejecutados permanecen pendientes.
