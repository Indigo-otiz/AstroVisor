# Design

## Context

Ver `proposal.md` para motivación, calendario y confirmación de Luis. Este diseño cubre una adaptación acotada que atraviesa shell, vistas, audio y registro de pruebas, por lo que conviene fijar integración y límites antes de implementar.

Estado observado:

- Aplicación vigente en `astrovisor-s1-inicio/`: Vue/Vite, Vue Router, Express y contenidos JSON. La demo React en `DEMO/` es independiente.
- `/`, `/explorar` y `/explorar/:id` ya permiten visita pública sin visor. Ilustraciones SVG locales, tres narraciones WAV Kokoro, transcripciones y procedencia existen; `NarracionAudio.vue` reutiliza `/audio/narration.js` y destruye su reproductor al salir.
- `App.vue` identifica las rutas públicas y administra título y foco. `useRecorridos.js` consulta la API por pantalla y anuncia carga/error; `ContentState.vue` incluye reintento y salida. Revisar foco después de resolver consultas para no interferir con acciones del visitante.
- `public.css` tiene papel `#faf7f0`, tinta `#1b2430`, azul `#1f4e8c`, Georgia en títulos y system-ui en cuerpo, cuerpo aproximado 20 px, botones 56 px y contenedor máximo 1180 px. La ficha de S3 `docs/evidencias/s3/ficha-kokoro.png` coincide con esa identidad; es evidencia anterior, no captura S4.
- Ya hay distribución a 640/960 px; falta adaptación de proyección optativa. Los tamaños de texto declarados en descendientes con `rem` requieren revisión: ampliar solo el padre no los aumenta.
- La escena Homido es HTML independiente, carga A-Frame desde CDN y ofrece salida `/explorar`. Las pruebas físicas y actividades S4 siguen sin realizar, según Luis el 9/11. Los pendientes S1 no se resuelven retroactivamente con S3 ni S4.
- El contexto de OpenSpec conserva descripción S1 de administración futura; el servidor actual ya tiene verificación de sesión y login Supabase. S4 preserva lo implementado sin migrar ni reinterpretar ese módulo.

## Goals / Non-Goals

**Goals:** reutilizar las vistas y el controlador de audio, aislar el ajuste de presentación, permitir inspección del build a tamaños concretos y entregar contingencia audiovisual verificable con registro separado de pruebas físicas.

**Non-Goals:** cambiar identidad visual, contenido narrativo, mecanismos de mirada o autenticación; introducir caché offline, nueva API o proveedor de despliegue. El control para proyección no sincroniza computadora, teléfono y proyector.

## Decisions

### 1. Un estado explícito dentro del shell público

Agregar en `App.vue` un estado reactivo inicialmente desactivado y un botón nativo con `aria-pressed`, nombre claro y estado visible para activar/desactivar la vista para proyección. Aplicar una clase únicamente cuando `esPublica` sea verdadero. Mantener el estado en el shell permite conservarlo entre listado y fichas sin recrear historias ni narradores. La recarga completa empieza en vista habitual; documentar esta decisión.

Alternativas: una ruta nueva duplicaría presentación y navegación; un parámetro propagado en todos los enlaces añadiría cambios innecesarios; localStorage conservaría preferencias entre usos de una computadora compartida. No se requiere persistencia después de recargar. La presentación tampoco depende de la API de pantalla completa; la guía explica usar las opciones del navegador si se desean.

### 2. Estilos acotados y adaptación por contenido

Extender `public.css` con reglas bajo `.public-shell` y la clase de presentación. Reutilizar tokens y SVG; aumentar cuerpo principal a por lo menos 24 px predeterminados, revisar textos con `rem`, mantener interlineado alrededor de 1.6 y lectura entre 55–65 caracteres. Medir contraste del texto normal (objetivo mínimo 4.5:1) y conservar focos diferenciados. No aplicar tamaños a la raíz global que alteren administración o visor.

La grilla y la ficha deben pasar a menos columnas cuando la longitud del contenido lo requiera, también con texto ampliado. Usar límites de ancho y tamaños relativos; evitar altura fija, ocultación de avisos/créditos, escalado con transform o recorte para encajar toda la ficha en una pantalla. Se permite desplazamiento vertical. Los controles nuevos tendrán al menos 48 px de altura y sus etiquetas podrán envolver.

Alternativa descartada: ampliar todo por resolución de pantalla. Un viewport grande no demuestra que hay un proyector ni que la persona necesita texto mayor; la selección explícita evita esa suposición.

### 3. Corregir solo defectos de interacción demostrados

Revisar Tab/Shift+Tab, Enter, Espacio en botones, salto al contenido, historial, enlaces y `<summary>`. Conservar las acciones nativas en lugar de atajos globales. Verificar foco tras consultas y reintentos y que el cambio del botón de audio no lo elimine. Mantener el enlace de salida 2D del visor; añadir instrucciones de contingencia en `/visor` solo si ayudan a elegir el recorrido y sin afirmar validación física pendiente como realizada.

No cambiar contratos del reproductor ni del servicio de contenidos si pasan las comprobaciones. Los errores de API ya tienen recuperación y los de audio conservan lectura; validar ese comportamiento en presentación antes de introducir otra capa de datos.

### 4. Dos contingencias con dependencias documentadas

La ruta 2D requiere servidor web, API y recursos accesibles; evita sensores y dependencia de A-Frame, pero no garantiza operación sin red. El respaldo sin conexión será un archivo audiovisual descargado o copiado al equipo y abierto con reproductor local.

