# Diseño Técnico S3 — Contrato JSON/API y Datos Compartidos 2D/3D

## 1. Contrato Documental Compartido (`recorridos.json`)

El archivo JSON define un arreglo de constelaciones que consumen tanto el backend (`/api/contenidos/recorridos`) como la escena Homido (a través del adaptador `datos.js` o fallback `recorridos-demo.json`).

### Esquema por elemento

```typescript
interface FichaConstelacion {
  id: string; // Slug único en minúsculas: 'orion' | 'osa-mayor' | 'escorpio'
  titulo: string; // Nombre visible de la constelación
  resumen: string; // Descripción breve orientada a adultos mayores
  historia: string; // Relato o mito adaptado
  comoReconocerla: string; // Instrucciones prácticas para ubicar las estrellas
  demostracion: boolean; // true para señalar que es contenido de muestra
  libros: Array<{
    titulo: string;
    autor: string;
    anio?: number;
    url?: string;
    licencia?: string;
    etiqueta: string; // 'Referencia de demostración'
    aclaracion?: string;
  }>;
  multimedia: Array<{
    tipo: 'audio';
    src: string; // Ruta relativa pública (e.g. '/audio/orion-kokoro-v1.wav' o '.mp3')
    formato: string; // 'audio/wav' | 'audio/mpeg'
    transcripcion: string;
    autorTexto: string;
    procedencia: string;
    voz: string;
    permisoTexto?: string;
    permiso?: string;
    estadoDerechos?: string;
    licenciaVozFuente?: string;
    demostracion: boolean;
  }>;
}
```

## 2. Flujo de Datos y Resiliencia (Web 2D y 3D Homido)

```
                       [content/recorridos.json]
                                  │
                                  ▼
                     [Express: GET /api/contenidos/recorridos]
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                 ▼
         [Web 2D: Vue]                     [Visor 3D: A-Frame]
   (contentService.cargarRecorridos)         (datos.cargarDatos)
                 │                                 │
                 │ (Si falla la API)               │ (Si falla la API)
                 ▼                                 ▼
         [Estado de Error y               [Fallback local inmediato:
          Reintento accesible]             data/recorridos-demo.json]
```

### Reglas de tolerancia a fallos:
1. **Autonomía sin red**: El visor 3D en Homido puede ejecutarse en modo totalmente estático o con red local débil; si la API de Express responde error HTTP, tarda más de 3000 ms o falla la red, el módulo `cargarDatos()` conmuta automáticamente a `recorridos-demo.json`.
2. **Sincronización del respaldo**: `frontend/public/prueba-homido/data/recorridos-demo.json` debe contener los mismos libros reales de demostración y enlaces a medios locales que `content/recorridos.json`, evitando dejar `libros: []` o `multimedia: []`.
3. **Manejo de audio faltante o inválido**: Si un recurso de audio local no puede ser cargado o el navegador bloquea la reproducción automática, la ficha visual y la lectura de la historia nunca deben bloquearse ni romperse.

## 3. Desacoplamiento de Servicios y Pospuesto de CRUD

1. **Autenticación intacta**: Las rutas `/api/admin/login`, `/api/admin/sesion` y el middleware `verificarAdmin` continúan funcionando para acceso al panel.
2. **CRUD pospuesto**: La persistencia de altas, bajas y modificaciones de libros o constelaciones no se conectará a base de datos externa ni a Supabase durante este sprint; cualquier edición permanecerá en memoria de interfaz o se notificará explícitamente como "Funcionalidad pospuesta para después de la Expo".

