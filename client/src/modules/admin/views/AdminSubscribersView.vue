<script setup>
import { computed, ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import SearchDropdown from '@/components/common/SearchDropdown.vue'
import { PLANS } from '@/data/constants'
import { db } from '@/stores/db'
import { formatDate, statusColorClass } from '@/utils/format'
import { useSubscriberActions } from '../composables/useSubscriberActions'

const { changePlan, toggleDisabled, confirmation, confirmPending, cancelPending } = useSubscriberActions()

const query = ref('')

const visibleUsers = computed(() => {
  const text = query.value.trim().toLowerCase()
  if (!text) return db.users
  return db.users.filter((user) =>
    [user.name, user.company, user.email].some((value) => value.toLowerCase().includes(text)),
  )
})
</script>

<template>
  <div class="page-top">
    <div class="heading">
      <h1 class="page">Subscribers</h1>
      <p class="sub">Partner accounts and their subscription status (synced from Stripe webhooks in the full build).</p>
    </div>

    <div class="top-actions">
      <SearchDropdown
        v-model="query"
        :result-count="visibleUsers.length"
        placeholder="Search subscribers…"
        hint="Search by name, company or email."
      />
    </div>
  </div>

  <div class="card table-wrap">
    <table class="mobile-cards">
      <thead>
        <tr>
          <th>Name</th>
          <th>Company</th>
          <th>Email</th>
          <th>Plan</th>
          <th>Status</th>
          <th>Since</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in visibleUsers" :key="user.id" :class="{ disabled: user.disabled }">
          <td class="cell-title">
            <RouterLink class="name-link" :to="{ name: 'admin-subscriber-detail', params: { id: user.id } }">
              {{ user.name }}
            </RouterLink>
            <span v-if="user.disabled" class="tag t-bad disabled-tag">Disabled</span>
          </td>
          <td data-label="Company">{{ user.company }}</td>
          <td class="muted" data-label="Email">{{ user.email }}</td>
          <td data-label="Plan">
            <span v-if="user.plan === PLANS.PRO" class="tag t-gold">{{ db.plan.name }}</span>
            <span v-else class="tag t-grey">Free</span>
          </td>
          <td data-label="Status">
            <span class="tag" :class="statusColorClass(user.status)">{{ user.status }}</span>
          </td>
          <td class="muted" data-label="Since">{{ formatDate(user.since) }}</td>
          <td class="cell-actions">
            <div class="row actions">
              <BaseButton
                small
                icon-only
                :icon="user.plan === PLANS.PRO ? 'arrow-down' : 'arrow-up'"
                :label="user.plan === PLANS.PRO ? 'Downgrade to Free' : 'Grant Pro'"
                @click="changePlan(user)"
              />
              <BaseButton
                small
                icon-only
                :danger="!user.disabled"
                :icon="user.disabled ? 'unlock' : 'lock'"
                :label="user.disabled ? 'Enable account' : 'Disable account'"
                @click="toggleDisabled(user)"
              />
              <BaseButton
                small
                icon-only
                icon="eye"
                label="View subscriber"
                :to="{ name: 'admin-subscriber-detail', params: { id: user.id } }"
              />
              <BaseButton
                small
                icon-only
                icon="edit"
                label="Edit subscriber"
                :to="{ name: 'admin-subscriber-detail', params: { id: user.id }, query: { edit: '1' } }"
              />
            </div>
          </td>
        </tr>
        <tr v-if="visibleUsers.length === 0">
          <td colspan="7" class="muted empty cell-full">No subscribers match "{{ query }}".</td>
        </tr>
      </tbody>
    </table>
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

<style scoped>
.name-link {
  font-weight: 600;
  color: var(--ink);
  text-decoration: none;
}

.name-link:hover {
  color: var(--gold-d);
}

.actions {
  gap: 2px;
  justify-content: flex-end;
}

.disabled-tag {
  margin-left: 8px;
}

/* Disabled accounts are greyed out, but the actions stay clear. */
tr.disabled td:not(:last-child) {
  opacity: 0.55;
}

.empty {
  padding: 28px;
  text-align: center;
}
</style>
