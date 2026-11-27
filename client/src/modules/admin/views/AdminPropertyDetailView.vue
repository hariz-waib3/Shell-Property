<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import PropertyPhotoGallery from '@/components/property/PropertyPhotoGallery.vue'
import PropertyDetailSections from '@/components/property/PropertyDetailSections.vue'
import PropertySummary from '@/components/property/PropertySummary.vue'
import PropertyFormFields from '../components/PropertyFormFields.vue'
import PropertyImageUploader from '../components/PropertyImageUploader.vue'
import { usePropertyActivation } from '../composables/usePropertyActivation'
import { usePropertyForm } from '../composables/usePropertyForm'
import { PROPERTY_STATUSES } from '@/data/constants'
import { deleteProperty, findProperty, setPropertyStatus } from '@/stores/db'
import { toast } from '@/stores/ui'
import { formatDate, propertyCode, statusColorClass } from '@/utils/format'

// One page to view, edit and add a property (see admin/routes.js):
//   /admin/properties/:id          view: same layout partners see, with admin tools on the right
//   /admin/properties/:id?edit=1   opens straight in edit mode (pencil icon on the list)
//   /admin/properties/new          id = null: the same page in edit mode, with empty fields
const props = defineProps({
  id: { type: Number, default: null },
})

const route = useRoute()
const router = useRouter()

const isNew = computed(() => props.id === null)

// Opened from the dashboard (?from=dashboard): the back button returns there instead of to the list.
const backLink = computed(() =>
  route.query.from === 'dashboard'
    ? { to: { name: 'admin-dashboard' }, label: 'Back to dashboard' }
    : { to: { name: 'admin-properties' }, label: 'Back to properties' },
)
const property = computed(() => (isNew.value ? null : findProperty(props.id)))

/* ---------- Edit mode ---------- */

const isEditing = ref(false)
const { form, load, save } = usePropertyForm()

const pageTitle = computed(() => {
  if (isNew.value) return 'Add property'
  if (isEditing.value) return 'Edit property'
  return 'House & Land'
})

const isSaving = ref(false)
const photosUploading = ref(false)
const floorplansUploading = ref(false)

// A copy of the form as it was loaded, to tell whether anything has been changed since.
const savedForm = ref('')
const hasChanges = computed(() => isEditing.value && JSON.stringify(form) !== savedForm.value)

function startEditing() {
  load(props.id)
  savedForm.value = JSON.stringify(form)
  isEditing.value = true
}

function stopEditing() {
  if (isNew.value) {
    router.push({ name: 'admin-properties' })
    return
  }
  isEditing.value = false
}

function cancelEditing() {
  if (hasChanges.value) confirmingDiscard.value = true
  else stopEditing()
}

async function saveChanges() {
  if (isSaving.value) return // a double click must not add the property twice
  if (photosUploading.value || floorplansUploading.value) {
    toast('Please wait until the photos have finished uploading')
    return
  }

  isSaving.value = true
  try {
    const savedId = save(props.id)
    if (!savedId) return

    savedForm.value = JSON.stringify(form) // saved, so leaving the page is fine now
    // A new property moves to its own page first; leaving edit mode before that would show a page with no property.
    if (isNew.value) await router.replace({ name: 'admin-property-detail', params: { id: savedId } })
    isEditing.value = false
  } finally {
    isSaving.value = false
  }
}

/* ---------- Unsaved changes ---------- */

const confirmingDiscard = ref(false)
let pendingRoute = null // where the user was going when we asked

// Leaving the page (Back, a menu link) with unsaved changes: ask first.
onBeforeRouteLeave((to) => {
  if (!hasChanges.value) return true
  pendingRoute = to
  confirmingDiscard.value = true
  return false
})

function discardChanges() {
  confirmingDiscard.value = false
  savedForm.value = JSON.stringify(form) // nothing to protect any more
  if (pendingRoute) {
    router.push(pendingRoute)
    pendingRoute = null
  } else {
    stopEditing()
  }
}

function keepEditing() {
  confirmingDiscard.value = false
  pendingRoute = null
}

// Closing or reloading the tab with unsaved changes: the browser asks.
function onBeforeUnload(event) {
  if (hasChanges.value) event.preventDefault()
}
window.addEventListener('beforeunload', onBeforeUnload)
onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))

// Decide the mode now, before the first render, so the page never tries to show a property that isn't there.
if (isNew.value || route.query.edit === '1') startEditing()

// The same page is reused when going from /new to a property; start editing again if it goes back to /new.
watch(
  () => props.id,
  (id) => {
    if (id === null) startEditing()
  },
)

onMounted(() => {
  if (route.query.edit === '1') router.replace({ query: { ...route.query, edit: undefined } })
})

/* ---------- Status and delete ---------- */

const confirmingDelete = ref(false)

const { toggleActive, confirmation, confirmPending, cancelPending } = usePropertyActivation()

function changeStatus(status) {
  setPropertyStatus(props.id, status)
  toast('Status updated')
}

function confirmDelete() {
  deleteProperty(props.id)
  confirmingDelete.value = false
  toast('Property deleted')
  router.push({ name: 'admin-properties' })
}
</script>

