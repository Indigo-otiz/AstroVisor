# Capacidad: Navegación de Portada

## Purpose

Proporcionar una entrada accesible y comprensible para personas adultas mayores y visitantes generales, estructurada exactamente en tres accesos principales con navegación directa hacia la experiencia web, la experiencia inmersiva y la administración, garantizando visibilidad inmediata en el primer viewport en escritorio sin desplazamiento vertical.

## ADDED Requirements

### Requirement: Jerarquía visual y visibilidad inmediata en primer viewport
La vista principal `/` SHALL priorizar el acceso a las tres experiencias de exploración situándolas en el primer viewport en resoluciones de escritorio estándar (1366×768 y 1280×800) sin desplazamiento vertical, incorporando el control de proyección en la cabecera general y eliminando bloques decorativos previos.

#### Scenario: Visibilidad en primer viewport en resoluciones de escritorio estándar
- **WHEN** el usuario accede a la portada `/` en resoluciones de 1366×768 o 1280×800
- **THEN** las tres tarjetas de navegación y todos sus botones de acción son visibles simultáneamente dentro del primer viewport, sin requerir desplazamiento vertical (scroll).

#### Scenario: Disposición vertical responsiva en dispositivo móvil
- **WHEN** el usuario accede a la portada `/` en resolución móvil de 390×844
- **THEN** las tarjetas se presentan en una columna vertical continua comenzando inmediatamente después del encabezado breve, con objetivos táctiles de al menos 48 px y sin controles de selección ocultos tras pestañas o carruseles.

### Requirement: Tres accesos principales diferenciados
La vista principal `/` SHALL presentar tres tarjetas de acceso independientes y claramente diferenciadas visualmente y mediante marcado semántico:
1. Experiencia web educativa (`/explorar`).
2. Experiencia VR (con dos acciones directas independientes).
3. Administración (`/admin`).

#### Scenario: Acceso directo a la web educativa
- **WHEN** el usuario hace clic o activa el botón principal de la primera tarjeta
- **THEN** el sistema navega inmediatamente a `/explorar` sin interponer pantallas intermedias.

#### Scenario: Acceso directo a VR monoscópica
- **WHEN** el usuario selecciona «Pantalla completa · mouse o dedo» en la tarjeta de VR
- **THEN** el navegador abre directamente `/prueba-homido/index.html?modo=libre`, cargando la escena 3D ocupando la ventana visible sin paneles de texto externos.

#### Scenario: Acceso directo a VR estereoscópica Homido
- **WHEN** el usuario selecciona «Visor Homido · pantalla dividida» en la tarjeta de VR
- **THEN** el navegador abre directamente `/prueba-homido/index.html?modo=homido`, activando la división estereoscópica y la interacción por orientación y mirada.

#### Scenario: Acceso protegido a administración
- **WHEN** el usuario selecciona «Abrir administración»
- **THEN** el router verifica el estado de autenticación; si no hay sesión activa redirige a `/admin/acceso`, y si la sesión es válida abre `/admin`.

### Requirement: Accesibilidad y navegación por teclado
La interfaz de portada SHALL ser operable mediante teclado con foco visible continuo, tamaño mínimo de objetivos táctiles de 48 px y compatibilidad con tecnologías de asistencia.

#### Scenario: Navegación secuencial por teclado
- **WHEN** el usuario navega utilizando la tecla Tab
- **THEN** el foco visual se desplaza de forma predecible a través de la cabecera, las tres tarjetas, sus botones y la sección inferior de manuales, con un indicador de foco claramente contrastado.
