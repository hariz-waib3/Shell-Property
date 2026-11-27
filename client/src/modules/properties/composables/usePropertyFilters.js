import { computed, reactive, ref } from 'vue'
import { db } from '@/stores/db'
import { packagePrice } from '@/utils/format'

function getEmptyFilters() {
  return { query: '', states: [], types: [], statuses: [], maxPrice: '', minBeds: '' }
}

// Created once, outside the function, so the filters are kept when you open a property and come back.
const filters = reactive(getEmptyFilters())
const showFilterPanel = ref(false)

function matchesFilters(property) {
  if (filters.states.length > 0 && !filters.states.includes(property.state)) return false
  if (filters.types.length > 0 && !filters.types.includes(property.type)) return false
  if (filters.statuses.length > 0 && !filters.statuses.includes(property.status)) return false
  if (filters.maxPrice && packagePrice(property) > Number(filters.maxPrice)) return false

  // Beds can be text such as "4 + Study" or "2+1", so parseInt reads the first number.
  if (filters.minBeds && parseInt(property.beds) < Number(filters.minBeds)) return false

  if (filters.query) {
    const searchText = `${property.suburb} ${property.estate} ${property.lot} ${property.state}`.toLowerCase()
    if (!searchText.includes(filters.query.trim().toLowerCase())) return false
  }

  return true
}

export function usePropertyFilters() {
  const visibleProperties = computed(() =>
    // Disabled properties are admin-only.
    db.properties.filter((property) => property.active).filter(matchesFilters),
  )

  // Number of filters in use (shown as a badge on the filter icon).
  const activeFilterCount = computed(
    () =>
      [
        filters.states.length > 0,
        filters.types.length > 0,
        filters.statuses.length > 0,
        Boolean(filters.maxPrice),
        Boolean(filters.minBeds),
      ].filter(Boolean).length,
  )

  // Keeps the search text; only the filter panel is cleared.
  function clearFilters() {
    Object.assign(filters, { ...getEmptyFilters(), query: filters.query })
  }

  return { filters, showFilterPanel, visibleProperties, activeFilterCount, clearFilters }
}
