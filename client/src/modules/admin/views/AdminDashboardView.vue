<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import StatCard from '../components/StatCard.vue'
import { DEAL_STAGES, PLANS, PROPERTY_STATUSES } from '@/data/constants'
import { db } from '@/stores/db'
import { formatDate, formatPrice, packagePrice, todayIso } from '@/utils/format'

/* ---------- Greeting ---------- */

const hour = new Date().getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
const today = formatDate(todayIso())

/* ---------- Key numbers ---------- */

const availableCount = computed(
  () => db.properties.filter((property) => property.active && property.status === 'Available').length,
)

const proUsers = computed(() => db.users.filter((user) => user.plan === PLANS.PRO && !user.disabled))
const payingCount = computed(() => proUsers.value.filter((user) => user.status === 'Active').length)
const trialCount = computed(() => proUsers.value.filter((user) => user.status === 'Trial').length)
const monthlyRevenue = computed(() => formatPrice(payingCount.value * db.plan.monthly))

const CLOSED_STAGES = ['Sold', 'Construction', 'Completed']
const openEnquiries = computed(() => db.enquiries.filter((enquiry) => !CLOSED_STAGES.includes(enquiry.stage)))
const newEnquiryCount = computed(() => db.enquiries.filter((enquiry) => enquiry.stage === 'New').length)

/* ---------- Deal pipeline ---------- */

const pipeline = computed(() => {
  const counts = DEAL_STAGES.map((stage) => db.enquiries.filter((enquiry) => enquiry.stage === stage).length)
  const highest = Math.max(...counts, 1)
  return DEAL_STAGES.map((stage, index) => ({
    stage,
    count: counts[index],
    width: `${(counts[index] / highest) * 100}%`,
  }))
})

/* ---------- Stock by status ---------- */

const STATUS_COLOURS = {
  Available: 'var(--ok)',
  'Under Offer': 'var(--warn)',
  Sold: 'var(--bad)',
  Disabled: '#b7bac0',
}

// Enabled properties by sales status, plus one group for disabled ones (hidden from partners).
const stock = computed(() => {
  const total = db.properties.length || 1
  const groups = PROPERTY_STATUSES.map((status) => ({
    status,
    count: db.properties.filter((property) => property.active && property.status === status).length,
  }))
  groups.push({ status: 'Disabled', count: db.properties.filter((property) => !property.active).length })

  return groups.map((group) => ({
    ...group,
    share: `${(group.count / total) * 100}%`,
    colour: STATUS_COLOURS[group.status],
  }))
})

/* ---------- Latest activity ---------- */

const byNewest = (a, b) => b.date.localeCompare(a.date)
const latestEnquiries = computed(() => [...db.enquiries].sort(byNewest).slice(0, 5))

const recentListings = computed(() =>
  [...db.properties].sort((a, b) => b.verified.localeCompare(a.verified)).slice(0, 5),
)

function coverStyle(property) {
  const cover = property.images?.[0]
  return cover ? { backgroundImage: `url("${cover.url}")` } : {}
}
</script>

