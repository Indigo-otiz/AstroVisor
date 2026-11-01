# Diseño técnico S3

## 1. Estado actual (verificado en el repo)

| Elemento | Estado |
|---|---|
| Escena A-Frame 1.8.0, estéreo experimental, sensores, registro, Pausa/Salir 3D, mirilla guía | **Implementado** (`prueba.js`, 786 líneas, un IIFE) |
| Dwell 3 s + anillo + gracia 280 ms + sonido | **Implementado dentro de `prueba.js`**, acoplado a ids fijos (`targetProgressRing`, `returnProgressRing`…) |
| `src/services/gazeController.js` (máquina de estados, 15 pruebas web) | Existe, pero **la escena no lo usa** (solo sus pruebas); es lógica paralela |
| Ficha 3D | Orión fijo, texto hardcodeado; una historia real (~400 caracteres) no cabe: hoy hay espacio para ~3 líneas |
| Botones de la ficha | Planos invisibles posicionados a mano sobre píxeles del canvas |
| `content/recorridos.json` + `GET /api/contenidos/recorridos` | **Implementado**: 3 constelaciones demo; `libros: []`, `multimedia: []` |
| Audio / bibliografía reales | **No existen** (solo aviso "narración aún no disponible" y un libro de muestra fijo) |
| Docs S2 mencionan "Cruz del Sur" y 7 estrellas por figura | **No coincide** con la escena (un punto) ni con el JSON (Escorpio). No se toca; se registra como discrepancia |

Línea base: `npm test` (backend) 1/1 y `npm run test:web` 15/15 pasan.

## 2. Decisiones

**D1. Mantener `public/prueba-homido/`, sin Vite ni build.** Es una página estática con A-Frame por CDN, ya probada en dispositivo. Se separa en módulos ES (`<script type="module">`) dentro de `prueba-homido/js/`, importables también por `node --test`. Riesgo asumido: navegadores sin soporte de módulos (no previstos; se verifica en el teléfono real).

**D2. Estructura modular (extracción incremental):**

```
prueba-homido/
  index.html                 # escena mínima: cielo, luz, cámara, contenedores vacíos
  prueba.js                  # se conserva: sensores, estéreo, registro, pausa 2D (se adelgaza)
  js/
    datos.js                 # carga API→respaldo local, validación (mismas reglas que contentService), adaptadores libros/audio
    figuras.js               # FIGURAS = { orion:{estrellas,trazos,color,posicion}, ... } SOLO visual (no va al JSON compartido)
    escena-constelaciones.js # crea entidades A-Frame por constelación (estrellas, líneas, área de mirada, anillo, rótulo)
    gaze-dwell.js            # máquina de estados con reloj inyectable: start/cancel/gracia/progreso/etapas
    ficha-canvas.js          # layout(ficha)->rects y draw(ctx, ficha, estado); sin DOM
    visor-estado.js          # recorrido | ficha | pausa; transiciones; une dwell + escena + ficha
  data/
    recorridos-demo.json     # copia del contrato, con demostracion:true
```

Agregar una constelación = un objeto en `figuras.js` + un registro en el JSON. Ningún `if (id === 'orion')`.

**D3. Un solo mecanismo de selección.** Cada elemento seleccionable lleva `data-action` (`constelacion|volver|audio|pausa|salir`) y `data-id`; el anillo se localiza con `data-ring` en lugar de variables por botón. `gaze-dwell.js` se extrae de la lógica ya probada en dispositivo de `prueba.js` (3000 ms, etapas 33/66/100, gracia 280 ms, `checkCurrentFocus`). **No se importa `src/services/gazeController.js`** (está fuera de `public/`); no se modifica ni ese archivo ni sus pruebas. La duplicación residual se reconoce como deuda.

**D4. Ficha dinámica con layout calculado.** `ficha-canvas.js` calcula el ajuste de línea y la altura según el texto y devuelve los rectángulos de cada zona. La escena **coloca los planos de mirada a partir de esos rectángulos**, eliminando las coordenadas mágicas. Orden: etiqueta "Dato de muestra" · título · descripción (`resumen`) · historia · bloque bibliografía · "▶ Escuchar" · "← Volver al recorrido". `comoReconocerla` queda fuera de la primera versión (ver Q1).

