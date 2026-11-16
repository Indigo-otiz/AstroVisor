# Design

## Context

La API lee `catalogo.json` en `ASTROVISOR_DATA_DIR`. El importador actual requiere que existan todos los recorridos mencionados por los libros. Homido usa paquetes inmutables identificados por la revisión documental.

## Goals / Non-Goals

**Objetivos.** Completar el lote de libros y sus asociaciones en instalaciones existentes, y servir las portadas recortadas tanto en la web como en Homido.

**Fuera de alcance.** Nuevas constelaciones, cambios en la escena, rediseño de fichas y ampliación bibliográfica.

## Decisions

1. Partir del `main` vigente en una copia aislada. Conservar los IDs del catálogo y los nombres de las 15 fotografías.
2. Incorporar desde la semilla solo las fichas faltantes que los libros ya referencian. Añadir libros y relaciones por ID en la misma operación del escritor documental.
   En esa operación se completan los autores que tengan el valor «Autor sin confirmar» cuando el inventario contiene un crédito confirmado para el mismo ID.
3. Guardar en el catálogo privado la huella del lote de JPEG. Si solo cambian las fotos, el escritor genera la revisión que el exportador necesita. Una segunda importación con los mismos archivos conserva la revisión.
4. Reutilizar el exportador de Homido para verificar y publicar los JPEG. Los paquetes anteriores conservan sus archivos.

## Migration Plan

Probar con catálogos nuevo y existente. Usar el directorio de datos de la API, detenerla para que libere el escritor y ejecutar el importador. Reconstruir la web si se sirve el build, iniciar la API con la misma configuración y ejecutar el exportador cuando la instalación tenga respaldo Homido.
