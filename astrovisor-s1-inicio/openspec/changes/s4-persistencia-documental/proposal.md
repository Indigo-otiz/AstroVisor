# Proposal — S4: persistencia documental

Estado vigente: Etapa 1 publicada como `735fd4b1413e5cd98387e297716f3d4c76cac52d` sobre la base `f1058c9b10641c470d7d3e331a81f327af78fc8c`. El usuario revisó Etapa 2A y autorizó su auditoría final y publicación si no aparecen bloqueantes; autenticación local sin base de datos validada según `docs/PRUEBA-S4-ETAPA2A.md`. CRUD documental, migración de estantería, portadas, exportaciones Homido, alojamiento independiente, merge y archivo OpenSpec continúan fuera de alcance.

## Why

La estantería #6 importa un catálogo estático, Homido lee otro contrato y el panel consulta Supabase. El repositorio documental solo lee: actualmente no hay edición JSON persistente. Ver [evidencia de validación](../../../docs/VALIDACION-PR6.md).

## What Changes

- Separar un catálogo inicial versionado de una fuente JSON persistente de ejecución, fuera de Git y del directorio público. Inicialización explícita sin sobrescribir datos existentes; conservar campos y metadatos y proyectar los contratos de lectura existentes.
- Añadir edición administrativa validada, revisión optimista, guardado atómico, respaldo privado y recuperación comprobable después de reinicio.
- Sustituir la lectura bibliográfica directa de `fichas_libros` por API documental; separar esa persistencia de la autenticación existente.
- Conservar la evaluación histórica de identidad y aplicar la decisión posterior del usuario: configuración privada con hashes y sesiones Express, sin dependencia obligatoria de Supabase; implementación reservada a la etapa administrativa.
- Conservar íntegros los tres SVG y la presentación #6; generar y servir nuevas cubiertas ilustrativas por endpoint a partir de plantillas permitidas y catálogo runtime, sin recompilar. Registrar tipo y procedencia; dejar selección de originales autorizadas para una mejora posterior.
- Mantener API como origen principal y respaldo estático versionado existente. Sincronización de exportaciones y alojamiento independiente no se implementan en Etapa 1; conservar límites explícitos y no exponer runtime ni backups.
- Conservar historial de URLs divergentes; la corrección autorizada ya está integrada en #6 y alimenta la semilla unificada.
- Registrar, sin implementar aún, footer institucional responsive con activos oficiales pendientes de entrega y aprobación.

## MVP obligatorio y mejoras posteriores

MVP: decisión de identidad aprobada antes de escritura; semilla separada de runtime privado; creación/edición limitada con autorización, validación, revisión optimista, atomicidad, backup/restauración y pruebas de reinicio; portadas ilustrativas dinámicas; web/Homido con IDs estables y respaldo por revisión; preservación de metadatos/audio y regresión de #6. Su cierre exige estas comprobaciones, aunque se pospongan mejoras.

Posteriores: originales autorizadas, footer con logos oficiales, vista comparativa avanzada de conflictos, automatización de copia externa y actualización coordinada de historia/audio. En MVP, conservar la edición ante conflicto, copia externa manual operativa y bloqueo de cambio de historia con audio no actualizado. No se posponen controles de seguridad, persistencia ni integridad.

Fuera de alcance: base de datos nueva para contenidos, préstamos, disponibilidad, registros MARC institucionales inventados, rediseño público, reconstrucción del visor, generación IA, carga libre de archivos, eliminación de contenidos y administración web de cuentas. No mezclar #5 con #6. La admisibilidad académica de Supabase Auth se consulta separadamente, sin asumir una excepción.

## Capabilities

### New Capabilities

- `gestion-documental`: edición autorizada y publicación coherente de un catálogo documental, con relaciones, portadas, preservación de metadatos, recuperación y concurrencia.

### Modified Capabilities

Ninguna especificación consolidada: `openspec list --specs` no devuelve specs. Esta capacidad complementa los cambios abiertos `s3-contrato-json-api-narraciones-libros`, `login-admin-supabase`, `s3-narraciones-audio-visor` e `invitacion-lectura-estanteria-demo`; no duplica su implementación ni autoriza archivarlos.

## Impact

Backend: repositorio documental y API; frontend: servicio bibliográfico, panel y lectura pública; Homido: adaptadores de libros/IDs y respaldo; pruebas de contrato/persistencia; documentación operativa. Matriz precisa en `design.md`.

No se propone otra base de datos para contenidos. La comparación de identidad es documental y no modifica el login existente. No se verificaron políticas desplegadas de Supabase. Hardware y activos institucionales siguen pendientes. `design.md` registra la comparación, la corrección bibliográfica propuesta y las decisiones todavía sometidas a aprobación.
