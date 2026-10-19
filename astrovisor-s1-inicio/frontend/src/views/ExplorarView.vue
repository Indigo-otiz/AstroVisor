<script setup>
import { onMounted, ref } from 'vue'
import { cargarRecorridos } from '../services/contentService.js'

const recorridos = ref([])
const cargando = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    recorridos.value = await cargarRecorridos()
  } catch {
    error.value = 'No pudimos cargar los recorridos. Comprueba que el servidor API esté encendido.'
  } finally {
    cargando.value = false
  }
})
</script>

<template>
  <section>
    <p class="eyebrow">Información provisional</p>
    <h1>Explora las constelaciones</h1>
    <p>Estos recorridos son ejemplos para probar la arquitectura. La selección final dependerá del material autorizado de la biblioteca.</p>
    <p v-if="cargando" role="status">Cargando recorridos...</p>
    <p v-else-if="error" role="alert" class="alert">{{ error }}</p>
    <div v-else-if="recorridos.length" class="cards">
      <article class="card" v-for="recorrido in recorridos" :key="recorrido.id">
        <p class="eyebrow">Demostración</p>
        <h2>{{ recorrido.titulo }}</h2>
        <p>{{ recorrido.resumen }}</p>
        <p class="support-text">Referencias bibliográficas: por confirmar.</p>
      </article>
    </div>
    <p v-else>No hay recorridos disponibles por el momento.</p>
  </section>
</template>