<template>
  <BaseButton small :to="backLink.to">← {{ backLink.label }}</BaseButton>

  <EmptyState
    v-if="!isNew && !property"
    class="card not-found"
    title="Property not found"
    message="It may have been deleted."
  />

  <template v-else>
    <div class="row title-row">
      <h1 class="page grow">{{ pageTitle }}</h1>
      <template v-if="isEditing">
        <BaseButton @click="cancelEditing">Cancel</BaseButton>
        <BaseButton variant="dark" :icon="isNew ? 'plus' : ''" :disabled="isSaving" @click="saveChanges">
          {{ isNew ? 'Add property' : 'Save changes' }}
        </BaseButton>
      </template>
      <!-- View mode: status, enable / disable and edit, together at the top. -->
      <template v-else>
        <select
          class="status-pill header-status"
          :class="statusColorClass(property.status)"
          :value="property.status"
          aria-label="Status"
          @change="changeStatus($event.target.value)"
        >
          <option v-for="status in PROPERTY_STATUSES" :key="status">{{ status }}</option>
        </select>
        <BaseButton icon="power" :danger="property.active" @click="toggleActive(property)">
          {{ property.active ? 'Disable' : 'Enable' }}
        </BaseButton>
        <BaseButton variant="dark" icon="edit" @click="startEditing">Edit property</BaseButton>
      </template>
    </div>

    <div v-if="property && !property.active && !isEditing" class="inactive-banner">
      <span class="grow"
        >This property is <b>disabled</b>: partners can't see it in lists, by link or in My Lists.</span
      >
      <BaseButton small icon="power" @click="toggleActive(property)">Enable</BaseButton>
    </div>

    <!-- Left: details or the form. Right: photos, then listing tools. -->
    <div class="detail admin-detail">
      <div v-if="isEditing" class="card pad edit-card">
        <PropertyFormFields :form="form" />
        <div class="edit-actions">
          <BaseButton @click="cancelEditing">Cancel</BaseButton>
          <BaseButton variant="dark" :icon="isNew ? 'plus' : ''" :disabled="isSaving" @click="saveChanges">
            {{ isNew ? 'Add property' : 'Save changes' }}
          </BaseButton>
        </div>
      </div>

      <!-- Left: one card with every section, separated by thin lines. -->
      <div v-else class="card pad main-card">
        <PropertySummary :property="property" />

        <PropertyDetailSections :property="property" />
      </div>

      <aside class="card pad side-card">
        <!-- Photos: uploader in edit / add mode (remove, replace, set cover, add), gallery otherwise. -->
        <section class="photos">
          <div class="section-t">Photos</div>
          <PropertyImageUploader
            v-if="isEditing"
            v-model="form.images"
            v-model:uploading="photosUploading"
            layout="side"
          />
          <PropertyPhotoGallery v-else :property-id="property.id" :images="property.images || []" />
        </section>

        <!-- Floorplans are shown in the left column; they are managed here while editing. -->
        <section v-if="isEditing" class="side-section">
          <div class="section-t">Floorplans</div>
          <PropertyImageUploader
            v-model="form.floorplans"
            v-model:uploading="floorplansUploading"
            layout="side"
            :max="2"
            noun="floorplan"
            :has-cover="false"
          />
        </section>

        <!-- Admin tools (partners see Enquire / Download here instead). Not shown while adding. -->
        <div v-if="!isNew" class="side-section listing">
          <div class="section-t">Listing</div>

          <dl class="facts">
            <div>
              <dt>ID</dt>
              <dd>{{ propertyCode(property.id) }}</dd>
            </div>
            <div>
              <dt>Last verified</dt>
              <dd>{{ formatDate(property.verified) }}</dd>
            </div>
            <div>
              <dt>Title</dt>
              <dd>{{ property.titled ? 'Titled' : 'Untitled' }}</dd>
            </div>
            <div>
              <dt>Photos</dt>
              <dd>{{ (property.images || []).length }}</dd>
            </div>
          </dl>

          <BaseButton v-if="!isEditing" variant="dark" block icon="edit" @click="startEditing"
            >Edit property</BaseButton
          >
          <BaseButton block danger icon="trash" @click="confirmingDelete = true">Delete property</BaseButton>

          <p class="muted note">Changes appear on the partner side instantly.</p>
        </div>
      </aside>
    </div>

    <ConfirmDialog
      v-if="confirmingDiscard"
      title="Discard your changes?"
      message="You have changes that haven't been saved. If you leave now, they will be lost."
      confirm-label="Discard changes"
      cancel-label="Keep editing"
      danger
      @confirm="discardChanges"
      @cancel="keepEditing"
    />

    <ConfirmDialog
      v-if="confirmation"
      :title="confirmation.title"
      :message="confirmation.message"
      :confirm-label="confirmation.confirmLabel"
      :danger="confirmation.danger"
      @confirm="confirmPending"
      @cancel="cancelPending"
    />

    <ConfirmDialog
      v-if="confirmingDelete && property"
      title="Delete this property?"
      :message="`${property.lot}, ${property.suburb} ${property.state} will be removed for all partners. This can't be undone.`"
      confirm-label="Delete property"
      danger
      @confirm="confirmDelete"
      @cancel="confirmingDelete = false"
    />
  </template>
</template>

<style scoped>
.not-found {
  margin-top: 16px;
}

.title-row {
  flex-wrap: wrap;
  gap: 10px;
  margin: 16px 0;
}

/* Same height and shape as the buttons next to it. */
.header-status {
  height: 40px;
  border-radius: 8px;
  padding: 0 34px 0 16px;
}

/* A slightly wider right column than the partner page, to fit the photos. */
.admin-detail {
  grid-template-columns: 1fr 380px;
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

.edit-card,
.main-card {
  align-self: start;
}

.main-card {
  padding: 24px;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}

.listing {
  display: grid;
  gap: 10px;
}

.listing .field {
  margin-bottom: 4px;
}

.facts {
  margin: 0 0 6px;
}

.inactive-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 10px;
  background: #efeee9;
  font-size: 13.5px;
}

.facts div {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
  font-size: 13.5px;
}

.facts dt {
  color: var(--muted);
}

.facts dd {
  margin: 0;
  font-weight: 500;
}

.note {
  font-size: 12px;
}

@media (max-width: 900px) {
  .admin-detail {
    grid-template-columns: 1fr;
  }
}
</style>
