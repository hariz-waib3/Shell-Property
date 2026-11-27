<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import PaywallBanner from '@/components/common/PaywallBanner.vue'
import SearchDropdown from '@/components/common/SearchDropdown.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import PropertyTable from '@/components/property/PropertyTable.vue'
import FilterGroup from '../components/FilterGroup.vue'
import { LIST_FILTERS, usePropertyFilters } from '../composables/usePropertyFilters'
import { CONTRACT_TYPES, PROPERTY_STATUSES, PROPERTY_TYPES, STATES } from '@/data/constants'
import { useTableControls } from '@/composables/useTableControls'
import { PROPERTY_SORT } from '@/utils/propertySort'
import { db } from '@/stores/db'
import { isLocked } from '@/stores/session'
import { toast } from '@/stores/ui'
import { formatPrice } from '@/utils/format'

// Filters always open in a column on the left (accordion groups); search is the lens icon above the table; the table and paging on the right.
const { filters, activeProperties, visibleProperties, activeFilterCount, clearFilters } = usePropertyFilters()

const { sortBy, sortArrow, sortedRows, page, pageSize, pagedRows } = useTableControls(visibleProperties, {
  ...PROPERTY_SORT,
  resetOn: () => filters,
})

const PRICE_OPTIONS = [400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1200000]
const BED_OPTIONS = [2, 3, 4, 5]

/* ---------- Sidebar options, with how many listings each one has ---------- */

// How many of `properties` have each value of a checkbox filter (a property can count for several categories).
function countValues(key, properties = activeProperties.value) {
  const counts = {}
  properties.forEach((property) => {
    ;[LIST_FILTERS[key](property)].flat().forEach((value) => {
      if (value) counts[value] = (counts[value] || 0) + 1
    })
  })
  return counts
}

// Only values that have listings, so no option leads to an empty table.
// `order` fixes the order (e.g. states); otherwise the most common values come first.
function optionsFor(key, order = null) {
  const counts = countValues(key)
  const values = order
    ? order.filter((value) => counts[value])
    : Object.keys(counts).sort((a, b) => counts[b] - counts[a])
  return values.map((value) => ({ value, label: value, meta: counts[value] }))
}

const stateOptions = computed(() => optionsFor('states', STATES))
const typeOptions = computed(() => optionsFor('types', PROPERTY_TYPES))
const categoryOptions = computed(() => optionsFor('categories', ['Exclusive', 'New']))
const contractOptions = computed(() => optionsFor('contracts', CONTRACT_TYPES))
const incentiveOptions = computed(() => optionsFor('incentives'))
const storeyOptions = computed(() => optionsFor('storeys', ['Single', 'Double']))
const titleOptions = computed(() => optionsFor('titleStatuses', ['Titled', 'Untitled']))
const statusOptions = computed(() => optionsFor('statuses', PROPERTY_STATUSES))

// Regions follow the picked states, suburbs follow the picked states and regions.
// Ticked values always stay in the list so they can be unticked. Shown A–Z with "STATE · count".
const regionQuery = ref('')
const suburbQuery = ref('')

function placeOptions(key, query, narrowBy) {
  const pool = activeProperties.value.filter((property) => narrowBy.every((by) => matchesPicked(by, property)))
  const counts = countValues(key, pool)
  const stateOf = Object.fromEntries(pool.map((property) => [LIST_FILTERS[key](property), property.state]))
  const text = query.trim().toLowerCase()
  const picked = filters[key].filter((value) => !(value in counts))
  return [...Object.keys(counts), ...picked]
    .filter((value) => filters[key].includes(value) || value.toLowerCase().includes(text))
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({ value, label: value, meta: counts[value] ? `${stateOf[value]} · ${counts[value]}` : '' }))
}

function matchesPicked(key, property) {
  return filters[key].length === 0 || filters[key].includes(LIST_FILTERS[key](property))
}

const regionOptions = computed(() => placeOptions('regions', regionQuery.value, ['states']))
const suburbOptions = computed(() => placeOptions('suburbs', suburbQuery.value, ['states', 'regions']))

/* ---------- Sidebar scrolls on its own ---------- */

