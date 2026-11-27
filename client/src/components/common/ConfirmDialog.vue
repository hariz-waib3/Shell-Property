<script setup>
import { computed } from 'vue'
import BaseButton from './BaseButton.vue'
import BaseModal from './BaseModal.vue'

// "Are you sure?" popup. The parent shows it with v-if and handles @confirm / @cancel.
//
//   <ConfirmDialog v-if="deletingId" title="Delete property?" message="..." confirm-label="Delete"
//                  danger @confirm="deleteNow" @cancel="deletingId = null" />
const props = defineProps({
  title: { type: String, required: true },
  message: { type: String, default: '' },
  confirmLabel: { type: String, default: 'Confirm' },
  cancelLabel: { type: String, default: 'Cancel' },
  danger: { type: Boolean, default: false }, // red confirm button, for things that are hard to undo
})

// The bin icon only makes sense when something is deleted or removed (not for "Disable" or "Discard changes").
const confirmIcon = computed(() => (props.danger && /^(delete|remove)/i.test(props.confirmLabel) ? 'trash' : ''))

const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <BaseModal :title="title" @close="emit('cancel')">
    <p class="message">{{ message }}</p>

    <template #footer>
      <BaseButton @click="emit('cancel')">{{ cancelLabel }}</BaseButton>
      <BaseButton :variant="danger ? 'light' : 'dark'" :danger="danger" :icon="confirmIcon" @click="emit('confirm')">
        {{ confirmLabel }}
      </BaseButton>
    </template>
  </BaseModal>
</template>

<style scoped>
.message {
  color: var(--ink2);
}
</style>
