# Proposal

## Why

Los 15 libros fotografiados y sus asociaciones ya están en `main`, pero las instalaciones con un catálogo privado anterior necesitan importarlos. Los JPEG del lote también requieren recorte y corrección de perspectiva.

## What Changes

- Sustituir las 15 fotografías por sus portadas frontales recortadas y conservar los IDs.
- Completar la importación en catálogos existentes, incluidas las fichas de Can Mayor o el Boyero si hacen falta para guardar las relaciones de sus libros.
- Completar los autores pendientes de libros ya importados con los créditos del inventario.
- Publicar los recortes en una revisión verificable para Homido. Casiopea y el Cisne se cancelaron para este trabajo.

## Capabilities

### New Capabilities

- `sincronizacion-catalogo-publico` — importación del lote de libros y publicación de sus portadas en web y Homido.

### Modified Capabilities

## Impact

Afecta al importador documental, sus instrucciones de operación y los JPEG de `frontend/public/portadas-biblioteca`.
