<script setup>
import { computed, ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import PillTabs from '@/components/common/PillTabs.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { DEAL_STAGES } from '@/data/constants'
import { db } from '@/stores/db'
import { formatDate } from '@/utils/format'

const tabs = ['All', ...DEAL_STAGES]
const activeTab = ref('All')

const myDeals = computed(() => db.enquiries.filter((enquiry) => db.myDealIds.includes(enquiry.id)))

const visibleDeals = computed(() => {
  if (activeTab.value === 'All') return myDeals.value
  return myDeals.value.filter((deal) => deal.stage === activeTab.value)
})

const emptyMessage = computed(() => {
  const stageName = activeTab.value === 'All' ? 'active' : activeTab.value.toLowerCase()
  return `You don't have any ${stageName} deals yet.`
})
</script>

<template>
  <PageHeader
    title="My Deals"
    subtitle="Every enquiry you send appears here. The Shell Property team moves it through each stage."
  />
  <PillTabs v-model="activeTab" :options="tabs" />

  <div v-if="visibleDeals.length > 0" class="card table-wrap">
    <table class="mobile-cards">
      <thead>
        <tr>
          <th>Reference</th>
          <th>Type</th>
          <th>Detail</th>
          <th>Stage</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="deal in visibleDeals" :key="deal.id">
          <td class="cell-title">
            <b>{{ deal.ref }}</b>
          </td>
          <td data-label="Type">{{ deal.kind }}</td>
          <td class="muted cell-full">{{ deal.detail }}</td>
          <td data-label="Stage">
            <span class="tag t-info">{{ deal.stage }}</span>
          </td>
          <td class="muted" data-label="Date">{{ formatDate(deal.date) }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <EmptyState v-else class="card" title="No deals found" :message="emptyMessage" />
</template>
