<script setup>
import { db } from '@/stores/db'
import { session } from '@/stores/session'
import { openCheckout, openPortal } from '@/stores/ui'
import { PLANS } from '@/data/constants'

// The admin "Plans & Paywall" page shows these cards as a preview, without the subscribe buttons.
defineProps({
  preview: { type: Boolean, default: false },
})

const FEATURES = [
  { label: 'Browse listings (limited)', free: true, pro: true },
  { label: 'Package & build prices', free: false, pro: true },
  { label: 'Full property details & inclusions', free: false, pro: true },
  { label: 'Brochure & EOI downloads', free: false, pro: true },
  { label: 'White-labelled brochures', free: false, pro: true },
  { label: 'Suburb profiles & reports', free: false, pro: true },
  { label: 'Sourcing requests & deal tracking', free: true, pro: true },
  { label: 'Priority sourcing support', free: false, pro: false },
]
</script>

<template>
  <div class="plans">
    <div class="card plan">
      <h3>Free</h3>
      <div class="amt">$0<small>/month</small></div>
      <div class="muted text-sm">For new partners trying the portal</div>
      <ul>
        <li v-for="feature in FEATURES" :key="feature.label" :class="feature.free ? 'y' : 'n'">{{ feature.label }}</li>
      </ul>
      <button class="btn block" disabled>
        {{ !preview && session.plan === PLANS.FREE ? 'Current plan' : 'Default' }}
      </button>
    </div>

    <div class="card plan feat">
      <span class="badge">Recommended start</span>
      <h3>{{ db.plan.name }}</h3>
      <div class="amt">${{ db.plan.monthly }}<small>/month + GST</small></div>
      <div class="muted text-sm">or ${{ db.plan.annual }}/year (2 months free)</div>
      <ul>
        <li v-for="feature in FEATURES" :key="feature.label" :class="feature.pro ? 'y' : 'n'">{{ feature.label }}</li>
      </ul>
      <template v-if="!preview">
        <button v-if="session.plan === PLANS.PRO" class="btn block" @click="openPortal">Manage subscription</button>
        <button v-else class="btn gold block" @click="openCheckout">
          Start {{ db.plan.trialDays }}-day free trial
        </button>
      </template>
    </div>

    <div class="card plan coming-soon">
      <h3>Team / Agency</h3>
      <div class="amt">Later</div>
      <div class="muted text-sm">Phase 2 — multiple seats per agency</div>
      <ul>
        <li class="y">Everything in {{ db.plan.name }}</li>
        <li class="y">Multiple users</li>
        <li class="y">Priority sourcing support</li>
      </ul>
      <button class="btn block" disabled>Coming soon</button>
    </div>
  </div>

  <p class="draft-note">
    <span class="draft">DRAFT pricing — placeholder figures, subject to PM / client approval</span>
  </p>
</template>

<style scoped>
.coming-soon {
  opacity: 0.7;
}

.draft-note {
  margin-top: 12px;
}
</style>
