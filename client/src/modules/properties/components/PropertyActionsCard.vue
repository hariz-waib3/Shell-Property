<script setup>
import { computed } from 'vue'
import { isLocked } from '@/stores/session'
import { openCheckout, openEnquiry, toast } from '@/stores/ui'

const props = defineProps({
  propertyId: { type: Number, required: true },
})

const downloadsLocked = computed(() => isLocked('brochure'))

function download(fileName) {
  if (downloadsLocked.value) {
    openCheckout()
    return
  }
  toast(`${fileName} downloaded (demo)`)
}
</script>

<template>
  <div class="actions">
    <button class="btn gold block" @click="openEnquiry(props.propertyId)">Enquire now</button>
    <button class="btn primary block" @click="download('Brochure')">
      ⤓ Download brochure <span v-if="downloadsLocked">🔒</span>
    </button>
    <button class="btn block" @click="download('EOI form')">
      ⤓ Download EOI form <span v-if="downloadsLocked">🔒</span>
    </button>
    <p class="muted note">Brochures are white-labelled with your logo on the Pro plan.</p>
  </div>
</template>

<style scoped>
.actions {
  display: grid;
  gap: 10px;
}

.note {
  font-size: 12px;
  margin-top: 4px;
}
</style>
