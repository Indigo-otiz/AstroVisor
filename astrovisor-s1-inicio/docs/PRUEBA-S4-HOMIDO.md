# Evidencia de controles, salida y recuperación en Homido (Sprint 4)

Responsable académico: **Carlos Martínez Orozco**.  
Periodo base: **2–6 de noviembre de 2026** (refinamiento post-Expo 5/11).  
Ámbito: Escena inmersiva A-Frame (`/prueba-homido/`), desmontaje a 2D, feedback auditivo y manejo de errores.

---

## 1. Contexto y Auditoría Post-Expo

Durante la Expo del 5 de noviembre de 2026 se utilizó la versión de controles mínimos adelantada en el hito S3 por Luis e Índigo. Concluida la presentación, este incremento de Sprint 4 se concentró en la auditoría técnica, la resolución de problemas no críticos observados y el robustecimiento de la experiencia sin alterar la base funcional estable:

| Aspecto | Estado previo (S3) | Refinamiento aplicado en S4 |
| :--- | :--- | :--- |
| **Pausa de mirada** | Existía botón 3D y desacoplamiento de audio, pero conmutaba en silencio. | Se incorporó **retroalimentación sonora sutil** (Web Audio API, tono descendente 440→311 Hz para pausa y ascendente 311→440 Hz para reanudar), brindando certeza perceptiva dentro del visor. |
| **Salida a 2D** | Redirección directa por `window.location.href`. | Se implementó la rutina **`desmontarVisor()`**, que remueve activamente los event listeners de orientación (`window.removeEventListener('deviceorientation', ...)`), libera bloqueos de pantalla (`wakeLock`) y cancela pantalla completa antes de navegar. |
| **Fallo de carga en 3D** | El error se emitía en un `<p>` HTML invisible bajo el visor. | Se implementó **`mostrarAvisoError3D()`**, proyectando un cartel legible de alta accesibilidad en el espacio 3D frente al usuario con el botón interactivo «Salir a 2D». |
| **Control de narración** | Contrato respetado: pausar la mirada no altera la reproducción de voz. | Se preserva la independencia del reproductor y se garantiza el silencio inmediato al invocar la salida. |

---

## 2. Comprobaciones Automatizadas y Compilación

Ejecutadas desde la raíz del monorepo (`astrovisor-s1-inicio`):

```powershell
npm.cmd test
npm.cmd run test:web
npm.cmd run build
```

### Resultados Obtenidos
- **Backend:** 8/8 pruebas aprobadas (contrato documental, sesiones criptográficas y autenticación).
- **Frontend:** 97/97 pruebas aprobadas (incorporando 4 nuevas pruebas en `frontend/test/homido-controles-s4.test.js`).
- **Compilación de producción:** `vite build` completado exitosamente en 1.70 s sin advertencias críticas de módulos.
- **Validación de cambio OpenSpec:** `npx @fission-ai/openspec validate s4-menus-homido-salida-control-narracion --strict` aprobado.

---

## 3. Protocolo de Comprobación Física en Homido

Para la repetición y verificación en dispositivo móvil físico:

1. **Gesto de activación:** Abrir `/prueba-homido/` mediante HTTPS en Safari (iOS) o Chrome (Android) y pulsar «Activar audio» y «Solicitar sensores».
2. **Entrada a vista dividida:** Pulsar «Probar vista dividida», girar a horizontal y colocar el smartphone dentro del visor Homido.
3. **Pausa de mirada:** Enfocar durante 3 segundos el botón «Pausar mirada». Constatar el tono descendente de confirmación y verificar que al mover la cabeza sobre constelaciones la retícula no acumula tiempo de dwell.
4. **Reanudación:** Enfocar «Reanudar mirada», escuchar el tono ascendente y comprobar que la selección vuelve a activarse.
5. **Independencia de sonido:** Abrir una constelación, iniciar narración y alternar la pausa de mirada; verificar que la narración de audio continúa sin interrupciones.
6. **Salida limpia:** Enfocar «Salir a 2D»; constatar que el audio se silencia al instante, la pantalla completa se libera y el navegador regresa a la vista de constelaciones web 2D (`/explorar`).

---

## 4. Revisión Cruzada de la Entrega

- **Responsable de la implementación:** Carlos Martínez Orozco.
- **Revisores designados para cruce:** Índigo Andre Ortiz Vega / Luis Alberto Rodríguez.
- **Dictamen:** Implementación no invasiva, respeta el principio de no duplicación de controladores y resuelve los fallos no críticos de higiene de procesos y feedback dentro del visor.
