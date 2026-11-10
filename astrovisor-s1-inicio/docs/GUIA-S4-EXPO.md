# AstroVisor — guía de computadora y presentación

Responsable: Luis Alberto Rodríguez. Preparada el 9 de noviembre de 2026 para ensayo o presentación posterior. El periodo académico original fue 2–6 de noviembre; Luis confirmó que las actividades consultadas no se realizaron. Esta guía no acredita participación en la Expo del día 5.

## Abrir el recorrido

Utiliza la dirección HTTPS confirmada por el equipo. Desde **Inicio → Explorar constelaciones**, elige Orión, Osa Mayor o Escorpio. Puedes leer, escuchar, pausar, reanudar y volver al listado con ratón o teclado, sin registro, sensores ni visor.

El botón **Vista para proyección** aumenta el texto del recorrido y adapta las columnas. Muestra **Activada** o **Desactivada**; vuelve a pulsarlo para cambiar de vista. La elección continúa al navegar entre inicio, listado y fichas; recargar o abrir otra pestaña comienza en la vista habitual. La página permite desplazamiento vertical: una historia completa no tiene que caber en una sola pantalla.

El control no configura el proyector, no sincroniza teléfonos y no valida la óptica del visor. Conserva los diseños propios de Homido y administración. Para compartir, duplica o extiende la pantalla con las opciones del equipo; ajusta la salida y el zoom del navegador durante el ensayo. Comprueba las instrucciones del equipo disponible antes de usar pantalla completa.

## Teclado y sonido

- **Tab / Shift+Tab:** recorrer controles; el contorno identifica el foco.
- **Enter:** abrir enlaces y activar botones. **Espacio:** activar un botón o abrir los créditos.
- **Saltar al contenido:** primer enlace por teclado; omite la navegación.
- **Escuchar → Pausar → Reanudar:** controlar la narración sin perder posición. Salir de la ficha detiene y reinicia su audio.
- **Transcripción y créditos:** consultar el texto narrado y su procedencia.

Prueba el sonido antes de presentar; un estado «Reproduciendo» no demuestra que la bocina se oiga en la sala. Si falla el audio, continúa leyendo. Las tres voces son sintéticas, identificadas como Kokoro ef_dora; los guiones son demostrativos del equipo. Los créditos y permisos se mantienen en cada ficha y en `content/AUTORIA.md`.

## Elegir contingencia

| Situación | Continuar con | Límite |
|---|---|---|
| Homido, sensores o escena 3D fallan | **Continuar en modo web 2D** desde `/visor`, o **Regresar al modo web 2D** desde la prueba | Requiere frontend, API y recursos accesibles. |
| El audio falla | Historia y transcripción en pantalla | Confirmar sonido antes de atribuir reproducción audible. |
| Falla la red/API necesaria o el enlace no abre | Archivo de video local previamente comprobado | La web no tiene modo offline garantizado. |
| No hay proyector disponible | Demostración en computadora y registro de pendiente | No se afirma validación de proyección. |

Una escena o video proyectado **no sustituye las pruebas con Homido real**. Si la API falla, usa **Volver a intentar** cuando vuelva el servicio. La web 2D evita sensores y A-Frame, pero no garantiza abrirse desde cero sin conexión.

## Preparar enlace y equipo

Antes del ensayo, completar y comprobar:

| Dato | Registro |
|---|---|
| Fecha, responsable y versión/manifesto S4 | Pendiente de ensayo físico. |
| URL HTTPS accesible desde el equipo y el teléfono | Pendiente. No sustituir por localhost. |
| Computadora, sistema y navegador/versión | Pendiente de equipo de ensayo. |
| Proyector/pantalla y resolución de salida | Pantalla revisada y funcionando según Luis (constancia 10/11). Tipo/modelo y resolución sin especificar. |
| Tamaño de imagen, distancia del público y luz ambiente | Pendiente. |
| Sonido: bocina/salida y volumen inteligible | Pendiente. |
| Red del recinto: carga de API, WAV y escena 3D | Pendiente. A-Frame depende de CDN. |
| Teléfono, navegador, visor y sensores | Homido revisado y funcionando según Luis (constancia 10/11). Teléfono, navegador y desglose de sensores/controles sin especificar. |
| Video local copiado al equipo y reproducido sin red | Pendiente de ese equipo; consultar registro técnico del archivo. |
| Otro integrante revisor | Índigo Ortiz revisó S4 y lo considera correcto, según confirmación de Luis recibida el 10/11. Fecha exacta y versión sin especificar. |

Abrir el enlace HTTPS sin advertencias, visitar directamente una ficha y recargarla. Probar teclado y ratón, escuchar las tres narraciones y revisar lectura desde la distancia prevista. Abrir el visor en teléfono real, activar audio y sensores mediante gesto, seleccionar, pausar/reanudar y regresar a 2D. Registrar resultados sin completar modelos o versiones por suposición.

Para el respaldo, abrir el archivo con el reproductor local del equipo y desconectar la red durante la reproducción. Verificar inicio, transiciones, sonido, final y regreso a 2D. Registrar incidencias y restablecer la conexión al terminar. Evitar pestañas personales, notificaciones y pantallas administrativas durante la proyección o grabación.

