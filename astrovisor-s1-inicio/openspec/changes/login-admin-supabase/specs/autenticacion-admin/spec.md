# Autenticación y acceso administrativo

## Purpose
Permitir que el personal administrativo autorizado inicie sesión mediante Supabase Auth con correo y contraseña, protegiendo las pantallas y acciones de administración frente a usuarios anónimos o no autorizados.

## ADDED Requirements

### Requirement: Formulario de inicio de sesión administrativo
La pantalla `/admin/acceso` SHALL proveer un formulario con campos para correo electrónico y contraseña, junto con un botón para iniciar sesión.

#### Scenario: Intento de inicio de sesión válido
- **WHEN** el administrador introduce credenciales válidas y envía el formulario
- **THEN** la aplicación consulta `supabase.auth.signInWithPassword`
- **AND** redirige exitosamente al usuario hacia `/admin`.

#### Scenario: Credenciales inválidas o incompletas
- **WHEN** el usuario envía el formulario con campos vacíos o credenciales incorrectas
- **THEN** la aplicación no realiza la redirección
- **AND** muestra un mensaje descriptivo de error sin desvelar datos confidenciales.

### Requirement: Protección de la ruta del panel administrativo
La aplicación SHALL restringir el acceso a `/admin` y requerir una sesión autenticada activa en Supabase.

#### Scenario: Acceso directo sin autenticación previa
- **WHEN** un visitante no autenticado navega directamente a `/admin`
- **THEN** el guard de Vue Router intercepta la navegación
- **AND** redirige al usuario hacia `/admin/acceso`.

#### Scenario: Acceso con sesión administrativa confirmada
- **WHEN** un usuario con sesión autenticada navega a `/admin`
- **THEN** se permite la visualización del panel administrativo
- **AND** se muestra el correo de la cuenta activa.

### Requirement: Cierre de sesión administrativo
El panel administrativo SHALL proveer una acción de cierre de sesión (*Cerrar sesión*).

#### Scenario: Cierre de sesión exitoso
- **WHEN** el administrador activa la acción de cerrar sesión
- **THEN** la aplicación llama a `supabase.auth.signOut`
- **AND** redirige a `/admin/acceso`, revocando el acceso inmediato a `/admin`.

