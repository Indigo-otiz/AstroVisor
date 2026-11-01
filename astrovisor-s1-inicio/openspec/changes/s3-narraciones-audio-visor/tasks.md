# Tasks

Seguimiento de calidad: Luis solicitó sustituir los audios Piper por considerarlos robóticos y eligió «Femenina, cálida y tranquila». Se aplica Kokoro ef_dora con fonética es-419 y WAV versionados; se conservan los guiones y controles aprobados. La selección de voz no acredita escucha completa de las tres nuevas narraciones ni cierra los pendientes de autoría/permiso, móvil/Homido y revisión cruzada.

Solicitud de cierre completada: Luis expresó conformidad, confirmó las pruebas y declaró autoría del equipo. Indicó iPhone 13 con Chrome/Safari y «oppo 15a» con «google»; se preservan esas denominaciones y las versiones no especificadas. Su validación se registra como la del responsable Luis Alberto Rodríguez. Identificó a **Índigo Ortiz** como el otro integrante que revisó S3. Cierre académico registrado el 31 de octubre de 2026, con fuente y límites en `docs/PRUEBA-S3.md`, `docs/evidencias/s3/validacion-reportada.json` y `content/AUTORIA.md`. El archivo interno de OpenSpec se gestiona por separado.

## 1. Preparación y contenidos reales

- [x] 1.1 Tras la aprobación del plan, crear o seleccionar la rama `codex/s3-narraciones-audio-visor` y verificar estado Git, conservando los archivos ajenos en `entregables/`.
- [x] 1.2 Confirmar con Luis el origen de los tres guiones y su autorización, y documentar texto/voz/permiso en el registro de contenidos; verificar que no se atribuyen autorías o aprobación institucional sin fuente.
- [x] 1.3 Producir tres archivos locales de voz de los guiones confirmados con transcripciones exactas, créditos y rótulos de demostración/síntesis cuando aplique; verificar existencia, formato, duración y escucha inteligible completa de cada uno, dejando pendiente cualquier comprobación audible que no se pueda ejecutar.
- [x] 1.4 Incorporar metadatos opcionales de audio en `content/recorridos.json` y documentar su contrato en `content/README.md`; verificar rutas/archivos, transcripciones y permisos con pruebas documentales, admitiendo `multimedia: []` y conservando historias ante audio inválido.

## 2. Reproductor compartido y activación

- [x] 2.1 Crear el controlador de un solo medio con estados de carga, reproducción, pausa, finalización, bloqueo y fallo; verificar con pruebas Node las transiciones, pausa/posición y reinicio tras fin.
- [x] 2.2 Implementar detención e invalidación de solicitudes pendientes; verificar con pruebas de carreras que cerrar, cambiar recurso o destruir durante play/carga no reactiva audio ni mezcla estados del recurso anterior.
- [x] 2.3 Implementar Activar audio y recuperación mediante gesto explícito, contrastando la estrategia con documentación oficial de los navegadores; verificar manejo de rechazo sin estado falso de reproducción y documentar el procedimiento y sus límites en `docs/PRUEBA-S3.md`.
- [x] 2.4 Integrar ciclo de vida `pagehide` y pausa al ocultar página, retirando listeners al destruir; verificar pruebas de eventos simulados y distinguirlas de escucha real en el registro S3.

## 3. Ficha web y lectura accesible

- [x] 3.1 Añadir Escuchar, Pausar, Reanudar, transcripción, créditos y mensajes de estado a la ficha Vue existente; verificar con API y archivo real que se puede reproducir, pausar y continuar sin visor ni sensores.
- [x] 3.2 Detener al cambiar constelación o abandonar la ficha; verificar en navegador navegación directa, atrás/adelante y salida mientras reproduce o carga, documentando resultados en `docs/PRUEBA-S3.md`.
- [x] 3.3 Conservar lectura ante archivo ausente, metadatos inválidos, descarga fallida y bloqueo de play; verificar casos controlados sin invalidar historias y extender las pruebas de contrato del cliente.
- [x] 3.4 Verificar teclado, foco visible, controles de 48 px, ancho 360 px y texto al 200 %; guardar capturas/mediciones e identificar si la ampliación fue zoom nativo o simulación.

## 4. Fichas y controles 3D mínimos

- [x] 4.1 Añadir las tres constelaciones y fichas a la escena A-Frame reutilizando sensores, cursor y vista dividida; verificar apertura por mirada y fichas visibles en ambas cámaras, con controles DOM equivalentes y lectura disponible si falla A-Frame.
- [x] 4.2 Conectar Escuchar, Pausar, Reanudar y Cerrar por mirada y tacto al mismo controlador; verificar una acción por selección, controles inactivos fuera del raycaster y ausencia de selección de objetivos detrás de la ficha.
- [x] 4.3 Detener al cerrar ficha, seleccionar otra constelación, salir de vista dividida o abandonar la página; verificar con archivos reales cada recorrido incluyendo cambios durante carga, conservando retorno a 2D.
- [x] 4.4 Actualizar instrucciones de `/visor` y del experimento para distinguir narración S3 y diagnóstico S1; verificar enlaces, errores/reintento de consulta y regreso a lectura web, documentando capturas y límites ópticos pendientes.

## 5. Integración y evidencia de aceptación

- [x] 5.1 Ejecutar `npm test`, `npm run test:web`, `npm run build`, comprobación de sintaxis del JS independiente y `git diff --check`; verificar además que el build servido carga módulo de audio y tres archivos reales y registrar resultados con versión y fecha efectiva.
- [x] 5.2 Ejecutar el protocolo físico HTTPS en iPhone Safari y/o Android Chrome con Homido: gesto Activar audio, apertura y controles por mirada, pausa/reanudación, cierre, cambio y salida; registrar teléfono, navegador, versión y evidencia real de sonido, dejando explícitos los casos no probados o fallidos.
- [x] 5.3 Obtener revisión cruzada de otro integrante sobre versión, audio real, transcripciones, permisos y recorridos; registrar identidad, resultado, incidencias y evidencia o fuente de la confirmación sin simular aprobación.
- [x] 5.4 Consolidar `docs/PRUEBA-S3.md` y `docs/evidencias/s3/` con versión o manifiesto, resultados técnicos/físicos y revisión cruzada; verificar que S3 siga pendiente si falta cualquier evidencia exigida, que video permanezca pospuesto y que OpenSpec no se presente como entregable académico. No archivar sin aprobación de Luis.
