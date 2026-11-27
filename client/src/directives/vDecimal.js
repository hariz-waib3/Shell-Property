// v-decimal: the input only accepts digits and one decimal point ("12", "4.5").
// v-decimal.signed also allows a minus sign at the start ("-38.1", for latitude / longitude).
// Letters and other characters are blocked as you type, paste or drop text in,
// and a small tooltip above the field says why. Values set another way (e.g. Chrome's address autofill,
// which ignores autocomplete="off" and may put "India" in a field labelled "Land") are cleaned straight after.
//
//   <input v-model="form.land" v-decimal />
//   <input v-model="form.latitude" v-decimal.signed />
//
// The field stays a text input (inputmode="decimal" shows the number keypad on phones),
// because type="number" still lets "e", "+" and "-" through.

const HINT_TEXT = 'Only numbers and a decimal point (.) are allowed'
const SIGNED_HINT_TEXT = 'Only numbers, a decimal point (.) and a minus sign (-) at the start are allowed'
const HINT_SECONDS = 2

function isAllowed(input, insertedText) {
  const { value, selectionStart, selectionEnd } = input
  const nextValue = value.slice(0, selectionStart) + insertedText + value.slice(selectionEnd)

  // Digits with at most one ".", and (signed only) one "-" at the very start.
  const pattern = input._decimalSigned ? /^-?[0-9]*\.?[0-9]*$/ : /^[0-9]*\.?[0-9]*$/
  return pattern.test(nextValue)
}

// The tooltip is added to <body> and placed above the input, so it never moves the form layout.
function showHint(input) {
  let hint = input._decimalHint
  if (!hint) {
    hint = document.createElement('div')
    hint.className = 'input-tooltip'
    hint.setAttribute('role', 'status')
    hint.textContent = input._decimalSigned ? SIGNED_HINT_TEXT : HINT_TEXT
    input._decimalHint = hint
  }
  document.body.appendChild(hint)

  const box = input.getBoundingClientRect()
  hint.style.left = `${box.left + window.scrollX}px`
  hint.style.top = `${box.top + window.scrollY - hint.offsetHeight - 8}px`

  clearTimeout(input._decimalHintTimer)
  input._decimalHintTimer = setTimeout(() => hint.remove(), HINT_SECONDS * 1000)
}

// Keeps only what the field allows: digits, the first ".", and (signed only) a "-" at the start.
function clean(value, signed) {
  const isNegative = signed && value.trim().startsWith('-')
  const [whole, ...decimals] = value.replace(/[^0-9.]/g, '').split('.')
  const number = decimals.length > 0 ? `${whole}.${decimals.join('')}` : whole
  return (isNegative ? '-' : '') + number
}

// Runs after every change. Typing is already filtered above, so this only acts on autofill and the like.
function onInput(event) {
  const input = event.target
  const cleaned = clean(input.value, input._decimalSigned)
  if (cleaned === input.value) return

  input.value = cleaned
  input.dispatchEvent(new Event('input')) // so v-model stores the cleaned value
  showHint(input)
}

function onBeforeInput(event) {
  if (event.data !== null && !isAllowed(event.target, event.data)) {
    event.preventDefault()
    showHint(event.target)
  }
}

export const vDecimal = {
  mounted(input, binding) {
    input._decimalSigned = Boolean(binding.modifiers.signed)
    // Phones: the plain decimal keypad has no minus key, so signed fields get the full keyboard.
    input.setAttribute('inputmode', input._decimalSigned ? 'text' : 'decimal')
    input.addEventListener('beforeinput', onBeforeInput)
    input.addEventListener('input', onInput)
  },
  beforeUnmount(input) {
    input.removeEventListener('beforeinput', onBeforeInput)
    input.removeEventListener('input', onInput)
    clearTimeout(input._decimalHintTimer)
    input._decimalHint?.remove()
  },
}
