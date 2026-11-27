<script setup>
import { reactive } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { STATES, SUPPORT_EMAIL } from '@/data/constants'
import { updateAdminProfile, updateUser } from '@/stores/db'
import { currentUser, currentUserInitials, isAdmin } from '@/stores/session'
import { toast } from '@/stores/ui'

// Profile details. Partners edit their account; the admin edits the admin profile.
// The sign-in email can't be changed here, because a new email has to be verified first.
const user = currentUser.value

const form = reactive({
  name: user?.name || '',
  company: user?.company || '',
  phone: user?.phone || '',
  state: user?.state || 'VIC',
})

function save() {
  const name = form.name.trim()
  if (!name) {
    toast('Please enter your name')
    return
  }

  if (isAdmin.value) {
    updateAdminProfile({ name, phone: form.phone.trim() })
  } else {
    updateUser(user.id, { name, company: form.company.trim(), phone: form.phone.trim(), state: form.state })
  }
  toast('Profile saved')
}
</script>

<template>
  <div v-if="!user" class="muted">We couldn't find your account details. Please sign in again.</div>

  <form v-else novalidate @submit.prevent="save">
    <div class="profile-head">
      <span class="avatar-lg">{{ currentUserInitials }}</span>
      <div>
        <h2 class="title">Profile</h2>
        <p class="muted text-sm">This is how you appear to the Shell Property team.</p>
      </div>
    </div>

    <div class="grid2">
      <div class="field">
        <label for="profile-name">Full name</label>
        <input id="profile-name" v-model="form.name" autocomplete="name" />
      </div>
      <div v-if="!isAdmin" class="field">
        <label for="profile-company">Company</label>
        <input id="profile-company" v-model="form.company" autocomplete="organization" />
      </div>
      <div class="field">
        <label for="profile-phone">Phone</label>
        <input id="profile-phone" v-model="form.phone" type="tel" autocomplete="tel" />
      </div>
      <div v-if="!isAdmin" class="field">
        <label for="profile-state">State</label>
        <select id="profile-state" v-model="form.state">
          <option v-for="state in STATES" :key="state">{{ state }}</option>
        </select>
      </div>
    </div>

    <div class="field">
      <label for="profile-email">Sign-in email</label>
      <input id="profile-email" :value="user.email" disabled />
      <div class="field-hint">
        To change your sign-in email, contact <a :href="`mailto:${SUPPORT_EMAIL}`">{{ SUPPORT_EMAIL }}</a>.
      </div>
    </div>

    <div class="form-actions">
      <BaseButton type="submit" variant="dark">Save changes</BaseButton>
    </div>
  </form>
</template>

<style scoped>
.profile-head {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 22px;
}

.avatar-lg {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  flex: none;
  border-radius: 50%;
  background: var(--ink);
  color: var(--gold);
  font-size: 19px;
  font-weight: 600;
}

.title {
  font-size: 18px;
}

.field-hint a {
  color: var(--gold-d);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}
</style>
