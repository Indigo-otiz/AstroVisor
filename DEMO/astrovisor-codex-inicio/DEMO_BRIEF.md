# AstroVisor — alcance de la demo técnica de D3

**Equipo 8 — Taller Full Stack**

## Objetivo de la revisión
Demostrar viabilidad de un stack web con interfaz, visualización 3D y API ejecutándose localmente. La maestra aceptará una demo técnica o pruebas pequeñas de las tecnologías propuestas; no se necesita implementar la plataforma final para esta revisión.

## Contexto de producto (confirmado)
1. AstroVisor tendrá una **experiencia web educativa** para público sin registro.
2. También tendrá **una modalidad inmersiva para teléfonos compatibles con Homido**; el visor no se sincroniza obligatoriamente con la pantalla/proyector.
3. Existirá un **panel administrativo obligatorio** con autenticación exclusiva para administradores (requisito docente), que permite gestionar contenido en la implementación completa.
4. La web vinculará temas de astronomía con libros y sugerirá acercarse a solicitar préstamo; **no gestionará préstamos**.
5. El guion, los contenidos audiovisuales, el catálogo real, el hosting y la integración con BD externa están pendientes.

## Etapas recomendadas

### Etapa 1 — Antes de la revisión (prioritaria)
- Frontend React/Vite con listado y selección de planetas.
- Escena Three.js con geometría generada y controles orbitables.
- API Express `GET /api/health` y `GET /api/planets`.
- Los datos se consultan efectivamente desde la API y se visualizan en la web.
- README, comandos, build y prueba manual.

### Etapa 2 — Si la anterior ya funciona
- PostgreSQL local opcional (Docker si está disponible); una tabla sencilla de planetas y un endpoint que consulte registros reales.
- No bloquear la demo anterior si la BD no funciona: mantener un modo de datos de muestra claramente documentado.

### Etapa 3 — Solo con hardware y tiempo
- Prueba de sensor/orientación en teléfono y posibilidad de vista estereoscópica.
- Verificar HTTPS, permisos de navegador y compatibilidad real con el modelo Homido disponible.
- No llamar "compatibilidad Homido comprobada" a una simulación en escritorio.

## Criterios de aceptación — Etapa 1
- Se puede levantar el frontend y la API con instrucciones del README.
- `GET /api/health` responde sin error.
- `GET /api/planets` devuelve al menos tres elementos con esquema consistente.
- La web muestra datos provenientes de esa petición (no datos duplicados en frontend).
- Seleccionar Marte cambia la ficha informativa y la visualización 3D.
- La web es navegable en escritorio y un viewport móvil; el código compila sin errores.
- Si la API está apagada, se muestra un mensaje de fallo en lugar de una pantalla en blanco.

## Guion oral sugerido (5 minutos)
1. 30 s: objetivo de la demo y stack provisional.
2. 90 s: abrir web, elegir Marte, mover cámara 3D.
3. 60 s: abrir `GET /api/planets` y explicar integración HTTP.
4. 60 s: mostrar archivos del frontend, escena 3D y API.
5. 60 s: explicar que PostgreSQL, modo Homido y panel autenticado se validarán por etapas; diferenciar esta prueba del producto final.

## Reparto posible
- Karime: interfaz y estilos.
- Luis: escena 3D y experimentos de Homido.
- Carlos: API Express.
- Índigo: integración, ejecución, documentación y, si queda tiempo, PostgreSQL.

Este reparto es sugerido solamente para la demo y no sustituye la rotación de roles de D4.
