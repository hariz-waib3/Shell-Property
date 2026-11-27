<script setup>
import PropertyDescription from './PropertyDescription.vue'
import PropertyLocation from './PropertyLocation.vue'
import PropertySpecs from './PropertySpecs.vue'
import { db } from '@/stores/db'

// Everything below the summary on the property page, in order. Shared by the partner and admin pages.
defineProps({
  property: { type: Object, required: true },
})
</script>

<template>
  <PropertySpecs :property="property" />
  <PropertyDescription :property="property" />
  <PropertyLocation :property="property" />

  <section v-if="db.disclaimer" class="detail-block">
    <div class="section-t">Disclaimer</div>
    <p class="muted disclaimer">{{ db.disclaimer }}</p>
  </section>
</template>

<style scoped>
.disclaimer {
  font-size: 12.5px;
  line-height: 1.6;
  white-space: pre-line;
}
</style>
