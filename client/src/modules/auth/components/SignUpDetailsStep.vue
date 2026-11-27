<script setup>
import { reactive, ref } from 'vue'
import { STATES } from '@/data/constants'
import { createPartnerAccount } from '../signUpService'

const props = defineProps({
  email: { type: String, required: true },
})

const emit = defineEmits(['account-created'])

const PARTNER_TYPES = ['Real estate agent', "Buyer's advocate", 'Mortgage broker', 'Financial adviser', 'Other']

const form = reactive({
  fullName: '',
  mobile: '',
  company: '',
  partnerType: '',
  state: '',
  licenceNumber: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
})

const errors = reactive({})
const submitError = ref('')
const isSubmitting = ref(false)

// Australian mobile: 04xx xxx xxx or +61 4xx xxx xxx (spaces allowed).
function isValidMobile(value) {
  return /^(\+?61|0)4\d{8}$/.test(value.replace(/\s/g, ''))
}

function validate() {
  Object.keys(errors).forEach((key) => delete errors[key])

  if (!form.fullName.trim()) errors.fullName = 'Please enter your full name.'
  if (!isValidMobile(form.mobile)) errors.mobile = 'Enter an Australian mobile, e.g. 0412 345 678.'
  if (!form.company.trim()) errors.company = 'Please enter your agency or company.'
  if (!form.partnerType) errors.partnerType = 'Please choose what best describes you.'
  if (!form.state) errors.state = 'Please choose your state.'

  if (form.password.length < 8) {
    errors.password = 'Use at least 8 characters.'
  } else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
    errors.password = 'Include at least one letter and one number.'
  }

  if (form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match.'
  if (!form.acceptTerms) errors.acceptTerms = 'You need to accept the terms to continue.'

  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  submitError.value = ''
  if (!validate()) return

  isSubmitting.value = true
  try {
    await createPartnerAccount({
      email: props.email,
      fullName: form.fullName.trim(),
      mobile: form.mobile.replace(/\s/g, ''),
      company: form.company.trim(),
      partnerType: form.partnerType,
      state: form.state,
      licenceNumber: form.licenceNumber.trim(),
      password: form.password,
    })
    emit('account-created')
  } catch (err) {
    submitError.value = err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form novalidate @submit.prevent="handleSubmit">
    <p class="muted intro">
      Email verified: <b>{{ email }}</b>
    </p>

    <div class="field">
      <label for="su-name">Full name</label>
      <input id="su-name" v-model="form.fullName" autocomplete="name" :class="{ invalid: errors.fullName }" />
      <div v-if="errors.fullName" class="field-error">{{ errors.fullName }}</div>
    </div>

    <div class="grid2">
      <div class="field">
        <label for="su-mobile">Mobile</label>
        <input
          id="su-mobile"
          v-model="form.mobile"
          type="tel"
          autocomplete="tel"
          placeholder="0412 345 678"
          :class="{ invalid: errors.mobile }"
        />
        <div v-if="errors.mobile" class="field-error">{{ errors.mobile }}</div>
      </div>
      <div class="field">
        <label for="su-state">State</label>
        <select id="su-state" v-model="form.state" :class="{ invalid: errors.state }">
          <option value="" disabled>Select</option>
          <option v-for="state in STATES" :key="state">{{ state }}</option>
        </select>
        <div v-if="errors.state" class="field-error">{{ errors.state }}</div>
      </div>
    </div>

    <div class="field">
      <label for="su-company">Agency / company</label>
      <input id="su-company" v-model="form.company" autocomplete="organization" :class="{ invalid: errors.company }" />
      <div v-if="errors.company" class="field-error">{{ errors.company }}</div>
    </div>

    <div class="grid2">
      <div class="field">
        <label for="su-type">I am a</label>
        <select id="su-type" v-model="form.partnerType" :class="{ invalid: errors.partnerType }">
          <option value="" disabled>Select</option>
          <option v-for="type in PARTNER_TYPES" :key="type">{{ type }}</option>
        </select>
        <div v-if="errors.partnerType" class="field-error">{{ errors.partnerType }}</div>
      </div>
      <div class="field">
        <label for="su-licence">Licence number <span class="muted optional">(optional)</span></label>
        <input id="su-licence" v-model="form.licenceNumber" />
      </div>
    </div>

    <div class="grid2">
      <div class="field">
        <label for="su-password">Password</label>
        <input
          id="su-password"
          v-model="form.password"
          type="password"
          autocomplete="new-password"
          :class="{ invalid: errors.password }"
        />
        <div v-if="errors.password" class="field-error">{{ errors.password }}</div>
        <div v-else class="field-hint">8+ characters, with a letter and a number.</div>
      </div>
      <div class="field">
        <label for="su-confirm">Confirm password</label>
        <input
          id="su-confirm"
          v-model="form.confirmPassword"
          type="password"
          autocomplete="new-password"
          :class="{ invalid: errors.confirmPassword }"
        />
        <div v-if="errors.confirmPassword" class="field-error">{{ errors.confirmPassword }}</div>
      </div>
    </div>

    <div class="field">
      <label class="chk terms">
        <input v-model="form.acceptTerms" type="checkbox" />
        I agree to the Terms of Use and Privacy Policy
      </label>
      <div v-if="errors.acceptTerms" class="field-error">{{ errors.acceptTerms }}</div>
    </div>

    <div v-if="submitError" class="field-error submit-error">{{ submitError }}</div>

    <button type="submit" class="btn primary block" :disabled="isSubmitting">
      {{ isSubmitting ? 'Creating account…' : 'Create account' }}
    </button>
  </form>
</template>

<style scoped>
.intro {
  margin-bottom: 18px;
}

.optional {
  font-weight: 400;
}

.terms {
  font-weight: 400;
}

.submit-error {
  margin-bottom: 12px;
}
</style>
