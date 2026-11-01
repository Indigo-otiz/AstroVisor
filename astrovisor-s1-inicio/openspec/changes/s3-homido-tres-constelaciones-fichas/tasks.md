# Tareas S3 — Homido 3D: tres constelaciones y fichas dinámicas

Revisión: 3 de noviembre de 2026. **[I]** independiente · **[D]** depende de otra persona o recurso.

## 0. Preparación
- [x] 0.1 [I] Aprobar esta propuesta y responder Q1–Q3 (ver `design.md`).
- [x] 0.2 [I] Línea base: `npm test`, `npm run test:web`, `npm run build` y humo manual de la escena actual (ya: 1/1 y 15/15 pasan).

## 1. Datos y ficha genérica (sin cambio visual aún)
- [x] 1.1 [I] `data/recorridos-demo.json` (copia del contrato) y `js/datos.js` (API→respaldo, validación, adaptadores `libros`/`audio`).
- [x] 1.2 [I] `js/ficha-canvas.js` (layout + draw) en lugar de `drawConstellationCard`; la ficha de Orión usa datos del JSON.
- [x] 1.3 [I] Pruebas `datos` y `ficha-canvas`.

## 2. Constelaciones y selección
- [x] 2.1 [I] `js/figuras.js` (3 figuras, colores, posiciones) y `js/escena-constelaciones.js`.
- [x] 2.2 [I] Extraer `js/gaze-dwell.js` de `prueba.js` y generalizar a N objetivos con `data-action`/`data-id`/`data-ring`.
- [x] 2.3 [I] `js/visor-estado.js` (recorrido/ficha/pausa), volver y elegir otra, clic/toque equivalente, Pausa/Salir.
- [x] 2.4 [I] Pruebas `gaze-dwell` y `visor-estado`; humo 2D con mouse (Orión → Volver → Escorpio → Osa Mayor).

## 3. Ranuras de integración
- [x] 3.1 [I] Evento `astrovisor:audio-solicitado` / `-estado` y aviso sin audio.
- [ ] 3.2 [D: Karime] Confirmar forma de `libros[]` y texto final → ajustar `adaptarLibro`.
- [ ] 3.3 [D: Luis] Conectar su reproductor al evento de audio.
- [ ] 3.4 [D: Carlos] Confirmar forma de `multimedia[]` y si el contrato se amplía.

## 4. Verificación y evidencia

Nota S3-A (Q3): copia local de A-Frame 1.8.0 en `vendor/`; el texto 3D se pasó a canvas (sin fuentes externas). Decisiones Q1–Q3 aplicadas.
- [~] 4.1 [I] `npm test` 6/6, `npm run test:web` 47/47 y `node --check` OK; `npm run build` falla por causa previa (`@supabase/supabase-js` ausente), no por este cambio.
- [ ] 4.2 [D: teléfono, visor, HTTPS] Prueba física en Homido (sensores, estéreo, tres selecciones, volver, pausa, salir); ajustar escala y distancias.
- [ ] 4.3 [I] `docs/PRUEBA-S3-HOMIDO.md` con resultados reales, capturas y limitaciones (lo no ejecutado se marca "no ejecutado").
- [ ] 4.4 [I] Pedir aprobación antes de archivar el cambio.

## Orden recomendado
29–30 oct: secciones 1 y 2 · 31 oct: 3.1 y 4.1 · 1 nov: primera prueba física · 2 nov: ajustes y 4.3 · 3 nov: revisión.

## 5. Ajuste visual posterior (31-oct)
- [x] 5.1 [I] Realismo del cielo y las constelaciones con datos de SIMBAD (ver `docs/PRUEBA-S3-HOMIDO.md`). Sin cambios de audio, mirada, pausa, salir, fichas ni contrato.
- [x] 5.2 [I] Cielo con parpadeo leve, capas de profundidad y horizonte (colinas, tierra, degradado). Ver `docs/PRUEBA-S3-HOMIDO.md`.
- [x] 5.2b [I] Etapa 1 tras prueba física: sin `a-sky`, horizonte/colinas/suelo con más contraste, `lastSample` corregido y modo `?diag=1` (ver `docs/PRUEBA-S3-HOMIDO.md`). Sin cambios específicos de Safari.
- [x] 5.2d [I] Paisaje terrestre: suelo con relieve y color por vértice, cuatro capas de colinas/montañas (ver `docs/PRUEBA-S3-HOMIDO.md`). Sin cambios de estéreo.
- [ ] 5.2c [D: iPhone real] Ejecutar la secuencia de aislamiento `?diag=1` y reportar el elemento causante de la luz/distorsión; las correcciones de Safari quedan sin autorizar hasta entonces.
- [ ] 5.3 [D: teléfono y visor] Confirmar legibilidad de estrellas, líneas, rótulos y horizonte en el Homido físico.
