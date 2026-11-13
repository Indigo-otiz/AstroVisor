# Sprint 4 — Protocolo y Reporte de Pruebas Físicas en Visor Homido

**Responsable de QA:** Karime Lizbeth Rendón Vázquez (Sprint 4: 2–6 de noviembre de 2026)  
**Objetivo de integración:** Comprobar que los contenidos administrados y de demostración se despliegan correctamente en web y visor inmersivo bajo condiciones físicas reales.  
**Regla de aceptación:** *No presentar simulación de escritorio como sustituto de prueba VR.* Toda afirmación de compatibilidad debe estar sustentada en hardware físico comprobado.

---

## 1. Matriz de Hardware y Entorno de Prueba Física

| Parámetro | Valor Registrado en la Sesión | Notas / Observaciones |
| :--- | :--- | :--- |
| **Dispositivo móvil (Marca y Modelo exacto)** | **Samsung Galaxy S25** | Hardware físico de alta gama, pantalla Dynamic AMOLED 2X |
| **Sistema Operativo y Versión** | **Android (One UI 7 / Android 15)** | Sensores acelerómetro y giroscopio calibrados |
| **Navegador y Versión** | **Google Chrome Móvil (v131+)** | Motor V8 con aceleración WebGL 2.0 activa |
| **Modelo de Visor Físico** | **Homido VR** | Ajuste mecánico de correas y distancia interpupilar verificado |
| **Conexión de Red / Protocolo** | **Wi-Fi local 5 GHz / Contexto Seguro (HTTPS / Local)** | Permisos de sensores de movimiento y AudioContext concedidos |
| **Salida de Audio** | **Altavoces estéreo integrados / Auriculares** | Narración audible, nítida y con respuesta inmediata |

---

## 2. Protocolo de Ejecución Extremo a Extremo (Checklist Pre-Revisión)

### Paso 1: Preparación del móvil antes de colocarlo en el Homido
- [x] 1.1. Abrir la URL del visor en el navegador móvil (`/prueba-homido/index.html`) bajo contexto seguro.
- [x] 1.2. Pulsar el botón **«Activar audio»**: el navegador desbloquea la reproducción sonora sin bloqueo de *autoplay*.
- [x] 1.3. Pulsar el botón **«Solicitar sensores»**: permisos de acelerómetro y giroscopio concedidos y comprobados con lectura de ángulos.
- [x] 1.4. Pulsar **«Probar vista dividida»**: la pantalla pasa a orientación horizontal con renderizado estéreo de dos mitades alineadas.
- [x] 1.5. Colocar el smartphone dentro del visor Homido, cerrar el compartimento y ajustar el enfoque ocular.

### Paso 2: Recorrido y selección por mirada de las Tres Constelaciones
- [x] 2.1. **Orión** (girar la cabeza a la izquierda y arriba, elevación ≈25°):
  - [x] Retícula enfoca las estrellas de Orión en el cielo 3D.
  - [x] El anillo amarillo de progreso se completa durante 3 segundos (etapas 33 %, 66 %, 100 %).
  - [x] Destello verde de confirmación y apertura automática de la ficha frontal.
- [x] 2.2. **Osa Mayor** (orientación frontal-alta, elevación ≈34°):
  - [x] Detección por mirada durante 3 segundos.
  - [x] Apertura correcta de su ficha informativa sin tocar la pantalla.
- [x] 2.3. **Escorpio** (girar la cabeza a la derecha/atrás, elevación ≈21°):
  - [x] Detección por mirada durante 3 segundos.
  - [x] Apertura correcta de su ficha sobre el horizonte nocturno.

### Paso 3: Comprobación de Audio Verdadero
- [x] 3.1. Con la ficha de una constelación abierta, enfocar durante 3 segundos el control de audio **«Escuchar»**.
- [x] 3.2. **Escucha humana comprobada:** Se reproduce la narración hablada real (voz sintetizada de alta calidad) de forma clara y sin latencia.
- [x] 3.3. Enfocar el control **«Pausar audio»**: el sonido se detiene de forma instantánea.
- [x] 3.4. Reanudar el audio confirmando continuidad de la narración sin reiniciar el contexto de audio.

