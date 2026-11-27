<script setup>
import PropertyDescription from './PropertyDescription.vue'
import PropertyLocation from './PropertyLocation.vue'
import PropertySpecs from './PropertySpecs.vue'
import { PROPERTY_DISCLAIMER } from '@/data/constants'

// Everything below the summary on the property page, in order. Shared by the partner and admin pages.
defineProps({
  property: { type: Object, required: true },
})
</script>

<template>
  <PropertySpecs :property="property" />
  <PropertyDescription :property="property" />
  <PropertyLocation :property="property" />

  <section class="detail-block">
    <div class="section-t">Disclaimer</div>
    <p class="muted disclaimer">{{ PROPERTY_DISCLAIMER }}</p>
  </section>
</template>

<style scoped>
.disclaimer {
  font-size: 12.5px;
  line-height: 1.6;
}
</style>
