<script setup>
import { computed, ref } from 'vue'
import { toast } from '@/stores/ui'
import { uploadImage } from '@/stores/demoStorage'

// Photo upload area on the add / edit property page (in the right-hand column). Also used for floorplans.
// v-model is an array of { id, url, name }. The first image is the cover. At most `max` images.
// Each photo is uploaded straight away and saved as a file (see stores/demoStorage.js).
const images = defineModel({ type: Array, required: true })

// True while files are uploading, so the page can wait before saving (v-model:uploading).
const uploading = defineModel('uploading', { type: Boolean, default: false })

// 'wide' = 4 columns (cover 2x2), 'side' = 2 columns for a narrow column (cover full width on top).
const props = defineProps({
  layout: { type: String, default: 'wide' },
  max: { type: Number, default: 5 },
  noun: { type: String, default: 'photo' }, // used in the button and help texts
  hasCover: { type: Boolean, default: true }, // floorplans have no cover image
})

const spaceLeft = computed(() => props.max - images.value.length)

const fileInput = ref(null)
const replaceInput = ref(null)
const replacingId = ref(null) // the photo being swapped by "Replace"
const isDragging = ref(false)

let nextImageId = 1

async function toImage(file) {
  const url = await uploadImage(file)
  return { id: `new-${Date.now()}-${nextImageId++}`, url, name: file.name }
}

async function addFiles(fileList) {
  const imageFiles = [...fileList].filter((file) => file.type.startsWith('image/'))
  const filesToAdd = imageFiles.slice(0, spaceLeft.value)

  if (imageFiles.length > filesToAdd.length) {
    toast(`Only ${props.max} ${props.noun}s per property. ${imageFiles.length - filesToAdd.length} not added.`)
  }
  uploading.value = true
  const results = await Promise.allSettled(filesToAdd.map(toImage))
  uploading.value = false

  // Keep the ones that worked, and say how many didn't.
  const newImages = results.filter((result) => result.status === 'fulfilled').map((result) => result.value)
  images.value = [...images.value, ...newImages]

  const failedCount = results.length - newImages.length
  if (failedCount > 0)
    toast(`${failedCount} ${props.noun}${failedCount > 1 ? 's' : ''} could not be uploaded. Please try again.`)
}

function openFilePicker() {
  fileInput.value.click()
}

function onFilesChosen(event) {
  addFiles(event.target.files)
  event.target.value = '' // so choosing the same file again still triggers a change
}

function onDrop(event) {
  isDragging.value = false
  addFiles(event.dataTransfer.files)
}

function removeImage(id) {
  images.value = images.value.filter((image) => image.id !== id)
}

// "Replace": pick one new file and put it in the same position as the old photo.
function startReplace(id) {
  replacingId.value = id
  replaceInput.value.click()
}

async function onReplacementChosen(event) {
  const file = event.target.files[0]
  event.target.value = ''
  if (!file || !file.type.startsWith('image/')) return

  uploading.value = true
  try {
    const newImage = await toImage(file)
    images.value = images.value.map((image) => (image.id === replacingId.value ? newImage : image))
  } catch {
    toast(`The ${props.noun} could not be uploaded. Please try again.`)
  } finally {
    uploading.value = false
    replacingId.value = null
  }
}

function makeCover(id) {
  const chosen = images.value.find((image) => image.id === id)
  images.value = [chosen, ...images.value.filter((image) => image.id !== id)]
}
</script>

