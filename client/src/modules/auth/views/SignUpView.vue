<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthBrandPanel from '../components/AuthBrandPanel.vue'
import SignUpEmailStep from '../components/SignUpEmailStep.vue'
import SignUpCodeStep from '../components/SignUpCodeStep.vue'
import SignUpDetailsStep from '../components/SignUpDetailsStep.vue'
import { PLANS, ROLES } from '@/data/constants'
import { signIn } from '@/stores/session'
import { toast } from '@/stores/ui'

const router = useRouter()

// 'email' → 'code' → 'details'
const STEPS = [
  { key: 'email', title: 'Create your partner account' },
  { key: 'code', title: 'Check your email' },
  { key: 'details', title: 'Tell us about you' },
]

const currentStep = ref('email')
const email = ref('')

const stepIndex = computed(() => STEPS.findIndex((step) => step.key === currentStep.value))
const stepTitle = computed(() => STEPS[stepIndex.value].title)

function onCodeSent(verifiedEmail) {
  email.value = verifiedEmail
  currentStep.value = 'code'
}

function onChangeEmail() {
  currentStep.value = 'email'
}

function onVerified() {
  currentStep.value = 'details'
}

// New partners start on the Free plan.
function onAccountCreated() {
  signIn(ROLES.PARTNER, PLANS.FREE, email.value)
  toast('Welcome! Your account is ready.')
  router.push({ name: 'properties' })
}
</script>

<template>
  <section class="login-page">
    <AuthBrandPanel />

    <div class="form">
      <div class="box signup-box">
        <div class="steps signup-steps" aria-hidden="true">
          <div v-for="(step, index) in STEPS" :key="step.key" :class="{ on: index <= stepIndex }"></div>
        </div>

        <p class="muted step-count">Step {{ stepIndex + 1 }} of {{ STEPS.length }}</p>
        <h2>{{ stepTitle }}</h2>

        <SignUpEmailStep v-if="currentStep === 'email'" :initial-email="email" @code-sent="onCodeSent" />
        <SignUpCodeStep
          v-else-if="currentStep === 'code'"
          :email="email"
          @verified="onVerified"
          @change-email="onChangeEmail"
        />
        <SignUpDetailsStep v-else :email="email" @account-created="onAccountCreated" />

        <p class="muted switch">
          Already have an account?
          <RouterLink :to="{ name: 'login' }">Sign in</RouterLink>
        </p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.signup-box {
  max-width: 460px;
}

.signup-steps {
  grid-template-columns: repeat(3, 1fr);
  margin: 0 0 14px;
}

.step-count {
  font-size: 12px;
  margin-bottom: 2px;
}

.switch {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
}

.switch a {
  color: var(--gold-d);
  font-weight: 600;
}
</style>
