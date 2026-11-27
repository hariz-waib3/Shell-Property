<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { DEMO_RESET_CODE, resetPassword, sendResetCode, verifyResetCode } from '../passwordResetService'
import { toast } from '@/stores/ui'

// Forgot password, shown in place of the sign-in form: email → code → new password → done.
// Styles for the inputs and buttons come from `.auth-form` in main.css, shared with the sign-in form.
const props = defineProps({
  portal: { type: String, default: 'partner' }, // which sign-in page "Back to sign in" goes to
})

const MIN_PASSWORD_LENGTH = 8
const RESEND_WAIT_SECONDS = 30

const STEPS = {
  email: { title: 'Reset your password', text: "Enter your account email and we'll send you a 6-digit code." },
  code: { title: 'Check your email', text: '' },
  password: { title: 'Choose a new password', text: `Use at least ${MIN_PASSWORD_LENGTH} characters.` },
  done: { title: 'Password updated', text: 'You can now sign in with your new password.' },
}

const step = ref('email')
const email = ref('')
const code = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const error = ref('')
const isBusy = ref(false)

const signInRoute = computed(() => ({ name: props.portal === 'admin' ? 'admin-login' : 'login' }))

/* ---------- Resend timer ---------- */

const resendSecondsLeft = ref(0)
let timerId = null

function startResendTimer() {
  resendSecondsLeft.value = RESEND_WAIT_SECONDS
  clearInterval(timerId)
  timerId = setInterval(() => {
    resendSecondsLeft.value--
    if (resendSecondsLeft.value <= 0) clearInterval(timerId)
  }, 1000)
}

onBeforeUnmount(() => clearInterval(timerId))

/* ---------- Steps ---------- */

// Runs one API call with the busy flag and error message handled.
async function run(action) {
  error.value = ''
  isBusy.value = true
  try {
    await action()
  } catch (err) {
    error.value = err.message
  } finally {
    isBusy.value = false
  }
}

function submitEmail() {
  const cleanEmail = email.value.trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    error.value = 'Please enter a valid email address.'
    return
  }

  run(async () => {
    await sendResetCode(cleanEmail)
    email.value = cleanEmail
    code.value = ''
    step.value = 'code'
    startResendTimer()
  })
}

function resendCode() {
  run(async () => {
    await sendResetCode(email.value)
    toast('A new code has been sent')
    startResendTimer()
  })
}

// Keep digits only, so pasting "123 456" still works.
function onCodeInput(event) {
  code.value = event.target.value.replace(/\D/g, '').slice(0, 6)
  event.target.value = code.value
}

function submitCode() {
  if (code.value.length !== 6) {
    error.value = 'Enter the 6-digit code from your email.'
    return
  }

  run(async () => {
    await verifyResetCode(email.value, code.value)
    step.value = 'password'
  })
}

function submitPassword() {
  if (password.value.length < MIN_PASSWORD_LENGTH) {
    error.value = `Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = "The two passwords don't match."
    return
  }

  run(async () => {
    await resetPassword(email.value, code.value, password.value)
    step.value = 'done'
  })
}

function changeEmail() {
  error.value = ''
  step.value = 'email'
}
</script>

<template>
  <div class="form-box auth-form">
    <h1>{{ STEPS[step].title }}</h1>
    <p v-if="step === 'code'" class="muted subtitle">
      If <b>{{ email }}</b> has an account, a code is on its way.
      <button type="button" class="text-link" @click="changeEmail">Change email</button>
    </p>
    <p v-else class="muted subtitle">{{ STEPS[step].text }}</p>

    <!-- 1. Email -->
    <form v-if="step === 'email'" class="step" novalidate @submit.prevent="submitEmail">
      <div class="input-box" :class="{ invalid: error }">
        <label for="reset-email">Email</label>
        <input id="reset-email" v-model="email" type="email" autocomplete="email" placeholder="you@agency.com.au" />
      </div>
      <div v-if="error" class="field-error form-error" role="alert">{{ error }}</div>
      <button type="submit" class="btn primary block submit" :disabled="isBusy">
        {{ isBusy ? 'Sending code…' : 'Send reset code' }}
      </button>
    </form>

    <!-- 2. Code -->
    <form v-else-if="step === 'code'" class="step" novalidate @submit.prevent="submitCode">
      <div class="input-box" :class="{ invalid: error }">
        <label for="reset-code">Verification code</label>
        <input
          id="reset-code"
          class="code-input"
          :value="code"
          inputmode="numeric"
          autocomplete="one-time-code"
          maxlength="6"
          placeholder="••••••"
          @input="onCodeInput"
        />
      </div>
      <div v-if="error" class="field-error form-error" role="alert">{{ error }}</div>
      <p v-else class="muted hint">Demo mode: use {{ DEMO_RESET_CODE }}</p>
      <button type="submit" class="btn primary block submit" :disabled="isBusy">
        {{ isBusy ? 'Checking…' : 'Continue' }}
      </button>
      <p class="muted resend">
        Didn't get it?
        <span v-if="resendSecondsLeft > 0">Resend in {{ resendSecondsLeft }}s</span>
        <button v-else type="button" class="text-link" :disabled="isBusy" @click="resendCode">Resend code</button>
      </p>
    </form>

    <!-- 3. New password -->
    <form v-else-if="step === 'password'" class="step" novalidate @submit.prevent="submitPassword">
      <div class="input-box has-toggle" :class="{ invalid: error }">
        <label for="reset-password">New password</label>
        <input
          id="reset-password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
        />
        <button
          type="button"
          class="show-toggle"
          :aria-label="showPassword ? 'Hide password' : 'Show password'"
          @click="showPassword = !showPassword"
        >
          {{ showPassword ? 'Hide' : 'Show' }}
        </button>
      </div>
      <div class="input-box" :class="{ invalid: error }">
        <label for="reset-confirm">Confirm new password</label>
        <input
          id="reset-confirm"
          v-model="confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="new-password"
        />
      </div>
      <div v-if="error" class="field-error form-error" role="alert">{{ error }}</div>
      <button type="submit" class="btn primary block submit" :disabled="isBusy">
        {{ isBusy ? 'Saving…' : 'Update password' }}
      </button>
    </form>

    <!-- 4. Done -->
    <div v-else class="step done">
      <span class="done-icon" aria-hidden="true">✓</span>
      <RouterLink :to="signInRoute" class="btn primary block submit">Back to sign in →</RouterLink>
    </div>

    <p v-if="step !== 'done'" class="muted sign-up">
      Remembered it?
      <RouterLink :to="signInRoute">Back to sign in</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.step {
  margin-top: 24px;
}

.code-input {
  font-size: 20px;
  letter-spacing: 8px;
}

.hint {
  margin: -4px 0 14px;
  font-size: 12.5px;
}

.resend {
  margin-top: 14px;
  text-align: center;
  font-size: 13px;
}

.done {
  display: grid;
  justify-items: center;
  gap: 20px;
}

.done-icon {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--ok-l);
  color: var(--ok);
  font-size: 26px;
  font-weight: 700;
}

.done .submit {
  text-align: center;
  text-decoration: none;
}
</style>
