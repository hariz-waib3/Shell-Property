<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { PLANS, STATES, SUBSCRIPTION_STATUSES } from '@/data/constants'
import { db, emailExists, findUser, setUserStatus, updateUser } from '@/stores/db'
import { toast } from '@/stores/ui'
import { formatDate, statusColorClass } from '@/utils/format'
import { useSubscriberActions } from '../composables/useSubscriberActions'

// One page to view and edit a subscriber (partner account), like the admin property page:
//   /admin/subscribers/:id          view
//   /admin/subscribers/:id?edit=1   opens straight in edit mode (pencil icon on the list)
const props = defineProps({
  id: { type: Number, required: true },
})

const route = useRoute()
const router = useRouter()

const user = computed(() => findUser(props.id))
const isPro = computed(() => user.value?.plan === PLANS.PRO)

const initials = computed(() =>
  user.value.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase(),
)

// The partner's enquiries and deals.
const enquiries = computed(() => db.enquiries.filter((enquiry) => enquiry.user === user.value.name))

/* ---------- Edit profile ---------- */

const isEditing = ref(false)
const form = reactive({ name: '', company: '', email: '', phone: '', state: 'VIC' })

function startEditing() {
  const { name, company, email, phone = '', state = 'VIC' } = user.value
  Object.assign(form, { name, company, email, phone, state })
  isEditing.value = true
}

function saveChanges() {
  const name = form.name.trim()
  const email = form.email.trim()

  if (!name || !email) {
    toast('Name and email are required')
    return
  }
  if (emailExists(email, props.id)) {
    toast('Another account already uses this email')
    return
  }

  updateUser(props.id, { name, email, company: form.company.trim(), phone: form.phone.trim(), state: form.state })
  isEditing.value = false
  toast('Subscriber updated')
}

if (user.value && route.query.edit === '1') startEditing()

onMounted(() => {
  if (route.query.edit === '1') router.replace({ query: {} })
})

/* ---------- Subscription ---------- */

function changeStatus(status) {
  setUserStatus(props.id, status)
  toast('Status updated')
}

const { changePlan, toggleDisabled, confirmation, confirmPending, cancelPending } = useSubscriberActions()
</script>

