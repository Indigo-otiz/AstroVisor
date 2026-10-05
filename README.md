# AstroVisor

AstroVisor es una aplicación web educativa orientada a la exploración astronómica mediante visores Homido y dispositivos móviles.

> **Estado del proyecto:** definición y validación previa al desarrollo.  
> El alcance técnico todavía se está cotejando con la biblioteca antes de cerrar D3 e iniciar implementación.

## Contexto

El proyecto se desarrolla para la materia **Taller de Full Stack**.

La propuesta busca aprovechar los visores Homido disponibles mediante una experiencia astronómica propia, con una interfaz web convencional, una experiencia inmersiva 3D y una ruta 2D de respaldo.

Durante la revisión del proyecto se añadió un requisito de administración de **versiones/configuraciones de experiencia**. AstroVisor deberá poder ofrecer una configuración apropiada según capacidades del dispositivo y necesidades del usuario, pero también permitir acceso a versiones específicas mediante rutas administradas.

La biblioteca se encuentra además en proceso de migración y reestructuración de su base de datos central mediante otro equipo. Por ello, AstroVisor debe quedar preparado para una posible integración futura sin duplicar prematuramente el modelo de cuentas de usuario.

## Objetivo

Desarrollar una aplicación web que permita:

- explorar contenido astronómico desde navegador;
- utilizar un modo 2D funcional;
- utilizar un modo inmersivo 3D en dispositivos compatibles;
- orientar la cámara mediante sensores del smartphone;
- seleccionar elementos mediante mirada;
- detectar capacidades relevantes del dispositivo;
- resolver automáticamente una versión/configuración compatible;
- acceder deliberadamente a una versión específica mediante una ruta habilitada;
- administrar versiones, rutas y disponibilidad desde un panel protegido.

## Usuarios

### Usuario final

Estudiante, visitante o participante que utiliza AstroVisor para explorar contenido astronómico.

En el alcance actual **no se requiere una cuenta de usuario final**.

### Docente / facilitador

Persona que prepara el dispositivo, explica la dinámica y supervisa la experiencia.

### Administrador

Usuario autorizado para gestionar:

- versiones/configuraciones;
- rutas;
- disponibilidad;
- reglas de compatibilidad;
- otros controles administrativos que se confirmen con la biblioteca.

## Versiones/configuraciones de experiencia

Las siguientes variantes son conceptuales y deberán validarse con pruebas y recursos reales:

| Versión | Propósito |
|---|---|
| `2D` | Experiencia convencional para equipos sin modo inmersivo o usuarios que no utilizarán visor |
| `3D-LITE` | Experiencia 3D con menor carga gráfica |
| `3D-STANDARD` | Experiencia inmersiva completa para dispositivos compatibles |
| `REDUCED-MOTION` | Posible variante con menor movimiento o transiciones |

La implementación final puede combinar configuraciones en lugar de mantener aplicaciones separadas.

## Formas de acceso

### Acceso automático

```text
Usuario
  ↓
Ruta general
  ↓
Detección de capacidades
  ↓
Reglas de compatibilidad
  ↓
Resolución de versión
  ↓
Experiencia
```

### Acceso específico

Una ruta administrada puede apuntar a una versión concreta.

Ejemplo conceptual:

```text
/explore       -> selección automática
/v/2d          -> versión 2D
/v/3d-lite     -> versión 3D Lite
/v/3d          -> versión 3D Standard
/demo/...      -> configuración específica
```

La **ruta** y la **versión** se modelarán como conceptos separados.

## Arquitectura preliminar

```text
AstroVisor
│
├── Frontend web
│   ├── Inicio y navegación
│   ├── Experiencia 2D
│   ├── Preparación del visor
│   ├── Experiencia 3D
│   └── Panel administrativo
│
├── Compatibilidad
│   ├── Detección de capacidades
│   └── Resolución de versión
│
├── Backend
│   ├── API
│   ├── Autenticación administrativa
│   ├── Versiones
│   ├── Rutas
│   └── Reglas
│
└── Persistencia
    ├── Versiones/configuraciones
    ├── Rutas
    ├── Reglas de compatibilidad
    └── Datos administrativos
```

## Integración con la biblioteca

La integración con la base de datos central todavía **no está definida**.

La biblioteca contempla cuentas asociadas a un identificador relacionado con la credencial del usuario, pero otro equipo está trabajando en la migración y estructura definitiva.

Por ahora:

- AstroVisor no duplicará la tabla central de usuarios;
- el usuario final podrá utilizar el flujo base sin cuenta;
- el panel administrativo sí requerirá autenticación;
- la arquitectura deberá permitir incorporar posteriormente un identificador central si la biblioteca lo solicita.

## Stack tecnológico preliminar

Las decisiones definitivas se cerrarán en **D3**.

| Capa | Situación actual |
|---|---|
| Frontend | Aplicación web responsiva; framework por confirmar |
| 3D | Three.js o alternativa equivalente por validar |
| Backend | Node.js |
| Framework backend | Express o Fastify, pendiente de decisión |
| Base de datos | PostgreSQL como opción principal, pendiente de compatibilidad con la biblioteca |
| Autenticación | Inicialmente administradores |
| Repositorio | GitHub |
| Gestión | Notion |
| Especificaciones de desarrollo | OpenSpec se evaluará al iniciar desarrollo |

