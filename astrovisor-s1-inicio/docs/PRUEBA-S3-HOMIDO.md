# Homido 3D — tres constelaciones y fichas dinámicas (Sprint 3)

Página: `/prueba-homido/` (A-Frame 1.8.0 local, sin CDN). Cambio OpenSpec: `s3-homido-tres-constelaciones-fichas`.

## Estado: implementado, simulado y pendiente

| Elemento | Estado |
|---|---|
| Tres constelaciones (`orion`, `osa-mayor`, `escorpio`) generadas desde datos, con silueta, color y rótulo distintos | **Implementado** |
| Selección por mirada de 3 s (anillo `#F5B301`, etapas 33/66/100 %, confirmación verde, sonido, gracia de 280 ms) | **Implementado** (lógica extraída a `js/gaze-dwell.js`) |
| Ficha única con título, descripción (`resumen`), historia breve, referencia bibliográfica y botón de audio | **Implementado** |
| Pausa de la mirada y Salir a 2D, también con la ficha abierta | **Implementado** |
| Clic/toque equivalentes a la mirada | **Implementado** |
| A-Frame local | **Implementado** (`vendor/LEEME.md`) |
| Datos: API `/api/contenidos/recorridos` con respaldo local | **Implementado**; el respaldo (`data/recorridos-demo.json`) es de **demostración** |
| Libros reales / narraciones reales | **No existen**: la ficha muestra estado provisional |
| Reproductor de audio | **Pendiente (Luis)**; solo existe el evento de solicitud |
| Compatibilidad física con Homido | **NO verificada** (ver «Pruebas») |

## Cielo inmersivo y vista dividida (corrección posterior a la primera revisión)

**Por qué parecía un menú:** tres figuras en fila a 4 m, con aros de color grandes siempre visibles y rótulos fijos sobre fondo liso; todo a la misma altura y en un solo arco frontal.

**Qué se cambió:**
- Cielo con ≈800 estrellas (dos nubes de puntos redondos + banda tipo Vía Láctea, `js/cielo.js`, 2 llamadas de dibujo) y un suelo oscuro como horizonte.
- Las constelaciones están a 18 m, repartidas en direcciones y alturas distintas (`direccion` en `js/figuras.js`): Orión (−70°, 25°), Osa Mayor (12°, 34°, visible al empezar) y Escorpio (100°, 16°, detrás a la derecha). Hay que girar la cabeza para encontrarlas.
- Estrellas pequeñas y líneas sutiles; sin aros permanentes. Rótulo discreto (opacidad 50 %). Al enfocar: líneas, halos y rótulo brillan; el aro fino de progreso solo aparece mientras se mantiene la mirada.
- La ficha y sus controles siguen apareciendo frente a donde mira la persona.
- Sin cambios en el contrato de datos ni en la lógica de mirada, pausa, salir, ficha y evento de audio.

**Por qué fallaba la vista dividida en el celular** (reproducido con un móvil emulado apaisado 844×390, densidad de píxeles 3: salía vacía, solo el botón de salida): el componente `experimental-stereo` calculaba cada ojo con el tamaño del *buffer* de dibujo (2532×1170) pero `setViewport/setScissor` de three.js esperan píxeles CSS (844×390) y los multiplican otra vez por la densidad. Cada ojo quedaba fuera del lienzo. En escritorio (densidad 1) coincidían y por eso no se veía. No era CSS ni A-Frame. Corrección: `renderer.getSize()` (px CSS), mitades calculadas en `js/estereo.js`, aspecto de la cámara estéreo = mitad del ancho / alto, y al entrar: pantalla completa, bloqueo horizontal y pantalla encendida (si el navegador lo permite; en iOS Safari no están disponibles y hay que girar a mano). Verificado en emulación: dos mitades alineadas con la misma escena y la retícula circular centrada en cada ojo.

