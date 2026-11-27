<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import WizardQuestion from '../components/WizardQuestion.vue'
import { WIZARD_STEPS } from '../wizardSteps'
import { addEnquiry } from '@/stores/db'
import { currentUserName, isLocked } from '@/stores/session'
import { openCheckout, toast } from '@/stores/ui'

const router = useRouter()

const TOTAL_STEPS = WIZARD_STEPS.length

const stepNumber = ref(1)
const answers = reactive({})

const currentStep = computed(() => WIZARD_STEPS[stepNumber.value - 1])
const isLastStep = computed(() => stepNumber.value === TOTAL_STEPS)

function isAnswered(value) {
  if (Array.isArray(value)) return value.length > 0
  return Boolean(value)
}

function getMissingQuestions() {
  return currentStep.value.questions.filter((question) => question.required && !isAnswered(answers[question.key]))
}

function submitRequest() {
  if (isLocked('enquiry')) {
    openCheckout()
    return
  }

  addEnquiry({
    user: currentUserName.value,
    kind: 'Sourcing',
    ref: `${answers.configurations.join(', ')} · ${answers.states.join('/')} · ≤ ${answers.budget}`,
    detail: `${answers.ownership}, decides ${answers.decision.toLowerCase()}. ${answers.notes || ''}`.trim(),
    stage: 'New',
    answers: { ...answers },
  })

  toast('Sourcing request submitted')
  router.push({ name: 'my-deals' })
}

function goToNextStep() {
  const missing = getMissingQuestions()
  if (missing.length > 0) {
    toast('Please complete: ' + missing.map((question) => question.label).join(', '))
    return
  }

  if (isLastStep.value) {
    submitRequest()
    return
  }

  stepNumber.value++
}

function goToPreviousStep() {
  stepNumber.value--
}
</script>

<template>
  <div class="wiz">
    <div class="eyebrow">Shell Property Marketplace</div>
    <h1 class="page">Property sourcing request</h1>
    <p class="sub intro">Describe the buyer and the brief, and our team will find matching stock.</p>

    <div class="steps">
      <div v-for="step in TOTAL_STEPS" :key="step" :class="{ on: step <= stepNumber }"></div>
    </div>

    <h3 class="step-title">Step {{ stepNumber }} of {{ TOTAL_STEPS }} · {{ currentStep.title }}</h3>

    <WizardQuestion
      v-for="question in currentStep.questions"
      :key="question.key"
      v-model="answers[question.key]"
      :question="question"
    />

    <div v-if="currentStep.note" class="note">
      <b>{{ currentStep.note.title }}</b> {{ currentStep.note.text }}
    </div>

    <div v-if="isLastStep" class="card pad muted next-info">
      <b>What happens next</b><br />
      Our team responds to every request. Where needed we send an ePack (land &amp; build info, plans, inclusions). Full
      builder details are confirmed once the buyer's details or a signed EOI are received.
    </div>

    <div class="row footer">
      <button v-if="stepNumber > 1" class="btn" @click="goToPreviousStep">‹ Back</button>
      <div class="spacer"></div>
      <RouterLink class="btn" :to="{ name: 'properties' }">Cancel</RouterLink>
      <button class="btn primary" @click="goToNextStep">{{ isLastStep ? 'Submit request' : 'Continue ›' }}</button>
    </div>
  </div>
</template>

<style scoped>
.eyebrow {
  color: var(--gold-d);
}

.intro {
  margin: 0;
}

.step-title {
  margin-bottom: 18px;
}

.next-info {
  font-size: 13px;
  margin-bottom: 22px;
}

.next-info b {
  color: var(--ink);
}

.footer {
  border-top: 1px solid var(--line);
  padding-top: 18px;
}
</style>
