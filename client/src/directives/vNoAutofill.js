// v-no-autofill: stops the browser filling the inputs inside this element from saved addresses or profiles.
//
//   <div v-no-autofill> ...inputs... </div>
//
// Why not just autocomplete="off"? Chrome ignores it for address autofill: picking a saved address in one
// field also filled "Land size" with "India" ("Land" means country in German / Dutch).
// Browsers never autofill read-only fields, so every input here stays read-only until it is clicked or
// tabbed into, and becomes read-only again when you leave it. Typing works as normal.
const FIELDS = 'input:not([type=checkbox]):not([type=radio]):not([type=file]), textarea'

function lockFields(container) {
  container.querySelectorAll(FIELDS).forEach((field) => {
    if (field !== document.activeElement) field.readOnly = true
    field.setAttribute('autocomplete', 'off')
    field.setAttribute('data-1p-ignore', '') // password managers
    field.setAttribute('data-lpignore', 'true')
  })
}

function onFocusIn(event) {
  if (event.target.matches(FIELDS)) event.target.readOnly = false
}

function onFocusOut(event) {
  if (event.target.matches(FIELDS)) event.target.readOnly = true
}

export const vNoAutofill = {
  mounted(container) {
    lockFields(container)
    container.addEventListener('focusin', onFocusIn)
    container.addEventListener('focusout', onFocusOut)
  },
  // Sections that open later (Description, Map location, ...) get the same treatment.
  updated(container) {
    lockFields(container)
  },
  beforeUnmount(container) {
    container.removeEventListener('focusin', onFocusIn)
    container.removeEventListener('focusout', onFocusOut)
  },
}