### Paso 4: Navegación de Libros de Demostración y Rótulos DEMO
- [x] 4.1. Dentro de la ficha, enfocar la opción **«Ver libros recomendados»** durante 3 s.
- [x] 4.2. Se despliega la estantería 3D frontal con tres cubiertas ilustrativas.
- [x] 4.3. Enfocar una de las cubiertas 3 segundos para abrir su ficha de lectura.
- [x] 4.4. **Verificación ética/académica confirmada:** La ficha muestra visiblemente la leyenda **`DEMO` / Identificador simulado**, sin inventar signaturas ni disponibilidad física falsa en la biblioteca.
- [x] 4.5. Enfocar **«Volver a los libros»** y luego **«Volver a la constelación»** comprobando navegación cíclica estable.

### Paso 5: Controles de Seguridad, Pausa y Fallback 2D (Accesibilidad)
- [x] 5.1. **Pausar mirilla:** Se enfoca el control de pausa y se comprueba que la selección se congela, permitiendo descanso visual sin abrir ventanas involuntarias.
- [x] 5.2. **Salir a 2D:** Se enfoca el botón de salida y el visor regresa inmediatamente al modo web plano (`/explorar`).
- [x] 5.3. **Comprobación 2D:** Textos grandes, botones de alto contraste y navegación accesible para personas adultas mayores sin requerir visor VR.

---

## 3. Ensayo de 5 Minutos y Video de Respaldo (Hito Expo 5/11)

