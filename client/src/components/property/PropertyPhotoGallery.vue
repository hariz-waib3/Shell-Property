<script setup>
import { computed, ref, watch } from 'vue'
import ImageLightbox from '@/components/common/ImageLightbox.vue'
import { placeholderImage } from '@/utils/format'

// Image gallery for the right-hand column of the property page (partner and admin).
// A large main photo with thumbnails underneath. Clicking the main photo opens the full-screen viewer.
const props = defineProps({
  propertyId: { type: Number, required: true },
  images: { type: Array, default: () => [] }, // [{ id, url, name }], the first one is the cover
})

const selectedIndex = ref(0)

// Back to the cover when the photos change (e.g. after editing).
watch(
  () => props.images,
  () => {
    selectedIndex.value = 0
  },
)

const selectedImage = computed(() => props.images[selectedIndex.value])

const lightboxOpen = ref(false)

function openLightbox() {
  if (selectedImage.value) lightboxOpen.value = true
}

// Quotes matter: image data can contain brackets, which break an unquoted url().
function backgroundFor(image) {
  return { backgroundImage: `url("${image.url}")` }
}
</script>

<template>
  <div class="photo-gallery">
    <div
      class="main-photo"
      :class="{ clickable: selectedImage }"
      :style="selectedImage ? backgroundFor(selectedImage) : { background: placeholderImage(propertyId) }"
      role="img"
      :aria-label="selectedImage ? selectedImage.name : 'No photos yet'"
      @click="openLightbox"
    >
      <span v-if="!selectedImage" class="no-photos">No photos yet</span>
      <span v-if="selectedIndex === 0 && selectedImage" class="cover-badge">Cover</span>
      <span v-if="images.length > 1" class="counter">{{ selectedIndex + 1 }} / {{ images.length }}</span>
      <span v-if="selectedImage" class="zoom-hint">Click to enlarge</span>
    </div>

    <div v-if="images.length > 1" class="thumbs">
      <button
        v-for="(image, index) in images"
        :key="image.id"
        type="button"
        class="thumb"
        :class="{ selected: index === selectedIndex }"
        :style="backgroundFor(image)"
        :aria-label="`Show ${image.name}`"
        @click="selectedIndex = index"
      ></button>
    </div>

    <!-- The viewer stays in step with the gallery: closing it leaves the same photo selected. -->
    <ImageLightbox v-if="lightboxOpen" v-model:index="selectedIndex" :images="images" @close="lightboxOpen = false" />
  </div>
</template>

<style scoped>
.main-photo {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: 10px;
  background-size: cover;
  background-position: center;
  display: grid;
  place-items: center;
}

.main-photo.clickable {
  cursor: zoom-in;
}

.zoom-hint {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(20, 22, 26, 0.7);
  color: #fff;
  font-size: 11.5px;
  opacity: 0;
  transition: opacity 0.15s;
}

.main-photo.clickable:hover .zoom-hint {
  opacity: 1;
}

.no-photos {
  color: rgba(255, 255, 255, 0.9);
  font-size: 13px;
  font-weight: 600;
}

.cover-badge {
  position: absolute;
  left: 10px;
  top: 10px;
  padding: 3px 10px;
  border-radius: 12px;
  background: var(--ink);
  color: var(--gold);
  font-size: 11.5px;
  font-weight: 600;
}

.counter {
  position: absolute;
  right: 10px;
  bottom: 10px;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(20, 22, 26, 0.7);
  color: #fff;
  font-size: 11.5px;
}

.thumbs {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
  margin-top: 8px;
}

.thumb {
  aspect-ratio: 1;
  border: 2px solid transparent;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  padding: 0;
  opacity: 0.75;
  transition:
    opacity 0.15s,
    border-color 0.15s;
}

.thumb:hover {
  opacity: 1;
}

.thumb.selected {
  border-color: var(--gold);
  opacity: 1;
}
</style>
