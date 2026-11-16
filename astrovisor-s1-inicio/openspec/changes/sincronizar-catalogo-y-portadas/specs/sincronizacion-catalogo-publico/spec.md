# Spec Delta

## Purpose

Completar el lote de libros fotografiados de una instalación y servir sus portadas tanto en web como en Homido.

## ADDED Requirements

### Requirement: Importar libros sin perder ediciones previas

La importación SHALL añadir las publicaciones faltantes y vincularlas con los recorridos que ya les corresponden. SHALL conservar los registros existentes y evitar duplicados al repetirse.

#### Scenario: Catálogo creado antes del lote de libros

- **WHEN** se ejecuta el importador sobre un catálogo sin los 15 libros o sin alguno de los recorridos que referencian
- **THEN** la API ofrece una ficha por libro y conserva las relaciones bibliográficas existentes y las del lote.

### Requirement: Publicar portadas recortadas

La web y Homido SHALL mostrar las 15 portadas frontales según los IDs del catálogo.

#### Scenario: Respaldo ya publicado con fotos anteriores

- **WHEN** se importa el lote de imágenes recortadas y se publica el respaldo
- **THEN** el nuevo paquete contiene los JPEG actualizados y el paquete anterior conserva sus recursos.
