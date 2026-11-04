<script setup>
defineProps({
  libro: { type: Object, required: true },
})
</script>

<template>
  <div class="biblioteca-portada" :class="`biblioteca-portada--${libro.constelacionId}`"
    role="img" :aria-label="`Cubierta ilustrativa de demostración de ${libro.titulo}, no una portada editorial`">
    <span class="biblioteca-portada-sello" aria-hidden="true">ASTROVISOR · LECTURAS</span>
    <span class="biblioteca-portada-estrellas" aria-hidden="true">✦ · ✧ · ✦</span>
    <span class="biblioteca-portada-titulo" aria-hidden="true">{{ libro.titulo }}</span>
    <span class="biblioteca-portada-autor" aria-hidden="true">{{ libro.autor }}</span>
    <span class="biblioteca-portada-pie" aria-hidden="true">Cubierta ilustrativa</span>
  </div>
</template>
