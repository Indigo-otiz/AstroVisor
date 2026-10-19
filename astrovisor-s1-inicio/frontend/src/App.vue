<template>
  <div class="app-shell">
    <a class="skip-link" href="#contenido">Saltar al contenido</a>
    <header class="site-header">
      <div class="container header-content">
        <RouterLink class="brand" to="/">AstroVisor</RouterLink>
        <nav aria-label="Navegación principal" class="nav-links">
          <RouterLink to="/">Inicio</RouterLink>
          <RouterLink to="/explorar">Explorar</RouterLink>
          <RouterLink to="/visor">Homido</RouterLink>
          <RouterLink to="/admin/acceso">Administración</RouterLink>
        </nav>
      </div>
    </header>
    <main id="contenido" class="container main-content">
      <RouterView />
    </main>
    <footer class="container site-footer">
      <p>Prototipo académico · Contenido de demostración · Material de la biblioteca pendiente.</p>
    </footer>
  </div>
</template>
