<script setup>
import BaseModal from '@/components/common/BaseModal.vue'
import { db } from '@/stores/db'
import { setPlan } from '@/stores/session'
import { closeCheckout, toast } from '@/stores/ui'
import { PLANS } from '@/data/constants'

function startTrial() {
  setPlan(PLANS.PRO)
  closeCheckout()
  toast('Subscribed. Your free trial has started.')
}
</script>

<template>
  <BaseModal title="Subscribe — Stripe Checkout (simulated)" @close="closeCheckout">
    <p class="muted intro">
      In the real build this button redirects to <b>Stripe-hosted Checkout</b>. Card details never touch our servers.
    </p>

    <div class="stripe">
      <div class="row">
        <b class="grow">Shell Property {{ db.plan.name }}</b>
        <b>${{ db.plan.monthly }}.00 / month</b>
      </div>
      <div class="muted text-sm">
        {{ db.plan.trialDays }}-day free trial · then billed monthly · GST calculated at checkout · cancel anytime
      </div>
      <div class="field card-field">
        <label>Card (test mode)</label>
        <input value="4242 4242 4242 4242   12/30   123" disabled />
      </div>
    </div>

    <template #footer>
      <button class="btn" @click="closeCheckout">Cancel</button>
      <button class="btn gold" @click="startTrial">Start free trial</button>
    </template>
  </BaseModal>
</template>

<style scoped>
.intro {
  margin-bottom: 14px;
}

.card-field {
  margin-top: 14px;
}
</style>