**Cómo probarlo en un teléfono real (HTTPS):**
1. Abre `https://TU-DOMINIO/prueba-homido/` en Chrome (Android) o Safari (iPhone). Si ya la habías abierto, recarga forzando caché (el HTML puede estar en caché; los scripts llevan `?v=`).
2. Pulsa «Solicitar sensores» y acepta; mueve el teléfono y confirma que los ángulos cambian.
3. Con el teléfono en vertical, gira para ver el cielo en 2D; mira Osa Mayor 3 s y comprueba que abre la ficha.
4. Pulsa «Probar vista dividida». Gira el teléfono a horizontal (si no se bloquea solo). Debes ver **dos imágenes idénticas**, una por mitad, con una retícula en el centro de cada una, y el horizonte horizontal.
5. Colócalo en el Homido, ajusta distancia y enfoque; gira la cabeza para buscar Orión y Escorpio; selecciona una por mirada; vuelve; usa Pausa y Salir.
6. Anota en la matriz de abajo (incluye si el texto es legible y si hay doble imagen/desalineación). Para salir de la vista dividida sin tocar: «Salir a 2D» en 3D, o el botón blanco superior.

## Cielo con vida y horizonte (último ajuste visual)

Solo `js/cielo.js` (más dos líneas en `prueba.js` para crear el horizonte y quitar el disco negro de `index.html`). Sin cambios de audio, mirada, pausa, salir, ficha, vista dividida ni contrato.

**Por qué el cielo parecía estático:** todas las estrellas estaban en una sola esfera, con el brillo fijado al crearlas y nada que se actualizara por cuadro; con sensores solo se gira la cabeza (no hay desplazamiento), así que no hay paralaje real posible. Lo que sí da profundidad es: capas con tamaños y brillos distintos, atenuación cerca del horizonte, un cielo con degradado y una tierra con colinas a distintas distancias.

**Qué se hizo:**
- **Parpadeo leve:** 12–25 % de las estrellas de cada capa titila (15–42 % de variación, periodos de 2 a 5 s, fases distintas); el resto es estable. Se calcula en la tarjeta gráfica con un pequeño añadido al shader de puntos (una llamada de dibujo por capa, sin trabajo extra en JavaScript). **Las constelaciones no parpadean ni se mueven.**
- **Capas de profundidad:** brillantes a 55 m, medias a 85 m, tenues a 125 m, resplandor de la Vía Láctea a 135 m; tamaños y brillos distintos por capa. Con la vista dividida la diferencia de paralaje entre capas es de décimas de grado: es un apoyo sutil, no un efecto 3D marcado.
- **Extinción atmosférica:** las estrellas cercanas al horizonte son hasta 5 veces más tenues.
- **Horizonte:** cúpula con degradado (azul tenue en el horizonte, casi negro en el cenit), suelo oscuro con relieve suave de tono y tres crestas de colinas a 15, 26 y 40 m con perspectiva atmosférica (la lejana más clara). (Valores originales; los de la etapa 1 están en la sección «Corrección tras la prueba física».)
- **Escorpio** se subió de 16° a 21° de elevación para que su área de mirada y su rótulo queden claramente por encima de las colinas.

**Rendimiento:** tres mallas pequeñas (≈ 2 000 triángulos en total) más las nubes de puntos existentes; no se añadieron luces ni texturas grandes.

**Pruebas:** 61/61 en web. Se midieron diferencias entre capturas consecutivas (cambian unos pocos píxeles: el parpadeo es sutil), no hubo errores de shader en la consola, y el flujo completo (tres selecciones por mirada, pausa, volver, audio, pausa con ficha) y la vista dividida en móvil emulado siguen funcionando. **Sin verificar en el visor físico.** Ajustes posibles: brillo del horizonte (`mezcla('#1a3556', …)` en `horizonte-nocturno`), colores/alturas de `CAPAS_CRESTA` y porcentaje de estrellas que titilan (`parpadeo`).

## Corrección tras la prueba física en Android y iPhone (etapa 1)

Cambios: `a-sky` eliminado de `index.html`; horizonte, suelo y colinas más contrastados (`js/cielo.js`); declaración sobrante `lastSample` eliminada de `prueba.js`; modo temporal `?diag=1` (`js/diagnostico.js`). **No** se tocó audio, mirada de 3 s, fichas, pausa, salir, vista dividida, datos ni el contrato.

