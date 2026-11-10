# Design: S4 - Menús Homido, salida y control de narración

## Contexto y Restricciones de Diseño

La experiencia inmersiva de AstroVisor para visores Homido se ejecuta como una aplicación WebXR/A-Frame en `frontend/public/prueba-homido/`. En la etapa post-Expo del Sprint 4, el diseño debe atender a las características físicas del visor Homido (lentes biconvexas, soporte sin botones mecánicos directos) y a las necesidades específicas de personas adultas mayores (movilidad cervical moderada, preferencia por textos claros y comprensibles, necesidad de indicaciones no ambiguas).

### Principios Rectores
1. **No interferencia:** No modificar ni duplicar el controlador base de datos ni los activos multimedia existentes.
2. **Claridad conceptual:** Separar de forma tajante la pausa de interacción visual de la pausa del sonido.
3. **Resiliencia ante fallos móviles:** El software debe asumir que los navegadores móviles pueden restringir sensores o silenciar audio sin previo aviso, proveyendo vías de recuperación accesibles.
4. **Higiene de ciclo de vida:** Al pulsar «Salir a 2D», el entorno inmersivo debe cerrarse por completo sin dejar procesos zombis en el dispositivo del usuario.

---

## 1. Máquina de Estados Refinada (`visor-estado.js`)

Se amplía el modelo de estados para distinguir los dos tipos de pausa y registrar fallos recuperables:

```text
       ┌──────────────┐      abrirFicha(id)      ┌──────────────┐
       │  recorrido   │ ───────────────────────> │    ficha     │
       └──────────────┘ <─────────────────────── └──────────────┘
              │               volver()                  │
              │                                         │
              │ (alternarPausaMirada)                   │ (alternarPausaMirada)
              ▼                                         ▼
   [Mirada Bloqueada]                        [Mirada Bloqueada]
   (Retícula inactiva;                       (Ficha visible, botones
    contemplación libre)                      no seleccionables)

   * Estado de Audio independiente:
     - audioEstado: 'detenido' | 'cargando' | 'reproduciendo' | 'pausado' | 'bloqueado' | 'error'
```

### Reglas de Transición
- La acción `pausa-mirada` conmuta el indicador `miradaPausada`. Cuando es `true`, el raycaster / retícula no acumula tiempo de dwell, permitiendo que el usuario mueva la cabeza libremente sin miedo a pulsar opciones.
- La acción `pausa-audio` interactúa exclusivamente con el reproductor de narraciones (`narration.js`).
- El método `permitido(accion, via)` valida si la acción es legal en el modo actual, respetando que `salir` siempre sea accesible tanto por mirada como por toque de pantalla.

---

## 2. Gestión Defensiva de Errores

### A. Sensores de Orientación (`DeviceOrientationEvent`)
- En iOS 13+ y navegadores modernos, `DeviceOrientationEvent.requestPermission` exige un contexto de seguridad (HTTPS) y un gesto de usuario explícito.
- **Tratamiento:** Si el permiso es denegado o no soportado, la pantalla muestra una tarjeta de asistencia:
  - Título: *«No pudimos acceder a los sensores de movimiento»*.
  - Explicación: *«Puedes explorar el cielo arrastrando la pantalla con tu dedo, o continuar en el modo web tradicional.»*
  - Acción: Botón amplio de *«Continuar en modo web 2D»*.

### B. Autoplay y Bloqueo de Audio
- Si el navegador rechaza la promesa de `audio.play()` con un error `NotAllowedError`:
  - El estado del audio cambia a `bloqueado`.
  - El botón de audio en la ficha canvas 3D y en la interfaz cambia su rótulo a: *«Toca la pantalla para activar sonido»*.
  - No se simula reproducción falsa ni se avanza la barra de tiempo.

---

## 3. Protocolo de Desmontaje y Salida Limpia a 2D

Para garantizar un regreso seguro a la interfaz Vue (`/explorar` o `/visor`):

```javascript
export function salirAVista2D(destino = '/explorar') {
  // 1. Detener de inmediato el sonido
  if (window.astrovisorAudioPlayer) {
    window.astrovisorAudioPlayer.detener();
  }

  // 2. Liberar listeners de sensores y orientación
  window.removeEventListener('deviceorientation', manejadorOrientacion);
  window.removeEventListener('devicemotion', manejadorMovimiento);
  document.removeEventListener('visibilitychange', manejadorVisibilidad);

  // 3. Salir de pantalla completa y desbloquear orientación si aplica
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {});
  }
  if (screen.orientation && screen.orientation.unlock) {
    screen.orientation.unlock().catch(() => {});
  }

  // 4. Redirigir a la SPA web
  window.location.replace(destino);
}
```

---

## 4. Ergonomía Visual y Feedback en VR

- **Posicionamiento del HUD:**
  - Botones principales de control (`Pausar mirada`, `Salir a 2D`) fijados a una elevación de $Y = -0.45\,\text{m}$ respecto a la ficha, manteniendo el ángulo de inclinación vertical por debajo de los $20^\circ$ hacia abajo para evitar fatiga cervical.
- **Retroalimentación Auditiva:**
  - Tono agudo de confirmación ($587\,\text{Hz} \to 880\,\text{Hz}$, 160 ms) al completar los 3 segundos de dwell.
  - Tono neutro o doble pulso suave al conmutar la pausa de mirada para dar certeza perceptiva sin requerir quitarse el visor.
