import { computed, ref } from 'vue'
import { setPropertyActive } from '@/stores/db'
import { toast } from '@/stores/ui'

// Enable / Disable a property, with a confirmation first.
// Shared by the admin properties list and the admin property page.
// Disabled properties stay in admin, but partners can't see them (lists, links and My Lists).
export function usePropertyActivation() {
  const pending = ref(null) // the property waiting for confirmation

  function toggleActive(property) {
    pending.value = property
  }

  // Text for the ConfirmDialog, or null when nothing is waiting.
  const confirmation = computed(() => {
    const property = pending.value
    if (!property) return null

    const name = `${property.lot}, ${property.suburb} ${property.state}`
    return property.active
      ? {
          title: 'Disable this property?',
          message: `${name} will be hidden from partners. It stays here, and you can enable it again at any time.`,
          confirmLabel: 'Disable',
          danger: true,
        }
      : {
          title: 'Enable this property?',
          message: `${name} will be visible to partners again.`,
          confirmLabel: 'Enable',
          danger: false,
        }
  })

  function confirmPending() {
    const property = pending.value
    setPropertyActive(property.id, !property.active)
    toast(property.active ? 'Property enabled' : 'Property disabled')
    pending.value = null
  }

  function cancelPending() {
    pending.value = null
  }

  return { toggleActive, confirmation, confirmPending, cancelPending }
}
