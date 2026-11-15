# Sprint 5 · Experiencia inmersiva y narraciones

**Responsable** Luis Alberto Rodríguez. Periodo académico previsto del 9 al 13 de noviembre de 2026. Ajuste P0 acordado en la revisión del 10 de noviembre. Ejecución técnica del 14 de noviembre de 2026, hora de Ciudad de México. Rama local `codex/s5-experiencia-inmersiva-publica`, basada en `1354c70`.

## Recorrido

1. Desde Inicio, elegir «Explorar en pantalla completa» para usar ratón o tacto. Arrastrar para orientar el cielo y pulsar una constelación. El botón «Pantalla completa» usa la función nativa donde esté disponible.
2. Para Homido, elegir «Explorar con Homido». Antes de colocar el teléfono en el visor, sostenerlo en horizontal, tocar «Activar audio» y conceder el permiso de movimiento si aparece. Enfocar una constelación o un control durante tres segundos. Si el movimiento o el audio se bloquean, resolver el permiso con el teléfono en la mano o seguir en 2D.
3. Dentro de una ficha, pulsar «Escuchar». «Pausar» conserva la posición, «Reanudar» continúa y «Repetir» vuelve al inicio. En Homido, «Pausar mirada» suspende las selecciones ordinarias por mirada sin interrumpir la narración.
4. «Ver libros» abre la estantería. El detalle inmersivo presenta portada, título, autor y el rótulo DEMO cuando corresponde. «Consultar en 2D» abre el detalle web. «Volver al cielo» cierra la ficha y detiene el audio. «Salir a 2D» regresa a la exploración web.
5. En la ficha web, «Transcripción y créditos» conserva el texto completo. El diagnóstico técnico sigue accesible en `/prueba-homido/index.html?diag=1`. La ruta `/visor` conserva la guía de S4.

## Audios de demostración

Medición sobre los archivos WAV que referencia `content/recorridos.json`. Los tres son PCM de 16 bits, mono a 24 kHz. El pico y RMS se expresan en dBFS. El RMS se calculó sobre el archivo completo, incluidas las pausas.

| Constelación | WAV | Duración | Pico | RMS | Muestras saturadas |
| --- | --- | ---: | ---: | ---: | ---: |
| Orión | `orion-kokoro-v1.wav` | 20,63 s | −1,51 | −21,42 | 0 |
| Osa Mayor | `osa-mayor-kokoro-v1.wav` | 22,06 s | −1,51 | −21,01 | 0 |
| Escorpio | `escorpio-kokoro-v1.wav` | 21,82 s | −1,51 | −22,49 | 0 |

Se conservaron los WAV y las transcripciones del equipo. El 14 de noviembre Luis confirmó tras escucharlos en la laptop que las tres narraciones se entienden y tienen volumen similar. La confirmación corresponde a su escucha reportada en el chat. La versión del navegador de esa escucha queda sin especificar.

## Verificación de navegador

Chrome 157.0.8103.51 en Windows, ejecutado con Playwright sobre el build de Vite y una API Express con catálogo temporal. Se usaron archivos de audio reales y se observaron la posición y el estado del medio. Para Homido se emularon la pantalla del teléfono, el permiso de movimiento y la orientación de la cámara. El bloqueo de audio se indujo en el navegador.

| Caso | Resultado observado |
| --- | --- |
| Pantalla con ratón, 1440 × 900 | Entrada desde Inicio y pantalla completa nativa. Apertura de Osa Mayor y Escorpio. La constelación permanece visible sin zonas activas detrás de la ficha. El audio avanzó, pausó a los 0,417 s, conservó la posición al reanudar y volvió al inicio al repetir. Al volver al cielo se detuvo. |
| Pantalla con tacto emulado, 393 × 851 | El arrastre movió la cámara sin abrir una ficha. Un toque abrió Orión. Se comprobaron reproducción, pausa, repetición y salida a `/explorar`. |
| Homido emulado, 915 × 412 | Se abrieron las dos vistas. El rechazo de movimiento y el bloqueo de audio mostraron recuperación. Osa Mayor seguía sin seleccionarse antes de 3 s. La apertura se observó a los 3,869 s desde el inicio del movimiento simulado, con un temporizador configurado a 3 s. Pausar la mirada dejó el audio activo y «Salir a 2D» siguió seleccionable. |
| Biblioteca | Se abrió el detalle inmersivo con portada y marca DEMO. Se regresó a la ficha e ingresó desde Escorpio al detalle web de `field-stars`. |
| Diagnóstico y compatibilidad | El registro apareció con `?diag=1` y quedó oculto en ambas entradas públicas. Se verificaron la URL histórica, la guía `/visor` y la salida ante un fallo inducido de carga. |
| Respaldo y transcripción | Con API 503, la escena abrió una copia publicada por el servidor estático y reprodujo el WAV verificado mediante Blob. Ante el fallo inducido del WAV en la ficha 2D, su transcripción coincidió completa con la del catálogo. |

