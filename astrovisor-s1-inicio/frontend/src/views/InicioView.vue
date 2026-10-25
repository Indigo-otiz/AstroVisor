<script setup>
import ConstellationArt from '../components/ConstellationArt.vue'
</script>
<template>
  <section class="public-home">
    <div class="home-intro">
      <h1 tabindex="-1">Cada estrella,<br />una historia.</h1>
      <p>
        Descubre las constelaciones y las historias que las personas han imaginado al mirar el
        cielo.
      </p>
      <RouterLink class="public-button" to="/explorar"
        >Explorar constelaciones
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg
      ></RouterLink>
      <p class="home-access">Desde tu navegador, sin visor y sin registrarte.</p>
    </div>
    <div class="home-sky">
      <ConstellationArt id="orion" /><span>Orión</span>
      <p>Un cielo de historias por descubrir</p>
    </div>
  </section>
  <section class="home-guide" aria-labelledby="a-tu-ritmo">
    <div>
      <h2 id="a-tu-ritmo">Mira el cielo a tu ritmo</h2>
      <p>
        Elige una constelación, conoce su figura y lee una historia breve. Puedes volver y continuar
        cuando quieras.
      </p>
    </div>
    <RouterLink class="public-text-link" to="/visor">Conocer el modo Homido</RouterLink>
  </section>
  <p class="public-demo">
    Contenido de demostración. Los materiales finales de la biblioteca están pendientes.
  </p>
</template>