**Por qué no se veía el horizonte (causas medidas):** (1) `a-sky` (radio 500, escribe profundidad) se dibujaba después de la cúpula con degradado y la tapaba con un color plano; (2) aun sin `a-sky`, el suelo era casi negro y las colinas subían solo 0.25–3.6° (1–19 px por ojo). Ahora: brillo de horizonte `#305b86`, colinas hasta 5.0° / 4.2° / 3.4° (cercana, media, lejana; tonos `#050b16`, `#0a1626`, `#12243a`) y suelo `#0a1726`→`#0e1f33` con relieve. Escorpio **no se movió** (21°): la prueba automática comprueba que su área de mirada queda ≥ 0.5° sobre la cresta más alta.

**`lastSample`:** solo se escribía, nunca se leía; al quedar sin declarar lanzaba `ReferenceError` en cada evento `deviceorientation`. Se eliminó la asignación y una prueba detecta asignaciones a variables sin declarar en `prueba.js`. No explica la luz de Safari (en Android el error existía y todo funcionaba).

### Modo de diagnóstico `?diag=1` (temporal; apagado en el uso normal)

Sin `?diag=1` ningún parámetro tiene efecto y no se crea el panel. Con él aparece un panel (vista normal) con casillas para apagar/encender **en vivo**: estrellas, resplandor aditivo, parpadeo, cielo/suelo/colinas, constelaciones, mirilla, arrastre táctil y sensores; y un selector de tope de densidad de píxeles (en vivo). **Requiere recarga:** el antialiasing WebGL (`aa=0`; se fija antes de crear el renderer). Cada cambio actualiza la URL, que se muestra en el panel para repetir la prueba. El registro (botón «Copiar registro») incluye: GPU, errores JS (cada mensaje una vez + contador), canvas en px, DPR de ventana/renderer, estéreo, antialiasing, cuadros/s y renders/cuadro cada 5 s.

Parámetros: `?diag=1&off=estrellas,resplandor,parpadeo,horizonte,constelaciones,mirilla,tactil,sensores&aa=0&dpr=1.5`

**Secuencia de aislamiento para el iPhone** (anota en cada paso si aparece la luz/distorsión y copia el registro; no la compares con otro modelo sin anotarlo):

| # | Prueba | URL (tras `/prueba-homido/index.html`) |
|---|---|---|
| 1 | Vista normal, todo activo | `?diag=1` |
| 2 | Vista normal sin parpadeo | `?diag=1&off=parpadeo` |
| 3 | Sin resplandor aditivo | `?diag=1&off=resplandor` |
| 4 | Sin parpadeo ni resplandor («cielo sin shaders animados») | `?diag=1&off=parpadeo,resplandor` |
| 5 | Sin mirilla | `?diag=1&off=mirilla` |
| 6 | Sin estrellas de fondo | `?diag=1&off=estrellas` |
| 7 | Sin horizonte | `?diag=1&off=horizonte` |
| 8 | Sin arrastre táctil | `?diag=1&off=tactil` |
| 9 | Vista dividida **sin sensores** (no pulses «Solicitar sensores») o con `off=sensores` | `?diag=1&off=sensores` |
| 10 | Vista dividida **con sensores** | `?diag=1` |
| 11 | Densidad limitada | `?diag=1&dpr=1.5` y `?diag=1&dpr=1` |
| 12 | Sin antialiasing | `?diag=1&aa=0` |

En vista dividida el panel se oculta (cubre la pantalla completa): configura por URL, entra a vista dividida, y al salir copia el registro. Anota modelo de iPhone, versión de iOS y si probaste con o sin visor (aún no documentados). Empieza por 1 → 4 → 9/10 → 11/12: si la luz desaparece en 3 o 4 apunta al resplandor aditivo/shader; si solo mejora con `dpr`/`aa`, apunta al coste de render.

**Alcance:** el modo no corrige nada por sí mismo. Las correcciones específicas de Safari (estéreo con un solo render, tope de DPR, sustituir el resplandor, cámara/sensores) **no están implementadas** hasta identificar la causa en un iPhone real.

## Paisaje terrestre nocturno (etapa 2 del horizonte)

Solo `js/cielo.js` (componente `horizonte-nocturno`) y sus pruebas. Sin cambios de estéreo, audio, mirada, pausa, salir, fichas, datos ni posiciones de las constelaciones.

