import { computed, reactive } from 'vue'
import { db } from '@/stores/db'
import { packagePrice } from '@/utils/format'

// Checkbox filters: filter key -> how to read that value from a property.
// A property matches a checkbox filter when its value is one of the ticked ones (nothing ticked = all).
export const LIST_FILTERS = {
  states: (property) => property.state,
  regions: (property) => property.region,
  suburbs: (property) => property.suburb,
  types: (property) => property.type,
  categories: (property) => property.tags,
  contracts: (property) => property.contract,
  incentives: (property) => property.incentive,
  storeys: (property) => property.storeys,
  titleStatuses: (property) => (property.titled ? 'Titled' : 'Untitled'),
  statuses: (property) => property.status,
}

function getEmptyFilters() {
  const lists = Object.fromEntries(Object.keys(LIST_FILTERS).map((key) => [key, []]))
  return { query: '', ...lists, minPrice: '', maxPrice: '', minBeds: '' }
}

// Created once, outside the function, so the filters are kept when you open a property and come back.
const filters = reactive(getEmptyFilters())

function matchesList(key, property) {
  const picked = filters[key]
  if (picked.length === 0) return true
  const value = LIST_FILTERS[key](property)
  return Array.isArray(value) ? value.some((item) => picked.includes(item)) : picked.includes(value)
}

function matchesFilters(property) {
  if (!Object.keys(LIST_FILTERS).every((key) => matchesList(key, property))) return false
  if (filters.minPrice && packagePrice(property) < Number(filters.minPrice)) return false
  if (filters.maxPrice && packagePrice(property) > Number(filters.maxPrice)) return false

  // Beds can be text such as "4 + Study" or "2+1", so parseInt reads the first number.
  if (filters.minBeds && parseInt(property.beds) < Number(filters.minBeds)) return false

  if (filters.query) {
    const searchText =
      `${property.suburb} ${property.region} ${property.estate} ${property.lot} ${property.state}`.toLowerCase()
    if (!searchText.includes(filters.query.trim().toLowerCase())) return false
  }

  return true
}

export function usePropertyFilters() {
  // Disabled properties are admin-only.
  const activeProperties = computed(() => db.properties.filter((property) => property.active))

  const visibleProperties = computed(() => activeProperties.value.filter(matchesFilters))

  // Number of filters in use (enables "Clear all").
  const activeFilterCount = computed(
    () =>
      Object.keys(LIST_FILTERS).filter((key) => filters[key].length > 0).length +
      [filters.minPrice, filters.maxPrice, filters.minBeds].filter(Boolean).length,
  )

  // Keeps the search text; only the sidebar filters are cleared.
  function clearFilters() {
    Object.assign(filters, { ...getEmptyFilters(), query: filters.query })
  }

  return { filters, activeProperties, visibleProperties, activeFilterCount, clearFilters }
}
