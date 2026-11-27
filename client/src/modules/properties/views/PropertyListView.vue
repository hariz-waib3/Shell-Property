<script setup>
import { computed, ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import PaywallBanner from '@/components/common/PaywallBanner.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import PropertyTable from '@/components/property/PropertyTable.vue'
import FilterGroup from '../components/FilterGroup.vue'
import { usePropertyFilters } from '../composables/usePropertyFilters'
import { PROPERTY_STATUSES } from '@/data/constants'
import { useTableControls } from '@/composables/useTableControls'
import { PROPERTY_SORT } from '@/utils/propertySort'
import { PROPERTY_TYPES, STATES } from '@/data/constants'
import { db } from '@/stores/db'
import { isLocked } from '@/stores/session'
import { toast } from '@/stores/ui'
import { formatPrice } from '@/utils/format'

// Filters always open in a column on the left (quick search + collapsible groups); the table and paging on the right.
const { filters, visibleProperties, activeFilterCount, clearFilters } = usePropertyFilters()

const { sortBy, sortArrow, sortedRows, page, pageSize, pagedRows } = useTableControls(visibleProperties, {
  ...PROPERTY_SORT,
  resetOn: () => filters,
})

const PRICE_OPTIONS = [600000, 750000, 900000, 1200000]
const BED_OPTIONS = [2, 3, 4, 5]

/* ---------- Sidebar options, with how many listings each one has ---------- */

const activeProperties = computed(() => db.properties.filter((property) => property.active))

function countBy(key) {
  const counts = {}
  activeProperties.value.forEach((property) => {
    counts[property[key]] = (counts[property[key]] || 0) + 1
  })
  return counts
}

// Only values that have listings, so no option leads to an empty table.
function optionsFor(values, key) {
  const counts = countBy(key)
  return values.filter((value) => counts[value]).map((value) => ({ value, label: value, meta: counts[value] }))
}

const stateOptions = computed(() => optionsFor(STATES, 'state'))
const typeOptions = computed(() => optionsFor(PROPERTY_TYPES, 'type'))
const statusOptions = computed(() => optionsFor(PROPERTY_STATUSES, 'status'))

const suburbQuery = ref('')

// Suburbs follow the picked states. Ticked suburbs stay in the list so they can be unticked.
const suburbOptions = computed(() => {
  const counts = countBy('suburb')
  const stateOf = Object.fromEntries(activeProperties.value.map((property) => [property.suburb, property.state]))
  const text = suburbQuery.value.trim().toLowerCase()
  return Object.keys(counts)
    .filter(
      (suburb) =>
        filters.suburbs.includes(suburb) || !filters.states.length || filters.states.includes(stateOf[suburb]),
    )
    .filter((suburb) => suburb.toLowerCase().includes(text))
    .sort((a, b) => a.localeCompare(b))
    .map((suburb) => ({ value: suburb, label: suburb, meta: `${stateOf[suburb]} · ${counts[suburb]}` }))
})

/* ---------- Free plan limits ---------- */

const pricesLocked = computed(() => isLocked('prices'))
const unlockedCount = computed(() => (pricesLocked.value ? db.gates.freeRows : Infinity))
const firstRowIndex = computed(() => (page.value - 1) * pageSize.value)

const paywallMessage = computed(
  () =>
    `Free accounts see ${db.gates.freeRows} listings with prices hidden. ` +
    'Subscribe for full stock, prices, brochures and EOIs.',
)

// Free plan: the button is disabled (same gate as brochures).
const stocklistLocked = computed(() => isLocked('brochure'))

function exportStocklist() {
  toast('Stocklist exported (demo)')
}
</script>

<template>
  <div class="list-layout">
    <aside class="card filter-side" aria-label="Filters">
      <div class="refine-head">
        <h2>Refine by</h2>
        <button
          type="button"
          class="clear-link"
          :disabled="activeFilterCount === 0 && !filters.query"
          @click="clearFilters"
        >
          Clear all
        </button>
      </div>

      <div class="quick-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
        <input
          v-model="filters.query"
          type="search"
          placeholder="Quick search…"
          aria-label="Search by suburb, estate or lot"
        />
      </div>

      <FilterGroup v-model="filters.states" title="State" :options="stateOptions" start-open />

      <FilterGroup v-model="filters.suburbs" title="Suburb" :options="suburbOptions">
        <input
          v-model="suburbQuery"
          class="group-search"
          type="search"
          placeholder="Filter suburb…"
          aria-label="Filter suburb"
        />
      </FilterGroup>

      <FilterGroup v-model="filters.types" title="Property type" :options="typeOptions" />

      <FilterGroup v-model="filters.statuses" title="Status" :options="statusOptions" />

      <FilterGroup title="Max price" :active="Boolean(filters.maxPrice)">
        <select v-model="filters.maxPrice" class="group-select" aria-label="Max price">
          <option value="">Any</option>
          <option v-for="price in PRICE_OPTIONS" :key="price" :value="price">{{ formatPrice(price) }}</option>
        </select>
      </FilterGroup>

      <FilterGroup title="Bedrooms" :active="Boolean(filters.minBeds)">
        <select v-model="filters.minBeds" class="group-select" aria-label="Bedrooms">
          <option value="">Any</option>
          <option v-for="beds in BED_OPTIONS" :key="beds" :value="beds">{{ beds }}+</option>
        </select>
      </FilterGroup>
    </aside>

    <div class="list-main">
      <!-- Heading and stocklist sit above the table, so the filter column runs from the top of the page. -->
      <div class="page-top">
        <div class="heading">
          <h1 class="page">Properties</h1>
          <p class="sub">
            Verified house &amp; land stock from across Australia.
            <span class="result-count">({{ visibleProperties.length }} results)</span>
          </p>
        </div>
        <div class="top-actions">
          <!-- Disabled buttons get no hover events, so the tooltip hangs off a wrapper. -->
          <span v-if="stocklistLocked" class="locked-action" tabindex="0" aria-describedby="stocklist-tip">
            <BaseButton icon="lock" disabled>Stocklist</BaseButton>
            <span id="stocklist-tip" class="locked-tip" role="tooltip">Only available on the Pro plan</span>
          </span>
          <BaseButton v-else icon="download" @click="exportStocklist">Stocklist</BaseButton>
        </div>
      </div>

      <PaywallBanner v-if="pricesLocked" :message="paywallMessage" />

      <div class="card">
        <PropertyTable
          :properties="pagedRows"
          :start-index="firstRowIndex"
          :unlocked-count="unlockedCount"
          :hide-prices="pricesLocked"
          :sort-arrow="sortArrow"
          @sort="sortBy"
        />
        <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="sortedRows.length" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-layout {
  display: grid;
  grid-template-columns: 270px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

/* Stays in view while the table scrolls; scrolls itself when taller than the screen. */
.filter-side {
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 32px);
  overflow-y: auto;
  padding: 16px 18px 6px;
}

.quick-search {
  position: relative;
  margin-bottom: 4px;
}

.quick-search svg {
  position: absolute;
  left: 12px;
  top: 50%;
  width: 17px;
  height: 17px;
  transform: translateY(-50%);
  fill: none;
  stroke: var(--gold);
  stroke-width: 2;
  stroke-linecap: round;
  pointer-events: none;
}

.quick-search input,
.group-search,
.group-select {
  width: 100%;
  height: 40px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  font-size: 13.5px;
}

.quick-search input {
  padding: 0 12px 0 38px;
}

.group-search {
  margin-bottom: 6px;
  padding: 0 12px;
}

.group-select {
  padding: 0 10px;
}

.quick-search input:focus,
.group-search:focus,
.group-select:focus {
  outline: none;
  border-color: var(--gold);
  box-shadow: 0 0 0 3px var(--gold-l);
}

.filter-side :deep(.filter-group:last-child) {
  border-bottom: 0;
}

.locked-action {
  position: relative;
  display: inline-flex;
  border-radius: 8px;
}

.locked-action:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px var(--gold-l);
}

.locked-tip {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 50;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--ink);
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transform: translateY(-2px);
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}

.locked-action:hover .locked-tip,
.locked-action:focus-visible .locked-tip {
  opacity: 1;
  transform: none;
}

.refine-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.refine-head h2 {
  font-size: 18px;
}

.result-count {
  color: var(--ink2);
  font-weight: 500;
  font-style: italic;
}

@media (max-width: 900px) {
  .list-layout {
    grid-template-columns: 1fr;
  }

  .filter-side {
    position: static;
    max-height: none;
  }
}
</style>