- **Suelo:** anillo de ≈2 400 vértices (antes ≈350) con relieve suave (±0.2 m, se eleva hacia el borde para enlazar con las colinas), tres tonos (`COLORES_SUELO`: tierra fría, roca azulada, tierra cálida) mezclados por zonas, sombreado por altura y un granulado leve por vértice que sugiere rocas e irregularidades. Sin texturas ni imágenes.
- **Cuatro capas** (`CAPAS_CRESTA`, radios 15/26/38/50 m): cada una con tono de base, tono de cresta iluminada por la luna (según la inclinación de cada ladera) y bruma hacia el horizonte (`niebla`); las lejanas son más claras y desaturadas. La capa nueva (r 50) es la montaña lejana. Alturas máximas ≈4.2°/3.6°/3.1°/3.9°: el área de mirada de Escorpio (que baja hasta 4.9°) no se toca, y una prueba lo comprueba.
- **Costo:** 63 geometrías y 38 llamadas de dibujo en la escena completa (antes de este cambio, un muro menos y un suelo de menos vértices); el horizonte añade 1 malla de suelo y 4 muros.
- **Ajustes:** atributo `horizonte-nocturno="contraste: 1.3; relieve: 0.3"` (en `prueba.js`, donde se crea la entidad; valores por defecto en `PAISAJE`); `COLORES_SUELO`, `CAPAS_CRESTA` (`color`, `cima`, `niebla`, `base`, `amp`, `max`) y `COLOR_HORIZONTE` en `js/cielo.js`.
- **Verificado:** pruebas automáticas, capturas en Chrome y WebKit de escritorio (mirando al frente, a las tres constelaciones y hacia abajo) y vista dividida en Chrome. **No verificado en teléfono ni visor.** La separación entre colinas cercanas es sutil por diseño; si hace falta más, sube `contraste` o aclara `cima`.

### Observación pendiente (después de la entrega): proporción de la vista dividida

`StereoCamera.update` usa `camera.aspect × stereoCamera.aspect`. `prueba.js` asigna `stereoCamera.aspect = mitad/alto` (≈1.08) en lugar del multiplicador 0.5, de modo que la proporción proyectada es ≈2.34 en un ojo de proporción real 1.08 (compresión horizontal ×0.46 en apaisado 844×390; ×2.16 en vertical). Medido en Chrome de escritorio, 30-oct-2026. En la última prueba física en iPhone la distorsión **no se reprodujo** y se considera «estable provisionalmente», no resuelta. **No se corrige ni se cambia el estéreo** hasta que el problema reaparezca de forma comprobable o se decida después de la entrega; el modo `?diag=1` existente no se amplió.

## Realismo visual del cielo (31-oct-2026)

Ajustes tras la prueba física: apariencia menos «ilustrada», sin cambiar arquitectura, audio, mirada, pausa, salir, fichas, vista dividida ni el contrato de datos.

**Cambios (todo en `js/`):**
1. **Estrellas reales:** posiciones (ascensión recta/declinación, J2000) y magnitudes de `js/catalogo-estelar.js`, proyectadas con proyección tangencial (norte arriba, este a la izquierda, como un atlas). Las tres figuras usan la **misma escala angular**, así que sus tamaños relativos son reales (Orión alto y angosta, Osa Mayor ancha, Escorpio grande).
2. **Fuera los halos de color:** cada estrella es un sprite suave cuyo **tamaño sale de la magnitud** y cuyo **color sale del índice B−V** (Betelgeuse y Antares anaranjadas, Rigel y Alkaid azuladas, el resto blancas).
3. **Líneas sutiles:** gris azulado neutro, finas y poco opacas en reposo; se refuerzan al enfocar. Ya no llevan el color de la constelación.
4. **Mismo lenguaje que el fondo:** las estrellas de la constelación y las del fondo comparten el estilo de punto suave.
5. **Vía Láctea suave:** perfil gaussiano (sin borde duro), densidad irregular a lo largo de la banda, estrellas más tenues y frías, y un resplandor aditivo muy tenue. Estrellas de fondo en tres brillos/tamaños.
6. **Rótulos:** discretos pero legibles en reposo (65 %), pleno brillo al enfocar; el fondo transparente ya no tapa estrellas.
7. **Figuras más fieles:** Orión 8 estrellas (con cabeza), Osa Mayor 7 (el Carro, recipiente cerrado y mango), Escorpio 15 (pinzas, Antares, cola y aguijón). El área de mirada invisible dejó de tapar el fondo (`depthWrite: false`).

