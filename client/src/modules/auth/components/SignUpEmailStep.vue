<script setup>
import { ref } from 'vue'
import { sendVerificationCode } from '../signUpService'

const props = defineProps({
  initialEmail: { type: String, default: '' },
})

const emit = defineEmits(['code-sent'])

const email = ref(props.initialEmail)
const error = ref('')
const isSending = ref(false)

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

async function handleSubmit() {
  error.value = ''
  const cleanEmail = email.value.trim()

  if (!isValidEmail(cleanEmail)) {
    error.value = 'Please enter a valid email address.'
    return
  }

  isSending.value = true
  try {
    await sendVerificationCode(cleanEmail)
    emit('code-sent', cleanEmail)
  } catch (err) {
    error.value = err.message
  } finally {
    isSending.value = false
  }
}
</script>

<template>
  <form novalidate @submit.prevent="handleSubmit">
    <p class="muted intro">Enter your work email. We'll send you a 6-digit code to verify it.</p>

    <div class="field">
      <label for="signup-email">Email</label>
      <input
        id="signup-email"
        v-model="email"
        type="email"
        autocomplete="email"
        placeholder="you@agency.com.au"
        :class="{ invalid: error }"
        :aria-invalid="Boolean(error)"
        aria-describedby="signup-email-error"
      />
      <div v-if="error" id="signup-email-error" class="field-error">{{ error }}</div>
    </div>

    <button type="submit" class="btn primary block" :disabled="isSending">
      {{ isSending ? 'Sending code…' : 'Send verification code' }}
    </button>
  </form>
</template>

<style scoped>
.intro {
  margin-bottom: 18px;
}
</style>
