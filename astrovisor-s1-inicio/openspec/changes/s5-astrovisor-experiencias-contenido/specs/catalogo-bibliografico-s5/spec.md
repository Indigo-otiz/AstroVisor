# Capacidad: Catálogo Bibliográfico S5 y Flexibilización Segura

## Purpose

Permitir la gestión de libros en el catálogo documental admitiendo registros sin año de publicación confirmado, manteniendo la integridad referencial, la validación estricta y la trazabilidad de campos demostrativos / MARC 21.

## ADDED Requirements

### Requirement: Flexibilización del campo año en alta y edición
El sistema SHALL permitir el alta y la edición de libros sin especificar el año de publicación cuando este dato no esté verificado.

#### Scenario: Alta de libro sin año
- **WHEN** un administrador registra un libro completando título, autor, constelación asociada, motivo de recomendación y enlace HTTPS válido, dejando el año en blanco
- **THEN** el sistema guarda el registro omitiendo el campo `anio` (o persistiendo `undefined`), sin serializar el número `0` ni el valor `NaN`.

#### Scenario: Consulta de libro sin año
- **WHEN** se consulta por API o interfaz un libro que carece de año
- **THEN** la ficha web y la estantería muestran los datos existentes sin desplegar «Año: 0» ni leyendas anómalas.

### Requirement: Preservación del contrato de enlace y MARC 21 DEMO
El sistema SHALL preservar la obligatoriedad del enlace público HTTPS y la estabilidad de identificadores técnicos y marcas de demostración.

#### Scenario: Validación de enlace público HTTPS
- **WHEN** se envía un formulario con el campo de enlace vacío o con protocolo no seguro
- **THEN** el sistema rechaza la operación informando el requisito de URL HTTPS válida.

#### Scenario: Integridad de metadatos MARC 21 DEMO
- **WHEN** se guardan o consultan libros existentes
- **THEN** los campos `marc21.campo001: "DEMO-001"` y `marc21.campo003: "DEMO"` se conservan intactos sin generar números ficticios de catálogo institucional.
