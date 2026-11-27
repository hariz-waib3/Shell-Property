<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PaywallBanner from '@/components/common/PaywallBanner.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import PropertyPhotoGallery from '@/components/property/PropertyPhotoGallery.vue'
import PropertyDetailSections from '@/components/property/PropertyDetailSections.vue'
import PropertySummary from '@/components/property/PropertySummary.vue'
import PropertyActionsCard from '../components/PropertyActionsCard.vue'
import { findProperty, isInMyList, addToMyList, removeFromMyList } from '@/stores/db'
import { isLocked } from '@/stores/session'
import { toast } from '@/stores/ui'

// Same layout as the admin property page: details on the left, photos and actions on the right.
// `id` comes from the URL (/properties/:id). See properties/routes.js.
const props = defineProps({
  id: { type: Number, required: true },
})

const route = useRoute()

// Opened from My Lists (?from=my-lists): the back button returns there instead of to the property list.
const backLink = computed(() =>
  route.query.from === 'my-lists'
    ? { to: { name: 'my-lists' }, label: 'Back to My Lists' }
    : { to: { name: 'properties' }, label: 'Back to properties' },
)

// Disabled properties are admin-only, so a partner opening one by link sees "not found".
const property = computed(() => {
  const found = findProperty(props.id)
  return found?.active ? found : null
})
const isSaved = computed(() => isInMyList(props.id))

function toggleSaved() {
  if (isSaved.value) {
    removeFromMyList(props.id)
    toast('Removed from My Lists')
  } else {
    addToMyList(props.id)
    toast('Saved to My Lists')
  }
}
</script>

<template>
  <RouterLink class="btn sm" :to="backLink.to">← {{ backLink.label }}</RouterLink>

  <EmptyState
    v-if="!property"
    class="card not-found"
    title="Property not found"
    message="It may have been removed or sold."
  />

  <template v-else>
    <div class="row title-row">
      <h1 class="page grow">House &amp; Land</h1>
      <button class="btn sm" @click="toast('Share link copied (demo)')">Share</button>
      <button class="btn sm" @click="toggleSaved">{{ isSaved ? '★ Saved' : '☆ Save' }}</button>
    </div>

    <div class="detail property-detail">
      <!-- Left: one card with every section, separated by thin lines. -->
      <div class="card pad main-card">
        <PropertySummary :property="property" :price-locked="isLocked('prices')" show-status />

        <PaywallBanner
          v-if="isLocked('detail')"
          message="Full property details, inclusions and purchasing terms are available on the Pro plan."
        />
        <div :class="{ 'locked locked-sections': isLocked('detail') }">
          <PropertyDetailSections :property="property" />
        </div>
      </div>

      <aside class="card pad side-card">
        <section class="photos">
          <div class="section-t">Photos</div>
          <PropertyPhotoGallery :property-id="property.id" :images="property.images || []" />
        </section>

        <PropertyActionsCard class="side-section" :property-id="property.id" />
      </aside>
    </div>
  </template>
</template>

<style scoped>
.not-found {
  margin-top: 16px;
}

.title-row {
  margin: 16px 0;
}

.property-detail {
  grid-template-columns: 1fr 380px;
}

.main-card {
  align-self: start;
  padding: 24px;
}

/* Free plan: the blurred sections can't be clicked (map, tabs, floorplan). */
.locked-sections {
  pointer-events: none;
}

/* Right side: one card with the photos on top and the tools below. */
.side-card {
  align-self: start;
}

.side-section {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
}

@media (max-width: 900px) {
  .property-detail {
    grid-template-columns: 1fr;
  }
}
</style>
