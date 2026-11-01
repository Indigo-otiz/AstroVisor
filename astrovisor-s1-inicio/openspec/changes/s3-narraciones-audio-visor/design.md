# Design

## Context

Ver `proposal.md` para motivación y alcance. La aplicación principal usa Vue/Vite y Express con lectura documental; `multimedia` está vacío en las tres constelaciones. La ficha S2 ya contiene lectura accesible y el cliente valida el contrato básico. La página independiente `/prueba-homido/` carga A-Frame 1.8.0 desde CDN, tiene un único objetivo esférico, cursor por permanencia de 1800 ms y render experimental de dos cámaras. No hay fichas 3D, reproductor ni archivos de voz. Las pruebas físicas S1 siguen pendientes.

## Goals / Non-Goals

**Goals:** compartir contrato y lógica de audio entre Vue y la página independiente; mantener una sola voz activa por página; evitar reproducciones tardías después de cerrar; añadir la mínima interacción 3D necesaria para S3.

**Non-Goals:** no crear un nuevo motor VR, calibrar óptica Homido, rediseñar interfaces de otros integrantes ni convertir las pruebas anteriores en certificaciones. No cargar síntesis o voces de servicios remotos durante la demostración.

## Decisions

### 1. Archivos estáticos y contrato documental opcional

Conservar `multimedia` y añadir un registro `tipo: audio` por constelación con ruta local, formato, transcripción, autoría del texto, origen del guion, identificación de voz/narrador, método de producción y permiso/licencia verificable. Los datos siguen llegando mediante la API actual; el frontend sirve archivos bajo `/audio/`. La transcripción será el texto exacto efectivamente grabado; el guion confirmado y su origen se registrarán en la documentación.

Los textos actuales no se atribuyen automáticamente a Luis ni a la biblioteca. Antes de producir voz se confirma que sean los guiones originales o se obtiene el material correcto y su autorización. La grabación humana o síntesis exportada son opciones de producción equivalentes para el contrato; se elegirá la opción disponible con permiso documentable, rotulando voz sintética cuando corresponda. No se acepta como sustituto una URL inexistente, pitido ni `speechSynthesis` en vivo.

Separar validación de la historia y validación del recurso opcional: metadatos de audio ausentes/inválidos deshabilitan únicamente su narración y conservan lectura. Admitir los documentos existentes con `multimedia: []`. Validar rutas locales previstas y mostrar créditos/transcripción como texto, sin inyectar HTML.

Alternativas: rehacer API/base de datos no aporta al alcance; un proveedor TTS en runtime añade una dependencia innecesaria durante la demo.

### 2. Un reproductor reutilizado y estados explícitos

Crear un módulo ES estático bajo `frontend/public/audio/`, cargado por Vue con importación dinámica en runtime (sin que Vite intente empaquetar el directorio público) y por el HTML independiente como módulo. Verificar esta carga tanto en desarrollo como en el build servido. Reutilizar un solo elemento de audio por página. Mantener estado observable: sin recurso, listo, cargando, reproduciendo, pausado, finalizado, bloqueo por activación o fallo. Reflejar eventos reales del medio y resolución/rechazo de `play()`; no anunciar reproducción al pulsar un botón antes de confirmarla.

Pausar conserva la posición; Reanudar continúa; finalizar permite Escuchar desde cero. Cerrar, cambiar y salir llaman a una operación de detención que pausa, reinicia y cancela la intención pendiente. Usar una generación/token de solicitud para ignorar promesas y eventos de un recurso anterior; si una reproducción antigua llega tarde, impedir que deje sonido o estado activo. Capturar fallos de carga, decodificación y reproducción sin romper la ficha.

En Vue, detener al cambiar `route.params.id` y al desmontar la vista. En Homido, detener al cerrar ficha, seleccionar otra, desactivar vista dividida, salir de XR si se utiliza, navegar y en `pagehide`. Por comodidad, pausar también al ocultar la página sin reanudación automática; esta pausa adicional conserva posición mientras no se abandone la ficha. Retirar listeners al destruir el controlador.

Alternativa: un reproductor por ficha facilita solapamiento y complica activación; dos implementaciones separadas aumentan diferencias entre web y visor.

### 3. Activación por gesto y recuperación comprobable

Mostrar Activar audio antes de entrar a vista dividida. Intentar desbloquear el mismo elemento de reproducción desde el evento táctil/clic de confianza, con un recurso local real, evitando diferir la llamada inicial de reproducción detrás de consultas de red. Confirmar o informar el rechazo; detener el fragmento de preparación. Ese gesto no cuenta como narración entregada ni garantiza que la siguiente selección por mirada vaya a reproducir.

Mantener los controles explícitos Escuchar/Reanudar como recuperación táctil si el navegador vuelve a bloquear. Separar activación de audio y permiso de sensores. No utilizar autoplay ni pasar el pitido de selección por narración. El procedimiento final se contrastará con documentación oficial del navegador durante implementación y se verificará en teléfono real: el diseño no presupone la política de un navegador concreto.