<template>
  <div class="page-top">
    <div class="heading">
      <h1 class="page">{{ greeting }}</h1>
      <p class="sub">{{ today }} · Here's what's happening across stock, partners and deals.</p>
    </div>
    <div class="top-actions">
      <BaseButton icon="upload" :to="{ name: 'admin-documents', query: { action: 'upload' } }">
        Upload document
      </BaseButton>
      <BaseButton variant="dark" icon="plus" :to="{ name: 'admin-property-new' }">Add property</BaseButton>
    </div>
  </div>

  <div class="stat-grid">
    <StatCard
      label="Active listings"
      :value="availableCount"
      :hint="`${db.properties.length} listings in total`"
      icon="home"
      :to="{ name: 'admin-properties' }"
    />
    <StatCard
      label="Paying subscribers"
      :value="payingCount"
      :hint="`${trialCount} on trial · ${db.users.length} partners`"
      icon="users"
      :to="{ name: 'admin-subscribers' }"
    />
    <StatCard
      label="Monthly revenue (sample)"
      :value="monthlyRevenue"
      :hint="`${formatPrice(db.plan.monthly)} per Pro partner, excl. GST`"
      icon="dollar"
      :to="{ name: 'admin-plans' }"
    />
    <StatCard
      label="Open enquiries"
      :value="openEnquiries.length"
      :hint="`${newEnquiryCount} new`"
      icon="inbox"
      :to="{ name: 'admin-enquiries' }"
    />
  </div>

  <div class="dash-grid">
    <!-- Deal pipeline: how many enquiries sit in each stage. -->
    <section class="card pad">
      <div class="panel-head">
        <div class="section-t">Deal pipeline</div>
        <RouterLink class="view-all" :to="{ name: 'admin-enquiries' }">View all</RouterLink>
      </div>
      <div class="pipeline">
        <div v-for="row in pipeline" :key="row.stage" class="pipeline-row">
          <span class="pipeline-stage">{{ row.stage }}</span>
          <div class="bar-track">
            <div class="bar" :style="{ width: row.width }"></div>
          </div>
          <b class="pipeline-count">{{ row.count }}</b>
        </div>
      </div>
    </section>

    <!-- Stock by status: one stacked bar plus a legend. -->
    <section class="card pad">
      <div class="panel-head">
        <div class="section-t">Stock by status</div>
        <RouterLink class="view-all" :to="{ name: 'admin-properties' }">Manage</RouterLink>
      </div>
      <div class="stacked-bar">
        <span
          v-for="item in stock"
          :key="item.status"
          :style="{ width: item.share, background: item.colour }"
          :title="`${item.status}: ${item.count}`"
        ></span>
      </div>
      <ul class="legend">
        <li v-for="item in stock" :key="item.status">
          <span class="dot" :style="{ background: item.colour }"></span>
          <span class="grow">{{ item.status }}</span>
          <b>{{ item.count }}</b>
        </li>
      </ul>
    </section>

    <section class="card">
      <div class="panel-head pad">
        <div class="section-t">Latest enquiries</div>
        <RouterLink class="view-all" :to="{ name: 'admin-enquiries' }">View all</RouterLink>
      </div>
      <ul class="list">
        <li v-for="enquiry in latestEnquiries" :key="enquiry.id" class="list-row">
          <div class="grow">
            <b>{{ enquiry.ref }}</b>
            <div class="muted text-sm">{{ enquiry.user }} · {{ enquiry.kind }} · {{ formatDate(enquiry.date) }}</div>
          </div>
          <span class="tag" :class="enquiry.stage === 'New' ? 't-warn' : 't-info'">{{ enquiry.stage }}</span>
        </li>
      </ul>
    </section>

    <section class="card">
      <div class="panel-head pad">
        <div class="section-t">Recently updated listings</div>
        <RouterLink class="view-all" :to="{ name: 'admin-properties' }">View all</RouterLink>
      </div>
      <ul class="list">
        <li v-for="property in recentListings" :key="property.id">
          <RouterLink
            class="list-row listing"
            :to="{ name: 'admin-property-detail', params: { id: property.id }, query: { from: 'dashboard' } }"
          >
            <span class="thumb" :style="coverStyle(property)"></span>
            <div class="grow">
              <b>{{ property.suburb }}, {{ property.state }}</b>
              <div class="muted text-sm">{{ property.lot }} · {{ formatPrice(packagePrice(property)) }}</div>
            </div>
            <StatusTag :status="property.status" />
          </RouterLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 16px;
}

/* ---------- Panels ---------- */
.dash-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 16px;
  align-items: start;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.panel-head .section-t {
  margin: 0;
}

.panel-head.pad {
  margin-bottom: 0;
  padding-bottom: 12px;
}

.view-all {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--gold-d);
  text-decoration: none;
}

/* Pipeline bars */
.pipeline {
  display: grid;
  gap: 10px;
}

.pipeline-row {
  display: grid;
  grid-template-columns: 130px 1fr 28px;
  align-items: center;
  gap: 12px;
  font-size: 13px;
}

.pipeline-stage {
  color: var(--muted);
}

.bar-track {
  height: 10px;
  border-radius: 5px;
  background: var(--bg);
  overflow: hidden;
}

.bar {
  height: 100%;
  border-radius: 5px;
  background: var(--gold);
  transition: width 0.3s;
}

.pipeline-count {
  text-align: right;
}

/* Stock stacked bar */
.stacked-bar {
  display: flex;
  height: 14px;
  border-radius: 7px;
  overflow: hidden;
  background: var(--bg);
}

.legend {
  list-style: none;
  display: grid;
  gap: 2px;
  margin-top: 14px;
}

.legend li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid var(--line);
  font-size: 13.5px;
}

.legend li:last-child {
  border-bottom: 0;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

/* Lists */
.list {
  list-style: none;
}

.list-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 20px;
  border-top: 1px solid var(--line);
  font-size: 13.5px;
}

.listing {
  color: inherit;
  text-decoration: none;
}

.listing:hover {
  background: var(--bg);
}

.thumb {
  width: 44px;
  height: 44px;
  flex: none;
  border-radius: 8px;
  background-color: var(--bg);
  background-size: cover;
  background-position: center;
}

@media (max-width: 1100px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .dash-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 500px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }

  .pipeline-row {
    grid-template-columns: 110px 1fr 24px;
  }
}
</style>
