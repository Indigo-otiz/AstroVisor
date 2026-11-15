# Tareas

Luis Alberto Rodríguez · Sprint 5 · P0 · Periodo académico original del 9 al 13 de noviembre de 2026. Registrar las fechas efectivas de ejecución y revisión.

## 1. Base y entradas públicas

- [x] 1.1 Tras aprobar el plan, preparar la rama S5 desde el `main` actualizado. Verificar la integración de los PR #9 y #12, el estado de la suite base y la conservación de los archivos locales de otros trabajos.
- [x] 1.2 Añadir a Inicio los accesos directos a la escena monoscópica de pantalla y a la estereoscópica de Homido. Verificar ratón, tacto y apertura directa de ambos enlaces, además del acceso a la lectura 2D y los enlaces históricos.
- [x] 1.3 Separar la activación pública de audio y sensores del diagnóstico explícito. Verificar vista dividida, gesto previo, bloqueo de audio, permiso denegado, recuperación y salida disponible.

## 2. Ficha, audio y libros

- [x] 2.1 Refinar la ficha con figura y cielo visibles, título legible, acción principal de audio y controles secundarios separados. Comprobar ubicación, contraste, legibilidad y zonas activas en navegador, incluyendo que la ficha abierta desactive los objetivos del fondo.
- [x] 2.2 Reusar el narrador y el dwell de 3 s. Implementar y verificar Escuchar, Pausar, Reanudar y Repetir desde cero, salida a 2D y cese al cambiar o cerrar; comprobar independencia de la pausa de mirada, tiempos de selección y ausencia de reactivación tardía.
- [x] 2.3 Reducir el detalle inmersivo de libros a portada, título, autor y DEMO donde aplique. Mantener el detalle 2D y las transcripciones completas; verificar la navegación de ida y vuelta, incluso si el audio no está disponible. Contrastar la matriz y la procedencia con la API y el registro de autoría.
- [x] 2.4 Revisar duración, volumen e inteligibilidad de Orión, Osa Mayor y Escorpio con los audios demo vigentes. Registrar la escucha y las fuentes confirmadas de comentarios que afectaron el alcance. Mantener pendientes las narraciones institucionales sujetas a permisos.

## 3. Verificación y entrega

- [x] 3.1 Ejecutar `npm run test:web`, `npm test`, `npm run build` y `git diff --check`. Añadir cobertura enfocada para el modo y las transiciones nuevas donde las pruebas existentes no las cubran. Probar el build servido, sus rutas históricas y su respaldo público.
- [x] 3.2 Capturar Inicio, pantalla con ratón y viewport táctil, ficha y estereoscopía. Registrar versión, entorno y fecha, selección, pausa, reanudación, repetición, consulta de libros, transcripción y retorno. Distinguir emulación de tacto físico y reproducción técnica de escucha humana.
- [x] 3.3 Registrar la prueba táctil en teléfono real y la emulación de Homido. Cerrar la tarea de S5 por decisión de Luis y aplazar la prueba con visor físico bajo HTTPS hasta que haya equipo disponible.
- [x] 3.4 Actualizar los pasos de la guía pública `/visor` y consolidar la verificación de cierre en `docs/PRUEBA-S5.md` con las evidencias de la versión y los pendientes explícitos.

El 14 de noviembre Luis indicó que, según Índigo, la revisión externa no era necesaria y autorizó continuar el cierre sin otro integrante. Se repitió la verificación de navegador tras corregir la apertura directa del archivo. Se midieron los tres WAV y Luis confirmó que las tres narraciones se entienden y tienen volumen similar en la laptop. También confirmó haber completado el recorrido táctil en un teléfono real, sin visor. Luis confirmó que no dispone de Homido y pidió cerrar S5. La validación física del visor se aplaza para cuando haya equipo. La fuente de comentarios atribuibles a la biblioteca queda pendiente de confirmación.
