<script setup>
import BaseModal from '@/components/common/BaseModal.vue'
import { setPlan } from '@/stores/session'
import { closePortal, toast } from '@/stores/ui'
import { PLANS } from '@/data/constants'

function cancelSubscription() {
  setPlan(PLANS.FREE)
  closePortal()
  toast('Subscription cancelled (demo)')
}
</script>

<template>
  <BaseModal title="Manage subscription — Stripe Customer Portal (simulated)" @close="closePortal">
    <p class="muted">
      Stripe's hosted portal lets subscribers update cards, download invoices, switch monthly/annual and cancel — no
      custom code needed.
    </p>

    <template #footer>
      <button class="btn danger" @click="cancelSubscription">Cancel subscription</button>
      <button class="btn primary" @click="closePortal">Done</button>
    </template>
  </BaseModal>
</template>