Capturas de [Inicio](evidencias/s5/inicio.png), [pantalla con ratón](evidencias/s5/pantalla-ficha.png), [pantalla con tacto emulado](evidencias/s5/pantalla-tactil.png), [vista dividida](evidencias/s5/homido-vista-dividida.png), [ficha en vista dividida](evidencias/s5/homido-ficha.png) y [detalle de libro](evidencias/s5/detalle-libro.png). Los datos de ejecución se guardaron en [navegador.json](evidencias/s5/navegador.json).

Las primeras pruebas en Windows fallaron en el respaldo y en el acceso a las portadas debido a la ruta abreviada de `TEMP`, que difería de la ruta devuelta por `realpath`. Se repitieron con la ruta larga configurada solo para el proceso de pruebas. También se detectó que A-Frame podía intentar pedir sensores al abrir la escena. El flujo final usa el control de permiso de Homido y se volvió a verificar con rechazo y concesión simulados.

Resultado final en serie con la ruta larga de `TEMP`: 157 de 157 pruebas frontend y 132 de 132 pruebas backend. Pasaron el build de Vite, la comprobación de sintaxis de los módulos de la escena y `git diff --check`.

### Apertura directa desde el Explorador de archivos

La captura de la laptop se reprodujo al abrir `prueba-homido/index.html` con una URL `file://`. Chrome bloqueó los módulos del visor y solo se dibujaron los controles base. Se agregó un aviso que indica cómo iniciar Vite y oculta la escena incompleta. Si un módulo no carga al abrir el visor desde la app, la escena muestra un mensaje de recuperación y conserva «Salir a 2D». El recorrido completo de navegador y las capturas se repitieron después de este ajuste.

### Prueba en teléfono real

El 14 de noviembre Luis confirmó en el chat que completó el recorrido táctil desde su teléfono, sin visor, usando la demo compartida temporalmente por Wi‑Fi. El recorrido incluía la entrada desde Inicio, arrastrar el cielo, tocar una constelación, escuchar, pausar, reanudar, repetir y salir a 2D. El modelo de teléfono y la versión del navegador quedaron sin especificar.

## Verificación de datos y guía

La API sirvió los tres recorridos y los vinculó con los WAV indicados en la tabla. Cada recorrido recomendó los tres registros demo `star-lore`, `field-stars` y `half-hours`. Se contrastó el enlace inmersivo de `field-stars` con su ficha 2D. La atribución a los guiones del equipo y el uso de voz sintética quedan en el [registro de autoría](../content/AUTORIA.md).

La guía pública `/visor` se actualizó con los nombres vigentes de Inicio y de los controles de Homido. Indica que la escena entra directamente en vista dividida.

## Estado de aceptación

- El 14 de noviembre Luis informó que, según Índigo, la revisión por otro integrante no era necesaria para el cierre de S5 y autorizó continuar sin ella. El reporte de Karime sustenta los cambios de usabilidad como antecedente de S4. [Reporte de Karime](PRUEBA-S4-QA-HOMIDO-FISICO.md).
- La validación de S5 cubre ratón, tacto emulado, escucha humana en laptop y el recorrido táctil en teléfono real reportado por Luis. El 14 de noviembre Luis autorizó cerrar el sprint con la evidencia disponible porque no cuenta con el visor. La prueba de Homido físico bajo HTTPS no se ejecutó y se aplaza para cuando haya equipo.
- Los comentarios atribuibles directamente a la biblioteca tras Expo y los permisos para narraciones institucionales siguen pendientes de confirmación. Los materiales activos están identificados como demostración.
