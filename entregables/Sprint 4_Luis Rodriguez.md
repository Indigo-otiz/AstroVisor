# Adaptación web de AstroVisor para computadora y pantalla

Informe de resultados del Sprint 4

**Responsable:** Luis Alberto Rodríguez · **Equipo:** 8

**Materia:** Taller de Full Stack · **Proyecto:** AstroVisor

**Periodo base:** 2–6 de noviembre de 2026 · **Registro técnico:** 9–10 de noviembre de 2026

## Mi aportación al Sprint 4

Mi historia de usuario fue: «Como visitante quiero utilizar la experiencia web desde una computadora o proyector». Adapté el recorrido público para computadora y pantalla, comprobé su operación y preparé las evidencias y el respaldo de la demostración.

La vista para proyección aumenta el texto y reorganiza el contenido. Conservé las historias y narraciones de Orión, Osa Mayor y Escorpio, disponibles sin cuenta ni visor, con lectura y audio operables mediante teclado o ratón.

## Cambios realizados

- Añadí **Vista para proyección**, con estado visible. La elección continúa al navegar y una recarga vuelve a la vista habitual.
- Adapté columnas y ancho de lectura; el cuerpo principal de proyección se midió a 24 px.
- Conservé foco visible, controles grandes y salto al contenido para operar con teclado.
- Preparé una guía y un video local de respaldo, con retorno a la ruta 2D.

![Vista para proyección en computadora](../astrovisor-s1-inicio/docs/evidencias/s4/inicio-1920-proyeccion.png)

*Vista para proyección a 1920 px como evidencia de la distribución en navegador.*

## Pruebas y resultados

| Comprobación | Resultado |
|---|---|
| Pruebas del backend | 7 de 7 aprobadas |
| Pruebas del frontend | 26 de 26 aprobadas |
| Compilación del frontend | Correcta |
| Regresión en navegador | 44 casos correctos y 0 fallos |
| Zoom nativo al 200 % | 6 de 6 combinaciones aprobadas |
| Video local sin conexión | Reproducción completa y pista de audio verificada |

La regresión cubrió inicio, listado y ficha en ambos modos, entre 360 y 2560 px, incluyendo 1024×768 y 1920×1080. Se comprobaron teclado, ratón, audio, créditos e historial sin desplazamiento horizontal. Los fallos inducidos de API, audio y A-Frame verificaron recuperación o regreso a 2D.

El zoom utilizó los controles reales de Chrome al 200 %, con audio y créditos operables por teclado, separado de la simulación CSS. Las pruebas técnicas se registraron en Windows con Chrome 157 los días 9 y 10 de noviembre.

## Validación y revisión cruzada

Confirmé que **Homido y pantalla se revisaron y funcionan correctamente**, y que **Índigo Ortiz revisó S4 y dice que está bien**. Las constancias se recibieron el 10 de noviembre y están registradas como reportes del responsable, sin incidencias comunicadas.

## Materiales de mi entrega

El video dura **1 minuto 44 segundos**, a **1280×900**. Incluye historias, narraciones, controles, escena 3D, vista dividida experimental y retorno a 2D. La imagen es una grabación real del navegador; la voz se editó desde los WAV de S3. Conserva rótulos demostrativos y créditos. Se reprodujo completo localmente sin conexión; no es una grabación de Homido físico.

La guía indica continuar en 2D si falla el visor y abrir el video local si falla la red necesaria. La web requiere sus servicios accesibles; el respaldo sin red es el archivo audiovisual.

Evidencias y materiales disponibles en el repositorio:

- [Registro técnico y resultados](../astrovisor-s1-inicio/docs/PRUEBA-S4.md).
- [Guía de uso y demostración](../astrovisor-s1-inicio/docs/GUIA-S4-EXPO.md).
- [Video local de respaldo](../astrovisor-s1-inicio/docs/evidencias/s4/astrovisor-respaldo-s4.webm).
- [Constancias de funcionamiento y revisión de Índigo](../astrovisor-s1-inicio/docs/evidencias/s4/validacion-reportada.json).

## Estado de mi parte

**Mi parte técnica de S4 está terminada**, con implementación, evidencias y revisión cruzada reportada. El equipo utiliza una presentación y muestra el proyecto; mi entrega no requiere un ensayo separado.
