# Prueba de la estantería de lecturas (prototipo)

## Alcance
Desde la ficha 2D de Orión, Osa Mayor o Escorpio, seleccionar «Descubre los libros sobre ...». Se muestra una estantería con tres obras existentes en `content/recorridos.json` y la relacionada con esa constelación aparece primero. Seleccionar una cubierta abre detalle, contexto de demostración y enlace a lectura pública.

## Verificaciones manuales pendientes
1. `/explorar/orion` → CTA → `/biblioteca/orion` → primera lectura de Orión.
2. Cambiar portada mediante toque y teclado, comprobar foco en el detalle.
3. Repetir desde Osa Mayor y Escorpio.
4. Confirmar que al volver se regresa a la constelación.
5. Probar responsive en móvil, contraste, tamaño de las zonas táctiles y lector de pantalla.
6. Confirmar que no se afirma que los ejemplares existan físicamente en la biblioteca.
7. Ejecutar `npm test`, `npm run build` y `openspec validate mejora-invitacion-lectura-estanteria --strict`.

**Estado:** código propuesto en PR; no se han ejecutado pruebas en navegador, móvil ni Homido desde este entorno. La integración con diseños de Figma y el catálogo MARC 21 sigue pendiente.
