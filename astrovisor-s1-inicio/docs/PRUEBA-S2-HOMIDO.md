# Evidencia de Selección por Mirada y Controles Accesibles (Sprint 2 — Homido)

Responsable académica: **Karime**.
Sprint: S2 — Selección por mirada y retroalimentación accesible.
Fecha de verificación técnica: **25 de octubre de 2026**, zona America/Mexico_City.
Referencia visual y diseño: `Spring 1_ Rendon Vazquez.pdf` (Sistema visual, wireframes y marcos de Figma Make).

---

## 1. Alcance implementado

Se transformó el prototipo técnico preliminar de S1 en un sistema modular y accesible de selección por mirada (*gaze dwell*) para el visor Homido y navegación 2D:

1. **Retícula de mirada accesible:** Mirilla central con núcleo blanco `#FFFFFF` y halo de contraste oscuro `#0B1530` para asegurar alta visibilidad sobre cualquier fondo del cielo nocturno o estrellas.
2. **Permanencia visual (*Gaze Dwell*) de 3.0 segundos sin prisa:** Temporizador calibrado a 3000 ms, diseñado para personas adultas mayores. El anillo exterior se llena con el color de acento amarillo **`#F5B301`** reflejando con precisión las 4 etapas del diseño:
   - **0 %:** Estado de reposo.
   - **33 %:** Inicio de permanencia (1.0 s).
   - **66 %:** Progreso intermedio (2.0 s).
   - **100 %:** Selección completada (3.0 s).
3. **Confirmación visual y sonora accesible:** Al alcanzar el 100 %, la retícula emite una animación de confirmación (anillo verde de éxito `#1E7B3A`) y un tono sonoro armónico suave (mediante Web Audio API) que notifica la selección sin necesidad de depender únicamente de la vista.
4. **Cancelación suave:** Si el visitante desvía la mirada antes de los 3 segundos, el temporizador se cancela al instante y el anillo regresa suavemente a 0 %, previniendo selecciones involuntarias.
5. **Constelaciones interactivas del recorrido:**
   - **Orión:** 7 estrellas con Betelgeuse en amarillo acento `#F5B301`, líneas esquemáticas al 60 % y halo interactivo de 48 px.
   - **Osa Mayor:** 7 estrellas (cacerola y mango).
   - **Cruz del Sur:** 5 estrellas en cruz.
6. **Panel informativo estereoscópico y 2D:**
   - Al confirmar la selección, se abre el panel con la etiqueta visible `Dato de muestra`, el título de la constelación, su historia accesible y la recomendación de libro de la biblioteca (*"Pídelo en persona en el mostrador de la biblioteca"*).
   - En modo estéreo, se proyecta cómodamente para ambos ojos.
   - Botón `Volver al recorrido` para retornar a Visor: 0 %.
7. **Controles de bienestar y accesibilidad:**
   - Botón `[ || Pausa ]` / `[ ▶ Continuar ]`: permite congelar la mirada para que el usuario descanse los ojos sin seleccionar nada por accidente.
   - Botón `[ 🚪 Salir al modo 2D ]`: botón accesible de 72 px de altura con borde blanco de 4 px que retorna inmediatamente al modo web tradicional (`/explorar`).
8. **Selector de Marcos AstroVisor:** Barra de inspección rápida integrada (según especificación de la página 10 del documento de Karime) para auditar directamente los marcos de Figma: `0 %`, `33 %`, `66 %`, `100 %` y `Ficha Información`.

---

## 2. Matriz de verificación técnica

| Criterio verificado | Resultado observado | Cumplimiento |
|---|---|---|
| **Retícula visible con contraste** | Núcleo blanco y halo oscuro legible sobre cualquier parte de la bóveda celeste. | ✅ Aprobado |
| **Tiempo de permanencia (3 s)** | Anillo amarillo `#F5B301` se llena progresivamente en 3000 ms continuos sin prisa. | ✅ Aprobado |
| **Etapas visuales (0, 33, 66, 100 %)** | El anillo avanza de un tercio a dos tercios y completa a 360°, con distintivo de etapa legible. | ✅ Aprobado |
| **Cancelación al desviar la mirada** | Al retirar el foco del objetivo antes de 3 s, se reinicia a 0 % sin disparar acciones. | ✅ Aprobado |
| **Confirmación accesible** | Pulso visual verde `#1E7B3A`, anillo cerrado y tono sonoro suave emitido. | ✅ Aprobado |
| **Apertura de ficha con libro** | Despliega panel con `Dato de muestra`, historia de la constelación y libro de la biblioteca. | ✅ Aprobado |
| **Botón Volver al recorrido** | Cierra la ficha y retorna la retícula a reposo (0 %). | ✅ Aprobado |
| **Control de Pausa (72 px)** | Congela la mirilla y suspende la permanencia; al reanudar vuelve a detectar. | ✅ Aprobado |
| **Salida a modo web 2D (72 px)** | Enlace directo que retorna a la navegación 2D sin visor (`/explorar`). | ✅ Aprobado |
| **Alternativa táctil / mouse** | Operable con clic y toque en pantalla para personas sin visor o en computadoras. | ✅ Aprobado |
| **Pruebas automatizadas** | 15/15 pruebas unitarias y de integración pasando con Node test runner. | ✅ Aprobado |
| **Compilación de producción** | `npm run build` genera bundle sin errores en 1.66 s. | ✅ Aprobado |

---

## 3. Comprobaciones ejecutadas

Desde `astrovisor-s1-inicio/`:

```bash
npm test
npm run test:web
npm run build
```

**Resultados obtenidos:**
* Backend: **1/1 pruebas pasando** (`documentRepository`).
* Frontend: **15/15 pruebas pasando** (10 pruebas de consumo documental + 5 pruebas del controlador de permanencia `GazeController`).
* Compilación: **100 % exitosa** con Vite.

---

## 4. Estado de la rama

* Rama de trabajo: `karime/s2-seleccion-mirada-homido`.
* Cambios listos y probados, conservando la rama `main` intacta a la espera de la indicación expresa de la responsable para realizar el merge.
