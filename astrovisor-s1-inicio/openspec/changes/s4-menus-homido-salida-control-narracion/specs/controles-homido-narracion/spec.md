# Controles Homido y control de narración

## Purpose

Garantizar una experiencia de exploración inmersiva robusta, ergonómica y libre de ambigüedades en visores Homido para personas adultas mayores y visitantes de la biblioteca, ofreciendo control independiente de pausas, recuperación asistida ante errores de hardware/audio y un retorno limpio a la interfaz web 2D.

## ADDED Requirements

### Requirement: Diferenciación inequívoca entre pausa de mirada y pausa de narración

El sistema SHALL mantener estados y controles independientes para la interacción por mirada (dwell) y la reproducción de la narración de audio. La activación de la pausa de mirada SHALL congelar el avance de la retícula de selección para permitir la contemplación libre de la bóveda celeste sin alterar la reproducción sonora activa, mientras que la pausa de audio SHALL interrumpir únicamente el sonido sin inhabilitar los menús del visor.

#### Scenario: Pausar la selección por mirada durante una narración activa
- **WHEN** el visitante activa el control «Pausar mirada» mientras una historia se está narrando
- **THEN** el temporizador de la retícula de selección deja de acumular tiempo y no dispara botones accidentales.
- **AND** el archivo de audio de la narración continúa reproduciéndose con normalidad.

#### Scenario: Pausar la narración desde la ficha
- **WHEN** el visitante selecciona el botón «Pausar narración» dentro de la ficha de lectura
- **THEN** el reproductor detiene la emisión de sonido y conserva el punto temporal exacto.
- **AND** la interacción por mirada en el visor continúa habilitada para volver a activar la narración o cerrar la ficha.

### Requirement: Gestión defensiva de fallos de sensores y compatibilidad

El sistema SHALL detectar la ausencia, denegación o bloqueo de permisos para los eventos de orientación y movimiento (`DeviceOrientationEvent` / `DeviceMotionEvent`). Ante un fallo de permisos o falta de soporte del hardware, el sistema SHALL presentar un mensaje claro y comprensible para personas adultas mayores, ofreciendo la navegación táctil alternativa o el regreso directo al modo 2D sin provocar bloqueos de pantalla.

#### Scenario: Permiso de sensores denegado en smartphone
- **WHEN** el navegador móvil rechaza la solicitud de acceso a los sensores del giroscopio
- **THEN** se despliega una tarjeta de aviso que explica la situación en lenguaje accesible.
- **AND** se ofrecen opciones visibles para explorar arrastrando la pantalla con el dedo o regresar a la web convencional.

#### Scenario: Bloqueo de reproducción por política de Autoplay
- **WHEN** el navegador móvil rechaza el inicio de la narración por falta de un gesto directo previo
- **THEN** el sistema actualiza el estado a «Audio bloqueado» y muestra una indicación explícita para tocar la pantalla.
- **AND** no se simula reproducción en progreso ni se altera la legibilidad del texto en pantalla.

### Requirement: Retorno limpio y desmontaje de recursos al salir a 2D

El sistema SHALL proveer una rutina de salida segura («Salir a 2D») accesible en todo momento mediante mirada o toque. Al ejecutarse, el sistema SHALL detener de inmediato cualquier narración en curso, invalidar promesas de reproducción pendientes, remover todos los escuchadores de eventos de sensores y orientación, abandonar el modo de pantalla completa y restaurar la orientación del dispositivo antes de redirigir a la interfaz 2D.

#### Scenario: Salida del visor con narración en curso
- **WHEN** el visitante activa la opción «Salir a 2D» mientras se escucha una narración
- **THEN** el sonido se silencia de inmediato y se descarta cualquier petición de audio pendiente.
- **AND** se remueven los escuchadores de `deviceorientation` y se navega a la vista pública de constelaciones sin errores en consola.

### Requirement: Guías de asistencia y ergonomía visual para personas adultas mayores

Los menús inmersivos en el visor SHALL ubicarse dentro del cono de confort visual vertical (no mayor a 20 grados bajo la línea del horizonte) para prevenir fatiga en el cuello. Los botones interactivos SHALL presentar contraste tipográfico elevado, dimensiones angulares amplias y confirmación sonora sutil mediante tonos sintetizados al conmutar estados o confirmar selecciones.

#### Scenario: Confirmación de acción en el visor
- **WHEN** el visitante mantiene la mirada sobre una opción durante los 3 segundos reglamentarios
- **THEN** se emite un tono suave de confirmación a través de Web Audio API.
- **AND** el cambio visual del botón o estado se refleja de forma inmediata y nítida en ambos ojos.

### Requirement: Verificación, evidencias y revisión cruzada de Sprint 4

La entrega de la tarea S4 SHALL acompañarse de pruebas automatizadas en verde (`npm test` y `npm run test:web`), compilación exitosa y una bitácora de validación en `docs/PRUEBA-S4-HOMIDO.md` que registre los resultados de la prueba física en smartphone con visor Homido y la revisión cruzada de otro integrante del equipo.

#### Scenario: Cumplimiento de criterios de aceptación de S4
- **WHEN** se evalúa el cierre de la tarea asignada a Carlos
- **THEN** se comprueba la ejecución exitosa de la suite completa de pruebas automáticas.
- **AND** se verifica la existencia de la evidencia física y la aprobación de la revisión cruzada en la documentación del repositorio.
