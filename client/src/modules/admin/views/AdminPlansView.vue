<script setup>
import { computed } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import PlanCards from '@/components/common/PlanCards.vue'
import { db } from '@/stores/db'
import { toast } from '@/stores/ui'

// Each key matches a value in db.gates. Turning a switch on locks that feature for Free users.
const restrictions = computed(() => [
  {
    key: 'prices',
    label: 'Hide prices & limit listings',
    hint: `Free users see the first ${db.gates.freeRows} listings, prices blurred`,
  },
  { key: 'detail', label: 'Lock full property details', hint: 'Details, inclusions and terms' },
  { key: 'brochure', label: 'Lock brochure, EOI & stocklist downloads', hint: '' },
  { key: 'documents', label: 'Lock documents library', hint: 'Suburb profiles and reports' },
  {
    key: 'enquiry',
    label: 'Lock enquiries & sourcing requests',
    hint: 'Off = free users can still send leads (recommended)',
  },
])
</script>

<template>
  <PageHeader title="Plans & paywall" subtitle="Configure the subscription and which features require it." />

  <div class="grid2 top-aligned">
    <div class="card pad">
      <div class="section-t">Plan</div>

      <div class="field">
        <label for="plan-name">Plan name</label>
        <input id="plan-name" v-model.lazy="db.plan.name" />
      </div>

      <div class="grid3">
        <div class="field">
          <label for="plan-monthly">Monthly (AUD)</label>
          <input id="plan-monthly" v-model.lazy.number="db.plan.monthly" type="number" />
        </div>
        <div class="field">
          <label for="plan-annual">Annual (AUD)</label>
          <input id="plan-annual" v-model.lazy.number="db.plan.annual" type="number" />
        </div>
        <div class="field">
          <label for="plan-trial">Trial days</label>
          <input id="plan-trial" v-model.lazy.number="db.plan.trialDays" type="number" />
        </div>
      </div>

      <span class="draft">Placeholder prices, for PM / client approval</span>
      <p class="muted text-sm stripe-note">
        In production, prices live in Stripe as Products/Prices; this screen links to them.
      </p>
    </div>

    <div class="card pad">
      <div class="section-t">Free plan restrictions</div>

      <div v-for="item in restrictions" :key="item.key" class="setrow">
        <div class="grow">
          <b>{{ item.label }}</b>
          <div v-if="item.hint" class="muted text-sm">{{ item.hint }}</div>
        </div>
        <label class="toggle">
          <input v-model="db.gates[item.key]" type="checkbox" @change="toast('Paywall updated')" />
          <span></span>
        </label>
      </div>

      <div class="setrow">
        <b class="grow">Free listing limit</b>
        <input
          v-model.lazy.number="db.gates.freeRows"
          type="number"
          min="0"
          class="btn sm limit-input"
          aria-label="Free listing limit"
        />
      </div>
    </div>
  </div>

  <h3 class="preview-title">Preview</h3>
  <PlanCards preview />
</template>

<style scoped>
.top-aligned {
  align-items: start;
}

.stripe-note {
  margin-top: 12px;
}

.limit-input {
  width: 70px;
}

.preview-title {
  margin: 28px 0 6px;
}
</style>
