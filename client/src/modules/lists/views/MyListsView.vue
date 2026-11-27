<script setup>
import { computed, ref } from 'vue'
import BaseButton from '@/components/common/BaseButton.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import SearchDropdown from '@/components/common/SearchDropdown.vue'
import TablePagination from '@/components/common/TablePagination.vue'
import PropertyTable from '@/components/property/PropertyTable.vue'
import { useTableControls } from '@/composables/useTableControls'
import { db } from '@/stores/db'
import { isLocked } from '@/stores/session'
import { PROPERTY_SORT } from '@/utils/propertySort'

// Same format as the Properties list, for the properties this partner has saved.
// Clicking the gold star on a row removes it from the list (after a confirmation).
const query = ref('')

// Disabled properties drop out of My Lists while disabled, and come back if enabled again.
const savedProperties = computed(() => db.properties.filter((p) => p.active && db.myListIds.includes(p.id)))

const visibleProperties = computed(() => {
  const search = query.value.trim().toLowerCase()
  if (!search) return savedProperties.value
  return savedProperties.value.filter((p) =>
    `${p.suburb} ${p.estate} ${p.lot} ${p.state}`.toLowerCase().includes(search),
  )
})

const { sortBy, sortArrow, sortedRows, page, pageSize, pagedRows } = useTableControls(visibleProperties, {
  ...PROPERTY_SORT,
  resetOn: () => query.value,
})
</script>

<template>
  <!-- Heading on the left; search and browse on the right. -->
  <div class="page-top">
    <div class="heading">
      <h1 class="page">My Lists</h1>
      <p class="sub">Shortlist properties to share with buyers.</p>
    </div>

    <div class="top-actions">
      <SearchDropdown
        v-model="query"
        :result-count="visibleProperties.length"
        placeholder="Search saved properties…"
        hint="Search by suburb, estate or lot number."
      />
      <BaseButton variant="dark" :to="{ name: 'properties' }">Browse properties</BaseButton>
    </div>
  </div>

  <div v-if="savedProperties.length > 0" class="card">
    <PropertyTable
      :properties="pagedRows"
      :start-index="(page - 1) * pageSize"
      :hide-prices="isLocked('prices')"
      :sort-arrow="sortArrow"
      confirm-unsave
      from="my-lists"
      @sort="sortBy"
    />
    <TablePagination v-model:page="page" v-model:page-size="pageSize" :total="sortedRows.length" />
  </div>

  <EmptyState v-else class="card" title="Nothing here yet" message="Save a property from its page to start a list.">
    <BaseButton variant="dark" :to="{ name: 'properties' }">Browse properties</BaseButton>
  </EmptyState>
</template>