Alternativa: confiar en que el evento sintético de mirada tiene activación de usuario no satisface la prueba móvil.

### 4. Fichas mínimas en la escena existente

Reutilizar cámara, cursor, sensores y componente estereoscópico. Añadir tres objetivos identificados por nombre, con formas ilustrativas simples coherentes con las figuras existentes, sin afirmar precisión astronómica. Cargar los registros de la API y mostrar carga/fallo/reintento con salida 2D accesible.

Al seleccionar un objetivo, presentar una ficha anclada en espacio de cámara a distancia legible y con controles de mirada, disponible en ambas cámaras del render. Seleccionar acciones una vez por evento, retirar controles inactivos del raycaster y evitar que objetivos detrás de la ficha reciban la misma selección. La transcripción completa se mantiene en un panel HTML accesible; la ficha 3D muestra texto breve legible e indicación para leer en 2D. Esto debe revisarse ópticamente sin dar por validada la legibilidad por existir texto en el canvas.

Añadir controles DOM equivalentes para selección de constelación, reproducción y cierre; el texto/transcripción no depende de que A-Frame cargue. Conservar el diagnóstico S1 y distinguirlo de los resultados S3. En Vue agregar solo el bloque de narración y créditos dentro de la ficha existente, con foco visible, estados anunciados sin saturación y controles de al menos 48 px.

Alternativa: un panel solo HTML por encima del canvas no garantiza controles dentro del visor ni presentación por ojo.

### 5. Pruebas y evidencia diferenciadas

Extender el runner Node existente con un medio inyectable para comprobar transiciones, posición, una sola reproducción, errores y carreras de play/cierre/cambio; esos dobles no prueban sonido real. Validar integridad de metadatos, archivos existentes y correspondencia de transcripciones con los guiones aprobados; escuchar cada archivo completo y comprobar duración/decodificación real por separado.

Ejecutar `npm test`, `npm run test:web`, `npm run build`, comprobación de sintaxis del JS independiente y `git diff --check`. Probar el flujo en navegador real con API y archivos reales, tacto/teclado, vista dividida, estados de error controlados y retorno 2D. Incluir móvil 360 px y texto al 200 %, distinguiendo zoom nativo de ampliación simulada.

Crear `docs/PRUEBA-S3.md` y `docs/evidencias/s3/` con versión/commit o manifiesto SHA-256, fecha real, entorno, archivos/voz/permiso, tabla de pasos y resultados, capturas y evidencia audible cuando esté disponible. Registrar prueba física HTTPS en iPhone Safari y/o Android Chrome, modelo y versión reales, Homido y resultado por mirada tras gesto previo. La revisión de otro integrante debe identificar persona, versión y fuente real; no se sustituye por revisión propia ni por simulación automatizada.

## Risks / Trade-offs

- [Guion o permiso sin confirmar] → separar integración técnica de producción de voz; mantener recursos pendientes sin atribuciones ficticias. La entrega de tres audios no se marca completa hasta resolverlo.
- [Activación móvil no persiste] → recuperar con gesto explícito y registrar el comportamiento real por teléfono/navegador; mantener lectura y no prometer compatibilidad universal.
- [La ficha queda incómoda en estereoscopía] → ajustar escala/posición y tiempo de mirada con teléfono y Homido; conservar retorno web legible.
- [Promesa antigua reactiva voz] → invalidación de solicitudes y pruebas de cerrar/cambiar durante carga y reproducción pendiente.
- [A-Frame CDN o audio falla] → conservar panel de lectura y navegación; distinguir fallo gráfico, consulta y medio.
- [Sin teléfono o revisor en la sesión] → completar lo verificable y documentar pendientes explícitos, manteniendo el estado S3 sin terminar.

## Migration Plan

Integración previa al merge: main avanzó a `b4dafa4` con la ficha blanca y mirada de S2 y el login administrativo. S3 se adapta mediante un puente de eventos entre esa ficha y el controlador compartido; conserva la tarjeta y los controles de Karime, usa permanencia de 3000 ms y añade los puntos de las tres narraciones. La lectura completa y los créditos siguen disponibles en HTML 2D. La estereoscopía usa dimensiones lógicas del renderer para evitar duplicar el pixel ratio.

Tras la aprobación del plan, crear una rama `codex/s3-narraciones-audio-visor` desde el checkout adecuado antes de editar código. Añadir primero contrato y archivos autorizados; luego controlador compartido, ficha web y escena. Ejecutar pruebas antes de registrar evidencia. Mantener S1/S2 y `DEMO/` sin reescribir su historia.

Rollback: revertir los cambios S3 en su rama, retirar metadatos de audio y recursos añadidos conservando historias y rutas previas. No hay migración de base de datos ni despliegue autorizado en este incremento.

## Open Questions

- Modelo de teléfono, versión de Safari/Chrome y fecha efectiva de prueba: se completarán al ejecutar el protocolo.
- Integrante que realizará la revisión cruzada: se registrará cuando confirme su participación y reporte resultados.
