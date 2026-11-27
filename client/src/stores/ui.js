import { reactive } from 'vue'
import { isLocked } from './session'

// App-wide UI state: toasts and the modals that can be opened from any page.
export const ui = reactive({
  toasts: [],
  showCheckout: false,
  showPortal: false,
  enquiryPropertyId: null,
})

let nextToastId = 1

export function toast(message) {
  const id = nextToastId++
  ui.toasts.push({ id, message })

  setTimeout(() => {
    ui.toasts = ui.toasts.filter((item) => item.id !== id)
  }, 2200)
}

export function openCheckout() {
  ui.showCheckout = true
}

export function closeCheckout() {
  ui.showCheckout = false
}

export function openPortal() {
  ui.showPortal = true
}

export function closePortal() {
  ui.showPortal = false
}

export function openEnquiry(propertyId) {
  if (isLocked('enquiry')) {
    openCheckout()
    return
  }
  ui.enquiryPropertyId = propertyId
}

export function closeEnquiry() {
  ui.enquiryPropertyId = null
}