**Verificación de datos:** consulta ADQL a SIMBAD (CDS, Estrasburgo) por el espejo de Harvard/CfA, 30-oct-2026, tablas `basic`, `ident` y `allfluxes`:

```sql
SELECT i.id, b.ra, b.dec, f.V, f.B
FROM ident AS i JOIN basic AS b ON b.oid = i.oidref JOIN allfluxes AS f ON f.oidref = b.oid
WHERE i.id IN ('* alf Ori', '* bet Ori', ... )   -- lista completa en js/catalogo-estelar.js
-- endpoint: https://simbad.cfa.harvard.edu/simbad/sim-tap/sync  (request=doQuery, lang=adql)
```

Magnitud V y color B−V: Rigel 0.13 / −0.03 · Betelgeuse 0.42 / +1.85 (variable) · Alioth 1.77 · Dubhe 1.79 / +1.07 · Antares 0.91 / +1.84 · Shaula 1.63. Pruebas automáticas comprueban rangos, trazos, orientación (p. ej. Betelgeuse al este de Bellatrix; Dubhe a la derecha de Alkaid; la cola de Escorpio hacia el sur) y que cada figura cabe en su área de mirada. Fuente de la lista de estrellas de cada figura: criterio educativo (figuras tradicionales), no un listado oficial de la IAU.

**Límites de la representación:** es educativa y estática, no un planetario: no calcula fecha, hora ni lugar. Los tamaños se muestran al ≈ 66 % del tamaño angular real (para que quepan en el campo visual del Homido) y las constelaciones están repartidas en direcciones elegidas para el recorrido, no donde estarían a una hora concreta. Betelgeuse varía de brillo en el tiempo (se usa el valor catalogado).

**Observación para Karime (no modificado):** el esquema 2D de Escorpio (`ConstellationArt.vue`) tiene las pinzas a la izquierda y la cola a la derecha, es decir, como en un espejo respecto a un atlas del hemisferio norte (pinzas a la derecha, cola a la izquierda). El 3D sigue el atlas.

**Pruebas:** `npm run test:web` 56/56 (en una corrida concurrente con Chrome falló una vez la prueba temporizada previa de `GazeController` de S2, intermitente; 4/4 corridas limpias después). Navegador: flujo completo (tres selecciones por mirada, pausa, volver, audio, pausa con ficha) sin cambios y vista dividida en móvil emulado correcta. **Sigue sin verificarse el aspecto en el visor físico:** tamaño de estrellas, contraste de líneas y legibilidad en el Homido pueden requerir ajuste (constantes en `diametroDeMagnitud`, `OPACIDAD` y `ESCALA`).

## Estructura

```
prueba-homido/
  index.html, prueba.js     escena, sensores, estéreo, registro; pega los módulos
  js/datos.js               carga API→respaldo, validación, adaptadores de libros/audio
  js/figuras.js             forma/color/posición de cada constelación (solo visual)
  js/escena-constelaciones.js  entidades A-Frame, anillos de progreso, etiquetas en canvas
  js/gaze-dwell.js          permanencia de la mirada (sin DOM)
  js/cielo.js               campo de estrellas de fondo y Vía Láctea
  js/catalogo-estelar.js    posiciones y magnitudes reales (SIMBAD)
  js/estereo.js             geometría de la vista dividida (px CSS)
  js/visor-estado.js        recorrido | ficha, pausa, acciones permitidas
  js/ficha-canvas.js        layout + dibujo de la ficha; zonas de mirada del mismo layout
  data/recorridos-demo.json respaldo local (misma estructura que content/recorridos.json)
  vendor/                   A-Frame 1.8.0, licencia y procedencia
```

**Agregar una constelación:** un objeto en `FIGURAS` (`js/figuras.js`) y un registro con el mismo `id` en el JSON. Una ficha del JSON sin figura se omite del recorrido y se anota en el registro.

## Reglas de interacción