## Secuencia opcional para demostrar el proyecto

Luis aclaró que el equipo usa una presentación y muestra el proyecto. La siguiente secuencia es un recurso de apoyo ya preparado; un ensayo cronometrado separado no es requisito de su entrega personal de S4.

| Tiempo | Acción y explicación |
|---|---|
| 0:00–0:30 | Presentar AstroVisor: historias del cielo, contenido demostrativo y visita sin cuenta. |
| 0:30–1:30 | Activar vista para proyección, explorar y abrir una historia; mostrar texto e ilustración. |
| 1:30–2:30 | Escuchar, pausar y reanudar. Mostrar transcripción/créditos y navegación por teclado. |
| 2:30–4:00 | Demostrar la escena 3D y, solo si está comprobado, usar teléfono/Homido. Ante fallo continuar en 2D o video según contingencia. Explicar qué se está mostrando. |
| 4:00–5:00 | Regresar a 2D, mostrar otra constelación y cerrar con lo verificado y las limitaciones reales. |

Duración de referencia de esta secuencia: 300 segundos. Puede adaptarse a la demostración del equipo; no acredita un ensayo realizado ni una exposición el 5 de noviembre.

## Ejecutar localmente para revisión técnica

Desde `astrovisor-s1-inicio`, con dependencias instaladas, abrir dos terminales:

```powershell
npm run dev:api
```

```powershell
npm run build
npm run preview --workspace frontend -- --host 127.0.0.1 --port 5175 --strictPort
```

Abrir `http://127.0.0.1:5175/`. Son comandos de escritorio local; no ofrecen una dirección HTTPS para el teléfono o el recinto. Vite reenvía `/api` a la API de desarrollo en puerto 3001. Si el equipo ya tiene un servicio usando esos puertos, coordinar antes de iniciar otro.

Para repetir la regresión automatizada con Playwright disponible por `NODE_PATH`:

```powershell
node scripts/verificar-s4.cjs --serve
```

Este script inicia temporalmente API en 3094 y preview en 5194 y los cierra al terminar. Guarda capturas y `docs/evidencias/s4/navegador.json`; las fallas de API/audio/A-Frame se inducen solo dentro de ese navegador de pruebas. No cambia documentos ni fallas en producción. Configurar `S4_CHROME` si Chrome está en otra ruta. No es una prueba física ni un despliegue.

El zoom nativo al 200 % se comprobó el 10/11, en seis combinaciones de inicio/listado/ficha y vista habitual/proyección, con audio y créditos operables por teclado. Para repetir esa prueba, con Playwright disponible por `NODE_PATH`, ejecutar `node scripts/verificar-zoom-s4.cjs`. Cuando indique LISTO, ajustar el zoom de la ventana de Chrome al **200 %** usando sus controles reales; después, desde otra terminal en el mismo proyecto:

```powershell
Set-Content -LiteralPath '.qa/zoom-control.json' -Value '{"accion":"verificar"}' -Encoding utf8
```

El script exige un factor de zoom nativo 2 respecto a la referencia inicial y guarda `zoom-nativo.json` y capturas `zoom-200-*.png`; no modifica CSS ni emula el dispositivo. Cierra el navegador y los servidores al finalizar. Para cancelar, escribir `{"accion":"cerrar"}` en el mismo archivo. Sin orden de verificación, la sesión se cierra al cabo de cinco minutos.

## Respaldo y evidencia

El archivo es [astrovisor-respaldo-s4.webm](evidencias/s4/astrovisor-respaldo-s4.webm), de aproximadamente **1 minuto 44 segundos**, 1280×900, con video VP8 y voz Opus. Es un resumen audiovisual del recorrido completo; el guion de exposición dura cinco minutos y permite explicar cada paso. Copiarlo al equipo antes del ensayo y abrirlo con un reproductor compatible con WebM.

La imagen es grabación real del build en Chrome de escritorio; la voz se montó con los WAV autorizados de S3, alineados a los eventos de reproducción registrados. No es captura del micrófono o del sonido de la sala, ni evidencia de visor físico. La secuencia y el método están en `grabacion.json`; la verificación y el hash final, en `video-local.json`. También existe una descripción textual de la secuencia en el registro de pruebas.

Para regenerar el respaldo con Playwright y su FFmpeg disponibles, ejecutar `node scripts/grabar-s4.cjs`, con `PLAYWRIGHT_BROWSERS_PATH` apuntando a la instalación de navegadores/FFmpeg. En esta ejecución se utilizó `.qa/browsers`; configurar `S4_FFMPEG` si el ejecutable está en otra ruta. El script inicia y cierra sus servidores locales. Para repetir la comprobación de reproducción, ejecutar `node scripts/verificar-video-s4.cjs` con Playwright disponible por `NODE_PATH`.

La duración, procedencia, hash y verificación están registrados en `docs/PRUEBA-S4.md` y `docs/evidencias/s4/`. Consultar su estado antes de anunciar que está listo para el equipo físico de ensayo.

La guía y las evidencias son materiales de S4. Los archivos de OpenSpec permanecen como seguimiento interno.
