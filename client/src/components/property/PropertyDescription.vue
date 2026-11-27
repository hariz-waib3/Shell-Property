<script setup>
import { computed, ref } from 'vue'
import ImageLightbox from '@/components/common/ImageLightbox.vue'

// "Description", "Floorplan", "Inclusions" and "Purchasing terms" on the property page (partner and admin).
const props = defineProps({
  property: { type: Object, required: true },
})

// The description is stored as plain text, one point per line.
const descriptionPoints = computed(() =>
  (props.property.description || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean),
)

const floorplans = computed(() => props.property.floorplans || [])

const openFloorplanIndex = ref(null) // which floorplan is open full screen, or null
</script>

<template>
  <section v-if="descriptionPoints.length" class="detail-block">
    <div class="section-t">Description</div>
    <h3 v-if="property.descriptionTitle" class="description-title">{{ property.descriptionTitle }}</h3>
    <ul class="description-list">
      <li v-for="point in descriptionPoints" :key="point">{{ point }}</li>
    </ul>
  </section>

  <section v-if="floorplans.length" class="detail-block">
    <div class="section-t">Floorplan</div>
    <div class="floorplans">
      <button
        v-for="(plan, index) in floorplans"
        :key="plan.id"
        type="button"
        class="floorplan"
        :aria-label="`Enlarge ${plan.name}`"
        @click="openFloorplanIndex = index"
      >
        <img :src="plan.url" :alt="plan.name" />
      </button>
    </div>
    <ImageLightbox
      v-if="openFloorplanIndex !== null"
      v-model:index="openFloorplanIndex"
      :images="floorplans"
      @close="openFloorplanIndex = null"
    />
  </section>

  <section v-if="property.inclusions?.length" class="detail-block">
    <div class="section-t">Inclusions</div>
    <div class="incl">
      <div v-for="item in property.inclusions" :key="item">{{ item }}</div>
    </div>
  </section>

  <section v-if="property.purchasingTerms?.length" class="detail-block">
    <div class="section-t">Purchasing terms</div>
    <div class="incl terms">
      <div v-for="term in property.purchasingTerms" :key="term">{{ term }}</div>
    </div>
  </section>
</template>

<style scoped>
.description-title {
  margin-bottom: 8px;
  font-size: 17px;
}

.description-list {
  display: grid;
  gap: 6px;
  padding-left: 20px;
  font-size: 14px;
  line-height: 1.5;
}

.floorplans {
  display: grid;
  gap: 12px;
}

.floorplan {
  padding: 0;
  border: 1px solid var(--line);
  border-radius: 10px;
  background: #fff;
  overflow: hidden;
  cursor: zoom-in;
}

.floorplan img {
  display: block;
  width: 100%;
  max-height: 460px;
  object-fit: contain;
}

.terms {
  grid-template-columns: repeat(2, 1fr);
}

@media (max-width: 600px) {
  .terms {
    grid-template-columns: 1fr;
  }
}
</style>