- Pausa suspende **solo la selección por mirada** (no tiene relación con pausar una narración). En pausa, mirar una constelación no hace nada; el botón pasa a «Reanudar mirada». **Salir a 2D** y el clic/toque siguen funcionando.
- Con la ficha abierta, la ficha y los controles aparecen frente a donde mira la persona; Pausa y Salir quedan debajo de la tarjeta, sin tapar texto.
- La historia se acorta por oraciones (máx. 360 caracteres) solo en el visor; el texto completo del JSON no se modifica y sigue siendo el que usa el modo 2D. No se reduce la tipografía. Un campo opcional `historiaVisor` (no forma parte del contrato) puede sustituir ese resumen.
- `comoReconocerla` no se muestra en el visor (decisión de la primera versión).

## Integración con el reproductor de Luis (PR #2 integrada)

Hay **un solo reproductor**: `public/audio/narration.js` (`crearNarrador`), manejado por `prueba-homido/narraciones.js`. La escena 3D no reproduce nada: solicita acciones y **muestra el estado que el reproductor confirma**.

**Visor → narraciones** (eventos en `window`):

| Evento | Cuándo | `detail` |
|---|---|---|
| `astrovisor:ficha-abierta` | se abre una ficha por mirada o clic | la ficha del JSON (con `multimedia[]`) |
| `astrovisor:ficha-cerrada` | «Volver al recorrido» | — |
| `astrovisor:audio-solicitado` | botón de narración de la ficha 3D | `{ id, titulo, audio }` — narraciones.js hace Escuchar / Pausar / Reanudar según su estado; no hace falta `preventDefault()` |
| `astrovisor:salida-visor` | Salir a 2D / salir de vista dividida | — (detiene el audio y cierra la ficha) |

**Narraciones → visor** (`window.astrovisorVisor`, expuesto por `prueba.js`): `constelaciones(historias)` (compatibilidad, no-op: el recorrido se construye con `cargarDatos()`), `abrir(historia)`, `cerrar()` y `estadoNarracion(estado)`. Con `abrir/cerrar` la ficha 3D se sincroniza con los botones 2D sin devolver el evento. `estadoNarracion` pinta en la ficha 3D el texto del estado real (`reproduciendo` solo cuando el reproductor lo confirma) y la etiqueta del botón (Escuchar / Pausar / Reanudar narración).

- Contrato de datos: `multimedia[i].src` (`/audio/<id>.wav` + transcripción y créditos); `adaptarAudio()` reutiliza `audioDe()` de Luis. Los WAV y `content/recorridos.json` reales se usan cuando la API responde; el respaldo local es solo demostración y no trae audio.
- **Dos pausas independientes:** «Pausar mirada» solo desactiva la selección por mirada (se quitó de `narraciones.js` el vínculo `astrovisor:mirilla-pausa → narrador.pausar()`); la narración se pausa solo desde la ficha.
- Cerrar la ficha, cambiar de constelación, salir a 2D o salir de la vista dividida detienen la narración (`narrador.seleccionar(null/otro)`).
- Pendiente: el desbloqueo del audio requiere un gesto del usuario («Activar audio» antes de ponerse el visor); no se verificó en iPhone/Android/Homido.

## Referencias bibliográficas (para Karime)

`adaptarLibro(ficha)` lee `libros[]`. Suposición: `{ titulo, autor? }`. Con un libro válido la ficha muestra «Para saber más: «título» — autor». Sin libros muestra «Aún no hay un libro verificado para esta constelación…»; no atribuye libros a la biblioteca ni indica disponibilidad. Si Karime define otra forma (editorial, año, signatura), se ajusta `adaptarLibro` y el bloque de `ficha-canvas.js`.

## Pruebas

### Automatizadas (ejecutadas el 29-oct-2026)

- `npm run test:web`: **51/51** (15 previas + 36 nuevas: datos, permanencia, estado, figuras/esfera celeste, ficha, cielo, vistas estéreo).
- `npm test` (backend): **6/6**.
- `node --check` de todos los módulos: sin errores.
- `npm run build`: **falla por una causa previa a este cambio** — `frontend/src/services/supabaseClient.js` importa `@supabase/supabase-js`, que no está instalado en `node_modules`. Reproducido con el árbol limpio (sin mis cambios). No se tocó; conviene avisar a quien agregó Supabase.

### Verificación en navegador de escritorio (Chrome headless 156, render por software, sin visor)

Con la escena servida por HTTP local y la API sin responder (404):

