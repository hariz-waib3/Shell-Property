<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { DEMO_CODE, sendVerificationCode, verifyCode } from '../signUpService'
import { toast } from '@/stores/ui'

const props = defineProps({
  email: { type: String, required: true },
})

const emit = defineEmits(['verified', 'change-email'])

const RESEND_WAIT_SECONDS = 30

const code = ref('')
const error = ref('')
const isVerifying = ref(false)
const resendSecondsLeft = ref(RESEND_WAIT_SECONDS)

let timerId = null

function startResendTimer() {
  resendSecondsLeft.value = RESEND_WAIT_SECONDS
  clearInterval(timerId)
  timerId = setInterval(() => {
    resendSecondsLeft.value--
    if (resendSecondsLeft.value <= 0) clearInterval(timerId)
  }, 1000)
}

// Keep digits only, so pasting "123 456" still works.
function onCodeInput(event) {
  code.value = event.target.value.replace(/\D/g, '').slice(0, 6)
  event.target.value = code.value
}

async function handleSubmit() {
  error.value = ''

  if (code.value.length !== 6) {
    error.value = 'Enter the 6-digit code from your email.'
    return
  }

  isVerifying.value = true
  try {
    await verifyCode(props.email, code.value)
    emit('verified')
  } catch (err) {
    error.value = err.message
  } finally {
    isVerifying.value = false
  }
}

async function resendCode() {
  error.value = ''
  try {
    await sendVerificationCode(props.email)
    toast('A new code has been sent')
    startResendTimer()
  } catch (err) {
    error.value = err.message
  }
}

onMounted(startResendTimer)
onBeforeUnmount(() => clearInterval(timerId))
</script>

<template>
  <form novalidate @submit.prevent="handleSubmit">
    <p class="muted intro">
      We sent a code to <b>{{ email }}</b>.
      <button type="button" class="text-link" @click="emit('change-email')">Change email</button>
    </p>

    <div class="field">
      <label for="signup-code">Verification code</label>
      <input
        id="signup-code"
        class="code-input"
        :value="code"
        inputmode="numeric"
        autocomplete="one-time-code"
        maxlength="6"
        placeholder="••••••"
        :class="{ invalid: error }"
        :aria-invalid="Boolean(error)"
        aria-describedby="signup-code-help"
        @input="onCodeInput"
      />
      <div v-if="error" id="signup-code-help" class="field-error">{{ error }}</div>
      <div v-else id="signup-code-help" class="field-hint">Demo mode: use {{ DEMO_CODE }}</div>
    </div>

    <button type="submit" class="btn primary block" :disabled="isVerifying">
      {{ isVerifying ? 'Verifying…' : 'Verify email' }}
    </button>

    <p class="muted resend">
      Didn't get it?
      <span v-if="resendSecondsLeft > 0">Resend in {{ resendSecondsLeft }}s</span>
      <button v-else type="button" class="text-link" @click="resendCode">Resend code</button>
    </p>
  </form>
</template>

<style scoped>
.intro {
  margin-bottom: 18px;
}

.code-input {
  font-size: 20px;
  letter-spacing: 8px;
  text-align: center;
}

.resend {
  margin-top: 14px;
  font-size: 13px;
  text-align: center;
}

.text-link {
  background: none;
  border: 0;
  padding: 0;
  color: var(--gold-d);
  font-weight: 600;
  text-decoration: underline;
}
</style>