// The sidebar sticks below the (sticky) site header and scrolls by itself. Its height is what is left of the
// window below its top edge, so the last filters are never cut off, also before the page is scrolled.
const sidebarEl = ref(null)
const sidebarStyle = ref({})

function fitSidebar() {
  const headerHeight = document.querySelector('header.top')?.offsetHeight || 0
  const top = Math.max(sidebarEl.value.getBoundingClientRect().top, headerHeight + 16)
  sidebarStyle.value = { top: `${headerHeight + 16}px`, maxHeight: `${window.innerHeight - top - 16}px` }
}

onMounted(() => {
  fitSidebar()
  window.addEventListener('scroll', fitSidebar, { passive: true })
  window.addEventListener('resize', fitSidebar)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', fitSidebar)
  window.removeEventListener('resize', fitSidebar)
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
    <aside ref="sidebarEl" class="filter-side" :style="sidebarStyle" aria-label="Filters">
      <div class="refine-head">
        <h2>Refine by</h2>
        <button type="button" class="clear-link" :disabled="activeFilterCount === 0" @click="clearFilters">
          Clear all
        </button>
      </div>

      <FilterGroup v-model="filters.states" title="State" :options="stateOptions" start-open />

      <FilterGroup v-model="filters.regions" title="Region" :options="regionOptions">
        <input
          v-model="regionQuery"
          class="group-search"
          type="search"
          placeholder="Filter region…"
          aria-label="Filter region"
        />
      </FilterGroup>

      <FilterGroup v-model="filters.suburbs" title="Suburb" :options="suburbOptions">
        <input
          v-model="suburbQuery"
          class="group-search"
          type="search"
          placeholder="Filter suburb…"
          aria-label="Filter suburb"
        />
      </FilterGroup>

      <FilterGroup title="Price" :active="Boolean(filters.minPrice || filters.maxPrice)">
        <div class="price-range">
          <select v-model="filters.minPrice" class="group-select" aria-label="Minimum price">
            <option value="">Min: any</option>
            <option v-for="price in PRICE_OPTIONS" :key="price" :value="price">{{ formatPrice(price) }}</option>
          </select>
          <select v-model="filters.maxPrice" class="group-select" aria-label="Maximum price">
            <option value="">Max: any</option>
            <option v-for="price in PRICE_OPTIONS" :key="price" :value="price">{{ formatPrice(price) }}</option>
          </select>
        </div>
      </FilterGroup>

      <FilterGroup v-model="filters.types" title="Property type" :options="typeOptions" />

      <FilterGroup v-model="filters.categories" title="Category" :options="categoryOptions" />

      <FilterGroup v-model="filters.contracts" title="Contract type" :options="contractOptions" />

      <FilterGroup title="Bedrooms" :active="Boolean(filters.minBeds)">
        <select v-model="filters.minBeds" class="group-select" aria-label="Bedrooms">
          <option value="">Any</option>
          <option v-for="beds in BED_OPTIONS" :key="beds" :value="beds">{{ beds }}+</option>
        </select>
      </FilterGroup>

      <FilterGroup v-model="filters.incentives" title="Incentives" :options="incentiveOptions" />

      <FilterGroup v-model="filters.storeys" title="Storeys" :options="storeyOptions" />

      <FilterGroup v-model="filters.titleStatuses" title="Title status" :options="titleOptions" />

      <FilterGroup v-model="filters.statuses" title="Status" :options="statusOptions" />
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
          <SearchDropdown
            v-model="filters.query"
            :result-count="visibleProperties.length"
            placeholder="Search properties…"
            hint="Search by suburb, region, estate or lot number."
          />
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

/* No card: the filters sit straight on the page background. Top and max-height are set in fitSidebar(). */
.filter-side {
  position: sticky;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 4px 10px 0 0;
  scrollbar-width: thin;
}

.group-search,
.group-select {
  width: 100%;
  height: 40px;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: #fff;
  font-size: 13.5px;
}

.group-search {
  margin-bottom: 6px;
  padding: 0 12px;
}

.group-select {
  padding: 0 10px;
}

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

.price-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
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
    max-height: none !important;
    overflow: visible;
  }
}
</style>