- Carga sin excepciones; datos desde el respaldo local; registro: «Recorrido listo con 3 constelaciones».
- Pausa activa 4.5 s mirando una constelación: no se abrió ninguna ficha.
- Selección por mirada real (3 s, 33/66/100 %) de Escorpio, Orión y Osa Mayor: cada una abrió su ficha; «Volver al recorrido» restauró el recorrido y se pudo elegir otra sin recargar. Tras cada ciclo solo las constelaciones, Pausa y Salir quedan como objetivos del raycaster (fichas ocultas no son objetivos).
- (Reemplazado tras integrar la PR #2) La integración con el reproductor real se verifica abajo, en «Integración con el reproductor de Luis».
- Pausa con la ficha abierta: botón cambia a «Reanudar mirada».
- Se descubrieron y corrigieron durante esta verificación: etiquetas `a-text` con artefactos (se pasaron a canvas), etiquetas que compartían textura, y fichas que aparecían a 40° de donde miraba la persona.

### Verificación posterior (cielo inmersivo y vista dividida), 30-oct-2026

Chrome headless, render por software. Escritorio: las tres constelaciones se abrieron por mirada real tras girar la cámara hacia ellas, con pausa respetada, volver y reselección, evento de audio y pausa con la ficha abierta. Móvil emulado apaisado (844×390, densidad 3): vista dividida con dos mitades alineadas y retículas centradas. Nota de la prueba: apuntar la cámara al centro matemático exacto del área de mirada puede fallar el rayo por redondeo; con un pequeño desvío (como en uso real) acierta siempre.
**Limitación:** el sensor de orientación del emulador no reproduce el de un teléfono; la vista dividida se verificó con el seguimiento de sensor desactivado.

### Pendiente — NO realizado

- Prueba en teléfono físico dentro de Homido: sensores (requiere HTTPS), vista dividida, legibilidad real del texto y de los botones, comodidad de la distancia (4 m) y de la separación de ±40°, estabilidad del raycaster con el movimiento de la cabeza, rendimiento.
- Prueba en iOS (Safari) y Android (Chrome): ver matriz abajo.
- Salir a 2D desde la mirada (solo se probó la lógica de permisos; la navegación no se ejecutó en la prueba automatizada).
- Modo estéreo en un teléfono real y en el Homido (solo verificado en emulación).
- Ajuste de tamaño de estrellas/rótulos y de las direcciones de las constelaciones tras verlas en el visor.

### Matriz para la prueba física (completar con resultados reales)

| Fecha | Teléfono / navegador | HTTPS | Sensores | Vista dividida | Seleccionar las 3 | Volver y elegir otra | Pausa / Reanudar | Salir a 2D | Texto legible | Observaciones |
|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | |

## Limitaciones conocidas

- A-Frame se sirve localmente, pero la página sigue necesitando HTTPS para los sensores del teléfono.
- La historia se acorta con una regla simple por oraciones; la redacción para visor definitiva depende del contenido final.
- La separación de las constelaciones (±40°, 4 m) y el tamaño del texto de la ficha son parámetros en `js/figuras.js` y `js/ficha-canvas.js`; probablemente necesiten ajuste tras la prueba física.
- El dwell se duplica respecto a `src/services/gazeController.js` (que la escena no usa); unificarlos queda como deuda técnica.

### Integración con el reproductor de Luis (Chrome de escritorio, 31-oct-2026; NO es prueba física)

Servidor local con la API real (`content/recorridos.json`) y los WAV reales; Chrome 156 headless con la escena 3D. Resultado: 16/16 comprobaciones correctas — Orión por selección reproduce `orion-kokoro-v1.wav`; Pausar/Reanudar desde la ficha; la pausa de mirada no altera el audio; cerrar la ficha detiene; Osa Mayor usa su WAV; cambiar a Escorpio no superpone; salir y salir de la vista dividida detienen y cierran la ficha; «Reproduciendo» solo tras confirmación del reproductor; sin API la escena usa el respaldo y avisa «Audio no disponible» sin errores JS. Pruebas automáticas: `frontend/test/homido-integracion-audio.test.js`. **Sin verificar:** audio en iPhone/Safari, Android y Homido físico (el desbloqueo exige gesto del usuario).