Capturar la versión final servida con una herramienta disponible que genere video real. Cubrir inicio, activación de vista para proyección, listado, tres fichas/narraciones, pausa/reanudación, acceso a escena 3D, ficha/control y regreso a 2D. Conservar rótulos demostrativos y voz sintética; describir la secuencia en texto. Grabar solamente superficie del proyecto y evitar panel o credenciales. Si se agrega voz o edición, documentar su procedencia y conservar los recursos autorizados de S3.

Guardar el respaldo preferentemente en `docs/evidencias/s4/astrovisor-respaldo-s4.webm` o `.mp4`, según formato realmente generado; no exigir codificación nueva si el equipo lo reproduce. Registrar duración, dimensiones, audio, bytes y SHA-256; comprobar inicio/medio/final y reproducción completa sin red. Si el archivo requiere distribución separada por tamaño, dejar ruta real y mecanismo de copia en la guía, sin añadirlo a la carga inicial de Vite. Una imposibilidad de captura o audio queda pendiente explícita; imágenes animadas no satisfacen el requisito.

### 5. Evidencias y guía fuera de OpenSpec

Crear durante implementación `docs/GUIA-S4-EXPO.md` y `docs/PRUEBA-S4.md` y guardar capturas/logs/manifiesto S4 con fecha local y UTC cuando aplique. El manifiesto identifica commit base, cambios aún sin commit y hashes de archivos relevantes, incluyendo respaldo. No editar evidencias S3.

La guía incluirá guion de cinco minutos (0:00–0:30 contexto y rótulos, 0:30–1:30 explorar/leer, 1:30–2:30 narración y accesibilidad, 2:30–4:00 demostración Homido o contingencia explicada, 4:00–5:00 retorno y cierre), prueba previa de HTTPS y checklist del equipo, red, luz, sonido y video. Es una preparación para ensayo/presentación posterior: no afirma que hubo Expo el 5/11.

Cada caso registra método (observado, reportado, simulado, pendiente), fecha, versión, navegador/dispositivo, pasos, resultado y evidencia. El reporte de otro integrante identifica nombre y fuente; la autoevaluación de Luis o una revisión AI no reemplazan esa revisión. Preparar instrucciones no marca como realizados ensayo, proyección ni prueba Homido.

### 6. Validación proporcional

Ejecutar suites existentes `npm test`, `npm run test:web` y build. Revisar el build con API y recursos reales, con teclado y ratón, en vista habitual y presentación. Capturar 360, 1024, 1280, 1920 y 2560 px (en particular 1024×768 y 1920×1080). Confirmar medidas calculadas, recortes, foco y contraste; probar zoom nativo al 200 % cuando la herramienta lo permita y conservar cualquier simulación como caso distinto.

Ejercitar API fallida/restablecida, archivo de audio ausente y A-Frame ausente mediante fixture local aislado; no incluirlo en producto. Reutilizar `scripts/prueba-audio.mjs` solo si es adecuado, dejando intacto el historial S3; crear fixture S4 separado si necesita nuevas fallas. Una prueba nueva se justifica por regresión conductual concreta, no por reflejar el CSS. Al finalizar cambios UI, ejecutar una vez detector Impeccable y revisar resultados aplicables. La revisión visual técnica no acredita evaluación de usabilidad con adultos mayores.

## Risks / Trade-offs

- [Tamaño de viewport no equivale a lectura en sala] → Ensayo real con proyector, luz, distancia y tamaño de imagen registrados; aceptación física pendiente hasta realizarlo.
- [Internet o CDN no disponibles] → Comprobar HTTPS/API antes de ensayo, mantener 2D sin motor 3D y reproducir video local cuando no haya servicio. No prometer un modo offline web.
- [Video sin audio capturado o formato incompatible] → Inspeccionar archivo y reproducción sin red en el equipo previsto, documentar limitación y no cerrar el respaldo mientras falte.
- [Texto mayor rompe grillas/zoom] → Comprobar tamaños de referencia y ampliación nativa, permitir reflujo y desplazamiento vertical.
- [Cambio transversal afecta módulos ajenos] → Clase aplicada solo a rutas públicas; regresión del acceso al visor y denegación administrativa en servidor, sin probar credenciales reales para grabar.
- [Hitos académicos ya pasados] → Conservar periodo planeado 2–6 y registrar ejecución desde el 9/11 o fecha real posterior, sin retrofechar capturas ni atribuir Expo.

## Migration Plan

Tras aprobación crear rama de trabajo S4, preservando los archivos ajenos de `entregables/`. Implementar adaptación y guía, ejecutar validación técnica, producir respaldo y consolidar evidencias. Presentar avances y pendientes físicos; incorporar aceptación y revisión cuando ocurran. La implementación es optativa y no migra datos; una reversión retira control/clase S4 conservando S2/S3 y sus medios. No desplegar a un proveedor nuevo ni archivar OpenSpec como efecto secundario.

## Open Questions

Se resolverán para la ejecución física sin modificar el comportamiento previsto: URL HTTPS disponible; modelo/resolución y condiciones del equipo de proyección; navegador/sistema y salida de sonido; teléfono/Homido; fecha de ensayo posterior y nombre del revisor. Luis confirmó que todavía no realizaron esas actividades; cada caso seguirá pendiente hasta recibir evidencia.
