<script setup>
import { reactive, ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { changePassword } from '../settingsService'
import { toast } from '@/stores/ui'

const MIN_PASSWORD_LENGTH = 8

const form = reactive({ current: '', next: '', confirm: '' })
const showPasswords = ref(false)
const error = ref('')
const isSaving = ref(false)

function validate() {
  if (!form.current) return 'Enter your current password.'
  if (form.next.length < MIN_PASSWORD_LENGTH)
    return `Your new password needs at least ${MIN_PASSWORD_LENGTH} characters.`
  if (form.next === form.current) return 'Choose a password different from your current one.'
  if (form.next !== form.confirm) return "The new passwords don't match."
  return ''
}

async function save() {
  error.value = validate()
  if (error.value) return

  isSaving.value = true
  try {
    await changePassword(form.current, form.next)
    Object.assign(form, { current: '', next: '', confirm: '' })
    toast('Password changed')
  } catch (err) {
    error.value = err.message
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <form novalidate @submit.prevent="save">
    <h2 class="title">Password</h2>
    <p class="muted text-sm intro">Use at least {{ MIN_PASSWORD_LENGTH }} characters. You'll stay signed in.</p>

    <div class="fields">
      <div class="field">
        <label for="password-current">Current password</label>
        <input
          id="password-current"
          v-model="form.current"
          :type="showPasswords ? 'text' : 'password'"
          autocomplete="current-password"
        />
      </div>
      <div class="field">
        <label for="password-new">New password</label>
        <input
          id="password-new"
          v-model="form.next"
          :type="showPasswords ? 'text' : 'password'"
          autocomplete="new-password"
        />
      </div>
      <div class="field">
        <label for="password-confirm">Confirm new password</label>
        <input
          id="password-confirm"
          v-model="form.confirm"
          :type="showPasswords ? 'text' : 'password'"
          autocomplete="new-password"
        />
      </div>

      <label class="chk"><input v-model="showPasswords" type="checkbox" /> Show passwords</label>
    </div>

    <div v-if="error" class="field-error" role="alert">{{ error }}</div>

    <div class="form-actions">
      <BaseButton type="submit" variant="dark" :disabled="isSaving">
        {{ isSaving ? 'Saving…' : 'Change password' }}
      </BaseButton>
    </div>
  </form>
</template>

<style scoped>
.title {
  font-size: 18px;
}

.intro {
  margin: 2px 0 18px;
}

.fields {
  max-width: 420px;
}

.field-error {
  margin-top: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}
</style>
