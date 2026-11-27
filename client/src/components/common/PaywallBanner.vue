<script setup>
import { db } from '@/stores/db'
import { openCheckout } from '@/stores/ui'

defineProps({
  message: { type: String, required: true },
})
</script>

<template>
  <div class="paywall">
    <div>
      <b>Upgrade to {{ db.plan.name }}</b>
      <div class="muted">{{ message }}</div>
    </div>
    <div class="spacer"></div>
    <button class="btn gold" @click="openCheckout">Start {{ db.plan.trialDays }}-day free trial</button>
  </div>
</template>
