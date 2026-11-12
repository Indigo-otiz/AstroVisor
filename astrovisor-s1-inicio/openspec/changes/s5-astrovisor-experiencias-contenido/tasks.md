# Tasks — S5: AstroVisor — Tareas de Implementación y Validación

## 1. S5-07: Matriz de Contenido y Trazabilidad (Índigo)
- [x] 1.1 Documentar la matriz formal de contenido por experiencia (Web, VR libre, Homido, Admin) en la propuesta y documentación técnica.
- [x] 1.2 Verificar que el catálogo runtime y las semillas no sufran modificaciones destructivas en sus transcripciones o textos.

## 2. S5-01: Diseño de Portada, UX/UI y Accesibilidad (Karime)
- [ ] 2.1 Diseñar la arquitectura visual de tres tarjetas de acceso directo con alto contraste y lenguaje claro para adultos mayores.
- [ ] 2.2 Diseñar la presentación de las dos acciones directas de la tarjeta VR («Pantalla completa · mouse o dedo» y «Visor Homido · pantalla dividida»).
- [ ] 2.3 Validar que el salto de foco y la navegación por teclado (Tab/Shift+Tab/Enter) funcionen sin pérdidas de foco tras cambios de ruta.
- [ ] 2.4 Verificar contrastes cromáticos y objetivos táctiles mínimos de 48 px en botones de navegación y acciones principales.

## 3. S5-03: Implementación Web y Contrato Bibliográfico (Carlos)
- [ ] 3.1 Implementar en `InicioView.vue` las tres tarjetas principales conectadas a `/explorar`, enlaces directos a `/prueba-homido/` y `/admin`.
- [ ] 3.2 Modificar `AdminPanelView.vue` para hacer el campo `año` opcional en el formulario de alta y edición de libros.
- [ ] 3.3 Ajustar `useEditorCatalogo.js` y `catalogoAdminService.js` para evitar enviar `anio: 0` o `NaN` cuando el año se omite.
- [ ] 3.4 Verificar que `catalogoEdicion.js` en el backend persista correctamente libros sin año y pase las pruebas unitarias.
- [ ] 3.5 Preservar el requisito obligatorio del enlace público HTTPS y los identificadores estables (`slug`, `DEMO-001`).

## 4. S5-02: Experiencias VR Directas, Cielo Visible y Audio (Luis)
- [ ] 4.1 Añadir soporte en `prueba.js` para los parámetros de URL `?modo=libre` (3D monoscópico estándar) y `?modo=homido` (pantalla dividida automática).
- [ ] 4.2 Ocultar paneles HTML de depuración (`.site-header`, `.controls-panel`, `.reading-panel`, `.log-panel`) en el flujo público, ocupando el 100% del viewport.
- [ ] 4.3 Preservar el modo de diagnóstico completo cuando se pase el parámetro `?diag=1`.
- [ ] 4.4 Modificar `abrirFicha()` en `prueba.js` para mantener visible el grupo de constelaciones (`constelacionesEl`) y resaltar la figura seleccionada.
- [ ] 4.5 Rediseñar `ficha-canvas.js` para mostrar controles compactos de narración: Escuchar, Pausar / Reanudar y Repetir desde el principio.
- [ ] 4.6 Desacoplar «Pausar mirada» de la narración de audio en `prueba.js` (detener la selección no interrumpe el sonido).
- [ ] 4.7 Simplificar la vista de libros en la escena VR para mostrar exclusivamente portada, título, autor y etiqueta DEMO.
- [ ] 4.8 Garantizar que el botón «Salir» y «Volver» detengan adecuadamente el audio y retornen al recorrido web o al inicio.

## 5. S5-05: Manuales en Video (Karime coordina; todos colaboran)
- [ ] 5.1 Redactar los tres guiones técnicos detallados para los manuales en video: Web educativa, Recorrido VR (ambos modos) y Administración.
- [ ] 5.2 Implementar en `InicioView.vue` el componente accesible de manuales en video, con títulos pedagógicos, transcripciones y controles de reproducción.
- [ ] 5.3 Registrar formalmente el estado de producción de las grabaciones como **`PENDIENTE DE GRABACIÓN`** con su justificación técnica, sin marcar la tarea como terminada ficticiamente.

## 6. S5-06: Créditos e Identidad Institucional (Karime coordina; todos colaboran)
- [ ] 6.1 Integrar la sección visible de créditos académicos del Equipo 8 en el pie de página de la web y en la vista de inicio.
- [ ] 6.2 Incorporar el logotipo del Instituto Tecnológico de Tepic (`ITTepic_logo.jpg`) en la escena VR dentro del plano de controles / salida de forma no obstructiva.
- [ ] 6.3 Documentar como **`BLOQUEADA EXTERNAMENTE`** la inclusión de los logotipos de CECAN y Gobierno hasta contar con archivos aprobados y autorización formal.

## 7. S5-04: Integración, Regresión y Pruebas Transversales (Índigo)
- [ ] 7.1 Ejecutar batería de pruebas unitarias de backend (`npm test`) y verificar suites de persistencia y catálogo.
- [ ] 7.2 Ejecutar pruebas de frontend (`npm run test:web`) y verificar suites de componentes y navegación.
- [ ] 7.3 Ejecutar compilación de producción (`npm run build`) y verificar ausencia de errores de empaquetado.
- [ ] 7.4 Validar la matriz de casos de prueba T01 a T25 registrando el resultado obtenido por caso.
- [ ] 7.5 Validar formalmente la especificación con `openspec validate s5-astrovisor-experiencias-contenido --strict`.
