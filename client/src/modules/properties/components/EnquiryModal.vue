<script setup>
import { currentUserName } from '@/stores/session'
import { computed, ref } from 'vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { ENQUIRY_REQUEST_TYPES } from '@/data/constants'
import { addEnquiry, findProperty } from '@/stores/db'
import { closeEnquiry, toast } from '@/stores/ui'

const props = defineProps({
  propertyId: { type: Number, required: true },
})

const property = computed(() => findProperty(props.propertyId))
const requestType = ref(ENQUIRY_REQUEST_TYPES[0])
const message = ref('')

function sendEnquiry() {
  let stage = 'Enquiries & holds'
  if (requestType.value === 'Ready for EOI') stage = 'EOIs'

  addEnquiry({
    user: currentUserName.value,
    kind: 'Property',
    ref: `${property.value.suburb}, ${property.value.lot}`,
    detail: `${requestType.value}: ${message.value || '-'}`,
    stage,
    propertyId: props.propertyId,
    requestType: requestType.value,
    message: message.value.trim(),
  })

  closeEnquiry()
  toast('Enquiry sent. Track it in My Deals.')
}
</script>

<template>
  <BaseModal :title="`Enquire: ${property.suburb}, ${property.lot}`" @close="closeEnquiry">
    <div class="q">
      <label>Request type</label>
      <div class="chips">
        <button
          v-for="type in ENQUIRY_REQUEST_TYPES"
          :key="type"
          type="button"
          class="chip"
          :class="{ on: requestType === type }"
          @click="requestType = type"
        >
          {{ type }}
        </button>
      </div>
    </div>

    <div class="field">
      <label for="enquiry-message">Message</label>
      <textarea
        id="enquiry-message"
        v-model="message"
        rows="4"
        placeholder="Buyer situation, timing, questions…"
      ></textarea>
    </div>

    <p class="muted hint">Avoid including buyer personal details until an EOI is lodged.</p>

    <template #footer>
      <button class="btn" @click="closeEnquiry">Cancel</button>
      <button class="btn primary" @click="sendEnquiry">Send enquiry</button>
    </template>
  </BaseModal>
</template>

<style scoped>
.hint {
  font-size: 12px;
}
</style>
