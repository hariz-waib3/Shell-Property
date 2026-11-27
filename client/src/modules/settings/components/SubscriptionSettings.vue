<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { db } from '@/stores/db'
import { currentUser, isPro } from '@/stores/session'
import { openCheckout, openPortal } from '@/stores/ui'
import { formatDate, formatPrice, statusColorClass } from '@/utils/format'

// The partner's plan. Payments run through Stripe in the full build (checkout and the billing portal).
const status = computed(() => (isPro.value ? currentUser.value?.status || 'Active' : 'Active'))

const PRO_FEATURES = ['All prices unlocked', 'Full property details', 'Brochure and document downloads']
</script>

<template>
  <h2 class="title">Subscription</h2>
  <p class="muted text-sm intro">Your current plan and billing details.</p>

  <div class="plan-card" :class="{ pro: isPro }">
    <div class="grow">
      <span class="plan-name">{{ isPro ? db.plan.name : 'Free' }} plan</span>
      <span class="plan-price">
        <template v-if="isPro">{{ formatPrice(db.plan.monthly) }} / month, excl. GST</template>
        <template v-else>No charge</template>
      </span>
    </div>
    <span class="tag" :class="statusColorClass(status)">{{ status }}</span>
  </div>

  <dl class="facts">
    <div v-if="currentUser">
      <dt>Member since</dt>
      <dd>{{ formatDate(currentUser.since) }}</dd>
    </div>
    <template v-if="isPro">
      <div>
        <dt>Next invoice</dt>
        <dd>23 Dec 2026</dd>
      </div>
      <div>
        <dt>Payment method</dt>
        <dd>Card •••• 4242 (test)</dd>
      </div>
    </template>
  </dl>

  <!-- Free: what Pro adds, and an upgrade button. Pro: manage billing in the Stripe portal. -->
  <div v-if="!isPro" class="upgrade">
    <b>Upgrade to {{ db.plan.name }}</b>
    <ul>
      <li v-for="feature in PRO_FEATURES" :key="feature">{{ feature }}</li>
    </ul>
    <div class="actions">
      <BaseButton variant="dark" @click="openCheckout">Start {{ db.plan.trialDays }}-day free trial</BaseButton>
      <BaseButton :to="{ name: 'billing' }">Compare plans</BaseButton>
    </div>
  </div>

  <div v-else class="actions">
    <BaseButton variant="dark" @click="openPortal">Manage billing</BaseButton>
    <BaseButton :to="{ name: 'billing' }">View plans</BaseButton>
  </div>
</template>

<style scoped>
.title {
  font-size: 18px;
}

.intro {
  margin: 2px 0 18px;
}

.plan-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 20px;
  border: 1px solid var(--line);
  border-radius: 12px;
}

.plan-card.pro {
  background: var(--ink);
  border-color: var(--ink);
  color: #fff;
}

.plan-name {
  display: block;
  font-size: 17px;
  font-weight: 600;
}

.plan-card.pro .plan-name {
  color: var(--gold);
}

.plan-price {
  font-size: 13px;
  opacity: 0.75;
}

.facts {
  margin: 14px 0 20px;
}

.facts div {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
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

.upgrade {
  padding: 18px 20px;
  border-radius: 12px;
  background: var(--gold-l);
}

.upgrade ul {
  margin: 8px 0 16px;
  padding-left: 18px;
  font-size: 13.5px;
  line-height: 1.7;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
