# AstroVisor — reglas para Codex

## Objetivo
Construir **una demostración local de viabilidad técnica** para la primera revisión de la materia Taller Full Stack. El producto final AstroVisor tendrá web de divulgación astronómica, experiencia Homido y panel administrativo con autenticación; **esta primera demo no es el producto final**.

## Decisiones PROVISIONALES para la demo
- UI: React + Vite + TypeScript.
- 3D: Three.js.
- API: Node.js + Express; preferir TypeScript con `tsx` para desarrollo.
- Fase posterior: PostgreSQL, solamente cuando la primera demo esté funcionando y el equipo confirme su uso.

## Primera iteración obligatoria
- Debe funcionar sin base de datos, proveedor cloud ni servicios de pago.
- Página responsiva titulada AstroVisor con listado de al menos tres planetas de demostración.
- `GET /api/health` y `GET /api/planets` en Express; datos de demostración en archivo JSON o memoria.
- La web consume realmente `GET /api/planets`, muestra estados de carga y error.
- Seleccionar un planeta cambia sus datos y muestra una escena simple de Three.js con esfera 3D y controles de cámara.
- Incluir estructura mínima de monorepositorio, comandos reproducibles y README.

## Límites estrictos
- No crear cuentas de visitantes, ni sistema de préstamos, ni catálogo bibliográfico real.
- No afirmar que ya existe modo VR/Homido, autorización administrativa o PostgreSQL si aún no se ha implementado y probado.
- No construir panel administrativo ni prometer seguridad en esta iteración; se diseñará después.
- No usar imágenes, videos o audios de licencia desconocida. En la primera demo utilizar geometría 3D generada y texto didáctico de ejemplo.
- No introducir claves ni secretos en el repositorio. Crear `.env.example` si hace falta.
- No reemplazar archivos del usuario existentes sin revisión previa. No hacer commits remotos ni desplegar sin autorización.

## Calidad
- Priorizar facilidad de ejecución y legibilidad del código.
- Dejar `npm run dev`, `npm run build` y los comandos para probar endpoints documentados.
- Ejecutar comprobaciones realmente y describir su resultado; si fallan o no es posible ejecutarlas, especificar el problema sin inventar éxito.
- Crear un registro simple `docs/DECISIONES.md` con supuestos, decisiones y pendientes.
- Antes de agregar más funciones, entregar un resumen de cambios y cómo demostrar el flujo completo.
