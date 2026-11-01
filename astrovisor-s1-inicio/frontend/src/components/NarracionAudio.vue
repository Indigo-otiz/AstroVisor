<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({ constelacion: { type: Object, required: true } })
const estado = ref({ estado: 'no-disponible', mensaje: 'Preparando controles de audio…' })
const recurso = ref(null)
let narrador, quitarObservador, modulo
let desmontado = false
const tiempo = (valor = 0) => `${Math.floor(valor / 60)}:${String(Math.floor(valor % 60)).padStart(2, '0')}`
const progreso = computed(() => `${tiempo(estado.value.posicion)} / ${tiempo(estado.value.duracion)}`)
const accion = computed(() => estado.value.puedePausar ? 'Pausar' : estado.value.puedeReanudar ? 'Reanudar' : 'Escuchar')
function controlar() {
  if (estado.value.puedePausar) narrador.pausar()
  else if (estado.value.puedeReanudar) narrador.reanudar()
  else narrador.escuchar()
}
function seleccionar() {
  recurso.value = modulo?.audioDe(props.constelacion) ?? null
  narrador?.seleccionar(recurso.value)
}
watch(() => props.constelacion, seleccionar, { flush: 'sync' })
onMounted(async () => {
  try {
    const ruta = new URL('/audio/narration.js', window.location.origin).href
    modulo = await import(/* @vite-ignore */ ruta)
    if (desmontado) return
    narrador = modulo.crearNarrador()
    quitarObservador = narrador.observar((valor) => { estado.value = valor })
    seleccionar()
  } catch {
    if (!desmontado) estado.value = { estado: 'error', mensaje: 'Audio no disponible. Puedes seguir leyendo la historia.' }
  }
})
onBeforeUnmount(() => {
  desmontado = true
  quitarObservador?.()
  narrador?.destruir()
})
</script>

<template>
  <section class="narracion" aria-labelledby="narracion-titulo">
    <h2 id="narracion-titulo">Escucha la historia</h2>
    <p v-if="recurso" class="narracion-origen">{{ recurso.voz }} · Contenido de demostración.</p>
    <div v-if="recurso" class="narracion-acciones">
      <button class="public-button" type="button" :disabled="!estado.puedeEscuchar && !estado.puedePausar && !estado.puedeReanudar" @click="controlar">{{ accion }}</button>
      <button v-if="estado.estado === 'bloqueado'" class="public-button narracion-secundario" type="button" @click="narrador.activar()">Activar audio</button>
    </div>
    <p class="narracion-estado" role="status" aria-live="polite">{{ estado.mensaje }}</p>
    <p v-if="estado.activacion" class="narracion-origen">{{ estado.activacion }}</p>
    <p v-if="recurso && estado.duracion" class="narracion-tiempo" aria-label="Tiempo de narración">{{ progreso }}</p>
    <details v-if="recurso" class="narracion-transcripcion">
      <summary>Transcripción y créditos</summary>
      <p>{{ recurso.transcripcion }}</p>
      <dl>
        <dt>Texto</dt><dd>{{ recurso.autorTexto }}</dd>
        <dt>Procedencia</dt><dd>{{ recurso.procedencia }}</dd>
        <dt>Voz</dt><dd>{{ recurso.voz }}</dd>
        <dt>Permiso</dt><dd>{{ recurso.permiso }}</dd>
      </dl>
    </details>
  </section>
</template>
