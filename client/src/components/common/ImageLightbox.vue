<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue'

// Full-screen photo viewer. The parent shows it with v-if and keeps track of which photo is open.
//
//   <ImageLightbox v-if="open" v-model:index="photoIndex" :images="images" @close="open = false" />
const props = defineProps({
  images: { type: Array, required: true }, // [{ id, url, name }]
})

const index = defineModel('index', { type: Number, required: true })
const emit = defineEmits(['close'])

const current = computed(() => props.images[index.value])
const hasMany = computed(() => props.images.length > 1)

// Wraps around: "next" on the last photo goes back to the first.
function showNext() {
  index.value = (index.value + 1) % props.images.length
}

function showPrevious() {
  index.value = (index.value - 1 + props.images.length) % props.images.length
}

function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
  if (event.key === 'ArrowRight') showNext()
  if (event.key === 'ArrowLeft') showPrevious()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div class="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer" @click.self="emit('close')">
      <button type="button" class="close" aria-label="Close" @click="emit('close')">✕</button>

      <button v-if="hasMany" type="button" class="nav prev" aria-label="Previous photo" @click="showPrevious">‹</button>

      <figure class="stage" @click.self="emit('close')">
        <img :src="current.url" :alt="current.name" />
        <figcaption>
          <span>{{ current.name }}</span>
          <span v-if="hasMany">{{ index + 1 }} / {{ images.length }}</span>
        </figcaption>
      </figure>

      <button v-if="hasMany" type="button" class="nav next" aria-label="Next photo" @click="showNext">›</button>

      <div v-if="hasMany" class="strip">
        <button
          v-for="(image, i) in images"
          :key="image.id"
          type="button"
          class="strip-thumb"
          :class="{ selected: i === index }"
          :aria-label="`Show ${image.name}`"
          @click="index = i"
        >
          <img :src="image.url" alt="" />
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  grid-template-columns: 64px 1fr 64px;
  grid-template-rows: 1fr auto;
  align-items: center;
  padding: 24px;
  background: rgba(14, 16, 19, 0.92);
}

.stage {
  grid-column: 2;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  max-height: calc(100vh - 160px);
}

.stage img {
  max-width: 100%;
  max-height: calc(100vh - 200px);
  border-radius: 10px;
  object-fit: contain;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

figcaption {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  color: #c9cbd0;
  font-size: 13px;
}

.close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 16px;
}

.nav {
  width: 48px;
  height: 48px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 28px;
  line-height: 1;
  justify-self: center;
}

.nav.prev {
  grid-column: 1;
  grid-row: 1;
}

.nav.next {
  grid-column: 3;
  grid-row: 1;
}

.close:hover,
.nav:hover {
  background: rgba(255, 255, 255, 0.24);
}

.strip {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  gap: 8px;
  padding-top: 16px;
}

.strip-thumb {
  width: 64px;
  height: 48px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  background: none;
  opacity: 0.6;
}

.strip-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.strip-thumb.selected {
  border-color: var(--gold);
  opacity: 1;
}

@media (max-width: 600px) {
  .lightbox {
    grid-template-columns: 44px 1fr 44px;
    padding: 12px;
  }

  .nav {
    width: 38px;
    height: 38px;
    font-size: 22px;
  }
}
</style>