<template>
  <BaseButton small :to="{ name: 'admin-subscribers' }">← Back to subscribers</BaseButton>

  <EmptyState
    v-if="!user"
    class="card not-found"
    title="Subscriber not found"
    message="The account may have been removed."
  />

  <template v-else>
    <div class="row title-row">
      <h1 class="page grow">{{ isEditing ? 'Edit subscriber' : user.name }}</h1>
      <template v-if="isEditing">
        <BaseButton @click="isEditing = false">Cancel</BaseButton>
        <BaseButton variant="dark" @click="saveChanges">Save changes</BaseButton>
      </template>
      <BaseButton v-else variant="dark" icon="edit" @click="startEditing">Edit subscriber</BaseButton>
    </div>

    <div v-if="user.disabled" class="disabled-banner">
      This account is disabled. {{ user.name }} can't sign in until it is enabled again.
    </div>

    <div class="detail subscriber-detail">
      <!-- Left: profile and activity, or the edit form. -->
      <div class="card pad main-card">
        <template v-if="isEditing">
          <div class="section-t">Profile</div>
          <div class="grid2">
            <div class="field">
              <label for="sub-name">Full name</label>
              <input id="sub-name" v-model="form.name" />
            </div>
            <div class="field">
              <label for="sub-company">Company</label>
              <input id="sub-company" v-model="form.company" />
            </div>
          </div>
          <div class="grid3">
            <div class="field">
              <label for="sub-email">Email</label>
              <input id="sub-email" v-model="form.email" type="email" />
            </div>
            <div class="field">
              <label for="sub-phone">Phone</label>
              <input id="sub-phone" v-model="form.phone" type="tel" />
            </div>
            <div class="field">
              <label for="sub-state">State</label>
              <select id="sub-state" v-model="form.state">
                <option v-for="state in STATES" :key="state">{{ state }}</option>
              </select>
            </div>
          </div>
          <div class="edit-actions">
            <BaseButton @click="isEditing = false">Cancel</BaseButton>
            <BaseButton variant="dark" @click="saveChanges">Save changes</BaseButton>
          </div>
        </template>

        <template v-else>
          <section class="profile">
            <span class="avatar-lg">{{ initials }}</span>
            <div>
              <h2 class="profile-name">{{ user.name }}</h2>
              <p class="muted">{{ user.company }}</p>
            </div>
          </section>

          <section class="detail-block">
            <div class="section-t">Contact</div>
            <dl class="facts">
              <div>
                <dt>Email</dt>
                <dd>
                  <a :href="`mailto:${user.email}`">{{ user.email }}</a>
                </dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>{{ user.phone || '–' }}</dd>
              </div>
              <div>
                <dt>State</dt>
                <dd>{{ user.state || '–' }}</dd>
              </div>
            </dl>
          </section>

          <section class="detail-block">
            <div class="section-t">Enquiries &amp; deals</div>
            <div v-if="enquiries.length" class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Reference</th>
                    <th>Stage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="enquiry in enquiries" :key="enquiry.id">
                    <td class="muted">{{ formatDate(enquiry.date) }}</td>
                    <td>{{ enquiry.kind }}</td>
                    <td>{{ enquiry.ref }}</td>
                    <td>
                      <span class="tag t-grey">{{ enquiry.stage }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="muted">No enquiries yet.</p>
          </section>
        </template>
      </div>

      <!-- Right: subscription. Plan and status change straight away, also while editing the profile. -->
      <aside class="card pad side-card">
        <div class="section-t">Subscription</div>

        <div class="plan-row">
          <span v-if="isPro" class="tag t-gold">{{ db.plan.name }}</span>
          <span v-else class="tag t-grey">Free</span>
          <span class="muted text-sm">{{ isPro ? `$${db.plan.monthly}/month` : 'No charge' }}</span>
        </div>

        <div class="field">
          <label for="sub-status">Status</label>
          <select
            id="sub-status"
            class="status-pill"
            :class="statusColorClass(user.status)"
            :value="user.status"
            @change="changeStatus($event.target.value)"
          >
            <option v-for="status in SUBSCRIPTION_STATUSES" :key="status">{{ status }}</option>
          </select>
        </div>

        <dl class="facts">
          <div>
            <dt>Member since</dt>
            <dd>{{ formatDate(user.since) }}</dd>
          </div>
          <div>
            <dt>Enquiries</dt>
            <dd>{{ enquiries.length }}</dd>
          </div>
        </dl>

        <BaseButton block :variant="isPro ? 'light' : 'dark'" @click="changePlan(user)">
          {{ isPro ? 'Downgrade to Free' : 'Grant Pro access' }}
        </BaseButton>
        <p class="muted note">In the full build, plan changes go through Stripe.</p>

        <div class="section-t account-t">Account</div>
        <BaseButton block :danger="!user.disabled" @click="toggleDisabled(user)">
          {{ user.disabled ? 'Enable account' : 'Disable account' }}
        </BaseButton>
        <p class="muted note">
          {{ user.disabled ? 'Lets the partner sign in again.' : 'Blocks sign-in. Their data and deals are kept.' }}
        </p>
      </aside>
    </div>

    <ConfirmDialog
      v-if="confirmation"
      :title="confirmation.title"
      :message="confirmation.message"
      :confirm-label="confirmation.confirmLabel"
      :danger="confirmation.danger"
      @confirm="confirmPending"
      @cancel="cancelPending"
    />
  </template>
</template>

<style scoped>
.not-found {
  margin-top: 16px;
}

.title-row {
  gap: 10px;
  margin: 16px 0;
}

.subscriber-detail {
  grid-template-columns: 1fr 340px;
}

.main-card,
.side-card {
  align-self: start;
}

.main-card {
  padding: 24px;
}

.side-card {
  display: grid;
  gap: 12px;
}

.side-card .section-t {
  margin-bottom: 0;
}

.profile {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 22px;
}

.avatar-lg {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--ink);
  color: var(--gold);
  font-size: 19px;
  font-weight: 600;
}

.profile-name {
  font-size: 22px;
}

.facts {
  margin: 0;
}

.facts div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 9px 0;
  border-bottom: 1px solid var(--line);
  font-size: 13.5px;
}

.facts dt {
  color: var(--muted);
}

.facts dd {
  margin: 0;
  font-weight: 500;
}

.facts a {
  color: var(--gold-d);
}

.plan-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.edit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid var(--line);
}

.note {
  font-size: 12px;
}

.account-t {
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.disabled-banner {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 10px;
  background: var(--bad-l);
  color: var(--bad);
  font-size: 13.5px;
  font-weight: 500;
}

@media (max-width: 900px) {
  .subscriber-detail {
    grid-template-columns: 1fr;
  }
}
</style>