<template>
  <div
    class="uploader"
    :class="[layout, { dragging: isDragging }]"
    @dragover.prevent="isDragging = true"
    @dragleave.self="isDragging = false"
    @drop.prevent="onDrop"
  >
    <!-- No photos yet: one big drop area. -->
    <button v-if="images.length === 0" type="button" class="dropzone" @click="openFilePicker">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.8" />
        <path d="M21 16l-5-5-8 8" />
      </svg>
      <b>Drag {{ noun }}s here, or click to upload</b>
      <span>
        Up to {{ max }} {{ noun }}s, JPG or PNG.
        <template v-if="hasCover">The first {{ noun }} is used as the cover.</template>
      </span>
    </button>

    <!-- Photos added: cover large, the rest as thumbnails, plus an "Add" tile. -->
    <div v-else class="photo-grid">
      <figure
        v-for="(image, index) in images"
        :key="image.id"
        class="photo"
        :class="{ cover: hasCover && index === 0 }"
      >
        <img :src="image.url" :alt="image.name" />
        <span v-if="hasCover && index === 0" class="cover-badge">Cover</span>
        <!-- Remove is always visible; Replace / Set as cover show on hover (always on touch screens). -->
        <button
          type="button"
          class="remove"
          :aria-label="`Remove ${image.name}`"
          :title="`Remove ${noun}`"
          @click="removeImage(image.id)"
        >
          ✕
        </button>
        <div class="photo-actions">
          <button type="button" @click="startReplace(image.id)">Replace</button>
          <button v-if="hasCover && index > 0" type="button" @click="makeCover(image.id)">Set as cover</button>
        </div>
      </figure>

      <button v-if="spaceLeft > 0" type="button" class="add-tile" @click="openFilePicker">
        <span class="plus">+</span>
        Add {{ noun }}s
        <small>{{ spaceLeft }} more</small>
      </button>

      <!-- Fill the rest of the grid with disabled slots, so it always shows all the photo places. -->
      <div v-for="slot in Math.max(spaceLeft - 1, 0)" :key="'empty-' + slot" class="empty-slot" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <circle cx="9" cy="10" r="1.8" />
          <path d="M21 16l-5-5-8 8" />
        </svg>
      </div>
    </div>

    <!-- At the limit the grid is full (cover + 4), so the note goes underneath. -->
    <p v-if="images.length > 0 && spaceLeft === 0" class="limit-note">
      Maximum {{ max }} {{ noun }}s. Remove or replace one to change.
    </p>

    <input ref="fileInput" type="file" accept="image/*" multiple hidden @change="onFilesChosen" />
    <input ref="replaceInput" type="file" accept="image/*" hidden @change="onReplacementChosen" />
  </div>
</template>

<style scoped>
.uploader {
  margin-bottom: 24px;
  border-radius: var(--r);
}

.uploader.dragging {
  outline: 2px dashed var(--gold);
  outline-offset: 4px;
}

/* ---------- Empty state ---------- */
.dropzone {
  width: 100%;
  height: 240px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 6px;
  border: 2px dashed #d6d2c8;
  border-radius: var(--r);
  background: #fbfaf7;
  color: var(--ink2);
  transition:
    border-color 0.15s,
    background 0.15s;
}

.dropzone:hover,
.dragging .dropzone {
  border-color: var(--gold);
  background: var(--gold-l);
}

.dropzone svg {
  width: 40px;
  height: 40px;
  fill: none;
  stroke: var(--gold-d);
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  margin-bottom: 4px;
}

.dropzone span {
  font-size: 12.5px;
  color: var(--muted);
}

/* ---------- Photos ---------- */
.photo-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 130px;
  gap: 8px;
}

.photo {
  position: relative;
  margin: 0;
  border-radius: 8px;
  overflow: hidden;
  background: var(--bg);
}

.photo.cover {
  grid-column: span 2;
  grid-row: span 2;
}

.photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
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

/* Actions appear when hovering a photo. */
.photo-actions {
  position: absolute;
  inset: auto 8px 8px 8px;
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.15s;
}

.photo:hover .photo-actions,
.photo:focus-within .photo-actions {
  opacity: 1;
}

/* Touch screens have no hover, so keep the actions visible there. */
@media (hover: none) {
  .photo-actions {
    opacity: 1;
  }
}

.photo-actions button,
.remove {
  border: 0;
  border-radius: 6px;
  background: rgba(20, 22, 26, 0.8);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 9px;
}

.photo-actions button:hover,
.remove:hover {
  background: var(--ink);
}

/* Round remove button in the top-right corner of every photo. */
.remove {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

/* Disabled placeholder for a photo slot that is not available yet. */
.empty-slot {
  display: grid;
  place-items: center;
  border: 1px dashed #e2dfd7;
  border-radius: 8px;
  background: #f7f6f2;
}

.empty-slot svg {
  width: 26px;
  height: 26px;
  fill: none;
  stroke: #cfccc5;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.add-tile {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 2px;
  border: 2px dashed #d6d2c8;
  border-radius: 8px;
  background: #fbfaf7;
  color: var(--ink2);
  font-weight: 600;
  font-size: 13px;
}

.add-tile small {
  font-weight: 400;
  font-size: 11.5px;
  color: var(--muted);
}

.limit-note {
  margin-top: 8px;
  font-size: 12.5px;
  color: var(--muted);
}

button.add-tile:hover {
  border-color: var(--gold);
  background: var(--gold-l);
}

.plus {
  font-size: 22px;
  line-height: 1;
  color: var(--gold-d);
}

/* Narrow (right-hand column) layout: two columns, cover across the top. */
.uploader.side .photo-grid {
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 100px;
}

.uploader.side .dropzone {
  height: 200px;
  padding: 0 16px;
  text-align: center;
}

.uploader.side {
  margin-bottom: 0;
}

@media (max-width: 600px) {
  .photo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
