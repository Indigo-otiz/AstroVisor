# Capability: controles-audio-experiencias

## Purpose
Proporcionar controles de audio simplificados y reconocidos intuitivamente mediante iconografía estándar en todas las versiones del sistema.

## Requirements

### Requirement: Iconos universales de control de audio
Las interfaces que ofrecen reproducción de narraciones astronómicas SHALL mostrar iconos universales reconocidos (`▶` para reproducir/escuchar, `⏸` para pausar y `↺` para repetir) reduciendo la sobrecarga de texto de los botones.

#### Scenario: Estado de reproducción
- **WHEN** el audio está activo y reproduciéndose
- **THEN** el control muestra el icono `⏸` indicando la acción de pausar.

#### Scenario: Estado en pausa o detenido
- **WHEN** el audio está en pausa o listo para comenzar
- **THEN** el control muestra el icono `▶` indicando la acción de reproducir o reanudar.
