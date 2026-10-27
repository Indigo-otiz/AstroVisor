# Propuesta: autenticación administrativa y conexión con Supabase

## Why
El panel de administración `/admin` y el acceso `/admin/acceso` actualmente están bloqueados y sin autenticación real. Se requiere conectar con Supabase para permitir que los administradores autorizados inicien sesión mediante credenciales seguras (correo y contraseña), persistan su sesión y accedan al panel de gestión, manteniendo el rol protegido tanto en frontend como en base de datos.

## What Changes
- Configurar el cliente oficial `@supabase/supabase-js` en el frontend Vue 3 con variables de entorno (`VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`).
- Implementar un formulario funcional de Login en `AdminAccesoView.vue` con estados de carga, validación de correo y contraseña, y manejo de errores.
- Crear un composable de autenticación `useAuth.js` que gestione la sesión reactiva de Supabase, verificación de rol de administrador y cierre de sesión (*sign out*).
- Actualizar el guard de navegación en `router/index.js` para proteger la ruta `/admin` basándose en el estado de autenticación real de Supabase.
- Proveer el script SQL para la base de datos de Supabase que modela la tabla de perfiles de administradores (`admin_users` / `perfiles`) vinculada con `auth.users` y políticas de seguridad Row Level Security (RLS).
- Actualizar el panel `/admin` (`AdminPanelView.vue`) para mostrar los datos del usuario logueado, opciones de gestión y botón de cerrar sesión.

Fuera de alcance: registro abierto para visitantes (los visitantes no requieren cuenta) y préstamos físicos de libros de la biblioteca.

## Capabilities
### New Capabilities
- `autenticacion-admin`: Inicio de sesión seguro, control de sesión reactiva y cierre de sesión de administradores vía Supabase Auth.
- `gestion-acceso-admin`: Protección de rutas y consulta de perfil administrativo en Supabase PostgreSQL con RLS.

## Impact
Afecta a `frontend/src/views/AdminAccesoView.vue`, `frontend/src/views/AdminPanelView.vue`, `frontend/src/router/index.js`, crea `frontend/src/services/supabaseClient.js` y `frontend/src/composables/useAuth.js`, agrega dependencia `@supabase/supabase-js`, e incorpora archivo `.env` para credenciales de Supabase.