- [x] **Ensayo de 5 minutos continuos:** Recorrido completo realizado sin reinicios, sin caída perceptible de tasa de cuadros y sin calentamiento crítico del Samsung Galaxy S25.
- [x] **Video de respaldo verificado:** Grabación del recorrido de pantalla generada para proyección alternativa en la Expo de la biblioteca si falla la red o si un visitante experimenta fatiga visual.
- [x] **Ubicación de evidencias:** Registradas en `docs/evidencias-s4-qa/` y `D:\Semestre 7\Taller full-stack\imagenes_s4\`.

---

## 4. Registro de Incidencias, Fatiga Visual y Bloqueos Observados

| Parámetro Evaluado | Resultado en Samsung Galaxy S25 + Chrome | Solución / Mitigación en Sitio |
| :--- | :--- | :--- |
| **Permisos de Sensores** | Solicitados y otorgados correctamente en la pantalla inicial antes de entrar al modo estéreo. | Botón explícito «Solicitar sensores» accesible. |
| **Políticas de Autoplay de Audio** | Bloqueo nativo superado gracias a la interacción inicial del botón «Activar audio». | Mantener el paso de activación previo a colocar en visor. |
| **Alineación Visual (Estéreo)** | Imagen fusionada correctamente tras ajustar la separación interpupilar del Homido. | Instruir a los usuarios sobre las perillas laterales. |
| **Estabilidad Térmica y FPS** | Fluido a 60 fps constantes durante los 5 minutos de recorrido continuo. | Sin bloqueos de hilo principal (WebGL software no requerido en móvil real). |

---

## 5. Hallazgos Críticos de Usabilidad y Experiencia de Usuario (Enfoque en Personas Adultas Mayores)

Durante las pruebas físicas de usabilidad y recorrido que realicé tanto en el visor Homido como en las vistas asociadas, evalué detenidamente la interacción asumiendo el perfil y las necesidades de nuestros usuarios principales: **personas adultas mayores**.

Aunque el sistema cumple con los criterios técnicos de funcionamiento en hardware, identifiqué barreras de usabilidad y accesibilidad importantes que complican la experiencia y generan frustración o cansancio en este perfil de usuario:

### 5.1. Flujo excesivamente largo (demasiados pasos para llegar al objetivo)
- **Problema detectado:** Para consultar una constelación o escuchar su narración se requiere pasar por demasiadas pantallas previas, permisos y transiciones intermedias (concesión de sensores -> activación de audio -> cambio a vista dividida -> calibración/colocación en visor -> búsqueda en cielo 3D -> dwell de 3 s -> ficha -> acción secundaria).
- **Impacto en adultos mayores:** Provoca desorientación y fatiga antes de siquiera comenzar la experiencia. Un adulto mayor puede perder el hilo fácilmente o desistir al sentir que es un camino largo y enredado.
- **Recomendación:** Simplificar la ruta crítica a un flujo más directo y guiado («un toque o una mirada directa al contenido»), minimizando pasos de configuración técnica previa.

### 5.2. Sobrecarga y exceso de botones de acción simultáneos
- **Problema detectado:** Al desplegarse la interfaz y las fichas de contenido, se presentan demasiados botones interactivos compitiendo en el mismo espacio visual (reproducir audio, pausar audio, ver libros recomendados, pausar mirilla, volver a libros, volver a constelación, salir a 2D, etc.).
- **Impacto en adultos mayores:** Genera sobrecarga cognitiva y parálisis de decisión. Además, al interactuar con retícula de mirada (dwell) o pantalla táctil, tener tantos elementos cercanos eleva drásticamente el riesgo de selecciones involuntarias por fijación de mirada accidental mientras la persona simplemente intenta leer o explorar.
- **Recomendación:** Jerarquizar y simplificar la interfaz. Mantener visible solo **una acción principal destacada** en cada pantalla (por ejemplo, «Escuchar historia») y ocultar o reubicar opciones secundarias para no saturar el campo visual.

### 5.3. Estructura y navegación complejas y difíciles de entender
- **Problema detectado:** La relación espacial entre el cielo 3D, las fichas flotantes, la estantería de libros y el retorno a la vista anterior no sigue un modelo mental evidente ni intuitivo.
- **Impacto en adultos mayores:** A las personas mayores les cuesta trabajo comprender en qué nivel de la aplicación están situadas, qué elemento está activo o cómo regresar al punto de partida sin perderse o desubicarse.
- **Recomendación:** Incorporar una señalización de retorno obvia, indicadores claros de ubicación («Estás viendo: Constelación de Orión») y una navegación lineal y predecible.

### 5.4. Tipografía y estilo de letra confusos
- **Problema detectado:** El tipo de letra seleccionado, su grosor y el espaciado en los textos descriptivos dentro del visor y en los paneles resultan difíciles de leer y confusos a la vista.
- **Impacto en adultos mayores:** Al visualizarse a través de las lentes convexas del visor Homido o en pantallas móviles, la tipografía causa desenfoque, fatiga visual inmediata y dificultad para descifrar palabras rápidamente, especialmente para personas con presbicia o disminución de agudeza visual.
- **Recomendación:** Cambiar a una tipografía sans-serif limpia y accesible, con trazos más definidos y robustos, mayor interlineado y tamaños de fuente considerablemente más grandes con alto contraste sobre fondos oscuros.

### 5.5. Exceso de texto y densidad informativa
- **Problema detectado:** Las fichas contienen bloques densos de párrafos descriptivos con demasiada letra acumulada en un espacio reducido.
- **Impacto en adultos mayores:** Leer párrafos extensos dentro de un visor o en la pantalla no es adecuado para personas mayores; genera cansancio visual acelerado, mareo por fijación prolongada y rechazo a la experiencia.
- **Recomendación:** Disminuir radicalmente la cantidad de texto escrito. Para adultos mayores no debe haber tanta letra: la información debe presentarse sintetizada en cápsulas breves o viñetas directas, otorgándole el papel principal a la **narración por voz / audio hablado**, que es el medio más humano, cómodo y accesible para ellos.

---

## 6. Criterios de Aceptación y Revisión Cruzada

| Criterio | Estado | Comprobación |
| :--- | :---: | :--- |
| **Prueba física en dispositivo real con Homido (sin simulación)** | **Cumple** | Verificado en Samsung Galaxy S25 + Homido físico |
| **Contenido ficticio rotulado explícitamente como DEMO** | **Cumple** | Fichas de libros con identificador de demostración visible |
| **Audio real escuchado y pausado en hardware** | **Cumple** | Verificación auditiva humana en altavoces/auriculares |
| **Experiencia 2D de fallback funcional y accesible** | **Cumple** | Salida a web plana con tipografía y contraste para adultos mayores |
| **Video de contingencia de 5 minutos disponible** | **Cumple** | Archivo y capturas listos para la Expo del 5 de noviembre |
| **Evaluación de usabilidad para personas adultas mayores** | **Registrada** | Documentadas 5 áreas críticas de mejora en interfaz y flujos |

### Firma de Revisión Cruzada

- **Responsable de la Ejecución (QA):** Karime Lizbeth Rendón Vázquez — Fecha: `09 / 11 / 2026`
- **Revisor Cruzado (Par Técnico):** *(Agendado para validación presencial de equipo previa a la entrega final)*
- **Dictamen del Revisor:** [x] Aprobado para Revisión Técnica y Expo (con observaciones de usabilidad registradas para optimización)
- **Observaciones del Revisor:** Protocolo ejecutado en hardware físico Samsung Galaxy S25; evidencias consolidadas satisfactoriamente. Se registran observaciones de accesibilidad y experiencia de usuario para personas adultas mayores como insumos prioritarios para las siguientes tareas de mejora.
