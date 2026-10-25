<script setup>
defineProps({ cargando: Boolean, error: { type: String, default: '' }, detalle: Boolean })
defineEmits(['reintentar'])
</script>
<template>
  <section class="public-state" :role="error ? 'alert' : 'status'">
    <template v-if="cargando"
      ><svg class="state-star" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M24 4 29 19 44 24 29 29 24 44 19 29 4 24 19 19Z" fill="currentColor" />
      </svg>
      <h2>Cargando constelaciones…</h2>
      <p>Estamos preparando las historias del cielo.</p></template
    >
    <template v-else-if="error"
      ><h2>Las historias tendrán que esperar un momento</h2>
      <p>{{ error }}</p>
      <button class="public-button" type="button" @click="$emit('reintentar')">
        Volver a intentar
      </button></template
    >
    <template v-else
      ><h2>
        {{
          detalle ? 'No encontramos esa constelación' : 'Todavía no hay constelaciones disponibles'
        }}
      </h2>
      <p>
        {{
          detalle
            ? 'Puedes elegir otra historia desde el recorrido.'
            : 'Vuelve más tarde para descubrir nuevas historias del cielo.'
        }}
      </p></template
    >
    <RouterLink class="public-text-link state-exit" :to="detalle ? '/explorar' : '/'">{{
      detalle ? 'Volver a las constelaciones' : 'Volver al inicio'
    }}</RouterLink>
  </section>
</template>
