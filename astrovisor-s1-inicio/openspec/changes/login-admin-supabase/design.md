# Decisiones de diseño: autenticación administrativa y conexión con Supabase

## Arquitectura de autenticación

1. **Cliente Supabase en Frontend (`frontend/src/services/supabaseClient.js`)**:
   - Se inicializa con `createClient(supabaseUrl, supabaseAnonKey)`.
   - Las claves se leen de `import.meta.env.VITE_SUPABASE_URL` y `import.meta.env.VITE_SUPABASE_ANON_KEY`.
   - Si no están configuradas en `.env`, el cliente emite una advertencia clara sin tumbar la aplicación.

2. **Gestión de estado con Composable (`frontend/src/composables/useAuth.js`)**:
   - Mantiene una referencia reactiva `user`, `session`, `loading` e `isAdmin`.
   - Escucha los cambios de sesión con `supabase.auth.onAuthStateChange`.
   - Provee métodos `login(email, password)`, `logout()` y `checkAdminRole(userId)`.

3. **Control de acceso en Vue Router (`frontend/src/router/index.js`)**:
   - El guard `router.beforeEach` consulta la sesión activa de Supabase antes de permitir el acceso a rutas marcadas con `meta: { requiresAdmin: true }`.
   - Si el usuario no está autenticado o no es administrador, redirige a `/admin/acceso`.

4. **Modelo de datos en Supabase (PostgreSQL + RLS)**:
   - Tabla `public.admin_profiles`:
     - `id`: UUID clave primaria foránea a `auth.users(id) on delete cascade`.
     - `email`: TEXT NOT NULL.
     - `role`: TEXT NOT NULL DEFAULT 'admin'.
     - `created_at`: TIMESTAMPTZ DEFAULT now().
   - Habilitación de Row Level Security (RLS) para que sólo usuarios autenticados con rol de administrador puedan consultar o modificar datos administrativos.

