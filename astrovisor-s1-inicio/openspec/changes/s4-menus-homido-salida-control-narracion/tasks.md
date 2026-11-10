# Tasks: S4 - Menús Homido, salida y control de narración

Responsable del Sprint 4: **Carlos Martínez Orozco**.
Periodo base: 2–6 de noviembre de 2026.
Objetivo: Refinamiento de controles, resolución de problemas no críticos post-Expo 5/11, manejo de fallos y retorno limpio a 2D sin alterar la base funcional desarrollada por Índigo y Luis.

## 1. Auditoría de controles existentes y trazabilidad post-Expo

- [x] 1.1 Auditar los controles ya implementados en S3 (`pauseBtn3D`, `exitBtn3D`, ficha de audio en canvas) y verificar que el contrato existente se mantiene intacto.
- [x] 1.2 Documentar las incidencias y observaciones no críticas detectadas durante la demostración física del 3/11 y la Expo del 5/11.

## 2. Refinamiento de interacción y feedback en VR

- [x] 2.1 Agregar retroalimentación sonora suave diferenciada en `alternarPausa()` (`prueba.js`) mediante Web Audio API al conmutar entre «Pausar mirada» y «Reanudar mirada».
- [x] 2.2 Verificar que la retícula central y los aros de dwell permanezcan inactivos visualmente mientras la mirada está en pausa, sin interrumpir la reproducción sonora.

## 3. Manejo de fallos y mensajes dentro de la escena 3D

- [x] 3.1 Implementar un aviso legible en el espacio 3D cuando `cargarDatos()` falle, permitiendo usar «Salir a 2D» en lugar de dejar el cielo vacío en silencio.
- [x] 3.2 Detectar la ausencia de eventos de orientación en dispositivos móviles durante la inmersión y sugerir la interacción por toque o la salida al modo web.
- [x] 3.3 Reforzar el aviso de audio bloqueado en la ficha canvas para instruir claramente a la persona a tocar la pantalla.

## 4. Protocolo de desmontaje limpio en Salir a 2D

- [x] 4.1 Desvincular explícitamente los listeners globales de `deviceorientation` y eventos de ventana al invocar `salir()`.
- [x] 4.2 Asegurar la liberación de recursos de pantalla (`wakeLock`, `exitFullscreen`) antes de ejecutar la redirección hacia `/explorar` o `/visor`.
- [x] 4.3 Confirmar que el evento `astrovisor:salida-visor` silencia inmediatamente cualquier audio activo sin dejar procesos en segundo plano.

## 5. Pruebas automatizadas y build

- [x] 5.1 Crear archivo de pruebas unitarias `frontend/test/homido-controles-s4.test.js` que verifique el desmontaje de listeners, la emisión de eventos de salida y la no regresión de pausas.
- [x] 5.2 Ejecutar la suite completa (`npm.cmd test` y `npm.cmd run test:web`) verificando 100% de pruebas en verde.
- [x] 5.3 Validar la compilación con `npm.cmd run build --workspace frontend`.

## 6. Documentación de evidencias y revisión cruzada

- [x] 6.1 Redactar el informe de validación post-Expo en `docs/PRUEBA-S4-HOMIDO.md` con los resultados en navegador y las limitaciones observadas.
- [ ] 6.2 Registrar el protocolo de prueba física en smartphone con visor Homido.
- [ ] 6.3 Gestionar y registrar la revisión cruzada con otro integrante del equipo (Índigo o Luis).
