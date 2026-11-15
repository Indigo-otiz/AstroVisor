# Matriz de Contenido por Experiencia — AstroVisor Sprint 5

**Responsable de definición:** Índigo Andre Ortiz Vega (`Indigo-otiz`)  
**Colaboradores:** Karime Rendón Vázquez, Carlos Martínez Orozco, Luis Alberto Rodríguez  
**Proyecto:** AstroVisor — Taller Full Stack (Equipo 8)  
**Fecha:** 12 de noviembre de 2026  

---

## 1. Principio Rector: Fuente Documental Única

AstroVisor mantiene **un único catálogo documental runtime** (originado en `content/catalogo-inicial.json` y gestionado mediante el repositorio documental en backend). Las diferentes experiencias no duplican ni bifurcan los datos, sino que aplican proyecciones de presentación adaptadas a su canal de interacción:

```text
                  ┌──────────────────────────────────────────────┐
                  │ Catálogo Documental Persistente / Runtime    │
                  │ (Constelaciones, Libros, Narraciones, DEMO)  │
                  └──────────────────────┬───────────────────────┘
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
┌──────────────────────┐      ┌──────────────────────┐       ┌──────────────────────┐
│ Web Educativa /      │      │ Experiencia VR       │       │ Panel Administrativo │
│ Proyección           │      │ (Libre y Homido)     │       │ (/admin)             │
│ Lectura exhaustiva,  │      │ Audio protagónico,   │       │ Gestión documental,  │
│ transcripciones,     │      │ cielo visible,       │       │ validaciones,        │
│ fichas bibliográficas│      │ libros reducidos     │       │ contratos estables   │
└──────────────────────┘      └──────────────────────┘       └──────────────────────┘
```

---

## 2. Matriz Comparativa de Presentación por Modalidad

| Elemento / Capacidad | Web Educativa y Proyección (`/explorar`) | VR Modo Libre (`?modo=libre`) | VR Modo Homido (`?modo=homido`) | Panel Administrativo (`/admin`) |
| :--- | :--- | :--- | :--- | :--- |
| **Cielo y Gráficos** | Ilustración 2D / SVG de la figura estelar | Escena 3D monoscópica completa; estrellas y constelaciones navegables con mouse/dedo | Escena 3D estereoscópica dividida; orientación por sensores del smartphone | Previsualización de portadas y recursos |
| **Constelaciones** | Título, resumen breve, historia mitológica completa, cómo reconocerla en el cielo | **Cielo visible continuo**; constelación activa resaltada; título corto en canvas frontal | **Cielo visible continuo**; constelación activa resaltada; título legible en ambas cámaras | Edición de ID, título, resumen e historia completa |
| **Narración de Audio** | Reproductor con controles estándar y transcripción textual completa desplegable | **Audio protagónico**; controles compactos: Escuchar, Pausar / Reanudar y Repetir desde inicio | **Audio protagónico**; controles compactos operables por mirada de 3 s (dwell) o tacto | Metadatos del recurso de audio (formato WAV Kokoro, duración, licencia) |
| **Recomendaciones de Libros** | Ficha completa: portada, título, autor, año, relación con el tema, motivo y enlace público HTTPS | Ficha reducida: portada ilustrativa, título, autor, etiqueta DEMO y botón de volver | Ficha reducida: portada ilustrativa, título, autor, etiqueta DEMO y botón de volver | Formulario de alta/edición: título, autor, constelación, enlace HTTPS y **año opcional** |
| **Controles de Interacción** | Navegación por teclado accesible (Tab/Enter), clics de ratón y gestos táctiles | Arrastre de ratón (drag & look), clics directos y toques en pantalla | Retícula con anillo de selección por mirada (3 s), botones 3D de Pausa y Salir | Formularios accesibles protegidos con sesión administrativa |
| **Independencia de Pausa** | Pausa de audio no afecta navegación | Pausa de audio no afecta navegación libre | **«Pausar mirada» desactiva dwell sin detener el audio narrativo** | N/A |
| **Identidad Gráfica** | Footer con Biblioteca Solón Argüello, TecNM e IT Tepic; créditos del Equipo 8 | Logotipo de IT Tepic visible de forma no invasiva en plano inferior de controles | Logotipo de IT Tepic visible de forma no invasiva en plano inferior de controles | Identificación de sesión y créditos institucionales |
| **Avisos de Demostración** | Leyenda visible: «Contenido de demostración. Materiales finales pendientes» | Rótulo compacto DEMO en el entorno inmersivo | Rótulo compacto DEMO en el entorno inmersivo | Marca de versión documental y modo demostración |

---

## 3. Políticas de Degradación y Seguridad

1. **Falta de Audio o Bloqueo del Navegador:**
   - La escena 3D y la figura de la constelación permanecen plenamente visibles.
   - Se muestra un estado breve («Audio no disponible» o «Tocar para activar sonido») con opción clara de continuar o volver a la web 2D.
   - Nunca se deja la escena en pantalla negra ni se finge una reproducción activa.
2. **Ausencia de Sensores de Orientación:**
   - En `modo=libre`, no se requieren sensores; el usuario opera mediante ratón o gestos táctiles.
   - En `modo=homido`, si el dispositivo carece de giroscopio o se deniega el permiso, se notifica el estado y se ofrece interacción táctil o salida al modo libre / web 2D.
3. **Ausencia de Año en Libros:**
   - Los libros sin año de publicación confirmado se presentan sin generar `0`, `null` visible o `NaN`.
4. **Preservación de Textos y Transcripciones:**
   - La simplificación visual de la ficha inmersiva en VR **no borra** las historias ni las transcripciones del catálogo documental; estas se conservan para la web educativa y para lectores de pantalla.
