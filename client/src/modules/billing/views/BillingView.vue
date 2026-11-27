<script setup>
import { computed } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import PlanCards from '@/components/common/PlanCards.vue'
import { db } from '@/stores/db'
import { isPro } from '@/stores/session'
import { openPortal } from '@/stores/ui'

const currentPlanName = computed(() => (isPro.value ? db.plan.name : 'Free'))
</script>

<template>
  <PageHeader title="Plan & Billing" :subtitle="`You're on the ${currentPlanName} plan.`" />

  <PlanCards />

  <div v-if="isPro" class="card pad billing">
    <div class="section-t">Billing</div>
    <div class="kv">
      <div><span>Status</span>Active</div>
      <div><span>Next invoice</span>23 Dec 2026</div>
      <div><span>Payment method</span>Card •••• 4242 (test)</div>
      <div>
        <span>Invoices</span>
        <button class="link portal-link" @click="openPortal">View in portal</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.billing {
  margin-top: 22px;
}

.portal-link {
  color: inherit;
}
</style>
