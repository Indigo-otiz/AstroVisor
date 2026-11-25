# Design: Arquitectura de Pestañas y Armonización Visual del Panel

## Enfoque de Navegación

En lugar de presentar una página administrativa de longitud indeterminada, el panel se estructura en dos sub-vistas conmutables al instante mediante estado local de Vue (`tabActiva`), garantizando que la memoria de scroll y el enfoque del usuario se mantengan siempre en la tarea específica (gestión bibliográfica o de constelaciones).

## Paleta de Color y Confort Visual

Se abandona el uso de amarillos y dorados de alta saturación (`#facc15`, `#fde047`, `#713f12`), así como los fondos azul marino eléctrico. La nueva paleta utiliza:
- Fondo espacial profundo: `radial-gradient(circle at 50% 25%, #0e1c3e 0%, #060b18 100%)`.
- Superficies de tarjetas y controles: pizarra/carbón neutro (`#1e293b`, `#0f172a`, bordes `#334155`).
- Fondos de medios bibliográficos: `radial-gradient(circle at 50% 50%, #f8fafc 0%, #e2e8f0 100%)`, proporcionando luz difusa sin encandilar.
- Indicadores de éxito: verde esmeralda suave (`#14532d`, `#f0fdf4`, borde `#bbf7d0`).