**D5. Datos.** `datos.js` intenta `/api/contenidos/recorridos` (timeout ≈ 3 s). Si falla o es inválido → `data/recorridos-demo.json`, y lo registra en el log y en `selectionStatus`. El contrato **no cambia**. Las reglas de validación se duplican (≈15 líneas) respecto a `contentService.js` porque `public/` no puede importar de `src/`.

**D6. Ranuras de integración (sin inventar formatos):**
- *Bibliografía (Karime):* `adaptarLibro(ficha)` lee `ficha.libros[0]`; si es `{titulo, autor}` (supuesto **por confirmar**) lo muestra; con arreglo vacío muestra "Referencia bibliográfica: pendiente — Dato de muestra". Cuando Karime fije la forma, solo cambia ese adaptador.
- *Audio (Luis):* integrado con su reproductor (`audio/narration.js` vía `narraciones.js`, PR #2): la escena emite `astrovisor:ficha-abierta/-cerrada`, `astrovisor:audio-solicitado` y `astrovisor:salida-visor`, y recibe el estado real por `window.astrovisorVisor.estadoNarracion`. No hay segundo reproductor ni se cancela el evento. La pausa de mirada es independiente de la pausa de narración.

**D7. Disposición 3D para Homido.** Tres constelaciones a ~4 m, a −42°, 0° y +42° de azimut, a la altura de los ojos; cada una con un área de mirada circular (radio ≈ 1 m) sin traslape. Silueta y color distintos (Orión blanco-azulado, Osa Mayor ámbar, Escorpio rojo-coral) **y rótulo de texto grande** (el color no es la única señal). Pausa/Salir debajo del centro como hoy. La ficha reemplaza al recorrido (se ocultan las constelaciones) como hoy.

**D8. Pausa/Salir con la ficha abierta.** Hoy se ocultan al abrirla. Se propone mostrarlas también, pequeñas, bajo la tarjeta (requisito 8). Pendiente de confirmar (Q2).

## 3. Riesgos

| Riesgo | Mitigación |
|---|---|
| Regresión de lo ya probado (dwell, estéreo) | Refactor por pasos; tras cada uno, humo manual 2D y `node --check`; estéreo y sensores no se tocan |
| Historia real más larga que el espacio de la tarjeta | Layout calculado + prueba que verifica que ningún texto exceda su zona; textura máx. 1400×1500 |
| Raycaster con padres `visible=false` | Funciona en S2; se mantiene `refreshObjects()` y se verifica en dispositivo |
| Áreas vecinas disparan la equivocada por micro-temblor | Sin traslape, separación ≥ 0.4 m, misma gracia de 280 ms; ajustar en prueba física |
| Texto de 27 px poco legible en Homido (lentes + pantalla) | Medir en dispositivo; escala del plano en un único parámetro |
| A-Frame por CDN exige Internet en la demostración | Documentado; copia local opcional de `aframe.min.js` (Q3) |
| Formatos de `libros`/`multimedia` indefinidos | Adaptadores aislados (D6) |
| La prueba física exige HTTPS (sensores iOS/Android) | Responsable: usuario (túnel/hosting); fecha límite 2 nov |
| Sin navegador automatizado con acceso a la CDN | Las pruebas automáticas cubren lógica pura; lo visual y físico es **manual y se documenta como tal** |

## 4. Pruebas

Automatizadas (`frontend/test/`, `node --test`, sin dependencias nuevas): `gaze-dwell` (0/33/66/100 %, cancelación, gracia, pausa, reinicio entre objetivos), `datos` (validación, fallback con red caída/JSON inválido, ids únicos), `ficha-canvas` (ctx falso: textos de cada constelación, layout dentro de límites, ranuras vacías), `visor-estado` (recorrido→ficha→recorrido→otra constelación, pausa bloquea, salida). Manuales: 2D con mouse/clic y teléfono+Homido, documentados en `docs/PRUEBA-S3-HOMIDO.md` con resultados reales y limitaciones (lo no ejecutado se marca "no ejecutado").

## 5. Preguntas abiertas

- **Q1.** ¿La ficha debe mostrar también `comoReconocerla`? (Sugerido: no en v1; añadir como segunda página si sobra tiempo.)
- **Q2.** ¿Mostrar Pausa/Salir con la ficha abierta? (Sugerido: sí.)
- **Q3.** ¿Se acepta depender de la CDN de A-Frame el 3 de nov., o se incluye copia local? (Sugerido: copia local si el lugar no garantiza Internet.)
