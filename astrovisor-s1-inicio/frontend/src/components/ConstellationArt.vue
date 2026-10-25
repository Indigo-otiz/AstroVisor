<script setup>
import { computed } from 'vue'
const props = defineProps({ id: { type: String, default: 'orion' } })
const figuras = {
  orion: {
    puntos: [
      [87, 35],
      [224, 47],
      [130, 104],
      [161, 111],
      [193, 117],
      [105, 184],
      [226, 188],
    ],
    trazos: [
      '87,35 130,104 105,184',
      '224,47 193,117 226,188',
      '87,35 224,47',
      '130,104 161,111 193,117',
    ],
  },
  'osa-mayor': {
    puntos: [
      [40, 65],
      [87, 49],
      [125, 79],
      [170, 90],
      [231, 78],
      [249, 140],
      [189, 150],
    ],
    trazos: ['40,65 87,49 125,79 170,90 231,78 249,140 189,150 170,90'],
  },
  escorpio: {
    puntos: [
      [57, 49],
      [84, 72],
      [113, 99],
      [148, 118],
      [167, 156],
      [200, 183],
      [242, 174],
      [260, 143],
      [240, 127],
    ],
    trazos: ['57,49 84,72 113,99 148,118 167,156 200,183 242,174 260,143 240,127'],
  },
}
const figura = computed(() => figuras[props.id] ?? figuras.orion)
</script>
<template>
  <svg class="constellation-art" viewBox="0 0 320 230" aria-hidden="true" focusable="false">
    <g fill="currentColor" opacity=".25">
      <circle cx="22" cy="23" r="1.5" />
      <circle cx="278" cy="34" r="1" />
      <circle cx="285" cy="203" r="1.5" />
      <circle cx="44" cy="172" r="1" />
      <circle cx="156" cy="24" r="1" />
      <circle cx="297" cy="102" r="1" />
      <circle cx="16" cy="113" r="1" />
      <circle cx="143" cy="212" r="1.5" />
    </g>
    <polyline
      v-for="(trazo, indice) in figura.trazos"
      :key="indice"
      :points="trazo"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      opacity=".5"
    />
    <g v-for="(punto, indice) in figura.puntos" :key="indice">
      <circle :cx="punto[0]" :cy="punto[1]" r="7" fill="currentColor" opacity=".1" />
      <circle :cx="punto[0]" :cy="punto[1]" :r="indice === 2 ? 3.5 : 2.6" fill="currentColor" />
    </g>
  </svg>
</template>
