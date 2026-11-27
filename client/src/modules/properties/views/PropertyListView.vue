<script setup>
import { computed } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import FilterButton from '@/components/common/FilterButton.vue'
import MultiSelect from '@/components/common/MultiSelect.vue'
import PaywallBanner from '@/components/common/PaywallBanner.vue'
import SearchDropdown from '@/components/common/SearchDropdown.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import PropertyTable from '@/components/property/PropertyTable.vue'
import { usePropertyFilters } from '../composables/usePropertyFilters'
import { PROPERTY_STATUSES } from '@/data/constants'
import { useTableControls } from '@/composables/useTableControls'
import { PROPERTY_SORT } from '@/utils/propertySort'
import { PROPERTY_TYPES, STATES } from '@/data/constants'
import { db } from '@/stores/db'
import { isLocked } from '@/stores/session'
import { openCheckout, toast } from '@/stores/ui'
import { formatPrice } from '@/utils/format'

// Same layout as the admin Properties list: heading + search / filters on top, full-width table, paging.
const { filters, showFilterPanel, visibleProperties, activeFilterCount, clearFilters } = usePropertyFilters()

const { sortBy, sortArrow, sortedRows, page, pageSize, pagedRows } = useTableControls(visibleProperties, {
  ...PROPERTY_SORT,
  resetOn: () => filters,
})

const PRICE_OPTIONS = [600000, 750000, 900000, 1200000]
const BED_OPTIONS = [2, 3, 4, 5]

/* ---------- Free plan limits ---------- */

const pricesLocked = computed(() => isLocked('prices'))
const unlockedCount = computed(() => (pricesLocked.value ? db.gates.freeRows : Infinity))
const firstRowIndex = computed(() => (page.value - 1) * pageSize.value)

const paywallMessage = computed(
  () =>
    `Free accounts see ${db.gates.freeRows} listings with prices hidden. ` +
    'Subscribe for full stock, prices, brochures and EOIs.',
)

function exportStocklist() {
  if (isLocked('brochure')) {
    openCheckout()
    return
  }
  toast('Stocklist exported (demo)')
}
</script>

<template>
  <!-- Heading on the left; search, filters and stocklist on the right. -->
  <div class="page-top">
    <div class="heading">
      <h1 class="page">Properties</h1>
      <p class="sub">Verified house &amp; land stock from across Australia.</p>
    </div>

    <div class="top-actions">
      <SearchDropdown
        v-model="filters.query"
        :result-count="visibleProperties.length"
        placeholder="Search properties…"
        hint="Search by suburb, estate or lot number."
      />
      <FilterButton v-model:open="showFilterPanel" :count="activeFilterCount" />
      <BaseButton icon="download" @click="exportStocklist">Stocklist</BaseButton>
    </div>
  </div>

  <!-- Full-width filter panel. Stays open until the filter icon is clicked again. -->
  <div v-if="showFilterPanel" class="card pad filter-panel">
    <div class="filter-grid">
      <div class="field">
        <label for="filter-state">State</label>
        <MultiSelect id="filter-state" v-model="filters.states" :options="STATES" placeholder="All states" />
      </div>
      <div class="field">
        <label for="filter-type">Property type</label>
        <MultiSelect id="filter-type" v-model="filters.types" :options="PROPERTY_TYPES" placeholder="All types" />
      </div>
      <div class="field">
        <label for="filter-status">Status</label>
        <MultiSelect
          id="filter-status"
          v-model="filters.statuses"
          :options="PROPERTY_STATUSES"
          placeholder="All statuses"
        />
      </div>
      <div class="field">
        <label for="filter-price">Max price</label>
        <select id="filter-price" v-model="filters.maxPrice">
          <option value="">Any</option>
          <option v-for="price in PRICE_OPTIONS" :key="price" :value="price">{{ formatPrice(price) }}</option>
        </select>
      </div>
      <div class="field">
        <label for="filter-beds">Bedrooms</label>
        <select id="filter-beds" v-model="filters.minBeds">
          <option value="">Any</option>
          <option v-for="beds in BED_OPTIONS" :key="beds" :value="beds">{{ beds }}+</option>
        </select>
      </div>
    </div>
    <div class="filter-panel-footer">
      <span class="muted">{{ visibleProperties.length }} properties match</span>
      <button type="button" class="clear-link" :disabled="activeFilterCount === 0" @click="clearFilters">
        Clear filters
      </button>
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
</template>