## Estructura provisional del repositorio

> La estructura se ajustará cuando D3 quede aprobado.

```text
astrovisor/
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── compatibility/
│   ├── shared/
│   └── types/
├── docs/
│   ├── architecture/
│   ├── decisions/
│   ├── ux/
│   └── requirements/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── pull_request_template.md
├── README.md
└── .gitignore
```

## Equipo y responsabilidades

### Entregables D2/D3

| Integrante | D2 | D3 |
|---|---|---|
| Karime Rendón Vázquez | Fichas de Usuario | Frontend |
| Índigo Andre Ortiz Vega | Matriz de Contexto de Uso | Base de datos y modelo de versiones |
| Carlos Martínez Orozco | Historias de Usuario | Backend, autenticación y seguridad |
| Luis Alberto Rodríguez | Criterios de Aceptación y Usabilidad | Infraestructura y repositorio |
| Equipo completo | Diagrama de Flujo | Selección y revisión final del stack |

### Desarrollo

| Área | Responsable principal |
|---|---|
| Frontend convencional y UX | Karime |
| Experiencia 3D, visor y sensores | Luis |
| Backend, API y panel administrativo | Carlos |
| Datos, compatibilidad y selección de versión | Índigo |

El responsable principal indica **ownership**, no trabajo exclusivo. Las tareas de integración deberán tener colaborador y revisor.

## Gestión del proyecto

### Notion

Notion se utilizará para:

- planificación;
- responsables;
- estado de tareas;
- entregables D2/D3;
- decisiones técnicas;
- pruebas;
- evidencias y avances.

### GitHub

GitHub se utilizará para:

- código fuente;
- Issues técnicas;
- ramas;
- commits;
- Pull Requests;
- revisión de código;
- releases.

## Flujo Git

No se desarrollará directamente sobre `main`.

```text
Tarea / Issue
   ↓
Branch
   ↓
Implementación
   ↓
Pull Request
   ↓
Revisión
   ↓
Merge
```

### Convención de ramas

```text
feature/<issue>-descripcion
fix/<issue>-descripcion
docs/<issue>-descripcion
refactor/<issue>-descripcion
```

Ejemplos:

```text
feature/12-capability-detector
feature/24-admin-versions
fix/31-vr-orientation
docs/5-project-definition
```

### Convención de commits

Formato recomendado:

```text
tipo(scope): descripción
```

Ejemplos:

```text
feat(compatibility): add WebGL detection
feat(admin): add version routes endpoint
fix(vr): correct device orientation handling
docs(readme): update project scope
```

## Pull Requests

Cada Pull Request deberá:

- estar relacionado con una Issue cuando corresponda;
- explicar el problema que resuelve;
- describir los cambios;
- indicar cómo se probó;
- evitar cambios no relacionados;
- recibir revisión antes de integrarse.

## OpenSpec

**No se utilizará todavía.**

El equipo primero validará con la biblioteca:

- dudas de alcance;
- recursos disponibles;
- infraestructura;
- posible integración con su base de datos;
- enfoque de usuarios y autenticación.

Cuando inicie el desarrollo y las decisiones principales estén suficientemente estables, se evaluará incorporar OpenSpec para especificar cambios funcionales relevantes antes de implementarlos.

## Decisiones pendientes

- [ ] Confirmar si AstroVisor utilizará cuentas de la biblioteca.
- [ ] Confirmar identificador y mecanismo de integración si existen usuarios compartidos.
- [ ] Confirmar infraestructura y recursos de despliegue disponibles.
- [ ] Confirmar motor/versión de base de datos de la biblioteca.
- [ ] Definir Express vs Fastify.
- [ ] Cerrar framework de frontend.
- [ ] Validar librería 3D con el Homido y el smartphone de referencia.
- [ ] Definir qué datos debe registrar el panel administrativo.
- [ ] Definir modelo mínimo de versiones, rutas y reglas.
- [ ] Confirmar requisitos de privacidad y auditoría.

## Roadmap actual

1. Cotejar dudas y recursos con la biblioteca.
2. Reestructurar y validar la definición del proyecto.
3. Completar D2.
4. Completar D3.
5. Crear y configurar el repositorio.
6. Definir backlog técnico.
7. Evaluar OpenSpec al iniciar desarrollo.
8. Implementar base frontend/backend.
9. Implementar modo 2D.
10. Implementar compatibilidad y resolución de versión.
11. Implementar experiencia 3D.
12. Implementar panel administrativo.
13. Realizar pruebas de usabilidad.
14. Iterar según resultados.

## Documentación académica

Los entregables D2 se basan en ISO 9241-210 e incluyen:

- Fichas de Usuario;
- Matriz de Contexto de Uso;
- Historias de Usuario;
- Criterios de Aceptación y Usabilidad;
- Diagrama de Flujo de Usuarios.

D3 definirá formalmente:

- frontend;
- backend;
- autenticación y seguridad;
- base de datos;
- infraestructura;
- repositorio.

## Estado

Proyecto en fase de **definición y validación**.

No iniciar decisiones irreversibles de arquitectura o integración con la biblioteca hasta resolver las dependencias externas documentadas.

## Licencia

Pendiente de definir.
